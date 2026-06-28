import { removeUploadedFiles } from '../../../utils/imageUpload';
import { MealRepository } from '../repository/meal.repository';
import type { MealFilters, MealImage, MealPayload, PublicMeal } from '../types/meal.types';

function toPublicMeal(meal: Awaited<ReturnType<MealRepository['findById']>> extends infer T ? NonNullable<T> : never): PublicMeal {
  return {
    id: meal.id,
    alergenos: meal.alergenos ?? [],
    atualizadoEm: meal.atualizadoEm,
    calorias: meal.calorias,
    categoria: meal.categoria,
    criadoEm: meal.criadoEm,
    data: meal.data,
    descricao: meal.descricao,
    imagem: meal.imagem,
    ingredientes: meal.ingredientes ?? [],
    nome: meal.nome,
    observacoes: meal.observacoes ?? '',
    semGluten: meal.semGluten,
    semLactose: meal.semLactose,
    status: meal.status,
    vegano: meal.vegano,
    vegetariano: meal.vegetariano
  };
}

export class MealService {
  constructor(private readonly mealRepository = new MealRepository()) {}

  async list(filters: MealFilters): Promise<PublicMeal[]> {
    const meals = await this.mealRepository.list(filters);

    return meals.map(toPublicMeal);
  }

  async create(data: MealPayload): Promise<PublicMeal> {
    const meal = await this.mealRepository.create(data);

    return toPublicMeal(meal);
  }

  async update(id: string, data: MealPayload, image?: MealImage): Promise<PublicMeal | null> {
    const currentMeal = await this.mealRepository.findById(id);

    if (!currentMeal) {
      return null;
    }

    const meal = await this.mealRepository.update(id, {
      ...data,
      ...(image ? { imagem: image } : {})
    });

    if (meal && image) {
      await removeUploadedFiles([currentMeal.imagem?.url, currentMeal.imagem?.thumbnailUrl]);
    }

    return meal ? toPublicMeal(meal) : null;
  }

  async delete(id: string): Promise<boolean> {
    const meal = await this.mealRepository.findById(id);

    if (!meal) {
      return false;
    }

    await this.mealRepository.delete(id);
    await removeUploadedFiles([meal.imagem?.url, meal.imagem?.thumbnailUrl]);

    return true;
  }
}
