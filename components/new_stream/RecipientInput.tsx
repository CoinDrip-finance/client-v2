import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { network } from '../../config';
import { classNames, getShortAddress } from '../../utils/presentation';

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

  const isAddress = useMemo(() => {
    return recipientInputValue?.startsWith("erd1");
  }, [recipientInputValue]);

  useEffect(() => {
    if (!recipientInputValue) return;
    (async () => {
      if (recipientInputValue?.startsWith("erd1")) {
        setRecipientAddress(recipientInputValue);
        const heroTag = await getHeroTagByAdress(recipientInputValue);
        if (heroTag) setRecipientHeroTag(heroTag);
      } else {
        const address = await getAddressByHeroTag(recipientInputValue);
        if (address) {
          setRecipientAddress(address);
          setRecipientHeroTag(recipientInputValue);
        }
      }
    })();
  }, [recipientInputValue]);

  const displayAdditionalInfo = useMemo(() => {
    return (isAddress && recipientHeroTag) || (!isAddress && recipientAddress && recipientHeroTag);
  }, [isAddress, recipientAddress, recipientHeroTag]);

  useEffect(() => {
    setValue("recipient", recipientAddress);
  }, [recipientAddress]);

  return (
    <div>
      <div className="block font-light text-sm mb-2">Recipient herotag/address</div>
      <div className="relative w-full">
        <input
          type="text"
          className={classNames(
            "bg-neutral-950 rounded-lg border border-neutral-900 focus:border-neutral-900 h-12 font-medium text-sm focus:outline-none pl-4 w-full",
            displayAdditionalInfo ? "pr-36" : "pr-4"
          )}
          onBlur={({ target: { value } }) => setRecipientInputValue(value)}
        />

        {displayAdditionalInfo && (
          <a
            href={`${network.explorerAddress}/accounts/${recipientAddress}`}
            target="_blank"
            className="h-8 absolute right-2 rounded-lg text-sm px-2 mt-2 bg-neutral-800 font-light text-neutral-400 inline-flex items-center"
            rel="noreferrer"
          >
            {isAddress
              ? `@${recipientHeroTag?.replace(".elrond", "")}`
              : getShortAddress(recipientAddress as string, 6)}{" "}
            <ArrowTopRightOnSquareIcon className="ml-2 w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
