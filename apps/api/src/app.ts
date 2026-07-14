import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';

import { env, isDevelopment } from './config/env.js';
import { prisma } from './prisma/client.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import { AuthError } from './services/auth.service.js';

export function createApp(): Application {
  const app = express();

  const helmetOptions: Record<string, unknown> = {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  };
  if (!isDevelopment) {
    helmetOptions.contentSecurityPolicy = undefined;
  } else {
    helmetOptions.contentSecurityPolicy = false;
  }
  app.use(helmet(helmetOptions));

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (isDevelopment) {
      console.log(`${req.method} ${req.path}`);
    }
    next();
  });

  app.use(`${env.API_PREFIX}/health`, healthRoutes);
  app.use(`${env.API_PREFIX}/auth`, authRoutes);

  app.get(`${env.API_PREFIX}`, (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: 'Campus Anonymous Peer Support API',
        version: '0.0.1',
        status: 'running',
      },
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);

    // Handle known error types
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

    // Handle validation errors (from validate middleware)
    if (err && typeof err === 'object' && 'name' in err && err.name === 'ValidationError') {
      const validationErr = err as {
        statusCode?: number;
        code?: string;
        message?: string;
        details?: unknown;
      };
      res.status(validationErr.statusCode || 400).json({
        success: false,
        error: {
          code: validationErr.code || 'VALIDATION_ERROR',
          message: validationErr.message || 'Validation failed',
          details: validationErr.details,
        },
      });
      return;
    }

    // Handle Zod validation errors (direct schema.parse)
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

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          isDevelopment && err instanceof Error ? err.message : 'An unexpected error occurred',
      },
    });
  });

  return app;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}
