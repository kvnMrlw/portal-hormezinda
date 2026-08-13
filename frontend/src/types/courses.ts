import type { User } from './auth';

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum CourseContentType {
  TEXT = 'TEXT',
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  LINK = 'LINK'
}

export type CourseAsset = {
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
};

export type CourseCover = CourseAsset & {
  alt: string;
};

export type CourseContent = {
  id?: string;
  titulo: string;
  tipo: CourseContentType;
  texto?: string;
  arquivo?: CourseAsset;
  link?: string;
  ordem: number;
};

export type Course = {
  id: string;
  titulo: string;
  descricao: string;
  capa?: CourseCover;
  categoria: string;
  professor: User;
  arquivos: CourseAsset[];
  link?: string;
  conteudos: CourseContent[];
  quantidadeConteudos: number;
  status: CourseStatus;
  criadoEm: string;
  atualizadoEm: string;
};

export type CourseFilters = {
  categoria?: string;
  professorId?: string;
  search?: string;
  status?: CourseStatus | '';
};

export type CoursePayload = {
  titulo: string;
  descricao: string;
  categoria: string;
  professorId: string;
  link?: string;
  status: CourseStatus;
  conteudos: Array<Pick<CourseContent, 'link' | 'ordem' | 'texto' | 'tipo' | 'titulo'>>;
  capa?: File;
  arquivos?: File[];
};

export const courseStatusLabels: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: 'Rascunho',
  [CourseStatus.PUBLISHED]: 'Publicado',
  [CourseStatus.ARCHIVED]: 'Arquivado'
};

export const courseContentTypeLabels: Record<CourseContentType, string> = {
  [CourseContentType.TEXT]: 'Texto',
  [CourseContentType.PDF]: 'PDF',
  [CourseContentType.VIDEO]: 'Video',
  [CourseContentType.IMAGE]: 'Imagem',
  [CourseContentType.LINK]: 'Link'
};
