import Task from '../../src/task';

export type BatchRelayerDeployment = {
  Vault: string;
};

const Vault = new Task('20210418-vault');

export default {
  Vault,
};
