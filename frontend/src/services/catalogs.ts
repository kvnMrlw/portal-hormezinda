import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { CatalogsResponse, ClassGroup, ClassGroupPayload, Room, RoomPayload, Subject, SubjectPayload } from '../types/catalogs';

export async function listCatalogs(): Promise<CatalogsResponse> {
  const response = await api.get<ApiResponse<CatalogsResponse>>('/catalogs');

  return response.data.data;
}

export async function createClassGroup(payload: ClassGroupPayload): Promise<ClassGroup> {
  const response = await api.post<ApiResponse<{ turma: ClassGroup }>>('/catalogs/classes', payload);

  return response.data.data.turma;
}

export async function updateClassGroup(id: string, payload: ClassGroupPayload): Promise<ClassGroup> {
  const response = await api.patch<ApiResponse<{ turma: ClassGroup }>>(`/catalogs/classes/${id}`, payload);

  return response.data.data.turma;
}

export async function deleteClassGroup(id: string): Promise<void> {
  await api.delete(`/catalogs/classes/${id}`);
}

export async function createSubject(payload: SubjectPayload): Promise<Subject> {
  const response = await api.post<ApiResponse<{ disciplina: Subject }>>('/catalogs/subjects', payload);

  return response.data.data.disciplina;
}

export async function updateSubject(id: string, payload: SubjectPayload): Promise<Subject> {
  const response = await api.patch<ApiResponse<{ disciplina: Subject }>>(`/catalogs/subjects/${id}`, payload);

  return response.data.data.disciplina;
}

export async function deleteSubject(id: string): Promise<void> {
  await api.delete(`/catalogs/subjects/${id}`);
}

export async function createRoom(payload: RoomPayload): Promise<Room> {
  const response = await api.post<ApiResponse<{ sala: Room }>>('/catalogs/rooms', payload);

  return response.data.data.sala;
}

export async function updateRoom(id: string, payload: RoomPayload): Promise<Room> {
  const response = await api.patch<ApiResponse<{ sala: Room }>>(`/catalogs/rooms/${id}`, payload);

  return response.data.data.sala;
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/catalogs/rooms/${id}`);
}
