import { useMemo } from 'react';

interface IProgressBarProps {
  value: number | string;
}

export default function ProgressBarSmall({ value }: IProgressBarProps) {
  const finalValue = useMemo(() => {
    if (typeof value === "number") {
      return Math.min(value, 100).toString();
    } else {
      return Math.min(parseFloat(value), 100).toString();
    }
  }, [value]);
  return (
    <div className={`w-32 h-[5px] bg-neutral-800 rounded-full`}>
      <div className={`h-[5px] bg-primary rounded-full`} style={{ width: `${finalValue}%` }}></div>
    </div>
  );
}
