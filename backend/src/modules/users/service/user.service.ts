import { UserRepository } from '../repository/user.repository';
import { Cargo, type PublicUser, type UpdateProfileData } from '../types/user.types';
import type { UserDocument } from '../models/user.model';
import { canViewRole } from '../../auth/permissions/roles';

export function toPublicUser(user: UserDocument): PublicUser {
  const isAdmin = user.cargo === Cargo.ADMIN;

  return {
    id: user.id,
    nomeCompleto: user.nomeCompleto,
    usuario: user.usuario,
    dataNascimento: isAdmin ? undefined : user.dataNascimento,
    turno: isAdmin ? undefined : user.turno,
    turma: isAdmin ? undefined : user.turma,
    cargo: user.cargo,
    fotoPerfil: user.fotoPerfil,
    bannerPerfil: user.bannerPerfil,
    bio: user.bio,
    redeSocial: user.redeSocial,
    ativo: user.ativo,
    criadoEm: user.criadoEm,
    atualizadoEm: user.atualizadoEm
  };
}

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async findPublicById(id: string, viewer: PublicUser): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user || !canViewRole(viewer.cargo, user.cargo)) {
      return null;
    }

    return toPublicUser(user);
  }

  async listActiveUsers(viewer: PublicUser): Promise<PublicUser[]> {
    const users = await this.userRepository.listActive({ includeAdmins: viewer.cargo === Cargo.ADMIN });

    return users.map(toPublicUser);
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<PublicUser | null> {
    const user = await this.userRepository.updateProfile(userId, data);

    return user ? toPublicUser(user) : null;
  }
}
