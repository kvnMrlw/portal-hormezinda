import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { NotificationEntityType, NotificationType, type Notification } from '../types/notification.types';

export type NotificationDocument = HydratedDocument<Notification>;

const notificationSchema = new Schema<Notification>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    tipo: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true
    },
    entidadeTipo: {
      type: String,
      enum: Object.values(NotificationEntityType),
      required: true,
      index: true
    },
    entidadeId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    lida: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: {
      createdAt: 'criadaEm',
      updatedAt: 'atualizadaEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedNotification) => {
        const notificationObject = returnedNotification as Partial<Notification> & { _id?: unknown };

        delete notificationObject._id;
      }
    }
  }
);

notificationSchema.index({ usuario: 1, lida: 1, criadaEm: -1 });
notificationSchema.index({ entidadeTipo: 1, entidadeId: 1 });

export const NotificationModel: Model<Notification> = model<Notification>('Notification', notificationSchema);
