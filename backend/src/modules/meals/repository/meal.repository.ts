import { MealModel, type MealDocument } from '../models/meal.model';
import { MealStatus, type MealFilters, type MealPayload } from '../types/meal.types';

function buildQuery(filters: MealFilters) {
  const query: Record<string, unknown> = {
    ...(filters.includeHidden ? {} : { status: MealStatus.PUBLISHED }),
    ...(filters.categoria ? { categoria: filters.categoria } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(typeof filters.vegetariano === 'boolean' ? { vegetariano: filters.vegetariano } : {}),
    ...(typeof filters.vegano === 'boolean' ? { vegano: filters.vegano } : {}),
    ...(typeof filters.semLactose === 'boolean' ? { semLactose: filters.semLactose } : {}),
    ...(typeof filters.semGluten === 'boolean' ? { semGluten: filters.semGluten } : {})
  };

  if (filters.dateFrom || filters.dateTo) {
    query.data = {
      ...(filters.dateFrom ? { $gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { $lte: filters.dateTo } : {})
    };
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { nome: { $regex: escaped, $options: 'i' } },
      { ingredientes: { $regex: escaped, $options: 'i' } },
      { categoria: { $regex: escaped, $options: 'i' } }
    ];
  }

  return query;
}

export class MealRepository {
  async list(filters: MealFilters): Promise<MealDocument[]> {
    return MealModel.find(buildQuery(filters)).sort({ data: 1, categoria: 1, nome: 1 });
  }

  async findById(id: string): Promise<MealDocument | null> {
    return MealModel.findById(id);
  }

  async create(data: MealPayload): Promise<MealDocument> {
    return MealModel.create(data);
  }

  async update(id: string, data: Partial<MealPayload>): Promise<MealDocument | null> {
    return MealModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await MealModel.findByIdAndDelete(id);
  }
}
