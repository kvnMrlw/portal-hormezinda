import { UserModel, type UserDocument } from '../models/user.model';
import { Cargo, type CreateUserData, type UpdateProfileData } from '../types/user.types';

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

  async listActive({ includeAdmins = false }: { includeAdmins?: boolean } = {}): Promise<UserDocument[]> {
    return UserModel.find({
      ativo: true,
      ...(includeAdmins ? {} : { cargo: { $ne: Cargo.ADMIN } })
    }).sort({ nomeCompleto: 1 });
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
