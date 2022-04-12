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

interface SingleRecipientGaugeInterface extends ethers.utils.Interface {
  functions: {
    "checkpoint()": FunctionFragment;
    "getRecipient()": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "integrate_fraction(address)": FunctionFragment;
    "is_killed()": FunctionFragment;
    "killGauge()": FunctionFragment;
    "unkillGauge()": FunctionFragment;
    "user_checkpoint(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "checkpoint",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRecipient",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "initialize", values: [string]): string;
  encodeFunctionData(
    functionFragment: "integrate_fraction",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "is_killed", values?: undefined): string;
  encodeFunctionData(functionFragment: "killGauge", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "unkillGauge",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "user_checkpoint",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "checkpoint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRecipient",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "integrate_fraction",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "is_killed", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "killGauge", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "unkillGauge",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "user_checkpoint",
    data: BytesLike
  ): Result;

  events: {
    "Checkpoint(uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Checkpoint"): EventFragment;
}

export class SingleRecipientGauge extends BaseContract {
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

  interface: SingleRecipientGaugeInterface;

  functions: {
    checkpoint(
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    getRecipient(overrides?: CallOverrides): Promise<[string]>;

    initialize(
      recipient: string,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    integrate_fraction(
      user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    is_killed(overrides?: CallOverrides): Promise<[boolean]>;

    killGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    unkillGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<ContractTransaction>;

    user_checkpoint(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  checkpoint(
    overrides?: PayableOverrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  getRecipient(overrides?: CallOverrides): Promise<string>;

  initialize(
    recipient: string,
    overrides?: Overrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  integrate_fraction(
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  is_killed(overrides?: CallOverrides): Promise<boolean>;

  killGauge(
    overrides?: Overrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  unkillGauge(
    overrides?: Overrides & {from?: string | Promise<string>}
  ): Promise<ContractTransaction>;

  user_checkpoint(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    checkpoint(overrides?: CallOverrides): Promise<boolean>;

    getRecipient(overrides?: CallOverrides): Promise<string>;

    initialize(recipient: string, overrides?: CallOverrides): Promise<void>;

    integrate_fraction(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    is_killed(overrides?: CallOverrides): Promise<boolean>;

    killGauge(overrides?: CallOverrides): Promise<void>;

    unkillGauge(overrides?: CallOverrides): Promise<void>;

    user_checkpoint(arg0: string, overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    Checkpoint(
      periodTime?: BigNumberish | null,
      periodEmissions?: null
    ): TypedEventFilter<
      [BigNumber, BigNumber],
      {periodTime: BigNumber; periodEmissions: BigNumber}
    >;
  };

  estimateGas: {
    checkpoint(
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    getRecipient(overrides?: CallOverrides): Promise<BigNumber>;

    initialize(
      recipient: string,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    integrate_fraction(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    is_killed(overrides?: CallOverrides): Promise<BigNumber>;

    killGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    unkillGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<BigNumber>;

    user_checkpoint(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    checkpoint(
      overrides?: PayableOverrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    getRecipient(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      recipient: string,
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    integrate_fraction(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    is_killed(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    killGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    unkillGauge(
      overrides?: Overrides & {from?: string | Promise<string>}
    ): Promise<PopulatedTransaction>;

    user_checkpoint(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
