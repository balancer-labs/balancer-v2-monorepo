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

pragma solidity ^0.7.1;

import "./IPairTradingStrategy.sol";
import "../math/FixedPoint.sol";

contract ConstantWeightedProdStrategy is IPairTradingStrategy, FixedPoint {
    uint8 public constant MIN_TOKENS = 2;
    uint8 public constant MAX_TOKENS = 16;
    uint8 public constant MIN_WEIGHT = 1;
    uint256 internal constant DECIMALS = 10**16; // 16 decimal places
    
    uint256 immutable weights; // 8 32-byte weights packed together. index 0 is LSB and index 7 is MSB
    uint8 immutable totalTokens;

    constructor(uint256 _weights, uint8 _totalTokens) {
        require(_totalTokens >= MIN_TOKENS, "ERR_MIN_TOKENS");
        require(_totalTokens <= MAX_TOKENS, "ERR_MAX_TOKENS");
        for (uint8 index = 0; index < _totalTokens; index++) {
            uint8 shift = index * MAX_TOKENS;
            require(
                shiftWeights(_weights, shift) >= MIN_WEIGHT,
                "ERR_MIN_WEIGHT"
            );
        }
        weights = _weights;
        totalTokens = _totalTokens;
    }

    function getTotalTokens() external view returns (uint8) {
        return totalTokens;
    }

    function shiftWeights(uint256 _weights, uint8 shift)
        internal
        pure
        returns (uint256)
    {
        return ((_weights & (0xFFFF << shift)) >> shift);
    }

    function getWeight(uint8 index) public view returns (uint256) {
        require(index < totalTokens, "ERR_INVALID_INDEX");
        uint8 shift = index * MAX_TOKENS;
        return shiftWeights(weights, shift) * DECIMALS;
    }

    function calculateOutGivenIn(
        uint8 tokenIndexIn,
        uint8 tokenIndexOut,
        uint256 tokenBalanceIn,
        uint256 tokenBalanceOut,
        uint256 tokenAmountIn
    ) internal view returns (uint256) {
        uint256 quotient = div(
            tokenBalanceIn,
            add(tokenBalanceIn, tokenAmountIn)
        );

        uint256 weightRatio = div(
            getWeight(tokenIndexIn),
            getWeight(tokenIndexOut)
        );
        uint256 ratio = sub(ONE, pow(quotient, weightRatio));
        return mul(tokenBalanceOut, ratio);
    }

    function validatePair(
        bytes32 poolId,
        uint8 tokenIndexIn,
        uint8 tokenIndexOut,
        uint256 tokenBalanceIn,
        uint256 tokenBalanceOut,
        uint256 tokenAmountIn,
        uint256 tokenAmountOut
    ) external override view returns (bool) {
        //Calculate out amount given in
        uint256 _tokenAmountOut = calculateOutGivenIn(
            tokenIndexIn,
            tokenIndexOut,
            tokenBalanceIn,
            tokenBalanceOut,
            tokenAmountIn
        );

        return _tokenAmountOut >= tokenAmountOut;
    }
}
