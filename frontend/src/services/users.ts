import { api } from './api';
import type { AdminUserPayload, ApiResponse, Pagination, ProfileUpdatePayload, User } from '../types/auth';
import type { FeedPost, FeedStory } from '../types/feed';

type ListPeopleParams = {
  limit?: number;
  page?: number;
  search?: string;
};

export type PeopleResponse = {
  paginacao: Pagination;
  usuarios: User[];
};

export type PublicProfileResponse = {
  estatisticas: {
    curtidasRecebidas: number;
    publicacoes: number;
  };
  paginacaoPublicacoes: Pagination;
  publicacoes: FeedPost[];
  stories: FeedStory[];
  usuario: User;
};

export async function listUsers(): Promise<User[]> {
  const response = await api.get<ApiResponse<{ usuarios: User[] }>>('/users');

  return response.data.data.usuarios;
}

export async function listAdminUsers(): Promise<User[]> {
  const response = await api.get<ApiResponse<{ usuarios: User[] }>>('/users/admin');

  return response.data.data.usuarios;
}

export async function listPeople({ limit = 18, page = 1, search = '' }: ListPeopleParams = {}): Promise<PeopleResponse> {
  const response = await api.get<ApiResponse<PeopleResponse>>('/users/people', {
    params: {
      limit,
      page,
      search: search || undefined
    }
  });

  return response.data.data;
}

export async function getPublicProfile(id: string, { postsLimit = 12, postsPage = 1 } = {}): Promise<PublicProfileResponse> {
  const response = await api.get<ApiResponse<PublicProfileResponse>>(`/users/people/${id}/profile`, {
    params: {
      postsLimit,
      postsPage
    }
  });

  return response.data.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<ApiResponse<{ usuario: User }>>(`/users/${id}`);

  return response.data.data.usuario;
}

function toFormData(payload: ProfileUpdatePayload): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  return formData;
}

function adminUserToFormData(payload: AdminUserPayload): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });

  return formData;
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<User> {
  const response = await api.patch<ApiResponse<{ usuario: User }>>('/users/me/profile', toFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.usuario;
}

export async function createAdminUser(payload: AdminUserPayload): Promise<User> {
  const response = await api.post<ApiResponse<{ usuario: User }>>('/users/admin', adminUserToFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.usuario;
}

export async function updateAdminUser(id: string, payload: AdminUserPayload): Promise<User> {
  const response = await api.patch<ApiResponse<{ usuario: User }>>(`/users/admin/${id}`, adminUserToFormData(payload), {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data.data.usuario;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/users/admin/${id}`);
}

export async function promoteUserToGremio(id: string): Promise<User> {
  const response = await api.patch<ApiResponse<{ usuario: User }>>(`/users/admin/${id}/promote-gremio`);

  return response.data.data.usuario;
}
