import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

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
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sala: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      index: true
    },
    turma: {
      type: Schema.Types.ObjectId,
      ref: 'ClassGroup',
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
scheduleSchema.index({ diaSemana: 1, horarioInicio: 1, sala: 1 });
scheduleSchema.index({ diaSemana: 1, horarioInicio: 1, disciplina: 1 });

export const ScheduleModel: Model<ScheduleEntry> = model<ScheduleEntry>('Schedule', scheduleSchema);
