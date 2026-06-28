import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { removeUploadedFiles } from '../../../utils/imageUpload';
import { reactionEmojis, type ReactionEmoji } from '../../feed/types/feed.types';
import { NotificationEntityType, NotificationType } from '../../notifications/types/notification.types';
import { NotificationService } from '../../notifications/service/notification.service';
import type { UserDocument } from '../../users/models/user.model';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo, type PublicUser } from '../../users/types/user.types';
import type { IdeaDocument } from '../models/idea.model';
import { IdeaRepository } from '../repository/idea.repository';
import {
  IdeaStatus,
  type Idea,
  type IdeaAdminPayload,
  type IdeaFilters,
  type IdeaImage,
  type IdeaPayload,
  type IdeaReactionSummary,
  type PublicIdea
} from '../types/idea.types';

function isUserDocument(user: unknown): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function summarizeReactions(idea: IdeaDocument): IdeaReactionSummary[] {
  const reactions = idea.reacoes ?? [];

  return reactionEmojis
    .map((emoji) => ({
      emoji,
      quantidade: reactions.filter((reaction) => reaction.emoji === emoji).length
    }))
    .filter((reaction) => reaction.quantidade > 0);
}

function getAuthorId(idea: IdeaDocument): string {
  if (idea.autor instanceof Types.ObjectId) return idea.autor.toString();

  return idea.autor.id;
}

function toPublicIdea(idea: IdeaDocument, viewerId: string): PublicIdea {
  if (!isUserDocument(idea.autor)) {
    throw new AppError('Autor da ideia nao carregado', 500);
  }

  const myReaction = idea.reacoes?.find((reaction) => reaction.usuario.toString() === viewerId)?.emoji;
  const officialAuthor = idea.respostaOficial?.autor;

  return {
    id: idea.id,
    apoiadaPeloUsuario: (idea.apoios ?? []).some((supporterId) => supporterId.toString() === viewerId),
    autor: toPublicUser(idea.autor),
    categoria: idea.categoria,
    criadaEm: idea.criadaEm,
    atualizadaEm: idea.atualizadaEm,
    descricao: idea.descricao,
    destaque: idea.destaque,
    imagem: idea.imagem,
    minhaReacao: myReaction,
    quantidadeApoios: idea.apoios?.length ?? 0,
    quantidadeReacoes: idea.reacoes?.length ?? 0,
    reacoes: summarizeReactions(idea),
    respostaOficial:
      idea.respostaOficial && isUserDocument(officialAuthor)
        ? {
            autor: toPublicUser(officialAuthor),
            respondidaEm: idea.respostaOficial.respondidaEm,
            texto: idea.respostaOficial.texto
          }
        : undefined,
    status: idea.status,
    titulo: idea.titulo
  };
}

function getStatusNotificationType(status: IdeaStatus): NotificationType | undefined {
  if (status === IdeaStatus.PLANNED || status === IdeaStatus.IN_PROGRESS) return NotificationType.IDEA_APPROVED;
  if (status === IdeaStatus.REJECTED) return NotificationType.IDEA_REJECTED;
  if (status === IdeaStatus.DONE) return NotificationType.IDEA_COMPLETED;

  return undefined;
}

export class IdeaService {
  constructor(
    private readonly ideaRepository = new IdeaRepository(),
    private readonly notificationService = new NotificationService()
  ) {}

  async list(viewerId: string, filters: IdeaFilters): Promise<{ ideias: PublicIdea[]; paginacao: { hasMore: boolean; limit: number; page: number; total: number } }> {
    const [ideas, total] = await Promise.all([this.ideaRepository.list(filters), this.ideaRepository.count(filters)]);

    return {
      ideias: ideas.map((idea) => toPublicIdea(idea, viewerId)),
      paginacao: {
        limit: filters.limit,
        page: filters.page,
        total,
        hasMore: filters.page * filters.limit < total
      }
    };
  }

  async listByAuthor(authorId: string, viewerId: string, limit = 6): Promise<PublicIdea[]> {
    const ideas = await this.ideaRepository.listByAuthor(authorId, limit);

    return ideas.map((idea) => toPublicIdea(idea, viewerId));
  }

  async create(author: PublicUser, data: IdeaPayload, image?: IdeaImage): Promise<PublicIdea> {
    const idea = await this.ideaRepository.create(author.id, data, image);

    void this.notificationService.notifyAllActive({
      autorId: author.id,
      descricao: data.descricao.slice(0, 180),
      entidadeId: idea.id,
      entidadeTipo: NotificationEntityType.IDEA,
      tipo: NotificationType.NEW_IDEA,
      titulo: `Nova ideia: ${data.titulo}`,
      url: `/ideias?ideia=${idea.id}`
    });

    return toPublicIdea(idea, author.id);
  }

  async update(id: string, viewer: PublicUser, data: Partial<IdeaPayload>, image?: IdeaImage): Promise<PublicIdea | null> {
    const currentIdea = await this.ideaRepository.findById(id);

    if (!currentIdea) return null;

    this.assertCanManageIdea(currentIdea, viewer);

    const idea = await this.ideaRepository.update(id, { ...data, ...(image ? { imagem: image } : {}) });

    if (idea && image) {
      await removeUploadedFiles([currentIdea.imagem?.url, currentIdea.imagem?.thumbnailUrl]);
    }

    return idea ? toPublicIdea(idea, viewer.id) : null;
  }

  async updateAdmin(id: string, admin: PublicUser, data: IdeaAdminPayload): Promise<PublicIdea | null> {
    if (admin.cargo !== Cargo.ADMIN) {
      throw new AppError('Acesso nao autorizado', 403);
    }

    const currentIdea = await this.ideaRepository.findById(id);

    if (!currentIdea) return null;

    const previousStatus = currentIdea.status;
    const hadOfficialResponse = Boolean(currentIdea.respostaOficial?.texto);
    const idea = await this.ideaRepository.updateAdmin(id, admin.id, data);

    if (!idea) return null;

    const authorId = getAuthorId(idea);
    const statusNotificationType = data.status && data.status !== previousStatus ? getStatusNotificationType(data.status) : undefined;

    if (statusNotificationType) {
      void this.notificationService.notifyUsers([authorId], {
        autorId: admin.id,
        descricao: `Sua ideia "${idea.titulo}" teve o status atualizado.`,
        entidadeId: idea.id,
        entidadeTipo: NotificationEntityType.IDEA,
        tipo: statusNotificationType,
        titulo: 'Atualizacao da sua ideia',
        url: `/ideias?ideia=${idea.id}`
      });
    }

    if (data.respostaOficial && !hadOfficialResponse) {
      void this.notificationService.notifyUsers([authorId], {
        autorId: admin.id,
        descricao: data.respostaOficial.slice(0, 180),
        entidadeId: idea.id,
        entidadeTipo: NotificationEntityType.IDEA,
        tipo: NotificationType.IDEA_RESPONSE,
        titulo: 'Resposta oficial em sua ideia',
        url: `/ideias?ideia=${idea.id}`
      });
    }

    return toPublicIdea(idea, admin.id);
  }

  async toggleSupport(id: string, viewer: PublicUser): Promise<PublicIdea | null> {
    const idea = await this.ideaRepository.toggleSupport(id, viewer.id);

    if (!idea) return null;

    const isNowSupported = (idea.apoios ?? []).some((supporterId) => supporterId.toString() === viewer.id);
    const authorId = getAuthorId(idea);

    if (isNowSupported && authorId !== viewer.id) {
      void this.notificationService.notifyUsers([authorId], {
        autorId: viewer.id,
        descricao: `${viewer.nomeCompleto} apoiou sua ideia "${idea.titulo}".`,
        entidadeId: idea.id,
        entidadeTipo: NotificationEntityType.IDEA,
        tipo: NotificationType.IDEA_SUPPORT,
        titulo: 'Sua ideia recebeu apoio',
        url: `/ideias?ideia=${idea.id}`
      });
    }

    return toPublicIdea(idea, viewer.id);
  }

  async react(id: string, viewer: PublicUser, emoji: ReactionEmoji): Promise<PublicIdea | null> {
    const idea = await this.ideaRepository.react(id, viewer.id, emoji);

    if (!idea) return null;

    const authorId = getAuthorId(idea);

    if (authorId !== viewer.id) {
      void this.notificationService.notifyUsers([authorId], {
        autorId: viewer.id,
        descricao: `${viewer.nomeCompleto} reagiu com ${emoji} na sua ideia.`,
        entidadeId: idea.id,
        entidadeTipo: NotificationEntityType.IDEA,
        tipo: NotificationType.IDEA_REACTION,
        titulo: 'Nova reacao na sua ideia',
        url: `/ideias?ideia=${idea.id}`
      });
    }

    return toPublicIdea(idea, viewer.id);
  }

  async delete(id: string, viewer: PublicUser): Promise<boolean> {
    const idea = await this.ideaRepository.findById(id);

    if (!idea) return false;

    this.assertCanManageIdea(idea, viewer);

    await this.ideaRepository.delete(id);
    await Promise.all([
      removeUploadedFiles([idea.imagem?.url, idea.imagem?.thumbnailUrl]),
      this.notificationService.deleteByEntity(id)
    ]);

    return true;
  }

  async deleteByAuthor(authorId: string): Promise<void> {
    const ideas = await this.ideaRepository.deleteByAuthor(authorId);
    const imageUrls = ideas.flatMap((idea) => [idea.imagem?.url, idea.imagem?.thumbnailUrl]);

    await Promise.all([
      removeUploadedFiles(imageUrls),
      ...ideas.map((idea) => this.notificationService.deleteByEntity(idea.id))
    ]);
  }

  private assertCanManageIdea(idea: IdeaDocument, viewer: PublicUser): void {
    const isAuthor = getAuthorId(idea) === viewer.id;
    const isAdmin = viewer.cargo === Cargo.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new AppError('Acesso nao autorizado', 403);
    }
  }
}

export { reactionEmojis };
