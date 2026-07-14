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

const router: Router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refresh);
router.post('/logout', validateBody(logoutSchema), authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
