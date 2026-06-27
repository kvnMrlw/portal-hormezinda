import { UserModel, type User, type UserDocument } from '../models/user.model';

type CreateUserData = Omit<User, 'criadoEm' | 'atualizadoEm'>;

// Isola o acesso ao MongoDB para a entidade User.
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
}
