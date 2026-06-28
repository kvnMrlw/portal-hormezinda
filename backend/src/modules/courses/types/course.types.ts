import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';

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
  titulo: string;
  tipo: CourseContentType;
  texto?: string;
  arquivo?: CourseAsset;
  link?: string;
  ordem: number;
};

export type Course = {
  titulo: string;
  descricao: string;
  capa?: CourseCover;
  categoria: string;
  professor: Types.ObjectId | UserDocument;
  arquivos: CourseAsset[];
  link?: string;
  conteudos: CourseContent[];
  status: CourseStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicCourseContent = CourseContent & {
  id?: string;
};

export type PublicCourse = Omit<Course, 'professor' | 'conteudos'> & {
  id: string;
  professor: PublicUser;
  conteudos: PublicCourseContent[];
  quantidadeConteudos: number;
};

export type CoursePayload = Pick<Course, 'categoria' | 'descricao' | 'link' | 'status' | 'titulo'> & {
  conteudos?: Array<Omit<CourseContent, 'arquivo'>>;
  professorId: string;
};

export type CourseFilters = {
  categoria?: string;
  includeHidden?: boolean;
  professorId?: string;
  search?: string;
  status?: CourseStatus;
};
