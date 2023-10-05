import { StreamType } from '../types';

export const homePath = "/";
export const authPath = "/auth";
export const webWalletTxReturnPath = "webtxresult";
export const streamDetailsPath = (id: number) => `/stream/${id}`;
export const galleryPath = "/gallery";
export const newStreamPath = (type: StreamType) => `/new?type=${type}`;
