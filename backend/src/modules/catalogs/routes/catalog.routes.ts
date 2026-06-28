import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import {
  createClassGroup,
  createRoom,
  createSubject,
  deleteClassGroup,
  deleteRoom,
  deleteSubject,
  listCatalogs,
  updateClassGroup,
  updateRoom,
  updateSubject
} from '../controller/catalog.controller';

const router = Router();

router.get('/', authenticate, listCatalogs);
router.post('/classes', authenticate, authorizeRoles(Cargo.ADMIN), createClassGroup);
router.patch('/classes/:id', authenticate, authorizeRoles(Cargo.ADMIN), updateClassGroup);
router.delete('/classes/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteClassGroup);
router.post('/subjects', authenticate, authorizeRoles(Cargo.ADMIN), createSubject);
router.patch('/subjects/:id', authenticate, authorizeRoles(Cargo.ADMIN), updateSubject);
router.delete('/subjects/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteSubject);
router.post('/rooms', authenticate, authorizeRoles(Cargo.ADMIN), createRoom);
router.patch('/rooms/:id', authenticate, authorizeRoles(Cargo.ADMIN), updateRoom);
router.delete('/rooms/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteRoom);

export default router;
