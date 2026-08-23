import { Bell, ChevronsLeft, ChevronsRight, LogOut, Menu, Search, UserRound } from 'lucide-react';
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
  '/home': 'Início',
  '/perfil': 'Perfil',
  '/pessoas': 'Pessoas',
  '/avisos': 'Avisos',
  '/horarios': 'Horários',
  '/cardapio': 'Cardápio',
  '/cursos': 'Cursos',
  '/ideias': 'Ideias',
  '/notificacoes': 'Notificações',
  '/diario': 'Diário',
  '/disciplinas': 'Disciplinas',
  '/configuracoes': 'Configurações',
  '/cadastros': 'Cadastros',
  '/usuarios': 'Usuários',
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
    <header className="portal-topbar">
      <div className="portal-topbar-inner">
        <div className="portal-topbar-brand-zone">
          <button className="portal-topbar-icon portal-menu-button lg:hidden" aria-label="Abrir menu" onClick={onMenuClick} type="button">
            <Menu />
          </button>
          <button className="portal-topbar-icon hidden lg:inline-flex" aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} onClick={onToggleSidebar} type="button">
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
          <Link className="portal-brand-pill portal-brand-free" to="/home">
            <span className="portal-brand-mark"><SchoolLogo /></span>
            <span className="portal-brand-copy">
              <strong>Portal Hormezinda</strong>
              <small>Comunidade escolar</small>
            </span>
          </Link>
          <span className="portal-current-route">{activeLabel}</span>
        </div>

        <div className="portal-topbar-search">
          <Search className="portal-search-spark" />
          <SearchInput aria-label="Pesquisar no portal" placeholder="Pesquisar pessoas, avisos, conteúdos..." />
        </div>

        <div className="portal-topbar-actions">
          <div className="relative">
            <button className="portal-topbar-icon portal-notification-button" aria-expanded={isNotificationOpen} aria-haspopup="menu" aria-label="Abrir notificações" onClick={() => setIsNotificationOpen((current) => !current)} type="button">
              <Bell />
              {unreadNotifications > 0 ? <span className="portal-notification-badge">{Math.min(unreadNotifications, 9)}</span> : null}
            </button>
            {isNotificationOpen ? (
              <div className="portal-notification-panel">
                <div className="portal-notification-panel-head">
                  <div><small>Central</small><strong>Notificações</strong></div>
                  <Link onClick={() => setIsNotificationOpen(false)} to="/notificacoes">Ver todas</Link>
                </div>
                <div className="portal-notification-list">
                  {notifications.length ? notifications.map((notification) => (
                    <button className="portal-notification-item" key={notification.id} onClick={() => void openNotification(notification)} type="button">
                      <span className="portal-notification-item-icon"><Bell /></span>
                      <span><strong>{notification.titulo}</strong><small>{notification.descricao}</small></span>
                      {!notification.lida ? <i /> : null}
                    </button>
                  )) : <p className="portal-notification-empty">Nenhuma notificação disponível no momento.</p>}
                </div>
                <Button className="w-full" onClick={() => void loadNotifications()} type="button" variant="secondary">Atualizar</Button>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button className="portal-user-pill" aria-expanded={isUserMenuOpen} aria-haspopup="menu" aria-label="Abrir menu do usuário" onClick={() => setIsUserMenuOpen((current) => !current)} type="button">
              <Avatar className="portal-user-avatar" name={user?.nomeCompleto ?? 'Portal Hormezinda'} src={getAssetUrl(user?.fotoPerfil)} />
              <span className="portal-user-copy"><strong>{user?.nomeCompleto}</strong><small>{user ? getDisplayRoleLabel(user) : 'Portal'}</small></span>
            </button>
            {isUserMenuOpen ? (
              <div className="portal-user-menu">
                <div className="portal-user-menu-head">
                  <Avatar className="h-11 w-11" name={user?.nomeCompleto ?? 'Portal'} src={getAssetUrl(user?.fotoPerfil)} />
                  <span><strong>{user?.nomeCompleto}</strong><small>@{user?.usuario}</small></span>
                </div>
                <Link onClick={() => setIsUserMenuOpen(false)} to="/perfil"><UserRound /> Perfil</Link>
                <button onClick={onLogout} type="button"><LogOut /> Sair</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="portal-mobile-search">
        <SearchInput aria-label="Pesquisar no portal" placeholder="Pesquisar no portal" />
      </div>
    </header>
  );
}
