import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { getUserById, listUsers, updateCurrentUserProfile } from '../controller/user.controller';
import { profileUpload } from '../middlewares/profile-upload.middleware';

const router = Router();

router.get('/', authenticate, listUsers);
router.patch(
  '/me/profile',
  authenticate,
  profileUpload.fields([
    { name: 'fotoPerfil', maxCount: 1 },
    { name: 'bannerPerfil', maxCount: 1 }
  ]),
  updateCurrentUserProfile
);
router.get('/:id', authenticate, getUserById);

export default router;
