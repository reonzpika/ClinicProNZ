import * as React from 'react';

import { cn } from '@/lib/utils';

export type GridProps = {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  responsive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = false, children, ...props }, ref) => {
    const getGridClasses = () => {
      if (responsive && cols === 3) {
        return 'grid-cols-1 lg:grid-cols-3';
      }

      return {
        'grid-cols-1': cols === 1,
        'grid-cols-2': cols === 2,
        'grid-cols-3': cols === 3,
        'grid-cols-4': cols === 4,
        'grid-cols-5': cols === 5,
        'grid-cols-6': cols === 6,
        'grid-cols-7': cols === 7,
        'grid-cols-8': cols === 8,
        'grid-cols-9': cols === 9,
        'grid-cols-10': cols === 10,
        'grid-cols-11': cols === 11,
        'grid-cols-12': cols === 12,
      };
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid w-full',
          getGridClasses(),
          {
            'gap-0': gap === 'none',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Grid.displayName = 'Grid';

export { Grid };
