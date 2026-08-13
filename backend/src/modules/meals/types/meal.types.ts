import { Weekday } from '../../schedules/types/schedule.types';

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
  nome: string;
  descricao: string;
  imagem?: MealImage;
  data?: Date;
  diaSemana?: Weekday;
  categoria: MealCategory;
  status: MealStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicMeal = Meal & {
  id: string;
};

export type MealPayload = Pick<Meal, 'categoria' | 'descricao' | 'diaSemana' | 'nome' | 'status'> & {
  imagem?: MealImage;
};

export type MealFilters = {
  categoria?: MealCategory;
  diaSemana?: Weekday;
  includeHidden?: boolean;
  search?: string;
  status?: MealStatus;
};
