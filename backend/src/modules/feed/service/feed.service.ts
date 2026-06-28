import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { toPublicUser } from '../../users/service/user.service';
import { Cargo } from '../../users/types/user.types';
import type { PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';
import { FeedRepository } from '../repository/feed.repository';
import {
  reactionEmojis,
  type CreateStoryData,
  type FeedPagination,
  type FeedPost,
  type FeedStory,
  type ListPostsOptions,
  type Post,
  type ReactionEmoji,
  type ReactionSummary,
  type Story
} from '../types/feed.types';
import type { PostDocument } from '../models/post.model';
import type { StoryDocument } from '../models/story.model';

function isUserDocument(author: Post['autor']): author is UserDocument {
  return typeof author === 'object' && !(author instanceof Types.ObjectId) && 'nomeCompleto' in author;
}

function isStoryUserDocument(author: Story['autor']): author is UserDocument {
  return typeof author === 'object' && !(author instanceof Types.ObjectId) && 'nomeCompleto' in author;
}

function summarizeReactions(post: PostDocument): ReactionSummary[] {
  const reactions = post.reacoes ?? [];

  return reactionEmojis
    .map((emoji) => ({
      emoji,
      quantidade: reactions.filter((reaction) => reaction.emoji === emoji).length
    }))
    .filter((reaction) => reaction.quantidade > 0);
}

function toFeedPost(post: PostDocument, viewerId: string): FeedPost {
  if (!isUserDocument(post.autor)) {
    throw new Error('Autor da publicacao nao carregado');
  }

  const reactions = post.reacoes ?? [];
  const myReaction = reactions.find((reaction) => reaction.usuario.toString() === viewerId)?.emoji;

  return {
    id: post.id,
    autor: toPublicUser(post.autor),
    texto: post.texto ?? '',
    imagens: post.imagens ?? [],
    data: post.data,
    reacoes: summarizeReactions(post),
    minhaReacao: myReaction,
    fixado: Boolean(post.fixado)
  };
}

function toFeedStory(story: StoryDocument, viewerId: string): FeedStory {
  if (!isStoryUserDocument(story.autor)) {
    throw new Error('Autor do story nao carregado');
  }

  return {
    id: story.id,
    autor: toPublicUser(story.autor),
    tipo: story.tipo,
    texto: story.texto ?? '',
    imagem: story.imagem,
    fundo: story.fundo,
    expiraEm: story.expiraEm,
    data: story.data,
    vistoPeloUsuario: story.visualizacoes.some((userId) => userId.toString() === viewerId)
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

  async createPost(authorId: string, data: Omit<Parameters<FeedRepository['create']>[0], 'autor'>): Promise<FeedPost> {
    const post = await this.feedRepository.create({ autor: authorId, ...data });

    return toFeedPost(post, authorId);
  }

  async reactToPost(postId: string, viewerId: string, emoji: ReactionEmoji): Promise<FeedPost | null> {
    const post = await this.feedRepository.react(postId, viewerId, emoji);

    return post ? toFeedPost(post, viewerId) : null;
  }

  async setPostPinned(postId: string, viewerId: string, pinned: boolean): Promise<FeedPost | null> {
    const post = await this.feedRepository.setPinned(postId, pinned);

    return post ? toFeedPost(post, viewerId) : null;
  }

  async deletePost(postId: string, viewer: PublicUser): Promise<boolean> {
    const post = await this.feedRepository.findById(postId);

    if (!post) {
      return false;
    }

    if (!isUserDocument(post.autor)) {
      throw new AppError('Autor da publicacao nao carregado', 500);
    }

    const isAuthor = post.autor.id === viewer.id;
    const isAdmin = viewer.cargo === Cargo.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new AppError('Acesso nao autorizado', 403);
    }

    await this.feedRepository.delete(postId);

    return true;
  }

  async listStories(viewerId: string): Promise<FeedStory[]> {
    const stories = await this.feedRepository.listActiveStories();

    return stories.map((story) => toFeedStory(story, viewerId));
  }

  async createStory(authorId: string, data: Omit<CreateStoryData, 'autor'>): Promise<FeedStory> {
    const story = await this.feedRepository.createStory({ autor: authorId, ...data });

    return toFeedStory(story, authorId);
  }

  async markStoryAsViewed(storyId: string, viewerId: string): Promise<FeedStory | null> {
    const story = await this.feedRepository.markStoryAsViewed(storyId, viewerId);

    return story ? toFeedStory(story, viewerId) : null;
  }
}
