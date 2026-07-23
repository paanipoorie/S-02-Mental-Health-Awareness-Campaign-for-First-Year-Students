import { Router } from 'express';
import { mentorController } from '../controllers/mentor.controller.js';
import { requireRole, requireVerifiedMentor } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { Role } from '@campus-peer-support/shared-types';
import {
  updateMentorProfileSchema,
  updateAvailabilitySchema,
} from '../validators/mentor.validator.js';

const router: Router = Router();

// Mentor-only routes (require MENTOR role and verified status)
router.get(
  '/me/profile',
  requireRole(Role.MENTOR),
  requireVerifiedMentor,
  mentorController.getMyProfile
);
router.patch(
  '/me/profile',
  requireRole(Role.MENTOR),
  requireVerifiedMentor,
  validate(updateMentorProfileSchema),
  mentorController.updateMyProfile
);
router.patch(
  '/me/availability',
  requireRole(Role.MENTOR),
  requireVerifiedMentor,
  validate(updateAvailabilitySchema),
  mentorController.updateAvailability
);
router.get(
  '/priority-feed',
  requireRole(Role.MENTOR),
  requireVerifiedMentor,
  mentorController.getPriorityFeed
);

// Public mentor list (students can see verified mentors)
router.get('/', mentorController.getMentors);

export default router;
