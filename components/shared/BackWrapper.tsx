import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

interface BackButtonWrapperProps {
  href: string;
  children: any;
}

export default function BackButtonWrapper({ href, children }: BackButtonWrapperProps) {
  return (
    <div className="w-full mx-auto relative max-w-screen-xs">
      <Link href={href}>
        <button className="p-1 rounded-full bg-neutral-900 absolute -left-16 -top-1">
          <ChevronLeftIcon className="text-white w-6 h-6" />
        </button>
      </Link>
      {children}
    </div>
  );
}
