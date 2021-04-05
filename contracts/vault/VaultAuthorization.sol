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

import "../lib/openzeppelin/ReentrancyGuard.sol";
import "../lib/helpers/BalancerErrors.sol";
import "../lib/helpers/Authentication.sol";
import "../lib/helpers/EmergencyPeriod.sol";
import "../lib/helpers/BalancerErrors.sol";
import "../lib/helpers/SignaturesValidator.sol";

import "./interfaces/IVault.sol";
import "./interfaces/IAuthorizer.sol";

abstract contract VaultAuthorization is IVault, ReentrancyGuard, Authentication, SignaturesValidator, EmergencyPeriod {
    IAuthorizer private _authorizer;
    mapping(address => mapping(address => bool)) private _allowedRelayers;

    /**
     * @dev Reverts unless `user` has allowed the caller as a relayer, and the caller is allowed by the Authorizer to
     * call this function. Should only be applied to external functions.
     */
    modifier authenticateFor(address user) {
        _authenticateFor(user);
        _;
    }

    constructor(IAuthorizer authorizer) {
        _authorizer = authorizer;
    }

    function changeAuthorizer(IAuthorizer newAuthorizer) external override nonReentrant authenticate {
        _authorizer = newAuthorizer;
    }

    function getAuthorizer() external view override returns (IAuthorizer) {
        return _authorizer;
    }

    /**
     * @dev Change a relayer allowance for `msg.sender`
     */
    function changeRelayerAllowance(
        address sender,
        address relayer,
        bool allowed
    ) external override nonReentrant noEmergencyPeriod authenticateFor(sender) {
        _allowedRelayers[sender][relayer] = allowed;
    }

    function hasAllowedRelayer(address user, address relayer) external view override returns (bool) {
        return _hasAllowedRelayer(user, relayer);
    }

    /**
     * @dev Reverts unless  `user` has allowed the caller as a relayer, and the caller is allowed by the Authorizer to
     * call the entry point function.
     */
    function _authenticateFor(address user) internal {
        if (msg.sender != user) {
            _authenticateCaller();
            // Validate signature only if the user didn't grant allowance to the relayer
            if (!_hasAllowedRelayer(user, msg.sender)) {
                _validateSignature(user, Errors.USER_DOESNT_ALLOW_RELAYER);
            }
        }
    }

    /**
     * @dev Reverts unless `user` has allowed the caller as a relayer.
     */
    function _authenticateCallerFor(address user) internal view {
        _require(_hasAllowedRelayer(user, msg.sender), Errors.USER_DOESNT_ALLOW_RELAYER);
    }

    function _hasAllowedRelayer(address user, address relayer) internal view returns (bool) {
        return _allowedRelayers[user][relayer];
    }

    function _canPerform(bytes32 roleId, address user) internal view override returns (bool) {
        return _authorizer.hasRole(roleId, user);
    }
}
