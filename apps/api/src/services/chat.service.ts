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
    console.log(`[ChatService] createChat: userId=${userId}, role=${role}, peerIdentityId=${data.peerIdentityId}, studentIdentityId=${data.studentIdentityId}`);
    if (role === 'STUDENT') {
      const studentIdentityId = await getStudentIdentityId(userId);
      if (!studentIdentityId) {
        throw new Error('STUDENT_IDENTITY_NOT_FOUND');
      }

      // Check if this is a student-to-student peer chat
      if (data.peerIdentityId) {
        if (studentIdentityId === data.peerIdentityId) {
          throw new Error('CANNOT_CHAT_WITH_SELF');
        }

        // Verify other student identity exists
        const peerExists = await prisma.anonymousIdentity.findUnique({
          where: { id: data.peerIdentityId }
        });
        if (!peerExists) {
          throw new Error('PEER_IDENTITY_NOT_FOUND');
        }

        // Check if there is already an active peer chat between these two students
        const existingChat = await prisma.chatThread.findFirst({
          where: {
            status: 'ACTIVE',
            OR: [
              { studentIdentityId, peerIdentityId: data.peerIdentityId },
              { studentIdentityId: data.peerIdentityId, peerIdentityId: studentIdentityId }
            ]
          },
          include: {
            studentIdentity: {
              select: { displayName: true, avatarSeed: true },
            },
            peerIdentity: {
              select: { displayName: true, avatarSeed: true },
            }
          }
        });

        if (existingChat) {
          return existingChat;
        }

        const chat = await prisma.chatThread.create({
          data: {
            studentIdentityId,
            peerIdentityId: data.peerIdentityId,
            status: 'ACTIVE',
          },
          include: {
            studentIdentity: {
              select: { displayName: true, avatarSeed: true },
            },
            peerIdentity: {
              select: { displayName: true, avatarSeed: true },
            }
          }
        });

        return chat;
      }

      // Check if there's already an active student-to-mentor chat for this student
      const existingChat = await prisma.chatThread.findFirst({
        where: {
          studentIdentityId,
          mentorId: { not: null },
          peerIdentityId: null,
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
          peerIdentityId: null,
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
    console.log(`[ChatService] getChats (sidebar fetch): userId=${userId}, role=${role}`);
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    if (role === 'STUDENT') {
      const studentIdentityId = await getStudentIdentityId(userId);
      if (!studentIdentityId) {
        throw new Error('STUDENT_IDENTITY_NOT_FOUND');
      }

      const [chats, total] = await Promise.all([
        prisma.chatThread.findMany({
          where: {
            OR: [
              { studentIdentityId },
              { peerIdentityId: studentIdentityId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            studentIdentity: { select: { displayName: true, avatarSeed: true } },
            peerIdentity: { select: { displayName: true, avatarSeed: true } },
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
            _count: {
              select: {
                messages: {
                  where: {
                    readAt: null,
                    senderId: { not: studentIdentityId }
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { body: true, createdAt: true },
            },
          },
        }),
        prisma.chatThread.count({
          where: {
            OR: [
              { studentIdentityId },
              { peerIdentityId: studentIdentityId }
            ]
          }
        }),
      ]);

      const mappedChats = chats.map(c => {
        let otherDisplayName = 'Unknown';
        let otherAvatarSeed = 0;
        const isOwn = c.studentIdentityId === studentIdentityId;

        if (c.peerIdentityId) {
          const peer = isOwn ? c.peerIdentity : c.studentIdentity;
          otherDisplayName = peer?.displayName || 'Anonymous';
          otherAvatarSeed = peer?.avatarSeed || 0;
        } else if (c.mentor) {
          otherDisplayName = 'Mentor';
        }

        return {
          ...c,
          studentDisplayName: c.studentIdentity?.displayName,
          peerDisplayName: c.peerIdentity?.displayName,
          mentorDisplayName: c.mentor ? 'Mentor' : null,
          otherDisplayName,
          otherAvatarSeed,
          unreadCount: c._count.messages,
          lastMessage: c.messages[0] || null,
        };
      });

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
          where: { mentorId: userId, peerIdentityId: null },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            studentIdentity: { select: { displayName: true, avatarSeed: true } },
            peerIdentity: { select: { displayName: true, avatarSeed: true } },
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
            _count: {
              select: {
                messages: {
                  where: {
                    readAt: null,
                    senderId: { not: userId }
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { body: true, createdAt: true },
            },
          },
        }),
        prisma.chatThread.count({ where: { mentorId: userId, peerIdentityId: null } }),
      ]);

      const mappedChats = chats.map(c => {
        return {
          ...c,
          studentDisplayName: c.studentIdentity?.displayName,
          peerDisplayName: c.peerIdentity?.displayName,
          mentorDisplayName: c.mentor ? 'Mentor' : null,
          otherDisplayName: c.studentIdentity?.displayName || 'Anonymous',
          otherAvatarSeed: c.studentIdentity?.avatarSeed || 0,
          unreadCount: c._count.messages,
          lastMessage: c.messages[0] || null,
        };
      });

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
    console.log(`[ChatService] getChatById (thread lookup): chatId=${chatId}, userId=${userId}, role=${role}`);
    const chat = await prisma.chatThread.findUnique({
      where: { id: chatId },
      include: {
        studentIdentity: { select: { displayName: true, avatarSeed: true } },
        peerIdentity: { select: { displayName: true, avatarSeed: true } },
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
      console.log(`[ChatService] getChatById: Chat not found: chatId=${chatId}`);
      return null;
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && 
      (chat.studentIdentityId === studentIdentityId || chat.peerIdentityId === studentIdentityId);
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      console.log(`[ChatService] getChatById: FORBIDDEN for userId=${userId}, chatId=${chatId}`);
      throw new Error('FORBIDDEN');
    }

    console.log(`[ChatService] getChatById: Found chat ${chatId}. Mapping displayName properties...`);
    return {
      ...chat,
      studentDisplayName: chat.studentIdentity?.displayName || null,
      peerDisplayName: chat.peerIdentity?.displayName || null,
      mentorDisplayName: chat.mentor ? 'Mentor' : null,
    };
  },

  async getMessages(chatId: string, userId: string, role: Role, query: GetMessagesQuery) {
    console.log(`[ChatService] getMessages (message fetch): chatId=${chatId}, userId=${userId}, page=${query.page}, limit=${query.limit}`);
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const chat = await prisma.chatThread.findUnique({
      where: { id: chatId },
      include: {
        studentIdentity: { select: { displayName: true } },
        peerIdentity: { select: { displayName: true } },
      },
    });
    if (!chat) {
      return null;
    }

    const studentIdentityId = await getStudentIdentityId(userId);
    const isStudent = role === 'STUDENT' && 
      (chat.studentIdentityId === studentIdentityId || chat.peerIdentityId === studentIdentityId);
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
      let senderName = 'Unknown';
      if (m.senderType === 'ANONYMOUS') {
        if (m.senderId === chat.studentIdentityId) {
          senderName = chat.studentIdentity.displayName;
        } else if (m.senderId === chat.peerIdentityId) {
          senderName = chat.peerIdentity?.displayName || 'Anonymous';
        }
      } else {
        senderName = 'Mentor';
      }
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
    const isStudent = role === 'STUDENT' && 
      (chat.studentIdentityId === studentIdentityId || chat.peerIdentityId === studentIdentityId);
    const isMentor = role === 'MENTOR' && chat.mentorId === userId;

    if (!isStudent && !isMentor) {
      throw new Error('FORBIDDEN');
    }

    let senderType: string;
    let senderId: string;

    if (role === 'STUDENT') {
      senderType = 'ANONYMOUS';
      senderId = studentIdentityId!;
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
    if (role === 'STUDENT') {
      if (chat.peerIdentityId) {
        const isOwn = chat.studentIdentityId === studentIdentityId;
        const otherIdentityId = isOwn ? chat.peerIdentityId : chat.studentIdentityId;
        const otherIdentity = await prisma.anonymousIdentity.findUnique({
          where: { id: otherIdentityId },
          select: { userId: true }
        });
        if (otherIdentity?.userId) {
          const senderIdentity = await prisma.anonymousIdentity.findUnique({
            where: { id: studentIdentityId! },
            select: { displayName: true }
          });
          const recipientUserId = otherIdentity.userId as string;
          await emitNotification(
            recipientUserId,
            'NEW_CHAT_MESSAGE',
            'New Message from Peer',
            `${senderIdentity?.displayName || 'A peer'} sent: "${messageSnippet}"`,
            { chatId, messageId: message.id, senderType: 'ANONYMOUS' }
          );
        }
      } else if (chat.mentorId) {
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
      }
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
