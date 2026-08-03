import { describe, it, expect } from 'vitest';
import { prisma } from '../../prisma/client.js';
import { adminService } from '../../services/admin.service.js';
import { Role } from '@campus-peer-support/shared-types';

async function createAdminUser(email: string) {
  return prisma.user.create({
    data: {
      universityEmail: email,
      passwordHash: 'pass',
      role: Role.ADMIN,
    },
  });
}

describe('Admin Service Unit Tests', () => {
  it('should retrieve platform statistics and manage user states', async () => {
    const admin = await createAdminUser('adminunit1@cuchd.in');
    const student = await prisma.user.create({
      data: {
        universityEmail: 'studentunit1@cuchd.in',
        passwordHash: 'pass',
        role: Role.STUDENT,
      },
    });
    const mentor = await prisma.user.create({
      data: {
        universityEmail: 'mentorunit1@cuchd.in',
        passwordHash: 'pass',
        role: Role.MENTOR,
        isVerifiedMentor: false,
      },
    });

    // Verify stats calculation
    const stats = await adminService.getAdminStats();
    expect(stats).toBeDefined();
    expect(stats.totalUsers).toBeGreaterThanOrEqual(3);

    // List users
    const usersResult = await adminService.getUsers({ page: 1, limit: 10 });
    expect(usersResult.users.length).toBeGreaterThanOrEqual(3);

    // Update user status
    const updatedStatus = await adminService.updateUserStatus(admin.id, student.id, false);
    expect(updatedStatus).toBeDefined();
    expect(updatedStatus.isActive).toBe(false);

    // Verify mentor
    const verifiedMentor = await adminService.verifyMentor(admin.id, mentor.id, true);
    expect(verifiedMentor).toBeDefined();
    expect(verifiedMentor.isVerifiedMentor).toBe(true);
  });

  it('should idempotently seed the initial admin account on connectDatabase', async () => {
    const { connectDatabase } = await import('../../app.js');
    const { comparePassword } = await import('../../utils/hash.js');

    // Remove any seeded admin user to start from clean state
    await prisma.user.deleteMany({
      where: { universityEmail: 'admin@cuchd.in' },
    });

    // 1. Connect and trigger seed
    await connectDatabase();

    // Verify admin was created
    const admin = await prisma.user.findUnique({
      where: { universityEmail: 'admin@cuchd.in' },
    });
    expect(admin).toBeDefined();
    expect(admin?.role).toBe(Role.ADMIN);
    expect(admin?.isActive).toBe(true);

    // Verify password was hashed correctly using comparePassword
    const isPasswordCorrect = await comparePassword('hell0@dm1n', admin!.passwordHash);
    expect(isPasswordCorrect).toBe(true);

    // 2. Run connect/seed again to test idempotency
    await connectDatabase();

    // Verify there is still only one admin@cuchd.in
    const adminsCount = await prisma.user.count({
      where: { universityEmail: 'admin@cuchd.in' },
    });
    expect(adminsCount).toBe(1);
  });
});
