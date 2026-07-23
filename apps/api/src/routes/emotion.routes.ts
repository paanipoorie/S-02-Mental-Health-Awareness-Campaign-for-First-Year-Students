import { Router } from 'express';
import { emotionController } from '../controllers/emotion.controller';
import { validate } from '../middlewares/validate.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { createEmotionLogSchema, getEmotionTrendsSchema } from '../validators/emotion.validator';
import { Role } from '@shared-types/enums';

const router = Router();

router.post(
  '/',
  validate(createEmotionLogSchema),
  emotionController.createEmotionLog
);

router.get(
  '/me',
  emotionController.getMyLatestEmotion
);

router.get(
  '/trends',
  requireRole([Role.MENTOR, Role.ADMIN]),
  validate(getEmotionTrendsSchema),
  emotionController.getEmotionTrends
);

export default router;