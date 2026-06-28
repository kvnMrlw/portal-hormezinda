import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import { createCourse, deleteCourse, listCourses, updateCourse } from '../controller/course.controller';
import { courseUpload } from '../middlewares/course-upload.middleware';

const router = Router();

router.get('/', authenticate, listCourses);
router.post(
  '/',
  authenticate,
  authorizeRoles(Cargo.ADMIN),
  courseUpload.fields([
    { maxCount: 1, name: 'capa' },
    { maxCount: 12, name: 'arquivos' }
  ]),
  createCourse
);
router.patch(
  '/:id',
  authenticate,
  authorizeRoles(Cargo.ADMIN),
  courseUpload.fields([
    { maxCount: 1, name: 'capa' },
    { maxCount: 12, name: 'arquivos' }
  ]),
  updateCourse
);
router.delete('/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteCourse);

export default router;
