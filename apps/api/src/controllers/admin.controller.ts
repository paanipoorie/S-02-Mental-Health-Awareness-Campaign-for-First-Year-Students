import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { ApiError } from '../utils/ApiError.js';

export const adminController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getAdminStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const query: {
        page: number;
        limit: number;
        role?: string;
        isActive?: boolean;
        search?: string;
      } = { page, limit };
      if (role !== undefined) query.role = role;
      if (isActive !== undefined) query.isActive = isActive;
      if (search !== undefined) query.search = search;

      const result = await adminService.getUsers(query as any);

      res.json({
        success: true,
        data: result.users,
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

  async getMentors(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isVerified =
        req.query.isVerified !== undefined ? req.query.isVerified === 'true' : undefined;
      const availabilityStatus = req.query.availabilityStatus as string | undefined;
      const search = req.query.search as string | undefined;

      const query: {
        page: number;
        limit: number;
        isVerified?: boolean;
        availabilityStatus?: string;
        search?: string;
      } = { page, limit };
      if (isVerified !== undefined) query.isVerified = isVerified;
      if (availabilityStatus !== undefined) query.availabilityStatus = availabilityStatus;
      if (search !== undefined) query.search = search;

      const result = await adminService.getMentors(query as any);

      res.json({
        success: true,
        data: result.users,
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

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const id = req.params.id as string;
      const { isActive } = req.body;

      const result = await adminService.updateUserStatus(adminUserId, id, isActive);

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'SELF_DEACTIVATION_NOT_ALLOWED') {
          return next(
            new ApiError(400, 'Cannot deactivate your own account', 'SELF_DEACTIVATION_NOT_ALLOWED')
          );
        }
        if (error.message === 'USER_NOT_FOUND') {
          return next(new ApiError(404, 'User not found', 'USER_NOT_FOUND'));
        }
        if (error.message === 'LAST_ADMIN_CANNOT_BE_DEACTIVATED') {
          return next(
            new ApiError(
              400,
              'Cannot deactivate the last admin',
              'LAST_ADMIN_CANNOT_BE_DEACTIVATED'
            )
          );
        }
      }
      next(error);
    }
  },

  async verifyMentor(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const id = req.params.id as string;
      const { isVerified } = req.body;

      const result = await adminService.verifyMentor(adminUserId, id, isVerified);

      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'MENTOR_NOT_FOUND') {
          return next(new ApiError(404, 'Mentor not found', 'MENTOR_NOT_FOUND'));
        }
        if (error.message === 'MENTOR_VERIFICATION_STATUS_UNCHANGED') {
          return next(
            new ApiError(
              400,
              'Mentor verification status is already set to that value',
              'MENTOR_VERIFICATION_STATUS_UNCHANGED'
            )
          );
        }
      }
      next(error);
    }
  },

  async getMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const hostType = req.query.hostType as string | undefined;
      const meetingType = req.query.meetingType as string | undefined;
      const category = req.query.category as string | undefined;
      const upcoming = req.query.upcoming !== undefined ? req.query.upcoming === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const query: {
        page: number;
        limit: number;
        hostType?: string;
        meetingType?: string;
        category?: string;
        upcoming?: boolean;
        search?: string;
      } = { page, limit };
      if (hostType !== undefined) query.hostType = hostType;
      if (meetingType !== undefined) query.meetingType = meetingType;
      if (category !== undefined) query.category = category;
      if (upcoming !== undefined) query.upcoming = upcoming;
      if (search !== undefined) query.search = search;

      const result = await adminService.getMeetings(query as any);

      res.json({
        success: true,
        data: result.meetings,
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

  async deleteMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const id = req.params.id as string;

      await adminService.deleteMeeting(adminUserId, id);

      res.json({ success: true, data: { message: 'Meeting deleted successfully' } });
    } catch (error) {
      if (error instanceof Error && error.message === 'MEETING_NOT_FOUND') {
        return next(new ApiError(404, 'Meeting not found', 'MEETING_NOT_FOUND'));
      }
      next(error);
    }
  },

  async getWorkshops(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const meetingType = req.query.meetingType as string | undefined;
      const category = req.query.category as string | undefined;
      const upcoming = req.query.upcoming !== undefined ? req.query.upcoming === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const query: {
        page: number;
        limit: number;
        meetingType?: string;
        category?: string;
        upcoming?: boolean;
        search?: string;
      } = { page, limit };
      if (meetingType !== undefined) query.meetingType = meetingType;
      if (category !== undefined) query.category = category;
      if (upcoming !== undefined) query.upcoming = upcoming;
      if (search !== undefined) query.search = search;

      const result = await adminService.getWorkshops(query as any);

      res.json({
        success: true,
        data: result.workshops,
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

  async deleteWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const id = req.params.id as string;

      await adminService.deleteWorkshop(adminUserId, id);

      res.json({ success: true, data: { message: 'Workshop deleted successfully' } });
    } catch (error) {
      if (error instanceof Error && error.message === 'WORKSHOP_NOT_FOUND') {
        return next(new ApiError(404, 'Workshop not found', 'WORKSHOP_NOT_FOUND'));
      }
      next(error);
    }
  },

  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string | undefined;

      const query: {
        page: number;
        limit: number;
        category?: string;
        isActive?: boolean;
        search?: string;
      } = { page, limit };
      if (category !== undefined) query.category = category;
      if (isActive !== undefined) query.isActive = isActive;
      if (search !== undefined) query.search = search;

      const result = await adminService.getResources(query as any);

      res.json({
        success: true,
        data: result.resources,
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

  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await adminService.createResource(req.body);
      res.status(201).json({ success: true, data: resource });
    } catch (error) {
      next(error);
    }
  },

  async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const resource = await adminService.updateResource(id, req.body);
      res.json({ success: true, data: resource });
    } catch (error) {
      if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
        return next(new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND'));
      }
      next(error);
    }
  },

  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await adminService.deleteResource(id);
      res.json({ success: true, data: { message: 'Resource deleted successfully' } });
    } catch (error) {
      if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
        return next(new ApiError(404, 'Resource not found', 'RESOURCE_NOT_FOUND'));
      }
      next(error);
    }
  },

  async getActionLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const adminUserId = req.query.adminUserId as string | undefined;
      const actionType = req.query.actionType as string | undefined;
      const targetType = req.query.targetType as string | undefined;

      const query: {
        page: number;
        limit: number;
        adminUserId?: string;
        actionType?: string;
        targetType?: string;
      } = { page, limit };
      if (adminUserId !== undefined) query.adminUserId = adminUserId;
      if (actionType !== undefined) query.actionType = actionType;
      if (targetType !== undefined) query.targetType = targetType;

      const result = await adminService.getAdminActionLogs(query);

      res.json({
        success: true,
        data: result.logs,
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
