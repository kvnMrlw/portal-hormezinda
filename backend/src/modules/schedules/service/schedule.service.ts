import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import type { ClassGroupDocument } from '../../catalogs/models/class-group.model';
import type { RoomDocument } from '../../catalogs/models/room.model';
import type { SubjectDocument } from '../../catalogs/models/subject.model';
import { CatalogRepository } from '../../catalogs/repository/catalog.repository';
import type { Subject } from '../../catalogs/types/catalog.types';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo, type PublicUser } from '../../users/types/user.types';
import type { ScheduleDocument } from '../models/schedule.model';
import { ScheduleRepository } from '../repository/schedule.repository';
import {
  ScheduleEntryKind,
  Weekday,
  type CopyWeekPayload,
  type PublicScheduleEntry,
  type ReorderSchedulePayload,
  type ScheduleEntry,
  type ScheduleEntryPayload,
  type ScheduleFilters
} from '../types/schedule.types';

function isUserDocument(user: ScheduleEntry['professor'] | Subject['professores'][number] | Subject['professorPadrao']): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function isSubjectDocument(subject: ScheduleEntry['disciplina']): subject is SubjectDocument {
  return Boolean(subject && typeof subject === 'object' && !(subject instanceof Types.ObjectId) && 'nome' in subject);
}

function isRoomDocument(room: ScheduleEntry['sala']): room is RoomDocument {
  return Boolean(room && typeof room === 'object' && !(room instanceof Types.ObjectId) && 'nome' in room);
}

function isClassGroupDocument(classGroup: ScheduleEntry['turma']): classGroup is ClassGroupDocument {
  return Boolean(classGroup && typeof classGroup === 'object' && !(classGroup instanceof Types.ObjectId) && 'nome' in classGroup);
}

function getObjectId(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
    return value.id;
  }

  return undefined;
}

function toPublicSubject(subject: SubjectDocument) {
  const teachers = (subject.professores?.length ? subject.professores : subject.professorPadrao ? [subject.professorPadrao] : [])
    .filter(isUserDocument)
    .map(toPublicUser);

  return {
    id: subject.id,
    cor: subject.cor,
    criadoEm: subject.criadoEm,
    icone: subject.icone,
    nome: subject.nome,
    professores: teachers,
    professorPadrao: teachers[0],
    atualizadoEm: subject.atualizadoEm
  };
}

function toPublicScheduleEntry(schedule: ScheduleDocument): PublicScheduleEntry {
  const disciplina = isSubjectDocument(schedule.disciplina) ? toPublicSubject(schedule.disciplina) : undefined;

  const professor = isUserDocument(schedule.professor) ? toPublicUser(schedule.professor) : undefined;
  const sala = isRoomDocument(schedule.sala)
    ? {
        id: schedule.sala.id,
        bloco: schedule.sala.bloco ?? '',
        capacidade: schedule.sala.capacidade,
        criadoEm: schedule.sala.criadoEm,
        nome: schedule.sala.nome,
        observacoes: schedule.sala.observacoes ?? '',
        atualizadoEm: schedule.sala.atualizadoEm
      }
    : undefined;
  if (!isClassGroupDocument(schedule.turma)) {
    throw new AppError('Turma do horario nao carregada', 500);
  }

  const turma = {
    id: schedule.turma.id,
    ano: schedule.turma.ano,
    criadoEm: schedule.turma.criadoEm,
    nome: schedule.turma.nome,
    observacoes: schedule.turma.observacoes ?? '',
    turno: schedule.turma.turno,
    atualizadoEm: schedule.turma.atualizadoEm
  };

  return {
    id: schedule.id,
    criadoEm: schedule.criadoEm,
    diaSemana: schedule.diaSemana,
    disciplina,
    horarioFim: schedule.horarioFim,
    horarioInicio: schedule.horarioInicio,
    observacao: schedule.observacao ?? '',
    ordem: schedule.ordem ?? 0,
    professor,
    sala,
    tipo: schedule.tipo,
    turma,
    atualizadoEm: schedule.atualizadoEm
  };
}

function getConflictMessage(conflicts: ScheduleDocument[], data: ScheduleEntryPayload): string {
  const professorConflict = conflicts.find((schedule) => getObjectId(schedule.professor) === data.professorId);
  const turmaConflict = conflicts.find((schedule) => getObjectId(schedule.turma) === data.turmaId);
  const roomConflict = conflicts.find((schedule) => getObjectId(schedule.sala) === data.salaId);

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
    private readonly userRepository = new UserRepository(),
    private readonly catalogRepository = new CatalogRepository()
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

    const classGroup = await this.catalogRepository.findClassForStudent(viewer.turma);

    if (!classGroup) {
      return [];
    }

    const schedules = await this.scheduleRepository.listForStudent(classGroup.id, filters);

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
      diaSemana: getNextWeekday(currentSchedule.diaSemana),
      disciplinaId: getObjectId(currentSchedule.disciplina) ?? '',
      horarioFim: currentSchedule.horarioFim,
      horarioInicio: currentSchedule.horarioInicio,
      observacao: currentSchedule.observacao,
      ordem: currentSchedule.ordem,
      professorId: getObjectId(currentSchedule.professor),
      salaId: getObjectId(currentSchedule.sala),
      tipo: currentSchedule.tipo,
      turmaId: getObjectId(currentSchedule.turma) ?? ''
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

  async copyWeek(data: CopyWeekPayload): Promise<PublicScheduleEntry[]> {
    if (data.origemTurmaId === data.destinoTurmaId) {
      throw new AppError('Selecione turmas diferentes para copiar os horarios', 400);
    }

    const [originClass, targetClass] = await Promise.all([
      this.catalogRepository.findClassById(data.origemTurmaId),
      this.catalogRepository.findClassById(data.destinoTurmaId)
    ]);

    if (!originClass || !targetClass) {
      throw new AppError('Turma invalida para copia de horarios', 400);
    }

    if (data.sobrescrever) {
      await this.scheduleRepository.deleteByClass(data.destinoTurmaId);
    }

    const copiedSchedules = await this.scheduleRepository.copyWeek(data.origemTurmaId, data.destinoTurmaId);

    return copiedSchedules.map(toPublicScheduleEntry);
  }

  async reorder(data: ReorderSchedulePayload): Promise<PublicScheduleEntry[]> {
    const classGroup = await this.catalogRepository.findClassById(data.turmaId);

    if (!classGroup) {
      throw new AppError('Turma invalida para reordenar horarios', 400);
    }

    const schedules = await this.scheduleRepository.reorder(data.turmaId, data.diaSemana, data.ids);

    return schedules.map(toPublicScheduleEntry);
  }

  private async validatePayload(data: ScheduleEntryPayload, excludeId?: string): Promise<void> {
    const classGroup = await this.catalogRepository.findClassById(data.turmaId);

    if (!classGroup) {
      throw new AppError('Turma invalida para este horario', 400);
    }

    if (data.tipo === ScheduleEntryKind.INTERVAL) {
      const conflicts = await this.scheduleRepository.findConflicts({
        diaSemana: data.diaSemana,
        excludeId,
        horarioFim: data.horarioFim,
        horarioInicio: data.horarioInicio,
        turmaId: data.turmaId
      });

      if (conflicts.length) {
        throw new AppError(getConflictMessage(conflicts, data), 409);
      }

      return;
    }

    if (!data.disciplinaId || !data.professorId || !data.salaId) {
      throw new AppError('Preencha todos os dados da aula', 400);
    }

    const subject = await this.catalogRepository.findSubjectById(data.disciplinaId);

    if (!subject) {
      throw new AppError('Disciplina invalida para este horario', 400);
    }

    const [professor, room] = await Promise.all([
      this.userRepository.findById(data.professorId),
      this.catalogRepository.findRoomById(data.salaId)
    ]);

    if (!professor || !professor.ativo || professor.cargo !== Cargo.PROFESSOR) {
      throw new AppError('Professor invalido para este horario', 400);
    }

    const subjectTeacherIds = (subject.professores?.length ? subject.professores : subject.professorPadrao ? [subject.professorPadrao] : [])
      .map((teacher) => getObjectId(teacher))
      .filter(Boolean);

    if (!subjectTeacherIds.includes(data.professorId)) {
      throw new AppError('Este professor nao leciona a disciplina selecionada', 400);
    }

    if (!room) {
      throw new AppError('Sala invalida para este horario', 400);
    }

    const conflicts = await this.scheduleRepository.findConflicts({
      diaSemana: data.diaSemana,
      excludeId,
      horarioFim: data.horarioFim,
      horarioInicio: data.horarioInicio,
      professorId: data.professorId,
      salaId: data.salaId,
      turmaId: data.turmaId
    });

    if (conflicts.length) {
      throw new AppError(getConflictMessage(conflicts, data), 409);
    }
  }
}
