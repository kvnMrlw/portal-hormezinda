import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { removeUploadedFiles } from '../../../utils/imageUpload';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo, type PublicUser } from '../../users/types/user.types';
import { NotificationService } from '../../notifications/service/notification.service';
import { NotificationEntityType, NotificationType } from '../../notifications/types/notification.types';
import type { CourseDocument } from '../models/course.model';
import { CourseRepository } from '../repository/course.repository';
import {
  CourseContentType,
  CourseStatus,
  CourseType,
  type Course,
  type CourseAsset,
  type CourseCover,
  type CourseFilters,
  type CoursePayload,
  type PublicCourse
} from '../types/course.types';

function isUserDocument(user: Course['professor']): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function getCourseOwnerId(course: CourseDocument): string | undefined {
  if (!course.professor) {
    return undefined;
  }

  return course.professor instanceof Types.ObjectId ? course.professor.toString() : course.professor.id;
}

function isInstitutionalUser(user: Pick<PublicUser, 'cargo' | 'pertenceGremio'>): boolean {
  return (
    user.cargo === Cargo.ADMIN ||
    user.cargo === Cargo.DIRETOR ||
    user.cargo === Cargo.COORDENADOR ||
    user.cargo === Cargo.PROFESSOR ||
    user.cargo === Cargo.GREMIO ||
    Boolean(user.pertenceGremio)
  );
}

function createSystemOwner(): PublicUser {
  const now = new Date();

  return {
    id: '',
    nomeCompleto: 'Portal Hormezinda',
    usuario: 'sistema',
    cargo: Cargo.ADMIN,
    pertenceGremio: false,
    fotoPerfil: '',
    bannerPerfil: '',
    bio: '',
    redeSocial: '',
    ativo: true,
    criadoEm: now,
    atualizadoEm: now
  };
}

function toPublicCourse(course: CourseDocument): PublicCourse {
  const professor = isUserDocument(course.professor) ? toPublicUser(course.professor) : createSystemOwner();

  return {
    id: course.id,
    arquivos: course.arquivos ?? [],
    atualizadoEm: course.atualizadoEm,
    capa: course.capa,
    categoria: course.categoria,
    conteudos: (course.conteudos ?? [])
      .map((content) => ({
        arquivo: content.arquivo,
        id: String((content as { _id?: unknown })._id ?? ''),
        link: content.link ?? '',
        ordem: content.ordem,
        texto: content.texto ?? '',
        tipo: content.tipo,
        titulo: content.titulo
      }))
      .sort((first, second) => first.ordem - second.ordem),
    criadoEm: course.criadoEm,
    descricao: course.descricao,
    link: course.link ?? '',
    professor,
    quantidadeConteudos: (course.conteudos ?? []).length + (course.link ? 1 : 0),
    status: course.status,
    tipo: course.tipo,
    titulo: course.titulo
  };
}

function collectUploadUrls(course: CourseDocument): string[] {
  return [
    course.capa?.url,
    ...(course.arquivos ?? []).map((asset) => asset.url),
    ...(course.conteudos ?? []).map((content) => content.arquivo?.url)
  ].filter(Boolean) as string[];
}

function getAssetContentType(mimeType: string): CourseContentType {
  if (mimeType === 'application/pdf') return CourseContentType.PDF;
  if (mimeType.startsWith('video/')) return CourseContentType.VIDEO;
  if (mimeType.startsWith('image/')) return CourseContentType.IMAGE;

  return CourseContentType.PDF;
}

export class CourseService {
  constructor(
    private readonly courseRepository = new CourseRepository(),
    private readonly userRepository = new UserRepository(),
    private readonly notificationService = new NotificationService()
  ) {}

  async list(filters: CourseFilters): Promise<PublicCourse[]> {
    const courses = await this.courseRepository.list(filters);

    return courses.map(toPublicCourse);
  }

  async create(viewer: PublicUser, data: CoursePayload, cover?: CourseCover, assets: CourseAsset[] = []): Promise<PublicCourse> {
    if (!isInstitutionalUser(viewer)) {
      throw new AppError('Acesso nao autorizado', 403);
    }

    const ownerId = viewer.cargo === Cargo.ADMIN ? data.professorId || viewer.id : viewer.id;
    await this.validatePayload({ ...data, professorId: ownerId });
    const course = await this.courseRepository.create({ ...data, professorId: ownerId });
    const hydratedCourse = await this.courseRepository.updateAssets(course.id, this.mergeAssets(course, cover, assets));
    const publicCourse = toPublicCourse(hydratedCourse ?? course);

    void this.notificationService.notifyAllActive({
      autorId: viewer.id,
      descricao: data.descricao.slice(0, 180),
      entidadeId: publicCourse.id,
      entidadeTipo: NotificationEntityType.COURSE,
      tipo: data.tipo === CourseType.PLATFORM ? NotificationType.NEW_PLATFORM : NotificationType.NEW_COURSE,
      titulo: data.tipo === CourseType.PLATFORM ? `Nova plataforma: ${data.titulo}` : `Novo curso: ${data.titulo}`,
      url: `/cursos?curso=${publicCourse.id}`
    });

    return publicCourse;
  }

  async update(
    id: string,
    viewer: PublicUser,
    data: CoursePayload,
    cover?: CourseCover,
    assets: CourseAsset[] = []
  ): Promise<PublicCourse | null> {
    const currentCourse = await this.courseRepository.findById(id);

    if (!currentCourse) {
      return null;
    }

    this.assertCanManageCourse(currentCourse, viewer);

    const ownerId = viewer.cargo === Cargo.ADMIN ? data.professorId || getCourseOwnerId(currentCourse) || viewer.id : getCourseOwnerId(currentCourse) || viewer.id;
    await this.validatePayload({ ...data, professorId: ownerId });
    const course = await this.courseRepository.update(id, { ...data, professorId: ownerId });

    if (!course) {
      return null;
    }

    const hydratedCourse = await this.courseRepository.updateAssets(id, this.mergeAssets(course, cover ?? course.capa, assets.length ? assets : course.arquivos));

    if (cover && currentCourse.capa?.url !== cover.url) {
      await removeUploadedFiles([currentCourse.capa?.url]);
    }

    if (assets.length) {
      await removeUploadedFiles([
        ...(currentCourse.arquivos ?? []).map((asset) => asset.url),
        ...(currentCourse.conteudos ?? []).map((content) => content.arquivo?.url)
      ]);
    }

    return hydratedCourse ? toPublicCourse(hydratedCourse) : null;
  }

  async delete(id: string, viewer: PublicUser): Promise<boolean> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      return false;
    }

    this.assertCanManageCourse(course, viewer);

    await Promise.all([
      this.courseRepository.delete(id),
      removeUploadedFiles(collectUploadUrls(course)),
      this.notificationService.deleteByEntity(id)
    ]);

    return true;
  }

  private mergeAssets(course: CourseDocument, cover?: CourseCover, assets: CourseAsset[] = []) {
    const fileContents = assets.map((asset, index) => ({
      arquivo: asset,
      ordem: (course.conteudos?.length ?? 0) + index,
      tipo: getAssetContentType(asset.tipo),
      titulo: asset.nome
    }));

    return {
      arquivos: assets,
      capa: cover,
      conteudos: [...(course.conteudos ?? []), ...fileContents]
    };
  }

  private assertCanManageCourse(course: CourseDocument, viewer: PublicUser): void {
    const isAuthor = getCourseOwnerId(course) === viewer.id;
    const isAdmin = viewer.cargo === Cargo.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new AppError('Acesso nao autorizado', 403);
    }
  }

  private async validatePayload(data: CoursePayload): Promise<void> {
    const professor = await this.userRepository.findById(data.professorId);

    if (!professor || !professor.ativo || !isInstitutionalUser(toPublicUser(professor))) {
      throw new AppError('Responsavel invalido para este curso', 400);
    }

    if (data.status === CourseStatus.PUBLISHED && !data.titulo.trim()) {
      throw new AppError('Informe o titulo do curso', 400);
    }
  }
}
