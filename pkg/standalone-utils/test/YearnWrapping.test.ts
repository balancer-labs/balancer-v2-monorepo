import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import Token from '@balancer-labs/v2-helpers/src/models/tokens/Token';

import { expectTransferEvent } from '@balancer-labs/v2-helpers/src/test/expectTransfer';
import { deploy, deployedAt } from '@balancer-labs/v2-helpers/src/contract';
import { actionId } from '@balancer-labs/v2-helpers/src/models/misc/actions';
import { ANY_ADDRESS, ZERO_ADDRESS } from '@balancer-labs/v2-helpers/src/constants';
import { BigNumberish, fp } from '@balancer-labs/v2-helpers/src/numbers';
import Vault from '@balancer-labs/v2-helpers/src/models/vault/Vault';
import { Account } from '@balancer-labs/v2-helpers/src/models/types/types';
import TypesConverter from '@balancer-labs/v2-helpers/src/models/types/TypesConverter';
import { expectChainedReferenceContents, toChainedReference } from './helpers/chainedReferences';

describe('YearnWrapping', function () {
  let dai: Token, yvDAI: Contract;
  let user: SignerWithAddress, admin: SignerWithAddress;
  let vault: Vault;
  let relayer: Contract, relayerLibrary: Contract;
  const yvDaiRate = fp(1.02);

  before('setup signers', async () => {
    [, admin, user] = await ethers.getSigners();
  });

  sharedBeforeEach('deploy Vault', async () => {
    vault = await Vault.create({ admin });
  });

  sharedBeforeEach('Deploy tokens and yearn vaults', async () => {
    vault = await Vault.create({ admin });

    dai = await Token.create({ name: 'DAI', symbol: 'DAI', decimals: 18 });
    yvDAI = await deploy('v2-pool-linear/MockYearnTokenVault', {
      args: ['yvDAI', 'yvDAI', 18, dai.address, yvDaiRate],
    });
  });

  sharedBeforeEach('mint tokens to user and set allowances', async () => {
    await dai.mint(user, fp(100));

    await dai.approve(vault.address, fp(100), { from: user });
    await dai.approve(yvDAI.address, fp(100), { from: user });
    await yvDAI.connect(user).approve(vault.address, fp(100));
  });

  sharedBeforeEach('set up relayer', async () => {
    // Deploy Relayer
    relayerLibrary = await deploy('MockBatchRelayerLibrary', { args: [vault.address, ZERO_ADDRESS, ZERO_ADDRESS] });
    relayer = await deployedAt('BalancerRelayer', await relayerLibrary.getEntrypoint());

    // Authorize Relayer for all actions
    const relayerActionIds = await Promise.all(
      ['swap', 'batchSwap', 'joinPool', 'exitPool', 'setRelayerApproval', 'manageUserBalance'].map((action) =>
        actionId(vault.instance, action)
      )
    );
    const authorizer = await deployedAt('v2-vault/TimelockAuthorizer', await vault.instance.getAuthorizer());
    const wheres = relayerActionIds.map(() => ANY_ADDRESS);
    await authorizer.connect(admin).grantPermissions(relayerActionIds, relayer.address, wheres);

    // Approve relayer by sender
    await vault.instance.connect(user).setRelayerApproval(user.address, relayer.address, true);
  });

  function encodeWrap(
    vaultToken: Contract,
    sender: Account,
    recipient: Account,
    amount: BigNumberish,
    outputReference?: BigNumberish
  ): string {
    return relayerLibrary.interface.encodeFunctionData('wrapYearnVaultToken', [
      vaultToken.address,
      TypesConverter.toAddress(sender),
      TypesConverter.toAddress(recipient),
      amount,
      outputReference ?? 0,
    ]);
  }

  function encodeUnwrap(
    vaultToken: Contract,
    sender: Account,
    recipient: Account,
    amount: BigNumberish,
    outputReference?: BigNumberish
  ): string {
    return relayerLibrary.interface.encodeFunctionData('unwrapYearnVaultToken  ', [
      vaultToken.address,
      TypesConverter.toAddress(sender),
      TypesConverter.toAddress(recipient),
      amount,
      outputReference ?? 0,
    ]);
  }

  async function setChainedReferenceContents(ref: BigNumberish, value: BigNumberish): Promise<void> {
    await relayer.multicall([relayerLibrary.interface.encodeFunctionData('setChainedReferenceValue', [ref, value])]);
  }

  describe('wrapping', () => {
    const amount = fp(1);
    const yvDaiForAmount = amount.mul(fp(1)).div(yvDaiRate);

    it('should deposit underlying tokens into a yearn vault on wrap', async () => {
      const receipt = await (await relayer.connect(user).multicall([encodeWrap(yvDAI, user, user, amount)])).wait();

      expectTransferEvent(receipt, { from: user.address, to: relayer.address, value: amount }, dai);
      expectTransferEvent(receipt, { from: ZERO_ADDRESS, to: user.address, value: yvDaiForAmount }, yvDAI);
    });

    it('should leave yv tokens on the relayer, when the recipient of the wrap is the relayer', async () => {
      const receipt = await (
        await relayer.connect(user).multicall([encodeWrap(yvDAI, user, relayer.address, amount)])
      ).wait();

      expectTransferEvent(receipt, { from: user.address, to: relayer.address, value: amount }, dai);

      const balance = await yvDAI.balanceOf(relayer.address);

      expect(balance).to.be.equalWithError(yvDaiForAmount, 0.00001);
    });

    it('stores wrap output as chained reference', async () => {
      await relayer.connect(user).multicall([encodeWrap(yvDAI, user, relayer.address, amount, toChainedReference(0))]);

      await expectChainedReferenceContents(relayer, toChainedReference(0), yvDaiForAmount);
    });

    it('wraps with chained references', async () => {
      await setChainedReferenceContents(toChainedReference(0), amount);

      const receipt = await (
        await relayer.connect(user).multicall([encodeWrap(yvDAI, user, relayer.address, toChainedReference(0))])
      ).wait();

      expectTransferEvent(receipt, { from: user.address, to: relayer.address, value: amount }, dai);
      expectTransferEvent(receipt, { from: ZERO_ADDRESS, to: relayer.address, value: yvDaiForAmount }, yvDAI);
    });
  });

  describe('unwrapping', () => {
    const amount = fp(1);
    const daiForAmount = amount.mul(yvDaiRate).div(fp(1));

    sharedBeforeEach('deposit tokens to vault', async () => {
      await yvDAI.connect(user).deposit(daiForAmount, user.address);
    });

    it('should withdraw underlying tokens from a yearn vault on unwrap', async () => {
      const receipt = await (await relayer.connect(user).multicall([encodeUnwrap(yvDAI, user, user, amount)])).wait();

      expectTransferEvent(receipt, { from: user.address, to: relayer.address, value: amount }, yvDAI);
      expectTransferEvent(receipt, { from: yvDAI.address, to: user.address, value: daiForAmount }, dai);
    });

    it('should leave tokens on the relayer, when the recipient of the unwrap is the relayer', async () => {
      const receipt = await (
        await relayer.connect(user).multicall([encodeUnwrap(yvDAI, user, relayer.address, amount)])
      ).wait();

      expectTransferEvent(receipt, { from: user.address, to: relayer.address, value: amount }, yvDAI);

      const balance = await dai.balanceOf(relayer.address);

      expect(balance).to.be.equalWithError(daiForAmount, 0.00001);
    });

    it('stores unwrap output as chained reference', async () => {
      await relayer.connect(user).multicall([encodeUnwrap(yvDAI, user, relayer, amount, toChainedReference(0))]);

      await expectChainedReferenceContents(relayer, toChainedReference(0), daiForAmount);
    });
  });
});