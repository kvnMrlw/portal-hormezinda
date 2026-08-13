import { BirthdayMessageModel, type BirthdayMessageDocument } from '../models/birthday-message.model';
import type { BirthdayMessageText } from '../types/social.types';

export class SocialRepository {
  async createBirthdayMessage(authorId: string, birthdayUserId: string, mensagem: BirthdayMessageText): Promise<BirthdayMessageDocument> {
    const message = await BirthdayMessageModel.create({
      aniversariante: birthdayUserId,
      autor: authorId,
      mensagem
    });

    return message.populate(['autor', 'aniversariante']);
  }

  async deleteByUser(userId: string): Promise<void> {
    await BirthdayMessageModel.deleteMany({ $or: [{ autor: userId }, { aniversariante: userId }] });
  }
}
