import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import type { PublicUser } from '../../users/types/user.types';
import { NotificationRepository } from '../repository/notification.repository';
import {
  type CreateNotificationData,
  type Notification,
  type NotificationListOptions,
  type PublicNotification
} from '../types/notification.types';
import type { NotificationDocument } from '../models/notification.model';
import { emitNotification } from './notification-events';

function isUserDocument(user: Notification['autor']): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function toPublicNotification(notification: NotificationDocument): PublicNotification {
  return {
    id: notification.id,
    autor: isUserDocument(notification.autor) ? toPublicUser(notification.autor) : undefined,
    criadaEm: notification.criadaEm,
    atualizadaEm: notification.atualizadaEm,
    descricao: notification.descricao,
    entidadeId: notification.entidadeId.toString(),
    entidadeTipo: notification.entidadeTipo,
    lida: notification.lida,
    tipo: notification.tipo,
    titulo: notification.titulo,
    url: notification.url
  };
}

export class NotificationService {
  constructor(
    private readonly notificationRepository = new NotificationRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async list(userId: string, options: NotificationListOptions): Promise<{ notificacoes: PublicNotification[]; naoLidas: number; total: number }> {
    const [notifications, total, unread] = await Promise.all([
      this.notificationRepository.list(userId, options),
      this.notificationRepository.count(userId, Boolean(options.unreadOnly)),
      this.notificationRepository.count(userId, true)
    ]);

    return {
      notificacoes: notifications.map(toPublicNotification),
      naoLidas: unread,
      total
    };
  }

  async create(data: CreateNotificationData): Promise<PublicNotification> {
    if (data.autorId && data.autorId === data.usuarioId) {
      throw new AppError('Notificacao duplicada para o proprio autor', 400);
    }

    const notification = toPublicNotification(await this.notificationRepository.create(data));
    emitNotification(data.usuarioId, notification);

    return notification;
  }

  async notifyUsers(userIds: string[], data: Omit<CreateNotificationData, 'usuarioId'>): Promise<void> {
    const uniqueUserIds = Array.from(new Set(userIds)).filter((userId) => userId && userId !== data.autorId);

    await Promise.all(uniqueUserIds.map((usuarioId) => this.create({ ...data, usuarioId }).catch(() => undefined)));
  }

  async notifyAllActive(data: Omit<CreateNotificationData, 'usuarioId'>): Promise<void> {
    const users = await this.userRepository.listActive({ includeAdmins: true });

    await this.notifyUsers(users.map((user) => user.id), data);
  }

  async markAsRead(id: string, viewer: PublicUser): Promise<PublicNotification | null> {
    const notification = await this.notificationRepository.markAsRead(id, viewer.id);

    return notification ? toPublicNotification(notification) : null;
  }

  async markAllAsRead(viewer: PublicUser): Promise<void> {
    await this.notificationRepository.markAllAsRead(viewer.id);
  }

  async deleteByEntity(entityId: string): Promise<void> {
    await this.notificationRepository.deleteByEntity(entityId);
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.notificationRepository.deleteByUser(userId);
  }
}
