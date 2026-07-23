import { z } from 'zod';
import { EmotionType, UrgencyLevel, EmotionContext } from '@shared-types/enums';

export const createEmotionLogSchema = z.object({
  body: z.object({
    emotion: z.nativeEnum(EmotionType),
    urgencyLevel: z.nativeEnum(UrgencyLevel).optional(),
    context: z.nativeEnum(EmotionContext).default(EmotionContext.STANDALONE),
  }),
});

export const getEmotionTrendsSchema = z.object({
  query: z.object({
    window: z.enum(['24h', '7d', '30d']).optional(),
  }),
});

export type CreateEmotionLogInput = z.infer<typeof createEmotionLogSchema>['body'];
export type GetEmotionTrendsInput = z.infer<typeof getEmotionTrendsSchema>['query'];