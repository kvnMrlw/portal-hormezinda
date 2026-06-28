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
  data: Date;
  categoria: MealCategory;
  observacoes?: string;
  ingredientes: string[];
  alergenos: string[];
  vegetariano: boolean;
  vegano: boolean;
  semLactose: boolean;
  semGluten: boolean;
  calorias?: number;
  status: MealStatus;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type PublicMeal = Meal & {
  id: string;
};

export type MealPayload = Omit<Meal, 'criadoEm' | 'imagem' | 'atualizadoEm'> & {
  imagem?: MealImage;
};

export type MealFilters = {
  categoria?: MealCategory;
  dateFrom?: Date;
  dateTo?: Date;
  includeHidden?: boolean;
  search?: string;
  semGluten?: boolean;
  semLactose?: boolean;
  status?: MealStatus;
  vegano?: boolean;
  vegetariano?: boolean;
};
