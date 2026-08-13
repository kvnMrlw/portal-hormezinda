import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { BirthdayMessage } from '../types/social.types';

export type BirthdayMessageDocument = HydratedDocument<BirthdayMessage>;

const birthdayMessageSchema = new Schema<BirthdayMessage>(
  {
    aniversariante: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    autor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mensagem: { type: String, required: true, trim: true, maxlength: 80 }
  },
  {
    timestamps: {
      createdAt: 'criadaEm',
      updatedAt: 'atualizadaEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedMessage) => {
        const messageObject = returnedMessage as Partial<BirthdayMessage> & { _id?: unknown };

        delete messageObject._id;
      }
    }
  }
);

birthdayMessageSchema.index({ aniversariante: 1, autor: 1, criadaEm: -1 });

export const BirthdayMessageModel: Model<BirthdayMessage> = model<BirthdayMessage>('BirthdayMessage', birthdayMessageSchema);
