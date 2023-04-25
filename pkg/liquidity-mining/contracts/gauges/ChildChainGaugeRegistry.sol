// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.7.0;

import "@balancer-labs/v2-interfaces/contracts/liquidity-mining/ILiquidityGaugeFactory.sol";
import "@balancer-labs/v2-interfaces/contracts/liquidity-mining/IChildChainGauge.sol";

import "@balancer-labs/v2-solidity-utils/contracts/helpers/SingletonAuthentication.sol";
import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/EnumerableSet.sol";

import "../L2BalancerPseudoMinter.sol";

contract ChildChainGaugeRegistry is SingletonAuthentication {
    using EnumerableSet for EnumerableSet.AddressSet;

    L2BalancerPseudoMinter private immutable _l2BalancerPseudoMinter;
    ILiquidityGaugeFactory private immutable _liquidityGaugeFactory;

    EnumerableSet.AddressSet private _gauges;

    event GaugeAdded(IChildChainGauge indexed gauge);
    event GaugeRemoved(IChildChainGauge indexed gauge);

    constructor(
        IVault vault,
        L2BalancerPseudoMinter l2BalancerPseudoMinter,
        ILiquidityGaugeFactory liquidityGaugeFactory
    ) SingletonAuthentication(vault) {
        _l2BalancerPseudoMinter = l2BalancerPseudoMinter;
        _liquidityGaugeFactory = liquidityGaugeFactory;
    }

    function addGauge(IChildChainGauge gauge) external authenticate {
        // Check that the gauge is valid
        // 1. The gauge's factory is registered with the L2BalancerPseudoMinter
        // 2. The gauge is deployed from the registered factory
        ILiquidityGaugeFactory factory = gauge.factory();
        require(_l2BalancerPseudoMinter.isValidGaugeFactory(factory), "INVALID_GAUGE_FACTORY");
        require(factory.isGaugeFromFactory(address(gauge)), "GAUGE_NOT_FROM_FACTORY`");

        require(_gauges.add(address(gauge)), "GAUGE_ALREADY_REGISTERED");

        emit GaugeAdded(gauge);
    }

    function removeGauge(IChildChainGauge gauge) external authenticate {
        require(_gauges.remove(address(gauge)), "GAUGE_NOT_REGISTERED");

        emit GaugeRemoved(gauge);
    }

    function totalGauges() external view returns (uint256) {
        return _gauges.length();
    }

    function getGauges(uint256 startIndex, uint256 endIndex) external view returns (IChildChainGauge[] memory) {
        require(startIndex < endIndex, "INVALID_INDICES");
        require(endIndex <= _gauges.length(), "END_INDEX_OUT_OF_BOUNDS");

        uint256 size = endIndex - startIndex;
        IChildChainGauge[] memory slicedGauges = new IChildChainGauge[](size);

        for (uint256 i = 0; i < size; i++) {
            slicedGauges[i] = IChildChainGauge(_gauges.at(startIndex + i));
        }

        return slicedGauges;
    }
}