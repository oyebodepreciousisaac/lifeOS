import test from 'node:test';
import assert from 'node:assert/strict';

import {
  submitApplication,
  listApplications,
  getApplication,
  scoreApplication,
  issueOfferLetter,
  acceptOffer,
  convertApplicantToStudent,
  listStudents,
  getStudent,
  updateStudentProfile,
  transferStudentClassArm,
  importStudentsFromCsv,
  getSisDashboardMetrics,
} from '../apps/web/src/lib/sis/sis-store';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import { inMemoryAuditStore } from '../apps/web/src/lib/audit/logger';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

// Actor Sessions
const ownerSessionA: AuthSession = {
  userId: 'usr_001',
  schoolId: TENANT_A_ID,
  email: 'owner@kingscollege.sch.ng',
  firstName: 'Otunba',
  lastName: 'Adeleke',
  userType: 'OWNER',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const principalSessionA: AuthSession = {
  userId: 'usr_002',
  schoolId: TENANT_A_ID,
  email: 'principal@kingscollege.sch.ng',
  firstName: 'Dr. Elizabeth',
  lastName: 'Alabi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const teacherSessionA: AuthSession = {
  userId: 'usr_004',
  schoolId: TENANT_A_ID,
  email: 'teacher@kingscollege.sch.ng',
  firstName: 'Joseph',
  lastName: 'Okafor',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const ownerSessionB: AuthSession = {
  userId: 'usr_b_001',
  schoolId: TENANT_B_ID,
  email: 'owner@premierabuja.ng',
  firstName: 'Alhaji',
  lastName: 'Mustapha',
  userType: 'OWNER',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

test('Phase 4.1: Admissions Funnel & Digital Application Pipeline', async (t) => {
  await t.test('submits valid prospective student application', async () => {
    const app = await submitApplication(TENANT_A_ID, {
      firstName: 'Farouq',
      lastName: 'Danjuma',
      middleName: 'Aliyu',
      gender: 'MALE',
      dateOfBirth: '2015-04-10',
      stateOfOrigin: 'Kano',
      lga: 'Nasarawa',
      nationality: 'Nigerian',
      residentialAddress: 'Old Ikoyi, Lagos',
      appliedClassLevelId: 'lvl_jss1',
      campusId: 'cmp_lagos_main',
      previousSchoolName: 'Crescent Nursery & Primary Victoria Island',
      previousSchoolClass: 'Primary 6',
      guardian: {
        firstName: 'General (Rtd) Aliyu',
        lastName: 'Danjuma',
        relationship: 'FATHER',
        phonePrimary: '+234 803 234 5678',
        email: 'a.danjuma@nigerianforces.mil.ng',
        occupation: 'Retired Officer',
        isPrimaryContact: true,
        isBillingRecipient: true,
        hasCustody: true,
      },
    });

    assert.ok(app.id);
    assert.equal(app.status, 'SUBMITTED');
    assert.match(app.applicationNumber, /^APP\/\d{4}\/\d{3}$/);
    assert.equal(app.appliedClassLevelName, 'JSS 1');
  });

  await t.test('rejects application with invalid date of birth format', async () => {
    await assert.rejects(
      async () => {
        await submitApplication(TENANT_A_ID, {
          firstName: 'Bad',
          lastName: 'Date',
          gender: 'FEMALE',
          dateOfBirth: '12-05-2015', // Invalid format
          appliedClassLevelId: 'lvl_jss1',
          campusId: 'cmp_lagos_main',
          guardian: {
            firstName: 'Parent',
            lastName: 'Name',
            relationship: 'MOTHER',
            phonePrimary: '+234 802 123 4567',
            email: 'parent@email.com',
            isPrimaryContact: true,
            isBillingRecipient: true,
            hasCustody: true,
          },
        });
      },
      /Date of birth must be YYYY-MM-DD/
    );
  });

  await t.test('scores applicant exam and interview with weighted calculation', async () => {
    const scored = await scoreApplication(
      TENANT_A_ID,
      'app_kcl_003',
      {
        examScore: 88,
        interviewScore: 92,
        reviewerRemarks: 'Excellent analytical comprehension and poise during interview.',
      },
      principalSessionA
    );

    assert.equal(scored.status, 'SCORED');
    assert.equal(scored.examScore, 88);
    assert.equal(scored.interviewScore, 92);
    // 88 * 0.7 (61.6) + 92 * 0.3 (27.6) = 89.2
    assert.equal(scored.totalScore, 89.2);
    assert.ok(scored.scoredBy?.includes('Dr. Elizabeth Alabi'));
  });

  await t.test('rejects score outside allowed boundary (0 - 100)', async () => {
    await assert.rejects(
      async () => {
        await scoreApplication(
          TENANT_A_ID,
          'app_kcl_003',
          {
            examScore: 105, // Invalid > 100
            interviewScore: 80,
            reviewerRemarks: 'Out of bounds score',
          },
          principalSessionA
        );
      },
      /Exam score must be between 0 and 100/
    );
  });

  await t.test('issues conditional offer letter and accepts offer', async () => {
    const offered = await issueOfferLetter(
      TENANT_A_ID,
      'app_kcl_001',
      {
        tuitionDeposit: 200000,
        acceptanceDeadline: '2026-10-30',
        conditionalNotes: 'Tuition deposit confirms seat in JSS 1 Gold arm.',
      },
      principalSessionA
    );

    assert.equal(offered.status, 'OFFERED');
    assert.equal(offered.offerLetter?.tuitionDeposit, 200000);
    assert.equal(offered.offerLetter?.acceptanceDeadline, '2026-10-30');

    // Accept offer
    const accepted = await acceptOffer(TENANT_A_ID, 'app_kcl_001');
    assert.equal(accepted.status, 'ACCEPTED');
  });

  await t.test('1-click converts accepted applicant into full enrolled student', async () => {
    const student = await convertApplicantToStudent(
      TENANT_A_ID,
      'app_kcl_002',
      {
        classArmId: 'arm_jss1_gold',
        termId: 't1',
        admissionNumberPrefix: 'KCL',
      },
      principalSessionA
    );

    assert.ok(student.id);
    assert.equal(student.firstName, 'Ngozi');
    assert.equal(student.lastName, 'Eze');
    assert.match(student.admissionNumber, /^KCL\/\d{4}\/\d{3}$/);
    assert.equal(student.status, 'ACTIVE');
    assert.equal(student.currentClassLevelName, 'JSS 1');
    assert.equal(student.currentClassArmName, 'Gold');

    // Verify guardian created and linked
    assert.equal(student.guardians.length, 1);
    assert.equal(student.guardians[0].relationship, 'FATHER');
    assert.equal(student.guardians[0].guardian.email, 'c.eze@zenithbank.com');

    // Verify enrollment history record appended
    assert.equal(student.enrollmentHistory.length, 1);
    assert.equal(student.enrollmentHistory[0].classArmName, 'Gold');
    assert.equal(student.enrollmentHistory[0].enrollmentStatus, 'ACTIVE');

    // Verify application state transitioned to ENROLLED
    const updatedApp = await getApplication(TENANT_A_ID, 'app_kcl_002', principalSessionA);
    assert.equal(updatedApp?.status, 'ENROLLED');
    assert.equal(updatedApp?.enrolledStudentId, student.id);
  });

  await t.test('rejects converting already enrolled applicant', async () => {
    await assert.rejects(
      async () => {
        await convertApplicantToStudent(
          TENANT_A_ID,
          'app_kcl_002',
          {
            classArmId: 'arm_jss1_gold',
            termId: 't1',
          },
          principalSessionA
        );
      },
      /is already enrolled as a student/
    );
  });
});

test('Phase 4.2: Student Information System (SIS) & Non-Destructive History', async (t) => {
  await t.test('retrieves student list with multi-parameter search', async () => {
    const allStudents = await listStudents(TENANT_A_ID, {}, principalSessionA);
    assert.ok(allStudents.length >= 2);

    // Search by name
    const foundByName = await listStudents(TENANT_A_ID, { search: 'Chidubem' }, principalSessionA);
    assert.equal(foundByName.length, 1);
    assert.equal(foundByName[0].firstName, 'Chidubem');

    // Filter by class level
    const jss1Students = await listStudents(
      TENANT_A_ID,
      { classLevelId: 'lvl_jss1' },
      principalSessionA
    );
    assert.ok(jss1Students.every((s) => s.currentClassLevelId === 'lvl_jss1'));
  });

  await t.test('updates student medical and biodata tags', async () => {
    const updated = await updateStudentProfile(
      TENANT_A_ID,
      'stu_kcl_001',
      {
        bloodGroup: 'B+',
        genotype: 'AA',
        allergies: 'Penicillin and Shellfish',
      },
      principalSessionA
    );

    assert.equal(updated.bloodGroup, 'B+');
    assert.equal(updated.genotype, 'AA');
    assert.equal(updated.allergies, 'Penicillin and Shellfish');
  });

  await t.test('transfers student class arm preserving non-destructive history', async () => {
    const transferred = await transferStudentClassArm(
      TENANT_A_ID,
      'stu_kcl_001',
      {
        newClassArmId: 'arm_jss1_diamond',
        termId: 't1',
        reason: 'Rebalancing student teacher-ratio between Gold and Diamond arms.',
      },
      principalSessionA
    );

    assert.ok(transferred.currentClassArmId);
    assert.equal(transferred.currentClassArmName, 'Diamond');
    assert.equal(transferred.currentClassLevelName, 'JSS 1');

    // Verify non-destructive history length is now 2
    assert.equal(transferred.enrollmentHistory.length, 2);

    // First record marked TRANSFERRED
    assert.equal(transferred.enrollmentHistory[0].classArmName, 'Gold');
    assert.equal(transferred.enrollmentHistory[0].enrollmentStatus, 'TRANSFERRED');

    // Second record ACTIVE with transfer reason
    assert.equal(transferred.enrollmentHistory[1].classArmName, 'Diamond');
    assert.equal(transferred.enrollmentHistory[1].enrollmentStatus, 'ACTIVE');
    assert.match(
      transferred.enrollmentHistory[1].transferReason || '',
      /Rebalancing student teacher-ratio/
    );
  });

  await t.test('rejects transfer when student is already in target class arm', async () => {
    await assert.rejects(
      async () => {
        await transferStudentClassArm(
          TENANT_A_ID,
          'stu_kcl_001',
          {
            newClassArmId: 'arm_jss1_diamond', // Same arm
            termId: 't1',
            reason: 'Redundant transfer',
          },
          principalSessionA
        );
      },
      /Student is already assigned to the target class arm/
    );
  });
});

test('Phase 4.3: Batch Student & Guardian CSV Importer & Quarantine Engine', async (t) => {
  await t.test('rejects CSV with missing mandatory headers', async () => {
    const badCsv = `name,gender,class\nJohn,MALE,JSS 1`;
    await assert.rejects(
      async () => {
        await importStudentsFromCsv(TENANT_A_ID, badCsv, {}, principalSessionA);
      },
      /CSV is missing mandatory column header/
    );
  });

  await t.test('identifies and quarantines dirty records without data corruption', async () => {
    const dirtyCsv = `FirstName,LastName,Gender,DateOfBirth,ClassLevel,ClassArm,GuardianFirstName,GuardianLastName,GuardianPhone,GuardianEmail
Good,Student,MALE,2014-03-15,JSS 1,Gold,Paul,Student,+234 802 333 4444,paul@test.com
MissingLast,,FEMALE,2014-04-10,JSS 1,Gold,Grace,Parent,+234 803 444 5555,grace@test.com
BadGender,Boy,INVALID_GENDER,2014-05-12,JSS 1,Gold,Tunde,Boy,+234 804 555 6666,tunde@test.com
BadDate,Girl,FEMALE,15/05/2014,JSS 1,Gold,Mary,Girl,+234 805 666 7777,mary@test.com
BadEmail,Child,MALE,2014-06-20,JSS 1,Gold,David,Child,+234 806 777 8888,not-an-email`;

    const dryRunResult = await importStudentsFromCsv(
      TENANT_A_ID,
      dirtyCsv,
      { dryRun: true },
      principalSessionA
    );

    assert.equal(dryRunResult.totalProcessed, 5);
    assert.equal(dryRunResult.successfullyImported, 1);
    assert.equal(dryRunResult.quarantinedCount, 4);

    // Inspect quarantine errors
    assert.equal(dryRunResult.quarantinedRows.length, 4);
    assert.ok(dryRunResult.quarantinedRows[0].errors.some((e) => e.includes('Last name is required')));
    assert.ok(dryRunResult.quarantinedRows[1].errors.some((e) => e.includes('Gender must be MALE or FEMALE')));
    assert.ok(dryRunResult.quarantinedRows[2].errors.some((e) => e.includes('Date of birth must be YYYY-MM-DD')));
    assert.ok(dryRunResult.quarantinedRows[3].errors.some((e) => e.includes('Valid guardian email is required')));
  });

  await t.test('High-Volume Benchmark: imports 100 sample students in a single batch', async () => {
    // Generate 100 clean student rows
    const header = `FirstName,LastName,MiddleName,Gender,DateOfBirth,ClassLevel,ClassArm,GuardianFirstName,GuardianLastName,GuardianPhone,GuardianEmail,GuardianRelationship,StateOfOrigin,BloodGroup,Genotype,Allergies`;
    const rows: string[] = [header];

    const states = ['Lagos', 'Ogun', 'Oyo', 'Rivers', 'Kano', 'Kaduna', 'Enugu', 'Anambra', 'Edo', 'Delta'];
    const firstNames = ['Emeka', 'Amaka', 'Tunde', 'Yetunde', 'Ibrahim', 'Fatima', 'Chukwudi', 'Nkechi', 'Segun', 'Bisi'];
    const lastNames = ['Okonkwo', 'Balogun', 'Bello', 'Adeyemi', 'Nwosu', 'Danjuma', 'Eze', 'Ojo', 'Abubakar', 'Lawal'];

    for (let i = 1; i <= 100; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length] + i;
      const gender = i % 2 === 0 ? 'MALE' : 'FEMALE';
      const year = 2012 + (i % 4);
      const month = String(1 + (i % 12)).padStart(2, '0');
      const day = String(1 + (i % 28)).padStart(2, '0');
      const dob = `${year}-${month}-${day}`;
      const state = states[i % states.length];
      const arm = i % 2 === 0 ? 'Gold' : 'Diamond';

      rows.push(
        `${fn},${ln},Junior,${gender},${dob},JSS 1,${arm},Chief,${ln},+234 80${String(10000000 + i).slice(-8)},guardian${i}@example.sch.ng,FATHER,${state},O+,AA,None`
      );
    }

    const csvContent = rows.join('\n');
    const importResult = await importStudentsFromCsv(
      TENANT_A_ID,
      csvContent,
      { dryRun: false },
      principalSessionA
    );

    assert.equal(importResult.totalProcessed, 100);
    assert.equal(importResult.successfullyImported, 100);
    assert.equal(importResult.quarantinedCount, 0);

    // Verify all 100 students have unique admission numbers
    const admissionNumbers = new Set(importResult.importedStudents.map((s) => s.admissionNumber));
    assert.equal(admissionNumbers.size, 100);

    // Verify all 100 students have active enrollment records
    assert.ok(importResult.importedStudents.every((s) => s.enrollmentHistory.length === 1));
    assert.ok(importResult.importedStudents.every((s) => s.status === 'ACTIVE'));
  });
});

test('Phase 4.4: Security — Tenant Isolation, RBAC & Audit Engine', async (t) => {
  await t.test('strictly isolates cross-tenant student queries (Tenant B cannot read Tenant A)', async () => {
    await assert.rejects(
      async () => {
        // Owner of Tenant B trying to query students belonging to Tenant A
        await listStudents(TENANT_A_ID, {}, ownerSessionB);
      },
      /Access Denied: Cross-tenant student query strictly prohibited/
    );

    await assert.rejects(
      async () => {
        // Owner of Tenant B trying to query applications belonging to Tenant A
        await listApplications(TENANT_A_ID, {}, ownerSessionB);
      },
      /Access Denied: Cross-tenant application query strictly prohibited/
    );
  });

  await t.test('rejects cross-tenant mutations (Tenant B cannot score or convert Tenant A applicants)', async () => {
    await assert.rejects(
      async () => {
        await scoreApplication(
          TENANT_A_ID,
          'app_kcl_001',
          { examScore: 90, interviewScore: 90, reviewerRemarks: 'Hacker' },
          ownerSessionB
        );
      },
      /Security Error: Cross-tenant applicant scoring prohibited/
    );
  });

  await t.test('rejects unauthorized roles (Teacher) from converting applicants or importing students', async () => {
    await assert.rejects(
      async () => {
        await convertApplicantToStudent(
          TENANT_A_ID,
          'app_kcl_001',
          { classArmId: 'arm_jss1_gold', termId: 't1' },
          teacherSessionA
        );
      },
      /Permission Denied: User unauthorized to convert applicant to enrolled student/
    );

    await assert.rejects(
      async () => {
        await importStudentsFromCsv(
          TENANT_A_ID,
          'FirstName,LastName,Gender,DateOfBirth,ClassLevel,ClassArm,GuardianFirstName,GuardianLastName,GuardianPhone,GuardianEmail\nA,B,MALE,2014-01-01,JSS 1,Gold,C,D,+234 801 111 2222,cd@test.com',
          {},
          teacherSessionA
        );
      },
      /Permission Denied: User unauthorized to import student records/
    );
  });

  await t.test('verifies immutable audit logs generated on SIS and Admissions events', async () => {
    const logs = inMemoryAuditStore.filter((l) => l.schoolId === TENANT_A_ID);

    const actions = logs.map((l) => l.action);
    assert.ok(actions.includes('APPLICATION_SUBMITTED'), 'Must log APPLICATION_SUBMITTED');
    assert.ok(actions.includes('APPLICATION_SCORED'), 'Must log APPLICATION_SCORED');
    assert.ok(actions.includes('ADMISSION_OFFER_ISSUED'), 'Must log ADMISSION_OFFER_ISSUED');
    assert.ok(actions.includes('APPLICANT_CONVERTED_TO_STUDENT'), 'Must log APPLICANT_CONVERTED_TO_STUDENT');
    assert.ok(actions.includes('STUDENT_CLASS_ARM_TRANSFERRED'), 'Must log STUDENT_CLASS_ARM_TRANSFERRED');
    assert.ok(actions.includes('STUDENTS_BATCH_IMPORTED'), 'Must log STUDENTS_BATCH_IMPORTED');
  });

  await t.test('calculates accurate aggregate SIS dashboard metrics', async () => {
    const metrics = await getSisDashboardMetrics(TENANT_A_ID, principalSessionA);

    assert.ok(metrics.totalStudents >= 100);
    assert.ok(metrics.maleCount > 0);
    assert.ok(metrics.femaleCount > 0);
    assert.equal(metrics.totalStudents, metrics.maleCount + metrics.femaleCount);
    assert.ok(metrics.admissionsFunnel.totalApplications > 0);
  });
});
