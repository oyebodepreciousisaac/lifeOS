import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getClassSubjectScoreSheet,
  saveSubjectScores,
  submitScoresForModeration,
  moderateSubjectScores,
  approveAndCryptographicallyLockScores,
  requestLockedScoreCorrection,
  executeLockedScoreCorrection,
  compileClassReportCards,
  evaluateStudentPromotion,
  verifyReportCardHash,
  calculateGrade,
  resetAssessmentStore,
} from '../apps/web/src/lib/assessment/assessment-store';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import { inMemoryAuditStore } from '../apps/web/src/lib/audit/logger';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const mockTeacherA: AuthSession = {
  userId: 'usr_teacher_obi',
  schoolId: TENANT_A_ID,
  email: 'emeka.obi@kingscollegelagos.sch.ng',
  firstName: 'Emeka',
  lastName: 'Obi',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const mockPrincipalA: AuthSession = {
  userId: 'usr_002',
  schoolId: TENANT_A_ID,
  email: 'principal@kingscollegelagos.sch.ng',
  firstName: 'Dr. Elizabeth',
  lastName: 'Alabi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const mockTeacherB: AuthSession = {
  userId: 'usr_teacher_b',
  schoolId: TENANT_B_ID,
  email: 'teacher@premierabuja.ng',
  firstName: 'Ibrahim',
  lastName: 'Gwandu',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const mockParentA: AuthSession = {
  userId: 'usr_parent_alakija',
  schoolId: TENANT_A_ID,
  email: 'falakija@famfa.com',
  firstName: 'Folashade',
  lastName: 'Alakija',
  userType: 'PARENT',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

test('--- Running Phase 8 Assessments, Result Moderation, Cryptographic Locking & Report Cards Suite ---', async (t) => {
  resetAssessmentStore();

  await t.test('Phase 8.1: Continuous Assessment (CA) & Exam Score Entry with Boundary Guards', async () => {
    // 1. Fetch draft score sheet for Basic Science (sub_bsc) in JSS 1 Gold
    const draftSheet = await getClassSubjectScoreSheet(
      TENANT_A_ID,
      'arm_9_1',
      'sub_bsc',
      't1',
      'ses_2026_2027',
      mockTeacherA
    );

    assert.ok(draftSheet);
    assert.strictEqual(draftSheet.status, 'DRAFT');
    assert.strictEqual(draftSheet.subjectCode, 'BSC');
    assert.ok(draftSheet.scores.length >= 3, 'Must pre-populate all enrolled students in class arm');

    // 2. Submit valid score entries with mixed scores
    const savedSheet = await saveSubjectScores(
      TENANT_A_ID,
      {
        classArmId: 'arm_9_1',
        subjectId: 'sub_bsc',
        termId: 't1',
        sessionId: 'ses_2026_2027',
        scores: [
          {
            studentId: 'stu_kcl_001',
            studentName: 'Chidubem Emmanuel Adeleke',
            admissionNumber: 'KCL/2026/001',
            ca1Score: 19,
            ca2Score: 18,
            examScore: 55,
            teacherComment: 'Outstanding understanding of scientific concepts.',
          },
          {
            studentId: 'stu_kcl_002',
            studentName: 'Amina Fatima Bello',
            admissionNumber: 'KCL/2026/002',
            ca1Score: 16,
            ca2Score: 15,
            examScore: 47,
            teacherComment: 'Strong analytical skills in laboratory practicals.',
          },
          {
            studentId: 'stu_kcl_003',
            studentName: 'Tunde Olumide Bakare',
            admissionNumber: 'KCL/2026/003',
            ca1Score: 12,
            ca2Score: 13,
            examScore: 36,
            teacherComment: 'Satisfactory effort; needs revision in chemical bonding.',
          },
        ],
      },
      mockTeacherA
    );

    // Verify auto-computation of totals, grades, points, and class rankings
    assert.strictEqual(savedSheet.scores[0].totalScore, 92); // 19 + 18 + 55
    assert.strictEqual(savedSheet.scores[0].gradeLetter, 'A');
    assert.strictEqual(savedSheet.scores[0].gradePoint, 5.0);
    assert.strictEqual(savedSheet.scores[0].positionInArm, 1);

    assert.strictEqual(savedSheet.scores[1].totalScore, 78); // 16 + 15 + 47
    assert.strictEqual(savedSheet.scores[1].gradeLetter, 'A');
    assert.strictEqual(savedSheet.scores[1].positionInArm, 2);

    assert.strictEqual(savedSheet.scores[2].totalScore, 61); // 12 + 13 + 36
    assert.strictEqual(savedSheet.scores[2].gradeLetter, 'C');
    assert.strictEqual(savedSheet.scores[2].positionInArm, 3);

    // Verify aggregate statistics
    assert.strictEqual(savedSheet.stats.classAverage, 77); // (92 + 78 + 61) / 3 = 77.0
    assert.strictEqual(savedSheet.stats.highestScore, 92);
    assert.strictEqual(savedSheet.stats.lowestScore, 61);
    assert.strictEqual(savedSheet.stats.passCount, 3);
    assert.strictEqual(savedSheet.stats.failCount, 0);

    // 3. Boundary Guard Test: Reject scores exceeding maximum allowed boundary
    await assert.rejects(
      async () => {
        await saveSubjectScores(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            subjectId: 'sub_bsc',
            termId: 't1',
            sessionId: 'ses_2026_2027',
            scores: [
              {
                studentId: 'stu_kcl_001',
                studentName: 'Chidubem Emmanuel Adeleke',
                admissionNumber: 'KCL/2026/001',
                ca1Score: 25, // Exceeds max 20!
                examScore: 50,
              },
            ],
          },
          mockTeacherA
        );
      },
      /(exceeds boundary|less than or equal to 20)/,
      'Boundary Guard must reject CA1 score greater than 20'
    );

    await assert.rejects(
      async () => {
        await saveSubjectScores(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            subjectId: 'sub_bsc',
            termId: 't1',
            sessionId: 'ses_2026_2027',
            scores: [
              {
                studentId: 'stu_kcl_001',
                studentName: 'Chidubem Emmanuel Adeleke',
                admissionNumber: 'KCL/2026/001',
                ca1Score: 15,
                examScore: 75, // Exceeds max 60!
              },
            ],
          },
          mockTeacherA
        );
      },
      /(exceeds boundary|less than or equal to 60)/,
      'Boundary Guard must reject Exam score greater than 60'
    );
  });

  await t.test('Phase 8.2: Missing Marks Detector Engine', async () => {
    // Create incomplete sheet with 1 missing student score
    const incompleteSheet = await saveSubjectScores(
      TENANT_A_ID,
      {
        classArmId: 'arm_9_1',
        subjectId: 'sub_agr',
        termId: 't1',
        sessionId: 'ses_2026_2027',
        scores: [
          {
            studentId: 'stu_kcl_001',
            studentName: 'Chidubem Emmanuel Adeleke',
            admissionNumber: 'KCL/2026/001',
            ca1Score: 18,
            examScore: 50,
          },
          {
            studentId: 'stu_kcl_002',
            studentName: 'Amina Fatima Bello',
            admissionNumber: 'KCL/2026/002',
            ca1Score: null,
            ca2Score: null,
            examScore: null, // MISSING MARKS!
          },
        ],
      },
      mockTeacherA
    );

    assert.ok(incompleteSheet.stats.missingCount > 0, 'Missing Marks Detector must count incomplete entries');

    // Attempting to submit sheet with missing marks must be blocked
    await assert.rejects(
      async () => {
        await submitScoresForModeration(TENANT_A_ID, incompleteSheet.id, mockTeacherA);
      },
      /Missing Marks Detector identified/,
      'Submission must be halted until missing marks are entered'
    );
  });

  await t.test('Phase 8.3: Multi-Stage Moderation Lifecycle (DRAFT -> SUBMITTED -> MODERATED)', async () => {
    // Complete the Basic Science sheet scores
    const sheet = await getClassSubjectScoreSheet(
      TENANT_A_ID,
      'arm_9_1',
      'sub_bsc',
      't1',
      'ses_2026_2027',
      mockTeacherA
    );

    // 1. Teacher submits completed scores
    const submitted = await submitScoresForModeration(TENANT_A_ID, sheet.id, mockTeacherA);
    assert.strictEqual(submitted.status, 'SUBMITTED');
    assert.ok(submitted.submittedAt);
    assert.strictEqual(submitted.submittedByName, 'Emeka Obi');

    // 2. Academic Lead / Principal moderates
    const moderated = await moderateSubjectScores(
      TENANT_A_ID,
      sheet.id,
      'Laboratory practical logbooks reviewed and exam marking guide approved.',
      mockPrincipalA
    );
    assert.strictEqual(moderated.status, 'MODERATED');
    assert.ok(moderated.moderatedAt);
    assert.strictEqual(moderated.moderatedByName, 'Dr. Elizabeth Alabi');
    assert.ok(moderated.moderationRemarks?.includes('Laboratory practical logbooks reviewed'));
  });

  await t.test('Phase 8.4: Cryptographic Result Locking & SHA-256 HMAC Sealing', async () => {
    const sheet = await getClassSubjectScoreSheet(
      TENANT_A_ID,
      'arm_9_1',
      'sub_bsc',
      't1',
      'ses_2026_2027',
      mockPrincipalA
    );

    // 1. Principal approves and cryptographically locks the results
    const locked = await approveAndCryptographicallyLockScores(TENANT_A_ID, sheet.id, mockPrincipalA);

    assert.strictEqual(locked.status, 'LOCKED');
    assert.ok(locked.lockedAt);
    assert.strictEqual(locked.lockedByName, 'Dr. Elizabeth Alabi');
    assert.ok(locked.lockedSealHash?.startsWith('SEAL-SHA256:'), 'Must generate cryptographic seal');

    // 2. Direct modification guard: Attempting to edit a locked sheet must be strictly blocked
    await assert.rejects(
      async () => {
        await saveSubjectScores(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            subjectId: 'sub_bsc',
            termId: 't1',
            sessionId: 'ses_2026_2027',
            scores: [
              {
                studentId: 'stu_kcl_001',
                studentName: 'Chidubem Emmanuel Adeleke',
                admissionNumber: 'KCL/2026/001',
                ca1Score: 20,
                examScore: 60,
              },
            ],
          },
          mockTeacherA
        );
      },
      /Cannot modify cryptographically locked results/,
      'Direct mutation of sealed results without Maker-Checker must be rejected'
    );
  });

  await t.test('Phase 8.5: Post-Lock Level 2 Maker-Checker Score Correction', async () => {
    const sheet = await getClassSubjectScoreSheet(
      TENANT_A_ID,
      'arm_9_1',
      'sub_bsc',
      't1',
      'ses_2026_2027',
      mockTeacherA
    );

    // 1. Teacher submits Level 2 Correction Request with detailed justification
    const request = await requestLockedScoreCorrection(
      TENANT_A_ID,
      {
        sheetId: sheet.id,
        studentId: 'stu_kcl_003',
        subjectId: 'sub_bsc',
        component: 'examScore',
        proposedScore: 45, // was 36
        justification: 'Script remarking authorized: Question 4B (9 marks) omitted during initial tally.',
      },
      mockTeacherA
    );

    assert.ok(request.id);
    assert.strictEqual(request.oldScore, 36);
    assert.strictEqual(request.proposedScore, 45);
    assert.strictEqual(request.status, 'PENDING_APPROVAL');

    // 2. Principal reviews and executes Level 2 correction
    const executed = await executeLockedScoreCorrection(
      TENANT_A_ID,
      request.id,
      'APPROVED',
      'Verified physical script and tally omission confirmed.',
      mockPrincipalA
    );

    assert.strictEqual(executed.status, 'EXECUTED');

    // 3. Verify locked sheet was updated and re-sealed with updated score
    const updatedSheet = await getClassSubjectScoreSheet(
      TENANT_A_ID,
      'arm_9_1',
      'sub_bsc',
      't1',
      'ses_2026_2027',
      mockPrincipalA
    );
    const updatedStudentScore = updatedSheet.scores.find((s) => s.studentId === 'stu_kcl_003');
    assert.strictEqual(updatedStudentScore?.examScore, 45);
    assert.strictEqual(updatedStudentScore?.totalScore, 70); // 12 + 13 + 45 = 70
    assert.strictEqual(updatedStudentScore?.gradeLetter, 'B'); // upgraded from C to B
    assert.ok(updatedSheet.lockedSealHash?.includes('MUTATED-L2'), 'Must preserve mutation stamp');
  });

  await t.test('Phase 8.6: Branded Report Card Compilation & QR Verification Engine', async () => {
    // Compile report cards for JSS 1 Gold
    const reportCards = await compileClassReportCards(
      TENANT_A_ID,
      'arm_9_1',
      't1',
      'ses_2026_2027',
      mockPrincipalA
    );

    assert.ok(reportCards.length >= 3, 'Must compile report cards for all enrolled students');

    const topStudentCard = reportCards[0];
    assert.strictEqual(topStudentCard.studentId, 'stu_kcl_001');
    assert.strictEqual(topStudentCard.positionInArm, 1);
    assert.ok(topStudentCard.overallAverage >= 85);
    assert.strictEqual(topStudentCard.overallGradeLetter, 'A');
    assert.ok(topStudentCard.subjects.length >= 2, 'Must include compiled Mathematics and English results');

    // Verify behavioral affective & psychomotor domains
    assert.strictEqual(topStudentCard.affectiveRatings.punctuality, 4);
    assert.strictEqual(topStudentCard.psychomotorRatings.verbalFluency, 4);

    // Verify attendance integration
    assert.ok(topStudentCard.attendanceSummary.totalSessions > 0);
    assert.ok(topStudentCard.attendanceSummary.attendanceRate > 0);

    // Verify digital cryptographic verification hash & lookup
    assert.ok(topStudentCard.verificationHash.startsWith('VERIFY-SHA256:'));
    assert.ok(topStudentCard.verificationUrl.startsWith('/verify/result/'));

    const verificationResult = await verifyReportCardHash(topStudentCard.verificationHash);
    assert.strictEqual(verificationResult.isValid, true);
    assert.strictEqual(verificationResult.reportCard?.studentName, topStudentCard.studentName);
  });

  await t.test('Phase 8.7: Rules-Based Student Promotion Decision Engine', async () => {
    // 1. Top student (passing all core subjects) -> PROMOTED
    const eval1 = await evaluateStudentPromotion(
      TENANT_A_ID,
      'stu_kcl_001',
      'ses_2026_2027',
      mockPrincipalA
    );
    assert.strictEqual(eval1.decision, 'PROMOTED');
    assert.strictEqual(eval1.passedEnglish, true);
    assert.strictEqual(eval1.passedMath, true);
    assert.ok(eval1.overallAverage >= 50);

    // 2. Student passing core subjects -> PROMOTED
    const eval2 = await evaluateStudentPromotion(
      TENANT_A_ID,
      'stu_kcl_002',
      'ses_2026_2027',
      mockPrincipalA
    );
    assert.strictEqual(eval2.decision, 'PROMOTED');
  });

  await t.test('Phase 8.8: Security — Multi-Tenant Isolation & Role-Based Access Control', async () => {
    // 1. Cross-Tenant Isolation: Tenant B teacher cannot read or modify Tenant A assessment sheet
    await assert.rejects(
      async () => {
        await getClassSubjectScoreSheet(
          TENANT_A_ID,
          'arm_9_1',
          'sub_mth',
          't1',
          'ses_2026_2027',
          mockTeacherB
        );
      },
      /403 Forbidden: Cross-tenant assessment access is strictly prohibited/,
      'Tenant B must be blocked from querying Tenant A assessment sheets'
    );

    await assert.rejects(
      async () => {
        await saveSubjectScores(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            subjectId: 'sub_mth',
            termId: 't1',
            sessionId: 'ses_2026_2027',
            scores: [],
          },
          mockTeacherB
        );
      },
      /403 Forbidden: Cross-tenant score entry is prohibited/,
      'Tenant B must be blocked from modifying Tenant A scores'
    );

    // 2. Role-Based Access Control: Parent cannot enter scores or lock results
    await assert.rejects(
      async () => {
        await saveSubjectScores(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            subjectId: 'sub_mth',
            termId: 't1',
            sessionId: 'ses_2026_2027',
            scores: [],
          },
          mockParentA
        );
      },
      /403 Forbidden: User role \[PARENT\] lacks authorization to enter assessment scores/,
      'Parent role must be rejected from modifying assessment scores'
    );

    await assert.rejects(
      async () => {
        await approveAndCryptographicallyLockScores(
          TENANT_A_ID,
          'sheet_jss1_gold_mth_t1',
          mockParentA
        );
      },
      /403 Forbidden: User role \[PARENT\] unauthorized to cryptographically lock academic results/,
      'Parent role must be rejected from locking academic results'
    );

    // 3. Immutable Audit Trails Verification
    const auditLogs = inMemoryAuditStore.filter((l) => l.schoolId === TENANT_A_ID);
    const scoreLogs = auditLogs.filter((l) => l.action === 'ASSESSMENT_SCORES_SAVED');
    const lockLogs = auditLogs.filter((l) => l.action === 'RESULTS_CRYPTOGRAPHICALLY_SEALED');
    const correctionLogs = auditLogs.filter((l) => l.action === 'SCORE_CORRECTION_EXECUTED');

    assert.ok(scoreLogs.length > 0, 'Audit log must record score entry events');
    assert.ok(lockLogs.length > 0, 'Audit log must record cryptographic result locking');
    assert.ok(correctionLogs.length > 0, 'Audit log must record post-lock score corrections');
  });
});
