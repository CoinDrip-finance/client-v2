import { IStreamResource } from '../types';
import { CANCEL_TABLE, getTableName, STREAMS_TABLE, supabase } from '../utils/supabase';
import { BaseRepository } from './BaseRepository';

export class StreamsRepository extends BaseRepository<IStreamResource> {
  constructor() {
    const table = supabase.from(getTableName(STREAMS_TABLE));
    super(table, "id");
  }

  async paginate({ page, size, address, nfts }: { page?: number; size?: number; address?: string; nfts?: number[] }) {
    const { from, to } = StreamsRepository.computePageRange({ page, size });

    const filters: string[] = [];
    if (address) {
      filters.push(`sender.eq.${address}`);
    }
    if (nfts?.length) {
      const idsString = nfts.join(",");
      filters.push(`stream_nft_nonce.in.(${idsString})`);
    }

    let query = this._table
      .select(`*, canceled:${getTableName(CANCEL_TABLE)}(streamed_until_cancel)`, { count: "exact" })
      .or(filters.join(","))
      // .eq("status", "active")
      .order("id", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data, count };
  }
}
