import type { User } from './auth';

export enum NotificationType {
  NEW_NOTICE = 'NEW_NOTICE',
  NEW_STORY = 'NEW_STORY',
  NEW_POST = 'NEW_POST',
  NEW_COURSE = 'NEW_COURSE',
  NEW_PLATFORM = 'NEW_PLATFORM',
  NEW_IDEA = 'NEW_IDEA',
  IDEA_APPROVED = 'IDEA_APPROVED',
  IDEA_REJECTED = 'IDEA_REJECTED',
  IDEA_COMPLETED = 'IDEA_COMPLETED',
  IDEA_RESPONSE = 'IDEA_RESPONSE',
  POST_REACTION = 'POST_REACTION',
  IDEA_REACTION = 'IDEA_REACTION',
  IDEA_SUPPORT = 'IDEA_SUPPORT',
  FUTURE_COMMENT = 'FUTURE_COMMENT'
}

export enum NotificationEntityType {
  NOTICE = 'NOTICE',
  STORY = 'STORY',
  POST = 'POST',
  COURSE = 'COURSE',
  IDEA = 'IDEA',
  COMMENT = 'COMMENT'
}

export type Notification = {
  id: string;
  autor?: User;
  criadaEm: string;
  atualizadaEm: string;
  descricao: string;
  entidadeId: string;
  entidadeTipo: NotificationEntityType;
  lida: boolean;
  tipo: NotificationType;
  titulo: string;
  url: string;
};

export type NotificationResponse = {
  naoLidas: number;
  notificacoes: Notification[];
  total: number;
};
