import { Types, type FilterQuery } from 'mongoose';

import { ScheduleModel, type ScheduleDocument } from '../models/schedule.model';
import { ScheduleEntryKind, type ScheduleEntry, type ScheduleEntryPayload, type ScheduleFilters, type Weekday } from '../types/schedule.types';

type ConflictFilter = {
  diaSemana: Weekday;
  excludeId?: string;
  horarioFim: string;
  horarioInicio: string;
  professorId?: string;
  sala?: string;
  turma?: string;
};

function buildTextFilter(search?: string) {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return {};
  }

  const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    $or: [
      { disciplina: { $regex: escapedSearch, $options: 'i' } },
      { sala: { $regex: escapedSearch, $options: 'i' } },
      { observacao: { $regex: escapedSearch, $options: 'i' } }
    ]
  };
}

function buildPayload(data: ScheduleEntryPayload) {
  return {
    cor: data.cor,
    diaSemana: data.diaSemana,
    disciplina: data.disciplina,
    horarioFim: data.horarioFim,
    horarioInicio: data.horarioInicio,
    observacao: data.observacao ?? '',
    professor: data.professorId ? new Types.ObjectId(data.professorId) : undefined,
    sala: data.sala,
    tipo: data.tipo,
    turma: data.turma
  };
}

export class ScheduleRepository {
  async list(filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplina ? { disciplina: { $regex: filters.disciplina.trim(), $options: 'i' } } : {}),
      ...(filters.professorId ? { professor: filters.professorId } : {}),
      ...(filters.turma ? { turma: filters.turma } : {})
    })
      .populate('professor')
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1, disciplina: 1 });
  }

  async listForStudent(turma: string, filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplina ? { disciplina: { $regex: filters.disciplina.trim(), $options: 'i' } } : {}),
      $or: [{ turma }, { tipo: ScheduleEntryKind.INTERVAL, turma: { $exists: false } }]
    })
      .populate('professor')
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1, disciplina: 1 });
  }

  async listForProfessor(professorId: string, filters: ScheduleFilters = {}): Promise<ScheduleDocument[]> {
    return ScheduleModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.diaSemana ? { diaSemana: filters.diaSemana } : {}),
      ...(filters.disciplina ? { disciplina: { $regex: filters.disciplina.trim(), $options: 'i' } } : {}),
      professor: professorId,
      tipo: ScheduleEntryKind.LESSON
    })
      .populate('professor')
      .sort({ diaSemana: 1, horarioInicio: 1, horarioFim: 1, disciplina: 1 });
  }

  async findById(id: string): Promise<ScheduleDocument | null> {
    return ScheduleModel.findById(id).populate('professor');
  }

  async findConflicts({
    diaSemana,
    excludeId,
    horarioFim,
    horarioInicio,
    professorId,
    sala,
    turma
  }: ConflictFilter): Promise<ScheduleDocument[]> {
    const conflictTargets: FilterQuery<ScheduleEntry>[] = [];

    if (professorId) {
      conflictTargets.push({ professor: professorId });
    }

    if (turma) {
      conflictTargets.push({ turma });
    }

    if (sala) {
      conflictTargets.push({ sala: { $regex: `^${sala.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
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
    }).populate('professor');
  }

  async create(data: ScheduleEntryPayload): Promise<ScheduleDocument> {
    const schedule = await ScheduleModel.create(buildPayload(data));

    return schedule.populate('professor');
  }

  async update(id: string, data: ScheduleEntryPayload): Promise<ScheduleDocument | null> {
    return ScheduleModel.findByIdAndUpdate(id, buildPayload(data), { new: true }).populate('professor');
  }

  async delete(id: string): Promise<void> {
    await ScheduleModel.findByIdAndDelete(id);
  }
}
