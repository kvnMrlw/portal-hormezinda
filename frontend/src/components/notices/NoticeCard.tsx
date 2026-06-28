import {
  CalendarClock,
  Edit3,
  EyeOff,
  Pin,
  PinOff,
  Power,
  Trash2,
  UserRound
} from 'lucide-react';

import { Button } from '../ui/Button';
import { resolveUploadUrl } from '../../services/notices';
import type { Notice, NoticeAttachment } from '../../types/notices';
import { cn } from '../../lib/utils';
import { categoryIcons, categoryLabels, priorityLabels, priorityStyles } from './noticeOptions';

type NoticeCardProps = {
  notice: Notice;
  isAdmin: boolean;
  onDelete: (notice: Notice) => void;
  onEdit: (notice: Notice) => void;
  onToggleActive: (notice: Notice) => void;
  onTogglePin: (notice: Notice) => void;
};

function formatDate(value?: string): string {
  if (!value) {
    return 'Sem data final';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function isExpired(notice: Notice): boolean {
  return Boolean(notice.dataFim && new Date(notice.dataFim).getTime() < Date.now());
}

function isImageAttachment(attachment: NoticeAttachment): boolean {
  return attachment.tipo.startsWith('image/');
}

export function NoticeCard({ isAdmin, notice, onDelete, onEdit, onToggleActive, onTogglePin }: NoticeCardProps) {
  const Icon = categoryIcons[notice.categoria];
  const expired = isExpired(notice);
  const imageAttachments = notice.anexos.filter(isImageAttachment);

  return (
    <article
      className={cn(
        'group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-soft sm:p-6',
        notice.fixado && 'border-amber-200 bg-amber-50/30',
        (!notice.ativo || expired) && isAdmin && 'bg-slate-50/80'
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-brand-blue/10 text-brand-blue ring-1 ring-blue-100">
          <Icon className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {notice.fixado ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                <Pin className="h-3.5 w-3.5" />
                Fixado
              </span>
            ) : null}
            <span className={cn('rounded-full px-3 py-1 text-xs font-bold ring-1', priorityStyles[notice.prioridade])}>
              {priorityLabels[notice.prioridade]}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {categoryLabels[notice.categoria]}
            </span>
            {isAdmin && !notice.ativo ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                <EyeOff className="h-3.5 w-3.5" />
                Inativo
              </span>
            ) : null}
            {isAdmin && expired ? (
              <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-bold text-zinc-700">Expirado</span>
            ) : null}
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-normal text-brand-navy">{notice.titulo}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{notice.descricao}</p>

          {imageAttachments.length ? (
            <div className="mt-5 grid gap-3">
              {imageAttachments.map((attachment) => (
                <img
                  alt={notice.titulo}
                  className="max-h-[34rem] w-full rounded-3xl object-cover shadow-sm ring-1 ring-slate-100"
                  decoding="async"
                  key={attachment.url}
                  loading="lazy"
                  src={resolveUploadUrl(attachment.url)}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              {notice.autor.nomeCompleto}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              {formatDate(notice.dataInicio)}
              {notice.dataFim ? ` ate ${formatDate(notice.dataFim)}` : ''}
            </span>
          </div>

        </div>

        {isAdmin ? (
          <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
            <Button
              className="h-11 w-11 rounded-2xl p-0"
              onClick={() => onTogglePin(notice)}
              title={notice.fixado ? 'Desfixar' : 'Fixar'}
              type="button"
              variant="secondary"
            >
              {notice.fixado ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Button
              className="h-11 w-11 rounded-2xl p-0"
              onClick={() => onToggleActive(notice)}
              title={notice.ativo ? 'Desativar' : 'Ativar'}
              type="button"
              variant="secondary"
            >
              <Power className={cn('h-4 w-4', notice.ativo ? 'text-emerald-600' : 'text-slate-400')} />
            </Button>
            <Button
              className="h-11 w-11 rounded-2xl p-0"
              onClick={() => onEdit(notice)}
              title="Editar"
              type="button"
              variant="secondary"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              className="h-11 w-11 rounded-2xl p-0 text-red-600 hover:bg-red-50"
              onClick={() => onDelete(notice)}
              title="Excluir"
              type="button"
              variant="secondary"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
