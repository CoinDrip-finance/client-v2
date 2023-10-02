import { useAuth } from '@elrond-giants/erd-react-hooks';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { fetchStreamNftsNonceList } from '../apis/nfts';
import RequiresAuth from '../components/RequiresAuth';
import { egldLabel } from '../config';
import { useAppDispatch } from '../hooks/useStore';
import { useTransaction } from '../hooks/useTransaction';
import { fetchStreams } from '../redux/slices/streamsSlice';
import { RootState } from '../redux/store';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const [receiverAddress, setReceiverAddress] = useState("");
  const [txData, setTxData] = useState("");
  const { makeTransaction } = useTransaction();
  const dispatch = useAppDispatch();
  const streamList = useSelector((state: RootState) => state.streams);
  console.log(streamList);
  useEffect(() => {
    if (!address) return;

    (async () => {
      const nonceList = await fetchStreamNftsNonceList(address);
      dispatch(fetchStreams({ address, nfts: nonceList }));
    })();
  }, [address]);

  return (
    <RequiresAuth>
      <div className="flex justify-center w-full mt-20">
        <div className="flex flex-col items-start space-y-2 max-w-screen-md">
          <h2 className="text-xl">Hello, MultiversX Next Starter Kit!</h2>
          <p>Address: {address}</p>
          <p>Balance: {balance.toDenominatedString() + egldLabel}</p>
          <p>Nonce: {nonce}</p>
          <button
            type="button"
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </button>

          <Link href="/new">create new stream</Link>

          <div className="pt-6 w-full">
            <p>Make a devnet test transaction</p>
            <form className="space-y-4 pt-6 w-full">
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Receiver Address
                </label>
                <input
                  value={receiverAddress}
                  onChange={(event) => {
                    setReceiverAddress(event.target.value);
                  }}
                  type="text"
                  name="address"
                  className="mt-1 p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Transaction Data
                </label>

                <input
                  value={txData}
                  onChange={(event) => {
                    setTxData(event.target.value);
                  }}
                  type="text"
                  name="data"
                  className="mt-1 p-2 w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </RequiresAuth>
  );
};

export default Home;
