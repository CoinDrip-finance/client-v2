import { IStreamResource } from '../../types';
import StreamTableItem from './StreamTableItem';

export default function StreamsTable({ streams }: { streams: IStreamResource[] }) {
  return (
    <table className="table-fixed w-full streams-table">
      <thead>
        <tr className="text-left uppercase">
          <th>status</th>
          <th>from/to</th>
          <th>value</th>
          <th>timeline</th>
          <th>streamed</th>
        </tr>
      </thead>
      <tbody>
        {streams.map((stream) => (
          <StreamTableItem stream={stream} key={stream.id} />
        ))}
      </tbody>
    </table>
  );
}
