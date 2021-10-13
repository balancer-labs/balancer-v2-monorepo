import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import Token from '@balancer-labs/v2-helpers/src/models/tokens/Token';
import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';

import { bn, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';

import { deploy } from '@balancer-labs/v2-helpers/src/contract';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { expectBalanceChange } from '@balancer-labs/v2-helpers/src/test/tokenBalance';
import * as expectEvent from '@balancer-labs/v2-helpers/src/test/expectEvent';
import { signPermit, WeightedPoolEncoder } from '@balancer-labs/balancer-js';
import { advanceTime } from '@balancer-labs/v2-helpers/src/time';

import {
  setup,
  tokenInitialBalance,
  rewardTokenInitialBalance,
  rewardsDuration,
  rewardsVestingTime,
} from './MultiRewardsSharedSetup';

describe('Staking contract', () => {
  let admin: SignerWithAddress, lp: SignerWithAddress, other: SignerWithAddress, rewarder: SignerWithAddress;

  let rewardTokens: TokenList;
  let authorizer: Contract, vault: Contract, stakingContract: Contract, pool: Contract;
  let rewardToken: Token;

  before('deploy base contracts', async () => {
    [other] = await ethers.getSigners();
  });

  sharedBeforeEach('set up asset manager', async () => {
    const { contracts, users } = await setup();

    authorizer = contracts.authorizer;
    pool = contracts.pool;
    vault = contracts.vault;
    stakingContract = contracts.stakingContract;
    rewardToken = contracts.rewardTokens.DAI;
    rewardTokens = contracts.rewardTokens;

    lp = users.lp;
    admin = users.admin;
    rewarder = users.rewarder;
  });

  describe('authorizer', () => {
    it('uses the authorizer of the vault', async () => {
      expect(await stakingContract.getAuthorizer()).to.equal(authorizer.address);
    });

    it('tracks authorizer changes in the vault', async () => {
      const action = await actionId(vault, 'setAuthorizer');
      await authorizer.connect(admin).grantRole(action, admin.address);

      await vault.connect(admin).setAuthorizer(other.address);

      expect(await stakingContract.getAuthorizer()).to.equal(other.address);
    });
  });

  describe('addReward', () => {
    context('when the sender has permissions', () => {
      it('sets up a reward for an asset manager', async () => {
        await stakingContract.connect(admin).addReward(pool.address, rewardToken.address, rewardsDuration);
      });
    });

    context('when the sender does not have permissions', () => {
      it('reverts', async () => {
        const tx = stakingContract.connect(rewarder).addReward(pool.address, rewardToken.address, rewardsDuration);
        await expect(tx).to.be.revertedWith("Only accessible by governance, pool or it's asset managers");
      });
    });
  });

  describe('setRewardsDuration', () => {
    context('when the sender has permissions', () => {
      context('when the reward was already added', () => {
        // TODO: implement
      });

      context('when the reward was not added', () => {
        it('reverts', async () => {
          const tx = stakingContract.connect(admin).setRewardsDuration(pool.address, rewardToken.address, fp(1000));
          await expect(tx).to.be.revertedWith('Reward must be configured with addReward');
        });
      });
    });

    context('when the sender does not have permissions', () => {
      it('reverts', async () => {
        const tx = stakingContract.connect(rewarder).setRewardsDuration(pool.address, rewardToken.address, fp(1000));
        await expect(tx).to.be.revertedWith("Only accessible by governance, pool or it's asset managers");
      });
    });
  });

  describe('notifyRewardAmount', () => {
    context('when the reward was already added', () => {
      // TODO: implement
    });

    context('when the reward was not added', () => {
      it('reverts', async () => {
        const tx = stakingContract.notifyRewardAmount(pool.address, rewardToken.address, fp(100));
        await expect(tx).to.be.revertedWith('Reward must be configured with addReward');
      });
    });
  });

  describe('stakeWithPermit', () => {
    sharedBeforeEach(async () => {
      await stakingContract.connect(admin).addReward(pool.address, rewardToken.address, rewardsDuration);
    });

    it('stakes with a permit signature', async () => {
      const bptBalance = await pool.balanceOf(lp.address);

      const { v, r, s } = await signPermit(pool, lp, stakingContract, bptBalance);
      await stakingContract
        .connect(other)
        .stakeWithPermit(pool.address, bptBalance, MAX_UINT256, lp.address, lp.address, v, r, s);

      const stakedBalance = await stakingContract.balanceOf(pool.address, lp.address);
      expect(stakedBalance).to.be.eq(bptBalance);
    });

    it('reverts when the recipient is not the lp', async () => {
      const bptBalance = await pool.balanceOf(lp.address);

      const { v, r, s } = await signPermit(pool, lp, stakingContract, bptBalance);
      const errMsg = 'The recipient must match the account in the permit signature';
      await expect(
        stakingContract
          .connect(other)
          .stakeWithPermit(pool.address, bptBalance, MAX_UINT256, lp.address, other.address, v, r, s)
      ).to.be.revertedWith(errMsg);
    });
  });

  describe('stake', () => {
    context('with two stakes', () => {
      const rewardAmount = fp(1);

      sharedBeforeEach('add reward', async () => {
        await stakingContract.connect(admin).addReward(pool.address, rewardToken.address, rewardsDuration);

        const bptBalance = await pool.balanceOf(lp.address);

        await pool.connect(lp).approve(stakingContract.address, bptBalance);

        // Stake 3/4 of the bpt to the LP and 1/4 to another address
        await stakingContract.connect(lp).stake(pool.address, bptBalance.mul(3).div(4));
        const args = [pool.address, bptBalance.div(4), other.address];
        await stakingContract.connect(lp).stakeFor(...args);
      });

      sharedBeforeEach('allow reward tokens from rewarder', async () => {
        await rewardTokens.approve({ to: stakingContract.address, from: [rewarder] });
      });

      it('sends expected amount of reward token to the rewards contract', async () => {
        await expectBalanceChange(
          () => stakingContract.connect(rewarder).notifyRewardAmount(pool.address, rewardToken.address, rewardAmount),
          rewardTokens,
          [{ account: stakingContract, changes: { DAI: rewardAmount } }],
          vault
        );
      });

      it('emits RewardAdded when an allocation is stored', async () => {
        const tx = await stakingContract
          .connect(rewarder)
          .notifyRewardAmount(pool.address, rewardToken.address, rewardAmount);

        expectEvent.inReceipt(await tx.wait(), 'RewardAdded', {
          token: rewardToken.address,
          pool: pool.address,
          amount: rewardAmount,
          rewarder: rewarder.address,
        });
      });

      describe('when the rewarder has called notifyRewardAmount', () => {
        sharedBeforeEach(async () => {
          await stakingContract.connect(rewarder).notifyRewardAmount(pool.address, rewardToken.address, rewardAmount);
        });

        describe('and enough time has passed for all the reward to vest', async () => {
          sharedBeforeEach(async () => {
            await advanceTime(rewardsVestingTime);
          });

          it('distributes the reward according to the fraction of staked LP tokens', async () => {
            // 3/4 share
            const expectedReward = fp(0.75);
            const actualReward = await stakingContract.totalEarned(pool.address, lp.address, rewardToken.address);

            expect(actualReward).to.be.equalWithError(expectedReward, 0.0001);

            // 1/4 share
            const expectedRewardOther = fp(0.25);
            const actualRewardOther = await stakingContract.totalEarned(
              pool.address,
              other.address,
              rewardToken.address
            );

            expect(actualRewardOther).to.be.equalWithError(expectedRewardOther, 0.0001);
          });

          it('allows a user to claim the reward to an EOA', async () => {
            const expectedReward = fp(0.75);

            await expectBalanceChange(() => stakingContract.connect(lp).getReward([pool.address]), rewardTokens, [
              { account: lp, changes: { DAI: ['very-near', expectedReward] } },
            ]);
          });

          it('allows a user to claim the reward to internal balance', async () => {
            const expectedReward = fp(0.75);

            await expectBalanceChange(
              () => stakingContract.connect(lp).getRewardAsInternalBalance([pool.address]),
              rewardTokens,
              [{ account: lp, changes: { DAI: ['very-near', expectedReward] } }],
              vault
            );
          });

          it('emits RewardPaid when an allocation is claimed', async () => {
            const expectedReward = bn('749999999999999623');

            const tx = await stakingContract.connect(lp).getReward([pool.address]);

            expectEvent.inReceipt(await tx.wait(), 'RewardPaid', {
              user: lp.address,
              rewardToken: rewardToken.address,
              amount: expectedReward,
            });
          });

          describe('with a second distribution from the same rewarder', () => {
            const secondRewardAmount = fp(2);

            sharedBeforeEach(async () => {
              await stakingContract
                .connect(rewarder)
                .notifyRewardAmount(pool.address, rewardToken.address, secondRewardAmount);
              // total reward = fp(3)
              await advanceTime(rewardsVestingTime);
            });

            it('calculates totalEarned from both distributions', async () => {
              const expectedReward = rewardAmount.add(secondRewardAmount).mul(3).div(4);

              const actualReward = await stakingContract.totalEarned(pool.address, lp.address, rewardToken.address);
              expect(actualReward).to.be.equalWithError(expectedReward, 0.0001);
            });
          });

          describe('with a second distributions from another rewarder', () => {
            const secondRewardAmount = fp(2);

            sharedBeforeEach(async () => {
              await rewardTokens.mint({ to: other, amount: rewardTokenInitialBalance });
              await rewardTokens.approve({ to: stakingContract.address, from: [other] });

              await stakingContract
                .connect(other)
                .notifyRewardAmount(pool.address, rewardToken.address, secondRewardAmount);
              await advanceTime(rewardsVestingTime);
            });

            it('calculates totalEarned from both distributions', async () => {
              const expectedReward = fp(0.75).mul(3);

              const actualReward = await stakingContract.totalEarned(pool.address, lp.address, rewardToken.address);
              expect(actualReward).to.be.equalWithError(expectedReward, 0.0001);
            });

            it('calculates totalEarned from both distributions for the other user', async () => {
              const expectedReward = fp(0.25).mul(3);

              const actualReward = await stakingContract.totalEarned(pool.address, other.address, rewardToken.address);
              expect(actualReward).to.be.equalWithError(expectedReward, 0.0001);
            });
          });
        });

        describe('with a second distribution from the same rewarder (before the first is finished vesting', () => {
          const secondRewardAmount = fp(2);
          let leftoverBalance: BigNumber;

          sharedBeforeEach(async () => {
            // advance half the time
            await advanceTime(rewardsDuration / 2);

            // claim rewards
            await stakingContract.connect(lp).getReward([pool.address]);
            const claimedBalance: BigNumber = await rewardToken.balanceOf(lp.address);
            leftoverBalance = rewardAmount.sub(claimedBalance);

            await stakingContract
              .connect(rewarder)
              .notifyRewardAmount(pool.address, rewardToken.address, secondRewardAmount);
            await advanceTime(rewardsVestingTime);
          });

          it('adds leftover correctly', async () => {
            const expectedReward = leftoverBalance.add(secondRewardAmount).mul(3).div(4);

            const actualReward = await stakingContract.totalEarned(pool.address, lp.address, rewardToken.address);
            expect(actualReward).to.be.equalWithError(expectedReward, 0.05);
          });
        });
      });
    });

    context('with two pools', async () => {
      let pool2: Contract;

      const rewardAmount = fp(1);

      sharedBeforeEach('deploy another pool', async () => {
        await stakingContract.connect(admin).addReward(pool.address, rewardToken.address, rewardsDuration);

        const poolTokens = await TokenList.create(['BAT', 'SNX'], { sorted: true });
        const assetManagers = Array(poolTokens.length).fill(rewarder.address);

        pool2 = await deploy('v2-pool-weighted/WeightedPool', {
          args: [
            vault.address,
            'Test Pool2',
            'TEST2',
            poolTokens.addresses,
            [fp(0.5), fp(0.5)],
            assetManagers,
            fp(0.0001),
            0,
            0,
            admin.address,
          ],
        });
        const poolId = await pool2.getPoolId();

        await stakingContract.connect(admin).addReward(pool2.address, rewardToken.address, rewardsDuration);

        await poolTokens.mint({ to: lp, amount: tokenInitialBalance });
        await poolTokens.approve({ to: vault.address, from: [lp] });

        await rewardTokens.mint({ to: rewarder, amount: rewardTokenInitialBalance });
        await rewardTokens.approve({ to: stakingContract.address, from: [rewarder] });

        const assets = poolTokens.addresses;

        await vault.connect(lp).joinPool(poolId, lp.address, lp.address, {
          assets,
          maxAmountsIn: Array(assets.length).fill(MAX_UINT256),
          fromInternalBalance: false,
          userData: WeightedPoolEncoder.joinInit(Array(assets.length).fill(tokenInitialBalance)),
        });

        const bptBalance = await pool2.balanceOf(lp.address);
        await pool.connect(lp).approve(stakingContract.address, bptBalance);
        await stakingContract.connect(lp).stake(pool.address, bptBalance);

        const bptBalance2 = await pool2.balanceOf(lp.address);
        await pool2.connect(lp).approve(stakingContract.address, bptBalance2);
        await stakingContract.connect(lp).stake(pool2.address, bptBalance2);
      });

      it('allows you to claim across multiple pools', async () => {
        await stakingContract.connect(rewarder).notifyRewardAmount(pool.address, rewardToken.address, rewardAmount);
        const rewardAmount2 = fp(0.75);
        await stakingContract.connect(rewarder).notifyRewardAmount(pool2.address, rewardToken.address, rewardAmount2);

        await advanceTime(rewardsVestingTime);

        const expectedReward = fp(1.75);

        await expectBalanceChange(
          () => stakingContract.connect(lp).getReward([pool.address, pool2.address]),
          rewardTokens,
          [{ account: lp, changes: { DAI: ['very-near', expectedReward] } }]
        );
      });

      it.skip('emits RewardPaid for each pool', async () => {
        await stakingContract.connect(rewarder).notifyRewardAmount(pool.address, rewardToken.address, rewardAmount);
        const rewardAmount2 = fp(0.75);
        await stakingContract.connect(rewarder).notifyRewardAmount(pool2.address, rewardToken.address, rewardAmount2);
        await advanceTime(rewardsVestingTime);

        const receipt = await (await stakingContract.connect(lp).getReward([pool.address])).wait();

        const user = lp.address;

        // TODO detect duplicate event, or consolidate events
        const expectedReward = bn('999999999999999898');
        expectEvent.inReceipt(receipt, 'RewardPaid', {
          user,
          rewardToken: rewardToken.address,
          amount: expectedReward,
        });

        const expectedReward2 = bn('749999999999999923');
        expectEvent.inReceipt(receipt, 'RewardPaid', {
          user,
          rewardToken: rewardToken.address,
          amount: expectedReward2,
        });
      });
    });
  });
});
