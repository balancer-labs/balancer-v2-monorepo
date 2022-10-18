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

import "./lib/WeightedExitsLib.sol";
import "./lib/WeightedJoinsLib.sol";
import "./WeightedMath.sol";

/**
 * @title A contract-wrapper for WeightedMath.
 * @dev Use this contract as an external replacement for WeightedMath library.
 */
contract ExternalWeightedMath {
    /**
     * @dev See `WeightedMath._calculateInvariant`.
     */
    function calcInvariant(uint256[] memory normalizedWeights, uint256[] memory balances)
        external
        pure
        returns (uint256)
    {
        return WeightedMath._calculateInvariant(normalizedWeights, balances);
    }

    /**
     * @dev See `WeightedMath._calcOutGivenIn`.
     */
    function calcOutGivenIn(
        uint256 balanceIn,
        uint256 weightIn,
        uint256 balanceOut,
        uint256 weightOut,
        uint256 amountIn
    ) external pure returns (uint256) {
        return WeightedMath._calcOutGivenIn(balanceIn, weightIn, balanceOut, weightOut, amountIn);
    }

    /**
     * @dev See `WeightedMath._calcInGivenOut`.
     */
    function calcInGivenOut(
        uint256 balanceIn,
        uint256 weightIn,
        uint256 balanceOut,
        uint256 weightOut,
        uint256 amountOut
    ) external pure returns (uint256) {
        return WeightedMath._calcInGivenOut(balanceIn, weightIn, balanceOut, weightOut, amountOut);
    }

    /**
     * @dev See `WeightedMath._calcBptOutGivenExactTokensIn`.
     */
    function calcBptOutGivenExactTokensIn(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256[] memory amountsIn,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcBptOutGivenExactTokensIn(
                balances,
                normalizedWeights,
                amountsIn,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcBptOutGivenExactTokenIn`.
     */
    function calcBptOutGivenExactTokenIn(
        uint256 balance,
        uint256 normalizedWeight,
        uint256 amountIn,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcBptOutGivenExactTokenIn(
                balance,
                normalizedWeight,
                amountIn,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcTokenInGivenExactBptOut`.
     */
    function calcTokenInGivenExactBptOut(
        uint256 balance,
        uint256 normalizedWeight,
        uint256 bptAmountOut,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcTokenInGivenExactBptOut(
                balance,
                normalizedWeight,
                bptAmountOut,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcAllTokensInGivenExactBptOut`.
     */
    function calcAllTokensInGivenExactBptOut(
        uint256[] memory balances,
        uint256 bptAmountOut,
        uint256 totalBPT
    ) external pure returns (uint256[] memory) {
        return WeightedMath._calcAllTokensInGivenExactBptOut(balances, bptAmountOut, totalBPT);
    }

    /**
     * @dev See `WeightedMath._calcBptInGivenExactTokensOut`.
     */
    function calcBptInGivenExactTokensOut(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256[] memory amountsOut,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcBptInGivenExactTokensOut(
                balances,
                normalizedWeights,
                amountsOut,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcBptInGivenExactTokenOut`.
     */
    function calcBptInGivenExactTokenOut(
        uint256 balance,
        uint256 normalizedWeight,
        uint256 amountOut,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcBptInGivenExactTokenOut(
                balance,
                normalizedWeight,
                amountOut,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcTokenOutGivenExactBptIn`.
     */
    function calcTokenOutGivenExactBptIn(
        uint256 balance,
        uint256 normalizedWeight,
        uint256 bptAmountIn,
        uint256 bptTotalSupply,
        uint256 swapFeePercentage
    ) external pure returns (uint256) {
        return
            WeightedMath._calcTokenOutGivenExactBptIn(
                balance,
                normalizedWeight,
                bptAmountIn,
                bptTotalSupply,
                swapFeePercentage
            );
    }

    /**
     * @dev See `WeightedMath._calcTokensOutGivenExactBptIn`.
     */
    function calcTokensOutGivenExactBptIn(
        uint256[] memory balances,
        uint256 bptAmountIn,
        uint256 totalBPT
    ) external pure returns (uint256[] memory) {
        return WeightedMath._calcTokensOutGivenExactBptIn(balances, bptAmountIn, totalBPT);
    }

    /**
     * @dev See `WeightedMath._calcBptOutAddToken`.
     */
    function calcBptOutAddToken(uint256 totalSupply, uint256 normalizedWeight) external pure returns (uint256) {
        return WeightedMath._calcBptOutAddToken(totalSupply, normalizedWeight);
    }

    function joinExactTokensInForBPTOut(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256[] memory scalingFactors,
        uint256 totalSupply,
        uint256 swapFeePercentage,
        bytes memory userData
    ) external pure returns (uint256, uint256[] memory) {
        return
            WeightedJoinsLib.joinExactTokensInForBPTOut(
                balances,
                normalizedWeights,
                scalingFactors,
                totalSupply,
                swapFeePercentage,
                userData
            );
    }

    function joinTokenInForExactBPTOut(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256 totalSupply,
        uint256 swapFeePercentage,
        bytes memory userData
    ) external pure returns (uint256, uint256[] memory) {
        return
            WeightedJoinsLib.joinTokenInForExactBPTOut(
                balances,
                normalizedWeights,
                totalSupply,
                swapFeePercentage,
                userData
            );
    }

    function joinAllTokensInForExactBPTOut(
        uint256[] memory balances,
        uint256 totalSupply,
        bytes memory userData
    ) external pure returns (uint256 bptAmountOut, uint256[] memory amountsIn) {
        return WeightedJoinsLib.joinAllTokensInForExactBPTOut(balances, totalSupply, userData);
    }

    function exitExactBPTInForTokenOut(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256 totalSupply,
        uint256 swapFeePercentage,
        bytes memory userData
    ) external pure returns (uint256, uint256[] memory) {
        return
            WeightedExitsLib.exitExactBPTInForTokenOut(
                balances,
                normalizedWeights,
                totalSupply,
                swapFeePercentage,
                userData
            );
    }

    function exitExactBPTInForTokensOut(
        uint256[] memory balances,
        uint256 totalSupply,
        bytes memory userData
    ) external pure returns (uint256 bptAmountIn, uint256[] memory amountsOut) {
        return WeightedExitsLib.exitExactBPTInForTokensOut(balances, totalSupply, userData);
    }

    function exitBPTInForExactTokensOut(
        uint256[] memory balances,
        uint256[] memory normalizedWeights,
        uint256[] memory scalingFactors,
        uint256 totalSupply,
        uint256 swapFeePercentage,
        bytes memory userData
    ) external pure returns (uint256, uint256[] memory) {
        return
            WeightedExitsLib.exitBPTInForExactTokensOut(
                balances,
                normalizedWeights,
                scalingFactors,
                totalSupply,
                swapFeePercentage,
                userData
            );
    }
}
