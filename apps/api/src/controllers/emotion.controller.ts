import { type Request, type Response, type NextFunction } from 'express';
import { emotionService } from '../services/emotion.service';
import { ApiError } from '../utils/ApiError';

export const emotionController = {
  async createEmotionLog(req: Request, res: Response, next: NextFunction) {
    try {
      const anonymousIdentityId = req.user!.anonymousIdentityId;

      if (!anonymousIdentityId) {
        throw new ApiError(400, 'No anonymous identity found for this user');
      }

      const emotionLog = await emotionService.createEmotionLog(
        anonymousIdentityId,
        req.body
      );

      res.status(201).json({
        success: true,
        data: emotionLog,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyLatestEmotion(req: Request, res: Response, next: NextFunction) {
    try {
      const anonymousIdentityId = req.user!.anonymousIdentityId;

      if (!anonymousIdentityId) {
        throw new ApiError(400, 'No anonymous identity found for this user');
      }

      const emotionLog = await emotionService.getLatestEmotion(anonymousIdentityId);

      res.json({
        success: true,
        data: emotionLog,
      });
    } catch (error) {
      next(error);
    }
  },

  async getEmotionTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await emotionService.getEmotionTrends(req.query as any);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  },
};