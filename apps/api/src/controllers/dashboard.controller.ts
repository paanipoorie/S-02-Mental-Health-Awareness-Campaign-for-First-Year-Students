import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { ApiError } from '../utils/ApiError.js';

export const dashboardController = {
  async getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Access denied: Student role required');
      }

      if (!user.anonymousIdentityId) {
        throw new ApiError(404, 'Anonymous identity not found');
      }

      const dashboard = await dashboardService.getStudentDashboard(
        user.userId,
        user.anonymousIdentityId
      );

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMentorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Access denied: Mentor role required');
      }

      const dashboard = await dashboardService.getMentorDashboard(user.userId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (user.role !== 'ADMIN') {
        throw new ApiError(403, 'Access denied: Admin role required');
      }

      const dashboard = await dashboardService.getAdminDashboard();

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateMentorAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;

      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Access denied: Mentor role required');
      }

      const { availabilityStatus } = req.body;

      const updated = await dashboardService.updateMentorAvailability(
        user.userId,
        availabilityStatus
      );

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
