import type { NotificationType } from '@prisma/client';
import type { Server as SocketIOServer } from 'socket.io';
import { notificationService } from './notification.service.js';

let io: SocketIOServer | null = null;

export function setSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

export async function emitNotification(
  recipientUserId: string,
  type: NotificationType,
  title: string,
  body: string,
  payload?: Record<string, unknown>
) {
  const notification = await notificationService.create({
    recipientUserId,
    type,
    title,
    body,
    payload: payload ?? undefined,
  });

  if (io) {
    io.to(`notifications:${recipientUserId}`).emit('notification:new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      payload: payload || null,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }
}

export async function emitNotificationToMultiple(
  recipientUserIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  payload?: Record<string, unknown>
) {
  for (const userId of recipientUserIds) {
    await emitNotification(userId, type, title, body, payload);
  }
}
