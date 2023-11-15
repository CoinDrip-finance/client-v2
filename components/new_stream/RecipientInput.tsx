import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import { ArrowTopRightOnSquareIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import isMobile from 'is-mobile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { network } from '../../config';
import { classNames, getShortAddress } from '../../utils/presentation';
import ScanAddressModal from './ScanAddressModal';

const getHeroTagByAdress = async (address: string): Promise<string | null> => {
  try {
    const {
      data: { username },
    } = await axios.get(`${network.apiAddress}/accounts/${address}?fields=username`);

    return username || null;
  } catch (e) {
    return null;
  }
};

const getAddressByHeroTag = async (heroTag: string): Promise<string | null> => {
  try {
    const {
      data: { address },
    } = await axios.get(`${network.apiAddress}/usernames/${heroTag}`);

    return address || null;
  } catch (e) {
    return null;
  }
};

export default function RecipientInput() {
  const { address, balance } = useAuth();
  const { setValue, register } = useFormContext();
  const [recipientInputValue, setRecipientInputValue] = useState<string>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [recipientHeroTag, setRecipientHeroTag] = useState<string>();
  const [scanQrOpen, setScanQrOpen] = useState(false);
  const inputRef = useRef(null);

  const isAddress = useMemo(() => {
    return recipientInputValue?.startsWith("erd1");
  }, [recipientInputValue]);

  useEffect(() => {
    if (!recipientInputValue) {
      setRecipientHeroTag("");
      setRecipientAddress("");
      return;
    }
    (async () => {
      if (recipientInputValue?.startsWith("erd1")) {
        setRecipientAddress(recipientInputValue);
        const heroTag = await getHeroTagByAdress(recipientInputValue);
        if (heroTag) setRecipientHeroTag(heroTag);
        else setRecipientHeroTag("");
      } else {
        const address = await getAddressByHeroTag(recipientInputValue);
        if (address) {
          setRecipientAddress(address);
          setRecipientHeroTag(recipientInputValue);
        } else {
          setRecipientHeroTag("");
          setRecipientAddress("");
        }
      }
    })();
  }, [recipientInputValue]);

  const displayAdditionalInfo = useMemo(() => {
    return (isAddress && recipientHeroTag) || (!isAddress && recipientAddress && recipientHeroTag);
  }, [isAddress, recipientAddress, recipientHeroTag]);

  useEffect(() => {
    if (!recipientAddress) return;
    setValue("recipient", recipientAddress);
  }, [recipientAddress]);

  return (
    <div>
      <div className="block font-light text-sm mb-2">Recipient herotag/address</div>
      <div className="relative w-full">
        <input
          type="text"
          ref={inputRef}
          className={classNames(
            "bg-neutral-950 rounded-lg border border-neutral-900 focus:border-neutral-900 h-12 font-medium text-sm focus:outline-none pl-4 w-full",
            displayAdditionalInfo ? "pr-36" : isMobile() ? "pr-12" : "pr-4"
          )}
          onBlur={({ target: { value } }) => setRecipientInputValue(value)}
        />

        {displayAdditionalInfo && (
          <a
            href={`${network.explorerAddress}/accounts/${recipientAddress}`}
            target="_blank"
            className={classNames(
              "h-8 absolute rounded-lg text-sm px-2 mt-2 bg-neutral-800 font-light text-neutral-400 inline-flex items-center",
              isMobile() ? "right-12" : "right-2"
            )}
            rel="noreferrer"
          >
            {isAddress
              ? `@${recipientHeroTag?.replace(".elrond", "")}`
              : getShortAddress(recipientAddress as string, 6)}{" "}
            <ArrowTopRightOnSquareIcon className="ml-2 w-3 h-3" />
          </a>
        )}

        {isMobile() && (
          <div className="h-8 absolute right-2 rounded-lg px-1 top-2 bg-neutral-800">
            <QrCodeIcon className="h-6 mt-1 text-neutral-400 " onClick={() => setScanQrOpen(true)} />
          </div>
        )}
      </div>

      <ScanAddressModal
        open={scanQrOpen}
        onClose={(address) => {
          if (address) {
            setRecipientInputValue(address);
            // @ts-ignore
            inputRef.current.value = address;
          }

          setScanQrOpen(false);
        }}
      />
    </div>
  );
}
