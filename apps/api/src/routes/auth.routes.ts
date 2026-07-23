import { Router } from 'express';
import { authMiddleware, authRateLimiter } from '../middlewares/index.js';
import {
  registerBodySchemaExport as registerBodySchema,
  loginBodySchemaExport as loginBodySchema,
  refreshTokenBodySchemaExport as refreshTokenBodySchema,
  logoutBodySchemaExport as logoutBodySchema,
} from '../validators/auth.validator.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authController } from '../controllers/auth.controller.js';

const router: Router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateBody(registerBodySchema),
  authController.register
);
router.post('/login', authRateLimiter, validateBody(loginBodySchema), authController.login);
router.post('/refresh', validateBody(refreshTokenBodySchema), authController.refresh);
router.post('/logout', validateBody(logoutBodySchema), authController.logout);
router.get('/me', authMiddleware, authController.me);

export default router;
