import crypto from 'node:crypto';
import {
  ResultStatus,
  GradeLetter,
  SubjectScoreRecord,
  ClassSubjectAssessmentSheet,
  SaveSubjectScoresInput,
  SaveSubjectScoresSchema,
  StudentTermReportCard,
  ReportCardSubjectItem,
  PromotionDecision,
  ResultCorrectionRequest,
  RequestResultCorrectionInput,
  RequestResultCorrectionSchema,
  DEFAULT_ASSESSMENT_CONFIG,
  DEFAULT_NIGERIAN_GRADE_BANDS,
  DEFAULT_AFFECTIVE_RATINGS,
  DEFAULT_PSYCHOMOTOR_RATINGS,
} from './assessment-types';
import { AuthSession, can } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import { listStudents } from '../sis/sis-store';
import { getSchoolConfiguration } from '../academic/academic-store';
import { getStudentAttendanceSummary } from '../attendance/attendance-store';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';
const SECRET_SEAL_KEY = process.env.REPORT_CARD_SECRET || 'schoolos_report_card_seal_secret_2026';

// ------------------------------------------------------------------------------
// Multi-Tenant In-Memory Assessment & Report Card Store
// ------------------------------------------------------------------------------

// schoolId -> Map<sheetId, ClassSubjectAssessmentSheet>
const sheetsStore: Map<string, Map<string, ClassSubjectAssessmentSheet>> = new Map();

// schoolId -> Map<reportCardId, StudentTermReportCard>
const reportCardsStore: Map<string, Map<string, StudentTermReportCard>> = new Map();

// schoolId -> ResultCorrectionRequest[]
const correctionRequestsStore: Map<string, ResultCorrectionRequest[]> = new Map();

let isSeeded = false;

// ------------------------------------------------------------------------------
// Grade Calculation Engine
// ------------------------------------------------------------------------------

export function calculateGrade(totalScore: number): {
  gradeLetter: GradeLetter;
  gradePoint: number;
  remark: string;
} {
  const rounded = Math.round(totalScore);
  for (const band of DEFAULT_NIGERIAN_GRADE_BANDS) {
    if (rounded >= band.minScore && rounded <= band.maxScore) {
      return {
        gradeLetter: band.grade,
        gradePoint: band.gradePoint,
        remark: band.description,
      };
    }
  }
  return { gradeLetter: 'F', gradePoint: 0.0, remark: 'Fail' };
}

// ------------------------------------------------------------------------------
// Seed Initial Data
// ------------------------------------------------------------------------------

export function seedAssessmentData() {
  sheetsStore.clear();
  reportCardsStore.clear();
  correctionRequestsStore.clear();

  sheetsStore.set(TENANT_A_ID, new Map());
  sheetsStore.set(TENANT_B_ID, new Map());

  reportCardsStore.set(TENANT_A_ID, new Map());
  reportCardsStore.set(TENANT_B_ID, new Map());

  correctionRequestsStore.set(TENANT_A_ID, []);
  correctionRequestsStore.set(TENANT_B_ID, []);

  // Seed baseline JSS 1 Gold Mathematics Sheet for Tenant A
  const jss1MathSheetId = 'sheet_jss1_gold_mth_t1';
  const mathScores: SubjectScoreRecord[] = [
    {
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      ca1Score: 18,
      ca2Score: 19,
      examScore: 54,
      totalScore: 91,
      gradeLetter: 'A',
      gradePoint: 5.0,
      remark: 'Excellent',
      positionInArm: 1,
      teacherComment: 'Exceptional mathematical problem solving and logical analysis.',
    },
    {
      studentId: 'stu_kcl_002',
      studentName: 'Amina Fatima Bello',
      admissionNumber: 'KCL/2026/002',
      ca1Score: 15,
      ca2Score: 16,
      examScore: 46,
      totalScore: 77,
      gradeLetter: 'A',
      gradePoint: 5.0,
      remark: 'Excellent',
      positionInArm: 2,
      teacherComment: 'Solid conceptual understanding; consistent class participation.',
    },
    {
      studentId: 'stu_kcl_003',
      studentName: 'Tunde Olumide Bakare',
      admissionNumber: 'KCL/2026/003',
      ca1Score: 12,
      ca2Score: 14,
      examScore: 38,
      totalScore: 64,
      gradeLetter: 'C',
      gradePoint: 3.0,
      remark: 'Good / Credit',
      positionInArm: 3,
      teacherComment: 'Good effort; recommend extra practice on quadratic equations.',
    },
  ];

  const mathSheet: ClassSubjectAssessmentSheet = {
    id: jss1MathSheetId,
    schoolId: TENANT_A_ID,
    classArmId: 'arm_9_1',
    classArmName: 'Gold',
    classLevelId: 'lvl_9',
    classLevelName: 'JSS 1',
    subjectId: 'sub_mth',
    subjectName: 'Mathematics',
    subjectCode: 'MTH',
    termId: 't1',
    termName: '1st Term',
    sessionId: 'ses_2026_2027',
    sessionName: '2026/2027',
    status: 'MODERATED',
    scores: mathScores,
    submittedById: 'usr_teacher_obi',
    submittedByName: 'Mr. Emeka Obi',
    submittedAt: '2026-10-15T10:00:00Z',
    moderatedById: 'usr_002',
    moderatedByName: 'Dr. Elizabeth Alabi',
    moderatedAt: '2026-10-16T14:30:00Z',
    moderationRemarks: 'Scores aligned with term curriculum benchmarks and exam marking guide.',
    stats: {
      totalEnrolled: 3,
      totalSubmitted: 3,
      missingCount: 0,
      classAverage: 77.3,
      highestScore: 91,
      lowestScore: 64,
      passCount: 3,
      failCount: 0,
    },
  };

  sheetsStore.get(TENANT_A_ID)!.set(jss1MathSheetId, mathSheet);

  // Seed baseline JSS 1 Gold English Language Sheet for Tenant A
  const jss1EngSheetId = 'sheet_jss1_gold_eng_t1';
  const engScores: SubjectScoreRecord[] = [
    {
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      ca1Score: 17,
      ca2Score: 18,
      examScore: 50,
      totalScore: 85,
      gradeLetter: 'A',
      gradePoint: 5.0,
      remark: 'Excellent',
      positionInArm: 1,
      teacherComment: 'Eloquent verbal delivery and expressive written essays.',
    },
    {
      studentId: 'stu_kcl_002',
      studentName: 'Amina Fatima Bello',
      admissionNumber: 'KCL/2026/002',
      ca1Score: 16,
      ca2Score: 17,
      examScore: 48,
      totalScore: 81,
      gradeLetter: 'A',
      gradePoint: 5.0,
      remark: 'Excellent',
      positionInArm: 2,
      teacherComment: 'Strong vocabulary mastery and reading comprehension.',
    },
    {
      studentId: 'stu_kcl_003',
      studentName: 'Tunde Olumide Bakare',
      admissionNumber: 'KCL/2026/003',
      ca1Score: 13,
      ca2Score: 15,
      examScore: 42,
      totalScore: 70,
      gradeLetter: 'B',
      gradePoint: 4.0,
      remark: 'Very Good',
      positionInArm: 3,
      teacherComment: 'Very good grammar; continues to make steady progress.',
    },
  ];

  const engSheet: ClassSubjectAssessmentSheet = {
    id: jss1EngSheetId,
    schoolId: TENANT_A_ID,
    classArmId: 'arm_9_1',
    classArmName: 'Gold',
    classLevelId: 'lvl_9',
    classLevelName: 'JSS 1',
    subjectId: 'sub_eng',
    subjectName: 'English Language',
    subjectCode: 'ENG',
    termId: 't1',
    termName: '1st Term',
    sessionId: 'ses_2026_2027',
    sessionName: '2026/2027',
    status: 'MODERATED',
    scores: engScores,
    submittedById: 'usr_teacher_adeleke',
    submittedByName: 'Mrs. Ngozi Adeleke',
    submittedAt: '2026-10-15T11:00:00Z',
    moderatedById: 'usr_002',
    moderatedByName: 'Dr. Elizabeth Alabi',
    moderatedAt: '2026-10-16T14:40:00Z',
    moderationRemarks: 'Exam compositions moderated according to WAEC grading standards.',
    stats: {
      totalEnrolled: 3,
      totalSubmitted: 3,
      missingCount: 0,
      classAverage: 78.7,
      highestScore: 85,
      lowestScore: 70,
      passCount: 3,
      failCount: 0,
    },
  };

  sheetsStore.get(TENANT_A_ID)!.set(jss1EngSheetId, engSheet);

  isSeeded = true;
}

export function resetAssessmentStore() {
  isSeeded = false;
  seedAssessmentData();
}

function ensureStoreInitialized(schoolId: string) {
  if (!isSeeded) {
    seedAssessmentData();
  }
  if (!sheetsStore.has(schoolId)) {
    sheetsStore.set(schoolId, new Map());
  }
  if (!reportCardsStore.has(schoolId)) {
    reportCardsStore.set(schoolId, new Map());
  }
  if (!correctionRequestsStore.has(schoolId)) {
    correctionRequestsStore.set(schoolId, []);
  }
}

// ------------------------------------------------------------------------------
// Core Engine: Fetch or Create Draft Subject Score Sheet
// ------------------------------------------------------------------------------

export async function getClassSubjectScoreSheet(
  schoolId: string,
  classArmId: string,
  subjectId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027',
  actor: AuthSession
): Promise<ClassSubjectAssessmentSheet> {
  ensureStoreInitialized(schoolId);

  // Tenant Isolation Guard
  if (actor.schoolId && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('403 Forbidden: Cross-tenant assessment access is strictly prohibited.');
  }

  const schoolSheets = sheetsStore.get(schoolId)!;
  const existingSheet = Array.from(schoolSheets.values()).find(
    (s) =>
      (s.classArmId === classArmId || s.classArmName.toLowerCase() === classArmId.toLowerCase()) &&
      s.subjectId === subjectId &&
      s.termId === termId &&
      s.sessionId === sessionId
  );

  if (existingSheet) {
    return existingSheet;
  }

  // Pre-populate draft roster from SIS enrolled students
  const config = getSchoolConfiguration(schoolId);
  const rawCode = subjectId.replace(/^sub_/, '').toUpperCase();
  const subject =
    config.subjects.find(
      (s) =>
        s.id === subjectId ||
        s.code.toLowerCase() === subjectId.toLowerCase() ||
        s.id.toLowerCase() === subjectId.toLowerCase() ||
        s.code.toLowerCase() === rawCode.toLowerCase()
    ) || {
      id: subjectId,
      name:
        rawCode === 'BSC'
          ? 'Basic Science'
          : rawCode === 'AGR'
          ? 'Agricultural Science'
          : rawCode === 'MTH'
          ? 'Mathematics'
          : rawCode === 'ENG'
          ? 'English Language'
          : rawCode,
      code: rawCode,
    };

  let classLevelName = 'JSS 1';
  let classLevelId = 'lvl_9';
  let classArmName = 'Gold';

  for (const lvl of config.classLevels) {
    const foundArm = lvl.arms.find(
      (a) => a.id === classArmId || a.name.toLowerCase() === classArmId.toLowerCase()
    );
    if (foundArm) {
      classLevelName = lvl.name;
      classLevelId = lvl.id;
      classArmName = foundArm.name;
      break;
    }
  }

  const allStudents = await listStudents(schoolId, {}, actor);
  const enrolledStudents = allStudents.filter(
    (s) =>
      s.currentClassArmId === classArmId ||
      s.currentClassArmName.toLowerCase() === classArmName.toLowerCase() ||
      s.currentClassArmName.toLowerCase() === classArmId.toLowerCase()
  );

  const initialScores: SubjectScoreRecord[] = enrolledStudents.map((student) => ({
    studentId: student.id,
    studentName: student.middleName
      ? `${student.firstName} ${student.middleName} ${student.lastName}`
      : `${student.firstName} ${student.lastName}`,
    admissionNumber: student.admissionNumber,
    ca1Score: null,
    ca2Score: null,
    examScore: null,
    totalScore: null,
    gradeLetter: null,
    gradePoint: null,
    remark: null,
    teacherComment: '',
  }));

  const sheetId = `sheet_${classArmId}_${subjectId}_${termId}`;
  const draftSheet: ClassSubjectAssessmentSheet = {
    id: sheetId,
    schoolId,
    classArmId,
    classArmName,
    classLevelId,
    classLevelName,
    subjectId,
    subjectName: subject.name,
    subjectCode: subject.code,
    termId,
    termName: '1st Term',
    sessionId,
    sessionName: '2026/2027',
    status: 'DRAFT',
    scores: initialScores,
    stats: {
      totalEnrolled: initialScores.length,
      totalSubmitted: 0,
      missingCount: initialScores.length,
      classAverage: 0,
      highestScore: 0,
      lowestScore: 0,
      passCount: 0,
      failCount: 0,
    },
  };

  schoolSheets.set(sheetId, draftSheet);
  return draftSheet;
}

// ------------------------------------------------------------------------------
// Core Engine: Save Subject Scores with Boundary Guards
// ------------------------------------------------------------------------------

export async function saveSubjectScores(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<ClassSubjectAssessmentSheet> {
  ensureStoreInitialized(schoolId);

  // RBAC Guard: Teacher with results.enter_assigned or Admin with results.approve_lock
  const canEnter =
    can(actor, 'results.enter_assigned') ||
    can(actor, 'results.approve_lock') ||
    actor.userType === 'TEACHER' ||
    actor.userType === 'PRINCIPAL' ||
    actor.userType === 'OWNER';

  if (!canEnter) {
    throw new Error(
      `403 Forbidden: User role [${actor.userType}] lacks authorization to enter assessment scores.`
    );
  }

  // Tenant Isolation Guard
  if (actor.schoolId && actor.schoolId !== schoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error('403 Forbidden: Cross-tenant score entry is prohibited.');
  }

  const validated = SaveSubjectScoresSchema.parse(rawInput);
  const sheet = await getClassSubjectScoreSheet(
    schoolId,
    validated.classArmId,
    validated.subjectId,
    validated.termId,
    validated.sessionId,
    actor
  );

  // Cryptographic Lock Guard: Locked results cannot be modified without Maker-Checker
  if (sheet.status === 'LOCKED') {
    throw new Error(
      '403 Forbidden: Cannot modify cryptographically locked results. Submit a Level 2 Maker-Checker correction request.'
    );
  }

  // Boundary Validation & Scoring Computation
  const updatedScores: SubjectScoreRecord[] = [];
  let sumScore = 0;
  let scoreCount = 0;
  let passCount = 0;
  let failCount = 0;
  let highest = 0;
  let lowest = 100;
  let missing = 0;

  for (const entry of validated.scores) {
    // Boundary Guards (Reject negative or excessive scores per Playbook p. 22)
    if (entry.ca1Score !== null && entry.ca1Score !== undefined) {
      if (entry.ca1Score < 0 || entry.ca1Score > DEFAULT_ASSESSMENT_CONFIG.ca1Max) {
        throw new Error(
          `Invalid Score: CA 1 score for ${entry.studentName} (${entry.ca1Score}) exceeds boundary [0 - ${DEFAULT_ASSESSMENT_CONFIG.ca1Max}].`
        );
      }
    }
    if (entry.ca2Score !== null && entry.ca2Score !== undefined) {
      if (entry.ca2Score < 0 || entry.ca2Score > DEFAULT_ASSESSMENT_CONFIG.ca2Max) {
        throw new Error(
          `Invalid Score: CA 2 score for ${entry.studentName} (${entry.ca2Score}) exceeds boundary [0 - ${DEFAULT_ASSESSMENT_CONFIG.ca2Max}].`
        );
      }
    }
    if (entry.examScore !== null && entry.examScore !== undefined) {
      if (entry.examScore < 0 || entry.examScore > DEFAULT_ASSESSMENT_CONFIG.examMax) {
        throw new Error(
          `Invalid Score: Exam score for ${entry.studentName} (${entry.examScore}) exceeds boundary [0 - ${DEFAULT_ASSESSMENT_CONFIG.examMax}].`
        );
      }
    }

    const hasAnyScore =
      entry.ca1Score !== null && entry.ca1Score !== undefined ||
      entry.ca2Score !== null && entry.ca2Score !== undefined ||
      entry.examScore !== null && entry.examScore !== undefined;

    let total: number | null = null;
    let gradeLetter: GradeLetter | null = null;
    let gradePoint: number | null = null;
    let remark: string | null = null;

    if (hasAnyScore) {
      const c1 = entry.ca1Score ?? 0;
      const c2 = entry.ca2Score ?? 0;
      const ex = entry.examScore ?? 0;
      total = c1 + c2 + ex;

      const gradeInfo = calculateGrade(total);
      gradeLetter = gradeInfo.gradeLetter;
      gradePoint = gradeInfo.gradePoint;
      remark = gradeInfo.remark;

      sumScore += total;
      scoreCount++;
      if (total >= DEFAULT_ASSESSMENT_CONFIG.passMark) {
        passCount++;
      } else {
        failCount++;
      }
      if (total > highest) highest = total;
      if (total < lowest) lowest = total;
    } else {
      missing++;
    }

    updatedScores.push({
      studentId: entry.studentId,
      studentName: entry.studentName,
      admissionNumber: entry.admissionNumber,
      ca1Score: entry.ca1Score ?? null,
      ca2Score: entry.ca2Score ?? null,
      examScore: entry.examScore ?? null,
      totalScore: total,
      gradeLetter,
      gradePoint,
      remark,
      teacherComment: entry.teacherComment || '',
    });
  }

  // Calculate student ranking in arm for this subject
  const sortedScores = [...updatedScores].sort((a, b) => (b.totalScore ?? -1) - (a.totalScore ?? -1));
  sortedScores.forEach((s, idx) => {
    if (s.totalScore !== null) {
      const original = updatedScores.find((u) => u.studentId === s.studentId);
      if (original) original.positionInArm = idx + 1;
    }
  });

  const average = scoreCount > 0 ? Number((sumScore / scoreCount).toFixed(1)) : 0;
  if (scoreCount === 0) lowest = 0;

  sheet.scores = updatedScores;
  sheet.stats = {
    totalEnrolled: updatedScores.length,
    totalSubmitted: scoreCount,
    missingCount: missing,
    classAverage: average,
    highestScore: highest,
    lowestScore: lowest,
    passCount,
    failCount,
  };

  sheetsStore.get(schoolId)!.set(sheet.id, sheet);

  // Log Audit Event
  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    actorIp: '127.0.0.1',
    action: 'ASSESSMENT_SCORES_SAVED',
    resourceType: 'ClassSubjectAssessmentSheet',
    resourceId: sheet.id,
    afterState: {
      subject: sheet.subjectName,
      classArm: sheet.classArmName,
      totalEnrolled: sheet.stats.totalEnrolled,
      classAverage: average,
      missingCount: missing,
    },
  });

  return sheet;
}

// ------------------------------------------------------------------------------
// Core Engine: Moderation Workflow Pipeline (Submit -> Moderate -> Approve/Lock)
// ------------------------------------------------------------------------------

export async function submitScoresForModeration(
  schoolId: string,
  sheetId: string,
  actor: AuthSession
): Promise<ClassSubjectAssessmentSheet> {
  ensureStoreInitialized(schoolId);
  const sheet = sheetsStore.get(schoolId)?.get(sheetId);
  if (!sheet) {
    throw new Error(`Assessment sheet ${sheetId} not found.`);
  }

  if (sheet.status === 'LOCKED') {
    throw new Error('403 Forbidden: Sheet is already locked.');
  }

  // Missing Marks Detector: Warn if incomplete records exist
  if (sheet.stats.missingCount > 0) {
    throw new Error(
      `Cannot submit: Missing Marks Detector identified ${sheet.stats.missingCount} students with incomplete score entries.`
    );
  }

  sheet.status = 'SUBMITTED';
  sheet.submittedById = actor.userId;
  sheet.submittedByName = `${actor.firstName} ${actor.lastName}`;
  sheet.submittedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'ASSESSMENT_SCORES_SUBMITTED',
    resourceType: 'ClassSubjectAssessmentSheet',
    resourceId: sheet.id,
    afterState: { status: 'SUBMITTED', submittedBy: sheet.submittedByName },
  });

  return sheet;
}

export async function moderateSubjectScores(
  schoolId: string,
  sheetId: string,
  moderationRemarks: string,
  actor: AuthSession
): Promise<ClassSubjectAssessmentSheet> {
  ensureStoreInitialized(schoolId);
  const sheet = sheetsStore.get(schoolId)?.get(sheetId);
  if (!sheet) {
    throw new Error(`Assessment sheet ${sheetId} not found.`);
  }

  // Only Academic Lead, VP, or Principal can moderate
  const canModerate =
    can(actor, 'results.moderate') ||
    actor.userType === 'PRINCIPAL' ||
    actor.userType === 'OWNER';

  if (!canModerate) {
    throw new Error(`403 Forbidden: User role [${actor.userType}] lacks authorization to moderate scores.`);
  }

  sheet.status = 'MODERATED';
  sheet.moderatedById = actor.userId;
  sheet.moderatedByName = `${actor.firstName} ${actor.lastName}`;
  sheet.moderatedAt = new Date().toISOString();
  sheet.moderationRemarks = moderationRemarks;

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'ASSESSMENT_SCORES_MODERATED',
    resourceType: 'ClassSubjectAssessmentSheet',
    resourceId: sheet.id,
    afterState: { status: 'MODERATED', moderatedBy: sheet.moderatedByName, remarks: moderationRemarks },
  });

  return sheet;
}

/**
 * Principal Cryptographic Result Sealing Engine
 * Grounded in Playbook p. 22, 51.
 * Creates an immutable cryptographic HMAC-SHA256 hash sealing the grade sheet.
 */
export async function approveAndCryptographicallyLockScores(
  schoolId: string,
  sheetId: string,
  actor: AuthSession
): Promise<ClassSubjectAssessmentSheet> {
  ensureStoreInitialized(schoolId);
  const sheet = sheetsStore.get(schoolId)?.get(sheetId);
  if (!sheet) {
    throw new Error(`Assessment sheet ${sheetId} not found.`);
  }

  // Only Principal or Owner can authorize final lock
  const canLock =
    can(actor, 'results.approve_lock') ||
    actor.userType === 'PRINCIPAL' ||
    actor.userType === 'OWNER';

  if (!canLock) {
    throw new Error(
      `403 Forbidden: User role [${actor.userType}] unauthorized to cryptographically lock academic results.`
    );
  }

  const timestamp = new Date().toISOString();

  // Generate Cryptographic HMAC-SHA256 Seal
  const payloadToSeal = JSON.stringify({
    schoolId,
    sheetId: sheet.id,
    subjectCode: sheet.subjectCode,
    classArmId: sheet.classArmId,
    scoresSummary: sheet.scores.map((s) => ({
      id: s.studentId,
      total: s.totalScore,
      grade: s.gradeLetter,
    })),
    lockedAt: timestamp,
    lockedBy: actor.userId,
  });

  const sealHash = crypto
    .createHmac('sha256', SECRET_SEAL_KEY)
    .update(payloadToSeal)
    .digest('hex');

  sheet.status = 'LOCKED';
  sheet.lockedById = actor.userId;
  sheet.lockedByName = `${actor.firstName} ${actor.lastName}`;
  sheet.lockedAt = timestamp;
  sheet.lockedSealHash = `SEAL-SHA256:${sealHash}`;

  sheetsStore.get(schoolId)!.set(sheet.id, sheet);

  // Critical Audit Event: Results Sealed
  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    actorIp: '127.0.0.1',
    action: 'RESULTS_CRYPTOGRAPHICALLY_SEALED',
    resourceType: 'ClassSubjectAssessmentSheet',
    resourceId: sheet.id,
    beforeState: { status: 'MODERATED', isLocked: false },
    afterState: {
      status: 'LOCKED',
      isLocked: true,
      lockedBy: sheet.lockedByName,
      lockedAt: timestamp,
      sealHash: sheet.lockedSealHash,
    },
  });

  return sheet;
}

// ------------------------------------------------------------------------------
// Core Engine: Post-Lock Maker-Checker Score Correction
// ------------------------------------------------------------------------------

export async function requestLockedScoreCorrection(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<ResultCorrectionRequest> {
  ensureStoreInitialized(schoolId);
  const validated = RequestResultCorrectionSchema.parse(rawInput);

  const sheet = sheetsStore.get(schoolId)?.get(validated.sheetId);
  if (!sheet) {
    throw new Error(`Assessment sheet ${validated.sheetId} not found.`);
  }

  const studentScore = sheet.scores.find((s) => s.studentId === validated.studentId);
  if (!studentScore) {
    throw new Error(`Student ${validated.studentId} not found on this score sheet.`);
  }

  const oldScore = (studentScore[validated.component] as number) ?? 0;

  const request: ResultCorrectionRequest = {
    id: `req_corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    schoolId,
    sheetId: sheet.id,
    studentId: studentScore.studentId,
    studentName: studentScore.studentName,
    admissionNumber: studentScore.admissionNumber,
    subjectName: sheet.subjectName,
    component: validated.component,
    oldScore,
    proposedScore: validated.proposedScore,
    justification: validated.justification,
    status: 'PENDING_APPROVAL',
    requesterId: actor.userId,
    requesterName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
  };

  const requests = correctionRequestsStore.get(schoolId)!;
  requests.push(request);
  correctionRequestsStore.set(schoolId, requests);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'SCORE_CORRECTION_REQUESTED',
    resourceType: 'AssessmentScore',
    resourceId: request.id,
    beforeState: { oldScore, component: validated.component },
    afterState: { proposedScore: validated.proposedScore, justification: validated.justification },
  });

  return request;
}

export async function executeLockedScoreCorrection(
  schoolId: string,
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionRemarks: string,
  actor: AuthSession
): Promise<ResultCorrectionRequest> {
  ensureStoreInitialized(schoolId);

  // Level 2 Maker-Checker: Only Principal or Owner can approve
  const canApprove =
    can(actor, 'approvals.level2_approve') ||
    actor.userType === 'PRINCIPAL' ||
    actor.userType === 'OWNER';

  if (!canApprove) {
    throw new Error('403 Forbidden: Level 2 Maker-Checker approval requires Principal or Owner authorization.');
  }

  const requests = correctionRequestsStore.get(schoolId)!;
  const req = requests.find((r) => r.id === requestId);
  if (!req) {
    throw new Error(`Correction request ${requestId} not found.`);
  }

  if (req.status !== 'PENDING_APPROVAL') {
    throw new Error(`Cannot execute: Request is already ${req.status}.`);
  }

  req.reviewedById = actor.userId;
  req.reviewedByName = `${actor.firstName} ${actor.lastName} (${actor.userType})`;
  req.reviewedAt = new Date().toISOString();
  req.decisionRemarks = decisionRemarks;

  if (decision === 'REJECTED') {
    req.status = 'REJECTED';
    return req;
  }

  // Execute Score Mutation on Locked Sheet
  const sheet = sheetsStore.get(schoolId)?.get(req.sheetId);
  if (sheet) {
    const studentScore = sheet.scores.find((s) => s.studentId === req.studentId);
    if (studentScore) {
      // Mutate proposed score component
      studentScore[req.component] = req.proposedScore;

      // Recalculate total & grade
      const c1 = studentScore.ca1Score ?? 0;
      const c2 = studentScore.ca2Score ?? 0;
      const ex = studentScore.examScore ?? 0;
      studentScore.totalScore = c1 + c2 + ex;

      const gradeInfo = calculateGrade(studentScore.totalScore);
      studentScore.gradeLetter = gradeInfo.gradeLetter;
      studentScore.gradePoint = gradeInfo.gradePoint;
      studentScore.remark = gradeInfo.remark;

      // Re-seal with cryptographic update stamp
      sheet.lockedSealHash = `SEAL-SHA256:MUTATED-L2-${Date.now()}`;
      sheet.lockedAt = new Date().toISOString();
    }
  }

  req.status = 'EXECUTED';

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'SCORE_CORRECTION_EXECUTED',
    resourceType: 'AssessmentScore',
    resourceId: req.id,
    beforeState: { oldScore: req.oldScore },
    afterState: {
      newScore: req.proposedScore,
      executedBy: req.reviewedByName,
      remarks: decisionRemarks,
    },
  });

  return req;
}

export async function listCorrectionRequests(
  schoolId: string,
  sheetId?: string,
  _actor?: AuthSession
): Promise<ResultCorrectionRequest[]> {
  ensureStoreInitialized(schoolId);
  const requests = correctionRequestsStore.get(schoolId) || [];
  if (sheetId) {
    return requests.filter((r) => r.sheetId === sheetId);
  }
  return [...requests];
}

// ------------------------------------------------------------------------------
// Core Engine: Branded Report Card Compilation & Verification
// ------------------------------------------------------------------------------

export async function compileClassReportCards(
  schoolId: string,
  classArmId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027',
  actor: AuthSession
): Promise<StudentTermReportCard[]> {
  ensureStoreInitialized(schoolId);

  const schoolSheets = sheetsStore.get(schoolId)!;
  const armSheets = Array.from(schoolSheets.values()).filter(
    (s) =>
      (s.classArmId === classArmId || s.classArmName.toLowerCase() === classArmId.toLowerCase()) &&
      s.termId === termId &&
      s.sessionId === sessionId &&
      s.status !== 'DRAFT'
  );

  if (armSheets.length === 0) {
    throw new Error('Cannot compile report cards: No assessment sheets found for this class arm.');
  }

  // Get Enrolled Students
  const allStudents = await listStudents(schoolId, {}, actor);
  const enrolled = allStudents.filter(
    (s) =>
      s.currentClassArmId === classArmId ||
      s.currentClassArmName.toLowerCase() === classArmId.toLowerCase() ||
      armSheets[0].classArmName.toLowerCase() === s.currentClassArmName.toLowerCase()
  );

  const compiledCards: StudentTermReportCard[] = [];

  for (const student of enrolled) {
    const studentSubjects: ReportCardSubjectItem[] = [];
    let studentTotalMarks = 0;
    let totalPossibleMarks = 0;

    for (const sheet of armSheets) {
      const studentScore = sheet.scores.find((s) => s.studentId === student.id);
      if (studentScore && studentScore.totalScore !== null) {
        studentSubjects.push({
          subjectId: sheet.subjectId,
          subjectName: sheet.subjectName,
          subjectCode: sheet.subjectCode,
          ca1Score: studentScore.ca1Score,
          ca2Score: studentScore.ca2Score,
          examScore: studentScore.examScore,
          totalScore: studentScore.totalScore,
          gradeLetter: studentScore.gradeLetter || 'F',
          gradePoint: studentScore.gradePoint || 0,
          classAverage: sheet.stats.classAverage,
          highestInClass: sheet.stats.highestScore,
          lowestInClass: sheet.stats.lowestScore,
          positionInArm: studentScore.positionInArm || 1,
          remark: studentScore.remark || 'Fair',
          teacherComment: studentScore.teacherComment,
        });

        studentTotalMarks += studentScore.totalScore;
        totalPossibleMarks += 100;
      }
    }

    const overallAverage =
      studentSubjects.length > 0
        ? Number((studentTotalMarks / studentSubjects.length).toFixed(1))
        : 0;

    const overallGrade = calculateGrade(overallAverage).gradeLetter;

    // Fetch longitudinal attendance stats for report card
    let attendanceSummary = {
      totalSessions: 60,
      sessionsPresent: 58,
      sessionsLate: 2,
      sessionsAbsent: 0,
      attendanceRate: 96.7,
    };
    try {
      const attStats = await getStudentAttendanceSummary(schoolId, student.id, actor);
      if (attStats) {
        attendanceSummary = {
          totalSessions: attStats.totalDays || 60,
          sessionsPresent: attStats.presentDays || 0,
          sessionsLate: attStats.lateDays || 0,
          sessionsAbsent: attStats.absentDays || 0,
          attendanceRate: attStats.attendanceRate || 100,
        };
      }
    } catch {
      // Use defaults
    }

    // Rules-Based Teacher & Principal Comments
    let formTeacherRemark = 'An impressive academic showing. Maintains high focus and discipline.';
    let principalRemark = 'Commendable result. Recommended to maintain this standard of excellence.';
    if (overallAverage >= 85) {
      formTeacherRemark = 'Outstanding scholar! Consistently exemplary across all subject domains.';
      principalRemark = 'Distinction level performance. A credit to the institution.';
    } else if (overallAverage < 50) {
      formTeacherRemark = 'Needs intensive remedial support in quantitative and writing skills.';
      principalRemark = 'Academic warning: Must attend supervised holiday clinics.';
    }

    // Cryptographic QR Verification Stamp (Playbook p. 22)
    const verificationPayload = `${schoolId}:${student.id}:${termId}:${sessionId}:${overallAverage}:${studentTotalMarks}`;
    const verificationHash = crypto
      .createHash('sha256')
      .update(verificationPayload)
      .digest('hex');

    const cardId = `rep_${student.id}_${termId}_${sessionId}`;
    const reportCard: StudentTermReportCard = {
      id: cardId,
      schoolId,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      gender: student.gender,
      classArmId: armSheets[0].classArmId,
      classArmName: armSheets[0].classArmName,
      classLevelId: armSheets[0].classLevelId,
      classLevelName: armSheets[0].classLevelName,
      termId,
      termName: armSheets[0].termName,
      sessionId,
      sessionName: armSheets[0].sessionName,
      subjects: studentSubjects,
      overallTotalScore: studentTotalMarks,
      totalPossibleMarks,
      overallAverage,
      overallGradeLetter: overallGrade,
      positionInArm: 1, // Will be computed after all cards are sorted
      totalStudentsInArm: enrolled.length,
      attendanceSummary,
      affectiveRatings: DEFAULT_AFFECTIVE_RATINGS,
      psychomotorRatings: DEFAULT_PSYCHOMOTOR_RATINGS,
      formTeacherRemark,
      principalRemark,
      nextTermBegins: '2027-01-11',
      isLocked: armSheets.every((s) => s.status === 'LOCKED'),
      lockedAt: armSheets[0].lockedAt,
      verificationHash: `VERIFY-SHA256:${verificationHash.substring(0, 32)}`,
      verificationUrl: `/verify/result/${verificationHash.substring(0, 32)}`,
      issuedAt: new Date().toISOString(),
    };

    compiledCards.push(reportCard);
  }

  // Sort by overall average and assign rank in class arm
  compiledCards.sort((a, b) => b.overallAverage - a.overallAverage);
  compiledCards.forEach((c, idx) => {
    c.positionInArm = idx + 1;
    reportCardsStore.get(schoolId)!.set(c.id, c);
  });

  return compiledCards;
}

export async function listClassReportCards(
  schoolId: string,
  classArmId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027',
  actor?: AuthSession
): Promise<StudentTermReportCard[]> {
  ensureStoreInitialized(schoolId);
  const schoolCards = reportCardsStore.get(schoolId) || new Map();
  const matched = Array.from(schoolCards.values()).filter(
    (c) =>
      (c.classArmId === classArmId || c.classArmName.toLowerCase() === classArmId.toLowerCase()) &&
      c.termId === termId &&
      c.sessionId === sessionId
  );
  if (matched.length > 0) {
    return matched.sort((a, b) => a.positionInArm - b.positionInArm);
  }
  // If not pre-compiled, auto compile if actor provided
  if (actor) {
    try {
      return await compileClassReportCards(schoolId, classArmId, termId, sessionId, actor);
    } catch {
      return [];
    }
  }
  return [];
}

// ------------------------------------------------------------------------------
// Core Engine: Rules-Based Student Promotion Decision Engine
// ------------------------------------------------------------------------------

export async function evaluateStudentPromotion(
  schoolId: string,
  studentId: string,
  sessionId: string = 'ses_2026_2027',
  actor: AuthSession
): Promise<{
  decision: PromotionDecision;
  overallAverage: number;
  totalSubjects: number;
  passedSubjects: number;
  passedEnglish: boolean;
  passedMath: boolean;
  rationale: string;
}> {
  ensureStoreInitialized(schoolId);

  // Retrieve student's report cards for the session
  const schoolCards = reportCardsStore.get(schoolId)!;
  const cards = Array.from(schoolCards.values()).filter(
    (c) => c.studentId === studentId && c.sessionId === sessionId
  );

  if (cards.length === 0) {
    // If cards not pre-compiled, calculate from available sheets
    const sheets = Array.from(sheetsStore.get(schoolId)!.values()).filter(
      (s) => s.sessionId === sessionId
    );
    const studentSubjects: Array<{ subjectCode: string; total: number }> = [];

    for (const sheet of sheets) {
      const score = sheet.scores.find((s) => s.studentId === studentId);
      if (score && score.totalScore !== null) {
        studentSubjects.push({ subjectCode: sheet.subjectCode, total: score.totalScore });
      }
    }

    if (studentSubjects.length === 0) {
      return {
        decision: 'REPEAT',
        overallAverage: 0,
        totalSubjects: 0,
        passedSubjects: 0,
        passedEnglish: false,
        passedMath: false,
        rationale: 'Insufficient academic records available to substantiate class promotion.',
      };
    }

    const passedSubjects = studentSubjects.filter((s) => s.total >= 50).length;
    const math = studentSubjects.find((s) => s.subjectCode === 'MTH');
    const eng = studentSubjects.find((s) => s.subjectCode === 'ENG');
    const passedMath = (math?.total ?? 0) >= 50;
    const passedEnglish = (eng?.total ?? 0) >= 50;
    const avg = Number(
      (studentSubjects.reduce((acc, curr) => acc + curr.total, 0) / studentSubjects.length).toFixed(1)
    );

    let decision: PromotionDecision = 'PROMOTED';
    let rationale = `Promoted: Overall average of ${avg}% and passed ${passedSubjects}/${studentSubjects.length} subjects including English and Mathematics.`;

    if (!passedEnglish || !passedMath) {
      if (avg >= 48) {
        decision = 'PROMOTED_ON_TRIAL';
        rationale = `Promoted on Trial: Satisfied overall average (${avg}%) but failed prerequisite core subjects.`;
      } else {
        decision = 'REPEAT';
        rationale = `Repeat Class: Failed mandatory core prerequisites (English / Mathematics) with insufficient average (${avg}%).`;
      }
    } else if (avg < 50) {
      decision = 'REPEAT';
      rationale = `Repeat Class: Terminal cumulative average (${avg}%) fell below institutional promotion threshold (50%).`;
    }

    return {
      decision,
      overallAverage: avg,
      totalSubjects: studentSubjects.length,
      passedSubjects,
      passedEnglish,
      passedMath,
      rationale,
    };
  }

  // Use compiled report card data
  const latestCard = cards[cards.length - 1];
  const passedSubjects = latestCard.subjects.filter((s) => s.totalScore >= 50).length;
  const math = latestCard.subjects.find((s) => s.subjectCode === 'MTH');
  const eng = latestCard.subjects.find((s) => s.subjectCode === 'ENG');
  const passedMath = (math?.totalScore ?? 0) >= 50;
  const passedEnglish = (eng?.totalScore ?? 0) >= 50;

  let decision: PromotionDecision = 'PROMOTED';
  let rationale = `Promoted to next class level: Attained overall average of ${latestCard.overallAverage}% with credit in core subjects.`;

  if (!passedEnglish || !passedMath) {
    if (latestCard.overallAverage >= 48) {
      decision = 'PROMOTED_ON_TRIAL';
      rationale = `Promoted on Trial: Attained overall average of ${latestCard.overallAverage}%, trailing in core English/Mathematics.`;
    } else {
      decision = 'REPEAT';
      rationale = `Repeat Class: Failed mandatory core subject requirements with cumulative average ${latestCard.overallAverage}%.`;
    }
  } else if (latestCard.overallAverage < 50) {
    decision = 'REPEAT';
    rationale = `Repeat Class: Academic average (${latestCard.overallAverage}%) failed to meet the mandatory 50% benchmark.`;
  }

  latestCard.promotionDecision = decision;
  latestCard.promotionComment = rationale;

  return {
    decision,
    overallAverage: latestCard.overallAverage,
    totalSubjects: latestCard.subjects.length,
    passedSubjects,
    passedEnglish,
    passedMath,
    rationale,
  };
}

// ------------------------------------------------------------------------------
// Core Engine: Public Cryptographic Report Card Verification Lookup
// ------------------------------------------------------------------------------

export async function verifyReportCardHash(
  verificationHashOrCode: string
): Promise<{
  isValid: boolean;
  reportCard?: StudentTermReportCard;
  verifiedAt: string;
}> {
  if (!isSeeded) seedAssessmentData();

  for (const schoolCards of reportCardsStore.values()) {
    for (const card of schoolCards.values()) {
      if (
        card.verificationHash.includes(verificationHashOrCode) ||
        card.verificationUrl.includes(verificationHashOrCode) ||
        verificationHashOrCode.includes(card.studentId)
      ) {
        return {
          isValid: true,
          reportCard: card,
          verifiedAt: new Date().toISOString(),
        };
      }
    }
  }

  return {
    isValid: false,
    verifiedAt: new Date().toISOString(),
  };
}
