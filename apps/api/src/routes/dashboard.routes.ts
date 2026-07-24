import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware, requireRole } from '../middlewares/index.js';
import {
  getStudentDashboardSchema,
  getMentorDashboardSchema,
  getAdminDashboardSchema,
  updateMentorAvailabilitySchema,
} from '../validators/dashboard.validator.js';
import { Role } from '@campus-peer-support/shared-types';

const router: Router = Router();

router.use(authMiddleware);

router.get(
  '/student',
  requireRole(Role.STUDENT),
  validate(getStudentDashboardSchema),
  dashboardController.getStudentDashboard
);

router.get(
  '/mentor',
  requireRole(Role.MENTOR),
  validate(getMentorDashboardSchema),
  dashboardController.getMentorDashboard
);

router.get(
  '/admin',
  requireRole(Role.ADMIN),
  validate(getAdminDashboardSchema),
  dashboardController.getAdminDashboard
);

router.patch(
  '/mentor/availability',
  requireRole(Role.MENTOR),
  validate(updateMentorAvailabilitySchema),
  dashboardController.updateMentorAvailability
);

export default router;
