import type { User } from './auth';

export const reactionEmojis = ['👍', '❤️', '😂', '😮', '🎉', '👏', '💡'] as const;

export type ReactionEmoji = (typeof reactionEmojis)[number];

export type PostImage = {
  url: string;
  alt?: string;
  tipo?: string;
};

export type ReactionSummary = {
  emoji: ReactionEmoji;
  quantidade: number;
};

export type FeedPost = {
  id: string;
  autor: User;
  texto: string;
  imagens: PostImage[];
  data: string;
  reacoes: ReactionSummary[];
  minhaReacao?: ReactionEmoji;
  fixado: boolean;
};

export type FeedPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type FeedResponse = {
  publicacoes: FeedPost[];
  paginacao: FeedPagination;
};

export enum StoryKind {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT'
}

export type FeedStory = {
  id: string;
  autor: User;
  tipo: StoryKind;
  texto: string;
  imagem?: PostImage;
  fundo: string;
  expiraEm: string;
  data: string;
  vistoPeloUsuario: boolean;
};

export type CreatePostPayload = {
  texto?: string;
  imagem?: File;
};

export type CreateStoryPayload = {
  tipo: StoryKind;
  texto?: string;
  fundo?: string;
  imagem?: File;
};
