import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import {
  createContent,
  createDiary,
  createObservation,
  createTask,
  getAcademicProfileSummary,
  getAcademicSubject,
  listAcademicSubjects,
  listAttendance,
  listContents,
  listDiaries,
  listSubmissions,
  listTasks,
  reviewSubmission,
  saveAttendance,
  submitTask,
  updateTask
} from '../controller/academic.controller';
import { academicUpload } from '../middlewares/academic-upload.middleware';

const router = Router();
const teacherOrAdmin = authorizeRoles(Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR);

router.get('/subjects', authenticate, listAcademicSubjects);
router.get('/subjects/:id', authenticate, getAcademicSubject);
router.get('/profile-summary', authenticate, getAcademicProfileSummary);
router.get('/attendance', authenticate, teacherOrAdmin, listAttendance);
router.put('/attendance', authenticate, teacherOrAdmin, saveAttendance);
router.get('/contents', authenticate, listContents);
router.post('/contents', authenticate, teacherOrAdmin, academicUpload.array('arquivos', 5), createContent);
router.get('/tasks', authenticate, listTasks);
router.post('/tasks', authenticate, teacherOrAdmin, academicUpload.single('arquivo'), createTask);
router.patch('/tasks/:id', authenticate, teacherOrAdmin, academicUpload.single('arquivo'), updateTask);
router.get('/tasks/:taskId/submissions', authenticate, teacherOrAdmin, listSubmissions);
router.post('/tasks/:taskId/submissions', authenticate, academicUpload.single('arquivo'), submitTask);
router.patch('/submissions/:id', authenticate, teacherOrAdmin, reviewSubmission);
router.get('/diaries', authenticate, teacherOrAdmin, listDiaries);
router.post('/diaries', authenticate, teacherOrAdmin, createDiary);
router.post('/observations', authenticate, teacherOrAdmin, createObservation);

export default router;
