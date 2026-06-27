import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { Cargo, type UserDocument } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import type { LoginInput, RegisterInput } from '../validators/auth.validator';

const PASSWORD_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '1d';

export type PublicUser = {
  id: string;
  nomeCompleto: string;
  usuario: string;
  dataNascimento: Date;
  turno: string;
  turma: string;
  cargo: Cargo;
  fotoPerfil: string;
  bio: string;
  redeSocial: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type AuthResult = {
  token: string;
  usuario: PublicUser;
};

export type JwtPayload = {
  sub: string;
  usuario: string;
  cargo: Cargo;
};

const userRepository = new UserRepository();

function createToken(user: UserDocument): string {
  return jwt.sign(
    {
      sub: user.id,
      usuario: user.usuario,
      cargo: user.cargo
    },
    env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

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

export function hasCargo(userCargo: Cargo, allowedCargos: Cargo[]): boolean {
  return allowedCargos.includes(userCargo);
}

// Regras de negocio para cadastro, login e usuario autenticado.
export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await userRepository.findByUsuario(input.usuario);

    if (existingUser) {
      throw new AppError('Usuario ja cadastrado', 409);
    }

    const senha = await bcrypt.hash(input.senha, PASSWORD_SALT_ROUNDS);
    const user = await userRepository.create({
      nomeCompleto: input.nomeCompleto,
      usuario: input.usuario,
      senha,
      dataNascimento: input.dataNascimento,
      turno: input.turno,
      turma: input.turma,
      cargo: Cargo.ALUNO,
      fotoPerfil: '',
      bio: '',
      redeSocial: '',
      ativo: true
    });

    return {
      token: createToken(user),
      usuario: toPublicUser(user)
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByUsuarioWithPassword(input.usuario);

    if (!user || !user.ativo) {
      throw new AppError('Credenciais invalidas', 401);
    }

    const passwordMatches = await bcrypt.compare(input.senha, user.senha);

    if (!passwordMatches) {
      throw new AppError('Credenciais invalidas', 401);
    }

    return {
      token: createToken(user),
      usuario: toPublicUser(user)
    };
  }

  async getAuthenticatedUser(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);

    if (!user || !user.ativo) {
      throw new AppError('Usuario autenticado nao encontrado', 401);
    }

    return toPublicUser(user);
  }
}
