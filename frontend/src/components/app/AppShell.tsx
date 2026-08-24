import type { ReactNode } from 'react';
import { useState } from 'react';
import { Bell, Home, Megaphone, UserRound } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { ContentArea } from './ContentArea';
import { MainContainer } from './MainContainer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BirthdayWelcome } from '../social/BirthdayWelcome';
import { cn } from '../../lib/utils';

type AppShellProps = {
  children: ReactNode;
};

const mobileNavigation = [
  { to: '/home', label: 'Início', icon: Home },
  { to: '/avisos', label: 'Avisos', icon: Megaphone },
  { to: '/notificacoes', label: 'Alertas', icon: Bell },
  { to: '/perfil', label: 'Perfil', icon: UserRound },
];

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeSegment = location.pathname.split('/').filter(Boolean)[0] ?? 'home';
  const lightlyThemedRoutes = new Set([
    'avisos',
    'notificacoes',
    'pessoas',
    'cardapio',
    'horarios',
    'ideias',
    'cursos',
    'disciplinas',
    'tarefas',
    'diario',
    'usuarios',
    'cadastros',
    'configuracoes',
  ]);
  const useLightPageTheme = lightlyThemedRoutes.has(routeSegment);
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleLogout(): void {
    logout();
    navigate('/login');
  }

  return (
    <div
      className={cn(
        'portal-route relative flex min-h-screen overflow-x-hidden bg-transparent',
        `portal-route-${routeSegment}`,
        useLightPageTheme && 'portal-route-themed',
      )}
    >
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
        <nav className="ph-mobile-nav" aria-label="Navegação mobile">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cn('ph-mobile-nav-item', isActive && 'is-active')}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <footer className="sr-only" />
      </MainContainer>
    </div>
  );
}
