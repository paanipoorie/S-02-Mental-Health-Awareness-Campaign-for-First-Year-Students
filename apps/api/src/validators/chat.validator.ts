import { z } from 'zod';

export const createChatSchema = z.object({
  body: z.object({
    studentIdentityId: z.string().cuid().optional(),
  }),
});

export const getChatsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const getChatParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const getMessagesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(50),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    body: z.string().min(1).max(10000),
  }),
});

export const readMessagesParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export type CreateChatInput = z.infer<typeof createChatSchema>['body'];
export type GetChatsQuery = z.infer<typeof getChatsQuerySchema>['query'];
export type GetChatParams = z.infer<typeof getChatParamsSchema>['params'];
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>['query'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type ReadMessagesParams = z.infer<typeof readMessagesParamsSchema>['params'];
