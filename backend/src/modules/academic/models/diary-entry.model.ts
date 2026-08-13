import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { DiaryEntry } from '../types/academic.types';

export type DiaryEntryDocument = HydratedDocument<DiaryEntry>;

const diaryEntrySchema = new Schema<DiaryEntry>(
  {
    data: { type: Date, required: true, index: true },
    disciplina: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    observacoes: { type: String, trim: true, maxlength: 2000, default: '' },
    professor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
      transform: (_document, returnedDiary) => {
        const diaryObject = returnedDiary as Partial<DiaryEntry> & { _id?: unknown };

        delete diaryObject._id;
      }
    }
  }
);

diaryEntrySchema.index({ turma: 1, disciplina: 1, data: -1 });
diaryEntrySchema.index({ professor: 1, data: -1 });

export const DiaryEntryModel: Model<DiaryEntry> = model<DiaryEntry>('DiaryEntry', diaryEntrySchema);
