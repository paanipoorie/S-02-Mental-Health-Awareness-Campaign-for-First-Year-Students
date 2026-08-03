import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with production configuration...');

  const adminPasswordHash = await bcrypt.hash('hell0@dm1n', 12);

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { universityEmail: 'admin@cuchd.in' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      universityEmail: 'admin@cuchd.in',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('Seeded Admin:', admin.universityEmail);

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during seed run:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
