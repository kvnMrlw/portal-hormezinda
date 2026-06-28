import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import {
  copyWeekSchedules,
  createSchedule,
  deleteSchedule,
  duplicateSchedule,
  listSchedules,
  reorderSchedules,
  updateSchedule
} from '../controller/schedule.controller';

const router = Router();

router.get('/', authenticate, listSchedules);
router.post('/copy-week', authenticate, authorizeRoles(Cargo.ADMIN), copyWeekSchedules);
router.post('/reorder', authenticate, authorizeRoles(Cargo.ADMIN), reorderSchedules);
router.post('/', authenticate, authorizeRoles(Cargo.ADMIN), createSchedule);
router.post('/:id/duplicate', authenticate, authorizeRoles(Cargo.ADMIN), duplicateSchedule);
router.patch('/:id', authenticate, authorizeRoles(Cargo.ADMIN), updateSchedule);
router.delete('/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteSchedule);

export default router;
