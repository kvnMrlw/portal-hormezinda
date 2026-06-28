import bcrypt from 'bcrypt';

import { AppError } from '../../../middlewares/error.middleware';
import { UserRepository } from '../repository/user.repository';
import { Cargo, type AdminCreateUserData, type AdminUpdateUserData, type PublicUser, type UpdateProfileData } from '../types/user.types';
import type { UserDocument } from '../models/user.model';
import { canViewRole } from '../../auth/permissions/roles';

const PASSWORD_SALT_ROUNDS = 10;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

type UpdateProfileInput = Omit<UpdateProfileData, 'senha'> & {
  senhaAtual?: string;
  novaSenha?: string;
  confirmarSenha?: string;
};

function passwordMatches(inputPassword: string, storedPassword: string): Promise<boolean> | boolean {
  return BCRYPT_HASH_REGEX.test(storedPassword) ? bcrypt.compare(inputPassword, storedPassword) : inputPassword === storedPassword;
}

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
    sexo: user.sexo,
    materia: user.materia,
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

  async adminListUsers(): Promise<PublicUser[]> {
    const users = await this.userRepository.listAll();

    return users.map(toPublicUser);
  }

  async adminCreateUser(data: AdminCreateUserData): Promise<PublicUser> {
    const usuario = data.usuario.trim().toLowerCase();
    const existingUser = await this.userRepository.findByUsuario(usuario);

    if (existingUser) {
      throw new AppError('Usuario ja cadastrado', 409);
    }

    const user = await this.userRepository.create({
      ...data,
      usuario,
      senha: await bcrypt.hash(data.senha, PASSWORD_SALT_ROUNDS),
      materia: data.cargo === Cargo.PROFESSOR ? data.materia ?? '' : '',
      turma: data.cargo === Cargo.ALUNO || data.cargo === Cargo.GREMIO ? data.turma : undefined,
      turno: data.cargo === Cargo.ALUNO || data.cargo === Cargo.GREMIO ? data.turno : undefined
    });

    return toPublicUser(user);
  }

  async adminUpdateUser(id: string, data: AdminUpdateUserData): Promise<PublicUser | null> {
    const currentUser = await this.userRepository.findById(id);

    if (!currentUser) {
      return null;
    }

    const nextData: AdminUpdateUserData = { ...data };

    if (nextData.usuario) {
      nextData.usuario = nextData.usuario.trim().toLowerCase();
      const existingUser = await this.userRepository.findByUsuario(nextData.usuario);

      if (existingUser && existingUser.id !== id) {
        throw new AppError('Usuario ja cadastrado', 409);
      }
    }

    if (nextData.senha) {
      nextData.senha = await bcrypt.hash(nextData.senha, PASSWORD_SALT_ROUNDS);
    }

    const nextRole = nextData.cargo ?? currentUser.cargo;

    if (nextRole !== Cargo.PROFESSOR) {
      nextData.materia = '';
    }

    if (nextRole !== Cargo.ALUNO && nextRole !== Cargo.GREMIO) {
      nextData.turma = undefined;
      nextData.turno = undefined;
    }

    const user = await this.userRepository.adminUpdate(id, nextData);

    return user ? toPublicUser(user) : null;
  }

  async adminDeleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return false;
    }

    await this.userRepository.delete(id);

    return true;
  }

  async promoteStudentToGremio(id: string): Promise<PublicUser | null> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return null;
    }

    if (user.cargo !== Cargo.ALUNO) {
      throw new AppError('Somente alunos podem ser promovidos para o Gremio', 400);
    }

    const updatedUser = await this.userRepository.adminUpdate(id, { cargo: Cargo.GREMIO });

    return updatedUser ? toPublicUser(updatedUser) : null;
  }

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

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<PublicUser | null> {
    const { confirmarSenha, novaSenha, senhaAtual, ...profileData } = data;
    const nextData: UpdateProfileData = { ...profileData };
    const wantsPasswordChange = Boolean(senhaAtual || novaSenha || confirmarSenha);

    if (wantsPasswordChange) {
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        throw new AppError('Preencha todos os campos de senha', 400);
      }

      if (novaSenha !== confirmarSenha) {
        throw new AppError('As senhas nao conferem', 400);
      }

      const userWithPassword = await this.userRepository.findByIdWithPassword(userId);

      if (!userWithPassword) {
        return null;
      }

      const currentPasswordMatches = await passwordMatches(senhaAtual, userWithPassword.senha);

      if (!currentPasswordMatches) {
        throw new AppError('Senha atual invalida', 400);
      }

      nextData.senha = await bcrypt.hash(novaSenha, PASSWORD_SALT_ROUNDS);
    }

    const user = await this.userRepository.updateProfile(userId, nextData);

    return user ? toPublicUser(user) : null;
  }
}
