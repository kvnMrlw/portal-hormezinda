import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { Meal, MealFilters, MealPayload } from '../types/meals';

function buildMealFormData(payload: MealPayload): FormData {
  const formData = new FormData();

  formData.append('nome', payload.nome);
  formData.append('descricao', payload.descricao);
  formData.append('data', payload.data);
  formData.append('categoria', payload.categoria);
  formData.append('observacoes', payload.observacoes ?? '');
  formData.append('ingredientes', JSON.stringify(payload.ingredientes));
  formData.append('alergenos', JSON.stringify(payload.alergenos));
  formData.append('vegetariano', String(payload.vegetariano));
  formData.append('vegano', String(payload.vegano));
  formData.append('semLactose', String(payload.semLactose));
  formData.append('semGluten', String(payload.semGluten));
  formData.append('status', payload.status);

  if (payload.calorias !== '' && payload.calorias !== undefined) {
    formData.append('calorias', String(payload.calorias));
  }

  if (payload.imagem) {
    formData.append('imagem', payload.imagem);
  }

  return formData;
}

function cleanFilters(filters: MealFilters): Record<string, string | boolean> {
  return Object.entries(filters).reduce<Record<string, string | boolean>>((params, [key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = value;
    }

    return params;
  }, {});
}

export async function listMeals(filters: MealFilters = {}): Promise<Meal[]> {
  const response = await api.get<ApiResponse<{ refeicoes: Meal[] }>>('/meals', {
    params: cleanFilters(filters)
  });

  return response.data.data.refeicoes;
}

export async function createMeal(payload: MealPayload): Promise<Meal> {
  const response = await api.post<ApiResponse<{ refeicao: Meal }>>('/meals', buildMealFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.refeicao;
}

export async function updateMeal(id: string, payload: MealPayload): Promise<Meal> {
  const response = await api.patch<ApiResponse<{ refeicao: Meal }>>(`/meals/${id}`, buildMealFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.refeicao;
}

export async function deleteMeal(id: string): Promise<void> {
  await api.delete(`/meals/${id}`);
}
