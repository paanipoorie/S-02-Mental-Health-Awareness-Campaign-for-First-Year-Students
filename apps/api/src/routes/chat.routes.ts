import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/index.js';
import { chatController } from '../controllers/chat.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createChatSchema,
  getChatsQuerySchema,
  getChatParamsSchema,
  getMessagesQuerySchema,
  sendMessageSchema,
  readMessagesParamsSchema,
} from '../validators/chat.validator.js';

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.post('/', validate(createChatSchema), chatController.createChat);

router.get('/', validate(getChatsQuerySchema), chatController.getChats);

router.get('/:id', validate(getChatParamsSchema), chatController.getChatById);

router.get(
  '/:id/messages',
  validate(getChatParamsSchema),
  validate(getMessagesQuerySchema),
  chatController.getMessages
);

router.post(
  '/:id/messages',
  validate(getChatParamsSchema),
  validate(sendMessageSchema),
  chatController.sendMessage
);

router.patch('/:id/read', validate(readMessagesParamsSchema), chatController.markAsRead);

export default router;
