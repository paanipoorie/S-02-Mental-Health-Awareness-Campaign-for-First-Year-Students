import { z } from 'zod';
import { Role } from '@campus-peer-support/shared-types';

function getUniversityEmailDomain(): string {
  return process.env.UNIVERSITY_EMAIL_DOMAIN ?? 'university.edu';
}

const registerBodySchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format')
    .refine(email => {
      const domain = getUniversityEmailDomain();
      console.log(`[DEBUG REFINE] Checking email: ${email} against domain: ${domain}`);
      return email.endsWith(`@${domain}`);
    }, `Email must be a valid ${getUniversityEmailDomain()} address`),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.nativeEnum(Role).optional().default(Role.STUDENT),
});

const loginBodySchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format')
    .refine(
      email => email.endsWith(`@${getUniversityEmailDomain()}`),
      `Email must be a valid ${getUniversityEmailDomain()} address`
    ),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().optional(),
});

const logoutBodySchema = z.object({
  refreshToken: z.string().optional(),
});

const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const forgotPasswordBodySchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format')
    .refine(
      email => email.endsWith(`@${getUniversityEmailDomain()}`),
      `Email must be a valid ${getUniversityEmailDomain()} address`
    ),
});

const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const registerSchema = z.object({ body: registerBodySchema });
export const loginSchema = z.object({ body: loginBodySchema });
export const refreshTokenSchema = z
  .object({
    body: refreshTokenBodySchema,
    cookies: z.object({ refreshToken: z.string().optional() }).optional(),
  })
  .refine(data => data.body?.refreshToken || data.cookies?.refreshToken, {
    message: 'Refresh token is required (in body or cookie)',
    path: ['refreshToken'],
  });
export const logoutSchema = z.object({ body: logoutBodySchema });
export const changePasswordSchema = z.object({ body: changePasswordBodySchema });
export const forgotPasswordSchema = z.object({ body: forgotPasswordBodySchema });
export const resetPasswordSchema = z.object({ body: resetPasswordBodySchema });

// Export body schemas directly for use with validateBody middleware
export const registerBodySchemaExport = registerBodySchema;
export const loginBodySchemaExport = loginBodySchema;
export const refreshTokenBodySchemaExport = refreshTokenBodySchema;
export const logoutBodySchemaExport = logoutBodySchema;

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>;
export type LogoutInput = z.infer<typeof logoutBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

export function validateRegister(input: unknown) {
  return registerBodySchema.safeParse(input);
}

export function validateLogin(input: unknown) {
  return loginBodySchema.safeParse(input);
}

export function validateRefreshToken(input: unknown) {
  return refreshTokenBodySchema.safeParse(input);
}

export function validateLogout(input: unknown) {
  return logoutBodySchema.safeParse(input);
}

export function validateChangePassword(input: unknown) {
  return changePasswordBodySchema.safeParse(input);
}

export function validateForgotPassword(input: unknown) {
  return forgotPasswordBodySchema.safeParse(input);
}

export function validateResetPassword(input: unknown) {
  return resetPasswordBodySchema.safeParse(input);
}
