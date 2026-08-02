import { Bell, Database, Home, LogOut, Settings, UserRound, UsersRound, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { schoolModules } from '../../data/schoolModules';
import { isAdminRole } from '../../lib/roles';
import { cn } from '../../lib/utils';
import { Cargo } from '../../types/auth';
import { SchoolLogo } from '../ui/SchoolLogo';

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

type SidebarProps = {
  collapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
};

const portalNavigation: NavigationItem[] = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/perfil', icon: UserRound, label: 'Perfil' },
  { href: '/notificacoes', icon: Bell, label: 'Notificacoes' },
  { href: '/configuracoes', icon: Settings, label: 'Configuracoes' },
];

const moduleNavigation: NavigationItem[] = schoolModules.map((module) => ({
  href: module.href,
  icon: module.icon,
  label: module.title,
}));

export function Sidebar({ collapsed, isMobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const roleModuleNavigation = moduleNavigation.filter(
    (item) =>
      item.href !== '/diario' ||
      user?.cargo === Cargo.ADMIN ||
      user?.cargo === Cargo.DIRETOR ||
      user?.cargo === Cargo.COORDENADOR ||
      user?.cargo === Cargo.PROFESSOR,
  );
  const accountNavigation = portalNavigation.filter((item) => item.href !== '/home');
  const visibleGroups: NavigationGroup[] = [
    {
      title: 'Portal',
      items: portalNavigation.filter((item) => item.href === '/home'),
    },
    {
      title: 'Comunidade',
      items: [
        ...accountNavigation.filter(
          (item) => item.href === '/perfil' || item.href === '/notificacoes',
        ),
        ...(isAdminRole(user?.cargo)
          ? []
          : [{ href: '/pessoas', icon: UsersRound, label: 'Pessoas' }]),
      ],
    },
    {
      title: 'Academico',
      items: roleModuleNavigation,
    },
    ...(isAdminRole(user?.cargo)
      ? [
          {
            title: 'Administracao',
            items: [
              { href: '/cadastros', icon: Database, label: 'Cadastros' },
              { href: '/usuarios', icon: UsersRound, label: 'Usuarios' },
            ],
          },
        ]
      : []),
    {
      title: 'Conta',
      items: accountNavigation.filter((item) => item.href === '/configuracoes'),
    },
  ].filter((group) => group.items.length);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/35 transition-opacity duration-300 lg:hidden',
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-950/5 bg-white px-4 py-5 shadow-soft ring-1 ring-white/80 transition-all duration-300 ease-out lg:sticky lg:z-30',
          collapsed ? 'lg:w-[5.75rem]' : 'lg:w-72',
          isMobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-white p-1.5 shadow-card ring-1 ring-slate-950/5">
              <SchoolLogo />
            </div>
            <span className={cn('min-w-0 transition-opacity', collapsed && 'lg:hidden')}>
              <span className="block truncate text-base font-bold text-brand-navy">
                Portal Hormezinda
              </span>
              <span className="block truncate text-xs font-semibold text-slate-400">
                Comunidade escolar
              </span>
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

        <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
          {visibleGroups.map((group) => (
            <div className="space-y-1.5" key={group.title}>
              <p
                className={cn(
                  'px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-400',
                  collapsed && 'lg:hidden',
                )}
              >
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100',
                        isActive
                          ? 'bg-slate-950 text-white shadow-hover'
                          : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-brand-navy hover:shadow-card',
                        collapsed && 'lg:justify-center lg:px-3',
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
                            'absolute left-1 h-7 w-1 rounded-full bg-brand-blue transition-all duration-300',
                            isActive ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <Icon className="h-5 w-5 shrink-0 stroke-[2.25]" />
                        <span
                          className={cn(
                            'truncate transition-opacity duration-300',
                            collapsed && 'lg:hidden',
                          )}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <button
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-red-100',
            collapsed && 'lg:justify-center lg:px-3',
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
