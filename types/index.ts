export interface CreateStreamPayment {
  token_identifier: string;
  amount: number;
  decimals?: number;
}

export interface ICreateStream {
  amount: number;
  duration: number;
  payment_token: string;
  recipient: string;
  can_cancel: boolean;
  cliff?: number;
}

export enum StreamType {
  Linear = "linear",
  CliffLinear = "cliff_linear",
  Steps = "steps",
  CliffSteps = "cliff_steps",
}

export type StreamResourceStatus = "active" | "finalized" | "cancelled";

export enum StreamStatus {
  Pending = "Pending",
  InProgress = "In Progress",
  Canceled = "Canceled",
  Settled = "Settled",
  Finished = "Finished",
}

export interface IStreamResource {
  id: number;
  created_at: string;
  sender: string;
  recipient: string;
  stream_nft_identifier: string;
  stream_nft_nonce: number;
  payment_token: string;
  payment_nonce: number;
  deposit: string;
  deposit_with_fees: string;
  start_time: string;
  end_time: string;
  can_cancel: boolean;
  cliff: number;
  tx_hash: string;
  status: StreamResourceStatus;
  decimals: number;
  payment_token_label: string;
  canceled?: {
    streamed_until_cancel: string;
  };
}

export interface IClaimResource {
  id: number;
  created_at: string;
  tx_hash: string;
  amount: string;
}

export interface IStreamResponse {
  id: number;
  status: string;
  created_at: string;
  tx_hash: string;
  stream: {
    sender: string;
    payment: {
      token_identifier: string;
      token_name: string;
      token_nonce: number;
      token_decimals: number;
      amount: string;
      amount_with_fees: string;
    };
    start_time: string;
    end_time: string;
    can_cancel: boolean;
    cliff: number;
    balance?: {
      claimed_amount: string;
      balances_after_cancel?: {
        sender_balance: string;
        recipient_balance: string;
      };
      recipient_balance?: string;
    };
  };
  nft?: {
    collection: string;
    nonce: number;
    identifier: string;
    name: string;
    url: string;
  };
}
