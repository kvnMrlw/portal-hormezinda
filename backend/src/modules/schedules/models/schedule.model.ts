import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { Turma } from '../../users/types/user.types';
import { ScheduleEntryKind, Weekday, type ScheduleEntry } from '../types/schedule.types';

export type ScheduleDocument = HydratedDocument<ScheduleEntry>;

const scheduleSchema = new Schema<ScheduleEntry>(
  {
    tipo: {
      type: String,
      enum: Object.values(ScheduleEntryKind),
      default: ScheduleEntryKind.LESSON,
      required: true,
      index: true
    },
    disciplina: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sala: {
      type: String,
      trim: true,
      maxlength: 40,
      index: true
    },
    turma: {
      type: String,
      enum: Object.values(Turma),
      index: true
    },
    diaSemana: {
      type: String,
      enum: Object.values(Weekday),
      required: true,
      index: true
    },
    horarioInicio: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
      index: true
    },
    horarioFim: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    observacao: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ''
    },
    cor: {
      type: String,
      required: true,
      trim: true,
      match: /^#[0-9a-fA-F]{6}$/
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
      transform: (_document, returnedSchedule) => {
        const scheduleObject = returnedSchedule as Partial<ScheduleEntry> & { _id?: unknown };

        delete scheduleObject._id;
      }
    }
  }
);

scheduleSchema.index({ diaSemana: 1, horarioInicio: 1, turma: 1 });
scheduleSchema.index({ diaSemana: 1, horarioInicio: 1, professor: 1 });
scheduleSchema.index({ disciplina: 'text', observacao: 'text', sala: 'text' });

export const ScheduleModel: Model<ScheduleEntry> = model<ScheduleEntry>('Schedule', scheduleSchema);
