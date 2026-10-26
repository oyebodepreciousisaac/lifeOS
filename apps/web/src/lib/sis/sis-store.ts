import {
  AdmissionApplication,
  StudentRecord,
  GuardianRecord,
  GuardianLink,
  EnrollmentHistoryRecord,
  ApplicationSubmissionInput,
  ApplicationSubmissionSchema,
  ApplicationScoringInput,
  ApplicationScoringSchema,
  OfferLetterInput,
  OfferLetterSchema,
  StudentConversionInput,
  StudentConversionSchema,
  StudentProfileUpdateInput,
  StudentProfileUpdateSchema,
  ArmTransferInput,
  ArmTransferSchema,
  BatchImportResult,
  BatchImportQuarantine,
  SisDashboardMetrics,
} from './sis-types';
import { AuthSession, can } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import { getSchoolConfiguration } from '../academic/academic-store';

// ------------------------------------------------------------------------------
// Multi-Tenant In-Memory Storage
// Keyed by schoolId
// ------------------------------------------------------------------------------

const applicationsStore: Map<string, AdmissionApplication[]> = new Map();
const studentsStore: Map<string, StudentRecord[]> = new Map();
const guardiansStore: Map<string, GuardianRecord[]> = new Map();

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111'; // King's College Lagos
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222'; // Premier Academy Abuja

function ensureStoreInitialized(schoolId: string) {
  if (!applicationsStore.has(schoolId)) {
    applicationsStore.set(schoolId, []);
  }
  if (!studentsStore.has(schoolId)) {
    studentsStore.set(schoolId, []);
  }
  if (!guardiansStore.has(schoolId)) {
    guardiansStore.set(schoolId, []);
  }
}

// ------------------------------------------------------------------------------
// Seed Initial Demo Records
// ------------------------------------------------------------------------------

function seedInitialData() {
  ensureStoreInitialized(TENANT_A_ID);
  ensureStoreInitialized(TENANT_B_ID);

  // Tenant A: Guardians
  const guardianA1: GuardianRecord = {
    id: 'grd_kcl_001',
    schoolId: TENANT_A_ID,
    firstName: 'Babajide',
    lastName: 'Sanwo-Olu',
    phonePrimary: '+234 803 111 2233',
    email: 'bsanwo@lagosstate.gov.ng',
    residentialAddress: 'Marina, Lagos Island, Lagos',
    occupation: 'Public Administrator',
    createdAt: '2026-08-01T08:00:00Z',
  };

  const guardianA2: GuardianRecord = {
    id: 'grd_kcl_002',
    schoolId: TENANT_A_ID,
    firstName: 'Folashade',
    lastName: 'Alakija',
    phonePrimary: '+234 802 999 8877',
    email: 'falakija@famfa.com',
    residentialAddress: 'Ikoyi, Lagos',
    occupation: 'Executive Director',
    createdAt: '2026-08-01T08:00:00Z',
  };

  guardiansStore.get(TENANT_A_ID)!.push(guardianA1, guardianA2);

  // Tenant A: Enrolled Students
  const studentA1: StudentRecord = {
    id: 'stu_kcl_001',
    schoolId: TENANT_A_ID,
    admissionNumber: 'KCL/2026/001',
    firstName: 'Chidubem',
    lastName: 'Adeleke',
    middleName: 'Emmanuel',
    gender: 'MALE',
    dateOfBirth: '2014-05-12',
    bloodGroup: 'O+',
    genotype: 'AA',
    allergies: 'None',
    stateOfOrigin: 'Osun',
    lga: 'Ede North',
    nationality: 'Nigerian',
    status: 'ACTIVE',
    currentClassLevelId: 'lvl_jss1',
    currentClassLevelName: 'JSS 1',
    currentClassArmId: 'arm_jss1_gold',
    currentClassArmName: 'Gold',
    currentCampusId: 'cmp_lagos_main',
    guardians: [
      {
        guardianId: guardianA1.id,
        studentId: 'stu_kcl_001',
        relationship: 'FATHER',
        isPrimaryContact: true,
        isBillingRecipient: true,
        hasCustody: true,
        guardian: guardianA1,
      },
    ],
    enrollmentHistory: [
      {
        id: 'enh_001',
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_001',
        classArmId: 'arm_jss1_gold',
        classArmName: 'Gold',
        classLevelId: 'lvl_jss1',
        classLevelName: 'JSS 1',
        termId: 't1',
        termName: '1st Term',
        sessionId: 'ses_2026_2027',
        sessionName: '2026/2027',
        enrollmentStatus: 'ACTIVE',
        assignedAt: '2026-09-14T08:00:00Z',
      },
    ],
    createdAt: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  };

  const studentA2: StudentRecord = {
    id: 'stu_kcl_002',
    schoolId: TENANT_A_ID,
    admissionNumber: 'KCL/2026/002',
    firstName: 'Amina',
    lastName: 'Bello',
    middleName: 'Fatima',
    gender: 'FEMALE',
    dateOfBirth: '2013-11-20',
    bloodGroup: 'A+',
    genotype: 'AS',
    allergies: 'Peanuts',
    stateOfOrigin: 'Lagos',
    lga: 'Lagos Island',
    nationality: 'Nigerian',
    status: 'ACTIVE',
    currentClassLevelId: 'lvl_jss1',
    currentClassLevelName: 'JSS 1',
    currentClassArmId: 'arm_jss1_gold',
    currentClassArmName: 'Gold',
    currentCampusId: 'cmp_lagos_main',
    guardians: [
      {
        guardianId: guardianA2.id,
        studentId: 'stu_kcl_002',
        relationship: 'MOTHER',
        isPrimaryContact: true,
        isBillingRecipient: true,
        hasCustody: true,
        guardian: guardianA2,
      },
    ],
    enrollmentHistory: [
      {
        id: 'enh_002_curr',
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_002',
        classArmId: 'arm_jss1_gold',
        classArmName: 'Gold',
        classLevelId: 'lvl_jss1',
        classLevelName: 'JSS 1',
        termId: 't1',
        termName: '1st Term',
        sessionId: 'ses_2026_2027',
        sessionName: '2026/2027',
        enrollmentStatus: 'ACTIVE',
        assignedAt: '2026-09-14T08:00:00Z',
      },
    ],
    createdAt: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  };

  const studentA3: StudentRecord = {
    id: 'stu_kcl_003',
    schoolId: TENANT_A_ID,
    admissionNumber: 'KCL/2026/003',
    firstName: 'Tunde',
    lastName: 'Bakare',
    middleName: 'Olumide',
    gender: 'MALE',
    dateOfBirth: '2014-06-12',
    bloodGroup: 'O+',
    genotype: 'AA',
    nationality: 'Nigerian',
    status: 'ACTIVE',
    currentClassLevelId: 'lvl_jss1',
    currentClassLevelName: 'JSS 1',
    currentClassArmId: 'arm_jss1_gold',
    currentClassArmName: 'Gold',
    currentCampusId: 'cmp_lagos_main',
    guardians: [
      {
        guardianId: guardianA1.id,
        studentId: 'stu_kcl_003',
        relationship: 'FATHER',
        isPrimaryContact: true,
        isBillingRecipient: true,
        hasCustody: true,
        guardian: guardianA1,
      },
    ],
    enrollmentHistory: [
      {
        id: 'enh_003_curr',
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_003',
        classArmId: 'arm_jss1_gold',
        classArmName: 'Gold',
        classLevelId: 'lvl_jss1',
        classLevelName: 'JSS 1',
        termId: 't1',
        termName: '1st Term',
        sessionId: 'ses_2026_2027',
        sessionName: '2026/2027',
        enrollmentStatus: 'ACTIVE',
        assignedAt: '2026-09-14T08:00:00Z',
      },
    ],
    createdAt: '2026-09-14T08:00:00Z',
    updatedAt: '2026-09-14T08:00:00Z',
  };

  studentsStore.get(TENANT_A_ID)!.push(studentA1, studentA2, studentA3);

  // Tenant A: Admissions Applications
  const appA1: AdmissionApplication = {
    id: 'app_kcl_001',
    schoolId: TENANT_A_ID,
    applicationNumber: 'APP/2026/001',
    firstName: 'Tobi',
    lastName: 'Oyelaran',
    middleName: 'Samuel',
    gender: 'MALE',
    dateOfBirth: '2015-02-14',
    stateOfOrigin: 'Oyo',
    lga: 'Ibadan North',
    nationality: 'Nigerian',
    residentialAddress: 'Victoria Garden City, Lekki',
    appliedClassLevelId: 'lvl_jss1',
    appliedClassLevelName: 'JSS 1',
    campusId: 'cmp_lagos_main',
    previousSchoolName: 'Corona Primary School Ikoyi',
    previousSchoolClass: 'Primary 6',
    guardian: {
      firstName: 'Kayode',
      lastName: 'Oyelaran',
      relationship: 'FATHER',
      phonePrimary: '+234 803 765 4321',
      email: 'kayode.oyelaran@gmail.com',
      occupation: 'Civil Engineer',
      isPrimaryContact: true,
      isBillingRecipient: true,
      hasCustody: true,
    },
    status: 'SCORED',
    examScore: 84,
    interviewScore: 90,
    totalScore: 85.8,
    reviewerRemarks: 'Demonstrates outstanding analytical reasoning and strong mathematical foundations.',
    scoredAt: '2026-09-02T11:00:00Z',
    scoredBy: 'Dr. Elizabeth Alabi',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  };

  const appA2: AdmissionApplication = {
    id: 'app_kcl_002',
    schoolId: TENANT_A_ID,
    applicationNumber: 'APP/2026/002',
    firstName: 'Ngozi',
    lastName: 'Eze',
    gender: 'FEMALE',
    dateOfBirth: '2015-06-25',
    stateOfOrigin: 'Enugu',
    lga: 'Nsukka',
    nationality: 'Nigerian',
    appliedClassLevelId: 'lvl_jss1',
    appliedClassLevelName: 'JSS 1',
    campusId: 'cmp_lagos_main',
    previousSchoolName: 'St. Saviour’s School Ebute Metta',
    previousSchoolClass: 'Basic 6',
    guardian: {
      firstName: 'Chukwuma',
      lastName: 'Eze',
      relationship: 'FATHER',
      phonePrimary: '+234 809 123 9876',
      email: 'c.eze@zenithbank.com',
      occupation: 'Banker',
      isPrimaryContact: true,
      isBillingRecipient: true,
      hasCustody: true,
    },
    status: 'OFFERED',
    examScore: 92,
    interviewScore: 95,
    totalScore: 92.9,
    reviewerRemarks: 'Exceptional verbal aptitude and general knowledge. Top 5% candidate.',
    offerLetter: {
      offerDate: '2026-09-05',
      tuitionDeposit: 150000,
      acceptanceDeadline: '2026-09-25',
      conditionalNotes: 'Admission subject to submission of original primary school certificate.',
      signedBy: 'Dr. Elizabeth Alabi (Principal)',
    },
    createdAt: '2026-08-22T09:30:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
  };

  const appA3: AdmissionApplication = {
    id: 'app_kcl_003',
    schoolId: TENANT_A_ID,
    applicationNumber: 'APP/2026/003',
    firstName: 'Ayomide',
    lastName: 'Babatunde',
    gender: 'MALE',
    dateOfBirth: '2014-09-18',
    nationality: 'Nigerian',
    appliedClassLevelId: 'lvl_jss2',
    appliedClassLevelName: 'JSS 2',
    campusId: 'cmp_lagos_main',
    guardian: {
      firstName: 'Simisola',
      lastName: 'Babatunde',
      relationship: 'MOTHER',
      phonePrimary: '+234 818 456 7890',
      email: 'simi.babatunde@yahoo.com',
      occupation: 'Architect',
      isPrimaryContact: true,
      isBillingRecipient: true,
      hasCustody: true,
    },
    status: 'SUBMITTED',
    createdAt: '2026-09-08T15:20:00Z',
    updatedAt: '2026-09-08T15:20:00Z',
  };

  applicationsStore.get(TENANT_A_ID)!.push(appA1, appA2, appA3);
}

// Run initial seeding
seedInitialData();

// ------------------------------------------------------------------------------
// Admissions Funnel Service Functions
// ------------------------------------------------------------------------------

export async function submitApplication(
  schoolId: string,
  input: ApplicationSubmissionInput
): Promise<AdmissionApplication> {
  const validated = ApplicationSubmissionSchema.parse(input);
  ensureStoreInitialized(schoolId);

  const apps = applicationsStore.get(schoolId)!;
  const count = apps.length + 1;
  const paddedIndex = String(count).padStart(3, '0');
  const applicationNumber = `APP/${new Date().getFullYear()}/${paddedIndex}`;

  // Resolve target class name from academic configuration if available
  const academicConfig = await getSchoolConfiguration(schoolId);
  const targetLevel = academicConfig?.classLevels.find(
    (lvl) =>
      lvl.id === validated.appliedClassLevelId ||
      lvl.name.toLowerCase() === validated.appliedClassLevelId.toLowerCase() ||
      (validated.appliedClassLevelId.toLowerCase().includes('jss1') && lvl.name.toLowerCase() === 'jss 1') ||
      (validated.appliedClassLevelId.toLowerCase().includes('jss2') && lvl.name.toLowerCase() === 'jss 2')
  );
  const appliedClassLevelName = targetLevel ? targetLevel.name : 'JSS 1';

  const newApp: AdmissionApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    schoolId,
    applicationNumber,
    firstName: validated.firstName.trim(),
    lastName: validated.lastName.trim(),
    middleName: validated.middleName?.trim(),
    gender: validated.gender,
    dateOfBirth: validated.dateOfBirth,
    stateOfOrigin: validated.stateOfOrigin,
    lga: validated.lga,
    nationality: validated.nationality,
    residentialAddress: validated.residentialAddress,
    allergies: validated.allergies,
    appliedClassLevelId: targetLevel ? targetLevel.id : validated.appliedClassLevelId,
    appliedClassLevelName,
    campusId: validated.campusId,
    previousSchoolName: validated.previousSchoolName,
    previousSchoolClass: validated.previousSchoolClass,
    guardian: validated.guardian,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  apps.push(newApp);

  await logAuditEvent({
    schoolId,
    action: 'APPLICATION_SUBMITTED',
    resourceType: 'AdmissionApplication',
    resourceId: newApp.id,
    afterState: {
      applicationNumber,
      applicantName: `${newApp.firstName} ${newApp.lastName}`,
      appliedClassLevelName,
      guardianEmail: newApp.guardian.email,
    },
  });

  return newApp;
}

export async function listApplications(
  schoolId: string,
  filters: {
    status?: string;
    classLevelId?: string;
    search?: string;
  } = {},
  actor?: AuthSession
): Promise<AdmissionApplication[]> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Access Denied: Cross-tenant application query strictly prohibited.');
  }

  ensureStoreInitialized(schoolId);
  let list = [...applicationsStore.get(schoolId)!];

  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((app) => app.status === filters.status);
  }
  if (filters.classLevelId && filters.classLevelId !== 'ALL') {
    list = list.filter((app) => app.appliedClassLevelId === filters.classLevelId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (app) =>
        app.applicationNumber.toLowerCase().includes(q) ||
        app.firstName.toLowerCase().includes(q) ||
        app.lastName.toLowerCase().includes(q) ||
        app.guardian.phonePrimary.includes(q) ||
        app.guardian.email.toLowerCase().includes(q)
    );
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getApplication(
  schoolId: string,
  applicationId: string,
  actor?: AuthSession
): Promise<AdmissionApplication | null> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Access Denied: Cross-tenant application query strictly prohibited.');
  }

  ensureStoreInitialized(schoolId);
  const app = applicationsStore.get(schoolId)!.find((a) => a.id === applicationId);
  return app || null;
}

export async function scoreApplication(
  schoolId: string,
  applicationId: string,
  scoring: ApplicationScoringInput,
  actor: AuthSession
): Promise<AdmissionApplication> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant applicant scoring prohibited.');
  }
  if (!can(actor, 'admissions.review') && !can(actor, 'admissions.manage')) {
    throw new Error('Permission Denied: User unauthorized to score admission candidates.');
  }

  const validated = ApplicationScoringSchema.parse(scoring);
  ensureStoreInitialized(schoolId);
  const app = applicationsStore.get(schoolId)!.find((a) => a.id === applicationId);
  if (!app) {
    throw new Error(`Application ${applicationId} not found.`);
  }

  // Calculate weighted total score (70% exam, 30% interview)
  const totalScore = Math.round((validated.examScore * 0.7 + validated.interviewScore * 0.3) * 10) / 10;

  app.examScore = validated.examScore;
  app.interviewScore = validated.interviewScore;
  app.totalScore = totalScore;
  app.reviewerRemarks = validated.reviewerRemarks.trim();
  app.status = 'SCORED';
  app.scoredAt = new Date().toISOString();
  app.scoredBy = `${actor.firstName} ${actor.lastName} (${actor.userType})`;
  app.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'APPLICATION_SCORED',
    resourceType: 'AdmissionApplication',
    resourceId: app.id,
    afterState: {
      applicationNumber: app.applicationNumber,
      applicantName: `${app.firstName} ${app.lastName}`,
      examScore: app.examScore,
      interviewScore: app.interviewScore,
      totalScore: app.totalScore,
      scoredBy: app.scoredBy,
    },
  });

  return app;
}

export async function issueOfferLetter(
  schoolId: string,
  applicationId: string,
  offer: OfferLetterInput,
  actor: AuthSession
): Promise<AdmissionApplication> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant offer generation prohibited.');
  }
  if (!can(actor, 'admissions.approve') && !can(actor, 'admissions.manage')) {
    throw new Error('Permission Denied: User unauthorized to issue admission offers.');
  }

  const validated = OfferLetterSchema.parse(offer);
  ensureStoreInitialized(schoolId);
  const app = applicationsStore.get(schoolId)!.find((a) => a.id === applicationId);
  if (!app) {
    throw new Error(`Application ${applicationId} not found.`);
  }

  app.offerLetter = {
    offerDate: new Date().toISOString().split('T')[0],
    tuitionDeposit: validated.tuitionDeposit,
    acceptanceDeadline: validated.acceptanceDeadline,
    conditionalNotes: validated.conditionalNotes,
    signedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
  };
  app.status = 'OFFERED';
  app.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'ADMISSION_OFFER_ISSUED',
    resourceType: 'AdmissionApplication',
    resourceId: app.id,
    afterState: {
      applicationNumber: app.applicationNumber,
      applicantName: `${app.firstName} ${app.lastName}`,
      tuitionDeposit: validated.tuitionDeposit,
      acceptanceDeadline: validated.acceptanceDeadline,
    },
  });

  return app;
}

export async function acceptOffer(
  schoolId: string,
  applicationId: string,
  actor?: AuthSession
): Promise<AdmissionApplication> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant offer acceptance prohibited.');
  }

  ensureStoreInitialized(schoolId);
  const app = applicationsStore.get(schoolId)!.find((a) => a.id === applicationId);
  if (!app) {
    throw new Error(`Application ${applicationId} not found.`);
  }

  app.status = 'ACCEPTED';
  app.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    action: 'ADMISSION_OFFER_ACCEPTED',
    resourceType: 'AdmissionApplication',
    resourceId: app.id,
    afterState: {
      applicationNumber: app.applicationNumber,
      applicantName: `${app.firstName} ${app.lastName}`,
    },
  });

  return app;
}

export async function convertApplicantToStudent(
  schoolId: string,
  applicationId: string,
  conversionInput: StudentConversionInput,
  actor: AuthSession
): Promise<StudentRecord> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant student enrollment prohibited.');
  }
  if (!can(actor, 'students.manage') && !can(actor, 'admissions.approve')) {
    throw new Error('Permission Denied: User unauthorized to convert applicant to enrolled student.');
  }

  const validated = StudentConversionSchema.parse(conversionInput);
  ensureStoreInitialized(schoolId);
  const app = applicationsStore.get(schoolId)!.find((a) => a.id === applicationId);
  if (!app) {
    throw new Error(`Application ${applicationId} not found.`);
  }
  if (app.status === 'ENROLLED') {
    throw new Error(`Applicant ${app.applicationNumber} is already enrolled as a student.`);
  }

  // Resolve academic structure
  const academicConfig = await getSchoolConfiguration(schoolId);
  if (!academicConfig) {
    throw new Error('School academic structure must be configured before enrolling students.');
  }

  // Find class level and arm
  // Find class level and arm, prioritizing applicant's applied class level
  let targetLevel = academicConfig.classLevels.find(
    (lvl) =>
      lvl.id === app.appliedClassLevelId ||
      lvl.name.toLowerCase() === app.appliedClassLevelName.toLowerCase() ||
      (app.appliedClassLevelId.toLowerCase().includes('jss1') && lvl.name.toLowerCase() === 'jss 1') ||
      (app.appliedClassLevelId.toLowerCase().includes('jss2') && lvl.name.toLowerCase() === 'jss 2')
  );

  let targetArm: { id: string; name: string; capacity: number } | undefined;

  if (targetLevel) {
    targetArm = targetLevel.arms.find(
      (a) =>
        a.id === validated.classArmId ||
        a.name.toLowerCase() === validated.classArmId.toLowerCase() ||
        (validated.classArmId.toLowerCase().includes('gold') && a.name.toLowerCase() === 'gold') ||
        (validated.classArmId.toLowerCase().includes('diamond') && a.name.toLowerCase() === 'diamond')
    );
  }

  if (!targetArm || !targetLevel) {
    for (const lvl of academicConfig.classLevels) {
      const arm = lvl.arms.find(
        (a) =>
          a.id === validated.classArmId ||
          a.name.toLowerCase() === validated.classArmId.toLowerCase() ||
          (validated.classArmId.toLowerCase().includes('gold') && a.name.toLowerCase() === 'gold') ||
          (validated.classArmId.toLowerCase().includes('diamond') && a.name.toLowerCase() === 'diamond')
      );
      if (arm) {
        targetArm = arm;
        targetLevel = lvl;
        break;
      }
    }
  }

  if (!targetArm || !targetLevel) {
    throw new Error(`Class arm ID '${validated.classArmId}' was not found in school configuration.`);
  }

  const currentTerm = academicConfig.activeSession?.terms.find(
    (t) => t.id === validated.termId
  ) || academicConfig.activeSession?.terms[0];

  const termId = currentTerm ? currentTerm.id : validated.termId;
  const termName = currentTerm ? currentTerm.name : 'Current Term';
  const sessionName = academicConfig.activeSession?.name || '2026/2027';
  const sessionId = academicConfig.activeSession?.id || 'ses_curr';

  // Generate official admission number
  const students = studentsStore.get(schoolId)!;
  const nextNum = students.length + 1;
  const paddedNum = String(nextNum).padStart(3, '0');
  const codePrefix = validated.admissionNumberPrefix || academicConfig.school.officialCode || 'SCH';
  const admissionNumber = `${codePrefix}/${new Date().getFullYear()}/${paddedNum}`;

  // 1. Create Guardian
  const guardianId = `grd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const guardianRecord: GuardianRecord = {
    id: guardianId,
    schoolId,
    firstName: app.guardian.firstName,
    lastName: app.guardian.lastName,
    phonePrimary: app.guardian.phonePrimary,
    phoneSecondary: app.guardian.phoneSecondary,
    email: app.guardian.email,
    residentialAddress: app.guardian.residentialAddress || app.residentialAddress,
    occupation: app.guardian.occupation,
    createdAt: new Date().toISOString(),
  };
  guardiansStore.get(schoolId)!.push(guardianRecord);

  // 2. Create Student Record
  const studentId = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const initialEnrollment: EnrollmentHistoryRecord = {
    id: `enh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    studentId,
    classArmId: targetArm.id,
    classArmName: targetArm.name,
    classLevelId: targetLevel.id,
    classLevelName: targetLevel.name,
    termId,
    termName,
    sessionId,
    sessionName,
    enrollmentStatus: 'ACTIVE',
    assignedAt: new Date().toISOString(),
  };

  const newStudent: StudentRecord = {
    id: studentId,
    schoolId,
    admissionNumber,
    firstName: app.firstName,
    lastName: app.lastName,
    middleName: app.middleName,
    gender: app.gender,
    dateOfBirth: app.dateOfBirth,
    allergies: app.allergies,
    stateOfOrigin: app.stateOfOrigin,
    lga: app.lga,
    nationality: app.nationality || 'Nigerian',
    status: 'ACTIVE',
    currentClassLevelId: targetLevel.id,
    currentClassLevelName: targetLevel.name,
    currentClassArmId: targetArm.id,
    currentClassArmName: targetArm.name,
    currentCampusId: app.campusId,
    guardians: [
      {
        guardianId: guardianRecord.id,
        studentId,
        relationship: app.guardian.relationship,
        isPrimaryContact: app.guardian.isPrimaryContact ?? true,
        isBillingRecipient: app.guardian.isBillingRecipient ?? true,
        hasCustody: app.guardian.hasCustody ?? true,
        guardian: guardianRecord,
      },
    ],
    enrollmentHistory: [initialEnrollment],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  students.push(newStudent);

  // 3. Update Application Status to ENROLLED
  app.status = 'ENROLLED';
  app.enrolledStudentId = studentId;
  app.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'APPLICANT_CONVERTED_TO_STUDENT',
    resourceType: 'StudentRecord',
    resourceId: studentId,
    afterState: {
      applicationNumber: app.applicationNumber,
      admissionNumber,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      classArmName: `${targetLevel.name} ${targetArm.name}`,
    },
  });

  return newStudent;
}

// ------------------------------------------------------------------------------
// Student Information System (SIS) Functions
// ------------------------------------------------------------------------------

export async function listStudents(
  schoolId: string,
  filters: {
    search?: string;
    classLevelId?: string;
    classArmId?: string;
    status?: string;
    gender?: string;
  } = {},
  actor?: AuthSession
): Promise<StudentRecord[]> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Access Denied: Cross-tenant student query strictly prohibited.');
  }

  ensureStoreInitialized(schoolId);
  let list = [...studentsStore.get(schoolId)!];

  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters.gender && filters.gender !== 'ALL') {
    list = list.filter((s) => s.gender === filters.gender);
  }
  if (filters.classLevelId && filters.classLevelId !== 'ALL') {
    list = list.filter((s) => s.currentClassLevelId === filters.classLevelId);
  }
  if (filters.classArmId && filters.classArmId !== 'ALL') {
    list = list.filter((s) => s.currentClassArmId === filters.classArmId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.admissionNumber.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        (s.middleName && s.middleName.toLowerCase().includes(q)) ||
        s.guardians.some((g) => g.guardian.phonePrimary.includes(q))
    );
  }

  return list.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export async function getStudent(
  schoolId: string,
  studentId: string,
  actor?: AuthSession
): Promise<StudentRecord | null> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Access Denied: Cross-tenant student query strictly prohibited.');
  }

  ensureStoreInitialized(schoolId);
  const student = studentsStore.get(schoolId)!.find((s) => s.id === studentId);
  return student || null;
}

export async function updateStudentProfile(
  schoolId: string,
  studentId: string,
  input: StudentProfileUpdateInput,
  actor: AuthSession
): Promise<StudentRecord> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant student update prohibited.');
  }
  if (!can(actor, 'students.manage')) {
    throw new Error('Permission Denied: User unauthorized to update student records.');
  }

  const validated = StudentProfileUpdateSchema.parse(input);
  ensureStoreInitialized(schoolId);
  const student = studentsStore.get(schoolId)!.find((s) => s.id === studentId);
  if (!student) {
    throw new Error(`Student ${studentId} not found.`);
  }

  if (validated.firstName) student.firstName = validated.firstName.trim();
  if (validated.lastName) student.lastName = validated.lastName.trim();
  if (validated.middleName !== undefined) student.middleName = validated.middleName.trim();
  if (validated.gender) student.gender = validated.gender;
  if (validated.dateOfBirth) student.dateOfBirth = validated.dateOfBirth;
  if (validated.bloodGroup) student.bloodGroup = validated.bloodGroup;
  if (validated.genotype) student.genotype = validated.genotype;
  if (validated.allergies !== undefined) student.allergies = validated.allergies.trim();
  if (validated.stateOfOrigin !== undefined) student.stateOfOrigin = validated.stateOfOrigin.trim();
  if (validated.lga !== undefined) student.lga = validated.lga.trim();
  if (validated.nationality !== undefined) student.nationality = validated.nationality.trim();
  if (validated.status) student.status = validated.status;

  student.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'STUDENT_PROFILE_UPDATED',
    resourceType: 'StudentRecord',
    resourceId: student.id,
    afterState: {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      studentName: `${student.firstName} ${student.lastName}`,
      updatedFields: Object.keys(validated),
    },
  });

  return student;
}

/**
 * Non-destructive Class Arm Transfer
 * Appends a new timestamped enrollment record without destroying historical arm allocations.
 */
export async function transferStudentClassArm(
  schoolId: string,
  studentId: string,
  input: ArmTransferInput,
  actor: AuthSession
): Promise<StudentRecord> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant class transfer prohibited.');
  }
  if (!can(actor, 'students.manage')) {
    throw new Error('Permission Denied: User unauthorized to transfer student class arm.');
  }

  const validated = ArmTransferSchema.parse(input);
  ensureStoreInitialized(schoolId);
  const student = studentsStore.get(schoolId)!.find((s) => s.id === studentId);
  if (!student) {
    throw new Error(`Student ${studentId} not found.`);
  }

  if (
    student.currentClassArmId === validated.newClassArmId ||
    student.currentClassArmName.toLowerCase() === validated.newClassArmId.toLowerCase()
  ) {
    throw new Error('Student is already assigned to the target class arm.');
  }

  const academicConfig = await getSchoolConfiguration(schoolId);
  if (!academicConfig) {
    throw new Error('Academic configuration not found.');
  }

  let newArm: { id: string; name: string } | undefined;
  let newLevel: { id: string; name: string } | undefined;

  // Search within student's current class level first
  const currentLvl = academicConfig.classLevels.find(
    (lvl) => lvl.id === student.currentClassLevelId || lvl.name === student.currentClassLevelName
  );
  if (currentLvl) {
    const a = currentLvl.arms.find(
      (arm) =>
        arm.id === validated.newClassArmId ||
        arm.name.toLowerCase() === validated.newClassArmId.toLowerCase() ||
        (validated.newClassArmId.toLowerCase().includes('diamond') && arm.name.toLowerCase() === 'diamond') ||
        (validated.newClassArmId.toLowerCase().includes('gold') && arm.name.toLowerCase() === 'gold')
    );
    if (a) {
      newArm = a;
      newLevel = currentLvl;
    }
  }

  if (!newArm || !newLevel) {
    for (const lvl of academicConfig.classLevels) {
      const a = lvl.arms.find(
        (arm) =>
          arm.id === validated.newClassArmId ||
          arm.name.toLowerCase() === validated.newClassArmId.toLowerCase() ||
          (validated.newClassArmId.toLowerCase().includes('diamond') && arm.name.toLowerCase() === 'diamond') ||
          (validated.newClassArmId.toLowerCase().includes('gold') && arm.name.toLowerCase() === 'gold')
      );
      if (a) {
        newArm = a;
        newLevel = lvl;
        break;
      }
    }
  }

  if (!newArm || !newLevel) {
    throw new Error(`Target class arm '${validated.newClassArmId}' does not exist.`);
  }

  if (student.currentClassArmId === newArm.id) {
    throw new Error('Student is already assigned to the target class arm.');
  }

  const currentTerm = academicConfig.activeSession?.terms.find(
    (t) => t.id === validated.termId
  ) || academicConfig.activeSession?.terms[0];

  const previousArmName = student.currentClassArmName;
  const previousLevelName = student.currentClassLevelName;

  // Mark latest active enrollment record as TRANSFERRED
  if (student.enrollmentHistory.length > 0) {
    const latest = student.enrollmentHistory[student.enrollmentHistory.length - 1];
    if (latest.enrollmentStatus === 'ACTIVE') {
      latest.enrollmentStatus = 'TRANSFERRED';
    }
  }

  // Append new active enrollment record
  const newEnrollment: EnrollmentHistoryRecord = {
    id: `enh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    studentId: student.id,
    classArmId: newArm.id,
    classArmName: newArm.name,
    classLevelId: newLevel.id,
    classLevelName: newLevel.name,
    termId: currentTerm ? currentTerm.id : validated.termId,
    termName: currentTerm ? currentTerm.name : 'Current Term',
    sessionId: academicConfig.activeSession?.name || '2026/2027',
    sessionName: academicConfig.activeSession?.name || '2026/2027',
    enrollmentStatus: 'ACTIVE',
    assignedAt: new Date().toISOString(),
    transferReason: validated.reason.trim(),
  };

  student.enrollmentHistory.push(newEnrollment);
  student.currentClassLevelId = newLevel.id;
  student.currentClassLevelName = newLevel.name;
  student.currentClassArmId = newArm.id;
  student.currentClassArmName = newArm.name;
  student.updatedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'STUDENT_CLASS_ARM_TRANSFERRED',
    resourceType: 'StudentRecord',
    resourceId: student.id,
    afterState: {
      admissionNumber: student.admissionNumber,
      studentName: `${student.firstName} ${student.lastName}`,
      from: `${previousLevelName} ${previousArmName}`,
      to: `${newLevel.name} ${newArm.name}`,
      reason: validated.reason,
    },
  });

  return student;
}

// ------------------------------------------------------------------------------
// Batch Student & Guardian CSV Importer with Quarantine Engine
// ------------------------------------------------------------------------------

export async function importStudentsFromCsv(
  schoolId: string,
  csvText: string,
  options: {
    dryRun?: boolean;
    currentTermId?: string;
  } = {},
  actor: AuthSession
): Promise<BatchImportResult> {
  if (actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Security Error: Cross-tenant student batch import prohibited.');
  }
  if (!can(actor, 'students.import') && !can(actor, 'students.manage')) {
    throw new Error('Permission Denied: User unauthorized to import student records.');
  }

  ensureStoreInitialized(schoolId);
  const academicConfig = await getSchoolConfiguration(schoolId);
  if (!academicConfig) {
    throw new Error('School academic configuration must be completed before importing students.');
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing data rows.');
  }

  // Parse header
  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const expectedHeaders = [
    'firstname',
    'lastname',
    'gender',
    'dateofbirth',
    'classlevel',
    'classarm',
    'guardianfirstname',
    'guardianlastname',
    'guardianphone',
    'guardianemail',
  ];

  for (const exp of expectedHeaders) {
    if (!headers.includes(exp)) {
      throw new Error(`CSV is missing mandatory column header '${exp}'.`);
    }
  }

  const getCol = (row: string[], colName: string) => {
    const idx = headers.indexOf(colName.toLowerCase());
    if (idx === -1 || idx >= row.length) return '';
    return row[idx].trim().replace(/^["']|["']$/g, '');
  };

  const quarantinedRows: BatchImportQuarantine[] = [];
  const validCandidates: Array<{
    rowNumber: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: 'MALE' | 'FEMALE';
    dateOfBirth: string;
    classLevelName: string;
    classArmName: string;
    guardianFirstName: string;
    guardianLastName: string;
    guardianPhone: string;
    guardianEmail: string;
    guardianRelationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'SPONSOR';
    stateOfOrigin?: string;
    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    admissionNumber?: string;
  }> = [];

  const existingStudents = studentsStore.get(schoolId)!;
  const existingAdmissionNumbers = new Set(existingStudents.map((s) => s.admissionNumber.toUpperCase()));

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    // Basic comma splitter handling quotes
    const rawCols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const errors: string[] = [];

    const firstName = getCol(rawCols, 'firstname');
    const lastName = getCol(rawCols, 'lastname');
    const middleName = getCol(rawCols, 'middlename');
    const genderRaw = getCol(rawCols, 'gender').toUpperCase();
    const dob = getCol(rawCols, 'dateofbirth');
    const classLevel = getCol(rawCols, 'classlevel');
    const classArm = getCol(rawCols, 'classarm');
    const guardianFirstName = getCol(rawCols, 'guardianfirstname');
    const guardianLastName = getCol(rawCols, 'guardianlastname');
    const guardianPhone = getCol(rawCols, 'guardianphone');
    const guardianEmail = getCol(rawCols, 'guardianemail');
    const guardianRel = (getCol(rawCols, 'guardianrelationship') || 'GUARDIAN').toUpperCase();
    const stateOfOrigin = getCol(rawCols, 'stateoforigin');
    const bloodGroup = getCol(rawCols, 'bloodgroup');
    const genotype = getCol(rawCols, 'genotype');
    const allergies = getCol(rawCols, 'allergies');
    const customAdmissionNumber = getCol(rawCols, 'admissionnumber');

    if (!firstName) errors.push('First name is required.');
    if (!lastName) errors.push('Last name is required.');
    if (genderRaw !== 'MALE' && genderRaw !== 'FEMALE') {
      errors.push(`Gender must be MALE or FEMALE. Received: '${genderRaw}'.`);
    }
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      errors.push(`Date of birth must be YYYY-MM-DD. Received: '${dob}'.`);
    }
    if (!classLevel) errors.push('Class level is required.');
    if (!classArm) errors.push('Class arm is required.');
    if (!guardianFirstName || !guardianLastName) {
      errors.push('Guardian first and last name are required.');
    }
    if (!guardianPhone || guardianPhone.length < 7) {
      errors.push('Valid guardian phone number is required.');
    }
    if (!guardianEmail || !guardianEmail.includes('@')) {
      errors.push('Valid guardian email is required.');
    }

    if (customAdmissionNumber && existingAdmissionNumbers.has(customAdmissionNumber.toUpperCase())) {
      errors.push(`Admission number '${customAdmissionNumber}' already exists in this school.`);
    }

    if (errors.length > 0) {
      quarantinedRows.push({
        rowNumber,
        rowData: {
          firstName,
          lastName,
          gender: genderRaw,
          dateOfBirth: dob,
          classLevelName: classLevel,
          classArmName: classArm,
          guardianFirstName,
          guardianLastName,
          guardianPhone,
          guardianEmail,
        },
        errors,
      });
    } else {
      if (customAdmissionNumber) {
        existingAdmissionNumbers.add(customAdmissionNumber.toUpperCase());
      }
      validCandidates.push({
        rowNumber,
        firstName,
        lastName,
        middleName,
        gender: genderRaw as 'MALE' | 'FEMALE',
        dateOfBirth: dob,
        classLevelName: classLevel,
        classArmName: classArm,
        guardianFirstName,
        guardianLastName,
        guardianPhone,
        guardianEmail,
        guardianRelationship: (['FATHER', 'MOTHER', 'GUARDIAN', 'SPONSOR'].includes(guardianRel)
          ? guardianRel
          : 'GUARDIAN') as 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'SPONSOR',
        stateOfOrigin,
        bloodGroup,
        genotype,
        allergies,
        admissionNumber: customAdmissionNumber,
      });
    }
  }

  // If dry-run, return preview without committing to store
  if (options.dryRun) {
    return {
      totalProcessed: lines.length - 1,
      successfullyImported: validCandidates.length,
      quarantinedCount: quarantinedRows.length,
      importedStudents: [],
      quarantinedRows,
    };
  }

  // Commit valid records to store
  const importedStudents: StudentRecord[] = [];
  const term = academicConfig.activeSession?.terms[0];
  const termId = term ? term.id : 't1';
  const termName = term ? term.name : '1st Term';
  const sessionName = academicConfig.activeSession?.name || '2026/2027';

  let currentSequence = existingStudents.length;

  for (const item of validCandidates) {
    currentSequence++;
    const padded = String(currentSequence).padStart(4, '0');
    const admissionNumber =
      item.admissionNumber ||
      `${academicConfig.school.officialCode || 'SCH'}/${new Date().getFullYear()}/${padded}`;

    // Resolve or fallback class arm and level
    let matchedLevel = academicConfig.classLevels.find(
      (l) => l.name.toLowerCase() === item.classLevelName.toLowerCase()
    );
    if (!matchedLevel) {
      matchedLevel = academicConfig.classLevels[0];
    }

    let matchedArm = matchedLevel?.arms.find(
      (a) => a.name.toLowerCase() === item.classArmName.toLowerCase()
    );
    if (!matchedArm && matchedLevel && matchedLevel.arms.length > 0) {
      matchedArm = matchedLevel.arms[0];
    }

    const classLevelId = matchedLevel ? matchedLevel.id : 'lvl_def';
    const classLevelName = matchedLevel ? matchedLevel.name : item.classLevelName;
    const classArmId = matchedArm ? matchedArm.id : 'arm_def';
    const classArmName = matchedArm ? matchedArm.name : item.classArmName;

    // Create Guardian
    const guardianId = `grd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const guardian: GuardianRecord = {
      id: guardianId,
      schoolId,
      firstName: item.guardianFirstName,
      lastName: item.guardianLastName,
      phonePrimary: item.guardianPhone,
      email: item.guardianEmail,
      createdAt: new Date().toISOString(),
    };
    guardiansStore.get(schoolId)!.push(guardian);

    // Create Student
    const studentId = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const enrollment: EnrollmentHistoryRecord = {
      id: `enh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId,
      studentId,
      classArmId,
      classArmName,
      classLevelId,
      classLevelName,
      termId,
      termName,
      sessionId: 'ses_curr',
      sessionName,
      enrollmentStatus: 'ACTIVE',
      assignedAt: new Date().toISOString(),
    };

    const studentRecord: StudentRecord = {
      id: studentId,
      schoolId,
      admissionNumber,
      firstName: item.firstName,
      lastName: item.lastName,
      middleName: item.middleName,
      gender: item.gender,
      dateOfBirth: item.dateOfBirth,
      bloodGroup: item.bloodGroup || 'UNKNOWN',
      genotype: item.genotype || 'UNKNOWN',
      allergies: item.allergies || 'None',
      stateOfOrigin: item.stateOfOrigin,
      nationality: 'Nigerian',
      status: 'ACTIVE',
      currentClassLevelId: classLevelId,
      currentClassLevelName: classLevelName,
      currentClassArmId: classArmId,
      currentClassArmName: classArmName,
      currentCampusId: academicConfig.campuses[0]?.id || 'cmp_main',
      guardians: [
        {
          guardianId: guardian.id,
          studentId,
          relationship: item.guardianRelationship,
          isPrimaryContact: true,
          isBillingRecipient: true,
          hasCustody: true,
          guardian,
        },
      ],
      enrollmentHistory: [enrollment],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    existingStudents.push(studentRecord);
    importedStudents.push(studentRecord);
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'STUDENTS_BATCH_IMPORTED',
    resourceType: 'StudentRecord',
    afterState: {
      totalRows: lines.length - 1,
      importedCount: importedStudents.length,
      quarantinedCount: quarantinedRows.length,
    },
  });

  return {
    totalProcessed: lines.length - 1,
    successfullyImported: importedStudents.length,
    quarantinedCount: quarantinedRows.length,
    importedStudents,
    quarantinedRows,
  };
}

// ------------------------------------------------------------------------------
// SIS Dashboard Metrics
// ------------------------------------------------------------------------------

export async function getSisDashboardMetrics(
  schoolId: string,
  actor?: AuthSession
): Promise<SisDashboardMetrics> {
  if (actor && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('Access Denied: Cross-tenant metrics query strictly prohibited.');
  }

  ensureStoreInitialized(schoolId);
  const students = studentsStore.get(schoolId)!;
  const applications = applicationsStore.get(schoolId)!;

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;
  const maleCount = students.filter((s) => s.gender === 'MALE').length;
  const femaleCount = students.filter((s) => s.gender === 'FEMALE').length;

  const academicConfig = await getSchoolConfiguration(schoolId);

  const bySection = {
    earlyYears: 0,
    primary: 0,
    juniorSecondary: 0,
    seniorSecondary: 0,
  };

  if (academicConfig) {
    const levelToSectionMap = new Map<string, string>();
    for (const lvl of academicConfig.classLevels) {
      levelToSectionMap.set(lvl.id, lvl.section);
    }

    for (const s of students) {
      const sec = levelToSectionMap.get(s.currentClassLevelId);
      if (sec === 'EARLY_YEARS') bySection.earlyYears++;
      else if (sec === 'PRIMARY') bySection.primary++;
      else if (sec === 'JUNIOR_SECONDARY') bySection.juniorSecondary++;
      else if (sec === 'SENIOR_SECONDARY') bySection.seniorSecondary++;
      else bySection.juniorSecondary++; // default
    }
  }

  const admissionsFunnel = {
    totalApplications: applications.length,
    submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
    scored: applications.filter((a) => a.status === 'SCORED').length,
    offered: applications.filter((a) => a.status === 'OFFERED').length,
    accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
    enrolled: applications.filter((a) => a.status === 'ENROLLED').length,
  };

  return {
    totalStudents,
    activeStudents,
    maleCount,
    femaleCount,
    bySection,
    admissionsFunnel,
  };
}
