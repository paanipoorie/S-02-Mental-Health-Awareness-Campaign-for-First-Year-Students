import { Request, Response, NextFunction } from 'express';
import { emotionService } from '../services/emotion.service';
import { CreateEmotionInput, GetTrendsInput } from '../validators/emotion.validator';
import { ApiError } from '../utils/ApiError';

export const emotionController = {
  async createEmotion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = req.body as CreateEmotionInput;

      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can log emotions');
      }

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const emotionLog = await emotionService.createEmotionLog(
        user.anonymousIdentityId,
        data
      );

      res.status(201).json({
        success: true,
        data: emotionLog,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyEmotion(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;

      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can view their emotion');
      }

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const emotionLog = await emotionService.getLatestEmotion(
        user.anonymousIdentityId
      );

      if (!emotionLog) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No emotion logged yet' },
        });
      }

      res.json({
        success: true,
        data: emotionLog,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;

      if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
        throw new ApiError(403, 'Only mentors and admins can view emotion trends');
      }

      const query = req.query as unknown as GetTrendsInput;
      const trends = await emotionService.getEmotionTrends(query);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  },
};