import type { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      userId: string;
      role: string;
      email: string;
    };
  };
}

export function handleNotificationSocket(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.data.user.userId;
  const role = socket.data.user.role;

  // Join user-specific notification room
  socket.join(`notifications:${userId}`);
  console.log(`[Notifications] User ${userId} (${role}) joined notification room`);

  // Leave on disconnect (handled automatically by Socket.io rooms)
}
