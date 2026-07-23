import { PrismaClient, EmotionType, UrgencyLevel, EmotionContext } from '@prisma/client';
import { CreateEmotionLogInput, GetEmotionTrendsQuery } from '../validators/emotion.validator';

const prisma = new PrismaClient();

export const emotionService = {
  async createEmotionLog(
    anonymousIdentityId: string,
    data: CreateEmotionLogInput
  ) {
    const { emotion, urgencyLevel, context } = data;

    const emotionLog = await prisma.emotionLog.create({
      data: {
        anonymousIdentityId,
        emotion,
        urgencyLevel,
        context,
      },
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
      },
    });

    return emotionLog;
  },

  async getLatestEmotion(anonymousIdentityId: string) {
    const emotionLog = await prisma.emotionLog.findFirst({
      where: { anonymousIdentityId },
      orderBy: { createdAt: 'desc' },
      include: {
        anonymousIdentity: {
          select: {
            displayName: true,
            avatarSeed: true,
          },
        },
      },
    });

    return emotionLog;
  },

  async getEmotionTrends(query: GetEmotionTrendsQuery) {
    const { window } = query;

    const now = new Date();
    let startDate: Date;

    switch (window) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    const logs = await prisma.emotionLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        context: {
          in: [EmotionContext.STANDALONE, EmotionContext.POST, EmotionContext.CHAT],
        },
      },
      select: {
        emotion: true,
        urgencyLevel: true,
        createdAt: true,
      },
    });

    const emotionCounts: Record<EmotionType, number> = {
      HAPPY: 0,
      EXCITED: 0,
      CONFUSED: 0,
      HOMESICK: 0,
      LONELY: 0,
      SCARED: 0,
      ANXIOUS: 0,
      BURNT_OUT: 0,
      OVERWHELMED: 0,
      STRESSED: 0,
    };

    const urgencyCounts: Record<UrgencyLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    const emotionUrgencyBreakdown: Record<EmotionType, Record<UrgencyLevel, number>> = {
      HAPPY: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      EXCITED: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      CONFUSED: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      HOMESICK: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      LONELY: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      SCARED: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      ANXIOUS: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      BURNT_OUT: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      OVERWHELMED: { LOW: 0, MEDIUM: 0, HIGH: 0 },
      STRESSED: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    };

    for (const log of logs) {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;

      if (log.urgencyLevel) {
        urgencyCounts[log.urgencyLevel] = (urgencyCounts[log.urgencyLevel] || 0) + 1;
        emotionUrgencyBreakdown[log.emotion][log.urgencyLevel] =
          (emotionUrgencyBreakdown[log.emotion][log.urgencyLevel] || 0) + 1;
      } else {
        urgencyCounts.LOW = (urgencyCounts.LOW || 0) + 1;
        emotionUrgencyBreakdown[log.emotion].LOW =
          (emotionUrgencyBreakdown[log.emotion].LOW || 0) + 1;
      }
    }

    return {
      window,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalLogs: logs.length,
      emotionCounts,
      urgencyCounts,
      emotionUrgencyBreakdown,
    };
  },
};