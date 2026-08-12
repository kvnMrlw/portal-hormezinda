import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { SubmissionStatus, type TaskSubmission } from '../types/academic.types';

export type TaskSubmissionDocument = HydratedDocument<TaskSubmission>;

const academicFileSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 180 },
    tamanho: { type: Number, required: true, min: 0 },
    tipo: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const taskSubmissionSchema = new Schema<TaskSubmission>(
  {
    aluno: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    arquivo: { type: academicFileSchema, required: true },
    entregueEm: { type: Date, required: true, default: Date.now, index: true },
    observacaoProfessor: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: Object.values(SubmissionStatus), required: true, default: SubmissionStatus.SUBMITTED, index: true },
    tarefa: { type: Schema.Types.ObjectId, ref: 'AcademicTask', required: true, index: true }
  },
  {
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm'
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_document, returnedSubmission) => {
        const submissionObject = returnedSubmission as Partial<TaskSubmission> & { _id?: unknown };

        delete submissionObject._id;
      }
    }
  }
);

taskSubmissionSchema.index({ tarefa: 1, aluno: 1 }, { unique: true });
taskSubmissionSchema.index({ aluno: 1, entregueEm: -1 });

export const TaskSubmissionModel: Model<TaskSubmission> = model<TaskSubmission>('TaskSubmission', taskSubmissionSchema);
