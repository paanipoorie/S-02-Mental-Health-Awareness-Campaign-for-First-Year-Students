import { z } from 'zod';
import {
  MeetingType,
  MeetingHostType,
  MeetingCategory,
  WorkshopCategory,
  WorkshopRegistrationStatus,
} from '@campus-peer-support/shared-types/enums';

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    durationMinutes: z.number().int().positive().max(480, 'Duration cannot exceed 480 minutes'),
    meetingType: z.nativeEnum(MeetingType, {
      errorMap: () => ({ message: 'Meeting type must be ONLINE or OFFLINE' }),
    }),
    meetingLink: z.string().url('Invalid meeting link').optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    category: z.nativeEnum(MeetingCategory, {
      errorMap: () => ({ message: 'Invalid meeting category' }),
    }),
    hostType: z.nativeEnum(MeetingHostType, {
      errorMap: () => ({ message: 'Host type must be STUDENT or MENTOR' }),
    }),
  }),
});

export const getMeetingsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    upcoming: z.coerce.boolean().optional(),
    category: z.nativeEnum(MeetingCategory).optional(),
    hostType: z.nativeEnum(MeetingHostType).optional(),
  }),
});

export const getMeetingParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid meeting ID'),
  }),
});

export const rsvpMeetingParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid meeting ID'),
  }),
});

export const createWorkshopSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters'),
    date: z.string().datetime({ message: 'Invalid date format' }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format'),
    durationMinutes: z.number().int().positive().max(480, 'Duration cannot exceed 480 minutes'),
    meetingType: z.nativeEnum(MeetingType, {
      errorMap: () => ({ message: 'Meeting type must be ONLINE or OFFLINE' }),
    }),
    meetingLink: z.string().url('Invalid meeting link').optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    category: z.nativeEnum(WorkshopCategory, {
      errorMap: () => ({ message: 'Invalid workshop category' }),
    }),
    maxAttendees: z.number().int().positive().optional().nullable(),
    resources: z.string().optional().nullable(),
  }),
});

export const getWorkshopsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    upcoming: z.coerce.boolean().optional(),
    category: z.nativeEnum(WorkshopCategory).optional(),
  }),
});

export const getWorkshopParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid workshop ID'),
  }),
});

export const workshopRegistrationParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid workshop ID'),
  }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    anonymousIdentityId: z.string().cuid('Invalid anonymous identity ID'),
    status: z.nativeEnum(WorkshopRegistrationStatus, {
      errorMap: () => ({ message: 'Invalid registration status' }),
    }),
  }),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>['body'];
export type GetMeetingsQuery = z.infer<typeof getMeetingsQuerySchema>['query'];
export type GetMeetingParams = z.infer<typeof getMeetingParamsSchema>['params'];
export type RsvpMeetingParams = z.infer<typeof rsvpMeetingParamsSchema>['params'];
export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>['body'];
export type GetWorkshopsQuery = z.infer<typeof getWorkshopsQuerySchema>['query'];
export type GetWorkshopParams = z.infer<typeof getWorkshopParamsSchema>['params'];
export type WorkshopRegistrationParams = z.infer<typeof workshopRegistrationParamsSchema>['params'];
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>['body'];
