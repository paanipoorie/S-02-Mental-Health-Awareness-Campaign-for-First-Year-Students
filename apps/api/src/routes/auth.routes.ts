import { Router } from 'express';
import { authMiddleware, authRateLimiter } from '../middlewares/index.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/index.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authController } from '../controllers/auth.controller.js';
import type { ZodTypeAny } from 'zod';

const router: Router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema as ZodTypeAny),
  authController.register
);
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema as ZodTypeAny),
  authController.login
);
router.post('/refresh', validateBody(refreshTokenSchema as ZodTypeAny), authController.refresh);
router.post('/logout', validateBody(logoutSchema as ZodTypeAny), authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
