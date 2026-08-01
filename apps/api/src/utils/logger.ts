import type { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config/env.js';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  meta?: Record<string, unknown>;
}

function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = [
    'password',
    'token',
    'authorization',
    'secret',
    'cookie',
    'refreshtoken',
    'accesstoken',
  ];

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function formatLog(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(correlationId && { correlationId }),
    ...(meta && Object.keys(meta).length > 0
      ? { meta: sanitizeData(meta) as Record<string, unknown> }
      : {}),
  };

  if (isDevelopment) {
    const corrId = correlationId ? ` [${correlationId}]` : '';
    const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
    return `[${entry.timestamp}]${corrId} ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  return JSON.stringify(entry);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    console.log(formatLog('info', message, meta, correlationId));
  },
  warn(message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    console.warn(formatLog('warn', message, meta, correlationId));
  },
  error(message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    console.error(formatLog('error', message, meta, correlationId));
  },
  debug(message: string, meta?: Record<string, unknown>, correlationId?: string): void {
    if (isDevelopment) {
      console.debug(formatLog('debug', message, meta, correlationId));
    }
  },
  child(correlationId: string) {
    return {
      info: (message: string, meta?: Record<string, unknown>) =>
        logger.info(message, meta, correlationId),
      warn: (message: string, meta?: Record<string, unknown>) =>
        logger.warn(message, meta, correlationId),
      error: (message: string, meta?: Record<string, unknown>) =>
        logger.error(message, meta, correlationId),
      debug: (message: string, meta?: Record<string, unknown>) =>
        logger.debug(message, meta, correlationId),
    };
  },
};

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-correlation-id'] as string) || generateCorrelationId();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const meta: Record<string, unknown> = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userId: req.user?.userId,
      role: req.user?.role,
    };

    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.path} ${res.statusCode}`, meta, correlationId);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.path} ${res.statusCode}`, meta, correlationId);
    } else {
      logger.info(`HTTP ${req.method} ${req.path} ${res.statusCode}`, meta, correlationId);
    }
  });

  next();
}
