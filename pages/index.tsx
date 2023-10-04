import { useAuth } from '@elrond-giants/erd-react-hooks';
import { PlusSmallIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetchStreamNftsNonceList } from '../apis/nfts';
import Dropdown, { DropdownItem } from '../components/Dropdown';
import ActionButton from '../components/shared/ActionButton';
import Layout from '../components/shared/Layout';
import StreamsTable from '../components/stream_list/StreamsTable';
import { IStreamResource } from '../types';
import { classNames } from '../utils/presentation';
import { galleryPath } from '../utils/routes';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const PAGE_SIZE = 2;

const encodeParams = (params: any) => new URLSearchParams(params).toString();

const streamFilterOptions: DropdownItem[] = [
  { id: "all", label: "All Streams" },
  { id: "incoming", label: "Incoming" },
  { id: "outcoming", label: "Outcoming" },
];

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const [nonces, setNonces] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(streamFilterOptions[0]);

  const { data, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite<IStreamResource[]>(
    (index) =>
      `/api/stream?${encodeParams({
        address,
        nfts: nonces,
        page: index,
        page_size: PAGE_SIZE,
      })}`,
    fetcher
  );

  const streams: IStreamResource[] = data ? ([] as IStreamResource[]).concat(...data) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
  const isRefreshing = isValidating && data && data.length === size;

  console.log(streams, isLoadingMore, isEmpty, isReachingEnd, isRefreshing);

  useEffect(() => {
    if (!address) return;

    (async () => {
      const nonceList = await fetchStreamNftsNonceList(address);
      setNonces(nonceList);
    })();
  }, [address]);

  return (
    <Layout>
      <div className="max-w-screen-lg w-full mx-auto mt-20 mb-7 flex items-end justify-between">
        <div>
          <h1 className="font-medium text-2xl mb-3">All streams</h1>
          <Dropdown
            items={streamFilterOptions}
            selectedItem={selectedFilter}
            onChange={(newItem) => setSelectedFilter(newItem)}
          />
        </div>
        <ActionButton
          Icon={PlusSmallIcon}
          label="Create Stream"
          href={galleryPath}
          className="primary-action-button flex items-center"
        />
      </div>
      <div className="flex justify-center w-full">
        <div className="flex flex-col items-start space-y-2 max-w-screen-lg w-full mx-auto">
          <StreamsTable streams={streams} />

          {isEmpty ? (
            <div className="text-center py-8 border-2 border-neutral-900 text-neutral-700 bg-neutral-900 bg-opacity-10 rounded-lg w-full">
              No results found
            </div>
          ) : (
            <button
              disabled={isLoadingMore || isReachingEnd}
              onClick={() => setSize(size + 1)}
              className={classNames(
                !(isLoadingMore || isReachingEnd) ? "underline" : " text-neutral-400",
                "mx-auto font-light pt-4"
              )}
            >
              {isLoadingMore ? "Loading streams..." : isReachingEnd ? "No more streams" : "Load more"}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
