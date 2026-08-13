import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Room } from '../types/catalog.types';

export type RoomDocument = HydratedDocument<Room>;

const roomSchema = new Schema<Room>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 40
    },
    bloco: {
      type: String,
      trim: true,
      maxlength: 40,
      default: ''
    },
    capacidade: {
      type: Number,
      required: true,
      min: 1,
      max: 500
    },
    observacoes: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ''
    }
  },
  {
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedRoom) => {
        const roomObject = returnedRoom as Partial<Room> & { _id?: unknown };

        delete roomObject._id;
      }
    }
  }
);

export const RoomModel: Model<Room> = model<Room>('Room', roomSchema);
