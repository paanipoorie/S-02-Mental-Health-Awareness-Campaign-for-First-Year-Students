import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from '../utils/jwt.js';
import { env } from '../config/env.js';
import { Role } from '@campus-peer-support/shared-types';
import { identityService, shouldCreateAnonymousIdentity } from './identity.service.js';

type PrismaRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

const toSharedRole = (role: PrismaRole): Role => {
  switch (role) {
    case 'STUDENT':
      return Role.STUDENT;
    case 'MENTOR':
      return Role.MENTOR;
    case 'ADMIN':
      return Role.ADMIN;
    default:
      return Role.STUDENT;
  }
};

export interface RegisterInput {
  universityEmail: string;
  password: string;
  role?: Role;
}

export interface LoginInput {
  universityEmail: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: {
    id: string;
    universityEmail: string;
    role: Role;
    isVerifiedMentor: boolean;
  };
  anonymousIdentity: {
    id: string;
    displayName: string;
    avatarSeed: number;
  } | null;
  tokens: AuthTokens;
}

export interface LoginResult {
  user: {
    id: string;
    universityEmail: string;
    role: Role;
    isVerifiedMentor: boolean;
  };
  tokens: AuthTokens;
}

export interface RefreshTokenResult {
  accessToken: string;
}

export interface LogoutResult {
  success: boolean;
}

export interface MeResult {
  id: string;
  universityEmail: string;
  role: Role;
  isVerifiedMentor: boolean;
  anonymousIdentity: {
    id: string;
    displayName: string;
    avatarSeed: number;
  } | null;
}

export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AuthService {
  private validateUniversityEmail(email: string): void {
    if (!email.endsWith(`@${env.UNIVERSITY_EMAIL_DOMAIN}`)) {
      throw new AuthError(
        `Email must be a valid ${env.UNIVERSITY_EMAIL_DOMAIN} address`,
        'INVALID_EMAIL_DOMAIN',
        400
      );
    }
  }

  private async createUserTokens(userId: string, role: Role, email: string): Promise<AuthTokens> {
    const payload: TokenPayload = { userId, role, email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  private async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { universityEmail: email },
      include: {
        anonymousIdentity: true,
      },
    });
  }

  async register(input: RegisterInput): Promise<RegisterResult> {
    this.validateUniversityEmail(input.universityEmail);

    const existingUser = await this.findUserByEmail(input.universityEmail);
    if (existingUser) {
      throw new AuthError('Email already registered', 'EMAIL_ALREADY_EXISTS', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const role = input.role ?? Role.STUDENT;

    const user = await prisma.user.create({
      data: {
        universityEmail: input.universityEmail,
        passwordHash,
        role,
        ...(role === Role.MENTOR ? { isVerifiedMentor: false } : {}),
      },
    });

    let anonymousIdentity = null;
    if (shouldCreateAnonymousIdentity(role)) {
      const identity = await identityService.createAnonymousIdentity(user.id);
      anonymousIdentity = {
        id: identity.id,
        displayName: identity.displayName,
        avatarSeed: identity.avatarSeed,
      };
    }

    const tokens = await this.createUserTokens(
      user.id,
      toSharedRole(user.role),
      user.universityEmail
    );

    return {
      user: {
        id: user.id,
        universityEmail: user.universityEmail,
        role: toSharedRole(user.role),
        isVerifiedMentor: user.isVerifiedMentor,
      },
      anonymousIdentity,
      tokens,
    };
  }

  async login(input: LoginInput): Promise<LoginResult> {
    this.validateUniversityEmail(input.universityEmail);

    const user = await this.findUserByEmail(input.universityEmail);
    if (!user) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    if (!user.isActive) {
      throw new AuthError('Account is deactivated', 'ACCOUNT_DEACTIVATED', 403);
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    const tokens = await this.createUserTokens(
      user.id,
      toSharedRole(user.role),
      user.universityEmail
    );

    return {
      user: {
        id: user.id,
        universityEmail: user.universityEmail,
        role: toSharedRole(user.role),
        isVerifiedMentor: user.isVerifiedMentor,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AuthError('Refresh token expired', 'REFRESH_TOKEN_EXPIRED', 401);
      }
      throw new AuthError('Invalid refresh token', 'INVALID_REFRESH_TOKEN', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new AuthError('User not found or deactivated', 'USER_NOT_FOUND', 401);
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      role: toSharedRole(user.role),
      email: user.universityEmail,
    });

    return { accessToken: newAccessToken };
  }

  async logout(refreshToken: string): Promise<LogoutResult> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user) {
        throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
      }
    } catch {
      // Silently succeed for logout - token may already be invalid
    }
    return { success: true };
  }

  async me(userId: string): Promise<MeResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        anonymousIdentity: true,
      },
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND', 404);
    }

    return {
      id: user.id,
      universityEmail: user.universityEmail,
      role: toSharedRole(user.role),
      isVerifiedMentor: user.isVerifiedMentor,
      anonymousIdentity: user.anonymousIdentity
        ? {
            id: user.anonymousIdentity.id,
            displayName: user.anonymousIdentity.displayName,
            avatarSeed: user.anonymousIdentity.avatarSeed,
          }
        : null,
    };
  }
}

export const authService = new AuthService();
