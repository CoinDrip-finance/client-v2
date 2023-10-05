import { PlusSmallIcon } from '@heroicons/react/20/solid';

import { classNames } from '../utils/presentation';
import { galleryPath } from '../utils/routes';
import ActionButton from './shared/ActionButton';

interface InfoCardProps {
  showButton?: boolean;
}

export default function InfoCard({ showButton }: InfoCardProps) {
  return (
    <div className="p-7 bg-neutral-950 border border-neutral-900 rounded-lg relative">
      <div className="font-medium text-xl mb-2">We know how important is to get paid on time.</div>
      <div className="text-light text-sm text-neutral-300">
        With Coindrip, on time means <span className="text-primary">every second.</span>
      </div>
      {showButton && (
        <ActionButton
          Icon={PlusSmallIcon}
          label="Start streaming"
          href={galleryPath}
          className="primary-action-button flex items-center py-2 mt-6"
        />
      )}
      <img
        src="/card-hour-glass.svg"
        className={classNames("right-10 bottom-0 absolute", showButton ? "h-40" : "h-32")}
      />
    </div>
  );
}
