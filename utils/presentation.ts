import axios from 'axios';
import moment from 'moment';

import { network } from '../config';
import { IStreamResource, IStreamResponse, StreamStatus } from '../types';

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
