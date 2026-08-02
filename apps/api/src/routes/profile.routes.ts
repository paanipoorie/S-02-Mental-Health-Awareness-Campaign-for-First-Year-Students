import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/index.js';
import { profileController } from '../controllers/profile.controller.js';

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.get('/:anonymousIdentityId', profileController.getAnonymousProfile);

export default router;
