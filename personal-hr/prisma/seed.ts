import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@hr.local' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hr.local',
      password: hashedPassword,
      role: 'ADMIN_HR',
      employee: {
        create: {
          fullName: 'Super Admin',
          email: 'admin@hr.local',
          jobTitle: 'HR Director',
          status: 'FULLTIME',
          salary: 0,
          salaryType: 'NETT',
          joinDate: new Date(),
        }
      }
    },
  });

  console.log('✅ Seed completed. Admin created: admin@hr.local / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
