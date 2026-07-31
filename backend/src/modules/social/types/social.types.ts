import type { Types } from 'mongoose';

import type { UserDocument } from '../../users/models/user.model';
import type { PublicUser } from '../../users/types/user.types';

export const birthdayMessages = [
  '🎉 Feliz aniversário!',
  '🎂 Muitas felicidades!',
  '🥳 Parabéns!',
  '🎈 Tudo de bom!',
  '🎊 Tenha um excelente dia!'
] as const;

export type BirthdayMessageText = (typeof birthdayMessages)[number];

export type BirthdayMessage = {
  aniversariante: Types.ObjectId | UserDocument;
  autor: Types.ObjectId | UserDocument;
  mensagem: BirthdayMessageText;
  criadaEm: Date;
  atualizadaEm: Date;
};

export type PublicBirthdayMessage = {
  id: string;
  aniversariante: PublicUser;
  autor: PublicUser;
  mensagem: BirthdayMessageText;
  criadaEm: Date;
};
