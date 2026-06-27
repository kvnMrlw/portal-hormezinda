import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../../../config/env';
import { AppError } from '../../../middlewares/error.middleware';
import { AuthRepository } from '../repository/auth.repository';
import type { AuthResult, JwtPayload } from '../types/auth.types';
import type { LoginInput, RegisterInput } from '../validation/auth.validation';
import { Cargo, type PublicUser } from '../../users/types/user.types';
import type { UserDocument } from '../../users/models/user.model';
import { toPublicUser } from '../../users/service/user.service';

const PASSWORD_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '1d';

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

export function hasCargo(userCargo: Cargo, allowedCargos: Cargo[]): boolean {
  return allowedCargos.includes(userCargo);
}

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await this.authRepository.findByUsuario(input.usuario);

    if (existingUser) {
      throw new AppError('Usuario ja cadastrado', 409);
    }

    const senha = await bcrypt.hash(input.senha, PASSWORD_SALT_ROUNDS);
    const user = await this.authRepository.create({
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
    const user = await this.authRepository.findByUsuarioWithPassword(input.usuario);

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
    const user = await this.authRepository.findById(userId);

    if (!user || !user.ativo) {
      throw new AppError('Usuario autenticado nao encontrado', 401);
    }

    return toPublicUser(user);
  }
}

export type { JwtPayload };
