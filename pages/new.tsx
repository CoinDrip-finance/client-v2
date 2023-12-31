import { useAuth } from '@elrond-giants/erd-react-hooks';
import { AcademicCapIcon, InformationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { joiResolver } from '@hookform/resolvers/joi';
import BigNumber from 'bignumber.js';
import Joi from 'joi';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { StreamItemType } from '../components/gallery/StreamTypeItem';
import AmountInput from '../components/new_stream/AmountInput';
import DurationInput from '../components/new_stream/DurationInput';
import NumberInput from '../components/new_stream/NumberInput';
import RecipientInput from '../components/new_stream/RecipientInput';
import TokenSelect, { EsdtToken } from '../components/new_stream/TokenSelect';
import RequiresAuth from '../components/RequiresAuth';
import BackButtonWrapper from '../components/shared/BackWrapper';
import Layout from '../components/shared/Layout';
import { useTransaction } from '../hooks/useTransaction';
import { ICreateStream, StreamType } from '../types';
import StreamingContract from '../utils/contracts/streamContract';
import { Segments } from '../utils/models/Segments';
import { galleryPath, streamDetailsPath } from '../utils/routes';
import { streamTypes } from './gallery';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address } = useAuth();
  const { makeTransaction } = useTransaction();
  const router = useRouter();

  const schema = Joi.object<ICreateStream>({
    recipient: Joi.string()
      .pattern(/^erd1[a-z0-9]{58}/)
      .custom((data, helper) => {
        // @ts-ignore
        if (data === address) return helper.message("You can't stream towards yourself");

        return data;
      })
      .required(),
    payment_token: Joi.string()
      .pattern(/[A-Z]+(-[a-z0-9]+)?/)
      .required(),
    amount: Joi.number().positive().required(),
    duration: Joi.number().positive().required(),
    cliff: Joi.number().positive().max(Joi.ref("duration")),
    steps_count: Joi.number().positive().integer(),
    can_cancel: Joi.boolean(),
  });
  const formMethods = useForm<ICreateStream>({
    resolver: joiResolver(schema),
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router?.query?.type) return;

    setStreamType(streamTypes.find((e) => e.id === router.query.type));
  }, [router?.query?.type]);

  const createStream = async (formData: ICreateStream) => {
    if (!address) return;

    try {
      setLoading(true);
      const amountBigNumber = new BigNumber(formData.amount).shiftedBy(selectedToken?.decimals || 18);
      let segments;
      if (isStepsType && formData?.steps_count) {
        segments = Segments.fromNewStream(formData, amountBigNumber);
      } else {
        segments = new Segments({
          duration: formData.duration,
          amount: amountBigNumber.toString(),
          exponent: isExponentialType ? 3 : 1,
        });
      }

      const streamingContract = new StreamingContract(address);
      const interaction = streamingContract.createStreamNow(
        formData.recipient,
        segments,
        formData?.cliff || 0,
        formData.can_cancel,
        {
          token_identifier: formData.payment_token,
          amount: formData.amount,
          decimals: selectedToken?.decimals,
        }
      );

      const txResult = await makeTransaction(interaction.buildTransaction());

      if (txResult.status === "success") {
        const resultData =
          txResult.transaction?.contractResults.items[
            txResult.transaction?.contractResults.items.length - 1
          ].data.split("@");
        if (resultData) {
          const streamId = parseInt(resultData[resultData?.length - 1], 16);
          router.push(streamDetailsPath(streamId));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isCliffType = useMemo(() => {
    return streamType?.id === StreamType.CliffLinear || streamType?.id === StreamType.CliffExponential;
  }, [streamType?.id]);

  const isExponentialType = useMemo(() => {
    return streamType?.id === StreamType.Exponential || streamType?.id === StreamType.CliffExponential;
  }, [streamType?.id]);

  const isStepsType = useMemo(() => {
    return streamType?.id === StreamType.Steps;
  }, [streamType?.id]);

  return (
    <RequiresAuth>
      <Layout>
        <NextSeo title="Create stream" />
        <BackButtonWrapper href={galleryPath} title="Create a stream">
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

                <DurationInput label="Duration" formId="duration" />

                {isCliffType && <DurationInput label="Cliff" formId="cliff" />}

                {isStepsType && <NumberInput label="Steps Count" formId="steps_count" />}

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

                <button
                  className="primary-action-button disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Create Stream"}
                </button>
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
