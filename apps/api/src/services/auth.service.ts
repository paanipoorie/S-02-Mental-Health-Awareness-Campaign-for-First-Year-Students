import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from '../utils/jwt.js';
import { env, isDevelopment, isTest } from '../config/env.js';
import { Role } from '@campus-peer-support/shared-types';
import { identityService, shouldCreateAnonymousIdentity } from './identity.service.js';
import { OTPService } from './otp.service.js';
import { sendOTPEmail } from './email.service.js';

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

/**
 * Single source of truth for university email validation.
 * Only Chandigarh University emails are accepted:
 *   ^[A-Za-z0-9._%+-]+@cuchd\.in$
 */
export const CU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@cuchd\.in$/;

export function isUniversityEmailValid(email: string): boolean {
  return CU_EMAIL_REGEX.test(email.toLowerCase().trim());
}

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
    if (!isUniversityEmailValid(email)) {
      throw new AuthError(
        'Please use your official Chandigarh University email (@cuchd.in).',
        'INVALID_EMAIL_DOMAIN',
        400
      );
    }
  }

  private async createUserTokens(userId: string, role: Role, email: string): Promise<AuthTokens> {
    let anonymousIdentityId: string | null = null;
    if (role === Role.STUDENT) {
      const identity = await prisma.anonymousIdentity.findUnique({
        where: { userId },
        select: { id: true },
      });
      anonymousIdentityId = identity?.id ?? null;
    }
    const payload: TokenPayload = { userId, role, email, anonymousIdentityId };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  private async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { universityEmail: email.toLowerCase().trim() },
      include: {
        anonymousIdentity: true,
      },
    });
  }

  /**
   * Step 1 of registration: validate the @cuchd.in email, generate an OTP,
   * persist it (with the chosen role and password hash), and email it to the user.
   *
   * In development/test with no RESEND_API_KEY, the OTP is logged to console so
   * tests can retrieve it from the DB directly. In production the email is always
   * sent via Resend and OTPs are never exposed.
   */
  async sendOTP(input: RegisterInput): Promise<{ email: string; otp: string | null }> {
    this.validateUniversityEmail(input.universityEmail);

    const existingUser = await this.findUserByEmail(input.universityEmail);
    if (existingUser) {
      throw new AuthError('Email already registered', 'EMAIL_ALREADY_EXISTS', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const role = input.role ?? Role.STUDENT;

    // Remove any stale OTP for this email before creating a fresh one
    await OTPService.deleteOTP(input.universityEmail);

    const otp = await OTPService.createOTP({
      email: input.universityEmail,
      role: role === Role.MENTOR ? 'MENTOR' : 'STUDENT',
      passwordHash,
    });

    try {
      await sendOTPEmail({
        email: input.universityEmail.toLowerCase().trim(),
        otp,
        role: role === Role.MENTOR ? 'MENTOR' : 'STUDENT',
      });
    } catch (error) {
      // Never fail account setup because email delivery failed in dev/test without a key.
      if (isDevelopment || isTest) {
        console.log(`[OTP][DEV] OTP for ${input.universityEmail.toLowerCase().trim()}: ${otp}`);
      } else {
        // In production, a delivery failure is fatal — the user cannot verify.
        await OTPService.deleteOTP(input.universityEmail);
        throw new AuthError(
          'Failed to send verification email. Please try again.',
          'EMAIL_SEND_FAILED',
          500
        );
      }
    }

    if (isDevelopment || isTest) {
      console.log(`[OTP][DEV] OTP for ${input.universityEmail.toLowerCase().trim()}: ${otp}`);
    }

    return {
      email: input.universityEmail.toLowerCase().trim(),
      // OTP is never returned to the client in production.
      otp: isDevelopment || isTest ? otp : null,
    };
  }

  /**
   * Step 2 of registration: verify the OTP. If valid, create the account
   * (role comes from the OTP record). Never create accounts with unverified emails.
   */
  async verifyOTP(email: string, otp: string): Promise<RegisterResult> {
    this.validateUniversityEmail(email);

    const record = await OTPService.verifyOTP(email, otp);

    if (!record) {
      throw new AuthError('Invalid or expired OTP', 'INVALID_OTP', 400);
    }

    if (record.expiresAt < new Date()) {
      throw new AuthError('OTP has expired. Please request a new one.', 'OTP_EXPIRED', 400);
    }

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      await OTPService.deleteOTP(email);
      throw new AuthError('Email already registered', 'EMAIL_ALREADY_EXISTS', 409);
    }

    const prismaRole = record.role as PrismaRole;
    const role = toSharedRole(prismaRole);

    const user = await prisma.user.create({
      data: {
        universityEmail: email.toLowerCase().trim(),
        passwordHash: record.passwordHash,
        role: prismaRole,
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

    // OTP is single-use
    await OTPService.deleteOTP(email);

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
      anonymousIdentityId: payload.anonymousIdentityId,
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

