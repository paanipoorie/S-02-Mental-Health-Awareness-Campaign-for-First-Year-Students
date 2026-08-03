import { z } from 'zod';
import { Role } from '@campus-peer-support/shared-types';

const CU_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@cuchd\.in$/;

function validateCUEmail(email: string): boolean {
  return CU_EMAIL_REGEX.test(email.toLowerCase().trim());
}

const sendOTPSchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format'),
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

const verifyOTPSchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const loginBodySchema = z.object({
  universityEmail: z
    .string()
    .min(1, 'University email is required')
    .email('Invalid email format'),
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
    .refine(validateCUEmail, 'Please use your official Chandigarh University email (@cuchd.in).'),
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

export const sendOTPSchemaExport = sendOTPSchema;
export const verifyOTPSchemaExport = verifyOTPSchema;
export const registerBodySchemaExport = sendOTPSchema; // Keep for backwards compatibility
export const loginBodySchemaExport = loginBodySchema;
export const refreshTokenBodySchemaExport = refreshTokenBodySchema;
export const logoutBodySchemaExport = logoutBodySchema;

export const sendOTPSchemaFull = z.object({ body: sendOTPSchema });
export const verifyOTPSchemaFull = z.object({ body: verifyOTPSchema });
export const registerSchema = z.object({ body: sendOTPSchema });
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

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type RegisterInput = z.infer<typeof sendOTPSchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>;
export type LogoutInput = z.infer<typeof logoutBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

export function validateSendOTP(input: unknown) {
  return sendOTPSchema.safeParse(input);
}

export function validateVerifyOTP(input: unknown) {
  return verifyOTPSchema.safeParse(input);
}

export function validateRegister(input: unknown) {
  return sendOTPSchema.safeParse(input);
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
