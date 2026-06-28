import { Copy, Edit3, Trash2 } from 'lucide-react';

import { formatClassName } from '../../lib/classes';
import { cn } from '../../lib/utils';
import { ScheduleEntryKind, type ScheduleEntry } from '../../types/schedules';
import { formatTimeRange, getSubjectIcon, isScheduleHappening } from './scheduleUtils';

type ScheduleLessonCardProps = {
  canManage: boolean;
  compact?: boolean;
  onDelete: (schedule: ScheduleEntry) => void;
  onDuplicate: (schedule: ScheduleEntry) => void;
  onEdit: (schedule: ScheduleEntry) => void;
  schedule: ScheduleEntry;
};

function getReadableTextColor(color: string): string {
  const hex = color.replace('#', '');
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 155 ? '#172033' : '#ffffff';
}

export function ScheduleLessonCard({ canManage, compact = false, onDelete, onDuplicate, onEdit, schedule }: ScheduleLessonCardProps) {
  const Icon = getSubjectIcon(schedule.disciplina ?? 'Intervalo', schedule.tipo);
  const happening = isScheduleHappening(schedule);
  const isInterval = schedule.tipo === ScheduleEntryKind.INTERVAL;
  const textColor = isInterval ? '#475569' : getReadableTextColor(schedule.disciplina?.cor ?? '#2563eb');

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl p-4 shadow-sm ring-1 transition duration-200',
        compact ? 'min-h-[6.25rem]' : 'min-h-[6.75rem]',
        happening ? 'ring-2 ring-brand-blue shadow-[0_0_0_4px_rgba(37,99,235,0.12)]' : 'ring-black/5',
        isInterval && 'border border-dashed border-slate-200 bg-slate-50'
      )}
      style={isInterval ? undefined : { backgroundColor: schedule.disciplina?.cor ?? '#2563eb', color: textColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em]" style={{ color: isInterval ? '#64748b' : textColor }}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{formatTimeRange(schedule)}</span>
          </div>
          {happening ? (
            <span className="mt-2 inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-brand-blue">
              Aula em andamento
            </span>
          ) : null}
        </div>

        {canManage ? (
          <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button
              aria-label="Duplicar horario"
              className="rounded-full bg-white/90 p-1.5 text-slate-600 shadow-sm transition hover:bg-white"
              onClick={() => onDuplicate(schedule)}
              type="button"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              aria-label="Editar horario"
              className="rounded-full bg-white/90 p-1.5 text-slate-600 shadow-sm transition hover:bg-white"
              onClick={() => onEdit(schedule)}
              type="button"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              aria-label="Excluir horario"
              className="rounded-full bg-white/90 p-1.5 text-red-600 shadow-sm transition hover:bg-white"
              onClick={() => onDelete(schedule)}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <h3 className={cn('mt-2 truncate font-semibold leading-tight', compact ? 'text-sm' : 'text-base')} style={{ color: textColor }}>
        {isInterval ? 'Intervalo' : schedule.disciplina?.nome}
      </h3>
      {schedule.professor ? (
        <p className="mt-1 truncate text-xs font-semibold opacity-90" style={{ color: textColor }}>
          Prof. {schedule.professor.nomeCompleto}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5 text-[0.68rem] font-bold" style={{ color: textColor }}>
        {schedule.sala ? <span className="rounded-full bg-white/20 px-2 py-0.5">{schedule.sala.nome}</span> : null}
        {schedule.turma ? <span className="rounded-full bg-white/20 px-2 py-0.5">{formatClassName(schedule.turma)}</span> : null}
      </div>
    </article>
  );
}
