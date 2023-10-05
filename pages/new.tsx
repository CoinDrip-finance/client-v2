import { useAuth } from '@elrond-giants/erd-react-hooks';
import { AcademicCapIcon, InformationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { StreamItemType } from '../components/gallery/StreamTypeItem';
import AmountInput from '../components/new_stream/AmountInput';
import DurationInput from '../components/new_stream/DurationInput';
import RecipientInput from '../components/new_stream/RecipientInput';
import TokenSelect, { EsdtToken } from '../components/new_stream/TokenSelect';
import RequiresAuth from '../components/RequiresAuth';
import BackButtonWrapper from '../components/shared/BackWrapper';
import Layout from '../components/shared/Layout';
import { useTransaction } from '../hooks/useTransaction';
import { ICreateStream } from '../types';
import StreamingContract from '../utils/contracts/streamContract';
import { galleryPath } from '../utils/routes';
import { streamTypes } from './gallery';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const { makeTransaction } = useTransaction();
  const router = useRouter();
  const formMethods = useForm<ICreateStream>({
    defaultValues: {
      can_cancel: true,
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = formMethods;
  const [streamType, setStreamType] = useState<StreamItemType>();
  const [selectedToken, setSelectedToken] = useState<EsdtToken>();

  useEffect(() => {
    if (!router?.query?.type) return;

    setStreamType(streamTypes.find((e) => e.id === router.query.type));
  }, [router?.query?.type]);

  // useEffect(() => {
  //   (async () => {
  //     const streamingContract = new StreamingContract();
  //     const stream = await streamingContract.getStream(4);
  //     console.log(stream.firstValue?.valueOf());
  //   })();
  // });

  const test = async () => {
    if (!address) return;
    const stream = {
      recipient: "erd1q2vrhd3hhcg7zfptvn3sgvnxhp7zvwqpvlqf03kzls04n0k573usc6t6w5",
      payment_token: "EGLD",
      payment_nonce: 0,
      payment_amount: 0.005,
      can_cancel: true,
      duration: 60 * 60,
    };

    const streamingContract = new StreamingContract(address);
    const interaction = streamingContract.createStreamByDuration(
      "erd1q2vrhd3hhcg7zfptvn3sgvnxhp7zvwqpvlqf03kzls04n0k573usc6t6w5",
      60 * 60,
      10,
      true,
      {
        token_identifier: "EGLD",
        amount: 0.002,
      }
    );

    const txResult = await makeTransaction(interaction.buildTransaction());
  };

  const cancelTest = async () => {
    if (!address) return;
    const streamingContract = new StreamingContract(address);
    const interaction = streamingContract.cancelStream(11);

    const txResult = await makeTransaction(interaction.buildTransaction());
  };

  const claimTest = async () => {
    if (!address) return;
    const streamingContract = new StreamingContract(address);
    const interaction = streamingContract.claimAfterCancel(11, true);

    const txResult = await makeTransaction(interaction.buildTransaction());
  };

  const createStream = async (formData: ICreateStream) => {
    if (!address) return;

    const streamingContract = new StreamingContract(address);
    const interaction = streamingContract.createStreamByDuration(
      formData.recipient,
      formData.duration,
      0,
      formData.can_cancel,
      {
        token_identifier: formData.payment_token,
        amount: formData.amount,
        decimals: selectedToken?.decimals,
      }
    );

    const txResult = await makeTransaction(interaction.buildTransaction());
  };

  return (
    <RequiresAuth>
      <Layout>
        <BackButtonWrapper href={galleryPath}>
          <h1 className="font-medium text-xl">Create a stream</h1>
          <p className="mt-2 mb-8 font-light text-sm">Start streaming your ESDT in minutes.</p>

          <div className="flex flex-col space-y-4">
            <div className="bg-neutral-950 rounded-lg border border-neutral-900 h-12 flex items-center justify-between px-4 text-neutral-400 font-medium text-sm">
              <div className="flex items-center">
                <LockClosedIcon className="w-4 h-4 mr-2" /> {streamType?.title} stream
              </div>
              <div>
                <img src={`/gallery/${streamType?.id}.svg`} alt={streamType?.title} className="h-6" />
              </div>
            </div>

            <FormProvider {...formMethods}>
              <form className="flex flex-col space-y-4" onSubmit={handleSubmit(createStream)}>
                <TokenSelect onSelect={(token) => setSelectedToken(token)} />

                <AmountInput token={selectedToken} />

                <RecipientInput />

                <DurationInput />

                <div className="font-light text-sm flex items-center">
                  <input
                    {...register("can_cancel")}
                    type="checkbox"
                    className="h-6 w-6 rounded border-neutral-500 text-primary focus:outline-none focus:ring-0 mr-2"
                  />
                  Make the stream cancelable
                  {/* TODO: Repalce link to docs */}
                  <a href="#">
                    <InformationCircleIcon className="w-6 h-6 ml-2" />
                  </a>
                </div>

                <button className="primary-action-button">Create Stream</button>
              </form>
            </FormProvider>
          </div>

          {/* TODO: Add a link to the docs */}
          <a href="#" className="underline flex items-center text-sm font-light justify-center mt-12">
            <AcademicCapIcon className="h-4 w-4 mr-2" /> Learn more about token streams
          </a>
        </BackButtonWrapper>
      </Layout>
    </RequiresAuth>
  );
};

export default Home;
