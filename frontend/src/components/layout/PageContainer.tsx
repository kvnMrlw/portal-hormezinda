import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

// Container responsivo base para paginas do frontend.
export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn('mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-12', className)}>{children}</main>;
}
