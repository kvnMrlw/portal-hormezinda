import { NoticeModel, type NoticeDocument } from '../models/notice.model';
import type { CreateNoticeData, ListNoticesOptions, UpdateNoticeData } from '../types/notice.types';

function getVisibilityQuery(options: ListNoticesOptions) {
  const now = new Date();
  const query: Record<string, unknown> = {
    ...(options.categoria ? { categoria: options.categoria } : {}),
    ...(options.prioridade ? { prioridade: options.prioridade } : {}),
    ...(typeof options.fixado === 'boolean' ? { fixado: options.fixado } : {})
  };

  if (!options.includeInactive) {
    query.ativo = true;
    query.dataInicio = { $lte: now };
    query.$or = [{ dataFim: { $exists: false } }, { dataFim: null }, { dataFim: { $gte: now } }];

    return query;
  }

  if (typeof options.ativo === 'boolean') {
    query.ativo = options.ativo;
  }

  if (!options.includeScheduled) {
    query.dataInicio = { $lte: now };
  }

  if (options.expirado === true) {
    query.dataFim = { $lt: now };
  } else if (options.expirado === false || !options.includeInactive) {
    query.$or = [{ dataFim: { $exists: false } }, { dataFim: null }, { dataFim: { $gte: now } }];
  }

  return query;
}

export class NoticeRepository {
  async list(options: ListNoticesOptions): Promise<NoticeDocument[]> {
    const notices = await NoticeModel.find(getVisibilityQuery(options))
      .populate('autor')
      .sort({ fixado: -1, dataInicio: -1, createdAt: -1 });

    if (!options.search) {
      return notices;
    }

    const normalizedSearch = options.search.toLocaleLowerCase('pt-BR');

    return notices.filter((notice) => {
      const authorName =
        typeof notice.autor === 'object' && 'nomeCompleto' in notice.autor ? notice.autor.nomeCompleto : '';
      const searchableText = [notice.titulo, notice.descricao, notice.categoria, authorName].join(' ');

      return searchableText.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
    });
  }

  async create(data: CreateNoticeData): Promise<NoticeDocument> {
    const notice = await NoticeModel.create(data);

    return notice.populate('autor');
  }

  async findById(id: string): Promise<NoticeDocument | null> {
    return NoticeModel.findById(id).populate('autor');
  }

  async update(id: string, data: UpdateNoticeData): Promise<NoticeDocument | null> {
    return NoticeModel.findByIdAndUpdate(id, data, { new: true }).populate('autor');
  }

  async delete(id: string): Promise<void> {
    await NoticeModel.findByIdAndDelete(id);
  }

  async deleteByAuthor(authorId: string): Promise<NoticeDocument[]> {
    const notices = await NoticeModel.find({ autor: authorId });
    await NoticeModel.deleteMany({ autor: authorId });

    return notices;
  }
}
