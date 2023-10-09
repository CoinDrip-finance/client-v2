import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import { ArrowDownTrayIcon, BanknotesIcon, ChartPieIcon, KeyIcon, WalletIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { network } from '../../config';
import { useTransaction } from '../../hooks/useTransaction';
import { IStreamResponse } from '../../types';
import StreamingContract from '../../utils/contracts/streamContract';
import { denominate } from '../../utils/economics';
import { formatNumber, getAmountStreamed, getClaimedAmount, getDepositAmount } from '../../utils/presentation';
import StreamDetailsBasePopup from './PopupBase';
import StreamPropItem from './StreamPropItem';

interface ClaimAfterCancelPopupProps {
  data: IStreamResponse;
  open: boolean;
  onClose: () => void;
}

export default function ClaimAfterCancelPopup({ data, open, onClose }: ClaimAfterCancelPopupProps) {
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
    const interaction = streamingContract.claimAfterCancel(data.id, address === streamRecipient);

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

  const readyToClaim = useMemo(() => {
    if (address === streamRecipient) {
      return denominate(
        data.stream.balance?.balances_after_cancel?.recipient_balance || 0,
        5,
        data.stream.payment.token_decimals
      ).toNumber();
    } else if (address === data.stream.sender) {
      return denominate(
        data.stream.balance?.balances_after_cancel?.sender_balance || 0,
        5,
        data.stream.payment.token_decimals
      ).toNumber();
    }
    return 0;
  }, [data.stream.balance?.recipient_balance, deposited, amountStreamed, streamRecipient, address]);

  return (
    <StreamDetailsBasePopup
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Withdraw remaining funds"
      hideSubmitButton={readyToClaim <= 0}
      submitButtonLabel="Withdraw"
    >
      <div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <StreamPropItem
            label="Deposited"
            value={`${deposited} ${data.stream.payment.token_name}`}
            Icon={WalletIcon}
          />
          <StreamPropItem
            label="Streamed"
            value={`${formatNumber(amountStreamed.value)} ${data.stream.payment.token_name}`}
            Icon={ChartPieIcon}
          />
          <StreamPropItem
            label="Withdrawn"
            value={`${formatNumber(claimed.value)} ${data.stream.payment.token_name}`}
            Icon={ArrowDownTrayIcon}
          />
          <StreamPropItem
            label="Withdrawable"
            value={`${formatNumber(readyToClaim)} ${data.stream.payment.token_name}`}
            Icon={BanknotesIcon}
          />
        </div>

        {streamRecipient !== address && data?.stream?.sender !== address && (
          <div className="bg-neutral-800 border border-neutral-700 py-2 px-4 rounded-lg text-sm mt-8">
            <div className="flex items-center font-semibold text-orange-400">
              <KeyIcon className="w-5 h-5 mr-2" />
              Missing permissions
            </div>
            <p className="font-light mt-2">
              You are not the recipient or sender of the stream. Only the sender or recipient can cancel this stream.
            </p>
          </div>
        )}
      </div>
    </StreamDetailsBasePopup>
  );
}
