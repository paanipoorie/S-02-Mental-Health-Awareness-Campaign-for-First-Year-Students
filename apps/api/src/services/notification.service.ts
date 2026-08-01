import type { NotificationType } from '@prisma/client';
import { prisma } from '../prisma/client.js';

export interface CreateNotificationInput {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, unknown> | undefined | null;
}

export const notificationService = {
  async create(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        recipientUserId: data.recipientUserId,
        type: data.type,
        title: data.title,
        body: data.body,
        payload: (data.payload ?? undefined) as any,
      },
    });
    return notification;
  },

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientUserId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { recipientUserId: userId } }),
      prisma.notification.count({
        where: { recipientUserId: userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, recipientUserId: userId },
    });
    if (!notification) throw new Error('Notification not found');
    if (notification.isRead) return notification;

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { recipientUserId: userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { recipientUserId: userId, isRead: false },
    });
  },
};
