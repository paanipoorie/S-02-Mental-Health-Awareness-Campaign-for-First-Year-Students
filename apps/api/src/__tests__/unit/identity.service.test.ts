import { describe, it, expect } from 'vitest';
import { prisma } from '../../prisma/client.js';
import { identityService, shouldCreateAnonymousIdentity } from '../../services/identity.service.js';
import { Role } from '@campus-peer-support/shared-types';

describe('Identity Service Unit Tests', () => {
  it('should create an anonymous identity for a user', async () => {
    const user = await prisma.user.create({
      data: {
        universityEmail: 'unit-identity@test.edu',
        passwordHash: 'pass',
        role: Role.STUDENT,
      },
    });

    const identity = await identityService.createAnonymousIdentity(user.id);
    expect(identity).toBeDefined();
    expect(identity.userId).toBe(user.id);
    expect(identity.displayName).toMatch(/^Anonymous [A-Z][a-z]+ [A-Z][a-z]+$/);
    expect(identity.avatarSeed).toBeGreaterThanOrEqual(0);

    const fetchedByUserId = await identityService.getAnonymousIdentityByUserId(user.id);
    expect(fetchedByUserId).not.toBeNull();
    expect(fetchedByUserId?.displayName).toBe(identity.displayName);

    const fetchedById = await identityService.getAnonymousIdentityById(identity.id);
    expect(fetchedById).not.toBeNull();
    expect(fetchedById?.displayName).toBe(identity.displayName);

    const fetchedByDisplayName = await identityService.getAnonymousIdentityByDisplayName(identity.displayName);
    expect(fetchedByDisplayName).not.toBeNull();
    expect(fetchedByDisplayName?.id).toBe(identity.id);
  });

  it('should determine when to create anonymous identity based on role', () => {
    expect(shouldCreateAnonymousIdentity(Role.STUDENT)).toBe(true);
    expect(shouldCreateAnonymousIdentity(Role.MENTOR)).toBe(false);
    expect(shouldCreateAnonymousIdentity(Role.ADMIN)).toBe(false);
  });
});
