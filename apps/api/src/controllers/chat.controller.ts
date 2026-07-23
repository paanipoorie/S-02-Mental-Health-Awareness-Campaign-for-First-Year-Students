import type { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { ApiError } from '../utils/ApiError.js';
import type { Role } from '@campus-peer-support/shared-types';
import type {
  CreateChatInput,
  GetChatsQuery,
  GetChatParams,
  GetMessagesQuery,
  SendMessageInput,
} from '../validators/chat.validator.js';

export const chatController = {
  async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const data = req.body as CreateChatInput;
      const role = user.role as Role;

      const chat = await chatService.createChat(user.userId, role, data);

      res.status(201).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'STUDENT_IDENTITY_NOT_FOUND') {
          return next(new ApiError(404, 'Anonymous identity not found'));
        }
        if (error.message === 'STUDENT_IDENTITY_ID_REQUIRED') {
          return next(new ApiError(400, 'Student identity ID required for mentor-initiated chat'));
        }
      }
      next(error);
    }
  },

  async getChats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = req.query as unknown as GetChatsQuery;
      const role = user.role as Role;

      const result = await chatService.getChats(user.userId, role, query);

      res.json({
        success: true,
        data: result.chats,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'STUDENT_IDENTITY_NOT_FOUND') {
        return next(new ApiError(404, 'Anonymous identity not found'));
      }
      next(error);
    }
  },

  async getChatById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetChatParams;
      const role = user.role as Role;

      const chat = await chatService.getChatById(id, user.userId, role);

      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      // Get student's latest emotion for mentor view
      let studentEmotion = null;
      if (role === 'MENTOR') {
        studentEmotion = await chatService.getStudentLatestEmotion(chat.studentIdentityId);
      }

      res.json({
        success: true,
        data: {
          ...chat,
          studentEmotion,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to access this chat'));
      }
      if (error instanceof Error && error.message === 'STUDENT_IDENTITY_NOT_FOUND') {
        return next(new ApiError(404, 'Anonymous identity not found'));
      }
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetChatParams;
      const query = req.query as unknown as GetMessagesQuery;
      const role = user.role as Role;

      const result = await chatService.getMessages(id, user.userId, role, query);

      if (!result) {
        throw new ApiError(404, 'Chat not found');
      }

      res.json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to access messages'));
      }
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetChatParams;
      const data = req.body as SendMessageInput;
      const role = user.role as Role;

      const message = await chatService.sendMessage(id, user.userId, role, data);

      // Also emit via Socket.io for real-time delivery
      // The socket handler will broadcast to the room

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized to send message'));
      }
      if (error instanceof Error && error.message === 'CHAT_NOT_FOUND') {
        return next(new ApiError(404, 'Chat not found'));
      }
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as GetChatParams;
      const role = user.role as Role;

      await chatService.markAsRead(id, user.userId, role);

      res.json({
        success: true,
        data: { message: 'Messages marked as read' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return next(new ApiError(403, 'Not authorized'));
      }
      if (error instanceof Error && error.message === 'CHAT_NOT_FOUND') {
        return next(new ApiError(404, 'Chat not found'));
      }
      next(error);
    }
  },
};
