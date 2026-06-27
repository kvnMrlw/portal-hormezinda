import { Bell, ChevronsLeft, ChevronsRight, GraduationCap, LogOut, Menu, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { Avatar } from '../ui/Avatar';
import { SearchInput } from '../ui/SearchInput';

type TopbarProps = {
  collapsed: boolean;
  onLogout: () => void;
  onMenuClick: () => void;
  onToggleSidebar: () => void;
};

export function Topbar({ collapsed, onLogout, onMenuClick, onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Abrir menu"
            className="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="hidden rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:inline-flex"
            onClick={onToggleSidebar}
            type="button"
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </button>
          <Link className="flex min-w-0 items-center gap-3" to="/home">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="truncate font-semibold text-brand-navy">Portal Hormezinda</span>
          </Link>
        </div>

        <div className="hidden w-full max-w-md md:block">
          <SearchInput aria-label="Pesquisar no portal" placeholder="Pesquisar no portal" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              aria-expanded={isNotificationOpen}
              aria-haspopup="menu"
              aria-label="Abrir notificacoes"
              className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-brand-navy focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={() => setIsNotificationOpen((current) => !current)}
              type="button"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-blue ring-2 ring-white" />
            </button>
            {isNotificationOpen ? (
              <div className="absolute right-0 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="text-sm font-semibold text-brand-navy">Notificacoes</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Nenhuma notificacao disponivel no momento.</p>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label="Abrir menu do usuario"
              className="rounded-full focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              type="button"
            >
              <Avatar name={user?.nomeCompleto ?? 'Portal Hormezinda'} src={user?.fotoPerfil} />
            </button>
            {isUserMenuOpen ? (
              <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-brand-navy">{user?.nomeCompleto}</p>
                  <p className="truncate text-xs text-slate-500">@{user?.usuario}</p>
                </div>
                <Link
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy"
                  onClick={() => setIsUserMenuOpen(false)}
                  to="/perfil"
                >
                  <UserRound className="h-4 w-4" />
                  Perfil
                </Link>
                <button
                  className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  onClick={onLogout}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-3 md:hidden">
        <SearchInput aria-label="Pesquisar no portal" placeholder="Pesquisar no portal" />
      </div>
    </header>
  );
}
