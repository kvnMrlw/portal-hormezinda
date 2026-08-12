import { removeUploadedFiles } from '../../../utils/imageUpload';
import { Weekday } from '../../schedules/types/schedule.types';
import { MealRepository } from '../repository/meal.repository';
import type { MealFilters, MealImage, MealPayload, PublicMeal } from '../types/meal.types';

function getWeekdayFromDate(date?: Date): Weekday {
  const day = date?.getDay();

  if (day === 2) return Weekday.TUESDAY;
  if (day === 3) return Weekday.WEDNESDAY;
  if (day === 4) return Weekday.THURSDAY;
  if (day === 5) return Weekday.FRIDAY;

  return Weekday.MONDAY;
}

function toPublicMeal(meal: Awaited<ReturnType<MealRepository['findById']>> extends infer T ? NonNullable<T> : never): PublicMeal {
  return {
    id: meal.id,
    atualizadoEm: meal.atualizadoEm,
    categoria: meal.categoria,
    criadoEm: meal.criadoEm,
    data: meal.data,
    descricao: meal.descricao,
    diaSemana: meal.diaSemana ?? getWeekdayFromDate(meal.data),
    imagem: meal.imagem,
    nome: meal.nome,
    status: meal.status
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
