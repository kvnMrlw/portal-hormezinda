import type { Request } from 'express';

import type { Cargo, PublicUser } from '../../users/types/user.types';

export type AuthResult = {
  refreshToken: string;
  token: string;
  usuario: PublicUser;
};

export type JwtPayload = {
  cargo: Cargo;
  sub: string;
  tipo?: 'access' | 'refresh';
  usuario: string;
};

export type AuthenticatedRequest = Request & {
  user?: PublicUser;
};
