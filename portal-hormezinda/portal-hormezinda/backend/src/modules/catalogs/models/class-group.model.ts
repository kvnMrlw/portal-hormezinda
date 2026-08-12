import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { Turno } from '../../users/types/user.types';
import type { ClassGroup } from '../types/catalog.types';

export type ClassGroupDocument = HydratedDocument<ClassGroup>;

const classGroupSchema = new Schema<ClassGroup>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 40
    },
    ano: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    turno: {
      type: String,
      enum: Object.values(Turno),
      required: true,
      index: true
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
      transform: (_document, returnedClassGroup) => {
        const classGroupObject = returnedClassGroup as Partial<ClassGroup> & { _id?: unknown };

        delete classGroupObject._id;
      }
    }
  }
);

classGroupSchema.index({ nome: 1, turno: 1 });

export const ClassGroupModel: Model<ClassGroup> = model<ClassGroup>('ClassGroup', classGroupSchema);
