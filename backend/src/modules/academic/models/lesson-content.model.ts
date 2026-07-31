import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { LessonContent } from '../types/academic.types';

export type LessonContentDocument = HydratedDocument<LessonContent>;

const academicFileSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 180 },
    tamanho: { type: Number, required: true, min: 0 },
    tipo: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const lessonContentSchema = new Schema<LessonContent>(
  {
    arquivos: { type: [academicFileSchema], default: [] },
    data: { type: Date, required: true, index: true },
    descricao: { type: String, required: true, trim: true, maxlength: 3000 },
    disciplina: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    professor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titulo: { type: String, required: true, trim: true, maxlength: 140 },
    turma: { type: Schema.Types.ObjectId, ref: 'ClassGroup', required: true, index: true }
  },
  {
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedContent) => {
        const contentObject = returnedContent as Partial<LessonContent> & { _id?: unknown };

        delete contentObject._id;
      }
    }
  }
);

lessonContentSchema.index({ turma: 1, disciplina: 1, data: -1 });
lessonContentSchema.index({ professor: 1, data: -1 });

export const LessonContentModel: Model<LessonContent> = model<LessonContent>('LessonContent', lessonContentSchema);
