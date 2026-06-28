import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';

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
  usuario: Types.ObjectId | UserDocument;
  autor?: Types.ObjectId | UserDocument;
  tipo: NotificationType;
  entidadeTipo: NotificationEntityType;
  entidadeId: Types.ObjectId;
  titulo: string;
  descricao: string;
  url: string;
  lida: boolean;
  criadaEm: Date;
  atualizadaEm: Date;
};

export type PublicNotification = Omit<Notification, 'autor' | 'entidadeId' | 'usuario'> & {
  id: string;
  autor?: PublicUser;
  entidadeId: string;
};

export type CreateNotificationData = {
  autorId?: string;
  descricao: string;
  entidadeId: string;
  entidadeTipo: NotificationEntityType;
  titulo: string;
  tipo: NotificationType;
  url: string;
  usuarioId: string;
};

export type NotificationListOptions = {
  limit: number;
  page: number;
  unreadOnly?: boolean;
};
