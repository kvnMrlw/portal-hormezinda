import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../types/user.types';
import {
  adminCreateUser,
  adminDeleteUser,
  adminListUsers,
  adminPromoteUser,
  adminUpdateUser,
  getPublicProfile,
  getUserById,
  listPeople,
  listUsers,
  updateCurrentUserProfile
} from '../controller/user.controller';
import { profileUpload } from '../middlewares/profile-upload.middleware';

const router = Router();

router.get('/', authenticate, listUsers);
router.get('/people', authenticate, listPeople);
router.get('/people/:id/profile', authenticate, getPublicProfile);
router.get('/admin', authenticate, authorizeRoles(Cargo.ADMIN), adminListUsers);
router.post(
  '/admin',
  authenticate,
  authorizeRoles(Cargo.ADMIN),
  profileUpload.fields([
    { name: 'fotoPerfil', maxCount: 1 },
    { name: 'bannerPerfil', maxCount: 1 }
  ]),
  adminCreateUser
);
router.patch(
  '/admin/:id',
  authenticate,
  authorizeRoles(Cargo.ADMIN),
  profileUpload.fields([
    { name: 'fotoPerfil', maxCount: 1 },
    { name: 'bannerPerfil', maxCount: 1 }
  ]),
  adminUpdateUser
);
router.patch('/admin/:id/promote-gremio', authenticate, authorizeRoles(Cargo.ADMIN), adminPromoteUser);
router.delete('/admin/:id', authenticate, authorizeRoles(Cargo.ADMIN), adminDeleteUser);
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
