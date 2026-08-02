import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../prisma/client.js';
import request from 'supertest';
import type { Application } from 'express';

// Set test environment variables BEFORE any other imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only-32chars';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.UNIVERSITY_EMAIL_DOMAIN = 'cuchd.in';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Mock console.log to reduce test noise
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('🚀') || args[0]?.includes?.('📍') || args[0]?.includes?.('🌍')) {
    return;
  }
  // Suppress OTP noise in test output
  if (typeof args[0] === 'string' && args[0].includes('[OTP][DEV]')) {
    return;
  }
  originalConsoleLog(...args);
};

// Global test setup
beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  await prisma.emailOTP.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.postReply.deleteMany();
  await prisma.post.deleteMany();
  await prisma.emotionLog.deleteMany();
  await prisma.anonymousIdentity.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.adminActionLog.deleteMany();
  await prisma.user.deleteMany();
});

// Helper to generate unique test emails using @cuchd.in domain
let testEmailCounter = 0;
export function getTestEmail(prefix = 'student'): string {
  return `${prefix}${++testEmailCounter}@cuchd.in`;
}

// Helper to generate test password
export const testPassword = 'TestPass123!';

// Helper to create valid student payload
export function validStudentPayload(email: string) {
  return {
    universityEmail: email,
    password: testPassword,
    role: 'STUDENT' as const,
  };
}

// Helper to create valid mentor payload
export function validMentorPayload(email: string) {
  return {
    universityEmail: email,
    password: testPassword,
    role: 'MENTOR' as const,
  };
}

/**
 * Register a user via the OTP flow (sendOTP + verifyOTP) and return the
 * registration response body.
 */
export async function registerViaOTP(
  app: Application,
  email: string,
  role: 'STUDENT' | 'MENTOR' = 'STUDENT',
  password: string = testPassword
) {
  // 1. Send OTP
  const sendRes = await request(app)
    .post('/api/auth/send-otp')
    .send({ universityEmail: email, password, role })
    .expect(200);

  // 2. Retrieve the OTP from the database
  const otpRecord = await prisma.emailOTP.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!otpRecord) {
    throw new Error(`No OTP record found for ${email}`);
  }

// 3. Verify OTP
  const verifyRes = await request(app)
    .post('/api/auth/verify-otp')
    .send({ universityEmail: email, otp: otpRecord.otp })
    .expect(201);

  const data = verifyRes.body.data;

  // Normalize response to include tokens wrapper for backwards compatibility
  return {
    ...data,
    tokens: {
      accessToken: data.accessToken,
      refreshToken: '', // Not returned in verify-otp response
    },
  };
}

/**
 * Login and return the login response tokens + user.
 */
export async function loginAs(
  app: Application,
  email: string,
  password: string = testPassword
) {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ universityEmail: email, password })
    .expect(200);

  return loginRes.body.data;
}
