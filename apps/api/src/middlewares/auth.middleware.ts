import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../utils/jwt.js';
import { Role } from '@campus-peer-support/shared-types';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload & { role: Role };
}

export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, code: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

function extractTokenFromCookie(req: Request): string | null {
  return req.cookies?.accessToken ?? null;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req) ?? extractTokenFromCookie(req);

  if (!token) {
    return next(new AuthError('Authentication required', 'MISSING_TOKEN', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role as Role,
      email: payload.email,
    };
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new AuthError('Token expired', 'TOKEN_EXPIRED', 401));
    }
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return next(new AuthError('Invalid token', 'INVALID_TOKEN', 401));
    }
    return next(new AuthError('Authentication failed', 'AUTH_FAILED', 401));
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req) ?? extractTokenFromCookie(req);

  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role as Role,
      email: payload.email,
    };
  } catch {
    // Silently ignore invalid tokens for optional auth
  }

  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthError('Authentication required', 'MISSING_AUTH', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthError('Insufficient permissions', 'FORBIDDEN', 403));
    }

    next();
  };
}

export function requireVerifiedMentor(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AuthError('Authentication required', 'MISSING_AUTH', 401));
  }

  if (req.user.role !== Role.MENTOR) {
    return next(new AuthError('Mentor access required', 'FORBIDDEN', 403));
  }

  next();
}

export { AuthError as AuthMiddlewareError };
