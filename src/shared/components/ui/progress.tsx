import * as React from 'react';

import { cn } from '@/src/lib/utils';

type ProgressProps = {
  value: number;
  max?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max(value, 0), max);

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className,
        )}
        {...props}
      >
        <div
          className="size-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  },
);

Progress.displayName = 'Progress';

export { Progress };
