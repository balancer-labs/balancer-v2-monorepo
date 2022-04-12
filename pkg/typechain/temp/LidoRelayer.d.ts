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

interface LidoRelayerInterface extends ethers.utils.Interface {
  functions: {
    "batchSwap(uint8,tuple[],address[],tuple,int256[],uint256)": FunctionFragment;
    "exitPool(bytes32,address,address,tuple)": FunctionFragment;
    "getStETH()": FunctionFragment;
    "getVault()": FunctionFragment;
    "getWstETH()": FunctionFragment;
    "joinPool(bytes32,address,address,tuple)": FunctionFragment;
    "swap(tuple,tuple,uint256,uint256)": FunctionFragment;
  };

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
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exitPool",
    values: [
      BytesLike,
      string,
      string,
      {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      }
    ]
  ): string;
  encodeFunctionData(functionFragment: "getStETH", values?: undefined): string;
  encodeFunctionData(functionFragment: "getVault", values?: undefined): string;
  encodeFunctionData(functionFragment: "getWstETH", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "joinPool",
    values: [
      BytesLike,
      string,
      string,
      {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      }
    ]
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
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(functionFragment: "batchSwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exitPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getStETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getVault", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getWstETH", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "joinPool", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;

  events: {};
}

export class LidoRelayer extends BaseContract {
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

  interface: LidoRelayerInterface;

  functions: {
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    exitPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    getStETH(overrides?: CallOverrides): Promise<[string]>;

    getVault(overrides?: CallOverrides): Promise<[string]>;

    getWstETH(overrides?: CallOverrides): Promise<[string]>;

    joinPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;
  };

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
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  exitPool(
    poolId: BytesLike,
    sender: string,
    recipient: string,
    request: {
      assets: string[];
      minAmountsOut: BigNumberish[];
      userData: BytesLike;
      toInternalBalance: boolean;
    },
    overrides?: Overrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  getStETH(overrides?: CallOverrides): Promise<string>;

  getVault(overrides?: CallOverrides): Promise<string>;

  getWstETH(overrides?: CallOverrides): Promise<string>;

  joinPool(
    poolId: BytesLike,
    sender: string,
    recipient: string,
    request: {
      assets: string[];
      maxAmountsIn: BigNumberish[];
      userData: BytesLike;
      fromInternalBalance: boolean;
    },
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
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  callStatic: {
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
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    exitPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      overrides?: CallOverrides
    ): Promise<void>;

    getStETH(overrides?: CallOverrides): Promise<string>;

    getVault(overrides?: CallOverrides): Promise<string>;

    getWstETH(overrides?: CallOverrides): Promise<string>;

    joinPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
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
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    exitPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    getStETH(overrides?: CallOverrides): Promise<BigNumber>;

    getVault(overrides?: CallOverrides): Promise<BigNumber>;

    getWstETH(overrides?: CallOverrides): Promise<BigNumber>;

    joinPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;
  };

  populateTransaction: {
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    exitPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        minAmountsOut: BigNumberish[];
        userData: BytesLike;
        toInternalBalance: boolean;
      },
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    getStETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getWstETH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    joinPool(
      poolId: BytesLike,
      sender: string,
      recipient: string,
      request: {
        assets: string[];
        maxAmountsIn: BigNumberish[];
        userData: BytesLike;
        fromInternalBalance: boolean;
      },
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
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;
  };
}
