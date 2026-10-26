import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import {
  createGovernanceRequest,
  reviewGovernanceRequest,
  getGovernanceRequests,
  getGovernanceMetrics,
  resetGovernanceStoreForTesting,
} from '../apps/web/src/lib/governance/governance-store';
import {
  getParentPortalData,
  getTeacherPortalData,
  getStudentPortalData,
} from '../apps/web/src/lib/portals/portal-service';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111'; // Apex Model College, Lagos
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222'; // Premier Academy, Abuja

const teacherSession: AuthSession = {
  userId: 'usr_teacher_01',
  schoolId: TENANT_A_ID,
  email: 'teacher@apexcollege.ng',
  firstName: 'Joseph',
  lastName: 'Okafor',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const bursarSession: AuthSession = {
  userId: 'usr_bursar_01',
  schoolId: TENANT_A_ID,
  email: 'bursar@apexcollege.ng',
  firstName: 'Babatunde',
  lastName: 'Lawal',
  userType: 'BURSAR',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const principalSession: AuthSession = {
  userId: 'usr_principal_01',
  schoolId: TENANT_A_ID,
  email: 'principal@apexcollege.ng',
  firstName: 'Elizabeth',
  lastName: 'Alabi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const parentSession: AuthSession = {
  userId: 'usr_parent_01',
  schoolId: TENANT_A_ID,
  email: 'parent@apexcollege.ng',
  firstName: 'Ngozi',
  lastName: 'Adeleke',
  userType: 'PARENT',
  isPrivileged: false,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const studentSession: AuthSession = {
  userId: 'usr_student_01',
  schoolId: TENANT_A_ID,
  email: 'chidubem@student.apexcollege.ng',
  firstName: 'Chidubem',
  lastName: 'Adeleke',
  userType: 'STUDENT',
  isPrivileged: false,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const foreignTenantSession: AuthSession = {
  userId: 'usr_foreign_principal',
  schoolId: TENANT_B_ID,
  email: 'principal@premierabuja.ng',
  firstName: 'Ibrahim',
  lastName: 'Danjuma',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

describe('--- Running Milestone 5: Governance, Portals & Role Analytics Suite ---', () => {
  beforeEach(() => {
    resetGovernanceStoreForTesting();
  });

  test('Milestone 5.1: Maker-Checker Request Submission with Structured Diff & Audit Proof', async () => {
    const request = await createGovernanceRequest(TENANT_A_ID, teacherSession, {
      type: 'SCORE_ALTERATION',
      title: 'Chemistry CA1 Adjustment for Tunde Adeleke',
      description: 'Clerical error in paper transposition. Marked script verifies 19/20.',
      makerReason: 'Physical test paper inspected and confirmed by Science HOD.',
      targetEntityId: 'score_tunde_chem_01',
      targetEntityType: 'AssessmentScore',
      diff: [
        {
          fieldName: 'ca1Score',
          fieldLabel: 'CA1 Test Mark',
          oldValue: 11,
          newValue: 19,
        },
        {
          fieldName: 'totalScore',
          fieldLabel: 'Composite Total',
          oldValue: 61,
          newValue: 69,
        },
      ],
    });

    assert.ok(request.id.startsWith('gov_req_'));
    assert.equal(request.status, 'PENDING');
    assert.equal(request.makerId, teacherSession.userId);
    assert.equal(request.makerRole, 'TEACHER');
    assert.equal(request.diff.length, 2);
    assert.ok(request.auditProofHash, 'Must compute cryptographic audit proof hash');
    assert.equal(request.auditProofHash.length, 64, 'SHA-256 HMAC must be 64 characters');
  });

  test('Milestone 5.2: Strict Separation of Duties (Maker Cannot Approve Own Request)', async () => {
    const request = await createGovernanceRequest(TENANT_A_ID, bursarSession, {
      type: 'FEE_REVERSAL',
      title: 'Reversal of Duplicate POS Debit — ₦35,000',
      description: 'Parent card debited twice during entrance examination sale.',
      makerReason: 'Bank merchant charge slip confirmation attached.',
      targetEntityId: 'tx_pay_pos_9941',
      targetEntityType: 'FinancialLedgerTransaction',
      diff: [
        {
          fieldName: 'settledAmount',
          fieldLabel: 'Fee Credited',
          oldValue: 70000,
          newValue: 35000,
        },
      ],
    });

    // Bursar who created the request attempts to approve it themselves!
    await assert.rejects(
      async () => {
        await reviewGovernanceRequest(TENANT_A_ID, bursarSession, {
          requestId: request.id,
          action: 'APPROVED',
          reviewNotes: 'Self-authorizing reversal.',
        });
      },
      (err: Error) => {
        assert.match(err.message, /Separation of Duties Violation/);
        return true;
      }
    );
  });

  test('Milestone 5.3: Role Authorization Protection for Dual-Control Sign-off', async () => {
    const request = await createGovernanceRequest(TENANT_A_ID, teacherSession, {
      type: 'STUDENT_TRANSFER',
      title: 'Class Arm Transfer: Chioma Okeke (JSS1 Gold -> JSS1 Diamond)',
      description: 'Class size rebalancing.',
      makerReason: 'Counselor recommendation.',
      targetEntityId: 'std_chioma_01',
      targetEntityType: 'StudentProfile',
      diff: [
        {
          fieldName: 'classArm',
          fieldLabel: 'Assigned Arm',
          oldValue: 'JSS1 Gold',
          newValue: 'JSS1 Diamond',
        },
      ],
    });

    // Another teacher (non-privileged) attempts to approve!
    const anotherTeacherSession: AuthSession = {
      ...teacherSession,
      userId: 'usr_teacher_02',
      email: 'teacher2@apexcollege.ng',
    };

    await assert.rejects(
      async () => {
        await reviewGovernanceRequest(TENANT_A_ID, anotherTeacherSession, {
          requestId: request.id,
          action: 'APPROVED',
          reviewNotes: 'Approved as fellow teacher.',
        });
      },
      (err: Error) => {
        assert.match(err.message, /Unauthorized Governance Reviewer/);
        return true;
      }
    );
  });

  test('Milestone 5.4: Successful Dual-Control Approval & Rejection Lifecycles', async () => {
    // 1. Create request by teacher
    const req1 = await createGovernanceRequest(TENANT_A_ID, teacherSession, {
      type: 'SCORE_ALTERATION',
      title: 'Physics Exam Correction for Babatunde Davies',
      description: 'Section B question 4 mark added to total.',
      makerReason: 'Marking scheme key revised.',
      targetEntityId: 'score_phys_davies',
      targetEntityType: 'AssessmentScore',
      diff: [
        {
          fieldName: 'examScore',
          fieldLabel: 'Exam Mark',
          oldValue: 48,
          newValue: 54,
        },
      ],
    });

    // 2. Principal approves
    const approved = await reviewGovernanceRequest(TENANT_A_ID, principalSession, {
      requestId: req1.id,
      action: 'APPROVED',
      reviewNotes: 'Physics script verified. Endorsement signed.',
    });

    assert.equal(approved.status, 'APPROVED');
    assert.equal(approved.checkerId, principalSession.userId);
    assert.equal(approved.checkerRole, 'PRINCIPAL');
    assert.ok(approved.reviewedAt);

    // 3. Create second request and reject
    const req2 = await createGovernanceRequest(TENANT_A_ID, teacherSession, {
      type: 'SCORE_ALTERATION',
      title: 'Unsubstantiated Score Boost',
      description: 'Parent requested grade boost without script evidence.',
      makerReason: 'Parent petition.',
      targetEntityId: 'score_unsubstantiated',
      targetEntityType: 'AssessmentScore',
      diff: [
        {
          fieldName: 'totalScore',
          fieldLabel: 'Total Mark',
          oldValue: 45,
          newValue: 70,
        },
      ],
    });

    const rejected = await reviewGovernanceRequest(TENANT_A_ID, principalSession, {
      requestId: req2.id,
      action: 'REJECTED',
      reviewNotes: 'Petition rejected. Zero physical script evidence provided.',
    });

    assert.equal(rejected.status, 'REJECTED');
    assert.equal(rejected.checkerId, principalSession.userId);
    assert.match(rejected.reviewNotes!, /Zero physical script evidence/);
  });

  test('Milestone 5.5: Parent Portal Multi-Child Switching, Invoices & Report Cards', async () => {
    const portalData = await getParentPortalData(TENANT_A_ID, parentSession);

    assert.ok(portalData.children.length >= 2, 'Guardian must have access to multiple wards');
    assert.equal(portalData.activeChild.studentId, 'stu_kcl_001');
    assert.equal(portalData.activeChild.fullName, 'Chidubem Emmanuel Adeleke');
    assert.equal(portalData.activeChild.classArm, 'JSS 1 Gold');
    assert.ok(portalData.activeChild.attendanceRate > 90, 'Attendance rate must be calculated');

    // Switch child to second child
    const switchedData = await getParentPortalData(TENANT_A_ID, parentSession, 'stu_kcl_003');
    assert.equal(switchedData.activeChild.studentId, 'stu_kcl_003');
    assert.equal(switchedData.activeChild.fullName, 'Folake Joy Adeleke');
    assert.equal(switchedData.activeChild.classArm, 'SSS 2 Diamond');

    // Verify report card and cryptographic seal
    assert.ok(switchedData.reportCard);
    assert.ok(switchedData.reportCard.cognitiveScores.length >= 4);
    assert.ok(switchedData.reportCard.verificationHash.startsWith('VERIFY-SHA256:'));

    // Verify fee invoice breakdown
    assert.ok(switchedData.invoices.length >= 1);
    assert.ok(switchedData.invoices[0].lineItems.length >= 3);
  });

  test('Milestone 5.6: Teacher Portal Schedule, Roll Call & Scorebook Lifecycle', async () => {
    const teacherData = await getTeacherPortalData(TENANT_A_ID, teacherSession);

    assert.equal(teacherData.teacher.id, teacherSession.userId);
    assert.equal(teacherData.todaySummary.totalPeriodsToday, 4);
    assert.equal(teacherData.assignedClasses.length, 3);
    assert.ok(teacherData.scheduleToday.some((p) => p.subjectName === 'Mathematics'));
    assert.ok(teacherData.scheduleToday.some((p) => p.status === 'CURRENT' || p.status === 'COMPLETED'));
    assert.ok(teacherData.pendingTasks.length >= 1, 'Urgent task alerts must be surfaced');
  });

  test('Milestone 5.7: Student Portal Personal Timetable, Assessment Grades & Notices', async () => {
    const studentData = await getStudentPortalData(TENANT_A_ID, studentSession);

    assert.equal(studentData.student.fullName, 'Chidubem Adeleke');
    assert.equal(studentData.student.classArm, 'JSS 1 Gold');
    assert.ok(studentData.timetableToday.length >= 3);
    assert.ok(studentData.termGrades.length >= 4);
    assert.ok(studentData.notices.length >= 2);
  });

  test('Milestone 5.8: Security — Multi-Tenant Isolation on Governance & Portals', async () => {
    // Tenant B principal cannot view Tenant A governance requests
    await assert.rejects(
      async () => {
        await getGovernanceRequests(TENANT_A_ID, foreignTenantSession);
      },
      (err: Error) => {
        assert.match(err.message, /Tenant Isolation Violation/);
        return true;
      }
    );

    // Tenant B parent cannot query Tenant A parent portal
    const foreignParent: AuthSession = {
      ...parentSession,
      schoolId: TENANT_B_ID,
      email: 'parent@premierabuja.ng',
    };

    await assert.rejects(
      async () => {
        await getParentPortalData(TENANT_A_ID, foreignParent);
      },
      (err: Error) => {
        assert.match(err.message, /Tenant Isolation Violation/);
        return true;
      }
    );

    // Governance metrics calculation for Tenant A
    const metrics = await getGovernanceMetrics(TENANT_A_ID, principalSession);
    assert.ok(metrics.totalRequests >= 1);
    assert.ok(metrics.pendingCount >= 0);
  });
});
