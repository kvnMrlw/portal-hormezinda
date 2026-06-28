import { Types } from 'mongoose';

import { IdeaModel, type IdeaDocument } from '../models/idea.model';
import type { IdeaAdminPayload, IdeaFilters, IdeaImage, IdeaPayload } from '../types/idea.types';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildQuery(filters: IdeaFilters) {
  const query: Record<string, unknown> = {
    ...(filters.categoria ? { categoria: filters.categoria } : {}),
    ...(filters.status ? { status: filters.status } : {})
  };

  if (filters.search?.trim()) {
    const escapedSearch = escapeRegex(filters.search.trim());
    query.$or = [
      { titulo: { $regex: escapedSearch, $options: 'i' } },
      { descricao: { $regex: escapedSearch, $options: 'i' } },
      { categoria: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  return query;
}

export class IdeaRepository {
  async list(filters: IdeaFilters): Promise<IdeaDocument[]> {
    const ideas = await IdeaModel.find(buildQuery(filters))
      .populate('autor')
      .populate('respostaOficial.autor')
      .sort({ destaque: -1, criadaEm: -1 }) as IdeaDocument[];

    const filteredIdeas = filters.search?.trim()
      ? ideas.filter((idea) => {
          const authorName = typeof idea.autor === 'object' && 'nomeCompleto' in idea.autor ? idea.autor.nomeCompleto : '';
          const searchableText = [idea.titulo, idea.descricao, idea.categoria, authorName].join(' ').toLocaleLowerCase('pt-BR');

          return searchableText.includes(filters.search?.trim().toLocaleLowerCase('pt-BR') ?? '');
        })
      : ideas;

    const sortedIdeas =
      filters.sort === 'apoiadas'
        ? filteredIdeas.sort((first, second) => {
            const highlightDiff = Number(second.destaque) - Number(first.destaque);

            if (highlightDiff !== 0) return highlightDiff;

            return (second.apoios?.length ?? 0) - (first.apoios?.length ?? 0) || second.criadaEm.getTime() - first.criadaEm.getTime();
          })
        : filteredIdeas.sort((first, second) => Number(second.destaque) - Number(first.destaque) || second.criadaEm.getTime() - first.criadaEm.getTime());

    return sortedIdeas.slice((filters.page - 1) * filters.limit, filters.page * filters.limit);
  }

  async count(filters: IdeaFilters): Promise<number> {
    if (!filters.search?.trim()) {
      return IdeaModel.countDocuments(buildQuery(filters));
    }

    const ideas = await IdeaModel.find(buildQuery(filters)).populate('autor').populate('respostaOficial.autor') as IdeaDocument[];
    const normalizedSearch = filters.search.trim().toLocaleLowerCase('pt-BR');

    return ideas.filter((idea) => {
      const authorName = typeof idea.autor === 'object' && 'nomeCompleto' in idea.autor ? idea.autor.nomeCompleto : '';
      const searchableText = [idea.titulo, idea.descricao, idea.categoria, authorName].join(' ').toLocaleLowerCase('pt-BR');

      return searchableText.includes(normalizedSearch);
    }).length;
  }

  async listByAuthor(authorId: string, limit = 6): Promise<IdeaDocument[]> {
    return IdeaModel.find({ autor: authorId }).populate('autor').populate('respostaOficial.autor').sort({ criadaEm: -1 }).limit(limit);
  }

  async create(authorId: string, data: IdeaPayload, image?: IdeaImage): Promise<IdeaDocument> {
    const idea = await IdeaModel.create({
      ...data,
      autor: authorId,
      imagem: image
    });

    return idea.populate('autor');
  }

  async findById(id: string): Promise<IdeaDocument | null> {
    return IdeaModel.findById(id).populate('autor').populate('respostaOficial.autor');
  }

  async update(id: string, data: Partial<IdeaPayload> & { imagem?: IdeaImage }): Promise<IdeaDocument | null> {
    return IdeaModel.findByIdAndUpdate(id, data, { new: true }).populate('autor').populate('respostaOficial.autor');
  }

  async updateAdmin(id: string, adminId: string, data: IdeaAdminPayload): Promise<IdeaDocument | null> {
    const updateData: Record<string, unknown> = {};

    if (data.status) updateData.status = data.status;
    if (typeof data.destaque === 'boolean') updateData.destaque = data.destaque;
    if (data.respostaOficial !== undefined) {
      updateData.respostaOficial = data.respostaOficial.trim()
        ? { autor: new Types.ObjectId(adminId), respondidaEm: new Date(), texto: data.respostaOficial.trim() }
        : undefined;
    }

    return IdeaModel.findByIdAndUpdate(id, updateData, { new: true }).populate('autor').populate('respostaOficial.autor');
  }

  async toggleSupport(id: string, userId: string): Promise<IdeaDocument | null> {
    const idea = await IdeaModel.findById(id);

    if (!idea) return null;

    const alreadySupported = idea.apoios.some((supporterId) => supporterId.toString() === userId);

    if (alreadySupported) {
      idea.apoios = idea.apoios.filter((supporterId) => supporterId.toString() !== userId);
    } else {
      idea.apoios.push(new Types.ObjectId(userId));
    }

    await idea.save();

    return idea.populate('autor');
  }

  async react(id: string, userId: string, emoji: string): Promise<IdeaDocument | null> {
    const idea = await IdeaModel.findById(id);

    if (!idea) return null;

    const existingReaction = idea.reacoes.find((reaction) => reaction.usuario.toString() === userId);

    if (existingReaction) {
      existingReaction.emoji = emoji as never;
    } else {
      idea.reacoes.push({ emoji: emoji as never, usuario: new Types.ObjectId(userId) });
    }

    await idea.save();

    return idea.populate('autor');
  }

  async delete(id: string): Promise<void> {
    await IdeaModel.findByIdAndDelete(id);
  }

  async deleteByAuthor(authorId: string): Promise<IdeaDocument[]> {
    const ideas = await IdeaModel.find({ autor: authorId });
    await IdeaModel.deleteMany({ autor: authorId });

    return ideas;
  }
}
