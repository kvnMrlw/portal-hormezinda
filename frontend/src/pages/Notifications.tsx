import { Bell, CheckCheck, RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AppShell } from '../components/app/AppShell';
import { getApiErrorMessage } from '../lib/apiError';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Loading } from '../components/ui/Loading';
import { markAllNotificationsAsRead, listNotifications } from '../services/notifications';
import type { Notification } from '../types/notifications';

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setError('');
      const response = await listNotifications({ limit: 50 });
      setNotifications(response.notificacoes);
      setUnreadCount(response.naoLidas);
    } catch (error) {
      setError(
        getApiErrorMessage(error, 'Nao foi possivel carregar as notificacoes.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 60000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  async function handleMarkAllAsRead(): Promise<void> {
    try {
      setError('');
      await markAllNotificationsAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, lida: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      setError(
        getApiErrorMessage(error, 'Nao foi possivel marcar as notificacoes como lidas.'),
      );
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-[2rem] border border-slate-950/5 bg-portal-surface p-5 shadow-card ring-1 ring-white/80 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                <Bell className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Central
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal text-brand-navy sm:text-4xl">
                  Notificacoes
                </h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">{unreadCount} nao lidas</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => void loadNotifications()} type="button" variant="secondary">
                <RefreshCcw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                disabled={!unreadCount}
                onClick={() => void handleMarkAllAsRead()}
                type="button"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar lidas
              </Button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        {isLoading ? <Loading className="min-h-64" /> : null}
        {!isLoading && notifications.length ? (
          <section className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(updatedNotification) => {
                  setNotifications((current) =>
                    current.map((item) =>
                      item.id === updatedNotification.id ? updatedNotification : item,
                    ),
                  );
                  setUnreadCount((current) => Math.max(0, current - (notification.lida ? 0 : 1)));
                }}
              />
            ))}
          </section>
        ) : null}
        {!isLoading && !error && !notifications.length ? (
          <EmptyState description="Tudo certo por aqui." icon={Bell} title="Nenhuma notificacao." />
        ) : null}
      </div>
    </AppShell>
  );
}
