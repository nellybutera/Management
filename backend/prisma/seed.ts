import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@creditjambo.test' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@creditjambo.test',
      password,
      role: 'ADMIN',
      balance: 1000
    }
  });

  await prisma.user.upsert({
    where: { email: 'user@creditjambo.test' },
    update: {},
    create: {
      name: 'Demo Customer',
      email: 'user@creditjambo.test',
      password,
      role: 'CUSTOMER',
      balance: 100
    }
  });

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
