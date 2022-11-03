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

import "@balancer-labs/v2-interfaces/contracts/pool-linear/IIdleTokenV3_1.sol";

import "@balancer-labs/v2-solidity-utils/contracts/math/FixedPoint.sol";
import "@balancer-labs/v2-solidity-utils/contracts/test/TestToken.sol";
import "@balancer-labs/v2-solidity-utils/contracts/math/Math.sol";

contract MockIdleTokenV3_1 is TestToken, IIdleTokenV3_1 {
    using FixedPoint for uint256;

    // rate of assets per share scaled to 1e18
    uint256 private _rate = 1e18;
    uint256 private _scaleAssetsToFP;
    uint256 private _scaleSharesToFP;
    uint256 private _totalAssets;
    address private immutable _asset;
    address private immutable _vaultAddress;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address asset
    ) TestToken(name, symbol, decimals) {
        _asset = asset;
        _vaultAddress = address(0x00000000000000000001);

        uint256 assetDecimals = TestToken(asset).decimals();
        uint256 assetDecimalsDifference = Math.sub(18, assetDecimals);
        _scaleAssetsToFP = FixedPoint.ONE * 10**assetDecimalsDifference;

        uint256 shareDecimalsDifference = Math.sub(18, uint256(decimals));
        _scaleSharesToFP = FixedPoint.ONE * 10**shareDecimalsDifference;
    }

    // IMPORTANT: the rate must have the same number of decimals than the MAIN TOKEN.
    function setRate(uint256 newRate) external {
        _rate = newRate;
    }

    function totalAssets() external view override returns (uint256) {
        return _totalAssets;
    }

    function token() external view override returns (address) {
        return _asset;
    }

    function tokenPrice() external view override returns (uint256) {
        return _rate;
    }

    function mintIdleToken(
        uint256 _amount,
        bool,
        address
    ) external override returns (uint256) {
        uint256 shares = _convertToShares(_amount);
        _mint(_vaultAddress, shares);
        _totalAssets = _totalAssets.add(_amount);
        return shares;
    }

    function redeemIdleToken(uint256 _amount) external override returns (uint256 redeemedTokens) {
        uint256 assets = _convertToAssets(_amount);
        _burn(_vaultAddress, _amount);
        _totalAssets = _totalAssets.sub(assets);
        return assets;
    }

    function _convertToAssets(uint256 shares) private view returns (uint256) {
        uint256 assetsInShareDecimals = shares.mulDown(_rate);
        uint256 assets = assetsInShareDecimals.mulDown(_scaleSharesToFP).divDown(_scaleAssetsToFP);
        return assets;
    }

    function _convertToShares(uint256 assets) private view returns (uint256) {
        uint256 sharesInAssetDecimals = assets.divDown(_rate);
        uint256 shares = sharesInAssetDecimals.mulDown(_scaleAssetsToFP).divDown(_scaleSharesToFP);
        return shares;
    }
}
