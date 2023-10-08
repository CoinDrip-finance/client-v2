import { ArrowDownTrayIcon, EllipsisHorizontalIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { KeyedMutator } from 'swr';

import { IStreamResponse } from '../../types';
import ClaimPopup from './ClaimPopup';

interface StreamActionProps {
  data: IStreamResponse;
  refresh: KeyedMutator<IStreamResponse>;
}

export default function StreamActions({ data, refresh }: StreamActionProps) {
  const [claimPopupOpen, setClaimPopupOpen] = useState(false);

  const onClaimPopupClose = () => {
    refresh();
    setClaimPopupOpen(false);
  };

  return (
    <>
      <div className="mt-8">
        <div className="text-neutral-400">Actions</div>

        <div className="mt-2 flex justify-between space-x-8">
          <button className="stream-action-button" onClick={() => setClaimPopupOpen(true)}>
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Withdraw
          </button>
          <button className="stream-action-button">
            <XCircleIcon className="w-5 h-5 mr-2" />
            Cancel stream
          </button>
          <button className="stream-action-button">
            <EllipsisHorizontalIcon className="w-5 h-5 mr-2" />
            More options
          </button>
        </div>
      </div>

      <ClaimPopup data={data} open={claimPopupOpen} onClose={onClaimPopupClose} />
    </>
  );
}
