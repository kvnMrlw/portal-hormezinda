import { Bell, Database, Home, LogOut, UserRound, UsersRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { schoolModules } from '../../data/schoolModules';
import { isAdminRole } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { SchoolLogo } from '../ui/SchoolLogo';

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type SidebarProps = {
  collapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
};

const navigation: NavigationItem[] = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/perfil', icon: UserRound, label: 'Perfil' },
  { href: '/notificacoes', icon: Bell, label: 'Notificacoes' },
  ...schoolModules.map((module) => ({
    href: module.href,
    icon: module.icon,
    label: module.title
  }))
];

export function Sidebar({ collapsed, isMobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const visibleNavigation = isAdminRole(user?.cargo)
    ? [...navigation, { href: '/cadastros', icon: Database, label: 'Cadastros' }, { href: '/usuarios', icon: UsersRound, label: 'Usuarios' }]
    : [...navigation, { href: '/pessoas', icon: UsersRound, label: 'Pessoas' }];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white/95 px-4 py-5 shadow-soft backdrop-blur-xl transition-all duration-300 ease-out lg:sticky lg:z-30 lg:shadow-none',
          collapsed ? 'lg:w-[5.75rem]' : 'lg:w-72',
          isMobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft ring-1 ring-slate-100">
              <SchoolLogo />
            </div>
            <span className={cn('truncate font-semibold text-brand-navy transition-opacity', collapsed && 'lg:hidden')}>
              Portal Hormezinda
            </span>
          </div>
          <button
            aria-label="Fechar menu"
            className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:hidden"
            onClick={onCloseMobile}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100',
                    isActive
                      ? 'bg-blue-50 text-brand-blue shadow-sm'
                      : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-brand-navy',
                    collapsed && 'lg:justify-center lg:px-3'
                  )
                }
                key={item.href}
                onClick={onCloseMobile}
                to={item.href}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-1 h-6 w-1 rounded-full bg-brand-blue transition-all duration-300',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className={cn('truncate transition-opacity duration-300', collapsed && 'lg:hidden')}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <button
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100',
            collapsed && 'lg:justify-center lg:px-3'
          )}
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn(collapsed && 'lg:hidden')}>Sair</span>
        </button>
      </aside>
    </>
  );
}
