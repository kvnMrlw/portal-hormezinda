import { Router } from 'express';

import {
  forgotPassword,
  login,
  me,
  passwordRecoveryInfo,
  refresh,
  register,
  resendVerificationCode,
  resetPassword,
  verifyEmailCode,
  verifyPasswordResetCode
} from '../controller/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

router.post('/email/send-verification', resendVerificationCode);
router.post('/email/verify', verifyEmailCode);

router.post('/password/recovery-info', passwordRecoveryInfo);
router.post('/password/forgot', forgotPassword);
router.post('/password/verify-code', verifyPasswordResetCode);
router.post('/password/reset', resetPassword);

router.get('/me', authenticate, me);

export default router;
