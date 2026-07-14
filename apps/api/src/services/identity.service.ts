import { prisma } from '../prisma/client.js';
import { generateAnonymousName } from '../utils/anonymousIdentity.js';
import { Role } from '@campus-peer-support/shared-types';

export interface AnonymousIdentityData {
  id: string;
  userId: string;
  displayName: string;
  avatarSeed: number;
  createdAt: Date;
}

export interface IdentityService {
  createAnonymousIdentity(userId: string): Promise<AnonymousIdentityData>;
  getAnonymousIdentityByUserId(userId: string): Promise<AnonymousIdentityData | null>;
  getAnonymousIdentityById(identityId: string): Promise<AnonymousIdentityData | null>;
  getAnonymousIdentityByDisplayName(displayName: string): Promise<AnonymousIdentityData | null>;
}

function generateAvatarSeed(): number {
  return Math.floor(Math.random() * 10000);
}

async function generateUniqueDisplayName(): Promise<string> {
  let displayName: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    displayName = generateAnonymousName();
    const existing = await prisma.anonymousIdentity.findUnique({
      where: { displayName },
      select: { id: true },
    });
    exists = !!existing;
    attempts++;
  }

  if (exists) {
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    displayName = `Anonymous ${timestamp} ${randomSuffix}`;
  }

  return displayName!;
}

export class IdentityServiceImpl implements IdentityService {
  async createAnonymousIdentity(userId: string): Promise<AnonymousIdentityData> {
    const displayName = await generateUniqueDisplayName();
    const avatarSeed = generateAvatarSeed();

    const identity = await prisma.anonymousIdentity.create({
      data: {
        userId,
        displayName,
        avatarSeed,
      },
    });

    return {
      id: identity.id,
      userId: identity.userId,
      displayName: identity.displayName,
      avatarSeed: identity.avatarSeed,
      createdAt: identity.createdAt,
    };
  }

  async getAnonymousIdentityByUserId(userId: string): Promise<AnonymousIdentityData | null> {
    const identity = await prisma.anonymousIdentity.findUnique({
      where: { userId },
    });

    if (!identity) return null;

    return {
      id: identity.id,
      userId: identity.userId,
      displayName: identity.displayName,
      avatarSeed: identity.avatarSeed,
      createdAt: identity.createdAt,
    };
  }

  async getAnonymousIdentityById(identityId: string): Promise<AnonymousIdentityData | null> {
    const identity = await prisma.anonymousIdentity.findUnique({
      where: { id: identityId },
    });

    if (!identity) return null;

    return {
      id: identity.id,
      userId: identity.userId,
      displayName: identity.displayName,
      avatarSeed: identity.avatarSeed,
      createdAt: identity.createdAt,
    };
  }

  async getAnonymousIdentityByDisplayName(
    displayName: string
  ): Promise<AnonymousIdentityData | null> {
    const identity = await prisma.anonymousIdentity.findUnique({
      where: { displayName },
    });

    if (!identity) return null;

    return {
      id: identity.id,
      userId: identity.userId,
      displayName: identity.displayName,
      avatarSeed: identity.avatarSeed,
      createdAt: identity.createdAt,
    };
  }
}

export const identityService = new IdentityServiceImpl();

export function shouldCreateAnonymousIdentity(role: Role): boolean {
  return role === Role.STUDENT;
}
