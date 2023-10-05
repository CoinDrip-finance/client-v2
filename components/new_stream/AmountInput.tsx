import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { denominate } from '../../utils/economics';
import { EsdtToken } from './TokenSelect';

function formatNumber(num: number, precision = 2) {
  const map = [
    { suffix: "T", threshold: 1e12 },
    { suffix: "B", threshold: 1e9 },
    { suffix: "M", threshold: 1e6 },
    { suffix: "K", threshold: 1e3 },
    { suffix: "", threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  return num;
}

export default function AmountInput({ token }: { token?: EsdtToken }) {
  const { address, balance } = useAuth();
  const { setValue, register } = useFormContext();
  const [maxBalance, setMaxBalance] = useState<BigNumber>(new BigNumber(0));

  useEffect(() => {
    if (!token) return;
    if (token.identifier === "EGLD") {
      setMaxBalance(new BigNumber(balance.toString()));
    } else {
      setMaxBalance(new BigNumber(token.balance));
    }
  }, [token]);

  useEffect(() => {
    setValue("amount", null);
  }, [token?.identifier]);

  const maxBalanceLabel = useMemo(() => {
    const number = denominate(maxBalance.toString(), 2, token?.decimals).toNumber();
    return formatNumber(number);
  }, [maxBalance]);

  const selectMax = (e: any) => {
    e.preventDefault();
    const number = denominate(maxBalance.toString(), token?.decimals, token?.decimals).toNumber();
    setValue("amount", number);
  };

  return (
    <div>
      <div className="block font-light text-sm mb-2">Amount</div>
      <div className="relative w-full">
        <input
          type="number"
          className="bg-neutral-950 rounded-lg border border-neutral-900 focus:border-neutral-900 h-12 font-medium text-sm focus:outline-none px-4 w-full"
          {...register("amount")}
        />

        <button
          className="h-8 absolute right-2 rounded-lg text-sm px-2 mt-2 bg-neutral-800 font-light text-neutral-400"
          onClick={selectMax}
        >
          Max: {maxBalanceLabel}
        </button>
      </div>
    </div>
  );
}
