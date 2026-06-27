import type { Request } from 'express';

import type { Cargo, PublicUser } from '../../users/types/user.types';

export type AuthResult = {
  token: string;
  usuario: PublicUser;
};

export type JwtPayload = {
  sub: string;
  usuario: string;
  cargo: Cargo;
};

export type AuthenticatedRequest = Request & {
  user?: PublicUser;
};
