/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import {BytesLike} from "@ethersproject/bytes";
import {Listener, Provider} from "@ethersproject/providers";
import {FunctionFragment, EventFragment, Result} from "@ethersproject/abi";
import {TypedEventFilter, TypedEvent, TypedListener} from "./commons";

interface BatchRelayerLibraryInterface extends ethers.utils.Interface {
  functions: {
    "approveVault(address,uint256)": FunctionFragment;
    "batchSwap(uint8,tuple[],address[],tuple,int256[],uint256,uint256,tuple[])": FunctionFragment;
    "exitPool(bytes32,uint8,address,address,tuple,tuple[])": FunctionFragment;
    "getEntrypoint()": FunctionFragment;
    "getVault()": FunctionFragment;
    "joinPool(bytes32,uint8,address,address,tuple,uint256,uint256)": FunctionFragment;
    "manageUserBalance(tuple[],uint256)": FunctionFragment;
    "setRelayerApproval(address,bool,bytes)": FunctionFragment;
    "stakeETH(address,uint256,uint256)": FunctionFragment;
    "stakeETHAndWrap(address,uint256,uint256)": FunctionFragment;
    "swap(tuple,tuple,uint256,uint256,uint256,uint256)": FunctionFragment;
    "unwrapAaveStaticToken(address,address,address,uint256,bool,uint256)": FunctionFragment;
    "unwrapERC4626(address,address,address,uint256,uint256)": FunctionFragment;
    "unwrapUnbuttonToken(address,address,address,uint256,uint256)": FunctionFragment;
    "unwrapWstETH(address,address,uint256,uint256)": FunctionFragment;
    "vaultPermit(address,address,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
    "vaultPermitDAI(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)": FunctionFragment;
    "wrapAaveDynamicToken(address,address,address,uint256,bool,uint256)": FunctionFragment;
    "wrapERC4626(address,address,address,uint256,uint256)": FunctionFragment;
    "wrapStETH(address,address,uint256,uint256)": FunctionFragment;
    "wrapUnbuttonToken(address,address,address,uint256,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "approveVault",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "batchSwap",
    values: [
      BigNumberish,
      {
        poolId: BytesLike;
        assetInIndex: BigNumberish;
        assetOutIndex: BigNumberish;
        amount: BigNumberish;
        userData: BytesLike;
      }[],
      string[],
      {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      BigNumberish[],
      BigNumberish,
      BigNumberish,
      {index: BigNumberish; key: BigNumberish}[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exitPool",
    values: [
      BytesLike,
      BigNumberish,
      string,
      string,
      {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      {index: BigNumberish; key: BigNumberish}[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getEntrypoint",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getVault", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "joinPool",
    values: [
      BytesLike,
      BigNumberish,
      string,
      string,
      {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "manageUserBalance",
    values: [
      {
        kind: BigNumberish;
        asset: string;
        amount: BigNumberish;
        sender: string;
        recipient: string;
      }[],
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setRelayerApproval",
    values: [string, boolean, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeETH",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeETHAndWrap",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      {
        poolId: BytesLike;
        kind: BigNumberish;
        assetIn: string;
        assetOut: string;
        amount: BigNumberish;
        userData: BytesLike;
      },
      {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapAaveStaticToken",
    values: [string, string, string, BigNumberish, boolean, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapERC4626",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapUnbuttonToken",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapWstETH",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "vaultPermit",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "vaultPermitDAI",
    values: [
      string,
      string,
      BigNumberish,
      BigNumberish,
      boolean,
      BigNumberish,
      BytesLike,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapAaveDynamicToken",
    values: [string, string, string, BigNumberish, boolean, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapERC4626",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapStETH",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapUnbuttonToken",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "approveVault",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "batchSwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exitPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getEntrypoint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getVault", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "joinPool", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "manageUserBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRelayerApproval",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stakeETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakeETHAndWrap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "unwrapAaveStaticToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unwrapERC4626",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unwrapUnbuttonToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unwrapWstETH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "vaultPermit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "vaultPermitDAI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "wrapAaveDynamicToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "wrapERC4626",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wrapStETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "wrapUnbuttonToken",
    data: BytesLike
  ): Result;

  events: {};
}

export class BatchRelayerLibrary extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: BatchRelayerLibraryInterface;

  functions: {
    approveVault(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    batchSwap(
      kind: BigNumberish,
      swaps: {
        poolId: BytesLike;
        assetInIndex: BigNumberish;
        assetOutIndex: BigNumberish;
        amount: BigNumberish;
        userData: BytesLike;
      }[],
      assets: string[],
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limits: BigNumberish[],
      deadline: BigNumberish,
      value: BigNumberish,
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    exitPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    getEntrypoint(overrides?: CallOverrides): Promise<[string]>;

    getVault(overrides?: CallOverrides): Promise<[string]>;

    joinPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    manageUserBalance(
      ops: {
        kind: BigNumberish;
        asset: string;
        amount: BigNumberish;
        sender: string;
        recipient: string;
      }[],
      value: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    setRelayerApproval(
      relayer: string,
      approved: boolean,
      authorisation: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    stakeETH(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    stakeETHAndWrap(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    swap(
      singleSwap: {
        poolId: BytesLike;
        kind: BigNumberish;
        assetIn: string;
        assetOut: string;
        amount: BigNumberish;
        userData: BytesLike;
      },
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limit: BigNumberish,
      deadline: BigNumberish,
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    unwrapAaveStaticToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      toUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    unwrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    unwrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    unwrapWstETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    vaultPermit(
      token: string,
      owner: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    vaultPermitDAI(
      token: string,
      holder: string,
      nonce: BigNumberish,
      expiry: BigNumberish,
      allowed: boolean,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    wrapAaveDynamicToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      fromUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    wrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    wrapStETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    wrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      uAmount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;
  };

  approveVault(
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  batchSwap(
    kind: BigNumberish,
    swaps: {
      poolId: BytesLike;
      assetInIndex: BigNumberish;
      assetOutIndex: BigNumberish;
      amount: BigNumberish;
      userData: BytesLike;
    }[],
    assets: string[],
    funds: {
      sender: string;
      fromInternalBalance: boolean;
      recipient: string;
      toInternalBalance: boolean;
    },
    limits: BigNumberish[],
    deadline: BigNumberish,
    value: BigNumberish,
    outputReferences: {index: BigNumberish; key: BigNumberish}[],
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  exitPool(
    poolId: BytesLike,
    kind: BigNumberish,
    sender: string,
    recipient: string,
    request: {
      assets: string[];
      minAmountsOut: BigNumberish[];
      userData: BytesLike;
      toInternalBalance: boolean;
    },
    outputReferences: {index: BigNumberish; key: BigNumberish}[],
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  getEntrypoint(overrides?: CallOverrides): Promise<string>;

  getVault(overrides?: CallOverrides): Promise<string>;

  joinPool(
    poolId: BytesLike,
    kind: BigNumberish,
    sender: string,
    recipient: string,
    request: {
      assets: string[];
      maxAmountsIn: BigNumberish[];
      userData: BytesLike;
      fromInternalBalance: boolean;
    },
    value: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  manageUserBalance(
    ops: {
      kind: BigNumberish;
      asset: string;
      amount: BigNumberish;
      sender: string;
      recipient: string;
    }[],
    value: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  setRelayerApproval(
    relayer: string,
    approved: boolean,
    authorisation: BytesLike,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  stakeETH(
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  stakeETHAndWrap(
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  swap(
    singleSwap: {
      poolId: BytesLike;
      kind: BigNumberish;
      assetIn: string;
      assetOut: string;
      amount: BigNumberish;
      userData: BytesLike;
    },
    funds: {
      sender: string;
      fromInternalBalance: boolean;
      recipient: string;
      toInternalBalance: boolean;
    },
    limit: BigNumberish,
    deadline: BigNumberish,
    value: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  unwrapAaveStaticToken(
    staticToken: string,
    sender: string,
    recipient: string,
    amount: BigNumberish,
    toUnderlying: boolean,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  unwrapERC4626(
    wrappedToken: string,
    sender: string,
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  unwrapUnbuttonToken(
    wrapperToken: string,
    sender: string,
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  unwrapWstETH(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  vaultPermit(
    token: string,
    owner: string,
    value: BigNumberish,
    deadline: BigNumberish,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  vaultPermitDAI(
    token: string,
    holder: string,
    nonce: BigNumberish,
    expiry: BigNumberish,
    allowed: boolean,
    v: BigNumberish,
    r: BytesLike,
    s: BytesLike,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  wrapAaveDynamicToken(
    staticToken: string,
    sender: string,
    recipient: string,
    amount: BigNumberish,
    fromUnderlying: boolean,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  wrapERC4626(
    wrappedToken: string,
    sender: string,
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  wrapStETH(
    sender: string,
    recipient: string,
    amount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  wrapUnbuttonToken(
    wrapperToken: string,
    sender: string,
    recipient: string,
    uAmount: BigNumberish,
    outputReference: BigNumberish,
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  callStatic: {
    approveVault(
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    batchSwap(
      kind: BigNumberish,
      swaps: {
        poolId: BytesLike;
        assetInIndex: BigNumberish;
        assetOutIndex: BigNumberish;
        amount: BigNumberish;
        userData: BytesLike;
      }[],
      assets: string[],
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limits: BigNumberish[],
      deadline: BigNumberish,
      value: BigNumberish,
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    exitPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: CallOverrides
    ): Promise<void>;

    getEntrypoint(overrides?: CallOverrides): Promise<string>;

    getVault(overrides?: CallOverrides): Promise<string>;

    joinPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    manageUserBalance(
      ops: {
        kind: BigNumberish;
        asset: string;
        amount: BigNumberish;
        sender: string;
        recipient: string;
      }[],
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setRelayerApproval(
      relayer: string,
      approved: boolean,
      authorisation: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    stakeETH(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stakeETHAndWrap(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    swap(
      singleSwap: {
        poolId: BytesLike;
        kind: BigNumberish;
        assetIn: string;
        assetOut: string;
        amount: BigNumberish;
        userData: BytesLike;
      },
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limit: BigNumberish,
      deadline: BigNumberish,
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    unwrapAaveStaticToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      toUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    unwrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    unwrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    unwrapWstETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    vaultPermit(
      token: string,
      owner: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    vaultPermitDAI(
      token: string,
      holder: string,
      nonce: BigNumberish,
      expiry: BigNumberish,
      allowed: boolean,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    wrapAaveDynamicToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      fromUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    wrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    wrapStETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    wrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      uAmount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    approveVault(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    batchSwap(
      kind: BigNumberish,
      swaps: {
        poolId: BytesLike;
        assetInIndex: BigNumberish;
        assetOutIndex: BigNumberish;
        amount: BigNumberish;
        userData: BytesLike;
      }[],
      assets: string[],
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limits: BigNumberish[],
      deadline: BigNumberish,
      value: BigNumberish,
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    exitPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    getEntrypoint(overrides?: CallOverrides): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<BigNumber>;

    joinPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    manageUserBalance(
      ops: {
        kind: BigNumberish;
        asset: string;
        amount: BigNumberish;
        sender: string;
        recipient: string;
      }[],
      value: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    setRelayerApproval(
      relayer: string,
      approved: boolean,
      authorisation: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    stakeETH(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    stakeETHAndWrap(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    swap(
      singleSwap: {
        poolId: BytesLike;
        kind: BigNumberish;
        assetIn: string;
        assetOut: string;
        amount: BigNumberish;
        userData: BytesLike;
      },
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limit: BigNumberish,
      deadline: BigNumberish,
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    unwrapAaveStaticToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      toUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    unwrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    unwrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    unwrapWstETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    vaultPermit(
      token: string,
      owner: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    vaultPermitDAI(
      token: string,
      holder: string,
      nonce: BigNumberish,
      expiry: BigNumberish,
      allowed: boolean,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    wrapAaveDynamicToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      fromUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    wrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    wrapStETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    wrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      uAmount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    approveVault(
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    batchSwap(
      kind: BigNumberish,
      swaps: {
        poolId: BytesLike;
        assetInIndex: BigNumberish;
        assetOutIndex: BigNumberish;
        amount: BigNumberish;
        userData: BytesLike;
      }[],
      assets: string[],
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limits: BigNumberish[],
      deadline: BigNumberish,
      value: BigNumberish,
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    exitPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      outputReferences: {index: BigNumberish; key: BigNumberish}[],
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    getEntrypoint(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    joinPool(
      poolId: BytesLike,
      kind: BigNumberish,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    manageUserBalance(
      ops: {
        kind: BigNumberish;
        asset: string;
        amount: BigNumberish;
        sender: string;
        recipient: string;
      }[],
      value: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    setRelayerApproval(
      relayer: string,
      approved: boolean,
      authorisation: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    stakeETH(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    stakeETHAndWrap(
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    swap(
      singleSwap: {
        poolId: BytesLike;
        kind: BigNumberish;
        assetIn: string;
        assetOut: string;
        amount: BigNumberish;
        userData: BytesLike;
      },
      funds: {
        sender: string;
        fromInternalBalance: boolean;
        recipient: string;
        toInternalBalance: boolean;
      },
      limit: BigNumberish,
      deadline: BigNumberish,
      value: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    unwrapAaveStaticToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      toUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    unwrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    unwrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    unwrapWstETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    vaultPermit(
      token: string,
      owner: string,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    vaultPermitDAI(
      token: string,
      holder: string,
      nonce: BigNumberish,
      expiry: BigNumberish,
      allowed: boolean,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    wrapAaveDynamicToken(
      staticToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      fromUnderlying: boolean,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    wrapERC4626(
      wrappedToken: string,
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    wrapStETH(
      sender: string,
      recipient: string,
      amount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    wrapUnbuttonToken(
      wrapperToken: string,
      sender: string,
      recipient: string,
      uAmount: BigNumberish,
      outputReference: BigNumberish,
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;
  };
}
