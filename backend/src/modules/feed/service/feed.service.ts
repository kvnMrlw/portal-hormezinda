import { Types } from 'mongoose';

import { toPublicUser } from '../../users/service/user.service';
import type { UserDocument } from '../../users/models/user.model';
import { FeedRepository } from '../repository/feed.repository';
import type { FeedPagination, FeedPost, ListPostsOptions, Post } from '../types/feed.types';
import type { PostDocument } from '../models/post.model';

function isUserDocument(author: Post['autor']): author is UserDocument {
  return typeof author === 'object' && !(author instanceof Types.ObjectId) && 'nomeCompleto' in author;
}

function toFeedPost(post: PostDocument, viewerId: string): FeedPost {
  if (!isUserDocument(post.autor)) {
    throw new Error('Autor da publicacao nao carregado');
  }

  return {
    id: post.id,
    autor: toPublicUser(post.autor),
    texto: post.texto,
    imagens: post.imagens,
    data: post.data,
    quantidadeCurtidas: post.quantidadeCurtidas,
    quantidadeComentarios: post.quantidadeComentarios,
    curtidoPeloUsuario: post.curtidas.some((userId) => userId.toString() === viewerId)
  };
}

export class FeedService {
  constructor(private readonly feedRepository = new FeedRepository()) {}

  async listPosts(
    viewerId: string,
    options: ListPostsOptions
  ): Promise<{ publicacoes: FeedPost[]; paginacao: FeedPagination }> {
    const [posts, total] = await Promise.all([this.feedRepository.list(options), this.feedRepository.count()]);

    return {
      publicacoes: posts.map((post) => toFeedPost(post, viewerId)),
      paginacao: {
        ...options,
        total,
        hasMore: options.page * options.limit < total
      }
    };
  }

  async createPost(authorId: string, text: string): Promise<FeedPost> {
    const post = await this.feedRepository.create({ autor: authorId, texto: text });

    return toFeedPost(post, authorId);
  }

  async likePost(postId: string, viewerId: string): Promise<FeedPost | null> {
    const post = await this.feedRepository.like(postId, viewerId);

    return post ? toFeedPost(post, viewerId) : null;
  }
}
