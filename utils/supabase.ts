import { createClient } from '@supabase/supabase-js';

import { chainId } from '../config';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC as string
);

const DEVNET_PREFIX = "v2_devnet_";
export const STREAMS_TABLE = "streams";
export const CLAIMS_TABLE = "stream_claims";
export const CANCEL_TABLE = "canceled_streams";

export const getTableName = (key: string) => {
  if (chainId === "D") return DEVNET_PREFIX + key;
  return key;
};
