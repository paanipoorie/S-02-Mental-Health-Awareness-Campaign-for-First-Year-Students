import { z } from 'zod';
import {
  Role,
  ResourceCategory,
  MeetingCategory,
  WorkshopCategory,
  MentorAvailabilityStatus,
} from '@campus-peer-support/shared-types';

export const getAdminUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    role: z.nativeEnum(Role).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export const getAdminMentorsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    isVerified: z.coerce.boolean().optional(),
    availabilityStatus: z.nativeEnum(MentorAvailabilityStatus).optional(),
    search: z.string().optional(),
  }),
});

export const verifyMentorParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid mentor ID'),
  }),
});

export const verifyMentorBodySchema = z.object({
  body: z.object({
    isVerified: z.boolean(),
  }),
});

export const updateUserStatusParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
});

export const updateUserStatusBodySchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const getAdminMeetingsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    hostType: z.enum(['STUDENT', 'MENTOR']).optional(),
    meetingType: z.enum(['ONLINE', 'OFFLINE']).optional(),
    category: z.nativeEnum(MeetingCategory).optional(),
    upcoming: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export const adminMeetingParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid meeting ID'),
  }),
});

export const getAdminWorkshopsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    meetingType: z.enum(['ONLINE', 'OFFLINE']).optional(),
    category: z.nativeEnum(WorkshopCategory).optional(),
    upcoming: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export const adminWorkshopParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid workshop ID'),
  }),
});

export const getAdminResourcesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    category: z.nativeEnum(ResourceCategory).optional(),
    isActive: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export const createAdminResourceBodySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    category: z.nativeEnum(ResourceCategory),
    content: z.string().min(1, 'Content is required'),
    link: z.string().url('Invalid URL format').optional().nullable(),
    isActive: z.boolean().default(true),
  }),
});

export const adminResourceParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid resource ID'),
  }),
});

export const updateAdminResourceBodySchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    category: z.nativeEnum(ResourceCategory).optional(),
    content: z.string().min(1).optional(),
    link: z.string().url('Invalid URL format').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export type GetAdminUsersQuery = z.infer<typeof getAdminUsersQuerySchema>['query'];
export type GetAdminMentorsQuery = z.infer<typeof getAdminMentorsQuerySchema>['query'];
export type VerifyMentorParams = z.infer<typeof verifyMentorParamsSchema>['params'];
export type VerifyMentorBody = z.infer<typeof verifyMentorBodySchema>['body'];
export type UpdateUserStatusParams = z.infer<typeof updateUserStatusParamsSchema>['params'];
export type UpdateUserStatusBody = z.infer<typeof updateUserStatusBodySchema>['body'];
export type GetAdminMeetingsQuery = z.infer<typeof getAdminMeetingsQuerySchema>['query'];
export type AdminMeetingParams = z.infer<typeof adminMeetingParamsSchema>['params'];
export type GetAdminWorkshopsQuery = z.infer<typeof getAdminWorkshopsQuerySchema>['query'];
export type AdminWorkshopParams = z.infer<typeof adminWorkshopParamsSchema>['params'];
export type GetAdminResourcesQuery = z.infer<typeof getAdminResourcesQuerySchema>['query'];
export type CreateAdminResourceBody = z.infer<typeof createAdminResourceBodySchema>['body'];
export type AdminResourceParams = z.infer<typeof adminResourceParamsSchema>['params'];
export type UpdateAdminResourceBody = z.infer<typeof updateAdminResourceBodySchema>['body'];
