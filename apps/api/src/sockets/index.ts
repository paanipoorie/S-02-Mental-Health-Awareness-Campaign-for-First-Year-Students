import type { Server as HttpServer } from 'http';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { verifyAccessToken, type TokenPayload } from '../utils/jwt.js';
import { prisma } from '../prisma/client.js';
import { handleChatSocket } from './chat.socket.js';
import { handlePresenceSocket } from './presence.socket.js';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:4321',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token) as TokenPayload & { role: string };
      socket.data.user = payload;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(
      `[Socket] Client connected: ${socket.id}, User: ${socket.data.user?.userId}, Role: ${socket.data.user?.role}`
    );

    // Handle chat events
    handleChatSocket(io, socket);

    // Handle presence events
    handlePresenceSocket(io, socket);

    socket.on('disconnect', reason => {
      console.log(`[Socket] Client disconnected: ${socket.id}, Reason: ${reason}`);
      // Presence socket handles offline status
    });

    socket.on('error', error => {
      console.error(`[Socket] Error for ${socket.id}:`, error);
    });
  });

  return io;
}
