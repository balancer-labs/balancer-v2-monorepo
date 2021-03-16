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
pragma experimental ABIEncoderV2;

import "../../lib/math/FixedPoint.sol";
import "../../lib/helpers/InputHelpers.sol";
import "../../lib/helpers/UnsafeRandom.sol";

import "../BaseGeneralPool.sol";

import "./StableMath.sol";
import "./StablePoolUserDataHelpers.sol";

contract StablePool is BaseGeneralPool, StableMath {
    using FixedPoint for uint256;
    using StablePoolUserDataHelpers for bytes;

    uint256 private immutable _amplificationParameter;

    uint256 private _lastInvariant;

    uint256 private constant _MIN_AMP = 1e18;
    uint256 private constant _MAX_AMP = 5000 * (1e18);

    uint256 private constant _MAX_STABLE_TOKENS = 5;

    bool private immutable _isBPT0;
    bool private immutable _isBPT1;
    bool private immutable _isBPT2;
    bool private immutable _isBPT3;
    bool private immutable _isBPT4;

    enum JoinKind { INIT, EXACT_TOKENS_IN_FOR_BPT_OUT, TOKEN_IN_FOR_EXACT_BPT_OUT }
    enum ExitKind { EXACT_BPT_IN_FOR_ONE_TOKEN_OUT, EXACT_BPT_IN_FOR_ALL_TOKENS_OUT, BPT_IN_FOR_EXACT_TOKENS_OUT }

    enum RoundDirection { UP, DOWN }

    constructor(
        IVault vault,
        string memory name,
        string memory symbol,
        IERC20[] memory tokens,
        bool[] memory isBPTArray,
        uint256 amplificationParameter,
        uint256 swapFee,
        uint256 emergencyPeriod,
        uint256 emergencyPeriodCheckExtension
    ) BaseGeneralPool(vault, name, symbol, tokens, swapFee, emergencyPeriod, emergencyPeriodCheckExtension) {
        require(amplificationParameter >= _MIN_AMP, "MIN_AMP");
        require(amplificationParameter <= _MAX_AMP, "MAX_AMP");

        require(tokens.length <= _MAX_STABLE_TOKENS, "MAX_STABLE_TOKENS");

        require(isBPTArray.length == tokens.length, "INVALID_IS_BPT_ARRAY");

        _amplificationParameter = amplificationParameter;

        _isBPT0 = tokens.length > 0 ? isBPTArray[0] : false;
        _isBPT1 = tokens.length > 1 ? isBPTArray[1] : false;
        _isBPT2 = tokens.length > 2 ? isBPTArray[2] : false;
        _isBPT3 = tokens.length > 3 ? isBPTArray[3] : false;
        _isBPT4 = tokens.length > 4 ? isBPTArray[4] : false;
    }

    function getAmplificationParameter() external view returns (uint256) {
        return _amplificationParameter;
    }

    // Base Pool handlers

    // Swap

    function _onSwapGivenIn(
        IPoolSwapStructs.SwapRequestGivenIn memory swapRequest,
        uint256[] memory balances,
        uint256 indexIn,
        uint256 indexOut
    ) internal view override noEmergencyPeriod returns (uint256) {
        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        uint256 amountOut = StableMath._outGivenIn(
            _amplificationParameter,
            balances,
            indexIn,
            indexOut,
            swapRequest.amountIn
        );

        return _unApplyAppreciation(amountOut, appreciations[indexOut], RoundDirection.DOWN);
    }

    function _onSwapGivenOut(
        IPoolSwapStructs.SwapRequestGivenOut memory swapRequest,
        uint256[] memory balances,
        uint256 indexIn,
        uint256 indexOut
    ) internal view override noEmergencyPeriod returns (uint256) {
        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        uint256 amountIn = StableMath._inGivenOut(
            _amplificationParameter,
            balances,
            indexIn,
            indexOut,
            swapRequest.amountOut
        );

        return _unApplyAppreciation(amountIn, appreciations[indexIn], RoundDirection.UP);
    }

    // Initialize

    function _onInitializePool(
        bytes32,
        address,
        address,
        bytes memory userData
    ) internal override noEmergencyPeriod returns (uint256, uint256[] memory) {
        StablePool.JoinKind kind = userData.joinKind();
        require(kind == StablePool.JoinKind.INIT, "UNINITIALIZED");

        uint256[] memory amountsIn = userData.initialAmountsIn();
        InputHelpers.ensureInputLengthMatch(amountsIn.length, _totalTokens);
        _upscaleArray(amountsIn, _scalingFactors());

        uint256 invariantAfterJoin = StableMath._invariant(_amplificationParameter, amountsIn);
        uint256 bptAmountOut = invariantAfterJoin;

        _lastInvariant = invariantAfterJoin;

        return (bptAmountOut, amountsIn);
    }

    // Join

    function _onJoinPool(
        bytes32,
        address,
        address,
        uint256[] memory balances,
        uint256,
        uint256 protocolSwapFeePercentage,
        bytes memory userData
    )
        internal
        override
        noEmergencyPeriod
        returns (
            uint256,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Due protocol swap fees are computed by measuring the growth of the invariant from the previous join or exit
        // event and now - the invariant's growth is due exclusively to swap fees.
        uint256[] memory dueProtocolFeeAmounts = _getDueProtocolFeeAmounts(
            balances,
            _lastInvariant,
            protocolSwapFeePercentage
        );

        // Update the balances by subtracting the protocol fees that will be charged by the Vault once this function
        // returns.
        for (uint256 i = 0; i < _totalTokens; ++i) {
            balances[i] = balances[i].sub(dueProtocolFeeAmounts[i]);
        }

        (uint256 bptAmountOut, uint256[] memory amountsIn) = _doJoin(balances, userData);

        // Update the invariant with the balances the Pool will have after the join, in order to compute the due
        // protocol swap fees in future joins and exits.
        _lastInvariant = _invariantAfterJoin(balances, amountsIn);

        return (bptAmountOut, amountsIn, dueProtocolFeeAmounts);
    }

    function _doJoin(uint256[] memory balances, bytes memory userData)
        private
        view
        returns (uint256, uint256[] memory)
    {
        JoinKind kind = userData.joinKind();

        if (kind == JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT) {
            return _joinExactTokensInForBPTOut(balances, userData);
        } else if (kind == JoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT) {
            return _joinTokenInForExactBPTOut(balances, userData);
        } else {
            revert("UNHANDLED_JOIN_KIND");
        }
    }

    function _joinExactTokensInForBPTOut(uint256[] memory balances, bytes memory userData)
        private
        view
        returns (uint256, uint256[] memory)
    {
        (uint256[] memory amountsIn, uint256 minBPTAmountOut) = userData.exactTokensInForBptOut();
        require(amountsIn.length == _totalTokens, "ERR_AMOUNTS_IN_LENGTH");

        uint256[] memory downscaledAmountsIn = amountsIn; // TODO: check that this won't be changed by pointer reference
        _upscaleArray(amountsIn, _scalingFactors());

        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(amountsIn, appreciations, RoundDirection.DOWN);
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        // No need to unapply appreciation for bptAmount
        uint256 bptAmountOut = StableMath._exactTokensInForBPTOut(
            _amplificationParameter,
            balances,
            amountsIn,
            totalSupply(),
            _swapFee
        );

        require(bptAmountOut >= minBPTAmountOut, "BPT_OUT_MIN_AMOUNT");

        return (bptAmountOut, downscaledAmountsIn);
    }

    function _joinTokenInForExactBPTOut(uint256[] memory balances, bytes memory userData)
        private
        view
        returns (uint256, uint256[] memory)
    {
        (uint256 bptAmountOut, uint256 tokenIndex) = userData.tokenInForExactBptOut();

        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        uint256 amountIn = StableMath._tokenInForExactBPTOut(
            _amplificationParameter,
            balances,
            tokenIndex,
            bptAmountOut,
            totalSupply(),
            _swapFee
        );

        // unapply appreciation
        uint256 amountInDownscaled = _unApplyAppreciation(amountIn, appreciations[tokenIndex], RoundDirection.UP);

        // We join in a single token, so we initialize downscaledAmountsIn with zeros and
        // set only downscaledAmountsIn[tokenIndex]
        uint256[] memory downscaledAmountsIn = new uint256[](_totalTokens);
        downscaledAmountsIn[tokenIndex] = amountInDownscaled;

        return (bptAmountOut, downscaledAmountsIn);
    }

    // Exit

    function _onExitPool(
        bytes32,
        address,
        address,
        uint256[] memory balances,
        uint256,
        uint256 protocolSwapFeePercentage,
        bytes memory userData
    )
        internal
        override
        returns (
            uint256,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Due protocol swap fees are computed by measuring the growth of the invariant from the previous join or exit
        // event and now - the invariant's growth is due exclusively to swap fees.\

        //TODO: do not charge fees on emercency period
        uint256[] memory dueProtocolFeeAmounts = _getDueProtocolFeeAmounts(
            balances,
            _lastInvariant,
            protocolSwapFeePercentage
        );

        // Update the balances by subtracting the protocol fees that will be charged by the Vault once this function
        // returns.
        for (uint256 i = 0; i < _totalTokens; ++i) {
            balances[i] = balances[i].sub(dueProtocolFeeAmounts[i]);
        }

        (uint256 bptAmountIn, uint256[] memory amountsOut) = _doExit(balances, userData);

        // Update the invariant with the balances the Pool will have after the exit, in order to compute the due
        // protocol swap fees in future joins and exits.
        _lastInvariant = _invariantAfterExit(balances, amountsOut);

        return (bptAmountIn, amountsOut, dueProtocolFeeAmounts);
    }

    function _doExit(uint256[] memory balances, bytes memory userData)
        private
        view
        returns (uint256, uint256[] memory)
    {
        ExitKind kind = userData.exitKind();

        if (kind == ExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT) {
            return _exitExactBPTInForTokenOut(balances, userData);
        } else if (kind == ExitKind.EXACT_BPT_IN_FOR_ALL_TOKENS_OUT) {
            return _exitExactBPTInForTokensOut(balances, userData);
        } else if (kind == ExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT) {
            return _exitBPTInForExactTokensOut(balances, userData);
        } else {
            revert("UNHANDLED_EXIT_KIND");
        }
    }

    function _exitExactBPTInForTokenOut(uint256[] memory balances, bytes memory userData)
        private
        view
        noEmergencyPeriod
        returns (uint256, uint256[] memory)
    {
        (uint256 bptAmountIn, uint256 tokenIndex) = userData.exactBptInForTokenOut();
        require(tokenIndex < _totalTokens, "OUT_OF_BOUNDS");

        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        uint256 amountOut = StableMath._exactBPTInForTokenOut(
            _amplificationParameter,
            balances,
            tokenIndex,
            bptAmountIn,
            totalSupply(),
            _swapFee
        );

        // unapply appreciation
        uint256 amountOutDownscaled = _unApplyAppreciation(amountOut, appreciations[tokenIndex], RoundDirection.DOWN);

        // We exit in a single token, so we initialize downscaledAmountsOut with zeros and
        // set only downscaledAmountsOut[tokenIndex]
        uint256[] memory downscaledAmountsOut = new uint256[](_totalTokens);
        downscaledAmountsOut[tokenIndex] = amountOutDownscaled;

        return (bptAmountIn, downscaledAmountsOut);
    }

    function _exitBPTInForExactTokensOut(uint256[] memory balances, bytes memory userData)
        private
        view
        noEmergencyPeriod
        returns (uint256, uint256[] memory)
    {
        (uint256[] memory amountsOut, uint256 maxBPTAmountIn) = userData.bptInForExactTokensOut();
        require(amountsOut.length == _totalTokens, "ERR_AMOUNTS_IN_LENGTH");

        // TODO: check that this won't be changed by pointer reference
        uint256[] memory downscaledAmountsOut = amountsOut;
        _upscaleArray(amountsOut, _scalingFactors());

        // apply appreciations if applicable
        uint256[] memory appreciations = _getUnderlyingTokensAppreciations();
        _applyAppreciations(amountsOut, appreciations, RoundDirection.UP);
        _applyAppreciations(balances, appreciations, RoundDirection.UP);

        // No need to unapply appreciation for bptAmount
        uint256 bptAmountIn = StableMath._bptInForExactTokensOut(
            _amplificationParameter,
            balances,
            amountsOut,
            totalSupply(),
            _swapFee
        );

        require(bptAmountIn <= maxBPTAmountIn, "BPT_OUT_MIN_AMOUNT");

        return (bptAmountIn, downscaledAmountsOut);
    }

    /**
     * @dev Note we are not tagging this function with `noEmergencyPeriod` to allow users exit in a proportional
     * manner in case there is an emergency in the pool. This operation should never be restricted.
     */
    function _exitExactBPTInForTokensOut(uint256[] memory balances, bytes memory userData)
        private
        view
        returns (uint256, uint256[] memory)
    {
        uint256 bptAmountIn = userData.exactBptInForTokensOut();

        // No need to apply appreciations as all is proportional

        uint256[] memory amountsOut = StableMath._exactBPTInForTokensOut(balances, bptAmountIn, totalSupply());

        return (bptAmountIn, amountsOut);
    }

    // Helpers

    function _getDueProtocolFeeAmounts(
        uint256[] memory balances,
        uint256 previousInvariant,
        uint256 protocolSwapFeePercentage
    ) private view returns (uint256[] memory) {
        // Instead of paying the protocol swap fee in all tokens proportionally, we will pay it in a single one. This
        // will reduce gas costs for single asset joins and exits, as at most only two Pool balances will change (the
        // token joined/exited, and the token in which fees will be paid).

        // The token fees is paid in is chosen pseudo-randomly, with the hope to achieve a uniform distribution across
        // multiple joins and exits. This pseudo-randomness being manipulated is not an issue.
        uint256 chosenTokenIndex = UnsafeRandom.rand(_totalTokens);

        // Initialize with zeros
        uint256[] memory dueProtocolFeeAmounts = new uint256[](_totalTokens);
        // Set the fee to pay in the selected token
        dueProtocolFeeAmounts[chosenTokenIndex] = StableMath._calculateDueTokenProtocolSwapFee(
            _amplificationParameter,
            balances,
            previousInvariant,
            chosenTokenIndex,
            protocolSwapFeePercentage
        );

        return dueProtocolFeeAmounts;
    }

    function _invariantAfterJoin(uint256[] memory balances, uint256[] memory amountsIn) private view returns (uint256) {
        for (uint256 i = 0; i < _totalTokens; ++i) {
            balances[i] = balances[i].add(amountsIn[i]);
        }

        return StableMath._invariant(_amplificationParameter, balances);
    }

    function _invariantAfterExit(uint256[] memory balances, uint256[] memory amountsOut)
        private
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < _totalTokens; ++i) {
            balances[i] = balances[i].sub(amountsOut[i]);
        }

        return StableMath._invariant(_amplificationParameter, balances);
    }

    // This function returns a list with the appreciation of all underlying tokens,
    // if the token has not an appreciation, it's set to 1
    function _getUnderlyingTokensAppreciations() internal view returns (uint256[] memory appreciations) {
        appreciations = new uint256[](_totalTokens);

        // prettier-ignore
        {
            if (_totalTokens > 0) { 
                appreciations[0] = _isBPT0?  
                FixedPoint.ONE : BaseGeneralPool(address(_token0)).getBPTAppreciation(); 
            } else { return appreciations; }
            if (_totalTokens > 1) { 
                appreciations[1] = _isBPT1?  
                FixedPoint.ONE : BaseGeneralPool(address(_token1)).getBPTAppreciation(); 
            } else { return appreciations; }
            if (_totalTokens > 2) { 
                appreciations[2] = _isBPT2?  
                FixedPoint.ONE : BaseGeneralPool(address(_token2)).getBPTAppreciation(); 
            } else { return appreciations; }
            if (_totalTokens > 3) { 
                appreciations[3] = _isBPT3?  
                FixedPoint.ONE : BaseGeneralPool(address(_token3)).getBPTAppreciation(); 
            } else { return appreciations; }
            if (_totalTokens > 4) { 
                appreciations[4] = _isBPT4?  
                FixedPoint.ONE : BaseGeneralPool(address(_token4)).getBPTAppreciation(); 
            } else { return appreciations; }
        }

        return appreciations;
    }

    //TODO: does it need rounding? it may do not need rounding up or down since appreciation is
    // always going to be in the order of magnitude of 1

    function _applyAppreciation(
        uint256 amount,
        uint256 appreciation,
        RoundDirection roundDirection
    ) internal pure returns (uint256) {
        return roundDirection == RoundDirection.UP ? amount.mulUp(appreciation) : amount.mulDown(appreciation);
    }

    function _applyAppreciations(
        uint256[] memory amounts,
        uint256[] memory appreciations,
        RoundDirection roundDirection
    ) internal view {
        for (uint256 i = 0; i < _totalTokens; ++i) {
            amounts[i] = roundDirection == RoundDirection.UP
                ? amounts[i].mulUp(appreciations[i])
                : amounts[i].mulDown(appreciations[i]);
        }
    }

    function _unApplyAppreciations(
        uint256[] memory amounts,
        uint256[] memory appreciations,
        RoundDirection roundDirection
    ) internal view {
        for (uint256 i = 0; i < _totalTokens; ++i) {
            amounts[i] = roundDirection == RoundDirection.UP
                ? amounts[i].divUp(appreciations[i])
                : amounts[i].divDown(appreciations[i]);
        }
    }

    function _unApplyAppreciation(
        uint256 amount,
        uint256 appreciation,
        RoundDirection roundDirection
    ) internal pure returns (uint256) {
        return roundDirection == RoundDirection.UP ? amount.divUp(appreciation) : amount.divDown(appreciation);
    }

    // This function returns the appreciation of one BPT relative to the
    // underlying tokens. This starts at 1 when the pool is created and grows over time
    // It's the equivalent to Curve's get_virtual_price() function
    function getBPTAppreciation() public view override returns (uint256) {
        (, uint256[] memory balances) = _vault.getPoolTokens(_poolId);
        return StableMath._invariant(_amplificationParameter, balances).div(totalSupply());
    }
}
