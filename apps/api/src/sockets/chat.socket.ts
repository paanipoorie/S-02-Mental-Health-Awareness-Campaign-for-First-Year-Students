import type { Server, Socket } from 'socket.io';
import { prisma } from '../prisma/client.js';
import { emotionService } from '../services/emotion.service.js';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      userId: string;
      role: string;
      email: string;
    };
  };
}

export function handleChatSocket(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.data.user.userId;
  const role = socket.data.user.role;

  // Join chat room
  socket.on('chat:join', async (data: { threadId: string }) => {
    try {
      const { threadId } = data;

      // Verify user is a participant in this thread
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: {
          studentIdentity: true,
          mentor: true,
        },
      });

      if (!thread) {
        socket.emit('chat:error', { message: 'Chat thread not found' });
        return;
      }

      // Check authorization
      const isStudent = role === 'STUDENT' && thread.studentIdentityId === userId;
      const isMentor = role === 'MENTOR' && thread.mentorId === userId;

      if (!isStudent && !isMentor) {
        socket.emit('chat:error', { message: 'Not authorized to join this chat' });
        return;
      }

      // Join the room
      socket.join(threadId);
      console.log(`[Chat] User ${userId} joined thread ${threadId}`);

      // Acknowledge join
      socket.emit('chat:joined', { threadId });
    } catch (error) {
      console.error('[Chat] Error joining thread:', error);
      socket.emit('chat:error', { message: 'Failed to join chat' });
    }
  });

  // Send message
  socket.on('chat:message', async (data: { threadId: string; body: string }) => {
    try {
      const { threadId, body } = data;

      if (!body || !body.trim()) {
        socket.emit('chat:error', { message: 'Message cannot be empty' });
        return;
      }

      // Verify user is a participant
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
      });

      if (!thread) {
        socket.emit('chat:error', { message: 'Chat thread not found' });
        return;
      }

      const isStudent = role === 'STUDENT' && thread.studentIdentityId === userId;
      const isMentor = role === 'MENTOR' && thread.mentorId === userId;

      if (!isStudent && !isMentor) {
        socket.emit('chat:error', { message: 'Not authorized to send message' });
        return;
      }

      // Determine sender type and ID
      let senderType: string;
      let senderId: string;

      if (role === 'STUDENT') {
        senderType = 'ANONYMOUS';
        senderId = thread.studentIdentityId;
      } else {
        senderType = 'MENTOR';
        senderId = userId;
      }

      // Create message in database
      const message = await prisma.chatMessage.create({
        data: {
          chatThreadId: threadId,
          senderType,
          senderId,
          body: body.trim(),
        },
      });

      // Get sender info for broadcast
      let senderName: string;
      if (role === 'STUDENT') {
        const identity = await prisma.anonymousIdentity.findUnique({
          where: { id: thread.studentIdentityId },
          select: { displayName: true },
        });
        senderName = identity?.displayName || 'Anonymous';
      } else {
        const mentor = await prisma.user.findUnique({
          where: { id: userId },
          select: { mentorProfile: { select: { department: true } } },
        });
        senderName = mentor?.mentorProfile
          ? `Mentor (${mentor.mentorProfile.department})`
          : 'Mentor';
      }

      // Broadcast message to room
      io.to(threadId).emit('chat:message', {
        id: message.id,
        threadId: message.chatThreadId,
        senderType: message.senderType,
        senderId: message.senderId,
        senderName,
        body: message.body,
        createdAt: message.createdAt,
        readAt: message.readAt,
      });

      console.log(`[Chat] Message sent in thread ${threadId} by ${role} ${userId}`);
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('chat:typing', (data: { threadId: string; isTyping: boolean }) => {
    const { threadId, isTyping } = data;
    socket.to(threadId).emit('chat:typing', {
      userId,
      role,
      isTyping,
    });
  });

  // Read receipt
  socket.on('chat:read', async (data: { threadId: string }) => {
    try {
      const { threadId } = data;

      // Verify user is a participant
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
      });

      if (!thread) {
        return;
      }

      const isStudent = role === 'STUDENT' && thread.studentIdentityId === userId;
      const isMentor = role === 'MENTOR' && thread.mentorId === userId;

      if (!isStudent && !isMentor) {
        return;
      }

      // Mark unread messages as read
      await prisma.chatMessage.updateMany({
        where: {
          chatThreadId: threadId,
          senderId: { not: userId },
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      // Notify other participant
      socket.to(threadId).emit('chat:read', { userId, role });
    } catch (error) {
      console.error('[Chat] Error marking as read:', error);
    }
  });
}
