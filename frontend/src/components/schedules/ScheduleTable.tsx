import { ScheduleLessonCard } from './ScheduleLessonCard';
import { getScheduleSlots, weekdayLabels } from './scheduleUtils';
import { weekdays, type ScheduleEntry } from '../../types/schedules';

type ScheduleTableProps = {
  canManage: boolean;
  onDelete: (schedule: ScheduleEntry) => void;
  onDuplicate: (schedule: ScheduleEntry) => void;
  onEdit: (schedule: ScheduleEntry) => void;
  schedules: ScheduleEntry[];
};

export function ScheduleTable({ canManage, onDelete, onDuplicate, onEdit, schedules }: ScheduleTableProps) {
  const slots = getScheduleSlots(schedules);

  return (
    <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block" aria-label="Tabela semanal">
      <div className="grid grid-cols-[8.5rem_repeat(5,minmax(0,1fr))] border-b border-slate-100 bg-slate-50">
        <div className="px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Horario</div>
        {weekdays.map((weekday) => (
          <div className="border-l border-slate-100 px-4 py-4 text-sm font-semibold text-brand-navy" key={weekday}>
            {weekdayLabels[weekday]}
          </div>
        ))}
      </div>

      {slots.length ? (
        slots.map((slot) => {
          const [start, end] = slot.split('-');

          return (
            <div className="grid grid-cols-[8.5rem_repeat(5,minmax(0,1fr))] border-b border-slate-100 last:border-b-0" key={slot}>
              <div className="bg-white px-4 py-4">
                <p className="text-lg font-semibold text-brand-navy">{start}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{end}</p>
              </div>
              {weekdays.map((weekday) => {
                const daySchedules = schedules.filter(
                  (schedule) => schedule.diaSemana === weekday && schedule.horarioInicio === start && schedule.horarioFim === end
                );

                return (
                  <div className="min-h-[12rem] border-l border-slate-100 p-3" key={`${weekday}-${slot}`}>
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <ScheduleLessonCard
                          canManage={canManage}
                          compact
                          key={schedule.id}
                          onDelete={onDelete}
                          onDuplicate={onDuplicate}
                          onEdit={onEdit}
                          schedule={schedule}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div className="p-10 text-center text-sm font-semibold text-slate-500">Nenhum horario encontrado.</div>
      )}
    </section>
  );
}
