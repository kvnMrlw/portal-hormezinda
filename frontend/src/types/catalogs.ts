import type { User } from './auth';
import { Turno } from './auth';

export type ClassGroup = {
  id: string;
  nome: string;
  ano: string;
  turno: Turno;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type Subject = {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  professorPadrao?: User;
  criadoEm: string;
  atualizadoEm: string;
};

export type Room = {
  id: string;
  nome: string;
  bloco?: string;
  capacidade: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type CatalogsResponse = {
  disciplinas: Subject[];
  salas: Room[];
  turmas: ClassGroup[];
};

export type ClassGroupPayload = Pick<ClassGroup, 'ano' | 'nome' | 'observacoes' | 'turno'>;
export type SubjectPayload = Pick<Subject, 'cor' | 'icone' | 'nome'> & {
  professorPadraoId?: string;
};
export type RoomPayload = Pick<Room, 'bloco' | 'capacidade' | 'nome' | 'observacoes'>;
