import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { deploy } from '../../../lib/helpers/deploy';
import { BigNumberish, bn, decimal, fp, pct } from '../../../lib/helpers/numbers';
import { MinimalSwapInfoPool, TwoTokenPool } from '../../../lib/helpers/pools';

import TokenList from '../../helpers/models/tokens/TokenList';
import WeightedPool from '../../helpers/models/pools/weighted/WeightedPool';
import { RawWeightedPoolDeployment } from '../../helpers/models/pools/weighted/types';
import { sharedBeforeEach } from '../../helpers/lib/sharedBeforeEach';

describe('WeightedPool', function () {
  let authorizer: Contract, allTokens: TokenList;
  let admin: SignerWithAddress, lp: SignerWithAddress;
  let trader: SignerWithAddress, recipient: SignerWithAddress, other: SignerWithAddress;

  const POOL_SWAP_FEE = fp(0.01);
  const WEIGHTS = [fp(70), fp(30), fp(5), fp(5)];
  const INITIAL_BALANCES = [fp(0.9), fp(1.8), fp(2.7), fp(3.6)];

  before('setup signers', async () => {
    [, admin, lp, trader, recipient, other] = await ethers.getSigners();
    authorizer = await deploy('Authorizer', { args: [admin.address] });
  });

  sharedBeforeEach('deploy tokens', async () => {
    allTokens = await TokenList.create(['DAI', 'MKR', 'SNX', 'BAT'], { sorted: true });
    await allTokens.mint({ to: [lp, trader], amount: fp(100) });
  });

  context('for a 1 token pool', () => {
    it('reverts if there is a single token', async () => {
      const tokens = allTokens.subset(1).addresses;
      const weights = WEIGHTS.slice(0, 1);
      const vault = await deploy('Vault', { args: [authorizer.address] });

      const args = [vault.address, 'Balancer Pool Token', 'BPT', tokens, weights, POOL_SWAP_FEE];
      await expect(deploy('WeightedPool', { args })).to.be.revertedWith('MIN_TOKENS');
    });
  });

  context('for a 2 token pool', () => {
    itBehavesAsWeightedPool(2);
  });

  context('for a 3 token pool', () => {
    itBehavesAsWeightedPool(3);
  });

  context('for a too-many token pool', () => {
    it('reverts if there are too many tokens', async () => {
      // The maximum number of tokens is 16
      const tokens = await TokenList.create(17);
      const weights = new Array(17).fill(fp(1));
      const vault = await deploy('Vault', { args: [authorizer.address] });

      const args = [vault.address, 'Balancer Pool Token', 'BPT', tokens.addresses, weights, POOL_SWAP_FEE];
      await expect(deploy('WeightedPool', { args })).to.be.revertedWith('MAX_TOKENS');
    });
  });

  function itBehavesAsWeightedPool(numberOfTokens: number) {
    let pool: WeightedPool, tokens: TokenList;

    const ZEROS = Array(numberOfTokens).fill(bn(0));
    const weights = WEIGHTS.slice(0, numberOfTokens);
    const initialBalances = INITIAL_BALANCES.slice(0, numberOfTokens);

    async function deployPool(params: RawWeightedPoolDeployment = {}): Promise<void> {
      params = Object.assign({}, { tokens, weights, swapFee: POOL_SWAP_FEE }, params);
      pool = await WeightedPool.create(params);
    }

    beforeEach('define pool tokens', () => {
      tokens = allTokens.subset(numberOfTokens);
    });

    describe('creation', () => {
      context('when the creation succeeds', () => {
        sharedBeforeEach('deploy pool from factory', async () => {
          await deployPool({ fromFactory: true });
        });

        it('sets the vault', async () => {
          expect(await pool.getVault()).to.equal(pool.vault.address);
        });

        it('uses the corresponding specialization', async () => {
          const expectedSpecialization = numberOfTokens == 2 ? TwoTokenPool : MinimalSwapInfoPool;

          const { address, specialization } = await pool.getRegisteredInfo();
          expect(address).to.equal(pool.address);
          expect(specialization).to.equal(expectedSpecialization);
        });

        it('registers tokens in the vault', async () => {
          const { tokens, balances } = await pool.getTokens();

          expect(tokens).to.have.members(tokens);
          expect(balances).to.be.zeros;
        });

        it('starts with no BPT', async () => {
          expect(await pool.totalSupply()).to.be.equal(0);
        });

        it('sets the asset managers', async () => {
          await tokens.asyncEach(async (token) => {
            const { assetManager } = await pool.getTokenInfo(token);
            expect(assetManager).to.be.zeroAddress;
          });
        });

        it('sets token weights', async () => {
          const normalizedWeights = await pool.getNormalizedWeights();

          expect(normalizedWeights).to.equalWithError(pool.normalizedWeights, 0.0000001);
        });

        it('sets swap fee', async () => {
          expect(await pool.getSwapFee()).to.equal(POOL_SWAP_FEE);
        });

        it('sets the name', async () => {
          expect(await pool.name()).to.equal('Balancer Pool Token');
        });

        it('sets the symbol', async () => {
          expect(await pool.symbol()).to.equal('BPT');
        });

        it('sets the decimals', async () => {
          expect(await pool.decimals()).to.equal(18);
        });
      });

      context('when the creation fails', () => {
        it('reverts if the number of tokens and weights do not match', async () => {
          const badWeights = weights.slice(1);

          await expect(deployPool({ weights: badWeights })).to.be.revertedWith('INPUT_LENGTH_MISMATCH');
        });

        it('reverts if there are repeated tokens', async () => {
          const badTokens = new TokenList(Array(numberOfTokens).fill(tokens.first));

          await expect(deployPool({ tokens: badTokens, fromFactory: true })).to.be.revertedWith(
            'Create2: Failed on deploy'
          );
        });

        it('reverts if the swap fee is too high', async () => {
          const badSwapFee = fp(0.1).add(1);

          await expect(deployPool({ swapFee: badSwapFee })).to.be.revertedWith('MAX_SWAP_FEE');
        });

        it('reverts if at least one weight is too high', async () => {
          const badWeights = WEIGHTS.slice(0, numberOfTokens);
          badWeights[0] = fp(5001);

          await expect(deployPool({ weights: badWeights })).to.be.revertedWith('MAX_WEIGHT');
        });

        it('reverts if at least one weight is too low', async () => {
          const badWeights = WEIGHTS.slice(0, numberOfTokens);
          badWeights[0] = bn(99);

          await expect(deployPool({ weights: badWeights })).to.be.revertedWith('MIN_WEIGHT');
        });
      });
    });

    describe('onJoinPool', () => {
      sharedBeforeEach('deploy pool', async () => {
        await deployPool();
      });

      it('fails if caller is not the vault', async () => {
        await expect(
          pool.instance.connect(lp).onJoinPool(pool.poolId, lp.address, other.address, [0], 0, 0, '0x')
        ).to.be.revertedWith('CALLER_NOT_VAULT');
      });

      it('fails if no user data', async () => {
        await expect(pool.join({ data: '0x' })).to.be.revertedWith('Transaction reverted without a reason');
      });

      it('fails if wrong user data', async () => {
        const wrongUserData = ethers.utils.defaultAbiCoder.encode(['address'], [lp.address]);

        await expect(pool.join({ data: wrongUserData })).to.be.revertedWith('Transaction reverted without a reason');
      });

      context('initialization', () => {
        it('grants the n * invariant amount of BPT', async () => {
          const invariant = await pool.estimateInvariant(initialBalances);

          const { amountsIn, dueProtocolFeeAmounts } = await pool.init({ recipient, initialBalances });

          // Amounts in should be the same as initial ones
          expect(amountsIn).to.deep.equal(initialBalances);

          // Protocol fees should be zero
          expect(dueProtocolFeeAmounts).to.be.zeros;

          // Initial balances should equal invariant
          expect(await pool.balanceOf(recipient)).to.be.equalWithError(invariant.mul(numberOfTokens), 0.001);
        });

        it('fails if already initialized', async () => {
          await pool.init({ recipient, initialBalances });

          await expect(pool.init({ initialBalances })).to.be.revertedWith('UNHANDLED_JOIN_KIND');
        });
      });

      context('join exact tokens in for BPT out', () => {
        it('fails if not initialized', async () => {
          await expect(pool.joinGivenIn({ recipient, amountsIn: initialBalances })).to.be.revertedWith('UNINITIALIZED');
        });

        context('once initialized', () => {
          let expectedBptOut: BigNumberish;
          const amountsIn = ZEROS.map((n, i) => (i === 1 ? fp(0.1) : n));

          sharedBeforeEach('initialize pool', async () => {
            await pool.init({ recipient, initialBalances });
            expectedBptOut = await pool.estimateBptOut(amountsIn, initialBalances);
          });

          it('grants BPT for exact tokens', async () => {
            const previousBptBalance = await pool.balanceOf(recipient);
            const minimumBptOut = pct(expectedBptOut, 0.99);

            const result = await pool.joinGivenIn({ amountsIn, minimumBptOut, recipient });

            // Amounts in should be the same as initial ones
            expect(result.amountsIn).to.deep.equal(amountsIn);

            // Protocol fees should be zero
            expect(result.dueProtocolFeeAmounts).to.be.zeros;

            // Make sure received BPT is closed to what we expect
            const currentBptBalance = await pool.balanceOf(recipient);
            expect(currentBptBalance.sub(previousBptBalance)).to.be.equalWithError(expectedBptOut, 0.0001);
          });

          it('fails if not enough BPT', async () => {
            // This call should fail cause we are requesting minimum 1% more
            const minimumBptOut = pct(expectedBptOut, 1.01);

            await expect(pool.joinGivenIn({ amountsIn, minimumBptOut })).to.be.revertedWith('BPT_OUT_MIN_AMOUNT');
          });
        });
      });

      context('join token in for exact BPT out', () => {
        const token = 0;
        const bptOut = fp(10);

        it('fails if not initialized', async () => {
          await expect(pool.joinGivenOut({ bptOut, token })).to.be.revertedWith('UNINITIALIZED');
        });

        context('once initialized', () => {
          sharedBeforeEach('initialize pool', async () => {
            await pool.init({ recipient, initialBalances });
          });

          it('grants exact BPT for token in', async () => {
            const previousBptBalance = await pool.balanceOf(recipient);
            const expectedAmountIn = await pool.estimateTokenIn(token, bptOut, initialBalances);

            const result = await pool.joinGivenOut({ recipient, bptOut, token });

            // Only token in should be the one transferred
            expect(result.amountsIn[token]).to.be.equalWithError(expectedAmountIn, 0.001);
            expect(result.amountsIn.filter((_, i) => i != token)).to.be.zeros;

            // Protocol fees should be zero
            expect(result.dueProtocolFeeAmounts).to.be.zeros;

            // Make sure received BPT is closed to what we expect
            const currentBptBalance = await pool.balanceOf(recipient);
            expect(currentBptBalance.sub(previousBptBalance)).to.be.equalWithError(bptOut, 0.001);
          });

          // TODO: implement
          it.skip('fails if not enough token in');
        });
      });
    });

    describe('onExitPool', () => {
      let previousBptBalance: BigNumber;

      sharedBeforeEach('deploy and initialize pool', async () => {
        await deployPool();
        await pool.init({ initialBalances, recipient: lp });
        previousBptBalance = await pool.balanceOf(lp);
      });

      it('fails if caller is not the vault', async () => {
        await expect(
          pool.instance.connect(lp).onExitPool(pool.poolId, recipient.address, other.address, [0], 0, 0, '0x')
        ).to.be.revertedWith('CALLER_NOT_VAULT');
      });

      it('fails if no user data', async () => {
        await expect(pool.exit({ data: '0x' })).to.be.revertedWith('Transaction reverted without a reason');
      });

      it('fails if wrong user data', async () => {
        const wrongUserData = ethers.utils.defaultAbiCoder.encode(['address'], [lp.address]);

        await expect(pool.exit({ data: wrongUserData })).to.be.revertedWith('Transaction reverted without a reason');
      });

      context('exit exact BPT in for one token out', () => {
        const token = 0;

        // TODO: This fails because the percentual invariant decrease is too large,
        //  and causes the exponentiation function to fail.
        it.skip('grants one token for exact bpt', async () => {
          // Fully exit
          const bptIn = await pool.balanceOf(lp);
          const expectedTokenOut = await pool.estimateTokenOut(token, bptIn);

          const result = await pool.singleExitGivenIn({ from: lp, bptIn, token });

          // Protocol fees should be zero
          expect(result.dueProtocolFeeAmounts).to.be.zeros;

          // Only token out should be the one transferred
          expect(result.amountsOut[token]).to.be.equalWithError(expectedTokenOut, 0.0001);
          expect(result.amountsOut.filter((_, i) => i != token)).to.be.zeros;

          // Current BPT balance should be zero
          expect(await pool.balanceOf(lp)).to.be.zero;
        });
      });

      context('exit exact BPT in for all tokens out', () => {
        it('grants all tokens for exact bpt', async () => {
          // Exit with half of the BPT balance
          const bptIn = previousBptBalance.div(2);
          const expectedAmountsOut = initialBalances.map((balance) => balance.div(2));

          const result = await pool.multiExitGivenIn({ from: lp, bptIn });

          // Protocol fees should be zero
          expect(result.dueProtocolFeeAmounts).to.be.zeros;

          // Balances are reduced by half because we are returning half of the BPT supply
          expect(result.amountsOut).to.be.equalWithError(expectedAmountsOut, 0.001);

          // Current BPT balance should have been reduced by half
          expect(await pool.balanceOf(lp)).to.be.equalWithError(bptIn, 0.001);
        });

        it('fully exit', async () => {
          // The LP doesn't own all BPT, since some was locked. They will only be able to extract a (large) percentage
          // of the Pool's balance: the rest remains there forever.
          const totalBPT = await pool.totalSupply();
          const expectedAmountsOut = initialBalances.map((balance) => balance.mul(previousBptBalance).div(totalBPT));

          const result = await pool.multiExitGivenIn({ from: lp, bptIn: previousBptBalance });

          // Protocol fees should be zero
          expect(result.dueProtocolFeeAmounts).to.be.zeros;

          // All balances are extracted
          expect(result.amountsOut).to.be.lteWithError(expectedAmountsOut, 0.00001);

          // Current BPT balances should be zero due to full exit
          expect(await pool.balanceOf(lp)).to.equal(0);
        });
      });

      context('exit BPT in for exact tokens out', () => {
        it('grants exact tokens for bpt', async () => {
          // Request half of the token balances
          const amountsOut = initialBalances.map((balance) => balance.div(2));
          const expectedBptIn = previousBptBalance.div(2);
          const maximumBptIn = pct(expectedBptIn, 1.01);

          const result = await pool.exitGivenOut({ from: lp, amountsOut, maximumBptIn });

          // Protocol fees should be zero
          expect(result.dueProtocolFeeAmounts).to.be.zeros;

          // Token balances should been reduced as requested
          expect(result.amountsOut).to.deep.equal(amountsOut);

          // BPT balance should have been reduced by half because we are returning half of the tokens
          expect(await pool.balanceOf(lp)).to.be.equalWithError(previousBptBalance.div(2), 0.001);
        });

        it('fails if more BTP needed', async () => {
          // Call should fail cause we are requesting a max amount lower than the actual needed
          const amountsOut = initialBalances;
          const maximumBptIn = previousBptBalance.div(2);

          await expect(pool.exitGivenOut({ from: lp, amountsOut, maximumBptIn })).to.be.revertedWith(
            'BPT_IN_MAX_AMOUNT'
          );
        });
      });
    });

    describe('swaps', () => {
      sharedBeforeEach('deploy and join pool', async () => {
        await deployPool();
        await pool.init({ initialBalances });
      });

      context('given in', () => {
        const amountWithoutFees = fp(0.9);
        const amount = amountWithoutFees.mul(POOL_SWAP_FEE.add(fp(1))).div(fp(1));

        it('calculates amount out', async () => {
          const expectedAmountOut = await pool.estimateGivenIn({ in: 0, out: 1, amount });

          const result = await pool.swapGivenIn({ in: 0, out: 1, amount });

          expect(result).to.be.equalWithError(expectedAmountOut, 0.005);
        });

        it('reverts if token in is not in the pool', async () => {
          await expect(pool.swapGivenIn({ in: allTokens.BAT, out: 1, amount })).to.be.revertedWith('INVALID_TOKEN');
        });

        it('reverts if token out is not in the pool', async () => {
          await expect(pool.swapGivenIn({ in: 0, out: allTokens.BAT, amount })).to.be.revertedWith('INVALID_TOKEN');
        });
      });

      context('given out', () => {
        const amount = fp(1.35);

        it('calculates amount in', async () => {
          const expectedAmountIn = await pool.estimateGivenOut({ in: 0, out: 1, amount });

          const result = await pool.swapGivenOut({ in: 0, out: 1, amount });

          expect(result).to.be.equalWithError(expectedAmountIn, 0.1);
        });

        it('reverts if token in is not in the pool when given out', async () => {
          await expect(pool.swapGivenOut({ in: allTokens.BAT, out: 1, amount })).to.be.revertedWith('INVALID_TOKEN');
        });

        it('reverts if token out is not in the pool', async () => {
          await expect(pool.swapGivenOut({ in: 0, out: allTokens.BAT, amount })).to.be.revertedWith('INVALID_TOKEN');
        });
      });
    });

    describe('protocol swap fees', () => {
      const protocolFeePercentage = fp(0.1); // 10 %

      sharedBeforeEach('deploy and join pool', async () => {
        await deployPool();
        await pool.init({ initialBalances, from: lp, protocolFeePercentage });
      });

      context('with balance changes', () => {
        it('joins and exits do not accumulate fees', async () => {
          let joinResult = await pool.joinGivenIn({ from: lp, amountsIn: fp(100), protocolFeePercentage });
          expect(joinResult.dueProtocolFeeAmounts).to.be.zeros;

          joinResult = await pool.joinGivenOut({ from: lp, bptOut: fp(1), token: 0, protocolFeePercentage });
          expect(joinResult.dueProtocolFeeAmounts).to.be.zeros;

          let exitResult = await pool.singleExitGivenIn({ from: lp, bptIn: fp(10), token: 0, protocolFeePercentage });
          expect(exitResult.dueProtocolFeeAmounts).to.be.zeros;

          exitResult = await pool.multiExitGivenIn({ from: lp, bptIn: fp(10), protocolFeePercentage });
          expect(exitResult.dueProtocolFeeAmounts).to.be.zeros;

          joinResult = await pool.joinGivenIn({ from: lp, amountsIn: fp(10), protocolFeePercentage });
          expect(joinResult.dueProtocolFeeAmounts).to.be.zeros;

          exitResult = await pool.exitGivenOut({ from: lp, amountsOut: fp(10), protocolFeePercentage });
          expect(exitResult.dueProtocolFeeAmounts).to.be.zeros;
        });
      });

      context('with balance changes', () => {
        let currentBalances: BigNumber[], expectedDueProtocolFeeAmounts: BigNumber[];

        sharedBeforeEach('simulate doubled initial balances ', async () => {
          currentBalances = initialBalances.map((balance) => balance.mul(2));
        });

        sharedBeforeEach('compute expected due protocol fees', async () => {
          const previousBlockHash = (await ethers.provider.getBlock('latest')).hash;
          const paidTokenIndex = decimal(previousBlockHash).mod(numberOfTokens).toNumber();
          const protocolFeeAmount = await pool.estimateSwapFee(paidTokenIndex, protocolFeePercentage, currentBalances);
          expectedDueProtocolFeeAmounts = ZEROS.map((n, i) => (i === paidTokenIndex ? protocolFeeAmount : n));
        });

        it('pays swap protocol fees on join exact tokens in for BPT out', async () => {
          const result = await pool.joinGivenIn({ from: lp, amountsIn: fp(1), currentBalances, protocolFeePercentage });

          expect(result.dueProtocolFeeAmounts).to.be.equalWithError(expectedDueProtocolFeeAmounts, 0.1);
        });

        it('pays swap protocol fees on exit exact BPT in for one token out', async () => {
          const result = await pool.singleExitGivenIn({
            from: lp,
            bptIn: fp(1),
            token: 0,
            currentBalances,
            protocolFeePercentage,
          });

          expect(result.dueProtocolFeeAmounts).to.be.equalWithError(expectedDueProtocolFeeAmounts, 0.1);
        });

        it('pays swap protocol fees on exit exact BPT in for all tokens out', async () => {
          const result = await pool.multiExitGivenIn({
            from: lp,
            bptIn: fp(1),
            currentBalances,
            protocolFeePercentage,
          });

          expect(result.dueProtocolFeeAmounts).to.be.equalWithError(expectedDueProtocolFeeAmounts, 0.1);
        });

        it('pays swap protocol fees on exit BPT In for exact tokens out', async () => {
          const result = await pool.exitGivenOut({
            from: lp,
            amountsOut: fp(1),
            currentBalances,
            protocolFeePercentage,
          });

          expect(result.dueProtocolFeeAmounts).to.be.equalWithError(expectedDueProtocolFeeAmounts, 0.1);
        });
      });
    });
  }
});
