import { Types } from 'mongoose';

import { AppError } from '../../../middlewares/error.middleware';
import { NotificationService } from '../../notifications/service/notification.service';
import { NotificationEntityType, NotificationType } from '../../notifications/types/notification.types';
import type { UserDocument } from '../../users/models/user.model';
import { UserRepository } from '../../users/repository/user.repository';
import { toPublicUser } from '../../users/service/user.service';
import type { PublicUser } from '../../users/types/user.types';
import { SocialRepository } from '../repository/social.repository';
import { birthdayMessages, type BirthdayMessage, type BirthdayMessageText } from '../types/social.types';
import type { BirthdayMessageDocument } from '../models/birthday-message.model';

function isUserDocument(user: BirthdayMessage['autor']): user is UserDocument {
  return Boolean(user && typeof user === 'object' && !(user instanceof Types.ObjectId) && 'nomeCompleto' in user);
}

function nextDayStart(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);

  return date;
}

function todayMonthDay(): { day: number; month: number } {
  const today = new Date();

  return {
    day: today.getDate(),
    month: today.getMonth() + 1
  };
}

function toPublicBirthdayMessage(message: BirthdayMessageDocument) {
  if (!isUserDocument(message.autor) || !isUserDocument(message.aniversariante)) {
    throw new AppError('Mensagem de aniversario nao carregada', 500);
  }

  return {
    id: message.id,
    aniversariante: toPublicUser(message.aniversariante),
    autor: toPublicUser(message.autor),
    mensagem: message.mensagem,
    criadaEm: message.criadaEm
  };
}

export class SocialService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly notificationService = new NotificationService(),
    private readonly socialRepository = new SocialRepository()
  ) {}

  async getTodayBirthdays(viewer: PublicUser) {
    const { day, month } = todayMonthDay();
    const birthdayUsers = await this.userRepository.listBirthdayUsers(month, day);

    await this.ensureBirthdayNotifications(birthdayUsers);

    return {
      aniversariantes: birthdayUsers.map(toPublicUser),
      mensagensDisponiveis: birthdayMessages,
      meuAniversario: birthdayUsers.some((user) => user.id === viewer.id)
    };
  }

  async sendBirthdayMessage(author: PublicUser, birthdayUserId: string, mensagem: BirthdayMessageText) {
    if (!birthdayMessages.includes(mensagem)) {
      throw new AppError('Mensagem de aniversario invalida', 400);
    }

    const { day, month } = todayMonthDay();
    const birthdayUsers = await this.userRepository.listBirthdayUsers(month, day);
    const birthdayUser = birthdayUsers.find((user) => user.id === birthdayUserId);

    if (!birthdayUser) {
      throw new AppError('Este usuario nao faz aniversario hoje', 400);
    }

    const message = await this.socialRepository.createBirthdayMessage(author.id, birthdayUserId, mensagem);

    await this.notificationService.notifyUsers([birthdayUserId], {
      autorId: author.id,
      descricao: `${author.nomeCompleto}: ${mensagem}`,
      entidadeId: message.id,
      entidadeTipo: NotificationEntityType.BIRTHDAY_MESSAGE,
      tipo: NotificationType.BIRTHDAY_MESSAGE,
      titulo: 'Nova mensagem de aniversario',
      url: `/pessoas/${birthdayUserId}`
    });

    return toPublicBirthdayMessage(message);
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.socialRepository.deleteByUser(userId);
  }

  private async ensureBirthdayNotifications(birthdayUsers: UserDocument[]): Promise<void> {
    if (!birthdayUsers.length) return;

    const recipients = await this.userRepository.listBirthdayNotificationRecipients();
    const expirationDate = nextDayStart();

    await Promise.all(
      birthdayUsers.flatMap((birthdayUser) =>
        recipients.map(async (recipient) => {
          const alreadyExists = await this.notificationService.exists(recipient.id, birthdayUser.id, NotificationType.BIRTHDAY_TODAY);

          if (alreadyExists) return;

          await this.notificationService.create({
            descricao: `🎂 Hoje é aniversario de ${birthdayUser.nomeCompleto}.`,
            entidadeId: birthdayUser.id,
            entidadeTipo: NotificationEntityType.BIRTHDAY,
            expiraEm: expirationDate,
            tipo: NotificationType.BIRTHDAY_TODAY,
            titulo: 'Aniversariante do dia',
            url: `/pessoas/${birthdayUser.id}`,
            usuarioId: recipient.id
          }).catch(() => undefined);
        })
      )
    );
  }
}
