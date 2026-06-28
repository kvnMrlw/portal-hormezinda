import { Types } from 'mongoose';

import { CourseModel, type CourseDocument } from '../models/course.model';
import { CourseStatus, type CourseFilters, type CoursePayload } from '../types/course.types';

function buildTextFilter(search?: string) {
  const normalizedSearch = search?.trim();

  if (!normalizedSearch) {
    return {};
  }

  const escapedSearch = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return {
    $or: [
      { titulo: { $regex: escapedSearch, $options: 'i' } },
      { descricao: { $regex: escapedSearch, $options: 'i' } },
      { categoria: { $regex: escapedSearch, $options: 'i' } }
    ]
  };
}

function buildPayload(data: CoursePayload) {
  return {
    categoria: data.categoria,
    conteudos: data.conteudos ?? [],
    descricao: data.descricao,
    link: data.link ?? '',
    professor: new Types.ObjectId(data.professorId),
    status: data.status,
    titulo: data.titulo
  };
}

export class CourseRepository {
  async list(filters: CourseFilters = {}): Promise<CourseDocument[]> {
    return CourseModel.find({
      ...buildTextFilter(filters.search),
      ...(filters.categoria ? { categoria: filters.categoria } : {}),
      ...(filters.professorId ? { professor: filters.professorId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(!filters.includeHidden ? { status: CourseStatus.PUBLISHED } : {})
    })
      .populate('professor')
      .sort({ criadoEm: -1 });
  }

  async findById(id: string): Promise<CourseDocument | null> {
    return CourseModel.findById(id).populate('professor');
  }

  async create(data: CoursePayload): Promise<CourseDocument> {
    const course = await CourseModel.create(buildPayload(data));

    return course.populate('professor');
  }

  async update(id: string, data: CoursePayload): Promise<CourseDocument | null> {
    return CourseModel.findByIdAndUpdate(id, buildPayload(data), { new: true }).populate('professor');
  }

  async updateAssets(id: string, assets: Partial<Pick<CourseDocument, 'arquivos' | 'capa' | 'conteudos'>>): Promise<CourseDocument | null> {
    return CourseModel.findByIdAndUpdate(id, assets, { new: true }).populate('professor');
  }

  async delete(id: string): Promise<void> {
    await CourseModel.findByIdAndDelete(id);
  }
}
