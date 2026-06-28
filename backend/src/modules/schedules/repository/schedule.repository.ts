import { Types, type FilterQuery, type PopulateOptions } from 'mongoose';

import { ScheduleModel, type ScheduleDocument } from '../models/schedule.model';
import { ScheduleEntryKind, type ScheduleEntry, type ScheduleEntryPayload, type ScheduleFilters, type Weekday } from '../types/schedule.types';

type ConflictFilter = {
  diaSemana: Weekday;
  disciplinaId?: string;
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
    disciplina: new Types.ObjectId(data.disciplinaId),
    horarioFim: data.horarioFim,
    horarioInicio: data.horarioInicio,
    observacao: data.observacao ?? '',
    professor: data.professorId ? new Types.ObjectId(data.professorId) : undefined,
    sala: data.salaId ? new Types.ObjectId(data.salaId) : undefined,
    tipo: data.tipo,
    turma: data.turmaId ? new Types.ObjectId(data.turmaId) : undefined
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
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1 });
  }

  async listForStudent(classGroupId: string, filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplinaId ? { disciplina: filters.disciplinaId } : {}),
      $or: [{ turma: classGroupId }, { tipo: ScheduleEntryKind.INTERVAL, turma: { $exists: false } }]
    })
      .populate(populateSchedule)
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1 });
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
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1 });
  }

  async findById(id: string): Promise<ScheduleDocument | null> {
    return ScheduleModel.findById(id).populate(populateSchedule);
  }

  async findConflicts({
    diaSemana,
    disciplinaId,
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

    if (disciplinaId) {
      conflictTargets.push({ disciplina: disciplinaId });
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
    const schedule = await ScheduleModel.create(buildPayload(data));

    return schedule.populate(populateSchedule);
  }

  async update(id: string, data: ScheduleEntryPayload): Promise<ScheduleDocument | null> {
    return ScheduleModel.findByIdAndUpdate(id, buildPayload(data), { new: true }).populate(populateSchedule);
  }

  async delete(id: string): Promise<void> {
    await ScheduleModel.findByIdAndDelete(id);
  }
}
