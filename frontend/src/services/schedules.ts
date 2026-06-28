import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { ScheduleEntry, ScheduleFilters, SchedulePayload } from '../types/schedules';

function cleanFilters(filters: ScheduleFilters): Record<string, string> {
  return Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
    if (value) {
      params[key] = String(value);
    }

    return params;
  }, {});
}

export async function listSchedules(filters: ScheduleFilters = {}): Promise<ScheduleEntry[]> {
  const response = await api.get<ApiResponse<{ horarios: ScheduleEntry[] }>>('/schedules', {
    params: cleanFilters(filters)
  });

  return response.data.data.horarios;
}

export async function createSchedule(payload: SchedulePayload): Promise<ScheduleEntry> {
  const response = await api.post<ApiResponse<{ horario: ScheduleEntry }>>('/schedules', payload);

  return response.data.data.horario;
}

export async function updateSchedule(id: string, payload: SchedulePayload): Promise<ScheduleEntry> {
  const response = await api.patch<ApiResponse<{ horario: ScheduleEntry }>>(`/schedules/${id}`, payload);

  return response.data.data.horario;
}

export async function duplicateSchedule(id: string): Promise<ScheduleEntry> {
  const response = await api.post<ApiResponse<{ horario: ScheduleEntry }>>(`/schedules/${id}/duplicate`);

  return response.data.data.horario;
}

export async function deleteSchedule(id: string): Promise<string> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/schedules/${id}`);

  return response.data.data.id;
}

export async function copyWeekSchedules(payload: { destinoTurmaId: string; origemTurmaId: string; sobrescrever?: boolean }): Promise<ScheduleEntry[]> {
  const response = await api.post<ApiResponse<{ horarios: ScheduleEntry[] }>>('/schedules/copy-week', payload);

  return response.data.data.horarios;
}

export async function reorderSchedules(payload: { diaSemana: string; ids: string[]; turmaId: string }): Promise<ScheduleEntry[]> {
  const response = await api.post<ApiResponse<{ horarios: ScheduleEntry[] }>>('/schedules/reorder', payload);

  return response.data.data.horarios;
}
