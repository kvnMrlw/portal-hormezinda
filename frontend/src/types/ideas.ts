import type { User } from './auth';
import type { ReactionEmoji, ReactionSummary } from './feed';

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

export type OfficialIdeaResponse = {
  autor: User;
  texto: string;
  respondidaEm: string;
};

export type Idea = {
  id: string;
  apoiadaPeloUsuario: boolean;
  autor: User;
  categoria: IdeaCategory;
  criadaEm: string;
  atualizadaEm: string;
  descricao: string;
  destaque: boolean;
  imagem?: IdeaImage;
  minhaReacao?: ReactionEmoji;
  quantidadeApoios: number;
  quantidadeReacoes: number;
  reacoes: ReactionSummary[];
  respostaOficial?: OfficialIdeaResponse;
  status: IdeaStatus;
  titulo: string;
};

export type IdeaPayload = {
  categoria: IdeaCategory;
  descricao: string;
  imagem?: File;
  titulo: string;
};

export type IdeaAdminPayload = {
  destaque?: boolean;
  respostaOficial?: string;
  status?: IdeaStatus;
};

export type IdeaFilters = {
  categoria?: IdeaCategory | '';
  limit?: number;
  page?: number;
  search?: string;
  sort?: 'recentes' | 'apoiadas';
  status?: IdeaStatus | '';
};

export type IdeaResponse = {
  ideias: Idea[];
  paginacao: {
    hasMore: boolean;
    limit: number;
    page: number;
    total: number;
  };
};

export const ideaCategoryLabels: Record<IdeaCategory, string> = {
  [IdeaCategory.STRUCTURE]: 'Estrutura',
  [IdeaCategory.EVENTS]: 'Eventos',
  [IdeaCategory.SPORTS]: 'Esportes',
  [IdeaCategory.LIBRARY]: 'Biblioteca',
  [IdeaCategory.TECHNOLOGY]: 'Tecnologia',
  [IdeaCategory.FOOD]: 'Alimentacao',
  [IdeaCategory.PROJECTS]: 'Projetos',
  [IdeaCategory.OTHER]: 'Outro'
};

export const ideaStatusLabels: Record<IdeaStatus, string> = {
  [IdeaStatus.REVIEW]: 'Em analise',
  [IdeaStatus.PLANNED]: 'Planejada',
  [IdeaStatus.IN_PROGRESS]: 'Em desenvolvimento',
  [IdeaStatus.DONE]: 'Concluida',
  [IdeaStatus.REJECTED]: 'Recusada',
  [IdeaStatus.ARCHIVED]: 'Arquivada'
};
