import { ScheduleLessonCard } from './ScheduleLessonCard';
import { groupSchedulesByDay, weekdayLabels } from './scheduleUtils';
import { weekdays, type ScheduleEntry } from '../../types/schedules';

type ScheduleDayCardsProps = {
  canManage: boolean;
  onDelete: (schedule: ScheduleEntry) => void;
  onDuplicate: (schedule: ScheduleEntry) => void;
  onEdit: (schedule: ScheduleEntry) => void;
  schedules: ScheduleEntry[];
};

export function ScheduleDayCards({ canManage, onDelete, onDuplicate, onEdit, schedules }: ScheduleDayCardsProps) {
  const groups = groupSchedulesByDay(schedules);

  return (
    <section className="space-y-4 lg:hidden" aria-label="Horarios por dia">
      {weekdays.map((weekday) => (
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm" key={weekday}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-navy">{weekdayLabels[weekday]}</h2>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {groups[weekday].length} aulas
            </span>
          </div>
          {groups[weekday].length ? (
            <div className="mt-4 space-y-3">
              {groups[weekday].map((schedule) => (
                <ScheduleLessonCard
                  canManage={canManage}
                  key={schedule.id}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onEdit={onEdit}
                  schedule={schedule}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500">Nenhum horario neste dia.</p>
          )}
        </div>
      ))}
    </section>
  );
}
