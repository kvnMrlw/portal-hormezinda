import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { UserRepository } from '../../users/repository/user.repository';
import { Cargo, type PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';
import { toPublicUser } from '../../users/service/user.service';
import { ScheduleRepository } from '../repository/schedule.repository';
import { ScheduleEntryKind, type PublicScheduleEntry, type ScheduleEntry, type ScheduleEntryPayload, type ScheduleFilters } from '../types/schedule.types';
import { Weekday } from '../types/schedule.types';
import type { ScheduleDocument } from '../models/schedule.model';

function isUserDocument(professor: ScheduleEntry['professor']): professor is UserDocument {
  return Boolean(professor && typeof professor === 'object' && !(professor instanceof Types.ObjectId) && 'nomeCompleto' in professor);
}

function toPublicScheduleEntry(schedule: ScheduleDocument): PublicScheduleEntry {
  const professor = isUserDocument(schedule.professor) ? toPublicUser(schedule.professor) : undefined;

  return {
    id: schedule.id,
    cor: schedule.cor,
    criadoEm: schedule.criadoEm,
    diaSemana: schedule.diaSemana,
    disciplina: schedule.disciplina,
    horarioFim: schedule.horarioFim,
    horarioInicio: schedule.horarioInicio,
    observacao: schedule.observacao ?? '',
    professor,
    sala: schedule.sala,
    tipo: schedule.tipo,
    turma: schedule.turma,
    atualizadoEm: schedule.atualizadoEm
  };
}

function getConflictMessage(conflicts: ScheduleDocument[], data: ScheduleEntryPayload): string {
  const professorConflict = conflicts.find((schedule) => {
    const professorId = isUserDocument(schedule.professor) ? schedule.professor.id : schedule.professor?.toString();

    return professorId === data.professorId;
  });
  const turmaConflict = conflicts.find((schedule) => schedule.turma === data.turma);
  const roomConflict = conflicts.find((schedule) => schedule.sala?.toLocaleLowerCase('pt-BR') === data.sala?.toLocaleLowerCase('pt-BR'));

  if (professorConflict) {
    return 'Este professor ja possui aula neste horario.';
  }

  if (turmaConflict) {
    return 'Esta turma ja possui aula neste horario.';
  }

  if (roomConflict) {
    return 'Esta sala ja esta ocupada neste horario.';
  }

  return 'Ja existe um conflito neste horario.';
}

function getNextWeekday(weekday: Weekday): Weekday {
  const weekdays = [Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY];
  const index = weekdays.indexOf(weekday);

  return weekdays[(index + 1) % weekdays.length];
}

export class ScheduleService {
  constructor(
    private readonly scheduleRepository = new ScheduleRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async list(viewer: PublicUser, filters: ScheduleFilters): Promise<PublicScheduleEntry[]> {
    if (viewer.cargo === Cargo.ADMIN || viewer.cargo === Cargo.DIRETOR || viewer.cargo === Cargo.COORDENADOR) {
      const schedules = await this.scheduleRepository.list(filters);

      return schedules.map(toPublicScheduleEntry);
    }

    if (viewer.cargo === Cargo.PROFESSOR) {
      const schedules = await this.scheduleRepository.listForProfessor(viewer.id, filters);

      return schedules.map(toPublicScheduleEntry);
    }

    if (!viewer.turma) {
      return [];
    }

    const schedules = await this.scheduleRepository.listForStudent(viewer.turma, filters);

    return schedules.map(toPublicScheduleEntry);
  }

  async create(data: ScheduleEntryPayload): Promise<PublicScheduleEntry> {
    await this.validatePayload(data);
    const schedule = await this.scheduleRepository.create(data);

    return toPublicScheduleEntry(schedule);
  }

  async update(id: string, data: ScheduleEntryPayload): Promise<PublicScheduleEntry | null> {
    const currentSchedule = await this.scheduleRepository.findById(id);

    if (!currentSchedule) {
      return null;
    }

    await this.validatePayload(data, id);
    const schedule = await this.scheduleRepository.update(id, data);

    return schedule ? toPublicScheduleEntry(schedule) : null;
  }

  async duplicate(id: string): Promise<PublicScheduleEntry | null> {
    const currentSchedule = await this.scheduleRepository.findById(id);

    if (!currentSchedule) {
      return null;
    }

    const payload: ScheduleEntryPayload = {
      cor: currentSchedule.cor,
      diaSemana: getNextWeekday(currentSchedule.diaSemana),
      disciplina: `${currentSchedule.disciplina} (copia)`,
      horarioFim: currentSchedule.horarioFim,
      horarioInicio: currentSchedule.horarioInicio,
      observacao: currentSchedule.observacao,
      professorId: isUserDocument(currentSchedule.professor) ? currentSchedule.professor.id : currentSchedule.professor?.toString(),
      sala: currentSchedule.sala,
      tipo: currentSchedule.tipo,
      turma: currentSchedule.turma
    };

    await this.validatePayload(payload);

    const schedule = await this.scheduleRepository.create(payload);

    return toPublicScheduleEntry(schedule);
  }

  async delete(id: string): Promise<boolean> {
    const currentSchedule = await this.scheduleRepository.findById(id);

    if (!currentSchedule) {
      return false;
    }

    await this.scheduleRepository.delete(id);

    return true;
  }

  private async validatePayload(data: ScheduleEntryPayload, excludeId?: string): Promise<void> {
    if (data.tipo === ScheduleEntryKind.INTERVAL) {
      return;
    }

    if (!data.professorId || !data.turma || !data.sala) {
      throw new AppError('Preencha todos os dados da aula', 400);
    }

    const professor = await this.userRepository.findById(data.professorId);

    if (!professor || !professor.ativo || professor.cargo !== Cargo.PROFESSOR) {
      throw new AppError('Professor invalido para este horario', 400);
    }

    const conflicts = await this.scheduleRepository.findConflicts({
      diaSemana: data.diaSemana,
      excludeId,
      horarioFim: data.horarioFim,
      horarioInicio: data.horarioInicio,
      professorId: data.professorId,
      sala: data.sala,
      turma: data.turma
    });

    if (conflicts.length) {
      throw new AppError(getConflictMessage(conflicts, data), 409);
    }
  }
}
