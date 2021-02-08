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
pragma experimental ABIEncoderV2;

import "./IBasePool.sol";
import "./IPoolSwapStructs.sol";

/**
 * @dev Interface contracts for Pools with the minimal swap info or two token specialization settings should implement.
 */
interface IMinimalSwapInfoPool is IBasePool {
    /**
     * @dev Called by the Vault when a user calls `IVault.batchSwapGivenIn` to swap with this Pool. Returns the number
     * of tokens the Pool will grant to the user as part of the swap.
     *
     * This can be often implemented by a `view` function, since many pricing algorithms don't need to track state
     * changes in swaps. However, contracts implementing this in non-view functions should check that the caller is
     * indeed the Vault.
     */
    function onSwapGivenIn(
        IPoolSwapStructs.SwapRequestGivenIn calldata swapRequest,
        uint256 currentBalanceTokenIn,
        uint256 currentBalanceTokenOut
    ) external returns (uint256 amountOut);

    /**
     * @dev Called by the Vault when a user calls `IVault.batchSwapGivenOut` to swap with this Pool. Returns the number
     * of tokens the user must grant to the Pool as part of the swap.
     *
     * This can be often implemented by a `view` function, since many pricing algorithms don't need to track state
     * changes in swaps. However, contracts implementing this in non-view functions should check that the caller is
     * indeed the Vault.
     */
    function onSwapGivenOut(
        IPoolSwapStructs.SwapRequestGivenOut calldata swapRequest,
        uint256 currentBalanceTokenIn,
        uint256 currentBalanceTokenOut
    ) external returns (uint256 amountIn);
}
