import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { AuthError } from '../services/auth.service.js';
import { logger } from '../utils/logger.js';
import { isDevelopment } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // Express error handler requires 4 parameters
  _next: NextFunction
): void {
  // Custom ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // AuthError
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Zod validation error
  if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
    const zodErr = err as unknown as { errors: unknown };
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: zodErr.errors,
      },
    });
    return;
  }

  // Validation Error wrapper format
  if (err && typeof err === 'object' && 'name' in err && err.name === 'ValidationError') {
    const valErr = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
    res.status(valErr.statusCode || 400).json({
      success: false,
      error: {
        code: valErr.code || 'VALIDATION_ERROR',
        message: valErr.message || 'Validation failed',
        ...(valErr.details ? { details: valErr.details } : {}),
      },
    });
    return;
  }

  // Unhandled server errors
  logger.error('Unhandled internal server error', {
    path: req.path,
    method: req.method,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDevelopment && err instanceof Error ? err.message : 'An unexpected error occurred',
    },
  });
}
