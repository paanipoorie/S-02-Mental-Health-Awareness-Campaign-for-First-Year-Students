import type { Request, Response, NextFunction } from 'express';
import { meetingService, workshopService } from '../services/meeting.service.js';
import type {
  CreateMeetingInput,
  GetMeetingsQuery,
  GetMeetingParams,
  RsvpMeetingParams,
  CreateWorkshopInput,
  GetWorkshopsQuery,
  GetWorkshopParams,
  WorkshopRegistrationParams,
  MarkAttendanceInput,
  MeetingCategory,
  MeetingHostType,
  WorkshopCategory,
} from '../validators/meeting.validator.js';
import { ApiError } from '../utils/ApiError.js';
import { authMiddleware } from '../middlewares/index.js';

async function getStudentIdentityId(userId: string): Promise<string | null> {
  const { prisma } = await import('../prisma/client.js');
  const identity = await prisma.anonymousIdentity.findUnique({
    where: { userId },
    select: { id: true },
  });
  return identity?.id ?? null;
}

export const meetingController = {
  async createMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = req.body as CreateMeetingInput;

      if (user.role === 'STUDENT') {
        const anonId = await getStudentIdentityId(user.userId);
        if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

        const meeting = await meetingService.createMeeting(user.userId, user.role, {
          ...data,
          date: new Date(data.date),
          meetingLink: data.meetingLink ?? null,
          location: data.location ?? null,
          hostType: 'STUDENT',
        });

        res.status(201).json({ success: true, data: meeting });
      } else if (user.role === 'MENTOR') {
        const meeting = await meetingService.createMeeting(user.userId, user.role, {
          ...data,
          date: new Date(data.date),
          meetingLink: data.meetingLink ?? null,
          location: data.location ?? null,
          hostType: 'MENTOR',
        });

        res.status(201).json({ success: true, data: meeting });
      } else {
        throw new ApiError(403, 'Admins cannot create meetings');
      }
    } catch (error) {
      next(error);
    }
  },

  async getMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetMeetingsQuery;
      const userId = req.user?.userId;
      const filters: {
        upcoming?: boolean;
        category?: MeetingCategory;
        hostType?: MeetingHostType;
      } = {};
      if (query.upcoming !== undefined) filters.upcoming = query.upcoming;
      if (query.category) filters.category = query.category;
      if (query.hostType) filters.hostType = query.hostType;
      const result = await meetingService.getMeetings(
        query.page || 1,
        query.limit || 20,
        filters,
        userId
      );

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

  async getMeetingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as GetMeetingParams;
      const userId = req.user?.userId;
      const meeting = await meetingService.getMeetingById(id, userId);

      if (!meeting) {
        throw new ApiError(404, 'Meeting not found');
      }

      res.json({ success: true, data: meeting });
    } catch (error) {
      next(error);
    }
  },

  async rsvpMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as RsvpMeetingParams;

      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can RSVP to meetings');
      }

      const anonId = await getStudentIdentityId(user.userId);
      if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

      const result = await meetingService.rsvpMeeting(id, user.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async cancelMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetMeetingParams;

      await meetingService.cancelMeeting(id, user.userId, user.role);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authorized')) {
        return next(new ApiError(403, error.message));
      }
      next(error);
    }
  },

  async getUpcomingMeetingsForStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can access this');
      }

      const anonId = await getStudentIdentityId(user.userId);
      if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

      const result = await meetingService.getUpcomingMeetingsForStudent(anonId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getTodaysMeetingsForMentor(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Only mentors can access this');
      }

      const result = await meetingService.getTodaysMeetingsForMentor(user.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getTodaysWorkshopsForMentor(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Only mentors can access this');
      }

      const result = await meetingService.getTodaysWorkshopsForMentor(user.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Only mentors can create workshops');
      }

      const data = req.body as CreateWorkshopInput;
      const workshop = await workshopService.createWorkshop(user.userId, {
        ...data,
        date: new Date(data.date),
        meetingLink: data.meetingLink ?? null,
        location: data.location ?? null,
        maxAttendees: data.maxAttendees ?? null,
        resources: data.resources ?? null,
      });
      res.status(201).json({ success: true, data: workshop });
    } catch (error) {
      next(error);
    }
  },

  async getWorkshops(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetWorkshopsQuery;
      const userId = req.user?.userId;
      const filters: { upcoming?: boolean; category?: WorkshopCategory } = {};
      if (query.upcoming !== undefined) filters.upcoming = query.upcoming;
      if (query.category) filters.category = query.category;
      const result = await workshopService.getWorkshops(
        query.page || 1,
        query.limit || 20,
        filters,
        userId
      );

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

  async getWorkshopById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as GetWorkshopParams;
      const userId = req.user?.userId;
      const workshop = await workshopService.getWorkshopById(id, userId);

      if (!workshop) {
        throw new ApiError(404, 'Workshop not found');
      }

      res.json({ success: true, data: workshop });
    } catch (error) {
      next(error);
    }
  },

  async registerWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can register for workshops');
      }

      const anonId = await getStudentIdentityId(user.userId);
      if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

      const { id } = req.params as WorkshopRegistrationParams;
      const registration = await workshopService.registerWorkshop(id, user.userId);
      res.status(201).json({ success: true, data: registration });
    } catch (error) {
      if (error instanceof Error && error.message === 'Workshop is full') {
        return next(new ApiError(400, 'Workshop is full'));
      }
      next(error);
    }
  },

  async cancelRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can cancel registration');
      }

      const anonId = await getStudentIdentityId(user.userId);
      if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

      const { id } = req.params as WorkshopRegistrationParams;
      await workshopService.cancelRegistration(id, user.userId);
      res.json({ success: true, data: { cancelled: true } });
    } catch (error) {
      next(error);
    }
  },

  async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'MENTOR') {
        throw new ApiError(403, 'Only mentors can mark attendance');
      }

      const { id } = req.params as WorkshopRegistrationParams;
      const data = req.body as MarkAttendanceInput;

      await workshopService.markAttendance(id, data.anonymousIdentityId, data.status);
      res.json({ success: true, data: { message: 'Attendance marked' } });
    } catch (error) {
      next(error);
    }
  },

  async cancelWorkshop(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
        throw new ApiError(403, 'You are not authorized to cancel this workshop');
      }

      const { id } = req.params as GetWorkshopParams;
      await workshopService.cancelWorkshop(id, user.userId, user.role);
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('not authorized') ||
          error.message.includes('Only mentor') ||
          error.message.includes('unauthorized'))
      ) {
        return next(new ApiError(403, error.message));
      }
      next(error);
    }
  },

  async getUpcomingWorkshopsForStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      if (user.role !== 'STUDENT') {
        throw new ApiError(403, 'Only students can access this');
      }

      const anonId = await getStudentIdentityId(user.userId);
      if (!anonId) throw new ApiError(404, 'Anonymous identity not found');

      const result = await meetingService.getUpcomingWorkshopsForStudent(anonId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
