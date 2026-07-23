import { z } from 'zod';
import { EmotionType, UrgencyLevel, PostCategory } from '@shared-types/enums';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    body: z.string().min(10).max(10000),
    emotion: z.nativeEnum(EmotionType).optional(),
    urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
    category: z.nativeEnum(PostCategory),
  }),
});

export const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    emotion: z.nativeEnum(EmotionType).optional(),
    category: z.nativeEnum(PostCategory).optional(),
  }),
});

export const getPostParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    body: z.string().min(1).max(5000),
  }),
});

export const replyParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
    replyId: z.string().cuid(),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>['query'];
export type GetPostParams = z.infer<typeof getPostParamsSchema>['params'];
export type CreateReplyInput = z.infer<typeof createReplySchema>['body'];
export type DeleteReplyParams = z.infer<typeof replyParamsSchema>['params'];