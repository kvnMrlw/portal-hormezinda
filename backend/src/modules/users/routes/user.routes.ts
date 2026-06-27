import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { getUserById, listUsers, updateCurrentUserProfile } from '../controller/user.controller';

const router = Router();

router.get('/', authenticate, listUsers);
router.patch('/me/profile', authenticate, updateCurrentUserProfile);
router.get('/:id', authenticate, getUserById);

export default router;
