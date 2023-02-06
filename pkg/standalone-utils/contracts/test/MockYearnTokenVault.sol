// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2015, 2016, 2017 Dapphub

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

import "@balancer-labs/v2-interfaces/contracts/pool-linear/IYearnTokenVault.sol";

import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/SafeERC20.sol";
import "@balancer-labs/v2-solidity-utils/contracts/math/FixedPoint.sol";
import "@balancer-labs/v2-solidity-utils/contracts/test/TestToken.sol";

contract MockYearnTokenVault is IYearnTokenVault, TestToken {
    using SafeERC20 for IERC20;
    using FixedPoint for uint256;

    uint256 private _rate = 1e18;
    address private immutable _underlyingToken;

    constructor (
        string memory name,
        string memory symbol,
        uint8 decimals,
        IERC20 underlyingAsset
    ) TestToken(name, symbol, decimals) {
        _underlyingToken = address(underlyingAsset);
    }

    function token() external view override returns (address) {
        return _underlyingToken;
    }

    function deposit(
        uint256 amount,
        address recipient
    ) external override returns (uint256) {
        IERC20(_underlyingToken).safeTransferFrom(msg.sender, address(this), amount);
        uint256 wrappedAmount = this.toYearn(amount);
        this.mint(recipient, wrappedAmount);
        return wrappedAmount;
    }

    function withdraw(uint256 wrappedAmount, address recipient) external override returns (uint256) {
        this.burn(msg.sender, wrappedAmount);
        uint256 mainAmount = this.fromYearn(wrappedAmount);
        IERC20(_underlyingToken).safeApprove(address(this), mainAmount);
        IERC20(_underlyingToken).safeTransferFrom(address(this), recipient, mainAmount);
        return mainAmount;
    }

    function pricePerShare() external view override returns (uint256) {
        return _rate;
    }

    function setRate(uint256 newRate) external {
        _rate = newRate;
    }

    function fromYearn(uint256 wrappedAmount) external view returns (uint256) {
        return wrappedAmount.divDown(_rate);
    }

    function toYearn(uint256 mainAmount) external view returns (uint256) {
        return mainAmount.mulDown(_rate);
    }
}
