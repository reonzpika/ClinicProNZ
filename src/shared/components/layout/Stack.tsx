import * as React from 'react';

import { cn } from '@/lib/utils';

export type StackProps = {
  spacing?: 'none' | 'sm' | 'md' | 'lg';
} & React.HTMLAttributes<HTMLDivElement>;

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full',
          {
            'space-y-0': spacing === 'none',
            'space-y-2': spacing === 'sm',
            'space-y-4': spacing === 'md',
            'space-y-6': spacing === 'lg',
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
Stack.displayName = 'Stack';

export { Stack };
