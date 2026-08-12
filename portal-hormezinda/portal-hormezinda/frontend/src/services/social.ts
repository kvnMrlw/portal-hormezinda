import { api } from './api';
import type { ApiResponse } from '../types/auth';
import type { BirthdayMessageText, TodayBirthdays } from '../types/social';

export async function getTodayBirthdays(): Promise<TodayBirthdays> {
  const response = await api.get<ApiResponse<TodayBirthdays>>('/social/birthdays/today');

  return response.data.data;
}

export async function sendBirthdayMessage(userId: string, mensagem: BirthdayMessageText): Promise<void> {
  await api.post(`/social/birthdays/${userId}/messages`, { mensagem });
}
