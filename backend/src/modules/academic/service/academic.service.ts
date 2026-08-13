import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import type { ClassGroupDocument } from '../../catalogs/models/class-group.model';
import type { RoomDocument } from '../../catalogs/models/room.model';
import type { SubjectDocument } from '../../catalogs/models/subject.model';
import { CatalogRepository } from '../../catalogs/repository/catalog.repository';
import { NotificationService } from '../../notifications/service/notification.service';
import { NotificationEntityType, NotificationType } from '../../notifications/types/notification.types';
import { ScheduleRepository } from '../../schedules/repository/schedule.repository';
import { ScheduleEntryKind, Weekday, type ScheduleEntry } from '../../schedules/types/schedule.types';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo, type PublicUser, type Turma } from '../../users/types/user.types';
import type { AcademicTaskDocument } from '../models/academic-task.model';
import type { AttendanceDocument } from '../models/attendance.model';
import type { DiaryEntryDocument } from '../models/diary-entry.model';
import type { LessonContentDocument } from '../models/lesson-content.model';
import type { AcademicObservationDocument } from '../models/observation.model';
import type { TaskSubmissionDocument } from '../models/task-submission.model';
import { AcademicRepository, type AcademicListFilters } from '../repository/academic.repository';
import {
  type AcademicFile,
  type AcademicTaskPayload,
  type AttendancePayload,
  type DiaryEntryPayload,
  type LessonContentPayload,
  type ObservationPayload,
  SubmissionStatus
} from '../types/academic.types';

const managerRoles = new Set<Cargo>([Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR]);
const weekdayOrder = [Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY];

function isUserDocument(user: unknown): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function isSubjectDocument(subject: unknown): subject is SubjectDocument {
  return Boolean(subject && typeof subject === 'object' && !(subject instanceof Types.ObjectId) && 'nome' in subject);
}

function isRoomDocument(room: unknown): room is RoomDocument {
  return Boolean(room && typeof room === 'object' && !(room instanceof Types.ObjectId) && 'nome' in room);
}

function isClassGroupDocument(classGroup: unknown): classGroup is ClassGroupDocument {
  return Boolean(classGroup && typeof classGroup === 'object' && !(classGroup instanceof Types.ObjectId) && 'nome' in classGroup);
}

function getObjectId(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id;
  if (typeof value === 'object' && '_id' in value && value._id instanceof Types.ObjectId) return value._id.toString();

  return undefined;
}

function toPublicClassGroup(classGroup: ClassGroupDocument) {
  return {
    id: classGroup.id,
    ano: classGroup.ano,
    criadoEm: classGroup.criadoEm,
    nome: classGroup.nome,
    observacoes: classGroup.observacoes ?? '',
    turno: classGroup.turno,
    atualizadoEm: classGroup.atualizadoEm
  };
}

function toPublicRoom(room: RoomDocument) {
  return {
    id: room.id,
    bloco: room.bloco ?? '',
    capacidade: room.capacidade,
    criadoEm: room.criadoEm,
    nome: room.nome,
    observacoes: room.observacoes ?? '',
    atualizadoEm: room.atualizadoEm
  };
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

function getClassCode(classGroup: ClassGroupDocument): string {
  const compact = classGroup.nome.replace(/\s/g, '').toUpperCase().match(/^([123])(?:º|O)?ANO?([A-Z])$/i);
  const simple = classGroup.nome.replace(/\s/g, '').toUpperCase().match(/^([123])([A-Z])$/i);
  const byYear = `${String(classGroup.ano).match(/[123]/)?.[0] ?? ''}${classGroup.nome.replace(/\s/g, '').toUpperCase().match(/[A-Z]$/)?.[0] ?? ''}`;

  return (simple?.[0] ?? (compact ? `${compact[1]}${compact[2]}` : byYear)) as Turma;
}

function getTimeDistance(schedule: ScheduleEntry): number {
  const todayIndex = new Date().getDay() - 1;
  const safeTodayIndex = todayIndex >= 0 && todayIndex < weekdayOrder.length ? todayIndex : 0;
  const scheduleIndex = weekdayOrder.indexOf(schedule.diaSemana);
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const [hours, minutes] = schedule.horarioInicio.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const dayOffset = (scheduleIndex - safeTodayIndex + weekdayOrder.length) % weekdayOrder.length;

  return (dayOffset === 0 && startMinutes <= currentMinutes ? weekdayOrder.length : dayOffset) * 24 * 60 + startMinutes;
}

function academicFileFromSaved(file: Express.Multer.File, saved: { mimeType: string; originalName: string; publicUrl: string; size: number }): AcademicFile {
  return {
    nome: saved.originalName || file.originalname,
    tamanho: saved.size,
    tipo: saved.mimeType,
    url: saved.publicUrl
  };
}

export class AcademicService {
  constructor(
    private readonly academicRepository = new AcademicRepository(),
    private readonly catalogRepository = new CatalogRepository(),
    private readonly scheduleRepository = new ScheduleRepository(),
    private readonly userRepository = new UserRepository(),
    private readonly notificationService = new NotificationService()
  ) {}

  async listSubjects(viewer: PublicUser) {
    const schedules = await this.getAccessibleSchedules(viewer);
    const subjects = new Map<string, { schedules: typeof schedules; subject: SubjectDocument }>();

    schedules.forEach((schedule) => {
      if (!isSubjectDocument(schedule.disciplina)) return;
      const current = subjects.get(schedule.disciplina.id);
      subjects.set(schedule.disciplina.id, {
        schedules: current ? [...current.schedules, schedule] : [schedule],
        subject: schedule.disciplina
      });
    });

    return Promise.all(
      Array.from(subjects.values()).map(async ({ schedules: subjectSchedules, subject }) => {
        const classGroups = subjectSchedules.map((schedule) => schedule.turma).filter(isClassGroupDocument);
        const rooms = subjectSchedules.map((schedule) => schedule.sala).filter(isRoomDocument);
        const students = await this.getStudentsForClasses(classGroups);
        const nextLesson = [...subjectSchedules].filter((schedule) => schedule.tipo === ScheduleEntryKind.LESSON).sort((first, second) => getTimeDistance(first) - getTimeDistance(second))[0];

        return {
          alunoQuantidade: students.length,
          disciplina: toPublicSubject(subject),
          proximaAula:
            nextLesson && isClassGroupDocument(nextLesson.turma)
              ? {
                  diaSemana: nextLesson.diaSemana,
                  horarioFim: nextLesson.horarioFim,
                  horarioInicio: nextLesson.horarioInicio,
                  sala: isRoomDocument(nextLesson.sala) ? toPublicRoom(nextLesson.sala) : undefined,
                  turma: toPublicClassGroup(nextLesson.turma)
                }
              : undefined,
          salas: uniqueById(rooms).map(toPublicRoom),
          turmas: uniqueById(classGroups).map(toPublicClassGroup)
        };
      })
    );
  }

  async getSubjectDetails(id: string, viewer: PublicUser) {
    const subject = (await this.listSubjects(viewer)).find((item) => item.disciplina.id === id);

    if (!subject) {
      return null;
    }

    const [conteudos, tarefas, diarios] = await Promise.all([
      this.listContents(viewer, { disciplinaId: id }),
      this.listTasks(viewer, { disciplinaId: id }),
      this.listDiaries(viewer, { disciplinaId: id })
    ]);

    return { ...subject, conteudos, diarios, tarefas };
  }

  async listAttendance(viewer: PublicUser, filters: AcademicListFilters = {}) {
    return (await this.academicRepository.listAttendance(await this.getAccessFilter(viewer, filters))).map((attendance) => this.toPublicAttendance(attendance));
  }

  async saveAttendance(viewer: PublicUser, data: AttendancePayload) {
    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });
    const students = await this.getStudentsForClassId(data.turmaId);
    const allowedStudentIds = new Set(students.map((student) => student.id));

    if (data.registros.some((record) => !allowedStudentIds.has(record.alunoId))) {
      throw new AppError('A chamada contem aluno fora da turma selecionada', 400);
    }

    return this.toPublicAttendance(await this.academicRepository.upsertAttendance(data, professorId));
  }

  async createContent(viewer: PublicUser, data: LessonContentPayload, arquivos: AcademicFile[]) {
    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });
    const content = await this.academicRepository.createContent(data, professorId, arquivos);
    await this.notifyClassStudents(data.turmaId, {
      autorId: viewer.id,
      descricao: `${viewer.nomeCompleto} publicou ${data.titulo}.`,
      entidadeId: content.id,
      entidadeTipo: NotificationEntityType.LESSON_CONTENT,
      tipo: NotificationType.ACADEMIC_CONTENT,
      titulo: 'Novo conteudo de aula',
      url: `/disciplinas?disciplina=${data.disciplinaId}`
    });

    return this.toPublicContent(content);
  }

  async listContents(viewer: PublicUser, filters: AcademicListFilters = {}) {
    return (await this.academicRepository.listContents(await this.getAccessFilter(viewer, filters))).map((content) => this.toPublicContent(content));
  }

  async createTask(viewer: PublicUser, data: AcademicTaskPayload, arquivo?: AcademicFile) {
    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });
    const task = await this.academicRepository.createTask(data, professorId, arquivo);
    await this.notifyClassStudents(data.turmaId, {
      autorId: viewer.id,
      descricao: `${viewer.nomeCompleto} criou ${data.titulo}.`,
      entidadeId: task.id,
      entidadeTipo: NotificationEntityType.TASK,
      tipo: NotificationType.ACADEMIC_TASK,
      titulo: 'Nova tarefa publicada',
      url: '/tarefas'
    });

    return (await this.attachTaskSubmissionData([task], viewer))[0];
  }

  async updateTask(viewer: PublicUser, id: string, data: AcademicTaskPayload, arquivo?: AcademicFile) {
    const currentTask = await this.academicRepository.findTaskById(id);

    if (!currentTask) return null;

    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });
    const task = await this.academicRepository.updateTask(id, data, professorId, arquivo);

    if (!task) return null;

    await this.notifyClassStudents(data.turmaId, {
      autorId: viewer.id,
      descricao: `${viewer.nomeCompleto} alterou ${data.titulo}.`,
      entidadeId: task.id,
      entidadeTipo: NotificationEntityType.TASK,
      tipo: NotificationType.ACADEMIC_TASK_UPDATED,
      titulo: 'Tarefa atualizada',
      url: '/tarefas'
    });

    return (await this.attachTaskSubmissionData([task], viewer))[0];
  }

  async listTasks(viewer: PublicUser, filters: AcademicListFilters & { status?: string } = {}) {
    const tasks = await this.academicRepository.listTasks(await this.getAccessFilter(viewer, filters));
    const publicTasks = await this.attachTaskSubmissionData(tasks, viewer);

    if (viewer.cargo !== Cargo.ALUNO && viewer.cargo !== Cargo.GREMIO) {
      return publicTasks;
    }

    if (filters.status === 'ENTREGUE') return publicTasks.filter((task) => task.entrega);
    if (filters.status === 'ATRASADA') return publicTasks.filter((task) => !task.entrega && new Date(task.dataEntrega) < new Date());
    if (filters.status === 'PENDENTE') return publicTasks.filter((task) => !task.entrega && new Date(task.dataEntrega) >= new Date());

    return publicTasks;
  }

  async submitTask(viewer: PublicUser, taskId: string, arquivo: AcademicFile) {
    if (viewer.cargo !== Cargo.ALUNO && viewer.cargo !== Cargo.GREMIO) {
      throw new AppError('Somente alunos podem entregar atividades', 403);
    }

    const task = await this.academicRepository.findTaskById(taskId);

    if (!task || !(await this.canViewTask(viewer, task))) {
      throw new AppError('Tarefa nao encontrada', 404);
    }

    const submission = await this.academicRepository.createOrReplaceSubmission(taskId, viewer.id, arquivo);
    const teacherId = getObjectId(task.professor);

    if (teacherId) {
      await this.notificationService.notifyUsers([teacherId], {
        autorId: viewer.id,
        descricao: `${viewer.nomeCompleto} entregou uma atividade.`,
        entidadeId: submission.id,
        entidadeTipo: NotificationEntityType.SUBMISSION,
        tipo: NotificationType.ACADEMIC_SUBMISSION,
        titulo: 'Atividade entregue',
        url: `/diario?disciplina=${getObjectId(task.disciplina) ?? ''}`
      });
    }

    return this.toPublicSubmission(submission);
  }

  async listSubmissions(viewer: PublicUser, taskId: string) {
    const task = await this.academicRepository.findTaskById(taskId);

    if (!task || !(await this.canManageTask(viewer, task))) {
      throw new AppError('Tarefa nao encontrada', 404);
    }

    return (await this.academicRepository.listSubmissions(taskId)).map((submission) => this.toPublicSubmission(submission));
  }

  async reviewSubmission(viewer: PublicUser, id: string, data: { observacaoProfessor?: string; status: SubmissionStatus }) {
    const currentSubmission = await this.academicRepository.findSubmissionById(id);
    const task = currentSubmission && isTaskDocument(currentSubmission.tarefa) ? currentSubmission.tarefa : undefined;

    if (!task || !(await this.canManageTask(viewer, task))) {
      throw new AppError('Entrega nao encontrada', 404);
    }

    const submission = await this.academicRepository.reviewSubmission(id, data);

    return submission ? this.toPublicSubmission(submission) : null;
  }

  async createDiary(viewer: PublicUser, data: DiaryEntryPayload) {
    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });

    return this.toPublicDiary(await this.academicRepository.createDiary(data, professorId));
  }

  async listDiaries(viewer: PublicUser, filters: AcademicListFilters = {}) {
    return (await this.academicRepository.listDiaries(await this.getAccessFilter(viewer, filters))).map((diary) => this.toPublicDiary(diary));
  }

  async createObservation(viewer: PublicUser, data: ObservationPayload) {
    const professorId = await this.resolveProfessorId(viewer, data);
    await this.ensureCanManageContext(viewer, { ...data, professorId });

    return this.toPublicObservation(await this.academicRepository.createObservation(data, professorId));
  }

  async getProfileSummary(viewer: PublicUser) {
    const [subjects, tasks, contents] = await Promise.all([this.listSubjects(viewer), this.listTasks(viewer), this.listContents(viewer)]);
    const nextLesson = subjects.flatMap((subject) => (subject.proximaAula ? [{ disciplina: subject.disciplina.nome, ...subject.proximaAula }] : []))[0];

    return {
      disciplinas: subjects.map((subject) => subject.disciplina.nome),
      proximAula: nextLesson,
      proximaAula: nextLesson,
      quantidadeTurmas: new Set(subjects.flatMap((subject) => subject.turmas.map((turma) => turma.id))).size,
      ultimasAtividades: tasks.slice(0, 5),
      ultimosConteudos: contents.slice(0, 5)
    };
  }

  private async getAccessibleSchedules(viewer: PublicUser) {
    if (managerRoles.has(viewer.cargo)) return this.scheduleRepository.list({});
    if (viewer.cargo === Cargo.PROFESSOR) return this.scheduleRepository.listForProfessor(viewer.id, {});
    if (!viewer.turma) return [];

    const classGroup = await this.catalogRepository.findClassForStudent(viewer.turma);

    return classGroup ? this.scheduleRepository.listForStudent(classGroup.id, {}) : [];
  }

  private async getAccessFilter(viewer: PublicUser, filters: AcademicListFilters = {}): Promise<AcademicListFilters> {
    if (managerRoles.has(viewer.cargo)) return filters;

    const schedules = await this.getAccessibleSchedules(viewer);

    return {
      ...filters,
      disciplinaIds: filters.disciplinaId ? undefined : uniqueStrings(schedules.map((schedule) => getObjectId(schedule.disciplina)).filter(Boolean)),
      professorId: viewer.cargo === Cargo.PROFESSOR ? viewer.id : filters.professorId,
      turmaIds: filters.turmaId ? undefined : uniqueStrings(schedules.map((schedule) => getObjectId(schedule.turma)).filter(Boolean))
    };
  }

  private async resolveProfessorId(viewer: PublicUser, data: { professorId?: string }): Promise<string> {
    if (viewer.cargo === Cargo.PROFESSOR) return viewer.id;
    if (managerRoles.has(viewer.cargo) && data.professorId) return data.professorId;

    throw new AppError('Acesso nao autorizado para diario escolar', 403);
  }

  private async ensureCanManageContext(viewer: PublicUser, data: { disciplinaId: string; professorId: string; turmaId: string }): Promise<void> {
    if (!managerRoles.has(viewer.cargo) && viewer.cargo !== Cargo.PROFESSOR) {
      throw new AppError('Acesso nao autorizado para diario escolar', 403);
    }

    const schedules = await this.scheduleRepository.list({
      disciplinaId: data.disciplinaId,
      professorId: data.professorId,
      turmaId: data.turmaId
    });

    if (!schedules.some((schedule) => schedule.tipo === ScheduleEntryKind.LESSON)) {
      throw new AppError('Aula nao encontrada para esta disciplina, professor e turma', 400);
    }

    if (viewer.cargo === Cargo.PROFESSOR && data.professorId !== viewer.id) {
      throw new AppError('Professor sem acesso a esta disciplina', 403);
    }
  }

  private async canManageTask(viewer: PublicUser, task: AcademicTaskDocument): Promise<boolean> {
    if (managerRoles.has(viewer.cargo)) return true;

    return viewer.cargo === Cargo.PROFESSOR && getObjectId(task.professor) === viewer.id;
  }

  private async canViewTask(viewer: PublicUser, task: AcademicTaskDocument): Promise<boolean> {
    if (await this.canManageTask(viewer, task)) return true;
    if (!viewer.turma) return false;

    const classGroup = isClassGroupDocument(task.turma) ? task.turma : await this.catalogRepository.findClassById(getObjectId(task.turma) ?? '');

    return classGroup ? getClassCode(classGroup) === viewer.turma : false;
  }

  private async getStudentsForClassId(classId: string): Promise<UserDocument[]> {
    const classGroup = await this.catalogRepository.findClassById(classId);

    return classGroup ? this.getStudentsForClasses([classGroup]) : [];
  }

  private async getStudentsForClasses(classGroups: ClassGroupDocument[]): Promise<UserDocument[]> {
    const classCodes = uniqueStrings(classGroups.map(getClassCode).filter(Boolean));

    return classCodes.length ? this.userRepository.listStudentsByClassCodes(classCodes) : [];
  }

  private async notifyClassStudents(turmaId: string, data: Parameters<NotificationService['notifyUsers']>[1]): Promise<void> {
    const students = await this.getStudentsForClassId(turmaId);

    await this.notificationService.notifyUsers(students.map((student) => student.id), data);
  }

  private async attachTaskSubmissionData(tasks: AcademicTaskDocument[], viewer: PublicUser) {
    const [counts, studentSubmissions] = await Promise.all([
      this.academicRepository.countSubmissionsByTask(tasks.map((task) => task.id)),
      viewer.cargo === Cargo.ALUNO || viewer.cargo === Cargo.GREMIO ? this.academicRepository.listSubmissionsForStudent(viewer.id) : Promise.resolve([])
    ]);
    const countMap = new Map(counts.map((count) => [count._id.toString(), count.total]));
    const submissionMap = new Map(studentSubmissions.map((submission) => [getObjectId(submission.tarefa), submission]));

    return tasks.map((task) => ({
      ...this.toPublicTask(task),
      entrega: submissionMap.get(task.id) ? this.toPublicSubmission(submissionMap.get(task.id) as TaskSubmissionDocument) : undefined,
      entregasQuantidade: countMap.get(task.id) ?? 0
    }));
  }

  private toPublicAttendance(attendance: AttendanceDocument) {
    assertAcademicDocuments(attendance);

    return {
      id: attendance.id,
      criadoEm: attendance.criadoEm,
      data: attendance.data,
      disciplina: toPublicSubject(attendance.disciplina),
      professor: toPublicUser(attendance.professor),
      registros: attendance.registros.filter((record) => isUserDocument(record.aluno)).map((record) => ({
        aluno: toPublicUser(record.aluno as UserDocument),
        observacao: record.observacao ?? '',
        status: record.status
      })),
      turma: toPublicClassGroup(attendance.turma),
      atualizadoEm: attendance.atualizadoEm
    };
  }

  private toPublicContent(content: LessonContentDocument) {
    assertAcademicDocuments(content);

    return {
      id: content.id,
      arquivos: content.arquivos,
      criadoEm: content.criadoEm,
      data: content.data,
      descricao: content.descricao,
      disciplina: toPublicSubject(content.disciplina),
      professor: toPublicUser(content.professor),
      titulo: content.titulo,
      turma: toPublicClassGroup(content.turma),
      atualizadoEm: content.atualizadoEm
    };
  }

  private toPublicTask(task: AcademicTaskDocument) {
    assertAcademicDocuments(task);

    return {
      id: task.id,
      arquivo: task.arquivo,
      criadoEm: task.criadoEm,
      dataEntrega: task.dataEntrega,
      descricao: task.descricao,
      disciplina: toPublicSubject(task.disciplina),
      entregasQuantidade: 0,
      professor: toPublicUser(task.professor),
      tipo: task.tipo,
      titulo: task.titulo,
      turma: toPublicClassGroup(task.turma),
      atualizadoEm: task.atualizadoEm
    };
  }

  private toPublicSubmission(submission: TaskSubmissionDocument) {
    if (!isUserDocument(submission.aluno)) {
      throw new AppError('Aluno da entrega nao carregado', 500);
    }

    return {
      id: submission.id,
      aluno: toPublicUser(submission.aluno),
      arquivo: submission.arquivo,
      criadoEm: submission.criadoEm,
      entregueEm: submission.entregueEm,
      observacaoProfessor: submission.observacaoProfessor ?? '',
      status: submission.status,
      tarefa: getObjectId(submission.tarefa) ?? '',
      atualizadoEm: submission.atualizadoEm
    };
  }

  private toPublicDiary(diary: DiaryEntryDocument) {
    assertAcademicDocuments(diary);

    return {
      id: diary.id,
      criadoEm: diary.criadoEm,
      data: diary.data,
      disciplina: toPublicSubject(diary.disciplina),
      observacoes: diary.observacoes ?? '',
      professor: toPublicUser(diary.professor),
      turma: toPublicClassGroup(diary.turma),
      atualizadoEm: diary.atualizadoEm
    };
  }

  private toPublicObservation(observation: AcademicObservationDocument) {
    assertAcademicDocuments(observation);

    return {
      id: observation.id,
      aluno: isUserDocument(observation.aluno) ? toPublicUser(observation.aluno) : undefined,
      criadoEm: observation.criadoEm,
      data: observation.data,
      descricao: observation.descricao,
      diario: observation.diario,
      disciplina: toPublicSubject(observation.disciplina),
      professor: toPublicUser(observation.professor),
      turma: toPublicClassGroup(observation.turma),
      atualizadoEm: observation.atualizadoEm
    };
  }
}

export function toAcademicFile(file: Express.Multer.File, saved: { mimeType: string; originalName: string; publicUrl: string; size: number }): AcademicFile {
  return academicFileFromSaved(file, saved);
}

function assertAcademicDocuments<T extends { disciplina: unknown; professor: unknown; turma: unknown }>(
  value: T
): asserts value is T & { disciplina: SubjectDocument; professor: UserDocument; turma: ClassGroupDocument } {
  if (!isSubjectDocument(value.disciplina) || !isUserDocument(value.professor) || !isClassGroupDocument(value.turma)) {
    throw new AppError('Dados academicos nao carregados', 500);
  }
}

function isTaskDocument(value: unknown): value is AcademicTaskDocument {
  return Boolean(value && typeof value === 'object' && !(value instanceof Types.ObjectId) && 'titulo' in value);
}

function uniqueById<T extends { id?: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id ?? getObjectId(item), item])).values());
}

function uniqueStrings(items: Array<string | undefined>): string[] {
  return Array.from(new Set(items.filter(Boolean) as string[]));
}
