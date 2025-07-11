import * as React from 'react';

import { cn } from '@/src/lib/utils';

export type AlertProps = {
  variant?: 'default' | 'destructive';
} & React.HTMLAttributes<HTMLDivElement>;

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          {
            'border-blue-500 bg-blue-50 text-blue-900': variant === 'default',
            'border-red-500 bg-red-50 text-red-900': variant === 'destructive',
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
Alert.displayName = 'Alert';

export { Alert };
