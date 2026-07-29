import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';

export const notificationController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotifications(userId, page, limit);
      res.json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
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

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const id = req.params.id!;
      const notification = await notificationService.markAsRead(id, userId);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true, data: { message: 'All notifications marked as read' } });
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { unreadCount: count } });
    } catch (error) {
      next(error);
    }
  },
};
