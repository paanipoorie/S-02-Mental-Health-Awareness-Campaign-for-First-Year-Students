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
import chatRoutes from './routes/chat.routes.js';
import mentorRoutes from './routes/mentor.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import meetingRoutes from './routes/meeting.routes.js';
import { requestLoggerMiddleware } from './utils/logger.js';
import profileRoutes from './routes/profile.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import {
  generalRateLimiter,
  createCustomRateLimiter,
} from './middlewares/rateLimiter.middleware.js';

export function createApp(): Application {
  const app = express();

  const helmetOptions: Record<string, unknown> = {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: isDevelopment
      ? false
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
          },
        },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
  };
  app.use(helmet(helmetOptions));

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(requestLoggerMiddleware);

  // Apply general rate limiter to all API routes
  app.use(`${env.API_PREFIX}`, generalRateLimiter);

  // Specific rate limiters for sensitive endpoints
  const authRateLimiter = createCustomRateLimiter(
    900000,
    100,
    'Too many authentication attempts',
    'AUTH_RATE_LIMIT'
  );
  const postRateLimiter = createCustomRateLimiter(
    60000,
    10,
    'Too many posts created',
    'POST_RATE_LIMIT'
  );
  const chatRateLimiter = createCustomRateLimiter(
    60000,
    30,
    'Too many chat messages',
    'CHAT_RATE_LIMIT'
  );
  const meetingRateLimiter = createCustomRateLimiter(
    60000,
    5,
    'Too many meetings created',
    'MEETING_RATE_LIMIT'
  );

  app.use(`${env.API_PREFIX}/health`, healthRoutes);
  app.use(`${env.API_PREFIX}/auth`, authRateLimiter, authRoutes);
  app.use(`${env.API_PREFIX}/emotions`, emotionRoutes);
  app.use(`${env.API_PREFIX}/posts`, postRateLimiter, postRoutes);
  app.use(`${env.API_PREFIX}/chats`, chatRateLimiter, chatRoutes);
  app.use(`${env.API_PREFIX}/mentors`, mentorRoutes);
  app.use(`${env.API_PREFIX}/resources`, resourceRoutes);
  app.use(`${env.API_PREFIX}/dashboard`, dashboardRoutes);
  app.use(`${env.API_PREFIX}/admin`, adminRoutes);
  app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${env.API_PREFIX}/profiles`, profileRoutes);
  app.use(`${env.API_PREFIX}`, meetingRateLimiter, meetingRoutes);

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

async function seedAdminUser(): Promise<void> {
  try {
    const adminEmail = 'admin@cuchd.in';
    const existingAdmin = await prisma.user.findUnique({
      where: { universityEmail: adminEmail },
    });

    if (!existingAdmin) {
      const { hashPassword } = await import('./utils/hash.js');
      const passwordHash = await hashPassword('hell0@dm1n');

      await prisma.user.create({
        data: {
          universityEmail: adminEmail,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log(`[Seed] Idempotently seeded initial admin account: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Failed to seed initial admin user:', error);
  }
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    await seedAdminUser();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}
