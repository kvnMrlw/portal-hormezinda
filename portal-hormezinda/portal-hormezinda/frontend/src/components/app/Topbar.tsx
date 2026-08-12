import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/useAuth';
import { getAssetUrl } from '../../lib/assets';
import { getDisplayRoleLabel } from '../../lib/roles';
import { listNotifications, markNotificationAsRead } from '../../services/notifications';
import type { Notification } from '../../types/notifications';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { SchoolLogo } from '../ui/SchoolLogo';

const routeLabels: Record<string, string> = {
  '/home': 'Dashboard',
  '/perfil': 'Perfil',
  '/pessoas': 'Pessoas',
  '/avisos': 'Avisos',
  '/horarios': 'Horarios',
  '/cardapio': 'Cardapio',
  '/cursos': 'Cursos',
  '/ideias': 'Ideias',
  '/notificacoes': 'Notificacoes',
  '/diario': 'Diario',
  '/disciplinas': 'Disciplinas',
  '/configuracoes': 'Configuracoes',
  '/cadastros': 'Cadastros',
  '/usuarios': 'Usuarios',
};

type TopbarProps = {
  collapsed: boolean;
  onLogout: () => void;
  onMenuClick: () => void;
  onToggleSidebar: () => void;
};

export function Topbar({ collapsed, onLogout, onMenuClick, onToggleSidebar }: TopbarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    try {
      const response = await listNotifications({ limit: 5 });
      setNotifications(response.notificacoes);
      setUnreadNotifications(response.naoLidas);
    } catch {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 15000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  async function openNotification(notification: Notification): Promise<void> {
    if (!notification.lida) {
      const updatedNotification = await markNotificationAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updatedNotification.id ? updatedNotification : item)),
      );
      setUnreadNotifications((current) => Math.max(0, current - 1));
    }

    window.location.href = notification.url;
  }

  const activeLabel = routeLabels[location.pathname] ?? 'Portal';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-950/5 bg-white px-4 py-3.5 shadow-card sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Abrir menu"
            className="rounded-2xl border border-slate-950/5 bg-white p-2.5 text-slate-600 shadow-card transition hover:-translate-y-0.5 hover:text-brand-blue hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="hidden rounded-2xl border border-slate-950/5 bg-white p-2.5 text-slate-600 shadow-card transition hover:-translate-y-0.5 hover:text-brand-blue hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100 lg:inline-flex"
            onClick={onToggleSidebar}
            type="button"
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
          </button>
          <Link className="flex min-w-0 items-center gap-3" to="/home">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-slate-950/5 sm:flex">
              <SchoolLogo />
            </div>
            <span className="hidden truncate font-semibold text-brand-navy sm:block">
              Portal Hormezinda
            </span>
          </Link>
          <div className="hidden h-6 w-px bg-slate-200 md:block" />
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-2 text-sm font-semibold md:flex"
          >
            <Link className="text-slate-400 transition hover:text-brand-blue" to="/home">
              Inicio
            </Link>
            <span className="text-slate-300">/</span>
            <span className="truncate text-brand-navy">{activeLabel}</span>
          </nav>
        </div>

        <div className="hidden w-full max-w-lg md:block">
          <SearchInput aria-label="Pesquisar no portal" placeholder="Pesquisar no portal" />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              aria-expanded={isNotificationOpen}
              aria-haspopup="menu"
              aria-label="Abrir notificacoes"
              className="relative rounded-2xl border border-slate-950/5 bg-white p-3 text-slate-500 shadow-card transition hover:-translate-y-0.5 hover:text-brand-navy hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={() => setIsNotificationOpen((current) => !current)}
              type="button"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-blue ring-2 ring-white" />
              ) : null}
            </button>
            {isNotificationOpen ? (
              <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border border-slate-950/5 bg-white p-3 shadow-hover ring-1 ring-white/80">
                <div className="flex items-center justify-between gap-3 px-2 py-1">
                  <p className="text-sm font-semibold text-brand-navy">Notificacoes</p>
                  <Link
                    className="text-xs font-bold text-brand-blue"
                    onClick={() => setIsNotificationOpen(false)}
                    to="/notificacoes"
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="mt-2 max-h-96 space-y-2 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <button
                        className="w-full rounded-2xl p-3 text-left transition hover:bg-blue-50/60 focus:outline-none focus:ring-4 focus:ring-blue-100"
                        key={notification.id}
                        onClick={() => void openNotification(notification)}
                        type="button"
                      >
                        <div className="flex items-start gap-2">
                          <span className="relative mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                            <Bell className="h-4 w-4" />
                            {!notification.lida ? (
                              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-blue ring-2 ring-white" />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-brand-navy">
                              {notification.titulo}
                            </span>
                            <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                              {notification.descricao}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-slate-50/90 p-4 text-sm leading-6 text-slate-500">
                      Nenhuma notificacao disponivel no momento.
                    </p>
                  )}
                </div>
                <Button
                  className="mt-3 w-full py-2"
                  onClick={() => void loadNotifications()}
                  type="button"
                  variant="secondary"
                >
                  Atualizar
                </Button>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              aria-label="Abrir menu do usuario"
              className="flex items-center gap-3 rounded-2xl border border-slate-950/5 bg-white py-1.5 pl-2 pr-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-100"
              onClick={() => setIsUserMenuOpen((current) => !current)}
              type="button"
            >
              <Avatar
                className="h-10 w-10 shadow-sm ring-2 ring-white"
                name={user?.nomeCompleto ?? 'Portal Hormezinda'}
                src={getAssetUrl(user?.fotoPerfil)}
              />
              <span className="hidden min-w-0 text-left lg:block">
                <span className="block max-w-36 truncate text-sm font-bold text-brand-navy">
                  {user?.nomeCompleto}
                </span>
                <span className="block max-w-36 truncate text-xs font-semibold text-slate-400">
                  {user ? getDisplayRoleLabel(user) : 'Portal'}
                </span>
              </span>
            </button>
            {isUserMenuOpen ? (
              <div className="absolute right-0 mt-3 w-72 rounded-[1.5rem] border border-slate-950/5 bg-white p-3 shadow-hover ring-1 ring-white/80">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-brand-navy">
                    {user?.nomeCompleto}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    @{user?.usuario} - {user ? getDisplayRoleLabel(user) : 'Portal'}
                  </p>
                </div>
                <Link
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-brand-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
                  onClick={() => setIsUserMenuOpen(false)}
                  to="/perfil"
                >
                  <UserRound className="h-4 w-4" />
                  Perfil
                </Link>
                <button
                  className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-red-100"
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
