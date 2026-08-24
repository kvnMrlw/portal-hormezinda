import type { ReactNode } from 'react';

import { cn } from '../../lib/utils';

type MainContainerProps = {
  children: ReactNode;
  className?: string;
};

export function MainContainer({ children, className }: MainContainerProps) {
  return (
    <main className={cn('portal-main min-h-screen min-w-0 flex-1 bg-[radial-gradient(circle_at_82%_8%,rgba(179,207,229,.45),transparent_26rem),linear-gradient(180deg,#F6FAFD_0%,#EEF5F9_100%)]', className)}>
      {children}
    </main>
  );
}
