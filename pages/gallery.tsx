import { AcademicCapIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import StreamTypeItem, { StreamItemType } from '../components/gallery/StreamTypeItem';
import BackButtonWrapper from '../components/shared/BackWrapper';
import Layout from '../components/shared/Layout';
import { StreamType } from '../types';
import { homePath } from '../utils/routes';

export const streamTypes: StreamItemType[] = [
  { id: StreamType.Linear, title: "Linear", description: "Send assets at a constant rate/second" },
  {
    id: StreamType.CliffLinear,
    title: "Linear with cliff",
    description: "Just like Linear stream but with a cliff period",
  },
  {
    id: StreamType.Steps,
    title: "Unlock in steps",
    description: "Traditional vesting contract with periodical unlocks.",
  },
];

export default function GallerPage() {
  return (
    <Layout>
      <BackButtonWrapper href={homePath}>
        <h1 className="font-medium text-xl">Create a stream</h1>
        <p className="mt-16 font-light text-sm">Select a Stream shape</p>

        <div className="mt-4 flex flex-col space-y-8">
          {streamTypes.map((type) => (
            <StreamTypeItem key={type.id} item={type} />
          ))}

          <div className="flex bg-neutral-950 border border-neutral-900 rounded-lg p-5 justify-between items-center opacity-50 cursor-not-allowed">
            <div className="flex flex-col">
              <div className="font-medium text-lg mb-1">Launching soon</div>
              <div className="font-light text-sm mb-6">More advanced stream types coming soon</div>

              <button className="auth-button py-1 font-sm w-40 cursor-not-allowed">Pick this</button>
            </div>
            <div>
              <LockClosedIcon className="h-24 w-24 text-neutral-500" />
            </div>
          </div>

          {/* TODO: Add a link to the docs */}
          <a href="#" className="underline flex items-center text-sm font-light justify-center">
            <AcademicCapIcon className="h-4 w-4 mr-2" /> Learn more about token streams
          </a>
        </div>
      </BackButtonWrapper>
    </Layout>
  );
}
