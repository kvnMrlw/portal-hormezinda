import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { Course, CourseFilters, CoursePayload } from '../types/courses';

function cleanFilters(filters: CourseFilters): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
    if (value) {
      params[key] = String(value);
    }

    return params;
  }, {});
}

function toFormData(payload: CoursePayload): FormData {
  const formData = new FormData();

  formData.append('titulo', payload.titulo);
  formData.append('descricao', payload.descricao);
  formData.append('categoria', payload.categoria);
  formData.append('professorId', payload.professorId);
  formData.append('status', payload.status);
  formData.append('link', payload.link ?? '');
  formData.append('conteudos', JSON.stringify(payload.conteudos));

  if (payload.capa) {
    formData.append('capa', payload.capa);
  }

  payload.arquivos?.forEach((file) => formData.append('arquivos', file));

  return formData;
}

export async function listCourses(filters: CourseFilters = {}): Promise<Course[]> {
  const response = await api.get<ApiResponse<{ cursos: Course[] }>>('/courses', {
    params: cleanFilters(filters)
  });

  return response.data.data.cursos;
}

export async function createCourse(payload: CoursePayload): Promise<Course> {
  const response = await api.post<ApiResponse<{ curso: Course }>>('/courses', toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.curso;
}

export async function updateCourse(id: string, payload: CoursePayload): Promise<Course> {
  const response = await api.patch<ApiResponse<{ curso: Course }>>(`/courses/${id}`, toFormData(payload), {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.data.curso;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}
