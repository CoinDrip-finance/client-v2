import { useAuth } from '@elrond-giants/erd-react-hooks';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { getStreamData } from '../../apis/stream';
import { useTransaction } from '../../hooks/useTransaction';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const { makeTransaction } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    const streamId = router.query.id;
    if (!streamId) return;
    (async () => {
      const stream = await getStreamData(streamId as string);
      console.log(stream);
    })();
  }, [router.query.id]);

  return (
    <div className="flex justify-center w-full mt-20">
      <div className="flex flex-col items-start space-y-2 max-w-screen-md">create new stream</div>
    </div>
  );
};

export default Home;
