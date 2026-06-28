import { ArrowRight, CalendarClock, DoorOpen } from 'lucide-react';

import { ScheduleEntryKind, type ScheduleEntry } from '../../types/schedules';
import { getNextSchedule, weekdayLabels } from './scheduleUtils';

type ScheduleTopSummaryProps = {
  schedules: ScheduleEntry[];
};

export function ScheduleTopSummary({ schedules }: ScheduleTopSummaryProps) {
  const nextSchedule = getNextSchedule(schedules);

  return (
    <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Proxima aula</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-brand-navy">
              {nextSchedule?.disciplina.nome ?? 'Sem aulas programadas'}
            </h2>
          </div>
        </div>
        {nextSchedule ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
            <span>{weekdayLabels[nextSchedule.diaSemana]}</span>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <span>{nextSchedule.horarioInicio}</span>
            {nextSchedule.sala ? (
              <>
                <ArrowRight className="h-4 w-4 text-slate-300" />
                <span className="inline-flex items-center gap-2">
                  <DoorOpen className="h-4 w-4 text-brand-blue" />
                  {nextSchedule.sala.nome}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Resumo</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-semibold text-brand-navy">{schedules.filter((schedule) => schedule.tipo === ScheduleEntryKind.LESSON).length}</p>
            <p className="text-sm font-medium text-slate-500">aulas</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-brand-navy">{schedules.filter((schedule) => schedule.tipo === ScheduleEntryKind.INTERVAL).length}</p>
            <p className="text-sm font-medium text-slate-500">intervalos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
