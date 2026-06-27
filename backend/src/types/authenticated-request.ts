import type { Request } from 'express';

import type { PublicUser } from '../services/auth.service';

// Tipo usado por rotas que precisam do usuario autenticado.
export type AuthenticatedRequest = Request & {
  user?: PublicUser;
};
