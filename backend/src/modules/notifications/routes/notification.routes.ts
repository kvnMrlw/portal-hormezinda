import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { listNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../controller/notification.controller';

const router = Router();

router.get('/', authenticate, listNotifications);
router.patch('/read-all', authenticate, markAllNotificationsAsRead);
router.patch('/:id/read', authenticate, markNotificationAsRead);

export default router;
