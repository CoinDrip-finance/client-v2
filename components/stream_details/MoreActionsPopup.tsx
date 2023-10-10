import { useEffect, useMemo, useState } from 'react';

import StreamDetailsBasePopup from './PopupBase';
import { StreamActionType } from './StreamActions';

interface MoreActionsPopupProps {
  open: boolean;
  onClose: (action?: StreamActionType) => void;
}

export default function MoreActionsPopup({ open, onClose }: MoreActionsPopupProps) {
  const onCloseWrapper = () => {
    onClose();
  };

  return (
    <StreamDetailsBasePopup open={open} onClose={onCloseWrapper} title="More actions">
      <div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div onClick={() => onClose(StreamActionType.Claim)}>withdraw</div>
        </div>
      </div>
    </StreamDetailsBasePopup>
  );
}
