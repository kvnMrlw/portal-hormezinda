import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Subject } from '../types/catalog.types';

export type SubjectDocument = HydratedDocument<Subject>;

const subjectSchema = new Schema<Subject>(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 80
    },
    cor: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9a-fA-F]{6}$/
    },
    icone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: 'BookOpen'
    },
    professores: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      index: true
    },
    professorPadrao: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false
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
      transform: (_document, returnedSubject) => {
        const subjectObject = returnedSubject as Partial<Subject> & { _id?: unknown };

        delete subjectObject._id;
      }
    }
  }
);

subjectSchema.index({ nome: 1, professores: 1 });

export const SubjectModel: Model<Subject> = model<Subject>('Subject', subjectSchema);
