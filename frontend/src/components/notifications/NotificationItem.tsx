import {
  Bell,
  BookOpenCheck,
  CheckCircle2,
  Heart,
  Lightbulb,
  MessageSquareText,
  Megaphone,
  Rocket,
  ThumbsUp,
  UserRound,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getAssetUrl } from '../../lib/assets';
import { cn } from '../../lib/utils';
import { markNotificationAsRead } from '../../services/notifications';
import { NotificationType, type Notification } from '../../types/notifications';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const notificationIcons = {
  [NotificationType.NEW_NOTICE]: Megaphone,
  [NotificationType.NEW_STORY]: UserRound,
  [NotificationType.NEW_POST]: Bell,
  [NotificationType.NEW_COURSE]: BookOpenCheck,
  [NotificationType.NEW_PLATFORM]: Rocket,
  [NotificationType.NEW_IDEA]: Lightbulb,
  [NotificationType.IDEA_APPROVED]: CheckCircle2,
  [NotificationType.IDEA_REJECTED]: XCircle,
  [NotificationType.IDEA_COMPLETED]: CheckCircle2,
  [NotificationType.IDEA_RESPONSE]: MessageSquareText,
  [NotificationType.POST_REACTION]: Heart,
  [NotificationType.IDEA_REACTION]: Heart,
  [NotificationType.IDEA_SUPPORT]: ThumbsUp,
  [NotificationType.FUTURE_COMMENT]: MessageSquareText
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short'
  }).format(new Date(value));
}

export function NotificationItem({ notification, onRead }: { notification: Notification; onRead?: (notification: Notification) => void }) {
  const navigate = useNavigate();
  const Icon = notificationIcons[notification.tipo] ?? Bell;

  async function openNotification(): Promise<void> {
    const nextNotification = notification.lida ? notification : await markNotificationAsRead(notification.id);
    onRead?.(nextNotification);
    navigate(notification.url);
  }

  return (
    <article
      className={cn(
        'grid gap-4 rounded-3xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:grid-cols-[auto_1fr_auto] sm:items-center',
        notification.lida ? 'border-slate-100' : 'border-blue-100 bg-blue-50/30'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
          {!notification.lida ? <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-brand-blue ring-2 ring-white" /> : null}
        </span>
        {notification.autor ? <Avatar className="h-10 w-10" name={notification.autor.nomeCompleto} src={getAssetUrl(notification.autor.fotoPerfil)} /> : null}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-brand-navy">{notification.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{notification.descricao}</p>
        <p className="mt-2 text-xs font-semibold text-slate-400">
          {notification.autor?.nomeCompleto ?? 'Portal Hormezinda'} - {formatDate(notification.criadaEm)}
        </p>
      </div>
      <Button className="w-full sm:w-auto" onClick={() => void openNotification()} type="button" variant={notification.lida ? 'secondary' : 'primary'}>
        Abrir
      </Button>
    </article>
  );
}
