import * as React from 'react';

import { cn } from '@/src/lib/utils';

export type SectionProps = {
  title?: React.ReactNode;
  description?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('w-full space-y-4', className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-2">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    );
  },
);
Section.displayName = 'Section';

export { Section };
