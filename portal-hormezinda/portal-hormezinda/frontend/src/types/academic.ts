import type { User } from './auth';
import type { ClassGroup, Room, Subject } from './catalogs';
import type { Weekday } from './schedules';

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

export type AcademicSubject = {
  alunoQuantidade: number;
  disciplina: Subject;
  proximaAula?: {
    diaSemana: Weekday;
    horarioFim: string;
    horarioInicio: string;
    sala?: Room;
    turma: ClassGroup;
  };
  salas: Room[];
  turmas: ClassGroup[];
};

export type Attendance = {
  id: string;
  data: string;
  disciplina: Subject;
  professor: User;
  registros: Array<{
    aluno: User;
    observacao?: string;
    status: AttendanceStatus;
  }>;
  turma: ClassGroup;
  criadoEm: string;
  atualizadoEm: string;
};

export type LessonContent = {
  id: string;
  arquivos: AcademicFile[];
  data: string;
  descricao: string;
  disciplina: Subject;
  professor: User;
  titulo: string;
  turma: ClassGroup;
  criadoEm: string;
  atualizadoEm: string;
};

export type TaskSubmission = {
  id: string;
  aluno: User;
  arquivo: AcademicFile;
  entregueEm: string;
  observacaoProfessor?: string;
  status: SubmissionStatus;
  tarefa: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type AcademicTask = {
  id: string;
  arquivo?: AcademicFile;
  dataEntrega: string;
  descricao: string;
  disciplina: Subject;
  entrega?: TaskSubmission;
  entregasQuantidade: number;
  professor: User;
  tipo: AcademicTaskType;
  titulo: string;
  turma: ClassGroup;
  criadoEm: string;
  atualizadoEm: string;
};

export type DiaryEntry = {
  id: string;
  data: string;
  disciplina: Subject;
  observacoes?: string;
  professor: User;
  turma: ClassGroup;
  criadoEm: string;
  atualizadoEm: string;
};

export type AcademicSummary = {
  disciplinas: string[];
  proximaAula?: {
    diaSemana: Weekday;
    disciplina: string;
    horarioFim: string;
    horarioInicio: string;
    sala?: Room;
    turma: ClassGroup;
  };
  quantidadeTurmas: number;
  ultimasAtividades: AcademicTask[];
  ultimosConteudos: LessonContent[];
};

export type AcademicFilters = {
  disciplinaId?: string;
  status?: 'PENDENTE' | 'ENTREGUE' | 'ATRASADA' | '';
  turmaId?: string;
};

export type AttendancePayload = {
  data?: string;
  disciplinaId: string;
  professorId?: string;
  registros: Array<{
    alunoId: string;
    observacao?: string;
    status: AttendanceStatus;
  }>;
  turmaId: string;
};

export type ContentPayload = {
  arquivos?: File[];
  data?: string;
  descricao: string;
  disciplinaId: string;
  professorId?: string;
  titulo: string;
  turmaId: string;
};

export type TaskPayload = {
  arquivo?: File;
  dataEntrega: string;
  descricao: string;
  disciplinaId: string;
  professorId?: string;
  tipo: AcademicTaskType;
  titulo: string;
  turmaId: string;
};
