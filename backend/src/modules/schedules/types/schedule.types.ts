import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';
import type { Turma } from '../../users/types/user.types';

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
  tipo: ScheduleEntryKind;
  disciplina: string;
  professor?: Types.ObjectId | UserDocument;
  sala?: string;
  turma?: Turma;
  diaSemana: Weekday;
  horarioInicio: string;
  horarioFim: string;
  observacao?: string;
  cor: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicScheduleEntry = Omit<ScheduleEntry, 'professor'> & {
  id: string;
  professor?: PublicUser;
};

export type ScheduleFilters = {
  diaSemana?: Weekday;
  disciplina?: string;
  professorId?: string;
  search?: string;
  turma?: Turma;
};

export type ScheduleEntryPayload = {
  cor: string;
  diaSemana: Weekday;
  disciplina: string;
  horarioFim: string;
  horarioInicio: string;
  observacao?: string;
  professorId?: string;
  sala?: string;
  tipo: ScheduleEntryKind;
  turma?: Turma;
};
