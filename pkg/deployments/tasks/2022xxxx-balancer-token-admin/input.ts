import Task from '../../src/task';

export type BalancerTokenAdminDeployment = {
  BAL: string;
  Vault: string;
};

const BAL = '0xba100000625a3754423978a60c9317c58a424e3D';
const Vault = new Task('20210418-vault');

export default {
  BAL,
  Vault,
};
