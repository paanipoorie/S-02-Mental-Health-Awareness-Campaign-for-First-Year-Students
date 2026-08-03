import type { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service.js';
import { ApiError } from '../utils/ApiError.js';

export const profileController = {
  async getAnonymousProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { anonymousIdentityId } = req.params;
      if (!anonymousIdentityId) {
        return next(new ApiError(400, 'Anonymous identity ID is required'));
      }
      const profile = await profileService.getAnonymousProfile(anonymousIdentityId);

      if (!profile) {
        return next(new ApiError(404, 'Anonymous identity not found'));
      }

      // Preserve anonymity by stripping the underlying userId for student roles
      const sanitizedProfile = { ...profile };
      if (req.user?.role === 'STUDENT') {
        delete (sanitizedProfile as any).userId;
      }

      res.status(200).json({
        success: true,
        data: sanitizedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
};
