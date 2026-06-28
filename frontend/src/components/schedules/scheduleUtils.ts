import {
  Atom,
  BookOpen,
  Calculator,
  Coffee,
  Dumbbell,
  FlaskConical,
  Languages,
  Landmark,
  Map,
  Palette,
  type LucideIcon
} from 'lucide-react';

import { ScheduleEntryKind, Weekday, weekdayLabels, weekdays, type ScheduleEntry } from '../../types/schedules';

const subjectIcons: Array<[string, LucideIcon]> = [
  ['matematica', Calculator],
  ['portugues', Languages],
  ['historia', Landmark],
  ['ciencias', Atom],
  ['biologia', Atom],
  ['geografia', Map],
  ['artes', Palette],
  ['arte', Palette],
  ['educacao fisica', Dumbbell],
  ['fisica', FlaskConical]
];

export function getSubjectIcon(subject: string | { nome: string }, kind: ScheduleEntryKind): LucideIcon {
  if (kind === ScheduleEntryKind.INTERVAL) {
    return Coffee;
  }

  const normalizedSubject = normalizeText(typeof subject === 'string' ? subject : subject.nome);
  const match = subjectIcons.find(([name]) => normalizedSubject.includes(name));

  return match?.[1] ?? BookOpen;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

export function isScheduleHappening(schedule: ScheduleEntry, now = new Date()): boolean {
  return getTodayWeekday(now) === schedule.diaSemana && timeToMinutes(toTime(now)) >= timeToMinutes(schedule.horarioInicio) && timeToMinutes(toTime(now)) < timeToMinutes(schedule.horarioFim);
}

export function getNextSchedule(schedules: ScheduleEntry[], now = new Date()): ScheduleEntry | undefined {
  const currentDayIndex = weekdays.indexOf(getTodayWeekday(now));
  const currentMinutes = timeToMinutes(toTime(now));

  return [...schedules]
    .filter((schedule) => schedule.tipo === ScheduleEntryKind.LESSON)
    .map((schedule) => {
      const scheduleDayIndex = weekdays.indexOf(schedule.diaSemana);
      const dayOffset = (scheduleDayIndex - currentDayIndex + weekdays.length) % weekdays.length;
      const startMinutes = timeToMinutes(schedule.horarioInicio);
      const weekOffset = dayOffset === 0 && startMinutes <= currentMinutes ? weekdays.length : dayOffset;

      return {
        distance: weekOffset * 24 * 60 + startMinutes,
        schedule
      };
    })
    .sort((first, second) => first.distance - second.distance)[0]?.schedule;
}

export function getTodayWeekday(date = new Date()): Weekday {
  const weekday = date.getDay();

  if (weekday === 2) {
    return Weekday.TUESDAY;
  }

  if (weekday === 3) {
    return Weekday.WEDNESDAY;
  }

  if (weekday === 4) {
    return Weekday.THURSDAY;
  }

  if (weekday === 5) {
    return Weekday.FRIDAY;
  }

  return Weekday.MONDAY;
}

export function groupSchedulesByDay(schedules: ScheduleEntry[]): Record<Weekday, ScheduleEntry[]> {
  return weekdays.reduce<Record<Weekday, ScheduleEntry[]>>((groups, weekday) => {
    groups[weekday] = schedules
      .filter((schedule) => schedule.diaSemana === weekday)
      .sort((first, second) => timeToMinutes(first.horarioInicio) - timeToMinutes(second.horarioInicio));

    return groups;
  }, {} as Record<Weekday, ScheduleEntry[]>);
}

export function getScheduleSlots(schedules: ScheduleEntry[]): string[] {
  return Array.from(new Set(schedules.map((schedule) => `${schedule.horarioInicio}-${schedule.horarioFim}`))).sort(
    (first, second) => timeToMinutes(first.split('-')[0]) - timeToMinutes(second.split('-')[0])
  );
}

export function formatTimeRange(schedule: Pick<ScheduleEntry, 'horarioFim' | 'horarioInicio'>): string {
  return `${schedule.horarioInicio} - ${schedule.horarioFim}`;
}

export function getPrintTitle(filters: { turma?: string; professor?: string }): string {
  if (filters.turma) {
    return `Horario da turma ${filters.turma}`;
  }

  if (filters.professor) {
    return `Horario de ${filters.professor}`;
  }

  return 'Horario escolar';
}

export { weekdayLabels };

function toTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
