import type { ReactNode } from 'react';

import { ContentArea } from './ContentArea';
import { MainContainer } from './MainContainer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type AppShellProps = {
  children: ReactNode;
  title: string;
};

export function AppShell({ children, title }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-brand-lightGray">
      <Sidebar />
      <MainContainer>
        <Topbar title={title} />
        <ContentArea>{children}</ContentArea>
      </MainContainer>
    </div>
  );
}
