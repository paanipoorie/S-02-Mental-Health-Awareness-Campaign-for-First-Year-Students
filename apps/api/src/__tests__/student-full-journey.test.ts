import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { prisma } from '../prisma/client.js';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.js';
import { Role } from '@campus-peer-support/shared-types';
import { getTestEmail, testPassword } from './setup.js';

const app = createApp();

describe('Student Full Journey E2E Integration Test', () => {
  it('should complete the entire student lifecycle journey successfully', async () => {
    const studentEmail = getTestEmail('student-journey');
    const mentorEmail = getTestEmail('mentor-journey');

    // 1. Pre-create a verified mentor to allow support chat assignment
    const mentor = await prisma.user.create({
      data: {
        universityEmail: mentorEmail,
        passwordHash: 'hashed',
        role: Role.MENTOR,
        isVerifiedMentor: true,
      },
    });
    await prisma.mentorProfile.create({
      data: {
        userId: mentor.id,
        department: 'Student Support',
        bio: 'Ready to listen.',
        specialties: ['Anxiety', 'Stress'],
        availabilityStatus: 'AVAILABLE',
      },
    });

    // 2. Register Student
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        universityEmail: studentEmail,
        password: testPassword,
        role: 'STUDENT',
      })
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.user).toBeDefined();

    // 3. Login Student
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        universityEmail: studentEmail,
        password: testPassword,
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    const accessToken = loginResponse.body.data.accessToken;
    expect(accessToken).toBeDefined();

    // 4. Log Emotion Check-in
    const emotionResponse = await request(app)
      .post('/api/emotions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        emotion: 'ANXIOUS',
        urgencyLevel: 'MEDIUM',
        notes: 'Feeling a bit nervous about the upcoming exam.',
      })
      .expect(201);

    expect(emotionResponse.body.success).toBe(true);
    expect(emotionResponse.body.data.emotion).toBe('ANXIOUS');

    // 5. Retrieve Student Dashboard
    const dashboardResponse = await request(app)
      .get('/api/dashboard/student')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(dashboardResponse.body.success).toBe(true);
    expect(dashboardResponse.body.data.currentEmotion.emotion).toBe('ANXIOUS');

    // 6. Create Forum Post (Anonymous)
    const postResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Workload management tips?',
        body: 'Finding it hard to balance assignments and self-care.',
        category: 'TIME_MANAGEMENT',
        emotion: 'BURNT_OUT',
        urgencyLevel: 'LOW',
      })
      .expect(201);

    expect(postResponse.body.success).toBe(true);
    const postId = postResponse.body.data.id;

    // 7. Verify post is visible in public feed
    const feedResponse = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(feedResponse.body.success).toBe(true);
    const foundPost = feedResponse.body.data.find((p: any) => p.id === postId);
    expect(foundPost).toBeDefined();

    // 8. Start Support Chat with Mentor (should auto-assign the pre-created mentor)
    const chatResponse = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ mentorId: mentor.id })
      .expect(201);

    expect(chatResponse.body.success).toBe(true);
    const threadId = chatResponse.body.data.id;
    expect(chatResponse.body.data.mentorId).toBe(mentor.id);

    // 9. Send Chat Message
    const msgResponse = await request(app)
      .post(`/api/chats/${threadId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ body: 'Hello mentor, thank you for accepting the chat request.' })
      .expect(201);

    expect(msgResponse.body.success).toBe(true);

    // 10. Schedule Peer Study Meeting
    const meetingResponse = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Weekly calculus preparative group',
        description: 'Solving homework problems together.',
        date: new Date(Date.now() + 172800000).toISOString(),
        time: '16:00',
        durationMinutes: 60,
        meetingType: 'ONLINE',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        category: 'STUDY_GROUP',
        hostType: 'STUDENT',
      })
      .expect(201);

    expect(meetingResponse.body.success).toBe(true);

    // 11. Schedule a Workshop (as mentor) and register Student for it
    const mentorToken = signAccessToken({
      userId: mentor.id,
      role: Role.MENTOR,
      email: mentor.universityEmail,
    });
    const workshopResponse = await request(app)
      .post('/api/workshops')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({
        title: 'Self-Care Habits for Students',
        description: 'A mentor-led workshop on stress reduction.',
        date: new Date(Date.now() + 259200000).toISOString(),
        time: '14:00',
        durationMinutes: 90,
        meetingType: 'ONLINE',
        meetingLink: 'https://zoom.us/j/12345678',
        category: 'STRESS_MANAGEMENT',
        maxAttendees: 50,
      })
      .expect(201);

    const workshopId = workshopResponse.body.data.id;

    // Register Student for Workshop
    const registerWorkshopResponse = await request(app)
      .post(`/api/workshops/${workshopId}/register`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(registerWorkshopResponse.body.success).toBe(true);

    // 12. Logout
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);
  });
});
