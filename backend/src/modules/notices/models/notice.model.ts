import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { NoticeCategory, NoticePriority, type Notice } from '../types/notice.types';

export type NoticeDocument = HydratedDocument<Notice>;

const noticeAttachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true
    },
    nome: {
      type: String,
      required: true,
      trim: true
    },
    tipo: {
      type: String,
      required: true,
      trim: true
    },
    tamanho: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const noticeSchema = new Schema<Notice>(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    descricao: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    categoria: {
      type: String,
      enum: Object.values(NoticeCategory),
      required: true,
      index: true
    },
    prioridade: {
      type: String,
      enum: Object.values(NoticePriority),
      default: NoticePriority.INFORMATIVO,
      required: true,
      index: true
    },
    autor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fixado: {
      type: Boolean,
      default: false,
      index: true
    },
    ativo: {
      type: Boolean,
      default: true,
      index: true
    },
    dataInicio: {
      type: Date,
      required: true,
      index: true
    },
    dataFim: {
      type: Date,
      index: true
    },
    anexos: {
      type: [noticeAttachmentSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedNotice) => {
        const noticeObject = returnedNotice as Partial<Notice> & { _id?: unknown };

        delete noticeObject._id;
      }
    }
  }
);

noticeSchema.index({ fixado: -1, dataInicio: -1, createdAt: -1 });
noticeSchema.index({ titulo: 'text', descricao: 'text' });

export const NoticeModel: Model<Notice> = model<Notice>('Notice', noticeSchema);
