import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { AttendanceStatus, type Attendance } from '../types/academic.types';

export type AttendanceDocument = HydratedDocument<Attendance>;

const attendanceRecordSchema = new Schema(
  {
    aluno: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    observacao: { type: String, trim: true, maxlength: 240, default: '' },
    status: { type: String, enum: Object.values(AttendanceStatus), required: true, default: AttendanceStatus.PRESENT }
  },
  { _id: false }
);

const attendanceSchema = new Schema<Attendance>(
  {
    data: { type: Date, required: true, index: true },
    diario: { type: Schema.Types.ObjectId, ref: 'DiaryEntry', index: true },
    disciplina: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    horario: { type: Schema.Types.ObjectId, ref: 'Schedule', index: true },
    professor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registros: { type: [attendanceRecordSchema], default: [] },
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
      transform: (_document, returnedAttendance) => {
        const attendanceObject = returnedAttendance as Partial<Attendance> & { _id?: unknown };

        delete attendanceObject._id;
      }
    }
  }
);

attendanceSchema.index({ data: 1, disciplina: 1, turma: 1 }, { unique: true });
attendanceSchema.index({ professor: 1, data: -1 });

export const AttendanceModel: Model<Attendance> = model<Attendance>('Attendance', attendanceSchema);
