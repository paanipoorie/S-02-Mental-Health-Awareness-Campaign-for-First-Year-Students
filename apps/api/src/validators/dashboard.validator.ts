import { z } from 'zod';
import { Role } from '@campus-peer-support/shared-types';

export const getStudentDashboardSchema = z.object({
  query: z.object({}).optional(),
});

export const getMentorDashboardSchema = z.object({
  query: z.object({}).optional(),
});

export const getAdminDashboardSchema = z.object({
  query: z.object({}).optional(),
});

export const updateMentorAvailabilitySchema = z.object({
  body: z.object({
    availabilityStatus: z.enum([
      Role.MENTOR === 'MENTOR' ? 'AVAILABLE' : 'AVAILABLE',
      'BUSY',
      'OFFLINE',
    ]),
  }),
});

export type GetStudentDashboardInput = z.infer<typeof getStudentDashboardSchema>;
export type GetMentorDashboardInput = z.infer<typeof getMentorDashboardSchema>;
export type GetAdminDashboardInput = z.infer<typeof getAdminDashboardSchema>;
export type UpdateMentorAvailabilityInput = z.infer<typeof updateMentorAvailabilitySchema>;
