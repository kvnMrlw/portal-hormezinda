import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { ContentArea } from './ContentArea';
import { MainContainer } from './MainContainer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BirthdayWelcome } from '../social/BirthdayWelcome';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-transparent">
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
      />
      <MainContainer>
        <Topbar
          collapsed={collapsed}
          onLogout={handleLogout}
          onMenuClick={() => setIsMobileOpen(true)}
          onToggleSidebar={() => setCollapsed((current) => !current)}
        />
        <ContentArea>{children}</ContentArea>
        <BirthdayWelcome />
        <footer className="sr-only" />
      </MainContainer>
    </div>
  );
}
