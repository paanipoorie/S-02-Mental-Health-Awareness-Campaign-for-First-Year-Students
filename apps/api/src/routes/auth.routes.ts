import { Router } from 'express';
import { authMiddleware, authRateLimiter } from '../middlewares/index.js';
import {
  sendOTPSchemaExport,
  verifyOTPSchemaExport,
  loginBodySchemaExport,
  refreshTokenBodySchemaExport,
  logoutBodySchemaExport,
} from '../validators/auth.validator.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authController } from '../controllers/auth.controller.js';

const router: Router = Router();

router.post(
  '/send-otp',
  authRateLimiter,
  validateBody(sendOTPSchemaExport),
  authController.sendOTP
);

router.post(
  '/verify-otp',
  authRateLimiter,
  validateBody(verifyOTPSchemaExport),
  authController.verifyOTP
);

router.post('/login', authRateLimiter, validateBody(loginBodySchemaExport), authController.login);
router.post('/refresh', validateBody(refreshTokenBodySchemaExport), authController.refresh);
router.post('/logout', validateBody(logoutBodySchemaExport), authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
