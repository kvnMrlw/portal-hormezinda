import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import { createNotice, deleteNotice, listNotices, updateNotice } from '../controller/notice.controller';
import { noticeUpload } from '../middlewares/notice-upload.middleware';

const router = Router();
const noticeManagerRoles = [Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR, Cargo.GREMIO];

router.get('/', authenticate, listNotices);
router.post('/', authenticate, authorizeRoles(...noticeManagerRoles), noticeUpload.array('anexos', 6), createNotice);
router.patch('/:id', authenticate, authorizeRoles(...noticeManagerRoles), noticeUpload.array('anexos', 6), updateNotice);
router.delete('/:id', authenticate, authorizeRoles(...noticeManagerRoles), deleteNotice);

export default router;
