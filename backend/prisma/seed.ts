import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const customPasswordHash = await bcrypt.hash('vibhu12345', 10);

  // Migrate legacy seed emails if present to prevent unique constraint conflicts
  await prisma.user.updateMany({
    where: { email: 'admin@srmprint.ac.in' },
    data: { email: 'admin@printhelper.ac.in' },
  });

  await prisma.user.updateMany({
    where: { email: 'student@srmprint.ac.in' },
    data: { email: 'student@printhelper.ac.in' },
  });

  // Vibhor Admin User
  const vibhorAdmin = await prisma.user.upsert({
    where: { email: 'vibhor.singh0308@gmail.com' },
    update: {
      passwordHash: customPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'vibhor.singh0308@gmail.com',
      fullName: 'Vibhor Singh (Admin)',
      passwordHash: customPasswordHash,
      role: 'ADMIN',
    },
  });

  // Standard Admin User
  const defaultAdmin = await prisma.user.upsert({
    where: { email: 'admin@printhelper.ac.in' },
    update: {
      passwordHash: customPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@printhelper.ac.in',
      fullName: 'Stationery Staff Admin',
      passwordHash: customPasswordHash,
      role: 'ADMIN',
    },
  });

  // Vibhor Student User
  const vibhorStudent = await prisma.user.upsert({
    where: { email: 'vibhor.student@gmail.com' },
    update: {
      passwordHash: customPasswordHash,
      role: 'STUDENT',
    },
    create: {
      email: 'vibhor.student@gmail.com',
      fullName: 'Vibhor Singh (Student)',
      rollNumber: 'RA2111003010999',
      passwordHash: customPasswordHash,
      role: 'STUDENT',
    },
  });

  // Default Student User
  const defaultStudent = await prisma.user.upsert({
    where: { email: 'student@printhelper.ac.in' },
    update: {
      passwordHash: customPasswordHash,
      role: 'STUDENT',
    },
    create: {
      email: 'student@printhelper.ac.in',
      fullName: 'Rahul Sharma',
      rollNumber: 'RA2111003010001',
      passwordHash: customPasswordHash,
      role: 'STUDENT',
    },
  });

  // Sample Printers
  const printer1 = await prisma.printer.upsert({
    where: { id: 'mono-printer-1' },
    update: {},
    create: {
      id: 'mono-printer-1',
      name: 'HP_LaserJet_Pro_M404_Mono',
      displayName: 'Main Desk Mono LaserJet (A4)',
      supportsColor: false,
      supportsA3: false,
      supportsA4: true,
      supportsDuplex: true,
      status: 'AVAILABLE',
      location: 'Stationery Counter 1',
    },
  });

  const printer2 = await prisma.printer.upsert({
    where: { id: 'color-printer-1' },
    update: {},
    create: {
      id: 'color-printer-1',
      name: 'Canon_ImageCLASS_Color_LBP622',
      displayName: 'Express Color Laser (A4/A3)',
      supportsColor: true,
      supportsA3: true,
      supportsA4: true,
      supportsDuplex: true,
      status: 'AVAILABLE',
      location: 'Stationery Counter 2',
    },
  });

  console.log('==============================================');
  console.log('✅ DATABASE SEED COMPLETE!');
  console.log('==============================================');
  console.log('👑 Admin (Vibhor):   vibhor.singh0308@gmail.com | Password: vibhu12345');
  console.log('🎓 Student (Vibhor): vibhor.student@gmail.com   | Password: vibhu12345');
  console.log('🎓 Student (Default): student@printhelper.ac.in | Password: vibhu12345');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
