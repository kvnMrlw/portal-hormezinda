import { CalendarClock, DoorOpen } from 'lucide-react';
import { useMemo } from 'react';

import { ScheduleEntryKind, weekdays, weekdayLabels, type ScheduleEntry } from '../../types/schedules';
import { formatTimeRange, getTodayWeekday, timeToMinutes } from './scheduleUtils';

type TeacherAgendaProps = {
  schedules: ScheduleEntry[];
};

function getNowMinutes(): number {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

export function TeacherAgenda({ schedules }: TeacherAgendaProps) {
  const lessons = useMemo(
    () =>
      schedules
        .filter((schedule) => schedule.tipo === ScheduleEntryKind.LESSON)
        .sort((first, second) => {
          const dayDiff = weekdays.indexOf(first.diaSemana) - weekdays.indexOf(second.diaSemana);

          return dayDiff || timeToMinutes(first.horarioInicio) - timeToMinutes(second.horarioInicio);
        }),
    [schedules]
  );
  const today = getTodayWeekday();
  const nowMinutes = getNowMinutes();
  const todayNext = lessons.find((lesson) => lesson.diaSemana === today && timeToMinutes(lesson.horarioInicio) >= nowMinutes);
  const weekNext =
    todayNext ??
    lessons.find((lesson) => weekdays.indexOf(lesson.diaSemana) > weekdays.indexOf(today)) ??
    lessons[0];
  const groupedLessons = weekdays
    .map((weekday) => ({
      lessons: lessons.filter((lesson) => lesson.diaSemana === weekday),
      weekday
    }))
    .filter((group) => group.lessons.length);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {todayNext ? 'Sua proxima aula' : 'Voce nao possui mais aulas hoje'}
            </p>
            {weekNext ? (
              <>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal text-brand-navy">{weekNext.horarioInicio}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {weekNext.disciplina.nome}
                  {!todayNext ? ` - ${weekdayLabels[weekNext.diaSemana]}` : ''}
                </p>
                {weekNext.sala ? (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                    <DoorOpen className="h-4 w-4 text-brand-blue" />
                    {weekNext.sala.nome}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-500">Nenhuma aula cadastrada.</p>
            )}
          </div>
        </div>
      </section>

      {groupedLessons.map((group) => (
        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm" key={group.weekday}>
          <h2 className="text-lg font-semibold text-brand-navy">{weekdayLabels[group.weekday]}</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {group.lessons.map((lesson) => (
              <article className="grid gap-2 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_8rem]" key={lesson.id}>
                <p className="text-sm font-bold text-brand-navy">{formatTimeRange(lesson)}</p>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: lesson.disciplina.cor }} />
                    <h3 className="truncate font-semibold text-brand-navy">{lesson.disciplina.nome}</h3>
                  </div>
                  {lesson.turma ? <p className="mt-1 text-sm font-medium text-slate-500">{lesson.turma.nome}</p> : null}
                </div>
                {lesson.sala ? <p className="text-sm font-semibold text-slate-600 sm:text-right">{lesson.sala.nome}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
