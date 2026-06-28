import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { Idea, IdeaAdminPayload, IdeaFilters, IdeaPayload, IdeaResponse } from '../types/ideas';
import type { ReactionEmoji } from '../types/feed';

function cleanFilters(filters: IdeaFilters): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
    if (value) params[key] = String(value);

    return params;
  }, {});
}

function toFormData(payload: Partial<IdeaPayload>): FormData {
  const formData = new FormData();

  if (payload.titulo !== undefined) formData.append('titulo', payload.titulo);
  if (payload.descricao !== undefined) formData.append('descricao', payload.descricao);
  if (payload.categoria !== undefined) formData.append('categoria', payload.categoria);
  if (payload.imagem) formData.append('imagem', payload.imagem);

  return formData;
}

export async function listIdeas(filters: IdeaFilters = {}): Promise<IdeaResponse> {
  const response = await api.get<ApiResponse<IdeaResponse>>('/ideas', {
    params: cleanFilters(filters)
  });

  return response.data.data;
}

export async function listUserIdeas(userId: string): Promise<Idea[]> {
  const response = await api.get<ApiResponse<{ ideias: Idea[] }>>(`/ideas/users/${userId}`);

  return response.data.data.ideias;
}

export async function createIdea(payload: IdeaPayload): Promise<Idea> {
  const response = await api.post<ApiResponse<{ ideia: Idea }>>('/ideas', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.ideia;
}

export async function updateIdea(id: string, payload: Partial<IdeaPayload>): Promise<Idea> {
  const response = await api.patch<ApiResponse<{ ideia: Idea }>>(`/ideas/${id}`, toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.ideia;
}

export async function updateIdeaAdmin(id: string, payload: IdeaAdminPayload): Promise<Idea> {
  const response = await api.patch<ApiResponse<{ ideia: Idea }>>(`/ideas/${id}/admin`, payload);

  return response.data.data.ideia;
}

export async function toggleIdeaSupport(id: string): Promise<Idea> {
  const response = await api.post<ApiResponse<{ ideia: Idea }>>(`/ideas/${id}/support`);

  return response.data.data.ideia;
}

export async function reactToIdea(id: string, emoji: ReactionEmoji): Promise<Idea> {
  const response = await api.post<ApiResponse<{ ideia: Idea }>>(`/ideas/${id}/reactions`, { emoji });

  return response.data.data.ideia;
}

export async function deleteIdea(id: string): Promise<void> {
  await api.delete(`/ideas/${id}`);
}
