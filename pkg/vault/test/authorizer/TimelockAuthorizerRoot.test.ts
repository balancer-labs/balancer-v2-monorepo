import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import * as expectEvent from '@balancer-labs/v2-helpers/src/test/expectEvent';
import TimelockAuthorizer from '@balancer-labs/v2-helpers/src/models/authorizer/TimelockAuthorizer';
import { deploy } from '@balancer-labs/v2-helpers/src/contract';
import { BigNumberish } from '@balancer-labs/v2-helpers/src/numbers';
import { ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { advanceTime, currentTimestamp } from '@balancer-labs/v2-helpers/src/time';
import Vault from '@balancer-labs/v2-helpers/src/models/vault/Vault';
import { sharedBeforeEach } from '@balancer-labs/v2-common/sharedBeforeEach';

describe('TimelockAuthorizer root', () => {
  let authorizer: TimelockAuthorizer, vault: Contract;
  let root: SignerWithAddress,
    nextRoot: SignerWithAddress,
    granter: SignerWithAddress,
    canceler: SignerWithAddress,
    revoker: SignerWithAddress,
    other: SignerWithAddress,
    from: SignerWithAddress;

  before('setup signers', async () => {
    [, root, nextRoot, granter, canceler, revoker, other] = await ethers.getSigners();
  });

  sharedBeforeEach('deploy authorizer', async () => {
    let authorizerContract: Contract;

    ({ instance: vault, authorizer: authorizerContract } = await Vault.create({
      admin: root,
      nextAdmin: nextRoot.address,
    }));

    authorizer = new TimelockAuthorizer(authorizerContract, root);
  });

  describe('root', () => {
    describe('setPendingRoot', () => {
      let ROOT_CHANGE_DELAY: BigNumberish;

      beforeEach('fetch root change delay', async () => {
        ROOT_CHANGE_DELAY = await authorizer.instance.getRootTransferDelay();
      });

      it('sets the nextRoot as the pending root during construction', async () => {
        expect(await authorizer.instance.getPendingRoot()).to.equal(nextRoot.address);
      });

      context('when the sender is the root', async () => {
        context('when trying to execute it directly', async () => {
          it('reverts', async () => {
            await expect(authorizer.instance.setPendingRoot(granter.address)).to.be.revertedWith(
              'CAN_ONLY_BE_SCHEDULED'
            );
          });
        });

        context('when trying to schedule a call', async () => {
          let newPendingRoot: SignerWithAddress;

          function itSetsThePendingRootCorrectly() {
            it('schedules a root change', async () => {
              const expectedData = authorizer.instance.interface.encodeFunctionData('setPendingRoot', [
                newPendingRoot.address,
              ]);

              const id = await authorizer.scheduleRootChange(newPendingRoot, [], { from: root });

              const scheduledExecution = await authorizer.getScheduledExecution(id);
              expect(scheduledExecution.executed).to.be.false;
              expect(scheduledExecution.data).to.be.equal(expectedData);
              expect(scheduledExecution.where).to.be.equal(authorizer.address);
              expect(scheduledExecution.protected).to.be.false;
              expect(scheduledExecution.executableAt).to.be.at.almostEqual(
                (await currentTimestamp()).add(ROOT_CHANGE_DELAY)
              );
            });

            it('can be executed after the delay', async () => {
              const id = await authorizer.scheduleRootChange(newPendingRoot, [], { from: root });

              await expect(authorizer.execute(id)).to.be.revertedWith('ACTION_NOT_YET_EXECUTABLE');

              await advanceTime(ROOT_CHANGE_DELAY);
              await authorizer.execute(id);

              expect(await authorizer.isRoot(root)).to.be.true;
              expect(await authorizer.isPendingRoot(newPendingRoot)).to.be.true;
            });

            it('emits an event', async () => {
              const id = await authorizer.scheduleRootChange(newPendingRoot, [], { from: root });

              await advanceTime(ROOT_CHANGE_DELAY);
              const receipt = await authorizer.execute(id);
              expectEvent.inReceipt(await receipt.wait(), 'PendingRootSet', { pendingRoot: newPendingRoot.address });
            });
          }

          before('set desired pending root', () => {
            newPendingRoot = granter;
          });

          itSetsThePendingRootCorrectly();

          context('starting a new root transfer while pending root is set', () => {
            // We test this to ensure that executing an action which sets the pending root to an address which cannot
            // call `claimRoot` won't result in the Authorizer being unable to transfer root power to a different address.

            sharedBeforeEach('initiate a root transfer', async () => {
              const id = await authorizer.scheduleRootChange(granter, [], { from: root });
              await advanceTime(ROOT_CHANGE_DELAY);
              await authorizer.execute(id);
            });

            before('set desired pending root', () => {
              newPendingRoot = other;
            });

            itSetsThePendingRootCorrectly();
          });
        });
      });

      context('when the sender is not the root', async () => {
        it('reverts', async () => {
          await expect(authorizer.scheduleRootChange(granter, [], { from: granter })).to.be.revertedWith(
            'SENDER_IS_NOT_ROOT'
          );
        });
      });
    });

    describe('claimRoot', () => {
      let ROOT_CHANGE_DELAY: BigNumberish;

      beforeEach('fetch root change delay', async () => {
        ROOT_CHANGE_DELAY = await authorizer.instance.getRootTransferDelay();
      });

      sharedBeforeEach('initiate a root transfer', async () => {
        const id = await authorizer.scheduleRootChange(granter, [], { from: root });
        await advanceTime(ROOT_CHANGE_DELAY);
        await authorizer.execute(id);
      });

      context('when the sender is the pending root', async () => {
        it('transfers root powers from the current to the pending root', async () => {
          await authorizer.claimRoot({ from: granter });
          expect(await authorizer.isRoot(root)).to.be.false;
          expect(await authorizer.isRoot(granter)).to.be.true;
        });

        it('resets the pending root address to the zero address', async () => {
          await authorizer.claimRoot({ from: granter });
          expect(await authorizer.isPendingRoot(root)).to.be.false;
          expect(await authorizer.isPendingRoot(granter)).to.be.false;
          expect(await authorizer.isPendingRoot(ZERO_ADDRESS)).to.be.true;
        });

        it('emits an event', async () => {
          const receipt = await authorizer.claimRoot({ from: granter });
          expectEvent.inReceipt(await receipt.wait(), 'RootSet', { root: granter.address });
          expectEvent.inReceipt(await receipt.wait(), 'PendingRootSet', { pendingRoot: ZERO_ADDRESS });
        });
      });

      context('when the sender is not the pending root', async () => {
        it('reverts', async () => {
          await expect(authorizer.claimRoot({ from: other })).to.be.revertedWith('SENDER_IS_NOT_PENDING_ROOT');
        });
      });
    });
  });
});
