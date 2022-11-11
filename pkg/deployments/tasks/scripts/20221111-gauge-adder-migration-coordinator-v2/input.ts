import Task, { TaskMode } from '../../../src/task';

export type GaugeAdderMigrationCoordinatorDeployment = {
  OldGaugeAdder: string;
  ArbitrumRootGaugeFactory: string;
  OptimismRootGaugeFactory: string;
  LiquidityMiningMultisig: string;
  GaugeCheckpointingMultisig: string;
};

const OldGaugeAdder = new Task('20220628-gauge-adder-v2', TaskMode.READ_ONLY);

const ArbitrumRootGaugeFactory = new Task('20220413-arbitrum-root-gauge-factory', TaskMode.READ_ONLY);
const OptimismRootGaugeFactory = new Task('20220628-optimism-root-gauge-factory', TaskMode.READ_ONLY);

const LiquidityMiningMultisig = '0xc38c5f97b34e175ffd35407fc91a937300e33860';
const GaugeCheckpointingMultisig = '0x02f35dA6A02017154367Bc4d47bb6c7D06C7533B';

export default {
  mainnet: {
    OldGaugeAdder: OldGaugeAdder.output({ network: 'mainnet' }).GaugeAdder,
    ArbitrumRootGaugeFactory,
    OptimismRootGaugeFactory,
    LiquidityMiningMultisig,
    GaugeCheckpointingMultisig,
  },
};