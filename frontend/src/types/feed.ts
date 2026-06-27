import type { User } from './auth';

export type PostImage = {
  url: string;
  alt?: string;
  tipo?: string;
};

export type FeedPost = {
  id: string;
  autor: User;
  texto: string;
  imagens: PostImage[];
  data: string;
  quantidadeCurtidas: number;
  quantidadeComentarios: number;
  curtidoPeloUsuario: boolean;
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
