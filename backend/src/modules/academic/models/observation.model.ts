import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { AcademicObservation } from '../types/academic.types';

export type AcademicObservationDocument = HydratedDocument<AcademicObservation>;

const academicObservationSchema = new Schema<AcademicObservation>(
  {
    aluno: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    data: { type: Date, required: true, index: true },
    descricao: { type: String, required: true, trim: true, maxlength: 2000 },
    diario: { type: Schema.Types.ObjectId, ref: 'DiaryEntry', index: true },
    disciplina: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
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
      transform: (_document, returnedObservation) => {
        const observationObject = returnedObservation as Partial<AcademicObservation> & { _id?: unknown };

        delete observationObject._id;
      }
    }
  }
);

academicObservationSchema.index({ turma: 1, disciplina: 1, data: -1 });
academicObservationSchema.index({ professor: 1, data: -1 });

export const AcademicObservationModel: Model<AcademicObservation> = model<AcademicObservation>('AcademicObservation', academicObservationSchema);
