import { Types } from 'mongoose';

import { NotificationModel, type NotificationDocument } from '../models/notification.model';
import type { CreateNotificationData, NotificationListOptions } from '../types/notification.types';

function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export class NotificationRepository {
  async create(data: CreateNotificationData): Promise<NotificationDocument> {
    const notification = await NotificationModel.create({
      autor: data.autorId ? toObjectId(data.autorId) : undefined,
      descricao: data.descricao,
      entidadeId: toObjectId(data.entidadeId),
      entidadeTipo: data.entidadeTipo,
      tipo: data.tipo,
      titulo: data.titulo,
      url: data.url,
      usuario: toObjectId(data.usuarioId)
    });

    return notification.populate('autor');
  }

  async list(userId: string, options: NotificationListOptions): Promise<NotificationDocument[]> {
    return NotificationModel.find({
      usuario: userId,
      ...(options.unreadOnly ? { lida: false } : {})
    })
      .populate('autor')
      .sort({ criadaEm: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
  }

  async count(userId: string, unreadOnly = false): Promise<number> {
    return NotificationModel.countDocuments({
      usuario: userId,
      ...(unreadOnly ? { lida: false } : {})
    });
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument | null> {
    return NotificationModel.findOneAndUpdate({ _id: id, usuario: userId }, { lida: true }, { new: true }).populate('autor');
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ usuario: userId, lida: false }, { lida: true });
  }

  async deleteByEntity(entityId: string): Promise<void> {
    await NotificationModel.deleteMany({ entidadeId: entityId });
  }

  async deleteByUser(userId: string): Promise<void> {
    await NotificationModel.deleteMany({ $or: [{ usuario: userId }, { autor: userId }] });
  }
}
