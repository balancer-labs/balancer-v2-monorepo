/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {Contract, Signer, utils} from "ethers";
import {Provider} from "@ethersproject/providers";
import type {GaugeAdder, GaugeAdderInterface} from "../GaugeAdder";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IGaugeController",
        name: "gaugeController",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "enum IGaugeAdder.GaugeType",
        name: "gaugeType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "contract ILiquidityGaugeFactory",
        name: "gaugeFactory",
        type: "address",
      },
    ],
    name: "GaugeFactoryAdded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "rootGauge",
        type: "address",
      },
    ],
    name: "addArbitrumGauge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IStakingLiquidityGauge",
        name: "gauge",
        type: "address",
      },
    ],
    name: "addEthereumGauge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILiquidityGaugeFactory",
        name: "factory",
        type: "address",
      },
      {
        internalType: "enum IGaugeAdder.GaugeType",
        name: "gaugeType",
        type: "uint8",
      },
    ],
    name: "addGaugeFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "rootGauge",
        type: "address",
      },
    ],
    name: "addPolygonGauge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getActionId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuthorizer",
    outputs: [
      {
        internalType: "contract IAuthorizer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuthorizerAdaptor",
    outputs: [
      {
        internalType: "contract IAuthorizerAdaptor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum IGaugeAdder.GaugeType",
        name: "gaugeType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getFactoryForGaugeType",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum IGaugeAdder.GaugeType",
        name: "gaugeType",
        type: "uint8",
      },
    ],
    name: "getFactoryForGaugeTypeCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGaugeController",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "pool",
        type: "address",
      },
    ],
    name: "getPoolGauge",
    outputs: [
      {
        internalType: "contract ILiquidityGauge",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVault",
    outputs: [
      {
        internalType: "contract IVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "gauge",
        type: "address",
      },
      {
        internalType: "enum IGaugeAdder.GaugeType",
        name: "gaugeType",
        type: "uint8",
      },
    ],
    name: "isGaugeFromValidFactory",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class GaugeAdder__factory {
  static readonly abi = _abi;
  static createInterface(): GaugeAdderInterface {
    return new utils.Interface(_abi) as GaugeAdderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GaugeAdder {
    return new Contract(address, _abi, signerOrProvider) as GaugeAdder;
  }
}
