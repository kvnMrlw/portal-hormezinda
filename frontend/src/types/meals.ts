import { Weekday } from './schedules';

export enum MealCategory {
  BREAKFAST = 'BREAKFAST',
  SNACK = 'SNACK',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SPECIAL = 'SPECIAL'
}

export enum MealStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DRAFT = 'DRAFT'
}

export type MealImage = {
  url: string;
  thumbnailUrl: string;
  alt: string;
  tipo: string;
};

export type Meal = {
  id: string;
  nome: string;
  descricao: string;
  imagem?: MealImage;
  data?: string;
  diaSemana: Weekday;
  categoria: MealCategory;
  status: MealStatus;
  criadoEm: string;
  atualizadoEm: string;
};

export type MealPayload = {
  nome: string;
  descricao: string;
  imagem?: File;
  diaSemana: Weekday;
  categoria: MealCategory;
  status: MealStatus;
};

export type MealFilters = {
  categoria?: MealCategory | '';
  diaSemana?: Weekday | '';
  search?: string;
  status?: MealStatus | '';
};

export const mealCategoryLabels: Record<MealCategory, string> = {
  [MealCategory.BREAKFAST]: 'Cafe',
  [MealCategory.SNACK]: 'Lanche',
  [MealCategory.LUNCH]: 'Almoco',
  [MealCategory.DINNER]: 'Jantar',
  [MealCategory.SPECIAL]: 'Especial'
};

export const mealStatusLabels: Record<MealStatus, string> = {
  [MealStatus.PUBLISHED]: 'Publicado',
  [MealStatus.HIDDEN]: 'Oculto',
  [MealStatus.DRAFT]: 'Rascunho'
};
