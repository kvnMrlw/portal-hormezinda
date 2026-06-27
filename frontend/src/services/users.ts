import { api } from './api';
import type { ApiResponse, ProfileUpdatePayload, User } from '../types/auth';

export async function listUsers(): Promise<User[]> {
  const response = await api.get<ApiResponse<{ usuarios: User[] }>>('/users');

  return response.data.data.usuarios;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<ApiResponse<{ usuario: User }>>(`/users/${id}`);

  return response.data.data.usuario;
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<User> {
  const response = await api.patch<ApiResponse<{ usuario: User }>>('/users/me/profile', payload);

  return response.data.data.usuario;
}
