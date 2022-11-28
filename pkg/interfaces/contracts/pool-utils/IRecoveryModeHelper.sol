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

pragma solidity >=0.7.0 <0.9.0;

/**
 * Interface for an auxiliary contract that computes Recovery Mode exits, removing logic from the core Pool contract
 * that would otherwise take up a lot of bytecode size at the cost of some slight gas overhead. Since Recovery Mode
 * exits are expected to be highly infrequent (and ideally never occur), this tradeoff makes sense.
 */
interface IRecoveryModeHelper {
    /**
     * @dev Computes a Recovery Mode Exit BPT and token amounts for a Pool. Only 'cash' balances are considered, to
     * avoid scenarios where the last LPs to attempt to exit the Pool cannot do it because only 'managed' balance
     * remains.
     *
     * The Pool is assumed to be a Composable Pool that uses ComposablePoolLib, meaning BPT will be its first token. It
     * is also assumed that there is no 'managed' balance for BPT.
     */
    function calcComposableRecoveryAmountsOut(
        bytes32 poolId,
        bytes memory userData,
        uint256 totalSupply
    ) external view returns (uint256 bptAmountIn, uint256[] memory amountsOut);
}
