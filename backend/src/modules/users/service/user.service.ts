import { UserRepository } from '../repository/user.repository';
import type { PublicUser } from '../types/user.types';
import type { UserDocument } from '../models/user.model';

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id,
    nomeCompleto: user.nomeCompleto,
    usuario: user.usuario,
    dataNascimento: user.dataNascimento,
    turno: user.turno,
    turma: user.turma,
    cargo: user.cargo,
    fotoPerfil: user.fotoPerfil,
    bio: user.bio,
    redeSocial: user.redeSocial,
    ativo: user.ativo,
    criadoEm: user.criadoEm,
    atualizadoEm: user.atualizadoEm
  };
}

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async findPublicById(id: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    return user ? toPublicUser(user) : null;
  }
}
