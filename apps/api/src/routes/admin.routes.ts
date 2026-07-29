import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { Role } from '@campus-peer-support/shared-types';
import {
  getAdminUsersQuerySchema,
  getAdminMentorsQuerySchema,
  verifyMentorParamsSchema,
  verifyMentorBodySchema,
  updateUserStatusParamsSchema,
  updateUserStatusBodySchema,
  getAdminMeetingsQuerySchema,
  adminMeetingParamsSchema,
  getAdminWorkshopsQuerySchema,
  adminWorkshopParamsSchema,
  getAdminResourcesQuerySchema,
  createAdminResourceBodySchema,
  adminResourceParamsSchema,
  updateAdminResourceBodySchema,
} from '../validators/admin.validator.js';

const router: Router = Router();

// All admin routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireRole(Role.ADMIN));

// Stats
router.get('/stats', adminController.getStats);
router.get('/action-logs', adminController.getActionLogs);

// User management
router.get('/users', validate(getAdminUsersQuerySchema), adminController.getUsers);
router.get('/mentors', validate(getAdminMentorsQuerySchema), adminController.getMentors);
router.patch(
  '/users/:id/status',
  validate(updateUserStatusParamsSchema),
  validate(updateUserStatusBodySchema),
  adminController.updateUserStatus
);
router.patch(
  '/mentors/:id/verify',
  validate(verifyMentorParamsSchema),
  validate(verifyMentorBodySchema),
  adminController.verifyMentor
);

// Meeting management
router.get('/meetings', validate(getAdminMeetingsQuerySchema), adminController.getMeetings);
router.delete('/meetings/:id', validate(adminMeetingParamsSchema), adminController.deleteMeeting);

// Workshop management
router.get('/workshops', validate(getAdminWorkshopsQuerySchema), adminController.getWorkshops);
router.delete(
  '/workshops/:id',
  validate(adminWorkshopParamsSchema),
  adminController.deleteWorkshop
);

// Resource management (full CRUD)
router.get('/resources', validate(getAdminResourcesQuerySchema), adminController.getResources);
router.post('/resources', validate(createAdminResourceBodySchema), adminController.createResource);
router.patch(
  '/resources/:id',
  validate(adminResourceParamsSchema),
  validate(updateAdminResourceBodySchema),
  adminController.updateResource
);
router.delete(
  '/resources/:id',
  validate(adminResourceParamsSchema),
  adminController.deleteResource
);

export default router;
