import { Router } from 'express';

import { login, me, register } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Rotas de autenticacao: cadastro, login e dados do usuario atual.
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
