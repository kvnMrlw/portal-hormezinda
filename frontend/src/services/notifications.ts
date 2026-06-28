import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { Notification, NotificationResponse } from '../types/notifications';

export async function listNotifications(params: { limit?: number; page?: number; unreadOnly?: boolean } = {}): Promise<NotificationResponse> {
  const response = await api.get<ApiResponse<NotificationResponse>>('/notifications', { params });

  return response.data.data;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await api.patch<ApiResponse<{ notificacao: Notification }>>(`/notifications/${id}/read`);

  return response.data.data.notificacao;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
