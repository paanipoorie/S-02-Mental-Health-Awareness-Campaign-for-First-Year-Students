import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
}

const signOptions: SignOptions = {
  expiresIn: env.JWT_EXPIRES_IN as
    `${number}` | `${number}s` | `${number}m` | `${number}h` | `${number}d`,
};

const refreshSignOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRES_IN as
    `${number}` | `${number}s` | `${number}m` | `${number}h` | `${number}d`,
};

/**
 * Signs an access token.
 * @param payload The token payload.
 * @returns The signed JWT.
 */
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, signOptions);
}

/**
 * Signs a refresh token.
 * @param payload The token payload.
 * @returns The signed JWT.
 */
export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshSignOptions);
}

/**
 * Verifies an access token.
 * @param token The JWT string.
 * @returns The decoded token payload.
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

/**
 * Verifies a refresh token.
 * @param token The JWT string.
 * @returns The decoded token payload.
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}
