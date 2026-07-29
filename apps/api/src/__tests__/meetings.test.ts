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

describe('Meetings and Workshops Integration Tests', () => {
  it('should allow student to create a peer meeting and toggle RSVPs', async () => {
    const student = await createTestUser(Role.STUDENT);
    const peer = await createTestUser(Role.STUDENT);

    // Create meeting
    const response = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${student.token}`)
      .send({
        title: 'Midterm Study Session',
        description: 'CS midterm preparation.',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '14:00',
        durationMinutes: 90,
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        category: 'STUDY_GROUP',
        hostType: 'STUDENT',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    const meetingId = response.body.data.id;

    // RSVP
    const rsvp1 = await request(app)
      .post(`/api/meetings/${meetingId}/rsvp`)
      .set('Authorization', `Bearer ${peer.token}`)
      .expect(200);

    expect(rsvp1.body.success).toBe(true);
    expect(rsvp1.body.data.rsvped).toBe(true);

    // RSVP Cancel (toggle)
    const rsvp2 = await request(app)
      .post(`/api/meetings/${meetingId}/rsvp`)
      .set('Authorization', `Bearer ${peer.token}`)
      .expect(200);

    expect(rsvp2.body.success).toBe(true);
    expect(rsvp2.body.data.rsvped).toBe(false);
  });

  it('should allow verified mentor to create a workshop and student to register', async () => {
    const mentor = await createTestUser(Role.MENTOR, true);
    const student = await createTestUser(Role.STUDENT);

    // Create workshop
    const response = await request(app)
      .post('/api/workshops')
      .set('Authorization', `Bearer ${mentor.token}`)
      .send({
        title: 'Managing Exam Stress',
        description: 'Breathing exercises and stress coping mechanisms.',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '11:00',
        durationMinutes: 60,
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        category: 'STRESS_MANAGEMENT',
        maxAttendees: 30,
        resources: 'Stress coping sheet PDF',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    const workshopId = response.body.data.id;

    // Register
    const registerResponse = await request(app)
      .post(`/api/workshops/${workshopId}/register`)
      .set('Authorization', `Bearer ${student.token}`)
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
  });

  it('should block unverified mentor from creating a workshop', async () => {
    const unverifiedMentor = await createTestUser(Role.MENTOR, false);

    await request(app)
      .post('/api/workshops')
      .set('Authorization', `Bearer ${unverifiedMentor.token}`)
      .send({
        title: 'Sleep Hygiene 101',
        description: 'Better sleep habits.',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '18:00',
        durationMinutes: 45,
        meetingType: 'ONLINE',
        category: 'SLEEP_HYGIENE',
      })
      .expect(403);
  });
});
