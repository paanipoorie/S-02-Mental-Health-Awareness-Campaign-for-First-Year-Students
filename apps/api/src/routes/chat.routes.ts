import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/index.js';
import { chatController } from '../controllers/chat.controller.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware.js';
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

router.post('/', validateBody(createChatSchema), chatController.createChat);

router.get('/', validateQuery(getChatsQuerySchema), chatController.getChats);

router.get('/:id', validateParams(getChatParamsSchema), chatController.getChatById);

router.get(
  '/:id/messages',
  validateParams(getChatParamsSchema),
  validateQuery(getMessagesQuerySchema),
  chatController.getMessages
);

router.post(
  '/:id/messages',
  validateParams(getChatParamsSchema),
  validateBody(sendMessageSchema),
  chatController.sendMessage
);

router.patch('/:id/read', validateParams(readMessagesParamsSchema), chatController.markAsRead);

export default router;
