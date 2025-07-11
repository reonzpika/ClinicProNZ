import { Clock } from 'lucide-react';

import { useCountdown } from '@/src/shared/hooks/useCountdown';

type CountdownProps = {
  targetDate: Date;
  label?: string;
  className?: string;
};

export const Countdown = ({ targetDate, label = 'Time remaining', className = '' }: CountdownProps) => {
  const timeLeft = useCountdown(targetDate);

  if (timeLeft.isExpired) {
    return (
      <div className={`rounded-lg bg-gray-100 p-4 text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Clock className="size-4" />
          <span className="text-sm font-medium">Launch period has ended</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-gradient-to-r from-nz-blue-50 to-nz-green-50 p-4 text-center ${className}`}>
      <div className="mb-2 flex items-center justify-center gap-2 text-nz-blue-700">
        <Clock className="size-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-nz-blue-900 sm:gap-4 sm:text-3xl">
        <div className="flex flex-col items-center">
          <span>{timeLeft.days}</span>
          <span className="text-xs font-normal text-nz-blue-600">days</span>
        </div>
        <span className="text-nz-blue-400">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs font-normal text-nz-blue-600">hours</span>
        </div>
        <span className="text-nz-blue-400">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs font-normal text-nz-blue-600">mins</span>
        </div>
        <span className="text-nz-blue-400">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs font-normal text-nz-blue-600">secs</span>
        </div>
      </div>
    </div>
  );
};
