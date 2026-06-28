import { UserModel, type UserDocument } from '../models/user.model';
import { Cargo, type AdminUpdateUserData, type CreateUserData, type UpdateProfileData } from '../types/user.types';

type ListPeopleOptions = {
  includeAdmins?: boolean;
  limit: number;
  page: number;
  search?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function activeUserFilter({ includeAdmins = false, search }: Pick<ListPeopleOptions, 'includeAdmins' | 'search'>) {
  const normalizedSearch = search?.trim();

  return {
    ativo: true,
    ...(includeAdmins ? {} : { cargo: { $ne: Cargo.ADMIN } }),
    ...(normalizedSearch
      ? {
          $or: [
            { nomeCompleto: { $regex: escapeRegex(normalizedSearch), $options: 'i' } },
            { usuario: { $regex: escapeRegex(normalizedSearch), $options: 'i' } }
          ]
        }
      : {})
  };
}

export class UserRepository {
  async create(data: CreateUserData): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).select('+senha');
  }

  async findByUsuario(usuario: string): Promise<UserDocument | null> {
    return UserModel.findOne({ usuario });
  }

  async findByUsuarioWithPassword(usuario: string): Promise<UserDocument | null> {
    return UserModel.findOne({ usuario }).select('+senha');
  }

  async listActive({ includeAdmins = false }: { includeAdmins?: boolean } = {}): Promise<UserDocument[]> {
    return UserModel.find(activeUserFilter({ includeAdmins })).sort({ nomeCompleto: 1 });
  }

  async listPeople({ includeAdmins = false, limit, page, search }: ListPeopleOptions): Promise<UserDocument[]> {
    return UserModel.find(activeUserFilter({ includeAdmins, search }))
      .sort({ nomeCompleto: 1, usuario: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async countPeople({ includeAdmins = false, search }: Pick<ListPeopleOptions, 'includeAdmins' | 'search'>): Promise<number> {
    return UserModel.countDocuments(activeUserFilter({ includeAdmins, search }));
  }

  async listAll(): Promise<UserDocument[]> {
    return UserModel.find().sort({ criadoEm: -1 });
  }

  async adminUpdate(id: string, data: AdminUpdateUserData): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async updatePassword(id: string, senha: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { senha });
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}
