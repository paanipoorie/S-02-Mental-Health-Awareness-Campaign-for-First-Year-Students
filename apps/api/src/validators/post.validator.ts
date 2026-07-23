import { z } from 'zod';
import { PostCategory, EmotionType, UrgencyLevel } from '@shared-types/enums';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    body: z.string().min(1, 'Body is required').max(10000, 'Body too long'),
    category: z.nativeEnum(PostCategory),
    emotion: z.nativeEnum(EmotionType).optional(),
    urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    body: z.string().min(1, 'Body is required').max(10000, 'Body too long').optional(),
    category: z.nativeEnum(PostCategory).optional(),
    emotion: z.nativeEnum(EmotionType).optional(),
    urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
  }),
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
  }),
});

export const createReplySchema = z.object({
  body: z.object({
    body: z.string().min(1, 'Reply body is required').max(5000, 'Reply too long'),
  }),
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
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
    id: z.string().cuid('Invalid post ID'),
  }),
});

export const deleteReplySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid post ID'),
    replyId: z.string().cuid('Invalid reply ID'),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type CreateReplyInput = z.infer<typeof createReplySchema>['body'];
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>['query'];
export type GetPostParams = z.infer<typeof getPostParamsSchema>['params'];
export type DeleteReplyParams = z.infer<typeof deleteReplySchema>['params'];