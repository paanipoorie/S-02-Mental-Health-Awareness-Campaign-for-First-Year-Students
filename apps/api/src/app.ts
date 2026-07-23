import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';

import { env, isDevelopment } from './config/env.js';
import { prisma } from './prisma/client.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import emotionRoutes from './routes/emotion.routes.js';
import postRoutes from './routes/post.routes.js';
import { requestLoggerMiddleware } from './utils/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';

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
  app.use(requestLoggerMiddleware);

  app.use(`${env.API_PREFIX}/health`, healthRoutes);
  app.use(`${env.API_PREFIX}/auth`, authRoutes);
  app.use(`${env.API_PREFIX}/emotions`, emotionRoutes);
  app.use(`${env.API_PREFIX}/posts`, postRoutes);

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

  app.use(errorHandler);

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
