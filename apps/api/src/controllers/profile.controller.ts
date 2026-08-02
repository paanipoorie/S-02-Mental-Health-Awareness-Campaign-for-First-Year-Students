import type { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service.js';
import { ApiError } from '../utils/ApiError.js';

export const profileController = {
  async getAnonymousProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { anonymousIdentityId } = req.params;
      const profile = await profileService.getAnonymousProfile(anonymousIdentityId);

      if (!profile) {
        return next(new ApiError(404, 'Anonymous identity not found'));
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
};
