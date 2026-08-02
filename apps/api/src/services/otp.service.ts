import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';

export interface OTPData {
  email: string;
  otp: string;
  role: 'STUDENT' | 'MENTOR';
  passwordHash: string;
  expiresAt: Date;
}

export class OTPService {
  private static readonly OTP_EXPIRY_MINUTES = 10;
  private static readonly OTP_LENGTH = 6;

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createOTP(data: Omit<OTPData, 'otp' | 'expiresAt'>): Promise<string> {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailOTP.create({
      data: {
        email: data.email.toLowerCase().trim(),
        otp,
        role: data.role,
        passwordHash: data.passwordHash,
        expiresAt,
      },
    });

    return otp;
  }

  static async verifyOTP(email: string, otp: string): Promise<OTPData | null> {
    const record = await prisma.emailOTP.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!record) {
      return null;
    }

    if (record.otp !== otp) {
      return null;
    }

    if (record.expiresAt < new Date()) {
      await prisma.emailOTP.delete({ where: { email: email.toLowerCase().trim() } });
      return null;
    }

    return {
      email: record.email,
      otp: record.otp,
      role: record.role as 'STUDENT' | 'MENTOR',
      passwordHash: record.passwordHash,
      expiresAt: record.expiresAt,
    };
  }

  static async deleteOTP(email: string): Promise<void> {
    await prisma.emailOTP.deleteMany({
      where: { email: email.toLowerCase().trim() },
    });
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    await prisma.emailOTP.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}