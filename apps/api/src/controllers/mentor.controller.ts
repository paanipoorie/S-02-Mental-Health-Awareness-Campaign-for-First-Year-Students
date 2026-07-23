import type { Request, Response, NextFunction } from 'express';
import { mentorService } from '../services/mentor.service.js';
import { ApiError } from '../utils/ApiError.js';

export const mentorController = {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const profile = await mentorService.getMentorProfile(userId);

      if (!profile) {
        throw new ApiError(404, 'Mentor profile not found', 'MENTOR_PROFILE_NOT_FOUND');
      }

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { department, bio, specialties } = req.body;

      const profile = await mentorService.updateMentorProfile(userId, {
        department,
        bio,
        specialties,
      });

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { availabilityStatus } = req.body;

      const profile = await mentorService.updateAvailability(userId, availabilityStatus);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMentors(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await mentorService.getMentors(page, limit);

      res.json({
        success: true,
        data: result.mentors,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getPriorityFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const emotion = req.query.emotion as string | undefined;
      const category = req.query.category as string | undefined;

      const result = await mentorService.getPriorityFeed(page, limit, emotion, category);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
