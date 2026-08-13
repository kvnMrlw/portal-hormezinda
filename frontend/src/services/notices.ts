import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { Notice, NoticeFilters, NoticePayload } from '../types/notices';

function appendIfDefined(
  formData: FormData,
  key: string,
  value: string | boolean | null | undefined,
  options: { allowEmpty?: boolean } = {}
): void {
  if (value === undefined || value === null || (!options.allowEmpty && value === '')) {
    return;
  }

  formData.append(key, String(value));
}

function buildNoticeFormData(payload: NoticePayload): FormData {
  const formData = new FormData();

  appendIfDefined(formData, 'titulo', payload.titulo);
  appendIfDefined(formData, 'descricao', payload.descricao);
  appendIfDefined(formData, 'categoria', payload.categoria);
  appendIfDefined(formData, 'prioridade', payload.prioridade);
  appendIfDefined(formData, 'fixado', payload.fixado);
  appendIfDefined(formData, 'ativo', payload.ativo);
  appendIfDefined(formData, 'dataInicio', payload.dataInicio);
  appendIfDefined(formData, 'dataFim', payload.dataFim, { allowEmpty: true });

  if (payload.removerAnexos?.length) {
    formData.append('removerAnexos', JSON.stringify(payload.removerAnexos));
  }

  payload.anexos?.forEach((file) => formData.append('anexos', file));

  return formData;
}

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }

  const apiBaseUrl = api.defaults.baseURL ?? '';
  const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

  return `${uploadBaseUrl}${path}`;
}

export async function listNotices(filters: NoticeFilters): Promise<Notice[]> {
  const params: Record<string, string | boolean> = {};

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.categoria && filters.categoria !== 'TODAS') {
    params.categoria = filters.categoria;
  }

  if (filters.prioridade && filters.prioridade !== 'TODAS') {
    params.prioridade = filters.prioridade;
  }

  if (filters.status === 'FIXADOS') {
    params.fixado = true;
  }

  if (filters.status === 'ATIVOS') {
    params.ativo = true;
    params.expirado = false;
  }

  if (filters.status === 'EXPIRADOS') {
    params.expirado = true;
  }

  const response = await api.get<ApiResponse<{ avisos: Notice[] }>>('/notices', { params });

  return response.data.data.avisos;
}

export async function createNotice(payload: NoticePayload): Promise<Notice> {
  const response = await api.post<ApiResponse<{ aviso: Notice }>>('/notices', buildNoticeFormData(payload));

  return response.data.data.aviso;
}

export async function updateNotice(id: string, payload: NoticePayload): Promise<Notice> {
  const response = await api.patch<ApiResponse<{ aviso: Notice }>>(`/notices/${id}`, buildNoticeFormData(payload));

  return response.data.data.aviso;
}

export async function deleteNotice(id: string): Promise<void> {
  await api.delete(`/notices/${id}`);
}
