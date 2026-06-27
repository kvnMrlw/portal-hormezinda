import type { Types } from 'mongoose';

import type { PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';

export type PostImage = {
  url: string;
  alt?: string;
  tipo?: string;
};

export type Post = {
  autor: Types.ObjectId | UserDocument;
  texto: string;
  imagens: PostImage[];
  curtidas: Types.ObjectId[];
  quantidadeCurtidas: number;
  quantidadeComentarios: number;
  data: Date;
  atualizadoEm: Date;
};

export type FeedPost = {
  id: string;
  autor: PublicUser;
  texto: string;
  imagens: PostImage[];
  data: Date;
  quantidadeCurtidas: number;
  quantidadeComentarios: number;
  curtidoPeloUsuario: boolean;
};

export type CreatePostData = {
  autor: string;
  texto: string;
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
