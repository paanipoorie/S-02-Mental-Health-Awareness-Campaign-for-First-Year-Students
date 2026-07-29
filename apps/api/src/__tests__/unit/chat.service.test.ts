import { describe, it, expect } from 'vitest';
import { prisma } from '../../prisma/client.js';
import { chatService } from '../../services/chat.service.js';
import { Role } from '@campus-peer-support/shared-types';

async function setupStudentAndMentor(studentEmail: string, mentorEmail: string) {
  const student = await prisma.user.create({
    data: {
      universityEmail: studentEmail,
      passwordHash: 'pass',
      role: Role.STUDENT,
    },
  });
  const studentAnon = await prisma.anonymousIdentity.create({
    data: {
      userId: student.id,
      displayName: `Anon ${studentEmail.split('@')[0]}`,
      avatarSeed: 123,
    },
  });

  const mentor = await prisma.user.create({
    data: {
      universityEmail: mentorEmail,
      passwordHash: 'pass',
      role: Role.MENTOR,
      isVerifiedMentor: true,
    },
  });
  await prisma.mentorProfile.create({
    data: {
      userId: mentor.id,
      department: 'Psychology',
      bio: 'Ready to help',
      specialties: ['Anxiety'],
      availabilityStatus: 'AVAILABLE',
    },
  });

  return { student, studentAnon, mentor };
}

describe('Chat Service Unit Tests', () => {
  it('should verify all chat flow service actions', async () => {
    const { student, studentAnon, mentor } = await setupStudentAndMentor(
      'chatunit1@test.edu',
      'chatunit2@test.edu'
    );

    // Create chat thread (should auto-assign the available mentor)
    const thread = await chatService.createChat(student.id, Role.STUDENT, {});
    expect(thread).toBeDefined();
    expect(thread.studentIdentityId).toBe(studentAnon.id);
    expect(thread.mentorId).toBe(mentor.id);
    expect(thread.status).toBe('ACTIVE');

    // Send message as student
    const msg = await chatService.sendMessage(thread.id, student.id, Role.STUDENT, {
      body: 'Unit test chat message',
    });
    expect(msg).toBeDefined();
    expect(msg.body).toBe('Unit test chat message');
    expect(msg.readAt).toBeNull();

    // Fetch messages as mentor
    const messagesResult = await chatService.getMessages(thread.id, mentor.id, Role.MENTOR, {
      page: 1,
      limit: 10,
    });
    expect(messagesResult).not.toBeNull();
    expect(messagesResult!.messages.length).toBe(1);
    expect(messagesResult!.messages[0].body).toBe('Unit test chat message');

    // Mark as read
    await chatService.markAsRead(thread.id, mentor.id, Role.MENTOR);
    const dbMsg = await prisma.chatMessage.findUnique({ where: { id: msg.id } });
    expect(dbMsg?.readAt).not.toBeNull();
  });
});
