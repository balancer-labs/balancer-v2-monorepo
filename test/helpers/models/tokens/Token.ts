import { BigNumber, Contract, ContractTransaction } from 'ethers';

import { MAX_UINT256 } from '../../../../lib/helpers/constants';
import { BigNumberish } from '../../../../lib/helpers/numbers';

import TokensDeployer from './TokensDeployer';
import TypesConverter from '../types/TypesConverter';
import { Account, TxParams } from '../types/types';
import { RawTokenDeployment } from './types';

export default class Token {
  name: string;
  symbol: string;
  decimals: number;
  instance: Contract;

  static async create(params: RawTokenDeployment): Promise<Token> {
    return TokensDeployer.deployToken(params);
  }

  constructor(name: string, symbol: string, decimals: number, instance: Contract) {
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.instance = instance;
  }

  get address(): string {
    return this.instance.address;
  }

  async balanceOf(account: Account): Promise<BigNumber> {
    return this.instance.balanceOf(TypesConverter.toAddress(account));
  }

  async mint(to: Account, amount?: BigNumberish, { from }: TxParams = {}): Promise<ContractTransaction> {
    const token = from ? this.instance.connect(from) : this.instance;
    return token.mint(TypesConverter.toAddress(to), amount ?? MAX_UINT256);
  }

  async approve(to: Account, amount?: BigNumberish, { from }: TxParams = {}): Promise<ContractTransaction> {
    const token = from ? this.instance.connect(from) : this.instance;
    return token.approve(TypesConverter.toAddress(to), amount ?? MAX_UINT256);
  }

  async burn(amount: BigNumberish, { from }: TxParams = {}): Promise<ContractTransaction> {
    const token = from ? this.instance.connect(from) : this.instance;
    return token.burn(amount);
  }

  compare(anotherToken: Token): number {
    return this.address.toLowerCase() > anotherToken.address.toLowerCase() ? 1 : -1;
  }
}
