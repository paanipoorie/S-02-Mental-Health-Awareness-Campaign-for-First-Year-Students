import { Router } from 'express';
import { emotionController } from '../controllers/emotion.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware, requireRole } from '../middlewares/index.js';
import { createEmotionSchema, getTrendsSchema } from '../validators/emotion.validator.js';
import { Role } from '@campus-peer-support/shared-types';

const router: Router = Router();

router.use(authMiddleware);

router.post('/', validate(createEmotionSchema), emotionController.createEmotion);

router.get('/me', emotionController.getMyEmotion);

router.get(
  '/trends',
  requireRole(Role.MENTOR, Role.ADMIN),
  validate(getTrendsSchema),
  emotionController.getTrends
);

export default router;
