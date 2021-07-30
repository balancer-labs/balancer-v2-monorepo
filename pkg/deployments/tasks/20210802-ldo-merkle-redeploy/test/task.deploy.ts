import hre from 'hardhat';
import { expect } from 'chai';

import Task from '../../../src/task';

describe('MerkleRedeem', function () {
  const task = Task.fromHRE('20210802-ldo-merkle-redeploy', hre);

  it('references the vault correctly', async () => {
    const input = task.input();
    const output = task.output();

    const distributor = await task.instanceAt('MerkleRedeem', output.distributor);

    expect(await distributor.vault()).to.be.equal(input.vault);
  });

  it('references the LDO token correctly', async () => {
    const input = task.input();
    const output = task.output();

    const distributor = await task.instanceAt('MerkleRedeem', output.distributor);

    expect(await distributor.rewardToken()).to.be.equal(input.ldoToken);
  });
});
