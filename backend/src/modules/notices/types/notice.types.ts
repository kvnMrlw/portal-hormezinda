import type { Types } from 'mongoose';

import type { PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';

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
  titulo: string;
  descricao: string;
  categoria: NoticeCategory;
  prioridade: NoticePriority;
  autor: Types.ObjectId | UserDocument;
  fixado: boolean;
  ativo: boolean;
  dataInicio: Date;
  dataFim?: Date | null;
  anexos: NoticeAttachment[];
  createdAt: Date;
  updatedAt: Date;
};

export type PublicNotice = Omit<Notice, 'autor'> & {
  id: string;
  autor: PublicUser;
};

export type CreateNoticeData = Pick<
  Notice,
  'anexos' | 'ativo' | 'categoria' | 'dataFim' | 'dataInicio' | 'descricao' | 'fixado' | 'prioridade' | 'titulo'
> & {
  autor: string;
};

export type UpdateNoticeData = Partial<
  Pick<Notice, 'anexos' | 'ativo' | 'categoria' | 'dataFim' | 'dataInicio' | 'descricao' | 'fixado' | 'prioridade' | 'titulo'>
> & {
  removerAnexos?: string[];
};

export type ListNoticesOptions = {
  ativo?: boolean;
  categoria?: NoticeCategory;
  expirado?: boolean;
  fixado?: boolean;
  includeInactive?: boolean;
  includeScheduled?: boolean;
  prioridade?: NoticePriority;
  search?: string;
};
