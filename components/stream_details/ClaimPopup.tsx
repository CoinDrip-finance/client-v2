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

interface ClaimPopupProps {
  data: IStreamResponse;
  open: boolean;
  onClose: () => void;
}

export default function ClaimPopup({ data, open, onClose }: ClaimPopupProps) {
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
    const interaction = streamingContract.claimStream(data.id);

    try {
      const txResult = await makeTransaction(interaction.buildTransaction());
    } finally {
      onClose();
    }
  };

  const deposited = useMemo(() => {
    return formatNumber(getDepositAmount(data));
  }, [data]);

  const amountStreamed = useMemo(() => {
    return getAmountStreamed(data);
  }, [data]);

  const claimed = useMemo(() => {
    return getClaimedAmount(data);
  }, [data]);

  const readyToClaim = useMemo(() => {
    return denominate(data.stream.balance?.recipient_balance || 0, 5, data.stream.payment.token_decimals).toNumber();
  }, [data.stream.balance?.recipient_balance]);

  return (
    <StreamDetailsBasePopup
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Withdraw from stream"
      hideSubmitButton={streamRecipient !== address || readyToClaim <= 0}
      submitButtonLabel="Withdraw"
    >
      <div>
        {streamRecipient !== address && (
          <div className="bg-neutral-800 py-2 px-4 rounded-lg text-orange-400 text-sm">
            <div className="flex items-center font-medium">
              <KeyIcon className="w-4 h-4 mr-2" />
              Missing permissions
            </div>
            <p className="font-light mt-2">
              You are not the recipient of the stream. Only the owner of NFT{" "}
              <a
                href={`${network.explorerAddress}/nfts/${data.nft?.identifier}`}
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                {data.nft?.identifier}
              </a>{" "}
              can withdraw from this stream.
            </p>
          </div>
        )}

        <ul className="mt-4">
          <li>
            Deposited: {deposited} {data.stream.payment.token_name}
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
            Withdrawable: {formatNumber(readyToClaim)} {data.stream.payment.token_name}
          </li>
        </ul>
      </div>
    </StreamDetailsBasePopup>
  );
}
