import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';
import type { ReactionEmoji } from '../../feed/types/feed.types';

export enum IdeaCategory {
  STRUCTURE = 'ESTRUTURA',
  EVENTS = 'EVENTOS',
  SPORTS = 'ESPORTES',
  LIBRARY = 'BIBLIOTECA',
  TECHNOLOGY = 'TECNOLOGIA',
  FOOD = 'ALIMENTACAO',
  PROJECTS = 'PROJETOS',
  OTHER = 'OUTRO'
}

export enum IdeaStatus {
  REVIEW = 'EM_ANALISE',
  PLANNED = 'PLANEJADA',
  IN_PROGRESS = 'EM_DESENVOLVIMENTO',
  DONE = 'CONCLUIDA',
  REJECTED = 'RECUSADA',
  ARCHIVED = 'ARQUIVADA'
}

export type IdeaImage = {
  alt: string;
  nome: string;
  tamanho: number;
  thumbnailUrl: string;
  tipo: string;
  url: string;
};

export type IdeaReaction = {
  emoji: ReactionEmoji;
  usuario: Types.ObjectId;
};

export type OfficialResponse = {
  autor: Types.ObjectId | UserDocument;
  texto: string;
  respondidaEm: Date;
};

export type Idea = {
  autor: Types.ObjectId | UserDocument;
  titulo: string;
  descricao: string;
  categoria: IdeaCategory;
  imagem?: IdeaImage;
  apoios: Types.ObjectId[];
  reacoes: IdeaReaction[];
  status: IdeaStatus;
  destaque: boolean;
  respostaOficial?: OfficialResponse;
  criadaEm: Date;
  atualizadaEm: Date;
};

export type IdeaReactionSummary = {
  emoji: ReactionEmoji;
  quantidade: number;
};

export type PublicIdea = Omit<Idea, 'apoios' | 'autor' | 'reacoes' | 'respostaOficial'> & {
  apoiadaPeloUsuario: boolean;
  autor: PublicUser;
  id: string;
  quantidadeApoios: number;
  quantidadeReacoes: number;
  minhaReacao?: ReactionEmoji;
  reacoes: IdeaReactionSummary[];
  respostaOficial?: {
    autor: PublicUser;
    texto: string;
    respondidaEm: Date;
  };
};

export type IdeaPayload = Pick<Idea, 'categoria' | 'descricao' | 'titulo'>;

export type IdeaAdminPayload = {
  destaque?: boolean;
  respostaOficial?: string;
  status?: IdeaStatus;
};

export type IdeaFilters = {
  categoria?: IdeaCategory;
  limit: number;
  page: number;
  search?: string;
  sort?: 'recentes' | 'apoiadas';
  status?: IdeaStatus;
};
