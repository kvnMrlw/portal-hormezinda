import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { getUserById, listUsers } from '../controller/user.controller';

const router = Router();

router.get('/', authenticate, listUsers);
router.get('/:id', authenticate, getUserById);

export default router;
