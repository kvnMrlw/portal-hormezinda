import { Router } from 'express';

import { usersHealth } from '../controller/user.controller';

const router = Router();

router.get('/health', usersHealth);

export default router;
