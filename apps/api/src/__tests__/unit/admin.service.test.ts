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
});
