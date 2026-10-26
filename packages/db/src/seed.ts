import { prisma } from './client';

export async function seed() {
  console.log('Seeding SchoolOS test database...');

  // 1. Create Baseline Permissions
  const permissions = [
    { slug: 'school.manage', module: 'ADMIN', description: 'Configure school settings' },
    { slug: 'students.read', module: 'SIS', description: 'View student records' },
    { slug: 'students.create', module: 'SIS', description: 'Enroll new students' },
    { slug: 'results.enter', module: 'ACADEMICS', description: 'Enter continuous assessment scores' },
    { slug: 'results.lock', module: 'ACADEMICS', description: 'Approve and lock terminal results' },
    { slug: 'results.edit_locked', module: 'GOVERNANCE', description: 'Request edit to locked results' },
    { slug: 'fees.manage', module: 'FINANCE', description: 'Configure fee structures' },
    { slug: 'payments.record', module: 'FINANCE', description: 'Record student fee payment' },
    { slug: 'payments.reverse', module: 'GOVERNANCE', description: 'Reverse settled payment transaction' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    });
  }

  // 2. Create Reference School Tenant
  const school = await prisma.school.upsert({
    where: { slug: 'apex-model-college' },
    update: {},
    create: {
      slug: 'apex-model-college',
      name: 'Apex Model College, Lagos',
      officialCode: 'LAG/EDU/2026/8941',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      status: 'ACTIVE',
      settings: {
        gradingSystem: 'WAEC_STANDARD',
        smsSenderId: 'ApexCollege',
      },
    },
  });

  // 3. Create Campuses
  const mainCampus = await prisma.campus.upsert({
    where: {
      schoolId_name: {
        schoolId: school.id,
        name: 'Main Campus (Victoria Island)',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Main Campus (Victoria Island)',
      code: 'VI-MAIN',
      address: '14 Bishop Oluwole Street, Victoria Island',
      city: 'Lagos',
      state: 'Lagos State',
      isMain: true,
    },
  });

  // 4. Create Academic Session & Terms
  const session = await prisma.academicSession.upsert({
    where: {
      schoolId_name: {
        schoolId: school.id,
        name: '2026/2027',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      name: '2026/2027',
      startDate: new Date('2026-09-14'),
      endDate: new Date('2027-07-23'),
      isCurrent: true,
    },
  });

  await prisma.term.upsert({
    where: {
      sessionId_name: {
        sessionId: session.id,
        name: '1st Term',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      sessionId: session.id,
      name: '1st Term',
      startDate: new Date('2026-09-14'),
      endDate: new Date('2026-12-18'),
      isCurrent: true,
      isLocked: false,
    },
  });

  // 5. Create Foundational Class Levels & Arms
  const jss1Level = await prisma.classLevel.upsert({
    where: {
      schoolId_campusId_name: {
        schoolId: school.id,
        campusId: mainCampus.id,
        name: 'JSS 1',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      campusId: mainCampus.id,
      name: 'JSS 1',
      levelOrder: 7,
      section: 'JUNIOR_SECONDARY',
    },
  });

  await prisma.classArm.upsert({
    where: {
      levelId_name: {
        levelId: jss1Level.id,
        name: 'Gold',
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      levelId: jss1Level.id,
      name: 'Gold',
      capacity: 35,
    },
  });

  console.log('Seed completed successfully for tenant:', school.name);
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
