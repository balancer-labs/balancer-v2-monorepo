import { ethers } from 'hardhat';
import { BigNumber, Contract } from 'ethers';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import TokenList from '@balancer-labs/v2-helpers/src/models/tokens/TokenList';

import { bn, fp } from '@balancer-labs/v2-helpers/src/numbers';
import { MAX_INT256, MAX_UINT256 } from '@balancer-labs/v2-helpers/src/constants';

import { expectBalanceChange } from '@balancer-labs/v2-helpers/src/test/tokenBalance';
import * as expectEvent from '@balancer-labs/v2-helpers/src/test/expectEvent';
import { amount, setup, tokenInitialBalance } from '../helpers/setup';
import { calcRebalanceFee } from '../helpers/rebalanceFee';

describe('Rebalancing', function () {
  let tokens: TokenList, vault: Contract, assetManager: Contract;

  let lp: SignerWithAddress, other: SignerWithAddress;
  let poolId: string, swapPoolId: string;

  before('deploy base contracts', async () => {
    [, , lp, other] = await ethers.getSigners();
  });

  sharedBeforeEach('set up asset manager', async () => {
    const { data, contracts } = await setup();
    poolId = data.poolId;
    swapPoolId = data.swapPoolId;

    assetManager = contracts.assetManager;
    tokens = contracts.tokens;
    vault = contracts.vault;
  });

  describe('getRebalanceFee', () => {
    let poolController: SignerWithAddress; // TODO
    sharedBeforeEach(async () => {
      poolController = lp; // TODO
    });

    describe('when pool is in the non-critical range', () => {
      const poolConfig = {
        targetPercentage: fp(0.5),
        upperCriticalPercentage: fp(1),
        lowerCriticalPercentage: fp(0.1),
        feePercentage: fp(0.1),
      };

      sharedBeforeEach(async () => {
        await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
        // Ensure that the pool is invested below its target level but above than critical level
        const targetInvestmentAmount = await assetManager.maxInvestableBalance(poolId);
        await assetManager.connect(poolController).capitalIn(poolId, targetInvestmentAmount.div(2));
      });

      it('returns 0', async () => {
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(0);
      });
    });

    describe('when pool is above upper critical investment level', () => {
      const poolConfig = {
        targetPercentage: fp(0.5),
        upperCriticalPercentage: fp(0.6),
        lowerCriticalPercentage: fp(0.1),
        feePercentage: fp(0.1),
      };

      sharedBeforeEach(async () => {
        // Bump up the target percentage and invest
        await assetManager
          .connect(poolController)
          .setPoolConfig(poolId, { ...poolConfig, targetPercentage: fp(0.8), upperCriticalPercentage: fp(1) });
        await assetManager.capitalIn(poolId, await assetManager.maxInvestableBalance(poolId));
        // Reduce the target percentage to ensure that we're over the critical threshold
        await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
      });

      it('returns 0 when fee percentage is zero', async () => {
        await assetManager.connect(poolController).setPoolConfig(poolId, { ...poolConfig, feePercentage: 0 });
        const expectedFee = 0;
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });

      it('returns the expected fee when fee percentage is non-zero', async () => {
        const { poolCash, poolManaged } = await assetManager.getPoolBalances(poolId);
        const expectedFee = calcRebalanceFee(poolCash, poolManaged, poolConfig);
        expect(expectedFee).to.be.gt(0);
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });

      it('returns 0 when pool is recently rebalanced', async () => {
        await assetManager.rebalance(poolId);
        // Reduce the target percentage to ensure that we're over the critical threshold
        await assetManager.connect(poolController).setPoolConfig(poolId, {
          targetPercentage: 0,
          upperCriticalPercentage: 0,
          lowerCriticalPercentage: 0,
          feePercentage: fp(0.1),
        });

        const expectedFee = 0;
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });
    });

    describe('when pool is below critical investment level', () => {
      const poolConfig = {
        targetPercentage: fp(0.5),
        upperCriticalPercentage: fp(1),
        lowerCriticalPercentage: fp(0.1),
        feePercentage: fp(0.1),
      };

      it('returns 0 when fee percentage is zero', async () => {
        await assetManager.connect(poolController).setPoolConfig(poolId, { ...poolConfig, feePercentage: bn(0) });
        const expectedFee = 0;
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });

      it('returns the expected fee when fee percentage is non-zero', async () => {
        await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);

        const { poolCash, poolManaged } = await assetManager.getPoolBalances(poolId);
        const expectedFee = calcRebalanceFee(poolCash, poolManaged, poolConfig);
        expect(expectedFee).to.be.gt(0);
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });

      it('returns 0 when pool is recently rebalanced', async () => {
        await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
        await assetManager.rebalance(poolId);
        // Increase the target percentage to ensure that we're under the critical threshold
        await assetManager.connect(poolController).setPoolConfig(poolId, {
          targetPercentage: fp(1),
          upperCriticalPercentage: fp(1),
          lowerCriticalPercentage: fp(0.9),
          feePercentage: fp(0.1),
        });

        const expectedFee = 0;
        expect(await assetManager.getRebalanceFee(poolId)).to.be.eq(expectedFee);
      });
    });
  });

  describe('rebalance', () => {
    describe('when pool is above target investment level', () => {
      describe('when pool is in non-critical range', () => {
        const poolConfig = {
          targetPercentage: fp(0.5),
          upperCriticalPercentage: fp(1),
          lowerCriticalPercentage: fp(0.1),
          feePercentage: fp(0.1),
        };

        sharedBeforeEach(async () => {
          const poolController = lp; // TODO
          await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          const amountToDeposit = tokenInitialBalance.mul(poolConfig.targetPercentage).div(fp(1));
          await assetManager.connect(poolController).capitalIn(poolId, amountToDeposit);

          // should be perfectly balanced
          const maxInvestableBalance = await assetManager.maxInvestableBalance(poolId);
          expect(maxInvestableBalance).to.equal(0);

          // Simulate a return on asset manager's investment
          const amountReturned = amountToDeposit.div(10);
          await assetManager.connect(lp).setUnrealisedAUM(amountToDeposit.add(amountReturned));

          await assetManager.connect(lp).updateBalanceOfPool(poolId);
        });

        it('transfers the expected number of tokens to the Vault', async () => {
          const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
          const poolTVL = cash.add(managed);
          const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
          const expectedRebalanceAmount = managed.sub(targetInvestmentAmount);

          await expectBalanceChange(() => assetManager.rebalance(poolId), tokens, [
            { account: assetManager.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
            { account: vault.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
          ]);
        });

        it('returns the pool to its target allocation', async () => {
          await assetManager.rebalance(poolId);
          const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
          expect(differenceFromTarget.abs()).to.be.lte(1);
        });
      });

      describe('when pool is above critical investment level', () => {
        const poolConfig = {
          targetPercentage: fp(0.5),
          upperCriticalPercentage: fp(0.6),
          lowerCriticalPercentage: fp(0.1),
          feePercentage: fp(0.1),
        };

        describe('when fee percentage is zero', () => {
          sharedBeforeEach(async () => {
            const poolController = lp; // TODO
            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
            const amountToDeposit = tokenInitialBalance.mul(poolConfig.targetPercentage).div(fp(1));
            await assetManager.connect(poolController).capitalIn(poolId, amountToDeposit);

            // should be perfectly balanced
            const maxInvestableBalance = await assetManager.maxInvestableBalance(poolId);
            expect(maxInvestableBalance).to.equal(0);

            // Simulate a return on asset manager's investment which results in going over critical percentage
            const amountReturned = amountToDeposit.div(2);
            await assetManager.connect(lp).setUnrealisedAUM(amountToDeposit.add(amountReturned));

            await assetManager.connect(lp).updateBalanceOfPool(poolId);
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
            const poolTVL = cash.add(managed);
            const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

            await expectBalanceChange(() => assetManager.rebalance(poolId), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalance(poolId);
            const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
            expect(differenceFromTarget.abs()).to.be.lte(1);
          });
        });

        describe('when fee percentage is non-zero', () => {
          let zeroFeeRebalanceAmount: BigNumber;
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0.1),
          };

          sharedBeforeEach(async () => {
            const poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
            zeroFeeRebalanceAmount = await assetManager.maxInvestableBalance(poolId);
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);

            const investmentFeeAdjustment = expectedFeeAmount.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedInvestmentAmount = zeroFeeRebalanceAmount.sub(investmentFeeAdjustment);

            const expectedVaultRemovedAmount = expectedInvestmentAmount.add(expectedFeeAmount);

            await expectBalanceChange(() => assetManager.connect(lp).rebalance(poolId), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedInvestmentAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedVaultRemovedAmount] } },
            ]);
          });

          it('pays the correct fee to the rebalancer', async () => {
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);
            expect(expectedFeeAmount).to.be.gt(0);
            await expectBalanceChange(() => assetManager.connect(lp).rebalance(poolId), tokens, [
              { account: lp.address, changes: { DAI: ['very-near', expectedFeeAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalance(poolId);
            const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
            expect(differenceFromTarget.abs()).to.be.lte(1);
          });
        });
      });
    });

    describe('when pool is below target investment level', () => {
      describe('when pool is in non-critical range', () => {
        const poolConfig = {
          targetPercentage: fp(0.5),
          upperCriticalPercentage: fp(1),
          lowerCriticalPercentage: fp(0.1),
          feePercentage: fp(0.1),
        };

        sharedBeforeEach(async () => {
          const poolController = lp; // TODO

          await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          // Ensure that the pool is invested below its target level but above than critical level
          const targetInvestmentAmount = await assetManager.maxInvestableBalance(poolId);
          await assetManager.connect(poolController).capitalIn(poolId, targetInvestmentAmount.div(2));
        });

        it('transfers the expected number of tokens from the Vault', async () => {
          const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
          const poolTVL = cash.add(managed);
          const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
          const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

          await expectBalanceChange(() => assetManager.rebalance(poolId), tokens, [
            { account: assetManager.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
            { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
          ]);
        });

        it('returns the pool to its target allocation', async () => {
          await assetManager.rebalance(poolId);
          const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
          expect(differenceFromTarget.abs()).to.be.lte(1);
        });
      });

      describe('when pool is below critical investment level', () => {
        let poolController: SignerWithAddress; // TODO

        describe('when fee percentage is zero', () => {
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0),
          };
          sharedBeforeEach(async () => {
            poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
            const poolTVL = cash.add(managed);
            const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

            await expectBalanceChange(() => assetManager.rebalance(poolId), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalance(poolId);
            const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
            expect(differenceFromTarget.abs()).to.be.lte(1);
          });
        });

        describe('when fee percentage is non-zero', () => {
          let zeroFeeRebalanceAmount: BigNumber;
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0.1),
          };
          sharedBeforeEach(async () => {
            poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
            zeroFeeRebalanceAmount = await assetManager.maxInvestableBalance(poolId);
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);

            const investmentFeeAdjustment = expectedFeeAmount.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedInvestmentAmount = zeroFeeRebalanceAmount.sub(investmentFeeAdjustment);

            const expectedVaultRemovedAmount = expectedInvestmentAmount.add(expectedFeeAmount);

            await expectBalanceChange(() => assetManager.connect(lp).rebalance(poolId), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedInvestmentAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedVaultRemovedAmount] } },
            ]);
          });

          it('pays the correct fee to the rebalancer', async () => {
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);
            await expectBalanceChange(() => assetManager.connect(lp).rebalance(poolId), tokens, [
              { account: lp.address, changes: { DAI: ['very-near', expectedFeeAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalance(poolId);
            const differenceFromTarget = await assetManager.maxInvestableBalance(poolId);
            expect(differenceFromTarget.abs()).to.be.lte(1);
          });
        });
      });
    });
  });

  describe('rebalanceAndSwap', () => {
    let swap: any;
    sharedBeforeEach(async () => {
      swap = {
        swaps: [
          {
            poolId: swapPoolId,
            assetInIndex: 0,
            assetOutIndex: 1,
            amount: 0,
            userData: '0x',
          },
        ],
        assets: [tokens.DAI.address, tokens.MKR.address],
        funds: {
          sender: assetManager.address,
          fromInternalBalance: false,
          recipient: lp.address,
          toInternalBalance: false,
        },
        limits: [MAX_INT256, -1],
        deadline: MAX_UINT256,
      };
    });

    describe('when pool is above target investment level', () => {
      describe('when pool is within the non-critical range', () => {
        const poolConfig = {
          targetPercentage: fp(0.5),
          upperCriticalPercentage: fp(1),
          lowerCriticalPercentage: fp(0.1),
          feePercentage: fp(0.1),
        };

        sharedBeforeEach(async () => {
          const poolController = lp; // TODO
          await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          const amountToDeposit = tokenInitialBalance.mul(poolConfig.targetPercentage).div(fp(1));
          await assetManager.connect(poolController).capitalIn(poolId, amountToDeposit);

          // should be perfectly balanced
          const maxInvestableBalance = await assetManager.maxInvestableBalance(poolId);
          expect(maxInvestableBalance).to.equal(0);

          // Simulate a return on asset manager's investment
          const amountReturned = amountToDeposit.div(10);
          await assetManager.connect(lp).setUnrealisedAUM(amountToDeposit.add(amountReturned));

          await assetManager.connect(lp).updateBalanceOfPool(poolId);
        });

        it('transfers the expected number of tokens from the Vault', async () => {
          const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
          const poolTVL = cash.add(managed);
          const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
          const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

          await expectBalanceChange(() => assetManager.rebalanceAndSwap(poolId, swap), tokens, [
            { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
          ]);
        });

        it('returns the pool to its target allocation', async () => {
          await assetManager.rebalanceAndSwap(poolId, swap);
          expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
        });

        it("doesn't perform the swap", async () => {
          const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
          expectEvent.notEmitted(receipt, 'Swap');
        });
      });

      describe('when pool is above critical investment level', () => {
        describe('when fee percentage is zero', () => {
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0),
          };
          sharedBeforeEach(async () => {
            const poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
            const poolTVL = cash.add(managed);
            const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

            await expectBalanceChange(() => assetManager.rebalanceAndSwap(poolId, swap), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalanceAndSwap(poolId, swap);
            expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
          });

          it("doesn't perform the swap", async () => {
            const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
            expectEvent.notEmitted(receipt, 'Swap');
          });
        });

        describe('when fee percentage is non-zero', () => {
          let zeroFeeRebalanceAmount: BigNumber;
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0.1),
          };
          sharedBeforeEach(async () => {
            const poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
            zeroFeeRebalanceAmount = await assetManager.maxInvestableBalance(poolId);
          });

          it("reverts if the funds aren't taken from the asset manager", async () => {
            const badSwap = {
              ...swap,
              funds: {
                sender: lp.address,
                fromInternalBalance: false,
                recipient: lp.address,
                toInternalBalance: false,
              },
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              'Asset Manager must be sender'
            );
          });

          it('reverts if the swap attempts to use a token other what is paid as a fee as a swap input', async () => {
            const badSwap = {
              ...swap,
              assets: [tokens.MKR.address, tokens.DAI.address],
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              "Must swap asset manager's token"
            );
          });

          it("reverts if the swap attempts to use the asset manager's internal balance", async () => {
            const badSwap = {
              ...swap,
              funds: {
                sender: assetManager.address,
                fromInternalBalance: true,
                recipient: lp.address,
                toInternalBalance: false,
              },
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              "Can't use Asset Manager's internal balance"
            );
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);

            const investmentFeeAdjustment = expectedFeeAmount.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedInvestmentAmount = zeroFeeRebalanceAmount.sub(investmentFeeAdjustment);

            // The fee does not feature in the DAI balance change of the vault as it is replaced during the swap
            await expectBalanceChange(() => assetManager.connect(lp).rebalanceAndSwap(poolId, swap), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedInvestmentAmount] } },
              {
                account: vault.address,
                changes: { DAI: ['very-near', -expectedInvestmentAmount], MKR: ['very-near', -expectedFeeAmount] },
              },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalanceAndSwap(poolId, swap);
            expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
          });

          it('performs the expected swap', async () => {
            const expectedFee: BigNumber = await assetManager.getRebalanceFee(poolId);

            // Check that the expected swap occurs
            const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
            expectEvent.inIndirectReceipt(receipt, vault.interface, 'Swap', {
              poolId: swapPoolId,
              tokenIn: tokens.DAI.address,
              tokenOut: tokens.MKR.address,
              amountIn: expectedFee,
              amountOut: expectedFee,
            });

            // Check that keeper holds expected number of tokens after swap
            expect(await tokens.MKR.balanceOf(lp.address)).to.be.eq(expectedFee);
          });
        });
      });
    });

    describe('when pool is below target investment level', () => {
      const poolConfig = {
        targetPercentage: fp(0.5),
        upperCriticalPercentage: fp(1),
        lowerCriticalPercentage: fp(0.1),
        feePercentage: fp(0.1),
      };
      sharedBeforeEach(async () => {
        const poolController = lp; // TODO

        await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
      });

      describe('when pool is within critical range', () => {
        sharedBeforeEach(async () => {
          const poolController = lp; // TODO
          // Ensure that the pool is invested below its target level but above than critical level
          const targetInvestmentAmount = await assetManager.maxInvestableBalance(poolId);
          await assetManager.connect(poolController).capitalIn(poolId, targetInvestmentAmount.div(2));
        });

        it('transfers the expected number of tokens from the Vault', async () => {
          const { cash, managed } = await vault.getPoolTokenInfo(poolId, tokens.DAI.address);
          const poolTVL = cash.add(managed);
          const targetInvestmentAmount = poolTVL.mul(poolConfig.targetPercentage).div(fp(1));
          const expectedRebalanceAmount = targetInvestmentAmount.sub(managed);

          await expectBalanceChange(() => assetManager.rebalanceAndSwap(poolId, swap), tokens, [
            { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
          ]);
        });

        it('returns the pool to its target allocation', async () => {
          await assetManager.rebalanceAndSwap(poolId, swap);
          expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
        });

        it("doesn't perform the swap", async () => {
          const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
          expectEvent.notEmitted(receipt, 'Swap');
        });
      });

      describe('when pool is below critical investment level', () => {
        describe('when fee percentage is zero', () => {
          sharedBeforeEach(async () => {
            const poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, { ...poolConfig, feePercentage: 0 });
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const { poolCash, poolManaged } = await assetManager.getPoolBalances(poolId);
            const poolAssets = poolCash.add(poolManaged);
            const targetInvestmentAmount = poolAssets.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedRebalanceAmount = targetInvestmentAmount.sub(poolManaged);

            await expectBalanceChange(() => assetManager.rebalanceAndSwap(poolId, swap), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedRebalanceAmount] } },
              { account: vault.address, changes: { DAI: ['very-near', -expectedRebalanceAmount] } },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalanceAndSwap(poolId, swap);
            expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
          });

          it("doesn't perform the swap", async () => {
            const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
            expectEvent.notEmitted(receipt, 'Swap');
          });
        });

        describe('when fee percentage is non-zero', () => {
          const poolConfig = {
            targetPercentage: fp(0.5),
            upperCriticalPercentage: fp(1),
            lowerCriticalPercentage: fp(0.1),
            feePercentage: fp(0.1),
          };

          sharedBeforeEach(async () => {
            const poolController = lp; // TODO

            await assetManager.connect(poolController).setPoolConfig(poolId, poolConfig);
          });

          it("reverts if the funds aren't taken from the asset manager", async () => {
            const badSwap = {
              ...swap,
              funds: {
                sender: lp.address,
                fromInternalBalance: false,
                recipient: lp.address,
                toInternalBalance: false,
              },
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              'Asset Manager must be sender'
            );
          });

          it('reverts if the swap attempts to use a token other what is paid as a fee as a swap input', async () => {
            const badSwap = {
              ...swap,
              assets: [tokens.MKR.address, tokens.DAI.address],
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              "Must swap asset manager's token"
            );
          });

          it("reverts if the swap attempts to use the asset manager's internal balance", async () => {
            const badSwap = {
              ...swap,
              funds: {
                sender: assetManager.address,
                fromInternalBalance: true,
                recipient: lp.address,
                toInternalBalance: false,
              },
            };
            await expect(assetManager.connect(lp).rebalanceAndSwap(poolId, badSwap)).to.be.revertedWith(
              "Can't use Asset Manager's internal balance"
            );
          });

          it('transfers the expected number of tokens from the Vault', async () => {
            const { poolCash, poolManaged } = await assetManager.getPoolBalances(poolId);
            const expectedFeeAmount = await assetManager.getRebalanceFee(poolId);

            const poolAssets = poolCash.add(poolManaged);
            const targetInvestmentAmount = poolAssets.mul(poolConfig.targetPercentage).div(fp(1));
            const zeroFeeRebalanceAmount = targetInvestmentAmount.sub(poolManaged);

            const investmentFeeAdjustment = expectedFeeAmount.mul(poolConfig.targetPercentage).div(fp(1));
            const expectedInvestmentAmount = zeroFeeRebalanceAmount.sub(investmentFeeAdjustment);

            // The fee does not feature in the DAI balance change of the vault as it is replaced during the swap
            await expectBalanceChange(() => assetManager.connect(lp).rebalanceAndSwap(poolId, swap), tokens, [
              { account: assetManager.address, changes: { DAI: ['very-near', expectedInvestmentAmount] } },
              {
                account: vault.address,
                changes: { DAI: ['very-near', -expectedInvestmentAmount], MKR: ['very-near', -expectedFeeAmount] },
              },
            ]);
          });

          it('returns the pool to its target allocation', async () => {
            await assetManager.rebalanceAndSwap(poolId, swap);
            expect(await assetManager.maxInvestableBalance(poolId)).to.be.eq(0);
          });

          it('performs the expected swap', async () => {
            const expectedFee: BigNumber = await assetManager.getRebalanceFee(poolId);

            // Check that the expected swap occurs
            const receipt = await (await assetManager.rebalanceAndSwap(poolId, swap)).wait();
            expectEvent.inIndirectReceipt(receipt, vault.interface, 'Swap', {
              poolId: swapPoolId,
              tokenIn: tokens.DAI.address,
              tokenOut: tokens.MKR.address,
              amountIn: expectedFee,
              amountOut: expectedFee,
            });

            // Check that keeper holds expected number of tokens after swap
            expect(await tokens.MKR.balanceOf(lp.address)).to.be.eq(expectedFee);
          });
        });
      });
    });
  });
});
