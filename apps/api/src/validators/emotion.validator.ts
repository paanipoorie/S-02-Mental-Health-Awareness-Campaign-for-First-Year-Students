import { z } from 'zod';
import { EmotionType, UrgencyLevel, EmotionContext } from '@campus-peer-support/shared-types/enums';

export const createEmotionSchema = z.object({
  body: z.object({
    emotion: z.nativeEnum(EmotionType),
    urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
    context: z.nativeEnum(EmotionContext).default(EmotionContext.STANDALONE),
  }),
});

export const getTrendsSchema = z.object({
  query: z.object({
    hours: z.coerce.number().int().positive().max(168).default(24),
  }),
});

export type CreateEmotionInput = z.infer<typeof createEmotionSchema>['body'];
export type GetTrendsInput = z.infer<typeof getTrendsSchema>['query'];
