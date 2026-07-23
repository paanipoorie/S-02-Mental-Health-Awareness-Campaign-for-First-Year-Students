import { Router } from 'express';
import { emotionController } from '../controllers/emotion.controller';
import { validate } from '../middlewares/validate.middleware';
import { authMiddleware, requireRole } from '../middlewares';
import { createEmotionSchema, getTrendsSchema } from '../validators/emotion.validator';
import { Role } from '@shared-types/enums';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createEmotionSchema), emotionController.createEmotion);

router.get('/me', emotionController.getMyEmotion);

router.get(
  '/trends',
  requireRole([Role.MENTOR, Role.ADMIN]),
  validate(getTrendsSchema),
  emotionController.getTrends
);

export default router;
