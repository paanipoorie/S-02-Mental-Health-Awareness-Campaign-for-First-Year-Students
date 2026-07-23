import { Router } from 'express';
import { emotionController } from '../controllers/emotion.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { createEmotionSchema, getTrendsSchema } from '../validators/emotion.validator';
import { Role } from '@shared-types/enums';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(createEmotionSchema),
  emotionController.createEmotion
);

router.get(
  '/me',
  emotionController.getMyEmotion
);

router.get(
  '/trends',
  requireRole([Role.MENTOR, Role.ADMIN]),
  validate(getTrendsSchema),
  emotionController.getTrends
);

export default router;