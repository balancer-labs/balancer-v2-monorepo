import { Contract } from 'ethers';

import { bn } from '../../lib/helpers/numbers';
import { deploy } from '../../lib/helpers/deploy';
import { shouldBehaveLikeMap } from './EnumerableMap.behavior';
import { sharedBeforeEach } from '../helpers/lib/sharedBeforeEach';

describe('EnumerableMap', () => {
  describe('EnumerableUintToAddressMap', () => {
    const keys = [bn(7891), bn(451), bn(9592328)];

    const values = [
      '0x8B40ECf815AC8d53aB4AD2a00248DE77296344Db',
      '0x638141Eb8905D9A55D81610f45bC2B47120059e7',
      '0x7571A57e94F046725612f786Aa9bf44ce6b56894',
    ];

    const store: { map?: Contract } = {};

    sharedBeforeEach(async () => {
      store.map = await deploy('EnumerableUintToAddressMapMock', { args: [] });
    });

    shouldBehaveLikeMap(store as { map: Contract }, keys, values);
  });

  describe('EnumerableIERC20ToBytes32Map', () => {
    const keys = [
      '0x8B40ECf815AC8d53aB4AD2a00248DE77296344Db',
      '0x638141Eb8905D9A55D81610f45bC2B47120059e7',
      '0x7571A57e94F046725612f786Aa9bf44ce6b56894',
    ];

    const values = [
      '0x41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d',
      '0x435cd288e3694b535549c3af56ad805c149f92961bf84a1c647f7d86fc2431b4',
      '0xf2d05ec5c5729fb559780c70a93ca7b4ee2ca37f64e62fa31046b324f60d9447',
    ];

    const store: { map?: Contract } = {};

    sharedBeforeEach(async () => {
      store.map = await deploy('EnumerableIERC20ToBytes32MapMock', { args: [] });
    });

    shouldBehaveLikeMap(store as { map: Contract }, keys, values);
  });
});
