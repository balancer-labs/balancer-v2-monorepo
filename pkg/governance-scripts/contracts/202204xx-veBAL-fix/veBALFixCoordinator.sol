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

import "@balancer-labs/v2-solidity-utils/contracts/openzeppelin/ReentrancyGuard.sol";
import "@balancer-labs/v2-vault/contracts/interfaces/IVault.sol";

import "@balancer-labs/v2-liquidity-mining/contracts/interfaces/IAuthorizerAdaptor.sol";
import "@balancer-labs/v2-liquidity-mining/contracts/interfaces/IGaugeAdder.sol";
import "@balancer-labs/v2-liquidity-mining/contracts/interfaces/IGaugeController.sol";
import "@balancer-labs/v2-liquidity-mining/contracts/interfaces/ISingleRecipientGauge.sol";
import "@balancer-labs/v2-liquidity-mining/contracts/interfaces/IBalancerTokenAdmin.sol";

import "@balancer-labs/v2-standalone-utils/contracts/interfaces/IBALTokenHolder.sol";

/**
 * @dev The currently deployed Authorizer has a different interface relative to the Authorizer in the monorepo
 * for granting/revoking roles(referred to as permissions in the new Authorizer) and so we require a one-off interface
 */
interface ICurrentAuthorizer is IAuthorizer {
    // solhint-disable-next-line func-name-mixedcase
    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);

    function grantRole(bytes32 role, address account) external;

    function revokeRole(bytes32 role, address account) external;
}

// solhint-disable-next-line contract-name-camelcase
contract veBALFixCoordinator is ReentrancyGuard {
    IVault private immutable _vault;
    IAuthorizerAdaptor private immutable _authorizerAdaptor;
    IGaugeController private immutable _gaugeController;
    IBalancerTokenAdmin private immutable _balancerTokenAdmin;

    address public constant BAL_MINT_RECIPIENT = address(0);

    // Weekly emissions are 145k BAL. Recall that BAL has 18 decimals.

    uint256 public constant VEBAL_BAL_MINT_AMOUNT = 29e18; // 2 weeks worth of 10% of emissions
    uint256 public constant ARBITRUM_BAL_MINT_AMOUNT = 20300e15; // 2 weeks worth of 7% of emissions
    uint256 public constant POLYGON_BAL_MINT_AMOUNT = 49600e15; // 2 weeks worth of 17% of emissions

    // The total amount of BAL to mint is 29k + 20.3k + 49.6k = 98.6k

    enum DeploymentStage { PENDING, FIRST_STAGE_DONE }

    uint256 public firstStageActivationTime;

    DeploymentStage private _currentDeploymentStage;

    constructor(
        IAuthorizerAdaptor authorizerAdaptor,
        IBalancerTokenAdmin balancerTokenAdmin,
        IGaugeController gaugeController
    ) {
        _currentDeploymentStage = DeploymentStage.PENDING;

        IVault vault = authorizerAdaptor.getVault();
        _vault = vault;
        _authorizerAdaptor = authorizerAdaptor;
        _balancerTokenAdmin = balancerTokenAdmin;
        _gaugeController = gaugeController;
    }

    /**
     * @notice Returns the Balancer Vault.
     */
    function getVault() public view returns (IVault) {
        return _vault;
    }

    /**
     * @notice Returns the Balancer Vault's current authorizer.
     */
    function getAuthorizer() public view returns (ICurrentAuthorizer) {
        return ICurrentAuthorizer(address(getVault().getAuthorizer()));
    }

    function getAuthorizerAdaptor() public view returns (IAuthorizerAdaptor) {
        return _authorizerAdaptor;
    }

    function getCurrentDeploymentStage() external view returns (DeploymentStage) {
        return _currentDeploymentStage;
    }

    function performFirstStage() external nonReentrant {
        // Check internal state
        require(_currentDeploymentStage == DeploymentStage.PENDING, "First step already performed");

        // Check external state: we need admin permission on the Authorizer
        ICurrentAuthorizer authorizer = getAuthorizer();
        require(authorizer.canPerform(bytes32(0), address(this), address(0)), "Not Authorizer admin");

        // Step 1: Deprecate the LM committee gauge type on the GaugeController.
        _deprecateLMCommittee();

        // Step 2: Mint BAL which was to be distributed to Polygon and Arbitrum LPs to a multisig for distribution.
        _mintMissingBAL();

        firstStageActivationTime = block.timestamp;
        _currentDeploymentStage = DeploymentStage.FIRST_STAGE_DONE;
    }

    function _deprecateLMCommittee() private {
        ICurrentAuthorizer authorizer = getAuthorizer();

        // The LM committee has been deprecated so we set the type weight to zero and kill the relevant gauge

        bytes32 changeTypeWeightRole = _authorizerAdaptor.getActionId(IGaugeController.change_type_weight.selector);
        authorizer.grantRole(changeTypeWeightRole, address(this));

        _setGaugeTypeWeight(IGaugeAdder.GaugeType.LiquidityMiningCommittee, 0);

        authorizer.revokeRole(changeTypeWeightRole, address(this));

        address lmCommitteeGauge = 0x7AA5475b2eA29a9F4a1B9Cf1cB72512D1B4Ab75e;
        require(
            streq(
                IBALTokenHolder(ISingleRecipientGauge(lmCommitteeGauge).getRecipient()).getName(),
                "Liquidity Mining Committee BAL Holder"
            )
        );

        bytes32 killGaugeRole = _authorizerAdaptor.getActionId(ILiquidityGauge.killGauge.selector);
        authorizer.grantRole(killGaugeRole, address(this));

        _killGauge(lmCommitteeGauge);

        authorizer.revokeRole(killGaugeRole, address(this));
    }

    function _mintMissingBAL() private {
        ICurrentAuthorizer authorizer = getAuthorizer();

        // Mint BAL necessary to make veBAL holders and Polygon and Arbitrum LPs whole.
        // See: https://forum.balancer.fi/t/decide-on-gauge-unexpected-behavior/2960#keeping-promises-13

        IBALTokenHolder veBALHolder = IBALTokenHolder(0x3C1d00181ff86fbac0c3C52991fBFD11f6491D70);
        require(streq(veBALHolder.getName(), "Temporary veBAL Liquidity Mining BAL Holder"));

        IBALTokenHolder arbitrumHolder = IBALTokenHolder(0x0C925fcE89a22E36EbD9B3C6E0262234E853d2F6);
        require(streq(arbitrumHolder.getName(), "Temporary Arbitrum Liquidity Mining BAL Holder"));

        IBALTokenHolder polygonHolder = IBALTokenHolder(0x98087bf6A5CA828a6E09391aCE674DBaBB6a4C56);
        require(streq(polygonHolder.getName(), "Temporary Polygon Liquidity Mining BAL Holder"));

        bytes32 mintBALRole = _balancerTokenAdmin.getActionId(IBalancerTokenAdmin.mint.selector);

        authorizer.grantRole(mintBALRole, address(this));

        _balancerTokenAdmin.mint(address(veBALHolder), VEBAL_BAL_MINT_AMOUNT);
        _balancerTokenAdmin.mint(address(arbitrumHolder), ARBITRUM_BAL_MINT_AMOUNT);
        _balancerTokenAdmin.mint(address(polygonHolder), POLYGON_BAL_MINT_AMOUNT);

        authorizer.revokeRole(mintBALRole, address(this));
    }

    function _killGauge(address gauge) private {
        getAuthorizerAdaptor().performAction(gauge, abi.encodeWithSelector(ILiquidityGauge.killGauge.selector));
    }

    function _setGaugeTypeWeight(IGaugeAdder.GaugeType typeId, uint256 weight) private {
        getAuthorizerAdaptor().performAction(
            address(_gaugeController),
            abi.encodeWithSelector(IGaugeController.change_type_weight.selector, int128(typeId), weight)
        );
    }

    function streq(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
