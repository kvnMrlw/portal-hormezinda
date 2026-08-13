import type { User } from './auth';

export const birthdayMessages = [
  '🎉 Feliz aniversário!',
  '🎂 Muitas felicidades!',
  '🥳 Parabéns!',
  '🎈 Tudo de bom!',
  '🎊 Tenha um excelente dia!'
] as const;

export type BirthdayMessageText = (typeof birthdayMessages)[number];

export type TodayBirthdays = {
  aniversariantes: User[];
  mensagensDisponiveis: BirthdayMessageText[];
  meuAniversario: boolean;
};
