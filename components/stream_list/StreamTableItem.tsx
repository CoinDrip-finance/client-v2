import BigNumber from 'bignumber.js';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { IStreamResource, StreamStatus } from '../../types';
import { denominate } from '../../utils/economics';
import { getShortAddress, getStreamStatus } from '../../utils/presentation';
import { streamDetailsPath } from '../../utils/routes';
import ProgressBarSmall from './ProgressBarSmall';

const formatDate = (date: string): string => {
  return moment(date).format("MMM Do 'YY @ H a");
};

export default function StreamTableItem({ stream }: { stream: IStreamResource }) {
  const router = useRouter();

  const status = useMemo(() => {
    return getStreamStatus(stream);
  }, [stream]);

  const address = useMemo(() => {
    return getShortAddress(stream.sender, 8);
  }, [stream]);

  const amount = useMemo(() => {
    console.log(stream);
    return denominate(stream.deposit, 4, stream.decimals).toString();
  }, [stream]);

  const streamedAmount = useMemo(() => {
    if (status === StreamStatus.Pending) return 0;
    if (status === StreamStatus.Settled) return 100;
    const deposit = new BigNumber(stream.deposit);
    if (status === StreamStatus.Finished) {
      if (!stream.canceled) {
        return 100;
      } else {
        return new BigNumber(stream.canceled.streamed_until_cancel).div(deposit).multipliedBy(100).toNumber();
      }
    }

    const startDate = moment(stream.start_time);
    const endDate = moment(stream.end_time);
    const currentDate = moment();

    const duration = endDate.diff(startDate);
    const streamed = currentDate.diff(startDate);
    return streamed / duration;
  }, [stream, status]);

  const redirectToStreamDetails = () => {
    router.push(streamDetailsPath(stream.id));
  };

  return (
    <tr className="font-light" onClick={redirectToStreamDetails}>
      <td>
        <div className="secondary-text">#{stream.id}</div>
        <div>{status}</div>
      </td>
      <td>
        From <span className="font-medium">{address}</span>
      </td>
      <td>
        <div className="secondary-text">{stream.payment_token_label}</div>
        <div>{amount}</div>
      </td>
      <td>
        <div className="secondary-text">{formatDate(stream.start_time)}</div>
        <div>{formatDate(stream.end_time)}</div>
      </td>
      <td>
        <div className="inline-flex items-center space-x-4">
          <ProgressBarSmall value={streamedAmount} /> <span>{streamedAmount.toFixed(0)}%</span>
        </div>
      </td>
    </tr>
  );
}
