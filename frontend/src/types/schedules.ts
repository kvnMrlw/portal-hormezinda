import type { User } from './auth';
import type { ClassGroup, Room, Subject } from './catalogs';

export enum Weekday {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY'
}

export enum ScheduleEntryKind {
  LESSON = 'LESSON',
  INTERVAL = 'INTERVAL'
}

export type ScheduleEntry = {
  id: string;
  tipo: ScheduleEntryKind;
  disciplina: Subject;
  professor?: User;
  sala?: Room;
  turma?: ClassGroup;
  diaSemana: Weekday;
  horarioInicio: string;
  horarioFim: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type ScheduleFilters = {
  diaSemana?: Weekday | '';
  disciplinaId?: string;
  professorId?: string;
  salaId?: string;
  search?: string;
  turmaId?: string;
};

export type SchedulePayload = {
  tipo: ScheduleEntryKind;
  disciplinaId: string;
  professorId?: string;
  salaId?: string;
  turmaId?: string;
  diaSemana: Weekday;
  horarioInicio: string;
  horarioFim: string;
  observacao?: string;
};

export const weekdays = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY
] as const;

export const weekdayLabels: Record<Weekday, string> = {
  [Weekday.MONDAY]: 'Segunda',
  [Weekday.TUESDAY]: 'Terca',
  [Weekday.WEDNESDAY]: 'Quarta',
  [Weekday.THURSDAY]: 'Quinta',
  [Weekday.FRIDAY]: 'Sexta'
};

export const subjectColors: Record<string, string> = {
  Artes: '#7c3aed',
  Biologia: '#16a34a',
  Ciencias: '#16a34a',
  'Educacao Fisica': '#eab308',
  Fisica: '#0ea5e9',
  Geografia: '#f97316',
  Historia: '#92400e',
  Ingles: '#0891b2',
  Matematica: '#2563eb',
  Portugues: '#dc2626',
  Quimica: '#059669',
  Sociologia: '#be185d'
};
