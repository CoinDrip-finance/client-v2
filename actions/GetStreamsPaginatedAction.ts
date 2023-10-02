import { NextApiRequest } from 'next';

import { StreamsRepository } from '../repositories/StreamsRepository';
import { IStreamResponse } from '../types';
import ApiResponse from './_base/ApiResponse';
import BaseAction from './_base/BaseAction';

export default class GetStreamsPaginatedAction extends BaseAction {
  async handle(req: NextApiRequest): Promise<ApiResponse<IStreamResponse>> {
    // @ts-ignore
    const {
      address,
      nfts: _nfts,
      page,
      page_size,
    }: { address: string; nfts: string; page: string; page_size: string } = req.query;

    console.log(address, _nfts, page);

    const nfts = _nfts ? _nfts.split(",").map((nft) => parseInt(nft)) : [];

    const streamsRepository = new StreamsRepository();
    const { data } = await streamsRepository.paginate({
      address,
      nfts,
      page: parseInt(page),
      size: parseInt(page_size),
    });

    return new ApiResponse({
      body: data,
    }).cache(60, 6);
  }
}
