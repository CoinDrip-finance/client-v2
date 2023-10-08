import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

import { classNames } from '../../utils/presentation';

interface BackButtonWrapperProps {
  href: string;
  children: any;
  size?: string;
}

export default function BackButtonWrapper({ href, children, size = "max-w-screen-xs" }: BackButtonWrapperProps) {
  return (
    <div className={classNames("w-full mx-auto relative", size)}>
      <Link href={href}>
        <button className="p-1 rounded-full bg-neutral-900 absolute -left-16 -top-1">
          <ChevronLeftIcon className="text-white w-6 h-6" />
        </button>
      </Link>
      {children}
    </div>
  );
}
