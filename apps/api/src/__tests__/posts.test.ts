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

  const token = signAccessToken({ userId: user.id, role, email: user.universityEmail, anonymousIdentityId: anon.id });
  return { user, token, anon };
}

describe('Posts (Forum) Integration Tests', () => {
  it('should allow student to create a post and display it', async () => {
    const student = await createTestUser(Role.STUDENT);

    const postResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${student.token}`)
      .send({
        title: 'Feeling stressed about finals',
        body: 'I have three exams next week and feel completely overwhelmed. Any tips?',
        category: 'EXAMS',
        emotion: 'STRESSED',
        urgencyLevel: 'MEDIUM',
      })
      .expect(201);

    expect(postResponse.body.success).toBe(true);
    expect(postResponse.body.data).toMatchObject({
      title: 'Feeling stressed about finals',
      category: 'EXAMS',
      emotion: 'STRESSED',
    });
    expect(postResponse.body.data.anonymousIdentity.displayName).toBe(student.anon.displayName);

    const getResponse = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${student.token}`)
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow a student and a verified mentor to reply to a post', async () => {
    const student = await createTestUser(Role.STUDENT);
    const mentor = await createTestUser(Role.MENTOR, true);

    const post = await prisma.post.create({
      data: {
        title: 'Need a study partner',
        body: 'Looking for someone to study CS with.',
        category: 'ACADEMICS',
        anonymousIdentityId: student.anon.id,
      },
    });

    // Student replies
    const reply1 = await request(app)
      .post(`/api/posts/${post.id}/replies`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ body: 'Count me in! I am free on Tuesday.' })
      .expect(201);

    expect(reply1.body.success).toBe(true);
    expect(reply1.body.data.body).toBe('Count me in! I am free on Tuesday.');

    // Verified mentor replies
    const reply2 = await request(app)
      .post(`/api/posts/${post.id}/replies`)
      .set('Authorization', `Bearer ${mentor.token}`)
      .send({ body: 'I can host a review session if you guys want.' })
      .expect(201);

    expect(reply2.body.success).toBe(true);
    expect(reply2.body.data.body).toBe('I can host a review session if you guys want.');
  });

  it('should block unverified mentor from replying to a post', async () => {
    const student = await createTestUser(Role.STUDENT);
    const unverifiedMentor = await createTestUser(Role.MENTOR, false);

    const post = await prisma.post.create({
      data: {
        title: 'Struggling with sleep',
        body: 'Cannot sleep well before exams.',
        category: 'SLEEP',
        anonymousIdentityId: student.anon.id,
      },
    });

    const replyResponse = await request(app)
      .post(`/api/posts/${post.id}/replies`)
      .set('Authorization', `Bearer ${unverifiedMentor.token}`)
      .send({ body: 'You should try sleep tea.' })
      .expect(403);

    expect(replyResponse.body.success).toBe(false);
    expect(replyResponse.body.error.message).toContain('pending verification');
  });

  it('should allow author or admin to delete a post, but not other users', async () => {
    const author = await createTestUser(Role.STUDENT);
    const bystander = await createTestUser(Role.STUDENT);
    const admin = await createTestUser(Role.ADMIN);

    const post = await prisma.post.create({
      data: {
        title: 'Please delete me later',
        body: 'Test post deletion permissions.',
        category: 'GENERAL',
        anonymousIdentityId: author.anon.id,
      },
    });

    // Bystander attempts delete -> 403
    await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${bystander.token}`)
      .expect(403);

    // Author deletes -> 200/204
    const deleteResponse = await request(app)
      .delete(`/api/posts/${post.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
  });
});
