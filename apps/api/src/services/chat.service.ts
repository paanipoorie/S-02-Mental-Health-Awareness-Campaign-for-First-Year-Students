import { prisma } from '../prisma/client.js';
import type {
  CreateChatInput,
  GetChatsQuery,
  GetChatParams,
  GetMessagesQuery,
  SendMessageInput,
  ReadMessagesParams,
} from '../validators/chat.validator.js';
import type { Role } from '@campus-peer-support/shared-types';
import { emitNotification } from './notificationHelper.js';

async function findAvailableMentor() {
  const mentors = await prisma.user.findMany({
    where: {
      role: 'MENTOR',
      isVerifiedMentor: true,
      mentorProfile: {
        availabilityStatus: 'AVAILABLE',
      },
    },
    include: {
      mentorProfile: true,
      chatThreads: {
        where: { status: 'ACTIVE' },
      },
    },
    orderBy: {
      chatThreads: {
        _count: 'asc',
      },
    },
    take: 1,
  });

  return mentors[0] || null;
}

async function getStudentIdentityId(userId: string): Promise<string | null> {
  const identity = await prisma.anonymousIdentity.findUnique({
    where: { userId },
    select: { id: true },
  });
  return identity?.id || null;
}

export const chatService = {
  async createChat(userId: string, role: Role, data: CreateChatInput) {
    if (role === 'STUDENT') {
      const studentIdentityId = await getStudentIdentityId(userId);
      if (!studentIdentityId) {
        throw new Error('STUDENT_IDENTITY_NOT_FOUND');
      }

      // Check if there's already an active chat for this student
      const existingChat = await prisma.chatThread.findFirst({
        where: {
          studentIdentityId,
          status: 'ACTIVE',
        },
      });

      if (existingChat) {
        return existingChat;
      }

      const availableMentor = await findAvailableMentor();

      const chat = await prisma.chatThread.create({
        data: {
          studentIdentityId,
          mentorId: availableMentor?.id ?? null,
          status: 'ACTIVE',
        },
        include: {
          studentIdentity: {
            select: { displayName: true, avatarSeed: true },
          },
          mentor: {
            select: {
              id: true,
              mentorProfile: {
                select: {
                  department: true,
                  bio: true,
                  specialties: true,
                  availabilityStatus: true,
                },
              },
            },
          },
        },
      });

      // Notify the mentor if one was assigned
      if (availableMentor) {
        const studentIdentity = await prisma.anonymousIdentity.findUnique({
          where: { id: studentIdentityId },
          select: { displayName: true },
        });
        await emitNotification(
          availableMentor.id,
          'MENTOR_ASSIGNED',
          'New Student Assigned',
          `${studentIdentity?.displayName || 'A student'} has been assigned to you for support.`,
          { chatId: chat.id, studentIdentityId }
        );
      }

      return chat;
    } else if (role === 'MENTOR') {
      if (!data.studentIdentityId) {
        throw new Error('STUDENT_IDENTITY_ID_REQUIRED');
      }

      const studentIdentity = await prisma.anonymousIdentity.findUnique({
        where: { id: data.studentIdentityId },
      });

      if (!studentIdentity) {
        throw new Error('STUDENT_IDENTITY_NOT_FOUND');
      }

      // Check if there's already an active chat
      const existingChat = await prisma.chatThread.findFirst({
        where: {
          studentIdentityId: data.studentIdentityId,
          mentorId: userId,
          status: 'ACTIVE',
        },
      });

      if (existingChat) {
        return existingChat;
      }

      const chat = await prisma.chatThread.create({
        data: {
          studentIdentityId: data.studentIdentityId,
          mentorId: userId,
          status: 'ACTIVE',
        },
        include: {
          studentIdentity: {
            select: { displayName: true, avatarSeed: true },
          },
          mentor: {
            select: {
              id: true,
              mentorProfile: {
                select: {
                  department: true,
                  bio: true,
                  specialties: true,
                  availabilityStatus: true,
                },
              },
            },
          },
        },
      });

      return chat;
    }

    throw new Error('INVALID_ROLE');
  },

  async getChats(userId: string, role: Role, query: GetChatsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    if (role === 'STUDENT') {
      const studentIdentityId = await getStudentIdentityId(userId);
      if (!studentIdentityId) {
        throw new Error('STUDENT_IDENTITY_NOT_FOUND');
      }

      const [chats, total] = await Promise.all([
        prisma.chatThread.findMany({
          where: { studentIdentityId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            studentIdentity: { select: { displayName: true, avatarSeed: true } },
            mentor: {
              select: {
                id: true,
                mentorProfile: {
                  select: {
                    department: true,
                    bio: true,
                    specialties: true,
                    availabilityStatus: true,
                  },
                },
              },
            },
            _count: { select: { messages: { where: { readAt: null, senderType: 'MENTOR' } } } },
            messages: {
              where: { readAt: null, senderType: 'MENTOR' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { body: true, createdAt: true },
            },
          },
        }),
        prisma.chatThread.count({ where: { studentIdentityId } }),
      ]);

      const mappedChats = chats.map(c => ({
        ...c,
        studentDisplayName: c.studentIdentity?.displayName,
        mentorDisplayName: c.mentor ? 'Mentor' : null,
      }));

      return {
        chats: mappedChats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } else if (role === 'MENTOR') {
      const [chats, total] = await Promise.all([
        prisma.chatThread.findMany({
          where: { mentorId: userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            studentIdentity: { select: { displayName: true, avatarSeed: true } },
            mentor: {
              select: {
                id: true,
                mentorProfile: {
                  select: {
                    department: true,
                    bio: true,
                    specialties: true,
                    availabilityStatus: true,
                  },
                },
              },
            },
            _count: { select: { messages: { where: { readAt: null, senderType: 'ANONYMOUS' } } } },
            messages: {
              where: { readAt: null, senderType: 'ANONYMOUS' },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { body: true, createdAt: true },
            },
          },
        }),
        prisma.chatThread.count({ where: { mentorId: userId } }),
      ]);

      const mappedChats = chats.map(c => ({
        ...c,
        studentDisplayName: c.studentIdentity?.displayName,
        mentorDisplayName: c.mentor ? 'Mentor' : null,
      }));

      return {
        chats: mappedChats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    }

    throw new Error('INVALID_ROLE');
  },

  async getChatById(chatId: string, userId: string, role: Role) {
    const chat = await prisma.chatThread.findUnique({
      where: { id: chatId },
      include: {
        studentIdentity: { select: { displayName: true, avatarSeed: true } },
        mentor: {
          select: {
            id: true,
            mentorProfile: {
              select: { department: true, bio: true, specialties: true, availabilityStatus: true },
            },
          },
        },
      },
    });

    if (!chat) {
      return null;
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && chat.studentIdentityId === studentIdentityId;
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      throw new Error('FORBIDDEN');
    }

    return chat;
  },

  async getMessages(chatId: string, userId: string, role: Role, query: GetMessagesQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const chat = await prisma.chatThread.findUnique({
      where: { id: chatId },
      include: {
        studentIdentity: { select: { displayName: true } },
      },
    });
    if (!chat) {
      return null;
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && chat.studentIdentityId === studentIdentityId;
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      throw new Error('FORBIDDEN');
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { chatThreadId: chatId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatMessage.count({ where: { chatThreadId: chatId } }),
    ]);

    const mappedMessages = messages.map(m => {
      const senderName = m.senderType === 'ANONYMOUS' ? chat.studentIdentity.displayName : 'Mentor';
      return {
        ...m,
        senderName,
      };
    });

    return {
      messages: mappedMessages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async sendMessage(chatId: string, userId: string, role: Role, data: SendMessageInput) {
    const chat = await prisma.chatThread.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && chat.studentIdentityId === studentIdentityId;
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      throw new Error('FORBIDDEN');
    }

    let senderType: string;
    let senderId: string;

    if (role === 'STUDENT') {
      senderType = 'ANONYMOUS';
      senderId = chat.studentIdentityId;
    } else {
      senderType = 'MENTOR';
      senderId = userId;
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatThreadId: chatId,
        senderType,
        senderId,
        body: data.body,
      },
    });

    // Send notification to the other participant
    const messageSnippet = data.body.length > 100 ? data.body.slice(0, 100) + '...' : data.body;
    if (role === 'STUDENT' && chat.mentorId) {
      const studentIdentity = await prisma.anonymousIdentity.findUnique({
        where: { id: chat.studentIdentityId },
        select: { displayName: true },
      });
      await emitNotification(
        chat.mentorId,
        'NEW_CHAT_MESSAGE',
        'New Message from Student',
        `${studentIdentity?.displayName || 'A student'} sent: "${messageSnippet}"`,
        { chatId, messageId: message.id, senderType: 'ANONYMOUS' }
      );
    } else if (role === 'MENTOR') {
      const studentUser = await prisma.anonymousIdentity.findUnique({
        where: { id: chat.studentIdentityId },
        select: { userId: true },
      });
      if (studentUser?.userId) {
        await emitNotification(
          studentUser.userId,
          'NEW_CHAT_MESSAGE',
          'New Message from Mentor',
          `Your mentor sent: "${messageSnippet}"`,
          { chatId, messageId: message.id, senderType: 'MENTOR' }
        );
      }
    }

    return message;
  },

  async markAsRead(chatId: string, userId: string, role: Role) {
    const chat = await prisma.chatThread.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new Error('CHAT_NOT_FOUND');
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && chat.studentIdentityId === studentIdentityId;
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      throw new Error('FORBIDDEN');
    }

    const otherSenderId = role === 'STUDENT' ? chat.studentIdentityId : userId;

    await prisma.chatMessage.updateMany({
      where: {
        chatThreadId: chatId,
        senderId: { not: otherSenderId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { success: true };
  },

  async findAvailableMentor() {
    return findAvailableMentor();
  },

  async getMentorProfile(mentorId: string) {
    return prisma.user.findUnique({
      where: { id: mentorId },
      select: {
        id: true,
        mentorProfile: {
          select: { department: true, bio: true, specialties: true, availabilityStatus: true },
        },
      },
    });
  },

  async getStudentLatestEmotion(studentIdentityId: string) {
    return prisma.emotionLog.findFirst({
      where: { anonymousIdentityId: studentIdentityId },
      orderBy: { createdAt: 'desc' },
      select: { emotion: true, urgencyLevel: true, createdAt: true },
    });
  },
};
