import type { Request, Response, NextFunction } from 'express';
import { Role } from '@campus-peer-support/shared-types';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../prisma/client.js';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'MISSING_AUTH'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
}

export async function requireVerifiedMentor(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required', 'MISSING_AUTH'));
  }

  if (req.user.role !== Role.MENTOR) {
    return next(ApiError.forbidden('Only mentors can access this resource', 'FORBIDDEN'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isVerifiedMentor: true },
    });

    if (!user || !user.isVerifiedMentor) {
      return next(ApiError.forbidden('Mentor not verified', 'FORBIDDEN'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
