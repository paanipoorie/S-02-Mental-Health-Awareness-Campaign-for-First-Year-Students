import { z } from 'zod';
import { Role } from '@campus-peer-support/shared-types';
import { env } from '../config/env.js';

export const registerSchema = z.object({
  body: z.object({
    universityEmail: z
      .string()
      .min(1, 'University email is required')
      .email('Invalid email format')
      .refine(
        email => email.endsWith(`@${env.UNIVERSITY_EMAIL_DOMAIN}`),
        `Email must be a valid ${env.UNIVERSITY_EMAIL_DOMAIN} address`
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: z.nativeEnum(Role).optional().default(Role.STUDENT),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    universityEmail: z
      .string()
      .min(1, 'University email is required')
      .email('Invalid email format')
      .refine(
        email => email.endsWith(`@${env.UNIVERSITY_EMAIL_DOMAIN}`),
        `Email must be a valid ${env.UNIVERSITY_EMAIL_DOMAIN} address`
      ),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z
  .object({
    body: z.object({
      refreshToken: z.string().optional(),
    }),
    cookies: z
      .object({
        refreshToken: z.string().optional(),
      })
      .optional(),
  })
  .refine(data => data.body?.refreshToken || data.cookies?.refreshToken, {
    message: 'Refresh token is required (in body or cookie)',
    path: ['refreshToken'],
  });

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    universityEmail: z
      .string()
      .min(1, 'University email is required')
      .email('Invalid email format')
      .refine(
        email => email.endsWith(`@${env.UNIVERSITY_EMAIL_DOMAIN}`),
        `Email must be a valid ${env.UNIVERSITY_EMAIL_DOMAIN} address`
      ),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type LogoutInput = z.infer<typeof logoutSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];

export function validateRegister(input: unknown) {
  return registerSchema.safeParse({ body: input });
}

export function validateLogin(input: unknown) {
  return loginSchema.safeParse({ body: input });
}

export function validateRefreshToken(input: unknown) {
  return refreshTokenSchema.safeParse({ body: input });
}

export function validateLogout(input: unknown) {
  return logoutSchema.safeParse({ body: input });
}

export function validateChangePassword(input: unknown) {
  return changePasswordSchema.safeParse({ body: input });
}

export function validateForgotPassword(input: unknown) {
  return forgotPasswordSchema.safeParse({ body: input });
}

export function validateResetPassword(input: unknown) {
  return resetPasswordSchema.safeParse({ body: input });
}
