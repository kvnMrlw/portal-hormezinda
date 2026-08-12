import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

type ContentAreaProps = {
  children: ReactNode;
  className?: string;
};

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8', className)}>
      {children}
    </div>
  );
}
