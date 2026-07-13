import { Router, type Request, type Response } from 'express';

import { prisma } from '../prisma/client.js';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const status = dbStatus === 'connected' ? 200 : 503;

  res.status(status).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    db: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
