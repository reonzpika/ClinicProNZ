import * as React from 'react';

import { cn } from '@/lib/utils';

export type ContainerProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fluid';
} & React.HTMLAttributes<HTMLDivElement>;

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          {
            'max-w-screen-sm px-4': size === 'sm',
            'max-w-screen-md px-4': size === 'md',
            'max-w-screen-lg px-4': size === 'lg',
            'max-w-screen-xl px-4': size === 'xl',
            'px-4 sm:px-6 lg:px-8': size === 'fluid',
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
Container.displayName = 'Container';

export { Container };
