import type { Request, Response } from 'express';
import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../config/env.js';

export interface RateLimiterConfig {
  windowMs?: number | undefined;
  maxRequests?: number | undefined;
  message?: string | undefined;
  code?: string | undefined;
  keyGenerator?: ((req: Request) => string) | undefined;
  skipSuccessfulRequests?: boolean | undefined;
  skipFailedRequests?: boolean | undefined;
}

export function createRateLimiter(config: RateLimiterConfig = {}): RateLimitRequestHandler {
  const {
    windowMs = env.RATE_LIMIT_WINDOW_MS,
    maxRequests = env.RATE_LIMIT_MAX_REQUESTS,
    message = 'Too many requests, please try again later',
    code = 'RATE_LIMIT_EXCEEDED',
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator ?? defaultKeyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code,
          message,
          details: {
            retryAfter: Math.ceil(windowMs / 1000),
          },
        },
      });
    },
  });
}

function defaultKeyGenerator(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  code: 'AUTH_RATE_LIMIT_EXCEEDED',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

export const generalRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later',
  code: 'RATE_LIMIT_EXCEEDED',
});

export function createCustomRateLimiter(
  windowMs: number,
  maxRequests: number,
  message?: string,
  code?: string
): RateLimitRequestHandler {
  return createRateLimiter({
    windowMs,
    maxRequests,
    message: message ?? undefined,
    code: code ?? undefined,
  });
}

export type { RateLimitInfo } from 'express-rate-limit';
