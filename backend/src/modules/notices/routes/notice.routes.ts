import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { authorizeRoles } from '../../auth/middlewares/rbac.middleware';
import { Cargo } from '../../users/types/user.types';
import { createNotice, deleteNotice, listNotices, updateNotice } from '../controller/notice.controller';
import { noticeUpload } from '../middlewares/notice-upload.middleware';

const router = Router();

router.get('/', authenticate, listNotices);
router.post('/', authenticate, authorizeRoles(Cargo.ADMIN), noticeUpload.array('anexos', 6), createNotice);
router.patch('/:id', authenticate, authorizeRoles(Cargo.ADMIN), noticeUpload.array('anexos', 6), updateNotice);
router.delete('/:id', authenticate, authorizeRoles(Cargo.ADMIN), deleteNotice);

export default router;
