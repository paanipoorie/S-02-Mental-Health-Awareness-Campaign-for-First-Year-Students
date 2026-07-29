import { Router } from 'express';
import { meetingController } from '../controllers/meeting.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware, requireRole, requireVerifiedMentor } from '../middlewares/index.js';
import { Role } from '@campus-peer-support/shared-types';
import {
  createMeetingSchema,
  getMeetingsQuerySchema,
  getMeetingParamsSchema,
  rsvpMeetingParamsSchema,
  createWorkshopSchema,
  getWorkshopsQuerySchema,
  getWorkshopParamsSchema,
  workshopRegistrationParamsSchema,
  markAttendanceSchema,
} from '../validators/meeting.validator.js';

const router: Router = Router();

// All meeting and workshop routes require authentication
router.use(authMiddleware);
router.use(requireRole(Role.STUDENT, Role.MENTOR, Role.ADMIN));

// Meeting routes
router.post(
  '/meetings',
  validate(createMeetingSchema),
  meetingController.createMeeting
);

router.get(
  '/meetings',
  validate(getMeetingsQuerySchema),
  meetingController.getMeetings
);

router.get(
  '/meetings/upcoming/student',
  meetingController.getUpcomingMeetingsForStudent
);

router.get(
  '/meetings/upcoming/mentor',
  meetingController.getTodaysMeetingsForMentor
);

router.get(
  '/meetings/:id',
  validate(getMeetingParamsSchema),
  meetingController.getMeetingById
);

router.post(
  '/meetings/:id/rsvp',
  validate(rsvpMeetingParamsSchema),
  meetingController.rsvpMeeting
);

router.delete(
  '/meetings/:id',
  validate(getMeetingParamsSchema),
  meetingController.cancelMeeting
);

// Workshop routes
router.post(
  '/workshops',
  requireVerifiedMentor,
  validate(createWorkshopSchema),
  meetingController.createWorkshop
);

router.get(
  '/workshops',
  validate(getWorkshopsQuerySchema),
  meetingController.getWorkshops
);

router.get(
  '/workshops/upcoming/student',
  meetingController.getUpcomingWorkshopsForStudent
);

router.get(
  '/workshops/upcoming/mentor',
  meetingController.getTodaysWorkshopsForMentor
);

router.get(
  '/workshops/:id',
  validate(getWorkshopParamsSchema),
  meetingController.getWorkshopById
);

router.post(
  '/workshops/:id/register',
  validate(workshopRegistrationParamsSchema),
  meetingController.registerWorkshop
);

router.delete(
  '/workshops/:id/register',
  validate(workshopRegistrationParamsSchema),
  meetingController.cancelRegistration
);

router.post(
  '/workshops/:id/attendance',
  requireVerifiedMentor,
  validate(markAttendanceSchema),
  meetingController.markAttendance
);

router.delete(
  '/workshops/:id',
  validate(getWorkshopParamsSchema),
  meetingController.cancelWorkshop
);

export default router;