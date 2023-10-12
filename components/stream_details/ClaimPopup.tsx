import { useAuth } from "@elrond-giants/erd-react-hooks/dist";
import { ArrowDownTrayIcon, BanknotesIcon, ChartPieIcon, KeyIcon, WalletIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import { network } from "../../config";
import { useTransaction } from "../../hooks/useTransaction";
import { IStreamResponse } from "../../types";
import StreamingContract from "../../utils/contracts/streamContract";
import { denominate } from "../../utils/economics";
import { formatNumber, getAmountStreamed, getClaimedAmount, getDepositAmount } from "../../utils/presentation";
import StreamDetailsBasePopup from "./PopupBase";
import StreamPropItem from "./StreamPropItem";

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
    if (!open) return;
    (async () => {
      const {
        data: { owner },
      } = await axios.get(`${network.apiAddress}/nfts/${data?.nft?.identifier}`);
      setStreamRecipient(owner);
    })();
  }, [data?.nft?.identifier, open]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
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

        {streamRecipient !== address && (
          <div className="bg-neutral-800 border border-neutral-700 py-2 px-4 rounded-lg text-sm mt-8">
            <div className="flex items-center font-semibold text-orange-400">
              <KeyIcon className="w-5 h-5 mr-2" />
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
      </div>
    </StreamDetailsBasePopup>
  );
}
