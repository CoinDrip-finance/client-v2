import { useAuth } from '@elrond-giants/erd-react-hooks';
import { useEffect, useState } from 'react';

import RequiresAuth from '../components/RequiresAuth';
import { useTransaction } from '../hooks/useTransaction';
import StreamingContract from '../utils/contracts/streamContract';

import type { NextPage } from "next";
const Home: NextPage = () => {
  const { address, logout, balance, nonce } = useAuth();
  const { makeTransaction } = useTransaction();

  //   const createStream = async (stream: ICreateStream, decimals?: number) => {
  //     const abiRegistry = AbiRegistry.create(CoinDripProtocolAbi);
  //     const contract = new SmartContract({
  //       address: new Address(contractAddress),
  //       abi: abiRegistry,
  //     });

  //     let interaction = contract.methods
  //       .createStreamDuration([
  //         new AddressValue(new Address(stream.recipient)),
  //         new U64Value(stream.duration),
  //         new U64Value(0),
  //         new BooleanValue(stream.can_cancel),
  //       ])
  //       .withChainID("D")
  //       .withSender(new Address(address!))
  //       .withGasLimit(150_000_000)
  //       .withNonce(nonce);

  //     if (stream.payment_token === "EGLD") {
  //       interaction = interaction.withValue(TokenTransfer.egldFromAmount(stream.payment_amount));
  //     } else {
  //       interaction = interaction.withSingleESDTTransfer(
  //         TokenTransfer.fungibleFromAmount(stream.payment_token, stream.payment_amount, decimals!)
  //       );
  //     }

  //     const txResult = await makeTransaction(interaction.buildTransaction());
  //   };

  useEffect(() => {
    (async () => {
      const streamingContract = new StreamingContract();
      const stream = await streamingContract.getStream(4);
      console.log(stream.firstValue?.valueOf());
    })();
  });

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
        token_nonce: 0,
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

  return (
    <RequiresAuth>
      <div className="flex justify-center w-full mt-20">
        <div className="flex flex-col items-start space-y-2 max-w-screen-md">create new stream</div>
        <button onClick={test}>create stream</button>
        <button onClick={cancelTest}>cancel stream</button>
        <button onClick={claimTest}>claim cancel stream</button>
      </div>
    </RequiresAuth>
  );
};

export default Home;
