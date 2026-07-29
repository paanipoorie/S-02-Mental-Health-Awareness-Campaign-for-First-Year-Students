import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware as authenticate } from '../middlewares/auth.middleware.js';
import {
  notificationParamsSchema,
  getNotificationsQuerySchema,
} from '../validators/notification.validator.js';

const router: Router = Router();

router.use(authenticate);

router.get('/', validate(getNotificationsQuerySchema), notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch(
  '/:id/read',
  validate(notificationParamsSchema),
  notificationController.markAsRead
);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
