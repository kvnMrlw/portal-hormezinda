import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { removeUploadedFiles } from '../../../utils/imageUpload';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo } from '../../users/types/user.types';
import type { CourseDocument } from '../models/course.model';
import { CourseRepository } from '../repository/course.repository';
import {
  CourseContentType,
  CourseStatus,
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

function toPublicCourse(course: CourseDocument): PublicCourse {
  if (!isUserDocument(course.professor)) {
    throw new AppError('Professor do curso nao carregado', 500);
  }

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
    professor: toPublicUser(course.professor),
    quantidadeConteudos: (course.conteudos ?? []).length + (course.link ? 1 : 0),
    status: course.status,
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
    private readonly userRepository = new UserRepository()
  ) {}

  async list(filters: CourseFilters): Promise<PublicCourse[]> {
    const courses = await this.courseRepository.list(filters);

    return courses.map(toPublicCourse);
  }

  async create(data: CoursePayload, cover?: CourseCover, assets: CourseAsset[] = []): Promise<PublicCourse> {
    await this.validatePayload(data);
    const course = await this.courseRepository.create(data);
    const hydratedCourse = await this.courseRepository.updateAssets(course.id, this.mergeAssets(course, cover, assets));

    return toPublicCourse(hydratedCourse ?? course);
  }

  async update(id: string, data: CoursePayload, cover?: CourseCover, assets: CourseAsset[] = []): Promise<PublicCourse | null> {
    const currentCourse = await this.courseRepository.findById(id);

    if (!currentCourse) {
      return null;
    }

    await this.validatePayload(data);
    const course = await this.courseRepository.update(id, data);

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

  async delete(id: string): Promise<boolean> {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      return false;
    }

    await this.courseRepository.delete(id);
    await removeUploadedFiles(collectUploadUrls(course));

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

  private async validatePayload(data: CoursePayload): Promise<void> {
    const professor = await this.userRepository.findById(data.professorId);

    if (!professor || !professor.ativo || professor.cargo !== Cargo.PROFESSOR) {
      throw new AppError('Professor invalido para este curso', 400);
    }

    if (data.status === CourseStatus.PUBLISHED && !data.titulo.trim()) {
      throw new AppError('Informe o titulo do curso', 400);
    }
  }
}
