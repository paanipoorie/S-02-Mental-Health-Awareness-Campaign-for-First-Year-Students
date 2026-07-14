import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../prisma/client.js';

// Mock console.log to reduce test noise
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes?.('🚀') || args[0]?.includes?.('📍') || args[0]?.includes?.('🌍')) {
    return;
  }
  originalConsoleLog(...args);
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only-32chars';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.UNIVERSITY_EMAIL_DOMAIN = 'test.edu';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Global test setup
beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
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
  await prisma.user.deleteMany();
});

// Helper to generate unique test emails
let testEmailCounter = 0;
export function getTestEmail(prefix = 'student'): string {
  return `${prefix}${++testEmailCounter}@test.edu`;
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
