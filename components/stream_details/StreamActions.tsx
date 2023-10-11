import {
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  HandRaisedIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { KeyedMutator } from 'swr';

import { IStreamResponse, StreamStatus } from '../../types';
import { getStreamStatus } from '../../utils/presentation';
import CancelPopup from './CancelPopup';
import ClaimAfterCancelPopup from './ClaimAfterCancelPopup';
import ClaimPopup from './ClaimPopup';
import MoreActionsPopup, { MoreActionsItem } from './MoreActionsPopup';

interface StreamActionProps {
  data: IStreamResponse;
  refresh: KeyedMutator<IStreamResponse>;
}

export enum StreamActionType {
  Claim,
  Cancel,
  ClaimAfterCancel,
  RenounceCancelStream,
  Transfer,
  Share,
}

export default function StreamActions({ data, refresh }: StreamActionProps) {
  const [claimPopupOpen, setClaimPopupOpen] = useState(false);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [claimAfterCancelPopupOpen, setClaimAfterCancelPopupOpen] = useState(false);
  const [moreActionsPopup, setMoreActionsPopup] = useState(false);

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

  const onMoreActionsPopupClose = (action?: StreamActionType) => {
    setMoreActionsPopup(false);

    switch (action) {
      case StreamActionType.Claim:
        setClaimPopupOpen(true);
        break;
      case StreamActionType.Cancel:
        setCancelPopupOpen(true);
        break;
      case StreamActionType.ClaimAfterCancel:
        setClaimAfterCancelPopupOpen(true);
        break;
    }
  };

  const disabledActions = {
    [StreamActionType.Claim]: streamStatus === StreamStatus.Finished || streamStatus === StreamStatus.Pending,
    [StreamActionType.Cancel]:
      !data?.stream?.can_cancel ||
      streamStatus === StreamStatus.Finished ||
      streamStatus === StreamStatus.Settled ||
      streamStatus === StreamStatus.Canceled,
  };

  const allActionsList: MoreActionsItem[] = [
    {
      type: StreamActionType.Claim,
      title: "Withdraw from stream",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eaque, delectus.",
      Icon: ArrowDownTrayIcon,
      buttonLabel: "Withdraw",
      disabled: disabledActions[StreamActionType.Claim],
    },
    {
      type: StreamActionType.Cancel,
      title: "Cancel stream",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eaque, delectus.",
      Icon: XCircleIcon,
      buttonLabel: "Cancel",
      disabled: disabledActions[StreamActionType.Cancel],
    },
    {
      type: StreamActionType.RenounceCancelStream,
      title: "Renounce cancelability",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eaque, delectus.",
      Icon: HandRaisedIcon,
      buttonLabel: "Renounce",
      disabled: true,
    },
    {
      type: StreamActionType.Transfer,
      title: "Transfer Stream",
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eaque, delectus.",
      Icon: PaperAirplaneIcon,
      buttonLabel: "Transfer",
      disabled: true,
    },
  ];

  return (
    <>
      <div className="mt-8">
        <div className="text-neutral-400">Actions</div>

        <div className="mt-2 sm:flex justify-between items-center grid grid-cols-2 gap-4">
          <button
            className="stream-action-button"
            onClick={() =>
              streamStatus === StreamStatus.Canceled ? setClaimAfterCancelPopupOpen(true) : setClaimPopupOpen(true)
            }
            disabled={disabledActions[StreamActionType.Claim]}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Withdraw
          </button>
          <button
            className="stream-action-button"
            onClick={() => setCancelPopupOpen(true)}
            disabled={disabledActions[StreamActionType.Cancel]}
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Cancel stream
          </button>
          <button className="stream-action-button" onClick={() => setMoreActionsPopup(true)}>
            <EllipsisHorizontalIcon className="w-5 h-5 mr-2" />
            More options
          </button>
        </div>
      </div>

      <ClaimPopup data={data} open={claimPopupOpen} onClose={onClaimPopupClose} />
      <CancelPopup data={data} open={cancelPopupOpen} onClose={onCancelPopupClose} />
      <ClaimAfterCancelPopup data={data} open={claimAfterCancelPopupOpen} onClose={onClaimAfterCancelPopupClose} />

      <MoreActionsPopup open={moreActionsPopup} onClose={onMoreActionsPopupClose} items={allActionsList} />
    </>
  );
}
