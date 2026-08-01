import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../prisma/client.js';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.js';
import { Role } from '@campus-peer-support/shared-types';
import { getTestEmail } from './setup.js';

const app = createApp();

async function createTestUser(role: Role, isVerifiedMentor = false) {
  const email = getTestEmail(role.toLowerCase());
  const user = await prisma.user.create({
    data: {
      universityEmail: email,
      passwordHash: 'hashedpassword',
      role,
      isVerifiedMentor,
    },
  });

  const anon = await prisma.anonymousIdentity.create({
    data: {
      userId: user.id,
      displayName: `Anonymous ${role} ${Math.random().toString(36).substring(2, 9)}`,
      avatarSeed: 123,
    },
  });

  if (role === Role.MENTOR) {
    await prisma.mentorProfile.create({
      data: {
        userId: user.id,
        department: 'Support Dept',
        bio: 'Helper',
        specialties: ['Anxiety'],
        availabilityStatus: 'AVAILABLE',
      },
    });
  }

  const token = signAccessToken({
    userId: user.id,
    role,
    email: user.universityEmail,
    anonymousIdentityId: anon.id,
  });
  return { user, token, anon };
}

describe('Chat Support Integration Tests', () => {
  it('should allow student to start chat with a verified mentor', async () => {
    const student = await createTestUser(Role.STUDENT);
    const mentor = await createTestUser(Role.MENTOR, true);

    const chatResponse = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ mentorId: mentor.user.id })
      .expect(201);

    expect(chatResponse.body.success).toBe(true);
    expect(chatResponse.body.data).toMatchObject({
      studentIdentityId: student.anon.id,
      mentorId: mentor.user.id,
      status: 'ACTIVE',
    });
  });

  it('should block unverified mentor from engaging in chats', async () => {
    const student = await createTestUser(Role.STUDENT);
    const unverifiedMentor = await createTestUser(Role.MENTOR, false);

    // Unverified mentor attempting to start a chat thread -> 403 because mentor is unverified
    const chatResponse = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${unverifiedMentor.token}`)
      .send({ studentIdentityId: student.anon.id })
      .expect(403);

    expect(chatResponse.body.success).toBe(false);
    expect(chatResponse.body.error.message).toContain('pending verification');
  });

  it('should allow sending and listing messages inside a chat thread', async () => {
    const student = await createTestUser(Role.STUDENT);
    const mentor = await createTestUser(Role.MENTOR, true);

    // Start chat
    const thread = await prisma.chatThread.create({
      data: {
        studentIdentityId: student.anon.id,
        mentorId: mentor.user.id,
        status: 'ACTIVE',
      },
    });

    // Send message as student
    const sendResponse = await request(app)
      .post(`/api/chats/${thread.id}/messages`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ body: 'Hello mentor, I need advice on handling workload.' })
      .expect(201);

    expect(sendResponse.body.success).toBe(true);
    expect(sendResponse.body.data.body).toBe('Hello mentor, I need advice on handling workload.');

    // Fetch messages as mentor
    const listResponse = await request(app)
      .get(`/api/chats/${thread.id}/messages`)
      .set('Authorization', `Bearer ${mentor.token}`)
      .expect(200);

    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.length).toBe(1);
    expect(listResponse.body.data[0].body).toBe(
      'Hello mentor, I need advice on handling workload.'
    );
  });

  it('should allow marking messages in a chat thread as read', async () => {
    const student = await createTestUser(Role.STUDENT);
    const mentor = await createTestUser(Role.MENTOR, true);

    // Start chat
    const thread = await prisma.chatThread.create({
      data: {
        studentIdentityId: student.anon.id,
        mentorId: mentor.user.id,
        status: 'ACTIVE',
      },
    });

    // Student sends message
    await prisma.chatMessage.create({
      data: {
        chatThreadId: thread.id,
        senderId: student.user.id,
        senderType: 'STUDENT',
        body: 'Unread message',
        readAt: null,
      },
    });

    // Mentor marks read
    const readResponse = await request(app)
      .patch(`/api/chats/${thread.id}/read`)
      .set('Authorization', `Bearer ${mentor.token}`)
      .expect(200);

    expect(readResponse.body.success).toBe(true);

    const message = await prisma.chatMessage.findFirst({
      where: { chatThreadId: thread.id },
    });
    expect(message?.readAt).not.toBeNull();
  });
});
