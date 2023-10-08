import axios from 'axios';
import BigNumber from 'bignumber.js';
import moment from 'moment';

import { network } from '../config';
import { IStreamResource, IStreamResponse, StreamStatus } from '../types';
import { denominate } from './economics';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function getShortAddress(address: string, chars = 4): string {
  return address.substring(0, chars) + "..." + address.substring(address.length - chars);
}

export async function getHerotag(address: string): Promise<string | undefined> {
  const { data } = await axios.get(`${network.apiAddress}/accounts/${address}`);
  return data?.username;
}

export const getStreamStatusListing = (stream: IStreamResource): StreamStatus => {
  if (stream.status === "finalized") return StreamStatus.Finished;

  if (stream.status === "cancelled") return StreamStatus.Canceled;

  const startTime = moment(stream.start_time);
  if (moment() < startTime) return StreamStatus.Pending;

  const endTime = moment(stream.end_time);
  if (moment() < endTime) return StreamStatus.InProgress;

  return StreamStatus.Settled;
};

export const getStreamStatusDetails = (stream: IStreamResponse): StreamStatus => {
  if (stream.status === "finalized") return StreamStatus.Finished;

  if (stream.status === "cancelled") return StreamStatus.Canceled;

  const startTime = moment(stream.stream.start_time);
  if (moment() < startTime) return StreamStatus.Pending;

  const endTime = moment(stream.stream.end_time);
  if (moment() < endTime) return StreamStatus.InProgress;

  return StreamStatus.Settled;
};

export const getStreamStatus = (stream: IStreamResource | IStreamResponse): StreamStatus => {
  //@ts-ignore
  if (stream?.stream) return getStreamStatusDetails(stream as IStreamResponse);
  return getStreamStatusListing(stream as IStreamResource);
};

export const formatNumber = (num: number, precision = 2) => {
  const map = [
    { suffix: "T", threshold: 1e12 },
    { suffix: "B", threshold: 1e9 },
    { suffix: "M", threshold: 1e6 },
    { suffix: "K", threshold: 1e3 },
    { suffix: "", threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  return num;
};

export const getDepositAmount = (data: IStreamResponse): number => {
  if (!data?.stream?.payment?.amount) return 0;
  return denominate(data.stream.payment.amount, 5, data.stream.payment.token_decimals).toNumber();
};

export const getClaimedAmount = (data: IStreamResponse): { value: number; percent: string } => {
  if (!data?.stream?.balance?.claimed_amount)
    return {
      value: 0,
      percent: "0",
    };
  const balance = denominate(data.stream.balance.claimed_amount, 5, data.stream.payment.token_decimals).toNumber();
  const fullDeposit = getDepositAmount(data);
  return {
    value: balance,
    percent: ((balance * 100) / fullDeposit).toFixed(0),
  };
};

export const getAmountStreamed = (data: IStreamResponse): { value: number; percent: string } => {
  if (!(data?.stream?.balance?.recipient_balance || data?.stream?.balance?.claimed_amount))
    return {
      value: 0,
      percent: "0",
    };

  const streamed = new BigNumber(data?.stream?.balance?.recipient_balance || 0).plus(
    new BigNumber(data?.stream?.balance?.claimed_amount || 0)
  );
  const balance = denominate(streamed.toString(), 5, data.stream.payment.token_decimals).toNumber();
  const fullDeposit = getDepositAmount(data);
  return {
    value: balance,
    percent: ((balance * 100) / fullDeposit).toFixed(0),
  };
};
