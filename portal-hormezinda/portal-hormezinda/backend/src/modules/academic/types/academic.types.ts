import type { Types } from 'mongoose';

import type { PublicClassGroup, PublicRoom, PublicSubject } from '../../catalogs/types/catalog.types';
import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';

export enum AttendanceStatus {
  PRESENT = 'PRESENTE',
  ABSENT = 'FALTA',
  JUSTIFIED = 'JUSTIFICADA',
  LATE = 'ATRASO'
}

export enum AcademicTaskType {
  ACTIVITY = 'ATIVIDADE',
  WORK = 'TRABALHO',
  RESEARCH = 'PESQUISA',
  READING = 'LEITURA'
}

export enum SubmissionStatus {
  SUBMITTED = 'ENTREGUE',
  CONFIRMED = 'CONFIRMADA'
}

export type AcademicFile = {
  nome: string;
  tamanho: number;
  tipo: string;
  url: string;
};

export type AttendanceRecord = {
  aluno: Types.ObjectId | UserDocument;
  observacao?: string;
  status: AttendanceStatus;
};

export type Attendance = {
  data: Date;
  diario?: Types.ObjectId;
  disciplina: Types.ObjectId;
  horario?: Types.ObjectId;
  professor: Types.ObjectId;
  registros: AttendanceRecord[];
  turma: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type LessonContent = {
  arquivos: AcademicFile[];
  data: Date;
  descricao: string;
  disciplina: Types.ObjectId;
  professor: Types.ObjectId;
  titulo: string;
  turma: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type AcademicTask = {
  arquivo?: AcademicFile;
  dataEntrega: Date;
  descricao: string;
  disciplina: Types.ObjectId;
  professor: Types.ObjectId;
  tipo: AcademicTaskType;
  titulo: string;
  turma: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type TaskSubmission = {
  aluno: Types.ObjectId | UserDocument;
  arquivo: AcademicFile;
  entregueEm: Date;
  observacaoProfessor?: string;
  status: SubmissionStatus;
  tarefa: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type DiaryEntry = {
  data: Date;
  disciplina: Types.ObjectId;
  observacoes?: string;
  professor: Types.ObjectId;
  turma: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type AcademicObservation = {
  aluno?: Types.ObjectId | UserDocument;
  data: Date;
  descricao: string;
  diario?: Types.ObjectId;
  disciplina: Types.ObjectId;
  professor: Types.ObjectId;
  turma: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type AcademicContextPayload = {
  data?: Date;
  disciplinaId: string;
  professorId?: string;
  turmaId: string;
};

export type AttendancePayload = AcademicContextPayload & {
  horarioId?: string;
  registros: Array<{
    alunoId: string;
    observacao?: string;
    status: AttendanceStatus;
  }>;
};

export type LessonContentPayload = AcademicContextPayload & {
  descricao: string;
  titulo: string;
};

export type AcademicTaskPayload = AcademicContextPayload & {
  dataEntrega: Date;
  descricao: string;
  tipo: AcademicTaskType;
  titulo: string;
};

export type DiaryEntryPayload = AcademicContextPayload & {
  observacoes?: string;
};

export type ObservationPayload = AcademicContextPayload & {
  alunoId?: string;
  descricao: string;
  diarioId?: string;
};

export type PublicAcademicSubject = {
  alunoQuantidade: number;
  disciplina: PublicSubject;
  proximaAula?: {
    diaSemana: string;
    horarioFim: string;
    horarioInicio: string;
    sala?: PublicRoom;
    turma: PublicClassGroup;
  };
  salas: PublicRoom[];
  turmas: PublicClassGroup[];
};

export type PublicAttendance = Omit<Attendance, 'disciplina' | 'horario' | 'professor' | 'registros' | 'turma'> & {
  id: string;
  disciplina: PublicSubject;
  professor: PublicUser;
  registros: Array<{
    aluno: PublicUser;
    observacao?: string;
    status: AttendanceStatus;
  }>;
  turma: PublicClassGroup;
};

export type PublicLessonContent = Omit<LessonContent, 'disciplina' | 'professor' | 'turma'> & {
  id: string;
  disciplina: PublicSubject;
  professor: PublicUser;
  turma: PublicClassGroup;
};

export type PublicAcademicTask = Omit<AcademicTask, 'disciplina' | 'professor' | 'turma'> & {
  entrega?: PublicTaskSubmission;
  entregasQuantidade: number;
  id: string;
  disciplina: PublicSubject;
  professor: PublicUser;
  turma: PublicClassGroup;
};

export type PublicTaskSubmission = Omit<TaskSubmission, 'aluno' | 'tarefa'> & {
  aluno: PublicUser;
  id: string;
  tarefa: string;
};

export type PublicDiaryEntry = Omit<DiaryEntry, 'disciplina' | 'professor' | 'turma'> & {
  id: string;
  disciplina: PublicSubject;
  professor: PublicUser;
  turma: PublicClassGroup;
};

export type PublicAcademicObservation = Omit<AcademicObservation, 'aluno' | 'disciplina' | 'professor' | 'turma'> & {
  aluno?: PublicUser;
  id: string;
  disciplina: PublicSubject;
  professor: PublicUser;
  turma: PublicClassGroup;
};
