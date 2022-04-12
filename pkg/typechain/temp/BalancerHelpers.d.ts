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
  CallOverrides,
} from "ethers";
import {BytesLike} from "@ethersproject/bytes";
import {Listener, Provider} from "@ethersproject/providers";
import {FunctionFragment, EventFragment, Result} from "@ethersproject/abi";
import {TypedEventFilter, TypedEvent, TypedListener} from "./commons";

interface BalancerHelpersInterface extends ethers.utils.Interface {
  functions: {
    "queryExit(bytes32,address,address,tuple)": FunctionFragment;
    "queryJoin(bytes32,address,address,tuple)": FunctionFragment;
    "vault()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "queryExit",
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
  encodeFunctionData(
    functionFragment: "queryJoin",
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
  encodeFunctionData(functionFragment: "vault", values?: undefined): string;

  decodeFunctionResult(functionFragment: "queryExit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "queryJoin", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "vault", data: BytesLike): Result;

  events: {};
}

export class BalancerHelpers extends BaseContract {
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

  interface: BalancerHelpersInterface;

  functions: {
    queryExit(
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
    ): Promise<
      [BigNumber, BigNumber[]] & {bptIn: BigNumber; amountsOut: BigNumber[]}
    >;

    queryJoin(
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
    ): Promise<
      [BigNumber, BigNumber[]] & {bptOut: BigNumber; amountsIn: BigNumber[]}
    >;

    vault(overrides?: CallOverrides): Promise<[string]>;
  };

  queryExit(
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
  ): Promise<
    [BigNumber, BigNumber[]] & {bptIn: BigNumber; amountsOut: BigNumber[]}
  >;

  queryJoin(
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
  ): Promise<
    [BigNumber, BigNumber[]] & {bptOut: BigNumber; amountsIn: BigNumber[]}
  >;

  vault(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    queryExit(
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
    ): Promise<
      [BigNumber, BigNumber[]] & {bptIn: BigNumber; amountsOut: BigNumber[]}
    >;

    queryJoin(
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
    ): Promise<
      [BigNumber, BigNumber[]] & {bptOut: BigNumber; amountsIn: BigNumber[]}
    >;

    vault(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    queryExit(
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
    ): Promise<BigNumber>;

    queryJoin(
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
    ): Promise<BigNumber>;

    vault(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    queryExit(
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
    ): Promise<PopulatedTransaction>;

    queryJoin(
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
    ): Promise<PopulatedTransaction>;

    vault(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
