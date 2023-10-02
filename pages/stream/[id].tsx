import { useAuth } from '@elrond-giants/erd-react-hooks';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useTransaction } from '../../hooks/useTransaction';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const { makeTransaction } = useTransaction();
  const router = useRouter();

  const { data } = useSWR(`/api/stream/${router.query.id}`, fetcher, { refreshInterval: 1000 });

  console.log(data);

  return (
    <div className="flex justify-center w-full mt-20">
      <div className="flex flex-col items-start space-y-2 max-w-screen-md">create new stream</div>

      <div className="text-white">{data?.stream?.balance?.recipient_balance}</div>
    </div>
  );
};

export default Home;
