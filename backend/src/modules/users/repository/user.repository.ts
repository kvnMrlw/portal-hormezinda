import { UserModel, type UserDocument } from '../models/user.model';
import type { CreateUserData } from '../types/user.types';

export class UserRepository {
  async create(data: CreateUserData): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findByUsuario(usuario: string): Promise<UserDocument | null> {
    return UserModel.findOne({ usuario });
  }

  async findByUsuarioWithPassword(usuario: string): Promise<UserDocument | null> {
    return UserModel.findOne({ usuario }).select('+senha');
  }

  async listActive(): Promise<UserDocument[]> {
    return UserModel.find({ ativo: true }).sort({ nomeCompleto: 1 });
  }
}
