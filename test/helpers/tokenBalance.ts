import { Contract, BigNumber } from 'ethers';
import { TokenList } from './tokens';
import { Dictionary } from 'lodash';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

// Ported from @openzeppelin/test-helpers to use with ERC20 tokens and Ethers

type Account = string | SignerWithAddress | Contract;
export type BigNumberish = string | number | BigNumber;
type CompareFunction = 'equal' | 'eq' | 'above' | 'gt' | 'gte' | 'below' | 'lt' | 'lte' | 'least' | 'most' | 'near';
export type Comparison = [CompareFunction, BigNumberish];

interface BalanceChange {
  account: Account;
  changes?: Dictionary<BigNumberish | Comparison>;
}

class ERC20BalanceTracker {
  private prev: BigNumber | undefined;

  constructor(private address: string, private token: Contract) {}

  // returns the current token balance
  async get(): Promise<BigNumber> {
    this.prev = await this.currentBalance();
    return this.prev;
  }

  // returns the balance difference between the current one and the
  // last call to get or delta
  async delta(): Promise<BigNumber> {
    const balance = await this.currentBalance();

    if (this.prev == undefined) {
      throw new Error('Tracker.get must be called before Tracker.delta');
    }

    const delta = balance.sub(this.prev);
    this.prev = balance;

    return delta;
  }

  async currentBalance(): Promise<BigNumber> {
    return this.token.balanceOf(this.address);
  }
}

function accountToAddress(account: Account): string {
  return typeof account == 'string' ? account : account.address;
}

// Creates an initializes a balance tracker. Constructors cannot be async (and therefore get cannot
// be called there), so we have this helper method.
export async function balanceTracker(address: string, token: Contract): Promise<ERC20BalanceTracker> {
  const tracker = new ERC20BalanceTracker(address, token);
  await tracker.get();
  return tracker;
}

// Measures the ERC20 balance of an account for multiple tokens before and after an async operation (which
// presumably involves Ethereum transactions), and then compares the deltas to a list of expected changes.
// `tokens` can be obtained by calling `tokens.deployTokens`. Any token not specified in `balanceChanges`
// is expected to have no balance change.
//
// Sample usage, trading 50 USDC in exchange for 50 DAI
//
// await expectBalanceChange(
//   uniswap.swap('USDC', 'DAI', 50),
//   tokens,
//   { account, changes: { 'DAI': 50, 'USDC': -50 } }
// });
//
// Checks other than equality can also be performed by passing a comparison and value tuple.
//
// await expectBalanceChange(
//   uniswap.swap('USDC', 'DAI', 50),
//   tokens,
//   { account, changes: { 'DAI': 50, 'USDC': -50, 'UNI': ['gt', 0] } } // Earn an unknown amount of UNI
// });

export async function expectBalanceChange(
  promise: () => Promise<unknown>,
  tokens: TokenList,
  balanceChange: BalanceChange | Array<BalanceChange>
): Promise<void> {
  const trackers: Dictionary<Dictionary<ERC20BalanceTracker>> = {};
  const balanceChanges: Array<BalanceChange> = Array.isArray(balanceChange) ? balanceChange : [balanceChange];

  for (const { account } of balanceChanges) {
    const address = accountToAddress(account);
    trackers[address] = {};

    for (const symbol in tokens) {
      const token = tokens[symbol];
      trackers[address][symbol] = await balanceTracker(address, token);
    }
  }

  await promise();

  for (const { account, changes } of balanceChanges) {
    const address = accountToAddress(account);
    const accountTrackers = trackers[address];

    for (const symbol in tokens) {
      const delta = await accountTrackers[symbol].delta();

      const change = (changes || {})[symbol];
      if (change === undefined) {
        expect(delta, `Expected ${delta} ${symbol} to be zero`).to.equal(0);
      } else {
        const compare: CompareFunction = Array.isArray(change) ? change[0] : 'equal';
        const value = BigNumber.from((Array.isArray(change) ? change[1] : change).toString());

        if (compare == 'near') {
          expect(delta).to.be.at.least(value.sub(value.div(10)));
          expect(delta).to.be.at.most(value.add(value.div(10)));
        } else {
          const errorMessage = `Expected ${delta} ${symbol} to be ${compare} ${value} ${symbol}`;
          expect(delta, errorMessage).to[compare](value.toString());
        }
      }
    }
  }
}
