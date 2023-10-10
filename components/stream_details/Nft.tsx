import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import { network, xoxnoUrl } from '../../config';
import { IStreamResponse } from '../../types';

export default function Nft({ data }: { data: IStreamResponse }) {
  return (
    <div className="mt-8">
      <div className="text-neutral-400 mb-1">NFT</div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
        <div className="flex space-x-8">
          <div className="flex-1">
            <div>{data.nft?.name}</div>
            <div className="text-neutral-400 text-xs flex items-center">
              <a
                href={`${network.explorerAddress}/nfts/${data.nft?.identifier}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                {data.nft?.identifier}
              </a>
              <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
            </div>
            <p className="text-sm text-neutral-400 mt-4 mb-14">
              When a new stream is created, an NFT is minted and sent to the recipient. When you transfer the NFT, you
              transfer the recipient role with it (this includes the right to withdraw funds or cancel the stream). All
              funds that are streamed but not claimed will be transferred together with the NFT.
            </p>

            <a
              className="auth-button py-2 px-6 inline-flex items-center"
              href={`${xoxnoUrl}/nft/${data.nft?.identifier}`}
              target="_blank"
              rel="noreferrer"
            >
              See on XOXNO <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
            </a>
          </div>
          <div className="flex-1">
            <img src={data.nft?.url} alt={data.nft?.name} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
