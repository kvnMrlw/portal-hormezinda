import { Types, type FilterQuery, type PopulateOptions } from 'mongoose';

import { ScheduleModel, type ScheduleDocument } from '../models/schedule.model';
import { ScheduleEntryKind, type ScheduleEntry, type ScheduleEntryPayload, type ScheduleFilters, type Weekday } from '../types/schedule.types';

type ConflictFilter = {
  diaSemana: Weekday;
  excludeId?: string;
  horarioFim: string;
  horarioInicio: string;
  professorId?: string;
  salaId?: string;
  turmaId?: string;
};

const populateSchedule: PopulateOptions[] = [
  { path: 'disciplina', populate: [{ path: 'professores' }, { path: 'professorPadrao' }] },
  { path: 'professor' },
  { path: 'sala' },
  { path: 'turma' }
];

function buildTextFilter(search?: string) {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return {};
  }

  const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    observacao: { $regex: escapedSearch, $options: 'i' }
  };
}

function buildPayload(data: ScheduleEntryPayload) {
  return {
    diaSemana: data.diaSemana,
    disciplina: data.tipo === ScheduleEntryKind.LESSON && data.disciplinaId ? new Types.ObjectId(data.disciplinaId) : undefined,
    horarioFim: data.horarioFim,
    horarioInicio: data.horarioInicio,
    observacao: data.observacao ?? '',
    ordem: data.ordem ?? 0,
    professor: data.tipo === ScheduleEntryKind.LESSON && data.professorId ? new Types.ObjectId(data.professorId) : undefined,
    sala: data.tipo === ScheduleEntryKind.LESSON && data.salaId ? new Types.ObjectId(data.salaId) : undefined,
    tipo: data.tipo,
    turma: new Types.ObjectId(data.turmaId)
  };
}

export class ScheduleRepository {
  async list(filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplinaId ? { disciplina: filters.disciplinaId } : {}),
      ...(filters.professorId ? { professor: filters.professorId } : {}),
      ...(filters.salaId ? { sala: filters.salaId } : {}),
      ...(filters.turmaId ? { turma: filters.turmaId } : {})
    })
      .populate(populateSchedule)
      .sort({ diaSemana: 1, ordem: 1, horarioInicio: 1, horarioFim: 1 });
  }

  async listForStudent(classGroupId: string, filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplinaId ? { disciplina: filters.disciplinaId } : {}),
      turma: classGroupId
    })
      .populate(populateSchedule)
      .sort({ diaSemana: 1, ordem: 1, horarioInicio: 1, horarioFim: 1 });
  }

  async listForProfessor(professorId: string, filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplinaId ? { disciplina: filters.disciplinaId } : {}),
      ...(filters.salaId ? { sala: filters.salaId } : {}),
      professor: professorId,
      tipo: ScheduleEntryKind.LESSON
    })
      .populate(populateSchedule)
      .sort({ diaSemana: 1, ordem: 1, horarioInicio: 1, horarioFim: 1 });
  }

  async findById(id: string): Promise<ScheduleDocument | null> {
    return ScheduleModel.findById(id).populate(populateSchedule);
  }

  async findConflicts({
    diaSemana,
    excludeId,
    horarioFim,
    horarioInicio,
    professorId,
    salaId,
    turmaId
  }: ConflictFilter): Promise<ScheduleDocument[]> {
    const conflictTargets: FilterQuery<ScheduleEntry>[] = [];

    if (professorId) {
      conflictTargets.push({ professor: professorId });
    }

    if (turmaId) {
      conflictTargets.push({ turma: turmaId });
    }

    if (salaId) {
      conflictTargets.push({ sala: salaId });
    }

    if (!conflictTargets.length) {
      return [];
    }

    return ScheduleModel.find({
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      diaSemana,
      tipo: ScheduleEntryKind.LESSON,
      horarioInicio: { $lt: horarioFim },
      horarioFim: { $gt: horarioInicio },
      $or: conflictTargets
    }).populate(populateSchedule);
  }

  async create(data: ScheduleEntryPayload): Promise<ScheduleDocument> {
    const nextOrder = data.ordem ?? (await this.getNextOrder(data.turmaId, data.diaSemana));
    const schedule = await ScheduleModel.create(buildPayload({ ...data, ordem: nextOrder }));

    return schedule.populate(populateSchedule);
  }

  async update(id: string, data: ScheduleEntryPayload): Promise<ScheduleDocument | null> {
    return ScheduleModel.findByIdAndUpdate(id, buildPayload(data), { new: true }).populate(populateSchedule);
  }

  async delete(id: string): Promise<void> {
    await ScheduleModel.findByIdAndDelete(id);
  }

  async deleteByClass(classGroupId: string): Promise<void> {
    await ScheduleModel.deleteMany({ turma: classGroupId });
  }

  async getNextOrder(classGroupId: string, diaSemana: Weekday): Promise<number> {
    const lastSchedule = await ScheduleModel.findOne({ diaSemana, turma: classGroupId }).sort({ ordem: -1, horarioInicio: -1 });

    return (lastSchedule?.ordem ?? -1) + 1;
  }

  async copyWeek(originClassId: string, targetClassId: string): Promise<ScheduleDocument[]> {
    const schedules = await ScheduleModel.find({ turma: originClassId }).sort({ diaSemana: 1, ordem: 1, horarioInicio: 1 });
    const created = await ScheduleModel.insertMany(
      schedules.map((schedule) => ({
        diaSemana: schedule.diaSemana,
        disciplina: schedule.disciplina,
        horarioFim: schedule.horarioFim,
        horarioInicio: schedule.horarioInicio,
        observacao: schedule.observacao ?? '',
        ordem: schedule.ordem,
        professor: schedule.professor,
        sala: schedule.sala,
        tipo: schedule.tipo,
        turma: new Types.ObjectId(targetClassId)
      }))
    );

    return ScheduleModel.find({ _id: { $in: created.map((schedule) => schedule._id) } })
      .populate(populateSchedule)
      .sort({ diaSemana: 1, ordem: 1, horarioInicio: 1 });
  }

  async reorder(classGroupId: string, diaSemana: Weekday, ids: string[]): Promise<ScheduleDocument[]> {
    await Promise.all(
      ids.map((id, index) =>
        ScheduleModel.updateOne(
          {
            _id: id,
            diaSemana,
            turma: classGroupId
          },
          { ordem: index }
        )
      )
    );

    return ScheduleModel.find({ diaSemana, turma: classGroupId })
      .populate(populateSchedule)
      .sort({ ordem: 1, horarioInicio: 1 });
  }
}
