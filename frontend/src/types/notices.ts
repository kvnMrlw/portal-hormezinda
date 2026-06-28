import type { User } from './auth';

export enum NoticeCategory {
  GERAL = 'GERAL',
  PEDAGOGICO = 'PEDAGOGICO',
  EVENTOS = 'EVENTOS',
  REFEITORIO = 'REFEITORIO',
  BIBLIOTECA = 'BIBLIOTECA',
  TRANSPORTE = 'TRANSPORTE',
  GREMIO = 'GREMIO',
  MANUTENCAO = 'MANUTENCAO'
}

export enum NoticePriority {
  URGENTE = 'URGENTE',
  IMPORTANTE = 'IMPORTANTE',
  INFORMATIVO = 'INFORMATIVO'
}

export type NoticeAttachment = {
  url: string;
  nome: string;
  tipo: string;
  tamanho: number;
};

export type Notice = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: NoticeCategory;
  prioridade: NoticePriority;
  autor: User;
  fixado: boolean;
  ativo: boolean;
  dataInicio: string;
  dataFim?: string;
  anexos: NoticeAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type NoticeFilters = {
  search?: string;
  categoria?: NoticeCategory | 'TODAS';
  prioridade?: NoticePriority | 'TODAS';
  status?: 'TODOS' | 'FIXADOS' | 'ATIVOS' | 'EXPIRADOS';
};

export type NoticePayload = {
  titulo?: string;
  descricao?: string;
  categoria?: NoticeCategory;
  prioridade?: NoticePriority;
  fixado?: boolean;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string | null;
  anexos?: File[];
  removerAnexos?: string[];
};
