import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { AcademicTaskType, type AcademicTask } from '../types/academic.types';

export type AcademicTaskDocument = HydratedDocument<AcademicTask>;

const academicFileSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 180 },
    tamanho: { type: Number, required: true, min: 0 },
    tipo: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const academicTaskSchema = new Schema<AcademicTask>(
  {
    arquivo: { type: academicFileSchema },
    dataEntrega: { type: Date, required: true, index: true },
    descricao: { type: String, required: true, trim: true, maxlength: 3000 },
    disciplina: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    professor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tipo: { type: String, enum: Object.values(AcademicTaskType), required: true, index: true },
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
      transform: (_document, returnedTask) => {
        const taskObject = returnedTask as Partial<AcademicTask> & { _id?: unknown };

        delete taskObject._id;
      }
    }
  }
);

academicTaskSchema.index({ turma: 1, dataEntrega: 1 });
academicTaskSchema.index({ disciplina: 1, dataEntrega: 1 });
academicTaskSchema.index({ professor: 1, dataEntrega: -1 });

export const AcademicTaskModel: Model<AcademicTask> = model<AcademicTask>('AcademicTask', academicTaskSchema);
