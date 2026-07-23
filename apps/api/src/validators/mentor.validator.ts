import { z } from 'zod';
import {
  MentorAvailabilityStatus,
  PostCategory,
  EmotionType,
} from '@campus-peer-support/shared-types/enums';

export const updateMentorProfileSchema = z.object({
  body: z.object({
    department: z.string().min(1, 'Department is required').max(100).optional(),
    bio: z.string().max(2000, 'Bio must be at most 2000 characters').optional(),
    specialties: z.array(z.string().max(50)).max(10, 'Maximum 10 specialties allowed').optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    availabilityStatus: z.nativeEnum(MentorAvailabilityStatus, {
      errorMap: () => ({ message: 'Availability status must be AVAILABLE, BUSY, or OFFLINE' }),
    }),
  }),
});

export const getMentorsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  }),
});

export const getPriorityFeedQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    emotion: z.nativeEnum(EmotionType).optional(),
    category: z.nativeEnum(PostCategory).optional(),
  }),
});

export type UpdateMentorProfileInput = z.infer<typeof updateMentorProfileSchema>['body'];
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>['body'];
export type GetMentorsQuery = z.infer<typeof getMentorsQuerySchema>['query'];
export type GetPriorityFeedQuery = z.infer<typeof getPriorityFeedQuerySchema>['query'];
