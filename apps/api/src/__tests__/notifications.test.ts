import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../prisma/client.js';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.js';
import { Role } from '@campus-peer-support/shared-types';
import { getTestEmail } from './setup.js';

const app = createApp();

async function createTestUser(role: Role) {
  const email = getTestEmail(`notifications-${role.toLowerCase()}`);
  const user = await prisma.user.create({
    data: {
      universityEmail: email,
      passwordHash: 'hashedpassword',
      role,
    },
  });

  const anon = await prisma.anonymousIdentity.create({
    data: {
      userId: user.id,
      displayName: `Anonymous ${role} ${Math.random().toString(36).slice(2, 9)}`,
      avatarSeed: 321,
    },
  });

  const token = signAccessToken({
    userId: user.id,
    role,
    email: user.universityEmail,
    anonymousIdentityId: anon.id,
  });

  return { user, token, anon };
}

describe('Notifications Integration Tests', () => {
  it('should return notifications with unread count metadata', async () => {
    const student = await createTestUser(Role.STUDENT);

    await prisma.notification.createMany({
      data: [
        {
          recipientUserId: student.user.id,
          type: 'NEW_REPLY',
          title: 'New reply',
          body: 'Someone replied to your post',
          isRead: false,
        },
        {
          recipientUserId: student.user.id,
          type: 'NEW_CHAT_MESSAGE',
          title: 'New message',
          body: 'You received a new message',
          isRead: true,
        },
      ],
    });

    const response = await request(app)
      .get('/api/notifications?page=1&limit=10')
      .set('Authorization', `Bearer ${student.token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.unreadCount).toBe(1);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });
});
