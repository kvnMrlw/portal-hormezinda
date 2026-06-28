import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser, Turno } from '../../users/types/user.types';

export type ClassGroup = {
  nome: string;
  ano: string;
  turno: Turno;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type Subject = {
  nome: string;
  cor: string;
  icone: string;
  professores: Array<Types.ObjectId | UserDocument>;
  professorPadrao?: Types.ObjectId | UserDocument;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type Room = {
  nome: string;
  bloco?: string;
  capacidade: number;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicClassGroup = ClassGroup & {
  id: string;
};

export type PublicSubject = Omit<Subject, 'professores' | 'professorPadrao'> & {
  id: string;
  professores: PublicUser[];
  professorPadrao?: PublicUser;
};

export type PublicRoom = Room & {
  id: string;
};

export type ClassGroupPayload = Pick<ClassGroup, 'ano' | 'nome' | 'observacoes' | 'turno'>;
export type SubjectPayload = Pick<Subject, 'cor' | 'icone' | 'nome'> & {
  professorIds?: string[];
  professorPadraoId?: string;
};
export type RoomPayload = Pick<Room, 'bloco' | 'capacidade' | 'nome' | 'observacoes'>;
