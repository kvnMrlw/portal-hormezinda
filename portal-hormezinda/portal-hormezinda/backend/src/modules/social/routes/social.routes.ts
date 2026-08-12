import { Router } from 'express';

import { authenticate } from '../../auth/middlewares/auth.middleware';
import { getTodayBirthdays, sendBirthdayMessage } from '../controller/social.controller';

const router = Router();

router.get('/birthdays/today', authenticate, getTodayBirthdays);
router.post('/birthdays/:id/messages', authenticate, sendBirthdayMessage);

export default router;
