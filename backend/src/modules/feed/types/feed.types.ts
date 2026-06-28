import type { Types } from 'mongoose';

import type { PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';

export const reactionEmojis = ['👍', '❤️', '😂', '😮', '🎉', '👏', '💡'] as const;

export type ReactionEmoji = (typeof reactionEmojis)[number];

export type PostImage = {
  url: string;
  alt?: string;
  tipo?: string;
};

export type PostReaction = {
  usuario: Types.ObjectId;
  emoji: ReactionEmoji;
};

export type ReactionSummary = {
  emoji: ReactionEmoji;
  quantidade: number;
};

export type Post = {
  autor: Types.ObjectId | UserDocument;
  texto?: string;
  imagens: PostImage[];
  reacoes: PostReaction[];
  fixado: boolean;
  data: Date;
  atualizadoEm: Date;
};

export type FeedPost = {
  id: string;
  autor: PublicUser;
  texto: string;
  imagens: PostImage[];
  data: Date;
  reacoes: ReactionSummary[];
  minhaReacao?: ReactionEmoji;
  fixado: boolean;
};

export type CreatePostData = {
  autor: string;
  texto?: string;
  imagem?: PostImage;
};

export type UpdatePostData = {
  texto?: string;
  imagem?: PostImage;
};

export type ListPostsOptions = {
  page: number;
  limit: number;
};

export type FeedPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export enum StoryKind {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT'
}

export type Story = {
  autor: Types.ObjectId | UserDocument;
  tipo: StoryKind;
  texto?: string;
  imagem?: PostImage;
  fundo: string;
  visualizacoes: Types.ObjectId[];
  expiraEm: Date;
  data: Date;
  atualizadoEm: Date;
};

export type FeedStory = {
  id: string;
  autor: PublicUser;
  tipo: StoryKind;
  texto: string;
  imagem?: PostImage;
  fundo: string;
  expiraEm: Date;
  data: Date;
  vistoPeloUsuario: boolean;
};

export type CreateStoryData = {
  autor: string;
  tipo: StoryKind;
  texto?: string;
  imagem?: PostImage;
  fundo?: string;
};
