import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { prisma } from '../prisma/client.js';
import { createApp } from '../app.js';
import { signAccessToken } from '../utils/jwt.js';
import { Role } from '@campus-peer-support/shared-types';
import {
  getTestEmail,
  testPassword,
  registerViaOTP,
  loginAs,
} from './setup.js';
import { requireVerifiedMentor, requireRole } from '../middlewares/index.js';

const app = createApp();

describe('Authentication Integration Tests', () => {
  describe('OTP Registration Flow', () => {
    it('should send OTP for a valid @cuchd.in email', async () => {
      const email = getTestEmail('otp-send');
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ universityEmail: email, password: testPassword, role: Role.STUDENT })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(email.toLowerCase().trim());

      // Verify OTP was stored in the database
      const otpRecord = await prisma.emailOTP.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      expect(otpRecord).toBeTruthy();
      expect(otpRecord!.role).toBe('STUDENT');
      expect(otpRecord!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should register a student via OTP with anonymous identity', async () => {
      const email = getTestEmail('student-otp');
      const data = await registerViaOTP(app, email, 'STUDENT');

      expect(data.user).toMatchObject({
        role: Role.STUDENT,
        isVerifiedMentor: false,
      });
      expect(data.user.id).toBeDefined();
      expect(data.anonymousIdentity).toMatchObject({
        id: expect.any(String),
        displayName: expect.stringMatching(/^Anonymous [A-Z][a-z]+ [A-Z][a-z]+$/),
        avatarSeed: expect.any(Number),
      });
      expect(data.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      // Verify user in database
      const user = await prisma.user.findUnique({ where: { universityEmail: email } });
      expect(user).toBeTruthy();
      expect(user!.passwordHash).not.toBe(testPassword);
      expect(user!.role).toBe(Role.STUDENT);

      // Verify anonymous identity was created
      const anonIdentity = await prisma.anonymousIdentity.findUnique({
        where: { userId: user!.id },
      });
      expect(anonIdentity).toBeTruthy();
    });

    it('should register a mentor via OTP without anonymous identity', async () => {
      const email = getTestEmail('mentor-otp');
      const data = await registerViaOTP(app, email, 'MENTOR');

      expect(data.user).toMatchObject({
        role: Role.MENTOR,
        isVerifiedMentor: false,
      });
      expect(data.anonymousIdentity).toBeNull();

      const user = await prisma.user.findUnique({ where: { universityEmail: email } });
      expect(user!.role).toBe(Role.MENTOR);

      const anonIdentity = await prisma.anonymousIdentity.findUnique({
        where: { userId: user!.id },
      });
      expect(anonIdentity).toBeNull();
    });

    it('should reject OTP for invalid email domains', async () => {
      const invalidEmails = [
        'user@gmail.com',
        'user@yahoo.com',
        'user@outlook.com',
        'user@hotmail.com',
        'user@test.edu',
        'user@cuchd.com',
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/send-otp')
          .send({ universityEmail: email, password: testPassword, role: Role.STUDENT })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_EMAIL_DOMAIN');
      }
    });

    it('should reject duplicate email registration via OTP', async () => {
      const email = getTestEmail('duplicate-otp');
      await registerViaOTP(app, email, 'STUDENT');

      // Try sending OTP again for the same email
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ universityEmail: email, password: testPassword, role: Role.STUDENT })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject weak password during OTP send', async () => {
      const email = getTestEmail('weakpass');
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ universityEmail: email, password: 'weak', role: Role.STUDENT })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid OTP', async () => {
      const email = getTestEmail('invalid-otp');
      await request(app)
        .post('/api/auth/send-otp')
        .send({ universityEmail: email, password: testPassword, role: Role.STUDENT })
        .expect(200);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ universityEmail: email, otp: '000000' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_OTP');
    });

    it('should hash password with bcrypt', async () => {
      const email = getTestEmail('hash');
      await registerViaOTP(app, email, 'STUDENT');

      const user = await prisma.user.findUnique({ where: { universityEmail: email } });
      expect(user!.passwordHash).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });
  });

  describe('Login', () => {
    let studentEmail: string;

    beforeEach(async () => {
      studentEmail = getTestEmail('login');
      await registerViaOTP(app, studentEmail, 'STUDENT');
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = await loginAs(app, studentEmail);

      expect(loginData.user).toMatchObject({
        role: Role.STUDENT,
      });
      expect(loginData.accessToken).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ universityEmail: studentEmail, password: 'WrongPass123!' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for unknown account', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ universityEmail: 'unknown@cuchd.in', password: testPassword })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject invalid email domain on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ universityEmail: 'user@gmail.com', password: testPassword })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_EMAIL_DOMAIN');
    });
  });

  describe('Mentor Registration and Verification', () => {
    it('should allow mentor to register and log in immediately (unverified)', async () => {
      const email = getTestEmail('mentor-pending');
      const regData = await registerViaOTP(app, email, 'MENTOR');

      expect(regData.user.role).toBe(Role.MENTOR);
      expect(regData.user.isVerifiedMentor).toBe(false);

      // Mentor can log in
      const loginData = await loginAs(app, email);
      expect(loginData.user.role).toBe(Role.MENTOR);
      expect(loginData.user.isVerifiedMentor).toBe(false);
    });

    it('should block unverified mentor from accessing mentor dashboard', async () => {
      const email = getTestEmail('mentor-blocked');
      await registerViaOTP(app, email, 'MENTOR');
      const loginData = await loginAs(app, email);

      // Attempt to access mentor dashboard
      const response = await request(app)
        .get('/api/dashboard/mentor')
        .set('Authorization', `Bearer ${loginData.accessToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('MENTOR_VERIFICATION_PENDING');
    });

    it('should allow admin to approve a pending mentor', async () => {
      // Create an admin user
      const adminEmail = getTestEmail('admin');
      const adminUser = await prisma.user.create({
        data: {
          universityEmail: adminEmail,
          passwordHash: 'hash',
          role: 'ADMIN',
        },
      });
      const adminToken = signAccessToken({
        userId: adminUser.id,
        role: Role.ADMIN,
        email: adminEmail,
      });

      // Create a pending mentor
      const mentorEmail = getTestEmail('mentor-approve');
      await registerViaOTP(app, mentorEmail, 'MENTOR');
      const mentorUser = await prisma.user.findUnique({
        where: { universityEmail: mentorEmail },
      });

      // Admin approves the mentor
      const approveResponse = await request(app)
        .patch(`/api/admin/mentors/${mentorUser!.id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true })
        .expect(200);

      expect(approveResponse.body.success).toBe(true);

      // Verify mentor is now verified
      const updatedMentor = await prisma.user.findUnique({
        where: { universityEmail: mentorEmail },
      });
      expect(updatedMentor!.isVerifiedMentor).toBe(true);
    });

    it('should allow approved mentor to access mentor dashboard', async () => {
      // Create an admin
      const adminEmail = getTestEmail('admin2');
      const adminUser = await prisma.user.create({
        data: {
          universityEmail: adminEmail,
          passwordHash: 'hash',
          role: 'ADMIN',
        },
      });
      const adminToken = signAccessToken({
        userId: adminUser.id,
        role: Role.ADMIN,
        email: adminEmail,
      });

      // Create and approve a mentor
      const mentorEmail = getTestEmail('mentor-approved');
      await registerViaOTP(app, mentorEmail, 'MENTOR');
      const mentorUser = await prisma.user.findUnique({
        where: { universityEmail: mentorEmail },
      });

      // Approve
      await request(app)
        .patch(`/api/admin/mentors/${mentorUser!.id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isVerified: true })
        .expect(200);

      // Login as the approved mentor
      const loginData = await loginAs(app, mentorEmail);
      expect(loginData.user.isVerifiedMentor).toBe(true);

      // Access mentor dashboard - should work
      const dashResponse = await request(app)
        .get('/api/dashboard/mentor')
        .set('Authorization', `Bearer ${loginData.accessToken}`)
        .expect(200);

      expect(dashResponse.body.success).toBe(true);
    });

    it('should allow admin to reject a pending mentor', async () => {
      const adminEmail = getTestEmail('admin3');
      const adminUser = await prisma.user.create({
        data: {
          universityEmail: adminEmail,
          passwordHash: 'hash',
          role: 'ADMIN',
        },
      });
      const adminToken = signAccessToken({
        userId: adminUser.id,
        role: Role.ADMIN,
        email: adminEmail,
      });

      const mentorEmail = getTestEmail('mentor-rejected');
      await registerViaOTP(app, mentorEmail, 'MENTOR');
      const mentorUser = await prisma.user.findUnique({
        where: { universityEmail: mentorEmail },
      });

      // Reject the mentor
      const rejectResponse = await request(app)
        .post(`/api/admin/mentors/${mentorUser!.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(rejectResponse.body.success).toBe(true);

      // Verify mentor is deactivated
      const updatedMentor = await prisma.user.findUnique({
        where: { universityEmail: mentorEmail },
      });
      expect(updatedMentor!.isActive).toBe(false);
      expect(updatedMentor!.isVerifiedMentor).toBe(false);

      // Rejected mentor can no longer log in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ universityEmail: mentorEmail, password: testPassword })
        .expect(403);

      expect(loginResponse.body.error.code).toBe('ACCOUNT_DEACTIVATED');
    });

    it('should list pending mentors for admin', async () => {
      const adminEmail = getTestEmail('admin4');
      const adminUser = await prisma.user.create({
        data: {
          universityEmail: adminEmail,
          passwordHash: 'hash',
          role: 'ADMIN',
        },
      });
      const adminToken = signAccessToken({
        userId: adminUser.id,
        role: Role.ADMIN,
        email: adminEmail,
      });

      // Create two pending mentors
      await registerViaOTP(app, getTestEmail('pending1'), 'MENTOR');
      await registerViaOTP(app, getTestEmail('pending2'), 'MENTOR');

      // Get pending mentors list
      const response = await request(app)
        .get('/api/admin/mentors/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('universityEmail');
      expect(response.body.data[0]).toHaveProperty('displayName');
      expect(response.body.data[0]).toHaveProperty('createdAt');
    });
  });

  describe('Authentication Middleware', () => {
    let studentToken: string;
    let studentEmail: string;

    beforeEach(async () => {
      studentEmail = getTestEmail('auth');
      const data = await registerViaOTP(app, studentEmail, 'STUDENT');
      studentToken = data.tokens.accessToken;
    });

    it('should allow access to protected route with valid JWT', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        role: Role.STUDENT,
        anonymousDisplayName: expect.stringMatching(/^Anonymous [A-Z][a-z]+ [A-Z][a-z]+$/),
        avatarSeed: expect.any(Number),
      });
      expect(response.body.data).not.toHaveProperty('universityEmail');
      expect(response.body.data).not.toHaveProperty('id');
    });

    it('should return 401 for missing JWT', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should return 401 for invalid JWT', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Refresh Token', () => {
    let studentEmail: string;
    let refreshToken: string;

    beforeEach(async () => {
      studentEmail = getTestEmail('refresh');
      const data = await registerViaOTP(app, studentEmail, 'STUDENT');
      refreshToken = data.tokens.refreshToken;
    });

    it('should rotate access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('Logout', () => {
    let studentEmail: string;
    let refreshToken: string;

    beforeEach(async () => {
      studentEmail = getTestEmail('logout');
      const data = await registerViaOTP(app, studentEmail, 'STUDENT');
      refreshToken = data.tokens.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });

    it('should succeed even with invalid refresh token (idempotent)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Anonymous Identity Isolation', () => {
    it('should never expose email in any API response for students', async () => {
      const email = getTestEmail('isolation');
      const data = await registerViaOTP(app, email, 'STUDENT');
      const accessToken = data.tokens.accessToken;

      // Check registration response
      expect(data.user).not.toHaveProperty('universityEmail');
      expect(data.tokens).not.toHaveProperty('email');

      // Check /me endpoint
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meResponse.body.data).not.toHaveProperty('universityEmail');
      expect(meResponse.body.data).not.toHaveProperty('email');
      expect(meResponse.body.data).not.toHaveProperty('id');
    });
  });

  describe('API Response Validation', () => {
    it('should return consistent response structure', async () => {
      const email = getTestEmail('structure');
      const data = await registerViaOTP(app, email, 'STUDENT');

      await loginAs(app, email);

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${data.tokens.accessToken}`)
        .expect(200);

      expect(meResponse.body).toMatchObject({
        success: true,
        data: expect.any(Object),
      });
    });

    it('should return structured validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ universityEmail: 'invalid', password: 'weak' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('message');
    });
  });

  describe('End-to-End Auth Flow', () => {
    it('should complete full OTP Register -> Login -> Me -> Refresh -> Logout flow', async () => {
      const email = getTestEmail('e2e');

      // 1. Register via OTP
      const data = await registerViaOTP(app, email, 'STUDENT');
      const anonIdentity = data.anonymousIdentity;

      // 2. Login
      const loginData = await loginAs(app, email);
      const accessToken = loginData.accessToken;

      expect(accessToken).toBeDefined();

      // 3. Me endpoint with login token
      const meResponse1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(meResponse1.body.data.anonymousDisplayName).toBe(anonIdentity.displayName);
      expect(meResponse1.body.data.avatarSeed).toBe(anonIdentity.avatarSeed);

      // 4. Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: data.tokens.refreshToken })
        .expect(200);
      const newAccessToken = refreshResponse.body.data.accessToken;
      expect(newAccessToken).toBeDefined();

      // 5. Me endpoint with new token
      const meResponse2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);
      expect(meResponse2.body.data.anonymousDisplayName).toBe(anonIdentity.displayName);

      // 6. Logout
      await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: data.tokens.refreshToken })
        .expect(200);
    });

    it('should complete mentor auth flow without anonymous identity', async () => {
      const email = getTestEmail('mentore2e');

      // Register mentor via OTP
      const data = await registerViaOTP(app, email, 'MENTOR');
      expect(data.anonymousIdentity).toBeNull();

      // Login
      const loginData = await loginAs(app, email);

      // Me endpoint
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginData.accessToken}`)
        .expect(200);

      expect(meResponse.body.data).toMatchObject({
        role: Role.MENTOR,
        isVerifiedMentor: false,
      });
      expect(meResponse.body.data).not.toHaveProperty('anonymousDisplayName');
    });
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  describe('Authorization Middleware', () => {
    it('requireVerifiedMentor should reject unauthenticated requests', async () => {
      const req = {} as any;
      const res = {} as any;
      let nextError: any;
      const next = (err?: any) => {
        nextError = err;
      };

      await requireVerifiedMentor(req, res, next);
      expect(nextError).toBeDefined();
      expect(nextError.code).toBe('MISSING_AUTH');
      expect(nextError.statusCode).toBe(401);
    });

    it('requireVerifiedMentor should reject non-mentors', async () => {
      const req = {
        user: {
          userId: 'some-id',
          role: Role.STUDENT,
          email: 'student@cuchd.in',
        },
      } as any;
      const res = {} as any;
      let nextError: any;
      const next = (err?: any) => {
        nextError = err;
      };

      await requireVerifiedMentor(req, res, next);
      expect(nextError).toBeDefined();
      expect(nextError.code).toBe('FORBIDDEN');
      expect(nextError.statusCode).toBe(403);
    });

    it('requireVerifiedMentor should reject unverified mentors', async () => {
      const email = getTestEmail('unverified-mentor');
      const user = await prisma.user.create({
        data: {
          universityEmail: email,
          passwordHash: 'hash',
          role: 'MENTOR',
          isVerifiedMentor: false,
        },
      });

      const req = {
        user: {
          userId: user.id,
          role: Role.MENTOR,
          email: email,
        },
      } as any;
      const res = {} as any;
      let nextError: any;
      const next = (err?: any) => {
        nextError = err;
      };

      await requireVerifiedMentor(req, res, next);
      expect(nextError).toBeDefined();
      expect(nextError.code).toBe('FORBIDDEN');
      expect(nextError.message).toBe('Mentor not verified');
    });

    it('requireVerifiedMentor should approve verified mentors', async () => {
      const email = getTestEmail('verified-mentor');
      const user = await prisma.user.create({
        data: {
          universityEmail: email,
          passwordHash: 'hash',
          role: 'MENTOR',
          isVerifiedMentor: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
          role: Role.MENTOR,
          email: email,
        },
      } as any;
      const res = {} as any;
      let calledNext = false;
      const next = (err?: any) => {
        if (!err) calledNext = true;
      };

      await requireVerifiedMentor(req, res, next);
      expect(calledNext).toBe(true);
    });

    it('requireRole should allow access to allowed roles', () => {
      const req = {
        user: {
          userId: 'some-id',
          role: Role.STUDENT,
          email: 'student@cuchd.in',
        },
      } as any;
      const res = {} as any;
      let calledNext = false;
      const next = (err?: any) => {
        if (!err) calledNext = true;
      };

      requireRole(Role.STUDENT)(req, res, next);
      expect(calledNext).toBe(true);
    });

    it('requireRole should reject other roles', () => {
      const req = {
        user: {
          userId: 'some-id',
          role: Role.STUDENT,
          email: 'student@cuchd.in',
        },
      } as any;
      const res = {} as any;
      let nextError: any;
      const next = (err?: any) => {
        nextError = err;
      };

      requireRole(Role.ADMIN)(req, res, next);
      expect(nextError).toBeDefined();
      expect(nextError.code).toBe('FORBIDDEN');
    });
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
});

