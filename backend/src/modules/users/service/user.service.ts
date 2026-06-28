import bcrypt from 'bcrypt';

import { AppError } from '../../../middlewares/error.middleware';
import { removeUploadedFiles } from '../../../utils/imageUpload';
import { UserRepository } from '../repository/user.repository';
import { Cargo, type AdminCreateUserData, type AdminUpdateUserData, type PublicUser, type UpdateProfileData } from '../types/user.types';
import type { UserDocument } from '../models/user.model';
import { canViewRole } from '../../auth/permissions/roles';
import { FeedService } from '../../feed/service/feed.service';
import { IdeaService } from '../../ideas/service/idea.service';
import { NotificationService } from '../../notifications/service/notification.service';
import type { FeedPagination } from '../../feed/types/feed.types';
import { NoticeRepository } from '../../notices/repository/notice.repository';
import { CatalogRepository } from '../../catalogs/repository/catalog.repository';
import { ScheduleRepository } from '../../schedules/repository/schedule.repository';
import { ScheduleEntryKind, Weekday } from '../../schedules/types/schedule.types';

const PASSWORD_SALT_ROUNDS = 10;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

type UpdateProfileInput = Omit<UpdateProfileData, 'senha'> & {
  senhaAtual?: string;
  novaSenha?: string;
  confirmarSenha?: string;
};

function passwordMatches(inputPassword: string, storedPassword: string): Promise<boolean> | boolean {
  return BCRYPT_HASH_REGEX.test(storedPassword) ? bcrypt.compare(inputPassword, storedPassword) : inputPassword === storedPassword;
}

export function toPublicUser(user: UserDocument): PublicUser {
  const isAdmin = user.cargo === Cargo.ADMIN;

  return {
    id: user.id,
    nomeCompleto: user.nomeCompleto,
    usuario: user.usuario,
    dataNascimento: isAdmin ? undefined : user.dataNascimento,
    turno: isAdmin ? undefined : user.turno,
    turma: isAdmin ? undefined : user.turma,
    cargo: user.cargo,
    pertenceGremio: Boolean(user.pertenceGremio || user.cargo === Cargo.GREMIO),
    sexo: user.sexo,
    materia: user.materia,
    fotoPerfil: user.fotoPerfil,
    bannerPerfil: user.bannerPerfil,
    bio: user.bio,
    redeSocial: user.redeSocial,
    ativo: user.ativo,
    criadoEm: user.criadoEm,
    atualizadoEm: user.atualizadoEm
  };
}

export class UserService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly feedService = new FeedService(),
    private readonly ideaService = new IdeaService(),
    private readonly notificationService = new NotificationService(),
    private readonly noticeRepository = new NoticeRepository(),
    private readonly catalogRepository = new CatalogRepository(),
    private readonly scheduleRepository = new ScheduleRepository()
  ) {}

  async adminListUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.listAll();

    return users.map(toPublicUser);
  }

  async adminCreateUser(data: AdminCreateUserData): Promise<PublicUser> {
    const usuario = data.usuario.trim().toLowerCase();
    const existingUser = await this.userRepository.findByUsuario(usuario);

    if (existingUser) {
      throw new AppError('Usuario ja cadastrado', 409);
    }

    const user = await this.userRepository.create({
      ...data,
      usuario,
      senha: await bcrypt.hash(data.senha, PASSWORD_SALT_ROUNDS),
      materia: data.cargo === Cargo.PROFESSOR ? data.materia ?? '' : '',
      turma: data.cargo === Cargo.ALUNO || data.cargo === Cargo.GREMIO ? data.turma : undefined,
      turno: data.cargo === Cargo.ALUNO || data.cargo === Cargo.GREMIO ? data.turno : undefined
    });

    return toPublicUser(user);
  }

  async adminUpdateUser(id: string, data: AdminUpdateUserData): Promise<PublicUser | null> {
    const currentUser = await this.userRepository.findById(id);

    if (!currentUser) {
      return null;
    }

    const nextData: AdminUpdateUserData = { ...data };

    if (nextData.usuario) {
      nextData.usuario = nextData.usuario.trim().toLowerCase();
      const existingUser = await this.userRepository.findByUsuario(nextData.usuario);

      if (existingUser && existingUser.id !== id) {
        throw new AppError('Usuario ja cadastrado', 409);
      }
    }

    if (nextData.senha) {
      nextData.senha = await bcrypt.hash(nextData.senha, PASSWORD_SALT_ROUNDS);
    }

    const nextRole = nextData.cargo ?? currentUser.cargo;

    if (nextRole !== Cargo.PROFESSOR) {
      nextData.materia = '';
    }

    if (nextRole !== Cargo.ALUNO && nextRole !== Cargo.GREMIO) {
      nextData.turma = undefined;
      nextData.turno = undefined;
      nextData.pertenceGremio = false;
    }

    const user = await this.userRepository.adminUpdate(id, nextData);

    if (user) {
      await removeUploadedFiles([
        nextData.fotoPerfil ? currentUser.fotoPerfil : undefined,
        nextData.bannerPerfil ? currentUser.bannerPerfil : undefined
      ]);
    }

    return user ? toPublicUser(user) : null;
  }

  async adminDeleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return false;
    }

    const notices = await this.noticeRepository.deleteByAuthor(id);
    await Promise.all([
      this.feedService.deletePostsByAuthor(id),
      this.feedService.deleteStoriesByAuthor(id),
      this.feedService.removeUserActivity(id),
      this.ideaService.deleteByAuthor(id),
      this.notificationService.deleteByUser(id),
      this.userRepository.delete(id)
    ]);
    await removeUploadedFiles([
      user.fotoPerfil,
      user.bannerPerfil,
      ...notices.flatMap((notice) => (notice.anexos ?? []).map((attachment) => attachment.url))
    ]);

    return true;
  }

  async promoteStudentToGremio(id: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return null;
    }

    if (user.cargo !== Cargo.ALUNO) {
      throw new AppError('Somente alunos podem ser promovidos para o Gremio', 400);
    }

    const updatedUser = await this.userRepository.adminUpdate(id, { pertenceGremio: true });

    return updatedUser ? toPublicUser(updatedUser) : null;
  }

  async findPublicById(id: string, viewer: PublicUser): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user || !canViewRole(viewer.cargo, user.cargo)) {
      return null;
    }

    return toPublicUser(user);
  }

  async listActiveUsers(viewer: PublicUser): Promise<PublicUser[]> {
    const users = await this.userRepository.listActive({ includeAdmins: viewer.cargo === Cargo.ADMIN });

    return users.map(toPublicUser);
  }

  async listPeople(
    viewer: PublicUser,
    options: { limit: number; page: number; search?: string }
  ): Promise<{ paginacao: FeedPagination; usuarios: PublicUser[] }> {
    const includeAdmins = viewer.cargo === Cargo.ADMIN;
    const [users, total] = await Promise.all([
      this.userRepository.listPeople({ ...options, includeAdmins }),
      this.userRepository.countPeople({ includeAdmins, search: options.search })
    ]);

    return {
      usuarios: users.map(toPublicUser),
      paginacao: {
        ...options,
        total,
        hasMore: options.page * options.limit < total
      }
    };
  }

  async getPublicProfile(id: string, viewer: PublicUser, options: { postsLimit: number; postsPage: number }) {
    const user = await this.userRepository.findById(id);

    if (!user || !user.ativo || !canViewRole(viewer.cargo, user.cargo)) {
      return null;
    }

    const [feed, stories, estatisticas, professorResumo] = await Promise.all([
      this.feedService.listUserPosts(user.id, viewer.id, { limit: options.postsLimit, page: options.postsPage }),
      this.feedService.listUserStories(user.id, viewer.id),
      this.feedService.getUserStats(user.id),
      user.cargo === Cargo.PROFESSOR ? this.getTeacherProfileSummary(user.id) : Promise.resolve(undefined)
    ]);

    return {
      usuario: toPublicUser(user),
      publicacoes: feed.publicacoes,
      stories,
      estatisticas,
      professorResumo,
      paginacaoPublicacoes: feed.paginacao
    };
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<PublicUser | null> {
    const { confirmarSenha, novaSenha, senhaAtual, ...profileData } = data;
    const nextData: UpdateProfileData = { ...profileData };
    const wantsPasswordChange = Boolean(senhaAtual || novaSenha || confirmarSenha);

    if (wantsPasswordChange) {
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        throw new AppError('Preencha todos os campos de senha', 400);
      }

      if (novaSenha !== confirmarSenha) {
        throw new AppError('As senhas nao conferem', 400);
      }

      const userWithPassword = await this.userRepository.findByIdWithPassword(userId);

      if (!userWithPassword) {
        return null;
      }

      const currentPasswordMatches = await passwordMatches(senhaAtual, userWithPassword.senha);

      if (!currentPasswordMatches) {
        throw new AppError('Senha atual invalida', 400);
      }

      nextData.senha = await bcrypt.hash(novaSenha, PASSWORD_SALT_ROUNDS);
    }

    const currentUser = await this.userRepository.findById(userId);

    if (!currentUser) {
      return null;
    }

    const user = await this.userRepository.updateProfile(userId, nextData);

    if (user) {
      await removeUploadedFiles([
        nextData.fotoPerfil ? currentUser.fotoPerfil : undefined,
        nextData.bannerPerfil ? currentUser.bannerPerfil : undefined
      ]);
    }

    return user ? toPublicUser(user) : null;
  }

  private async getTeacherProfileSummary(teacherId: string) {
    const [subjects, schedules] = await Promise.all([
      this.catalogRepository.listSubjects(),
      this.scheduleRepository.listForProfessor(teacherId, {})
    ]);
    const teacherSubjects = subjects.filter((subject) =>
      (subject.professores ?? []).some((teacher) => {
        const teacherObject = teacher as { id?: string; toString: () => string };

        return teacherObject.id === teacherId || teacherObject.toString() === teacherId;
      })
    );
    const lessons = schedules.filter((schedule) => schedule.tipo === ScheduleEntryKind.LESSON);
    const classIds = new Set(lessons.map((schedule) => (typeof schedule.turma === 'object' && 'id' in schedule.turma ? schedule.turma.id : schedule.turma?.toString())).filter(Boolean));
    const cargaHorariaMinutos = lessons.reduce((total, schedule) => total + getTimeDiff(schedule.horarioInicio, schedule.horarioFim), 0);
    const proximaAula = getNextTeacherLesson(lessons);

    return {
      cargaHorariaMinutos,
      disciplinas: teacherSubjects.map((subject) => subject.nome),
      horarioSemanal: lessons.map((schedule) => ({
        diaSemana: schedule.diaSemana,
        disciplina: typeof schedule.disciplina === 'object' && 'nome' in schedule.disciplina ? schedule.disciplina.nome : '',
        horarioFim: schedule.horarioFim,
        horarioInicio: schedule.horarioInicio,
        sala: typeof schedule.sala === 'object' && schedule.sala && 'nome' in schedule.sala ? schedule.sala.nome : '',
        turma: typeof schedule.turma === 'object' && schedule.turma && 'nome' in schedule.turma ? schedule.turma.nome : ''
      })),
      proximaAula,
      quantidadeTurmas: classIds.size
    };
  }
}

function getTimeDiff(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function getTodayWeekday(): Weekday {
  const day = new Date().getDay();

  if (day === 2) return Weekday.TUESDAY;
  if (day === 3) return Weekday.WEDNESDAY;
  if (day === 4) return Weekday.THURSDAY;
  if (day === 5) return Weekday.FRIDAY;

  return Weekday.MONDAY;
}

function getNextTeacherLesson(lessons: Awaited<ReturnType<ScheduleRepository['listForProfessor']>>) {
  const weekdays = [Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY];
  const today = getTodayWeekday();
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return [...lessons]
    .map((lesson) => {
      const dayOffset = (weekdays.indexOf(lesson.diaSemana) - weekdays.indexOf(today) + weekdays.length) % weekdays.length;
      const startMinutes = timeToMinutes(lesson.horarioInicio);
      const distance = (dayOffset === 0 && startMinutes <= currentMinutes ? weekdays.length : dayOffset) * 24 * 60 + startMinutes;

      return { distance, lesson };
    })
    .sort((first, second) => first.distance - second.distance)
    .map(({ lesson }) => ({
      diaSemana: lesson.diaSemana,
      disciplina: typeof lesson.disciplina === 'object' && 'nome' in lesson.disciplina ? lesson.disciplina.nome : '',
      horarioInicio: lesson.horarioInicio,
      sala: typeof lesson.sala === 'object' && lesson.sala && 'nome' in lesson.sala ? lesson.sala.nome : ''
    }))[0];
}
