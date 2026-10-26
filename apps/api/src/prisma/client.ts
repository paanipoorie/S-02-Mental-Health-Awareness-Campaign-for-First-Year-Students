import { PrismaClient } from '@prisma/client';

if (
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.includes('.render.com') &&
  !process.env.DATABASE_URL.includes('sslmode')
) {
  process.env.DATABASE_URL +=
    (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=require';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
