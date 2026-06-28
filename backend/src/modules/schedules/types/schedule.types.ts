import type { Types } from 'mongoose';

import type { ClassGroupDocument } from '../../catalogs/models/class-group.model';
import type { RoomDocument } from '../../catalogs/models/room.model';
import type { SubjectDocument } from '../../catalogs/models/subject.model';
import type { PublicClassGroup, PublicRoom, PublicSubject } from '../../catalogs/types/catalog.types';
import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';

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
  disciplina: Types.ObjectId | SubjectDocument;
  professor?: Types.ObjectId | UserDocument;
  sala?: Types.ObjectId | RoomDocument;
  turma?: Types.ObjectId | ClassGroupDocument;
  diaSemana: Weekday;
  horarioInicio: string;
  horarioFim: string;
  observacao?: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicScheduleEntry = Omit<ScheduleEntry, 'disciplina' | 'professor' | 'sala' | 'turma'> & {
  id: string;
  disciplina: PublicSubject;
  professor?: PublicUser;
  sala?: PublicRoom;
  turma?: PublicClassGroup;
};

export type ScheduleFilters = {
  diaSemana?: Weekday;
  disciplinaId?: string;
  professorId?: string;
  salaId?: string;
  search?: string;
  turmaId?: string;
};

export type ScheduleEntryPayload = {
  diaSemana: Weekday;
  disciplinaId: string;
  horarioFim: string;
  horarioInicio: string;
  observacao?: string;
  professorId?: string;
  salaId?: string;
  tipo: ScheduleEntryKind;
  turmaId?: string;
};
