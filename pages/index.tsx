import { useAuth } from '@elrond-giants/erd-react-hooks';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';

import { fetchStreamNftsNonceList } from '../apis/nfts';
import RequiresAuth from '../components/RequiresAuth';
import { useTransaction } from '../hooks/useTransaction';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const PAGE_SIZE = 2;

const encodeParams = (params: any) => new URLSearchParams(params).toString();

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const [nonces, setNonces] = useState([]);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [txData, setTxData] = useState("");
  const { makeTransaction } = useTransaction();

  const { data, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(
    (index) =>
      `/api/stream?${encodeParams({
        address,
        nfts: nonces,
        page: index,
        page_size: PAGE_SIZE,
      })}`,
    fetcher
  );

  const streams = data ? [].concat(...data) : [];
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
    <RequiresAuth>
      <div className="flex justify-center w-full mt-20">
        <div className="flex flex-col items-start space-y-2 max-w-screen-md">
          showing {size} page(s) of {isLoadingMore ? "..." : streams.length} issue(s){" "}
          <button disabled={isLoadingMore || isReachingEnd} onClick={() => setSize(size + 1)}>
            {isLoadingMore ? "loading..." : isReachingEnd ? "no more issues" : "load more"}
          </button>
          <button disabled={isRefreshing} onClick={() => mutate()}>
            {isRefreshing ? "refreshing..." : "refresh"}
          </button>
          <button disabled={!size} onClick={() => setSize(0)}>
            clear
          </button>
          <div>
            {streams.map((e) => (
              <p key={e.id}>{e.id}</p>
            ))}
          </div>
        </div>
      </div>
    </RequiresAuth>
  );
};

export default Home;
