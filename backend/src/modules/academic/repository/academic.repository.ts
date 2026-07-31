import { Types, type PopulateOptions } from 'mongoose';

import { AcademicTaskModel, type AcademicTaskDocument } from '../models/academic-task.model';
import { AttendanceModel, type AttendanceDocument } from '../models/attendance.model';
import { DiaryEntryModel, type DiaryEntryDocument } from '../models/diary-entry.model';
import { LessonContentModel, type LessonContentDocument } from '../models/lesson-content.model';
import { AcademicObservationModel, type AcademicObservationDocument } from '../models/observation.model';
import { TaskSubmissionModel, type TaskSubmissionDocument } from '../models/task-submission.model';
import type {
  AcademicFile,
  AcademicTaskPayload,
  AttendancePayload,
  DiaryEntryPayload,
  LessonContentPayload,
  ObservationPayload,
  SubmissionStatus
} from '../types/academic.types';

export type AcademicListFilters = {
  disciplinaIds?: string[];
  disciplinaId?: string;
  professorId?: string;
  turmaIds?: string[];
  turmaId?: string;
};

const academicPopulate: PopulateOptions[] = [
  { path: 'disciplina', populate: [{ path: 'professores' }, { path: 'professorPadrao' }] },
  { path: 'professor' },
  { path: 'turma' }
];

const attendancePopulate: PopulateOptions[] = [...academicPopulate, { path: 'registros.aluno' }];
const submissionPopulate: PopulateOptions[] = [{ path: 'aluno' }, { path: 'tarefa', populate: academicPopulate }];

function objectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

function buildAccessFilter(filters: AcademicListFilters = {}) {
  return {
    ...(filters.disciplinaId ? { disciplina: filters.disciplinaId } : {}),
    ...(filters.disciplinaIds?.length ? { disciplina: { $in: filters.disciplinaIds } } : {}),
    ...(filters.professorId ? { professor: filters.professorId } : {}),
    ...(filters.turmaId ? { turma: filters.turmaId } : {}),
    ...(filters.turmaIds?.length ? { turma: { $in: filters.turmaIds } } : {})
  };
}

export class AcademicRepository {
  async upsertAttendance(data: AttendancePayload, professorId: string): Promise<AttendanceDocument> {
    return AttendanceModel.findOneAndUpdate(
      {
        data: data.data ?? startOfDay(new Date()),
        disciplina: data.disciplinaId,
        turma: data.turmaId
      },
      {
        data: data.data ?? startOfDay(new Date()),
        disciplina: objectId(data.disciplinaId),
        horario: data.horarioId ? objectId(data.horarioId) : undefined,
        professor: objectId(professorId),
        registros: data.registros.map((record) => ({
          aluno: objectId(record.alunoId),
          observacao: record.observacao ?? '',
          status: record.status
        })),
        turma: objectId(data.turmaId)
      },
      { new: true, upsert: true }
    ).populate(attendancePopulate);
  }

  async listAttendance(filters: AcademicListFilters = {}): Promise<AttendanceDocument[]> {
    return AttendanceModel.find(buildAccessFilter(filters)).populate(attendancePopulate).sort({ data: -1, atualizadoEm: -1 });
  }

  async createContent(data: LessonContentPayload, professorId: string, arquivos: AcademicFile[]): Promise<LessonContentDocument> {
    const content = await LessonContentModel.create({
      arquivos,
      data: data.data ?? new Date(),
      descricao: data.descricao,
      disciplina: objectId(data.disciplinaId),
      professor: objectId(professorId),
      titulo: data.titulo,
      turma: objectId(data.turmaId)
    });

    return content.populate(academicPopulate);
  }

  async listContents(filters: AcademicListFilters = {}): Promise<LessonContentDocument[]> {
    return LessonContentModel.find(buildAccessFilter(filters)).populate(academicPopulate).sort({ data: -1, criadoEm: -1 });
  }

  async createTask(data: AcademicTaskPayload, professorId: string, arquivo?: AcademicFile): Promise<AcademicTaskDocument> {
    const task = await AcademicTaskModel.create({
      arquivo,
      dataEntrega: data.dataEntrega,
      descricao: data.descricao,
      disciplina: objectId(data.disciplinaId),
      professor: objectId(professorId),
      tipo: data.tipo,
      titulo: data.titulo,
      turma: objectId(data.turmaId)
    });

    return task.populate(academicPopulate);
  }

  async updateTask(id: string, data: AcademicTaskPayload, professorId: string, arquivo?: AcademicFile): Promise<AcademicTaskDocument | null> {
    return AcademicTaskModel.findByIdAndUpdate(
      id,
      {
        ...(arquivo ? { arquivo } : {}),
        dataEntrega: data.dataEntrega,
        descricao: data.descricao,
        disciplina: objectId(data.disciplinaId),
        professor: objectId(professorId),
        tipo: data.tipo,
        titulo: data.titulo,
        turma: objectId(data.turmaId)
      },
      { new: true }
    ).populate(academicPopulate);
  }

  async findTaskById(id: string): Promise<AcademicTaskDocument | null> {
    return AcademicTaskModel.findById(id).populate(academicPopulate);
  }

  async listTasks(filters: AcademicListFilters = {}): Promise<AcademicTaskDocument[]> {
    return AcademicTaskModel.find(buildAccessFilter(filters)).populate(academicPopulate).sort({ dataEntrega: 1, criadoEm: -1 });
  }

  async createOrReplaceSubmission(taskId: string, studentId: string, arquivo: AcademicFile): Promise<TaskSubmissionDocument> {
    return TaskSubmissionModel.findOneAndUpdate(
      { aluno: studentId, tarefa: taskId },
      {
        aluno: objectId(studentId),
        arquivo,
        entregueEm: new Date(),
        tarefa: objectId(taskId)
      },
      { new: true, upsert: true }
    ).populate(submissionPopulate);
  }

  async findSubmissionById(id: string): Promise<TaskSubmissionDocument | null> {
    return TaskSubmissionModel.findById(id).populate(submissionPopulate);
  }

  async listSubmissions(taskId: string): Promise<TaskSubmissionDocument[]> {
    return TaskSubmissionModel.find({ tarefa: taskId }).populate(submissionPopulate).sort({ entregueEm: -1 });
  }

  async listSubmissionsForStudent(studentId: string): Promise<TaskSubmissionDocument[]> {
    return TaskSubmissionModel.find({ aluno: studentId }).populate(submissionPopulate).sort({ entregueEm: -1 });
  }

  async reviewSubmission(id: string, data: { observacaoProfessor?: string; status: SubmissionStatus }): Promise<TaskSubmissionDocument | null> {
    return TaskSubmissionModel.findByIdAndUpdate(
      id,
      {
        observacaoProfessor: data.observacaoProfessor ?? '',
        status: data.status
      },
      { new: true }
    ).populate(submissionPopulate);
  }

  async createDiary(data: DiaryEntryPayload, professorId: string): Promise<DiaryEntryDocument> {
    const diary = await DiaryEntryModel.create({
      data: data.data ?? new Date(),
      disciplina: objectId(data.disciplinaId),
      observacoes: data.observacoes ?? '',
      professor: objectId(professorId),
      turma: objectId(data.turmaId)
    });

    return diary.populate(academicPopulate);
  }

  async listDiaries(filters: AcademicListFilters = {}): Promise<DiaryEntryDocument[]> {
    return DiaryEntryModel.find(buildAccessFilter(filters)).populate(academicPopulate).sort({ data: -1, criadoEm: -1 });
  }

  async createObservation(data: ObservationPayload, professorId: string): Promise<AcademicObservationDocument> {
    const observation = await AcademicObservationModel.create({
      aluno: data.alunoId ? objectId(data.alunoId) : undefined,
      data: data.data ?? new Date(),
      descricao: data.descricao,
      diario: data.diarioId ? objectId(data.diarioId) : undefined,
      disciplina: objectId(data.disciplinaId),
      professor: objectId(professorId),
      turma: objectId(data.turmaId)
    });

    return observation.populate([...academicPopulate, { path: 'aluno' }]);
  }

  async listObservations(filters: AcademicListFilters = {}): Promise<AcademicObservationDocument[]> {
    return AcademicObservationModel.find(buildAccessFilter(filters)).populate([...academicPopulate, { path: 'aluno' }]).sort({ data: -1 });
  }

  async countSubmissionsByTask(taskIds: string[]): Promise<Array<{ _id: Types.ObjectId; total: number }>> {
    return TaskSubmissionModel.aggregate([
      { $match: { tarefa: { $in: taskIds.map(objectId) } } },
      { $group: { _id: '$tarefa', total: { $sum: 1 } } }
    ]);
  }

  async deleteBySubject(subjectId: string): Promise<void> {
    const tasks = await AcademicTaskModel.find({ disciplina: subjectId }).select('_id');
    await Promise.all([
      AttendanceModel.deleteMany({ disciplina: subjectId }),
      LessonContentModel.deleteMany({ disciplina: subjectId }),
      DiaryEntryModel.deleteMany({ disciplina: subjectId }),
      AcademicObservationModel.deleteMany({ disciplina: subjectId }),
      AcademicTaskModel.deleteMany({ disciplina: subjectId }),
      TaskSubmissionModel.deleteMany({ tarefa: { $in: tasks.map((task) => task._id) } })
    ]);
  }
}

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}
