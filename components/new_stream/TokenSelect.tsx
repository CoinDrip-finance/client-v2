import { useAuth } from '@elrond-giants/erd-react-hooks/dist';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { denominate } from '../../utils/economics';
import { classNames } from '../../utils/presentation';

export interface EsdtToken {
  identifier: string;
  icon?: string;
  decimals: number;
  balance: string;
}

export default function TokenSelect({ onSelect }: { onSelect: (token: EsdtToken) => void }) {
  const { address, balance } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedPerson, _setSelectedPerson] = useState<EsdtToken>();
  const [tokens, setTokens] = useState<EsdtToken[]>([]);
  const { setValue } = useFormContext();

  useEffect(() => {
    (async () => {
      const { data } = await axios.get("/api/esdts", { params: { address } });

      data.unshift({
        identifier: "EGLD",
        icon: "/new_stream/egld_icon.png",
        decimals: 18,
        balance: balance,
      });

      setTokens(data);
    })();
  }, []);

  const filteredPeople = useMemo(() => {
    return query === ""
      ? tokens
      : tokens.filter((token) => {
          return token.identifier.toLowerCase().includes(query.toLowerCase());
        });
  }, [query, tokens]);

  const setSelectedPerson = (token: EsdtToken) => {
    setValue("payment_token", token.identifier);
    onSelect(token);
    _setSelectedPerson(token);
  };

  return (
    <Combobox as="div" value={selectedPerson} onChange={setSelectedPerson}>
      <Combobox.Label className="block font-light text-sm mb-2">Token</Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Button className="w-full">
          <Combobox.Input
            className="block w-full cursor-pointer rounded-lg bg-neutral-950 px-12 h-12 text-white font-medium text-sm border border-neutral-900 border:border-neutral-800 focus:border-neutral-800 focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(token: EsdtToken) => token?.identifier}
            autoComplete="false"
            readOnly={true}
          />
          <div className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </Combobox.Button>

        {selectedPerson && (
          <div className="absolute inset-y-0 left-4 flex items-center">
            <img src={selectedPerson?.icon} alt="" className="h-6 w-6 rounded-full" />
          </div>
        )}

        {filteredPeople.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg-neutral-800 py-1 text-sm shadow-lg ring-1 ring-neutral-700 focus:outline-none font-medium">
            {filteredPeople.map((token) => (
              <Combobox.Option
                key={token.identifier}
                value={token}
                className={({ active }) =>
                  classNames(
                    "relative cursor-pointer select-none py-2 pl-4 pr-9",
                    active ? "text-white" : "text-neutral-400"
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      <img src={token.icon} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" />
                      <span className={classNames("ml-3 truncate", selected ? "text-white" : "")}>
                        {token.identifier}{" "}
                        <span className={classNames(active || selected ? "text-neutral-100" : "text-neutral-500")}>
                          ({denominate(token.balance, 2, token.decimals).toLocaleString()})
                        </span>
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-white"
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}
