import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

type MainContainerProps = {
  children: ReactNode;
  className?: string;
};

export function MainContainer({ children, className }: MainContainerProps) {
  return <main className={cn('min-h-screen flex-1 bg-brand-lightGray', className)}>{children}</main>;
}
