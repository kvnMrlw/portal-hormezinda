import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import type { UserDocument } from '../../users/models/user.model';
import { toPublicUser } from '../../users/service/user.service';
import { NoticeRepository } from '../repository/notice.repository';
import type {
  CreateNoticeData,
  ListNoticesOptions,
  Notice,
  NoticeAttachment,
  PublicNotice,
  UpdateNoticeData
} from '../types/notice.types';
import type { NoticeDocument } from '../models/notice.model';

function isUserDocument(author: Notice['autor']): author is UserDocument {
  return typeof author === 'object' && !(author instanceof Types.ObjectId) && 'nomeCompleto' in author;
}

function toPublicNotice(notice: NoticeDocument): PublicNotice {
  if (!isUserDocument(notice.autor)) {
    throw new AppError('Autor do aviso nao carregado', 500);
  }

  return {
    id: notice.id,
    titulo: notice.titulo,
    descricao: notice.descricao,
    categoria: notice.categoria,
    prioridade: notice.prioridade,
    autor: toPublicUser(notice.autor),
    fixado: notice.fixado,
    ativo: notice.ativo,
    dataInicio: notice.dataInicio,
    dataFim: notice.dataFim,
    anexos: notice.anexos ?? [],
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt
  };
}

export class NoticeService {
  constructor(private readonly noticeRepository = new NoticeRepository()) {}

  async list(options: ListNoticesOptions): Promise<PublicNotice[]> {
    const notices = await this.noticeRepository.list(options);

    return notices.map(toPublicNotice);
  }

  async create(authorId: string, data: Omit<CreateNoticeData, 'autor'>): Promise<PublicNotice> {
    const notice = await this.noticeRepository.create({
      ...data,
      autor: authorId
    });

    return toPublicNotice(notice);
  }

  async update(id: string, data: UpdateNoticeData): Promise<PublicNotice | null> {
    const currentNotice = await this.noticeRepository.findById(id);

    if (!currentNotice) {
      return null;
    }

    const nextStartDate = data.dataInicio ?? currentNotice.dataInicio;
    const nextEndDate = data.dataFim === undefined ? currentNotice.dataFim : data.dataFim;

    if (nextEndDate && nextEndDate < nextStartDate) {
      throw new AppError('Data final deve ser posterior a data de inicio', 400);
    }

    const remainingAttachments = (currentNotice.anexos ?? []).filter(
      (attachment) => !data.removerAnexos?.includes(attachment.url)
    );
    const nextAttachments = data.anexos ? [...remainingAttachments, ...data.anexos] : remainingAttachments;
    const noticeData: UpdateNoticeData = { ...data };
    delete noticeData.removerAnexos;

    const notice = await this.noticeRepository.update(id, {
      ...noticeData,
      anexos: data.removerAnexos || data.anexos ? nextAttachments : undefined
    });

    return notice ? toPublicNotice(notice) : null;
  }

  async delete(id: string): Promise<boolean> {
    const notice = await this.noticeRepository.findById(id);

    if (!notice) {
      return false;
    }

    await this.noticeRepository.delete(id);

    return true;
  }
}

export type { NoticeAttachment };
