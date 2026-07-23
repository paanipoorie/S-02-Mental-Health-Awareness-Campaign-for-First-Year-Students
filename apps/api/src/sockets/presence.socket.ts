import type { Server, Socket } from 'socket.io';
import { prisma } from '../prisma/client.js';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      userId: string;
      role: string;
      email: string;
    };
  };
}

// Track online mentors
const onlineMentors = new Map<string, { socketId: string; userId: string }>();

export function handlePresenceSocket(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.data.user.userId;
  const role = socket.data.user.role;

  // Mentor comes online
  socket.on('presence:mentorOnline', async () => {
    if (role !== 'MENTOR') return;

    try {
      // Update mentor profile
      await prisma.mentorProfile.update({
        where: { userId },
        data: {
          availabilityStatus: 'AVAILABLE',
          lastSeenAt: new Date(),
        },
      });

      // Track online mentor
      onlineMentors.set(userId, { socketId: socket.id, userId });

      // Broadcast mentor online status
      io.emit('presence:mentorOnline', { mentorId: userId });

      console.log(`[Presence] Mentor ${userId} came online`);
    } catch (error) {
      console.error('[Presence] Error setting mentor online:', error);
    }
  });

  // Mentor goes offline (or changes status)
  socket.on('presence:mentorOffline', async (data?: { status?: 'BUSY' | 'OFFLINE' }) => {
    if (role !== 'MENTOR') return;

    try {
      const status = data?.status || 'OFFLINE';

      // Update mentor profile
      await prisma.mentorProfile.update({
        where: { userId },
        data: {
          availabilityStatus: status,
          lastSeenAt: new Date(),
        },
      });

      // Remove from online mentors if offline
      if (status === 'OFFLINE') {
        onlineMentors.delete(userId);
        io.emit('presence:mentorOffline', { mentorId: userId });
      } else {
        // Broadcast status change
        io.emit('presence:mentorStatus', { mentorId: userId, status });
      }

      console.log(`[Presence] Mentor ${userId} status changed to ${status}`);
    } catch (error) {
      console.error('[Presence] Error setting mentor offline:', error);
    }
  });

  // Get list of online mentors (for dashboard)
  socket.on('presence:getOnlineMentors', () => {
    const mentors = Array.from(onlineMentors.values()).map(m => m.userId);
    socket.emit('presence:onlineMentors', { mentors });
  });

  // Handle disconnect
  socket.on('disconnect', async reason => {
    if (role === 'MENTOR' && onlineMentors.has(userId)) {
      try {
        // Update mentor profile to offline
        await prisma.mentorProfile.update({
          where: { userId },
          data: {
            availabilityStatus: 'OFFLINE',
            lastSeenAt: new Date(),
          },
        });

        // Remove from online mentors
        onlineMentors.delete(userId);

        // Broadcast offline status
        io.emit('presence:mentorOffline', { mentorId: userId });

        console.log(`[Presence] Mentor ${userId} disconnected (${reason})`);
      } catch (error) {
        console.error('[Presence] Error handling mentor disconnect:', error);
      }
    }
  });
}
