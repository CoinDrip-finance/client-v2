import { ArrowDownTrayIcon, EllipsisHorizontalIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { KeyedMutator } from 'swr';

import { IStreamResponse, StreamStatus } from '../../types';
import { getStreamStatus } from '../../utils/presentation';
import CancelPopup from './CancelPopup';
import ClaimAfterCancelPopup from './ClaimAfterCancelPopup';
import ClaimPopup from './ClaimPopup';

interface StreamActionProps {
  data: IStreamResponse;
  refresh: KeyedMutator<IStreamResponse>;
}

export default function StreamActions({ data, refresh }: StreamActionProps) {
  const [claimPopupOpen, setClaimPopupOpen] = useState(false);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [claimAfterCancelPopupOpen, setClaimAfterCancelPopupOpen] = useState(false);

  const streamStatus = useMemo(() => {
    return getStreamStatus(data);
  }, [data]);

  const onClaimPopupClose = () => {
    refresh();
    setClaimPopupOpen(false);
  };

  const onCancelPopupClose = () => {
    refresh();
    setCancelPopupOpen(false);
  };

  const onClaimAfterCancelPopupClose = () => {
    refresh();
    setClaimAfterCancelPopupOpen(false);
  };

  return (
    <>
      <div className="mt-8">
        <div className="text-neutral-400">Actions</div>

        <div className="mt-2 flex justify-between space-x-8">
          <button
            className="stream-action-button"
            onClick={() =>
              streamStatus === StreamStatus.Canceled ? setClaimAfterCancelPopupOpen(true) : setClaimPopupOpen(true)
            }
            disabled={streamStatus === StreamStatus.Finished || streamStatus === StreamStatus.Pending}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Withdraw
          </button>
          <button
            className="stream-action-button"
            onClick={() => setCancelPopupOpen(true)}
            disabled={
              !data?.stream?.can_cancel ||
              streamStatus === StreamStatus.Finished ||
              streamStatus === StreamStatus.Settled ||
              streamStatus === StreamStatus.Canceled
            }
          >
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
      <CancelPopup data={data} open={cancelPopupOpen} onClose={onCancelPopupClose} />
      <ClaimAfterCancelPopup data={data} open={claimAfterCancelPopupOpen} onClose={onClaimAfterCancelPopupClose} />
    </>
  );
}
