import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import { KeyIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { network } from '../../config';
import { useTransaction } from '../../hooks/useTransaction';
import { IStreamResponse } from '../../types';
import StreamingContract from '../../utils/contracts/streamContract';
import { denominate } from '../../utils/economics';
import { formatNumber, getAmountStreamed, getClaimedAmount, getDepositAmount } from '../../utils/presentation';
import ProgressBarSmall from '../stream_list/ProgressBarSmall';
import StreamDetailsBasePopup from './PopupBase';

interface CancelPopupProps {
  data: IStreamResponse;
  open: boolean;
  onClose: () => void;
}

export default function CancelPopup({ data, open, onClose }: CancelPopupProps) {
  const { address } = useAuth();
  const { makeTransaction } = useTransaction();
  const [streamRecipient, setStreamRecipient] = useState<string>();

  useEffect(() => {
    if (!data?.nft?.identifier) return;
    (async () => {
      const {
        data: { owner },
      } = await axios.get(`${network.apiAddress}/nfts/${data?.nft?.identifier}`);
      setStreamRecipient(owner);
    })();
  }, [data?.nft?.identifier]);

  const onSubmit = async () => {
    if (!address) return;
    const streamingContract = new StreamingContract(address);
    const interaction = streamingContract.cancelStream(data.id, address === streamRecipient);

    try {
      const txResult = await makeTransaction(interaction.buildTransaction());
    } finally {
      onClose();
    }
  };

  const deposited = useMemo(() => {
    return getDepositAmount(data);
  }, [data]);

  const amountStreamed = useMemo(() => {
    return getAmountStreamed(data);
  }, [data]);

  const claimed = useMemo(() => {
    return getClaimedAmount(data);
  }, [data]);

  const readyToClaimByRecipient = useMemo(() => {
    return denominate(data.stream.balance?.recipient_balance || 0, 5, data.stream.payment.token_decimals).toNumber();
  }, [data.stream.balance?.recipient_balance]);

  const readyToClaimBySender = useMemo(() => {
    return deposited - amountStreamed.value;
  }, [deposited, amountStreamed]);

  return (
    <StreamDetailsBasePopup
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Cancel stream"
      hideSubmitButton={streamRecipient !== address && data?.stream?.sender !== address}
      submitButtonLabel="Cancel"
    >
      <div>
        {streamRecipient !== address && data?.stream?.sender !== address && (
          <div className="bg-neutral-800 py-2 px-4 rounded-lg text-orange-400 text-sm">
            <div className="flex items-center font-medium">
              <KeyIcon className="w-4 h-4 mr-2" />
              Missing permissions
            </div>
            <p className="font-light mt-2">
              You are not the recipient or sender of the stream. Only the sender or recipient can cancel this stream.
            </p>
          </div>
        )}

        <ul className="mt-4">
          <li>
            Deposited: {formatNumber(deposited)} {data.stream.payment.token_name}
          </li>
          <li className="flex items-center">
            Streamed: {formatNumber(amountStreamed.value)} {data.stream.payment.token_name}
            <div className="mx-4">
              <ProgressBarSmall value={amountStreamed.percent} />
            </div>
            {`${amountStreamed.percent}%`}
          </li>
          <li className="flex items-center">
            Withdrawn: {formatNumber(claimed.value)} {data.stream.payment.token_name}
            <div className="mx-4">
              <ProgressBarSmall value={claimed.percent} />
            </div>
            {`${claimed.percent}%`}
          </li>

          <li className="mt-4">
            Withdrawable by recipient: {formatNumber(readyToClaimByRecipient)} {data.stream.payment.token_name}
          </li>
          <li className="mt-4">
            Withdrawable by sender: {formatNumber(readyToClaimBySender)} {data.stream.payment.token_name}
          </li>
        </ul>
      </div>
    </StreamDetailsBasePopup>
  );
}
