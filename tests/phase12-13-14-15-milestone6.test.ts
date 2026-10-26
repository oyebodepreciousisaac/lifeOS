import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// ------------------------------------------------------------------------------
// Store Imports for Milestone 6
// ------------------------------------------------------------------------------
import {
  logClinicVisit,
  listClinicVisits,
  createTransportRoute,
  assignStudentToBusRoute,
  listTransportRoutes,
  requestExeatPass,
  reviewExeatPass,
  listExeatPasses,
  borrowBook,
  returnBook,
  listLibraryBooks,
  listBookLoans,
  createFixedAsset,
  listFixedAssets,
  reportMaintenanceTicket,
  resolveMaintenanceTicket,
  createPtaProject,
  listPtaProjects,
  recordPtaContribution,
  listPtaContributions,
  getAuxiliaryMetrics,
  resetAuxiliaryStoreForTesting,
} from '../apps/web/src/lib/auxiliary/auxiliary-store';

import {
  createCourseModule,
  listCourseModules,
  createLesson,
  markLessonComplete,
  createQuiz,
  listQuizzes,
  submitQuizAttempt,
  listQuizAttempts,
  createAssignment,
  listAssignments,
  submitAssignment,
  gradeAssignment,
  listAssignmentSubmissions,
  scheduleVirtualClass,
  listVirtualClasses,
  recordVirtualClassAttendance,
  getStudentLmsAnalytics,
  resetLmsStoreForTesting,
} from '../apps/web/src/lib/lms/lms-store';

import {
  generateExamQuestions,
  generateLessonPlan,
  generateParentProgressSummary,
  analyzeDebtorNarrative,
  generatePrincipalExecutiveBrief,
  reviewAiDraft,
  commitAiDraft,
  listAiDrafts,
  resetAiStoreForTesting,
} from '../apps/web/src/lib/ai/ai-store';

import {
  executeBackupRestoreDrill,
  listSnapshots,
  listBackupDrillReports,
  registerGuardianConsent,
  listGuardianConsents,
  exportStudentDataPortabilityPackage,
  anonymizeStudentForErasure,
  listPlatformTenants,
  getPlatformHealthMetrics,
  resetPlatformSecurityStoreForTesting,
} from '../apps/web/src/lib/platform-security/platform-security-store';

import { AuthSession } from '../apps/web/src/lib/auth/rbac';

// ------------------------------------------------------------------------------
// Mock Auth Sessions
// ------------------------------------------------------------------------------
const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const principalSessionA: AuthSession = {
  userId: 'usr_prin_001',
  schoolId: TENANT_A_ID,
  userType: 'PRINCIPAL',
  firstName: 'Chukwudi',
  lastName: 'Okoye',
  email: 'principal@kingscollegelagos.sch.ng',
  roles: ['PRINCIPAL'],
  permissions: ['*'],
  mfaEnabled: true,
};

const teacherSessionA: AuthSession = {
  userId: 'usr_teach_001',
  schoolId: TENANT_A_ID,
  userType: 'TEACHER',
  firstName: 'Babatunde',
  lastName: 'Raji',
  email: 'b.raji@kingscollegelagos.sch.ng',
  roles: ['TEACHER'],
  permissions: ['academics:read', 'academics:write'],
  mfaEnabled: false,
};

const nurseSessionA: AuthSession = {
  userId: 'usr_nurse_001',
  schoolId: TENANT_A_ID,
  userType: 'STAFF',
  firstName: 'Veronica',
  lastName: 'Ajayi',
  email: 'clinic@kingscollegelagos.sch.ng',
  roles: ['STAFF'],
  permissions: ['clinic:manage'],
  mfaEnabled: false,
};

const bursarSessionA: AuthSession = {
  userId: 'usr_bursar_001',
  schoolId: TENANT_A_ID,
  userType: 'BURSAR',
  firstName: 'Ibrahim',
  lastName: 'Danjuma',
  email: 'bursar@kingscollegelagos.sch.ng',
  roles: ['BURSAR'],
  permissions: ['finance:read', 'finance:write'],
  mfaEnabled: true,
};

const principalSessionB: AuthSession = {
  userId: 'usr_prin_002',
  schoolId: TENANT_B_ID,
  userType: 'PRINCIPAL',
  firstName: 'Grace',
  lastName: 'Eze',
  email: 'principal@queenscollegeyaba.sch.ng',
  roles: ['PRINCIPAL'],
  permissions: ['*'],
  mfaEnabled: true,
};

describe('--- Running Milestone 6: Auxiliary Operations, LMS, Assistive AI & Security Hardening Suite ---', () => {
  beforeEach(() => {
    resetAuxiliaryStoreForTesting();
    resetLmsStoreForTesting();
    resetAiStoreForTesting();
    resetPlatformSecurityStoreForTesting();
  });

  // ============================================================================
  // Phase 12: Auxiliary School Operations (Module 11)
  // ============================================================================
  it('Milestone 6.1: Clinic Visit Logging, Triage & Emergency Parent Alerts', async () => {
    // 1. Log mild clinic visit
    const mildVisit = await logClinicVisit(TENANT_A_ID, nurseSessionA, {
      studentId: 'stu_kcl_002',
      studentName: 'Zainab Danjuma',
      classArm: 'JSS 1 Gold',
      symptoms: 'Mild stomach cramp after breakfast.',
      diagnosis: 'Indigestion',
      treatment: 'Antacid suspension and 30 mins rest in sick bay.',
      temperatureCelsius: 36.8,
      triageSeverity: 'MILD',
      notifyParent: false,
      admitToSickBay: true,
    });
    assert.strictEqual(mildVisit.studentName, 'Zainab Danjuma');
    assert.strictEqual(mildVisit.triageSeverity, 'MILD');
    assert.strictEqual(mildVisit.admittedToSickBay, true);

    // 2. Log critical clinic visit (asthma attack)
    const criticalVisit = await logClinicVisit(TENANT_A_ID, nurseSessionA, {
      studentId: 'stu_kcl_003',
      studentName: 'Emeka Nwosu',
      classArm: 'JSS 1 Diamond',
      symptoms: 'Acute wheezing and shortness of breath following cross-country running.',
      diagnosis: 'Acute Asthmatic Episode',
      treatment: 'Administered 2 puffs Salbutamol inhaler via spacer; oxygen mask 2L/min.',
      temperatureCelsius: 37.4,
      triageSeverity: 'CRITICAL',
      notifyParent: true,
      admitToSickBay: true,
    });
    assert.strictEqual(criticalVisit.triageSeverity, 'CRITICAL');
    assert.strictEqual(criticalVisit.parentNotified, true);
    assert.strictEqual(criticalVisit.parentNotificationChannel, 'SMS');

    const visits = await listClinicVisits(TENANT_A_ID, principalSessionA);
    assert.ok(visits.length >= 3);
  });

  it('Milestone 6.2: Transport Bus Fleet Routes, Stops & Passenger Manifests', async () => {
    // 1. Create a new transport route
    const route = await createTransportRoute(TENANT_A_ID, principalSessionA, {
      routeName: 'Victoria Island - Oniru Express Route C',
      zone: 'Zone 3 (Victoria Island)',
      vehiclePlateNumber: 'APP-102-YY (Toyota Coaster 30-seater)',
      vehicleCapacity: 30,
      driverName: 'Mr. Kenneth Obi',
      driverPhone: '+234 802 999 4321',
      stops: ['Oniru Market', 'Four Points Sheraton', 'Ozumba Mbadiwe', 'School Gate'],
      termFee: 70000,
    });
    assert.strictEqual(route.routeName, 'Victoria Island - Oniru Express Route C');
    assert.strictEqual(route.vehicleCapacity, 30);

    // 2. Assign student to bus route
    const updatedRoute = await assignStudentToBusRoute(
      TENANT_A_ID,
      principalSessionA,
      route.id,
      'stu_kcl_005'
    );
    assert.ok(updatedRoute.assignedStudentIds.includes('stu_kcl_005'));

    // 3. Reject duplicate assignment to same route
    await assert.rejects(
      async () => {
        await assignStudentToBusRoute(TENANT_A_ID, principalSessionA, route.id, 'stu_kcl_005');
      },
      { message: /Student is already assigned to this transport route/ }
    );
  });

  it('Milestone 6.3: Hostel Bed Allocations, Digital Exeats & Gate Passes', async () => {
    // 1. Request an exeat pass for weekend
    const exeat = await requestExeatPass(TENANT_A_ID, teacherSessionA, {
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      hostelRoom: 'Nelson Mandela Hall - Room 101',
      type: 'WEEKEND',
      reason: 'Attending elder sister graduation ceremony in Abeokuta.',
      destinationAddress: '15 Quarry Road, Abeokuta, Ogun State',
      guardianContact: '+234 803 456 7890',
      departureDate: '2026-10-23T15:00:00Z',
      expectedReturnDate: '2026-10-25T18:00:00Z',
    });
    assert.strictEqual(exeat.status, 'PENDING');
    assert.ok(exeat.gatePassBarcode.startsWith('EXP-'));

    // 2. Review and approve exeat pass with gate pass barcode
    const approvedExeat = await reviewExeatPass(
      TENANT_A_ID,
      principalSessionA,
      exeat.id,
      'APPROVED',
      'Confirmed with guardian over telephone.'
    );
    assert.strictEqual(approvedExeat.status, 'APPROVED');
    assert.ok(approvedExeat.approvedBy);

    // 3. Security gate check-out
    const checkedOut = await reviewExeatPass(
      TENANT_A_ID,
      principalSessionA,
      exeat.id,
      'CHECKED_OUT',
      'Student departed campus accompanied by verified driver.'
    );
    assert.strictEqual(checkedOut.status, 'CHECKED_OUT');
  });

  it('Milestone 6.4: Library Book Cataloging, Circulation & Overdue Fine Billing', async () => {
    const books = await listLibraryBooks(TENANT_A_ID, teacherSessionA);
    const targetBook = books[0];
    const initialCopies = targetBook.copiesAvailable;

    // 1. Borrow book
    const loan = await borrowBook(TENANT_A_ID, teacherSessionA, {
      bookId: targetBook.id,
      borrowerId: 'stu_kcl_002',
      borrowerName: 'Zainab Danjuma',
      borrowerRole: 'STUDENT',
      durationDays: 14,
    });
    assert.strictEqual(loan.status, 'ACTIVE');
    assert.strictEqual(loan.bookTitle, targetBook.title);
    assert.strictEqual(targetBook.copiesAvailable, initialCopies - 1);

    // 2. Return book
    const returned = await returnBook(TENANT_A_ID, teacherSessionA, loan.id);
    assert.strictEqual(returned.status, 'RETURNED');
    assert.strictEqual(targetBook.copiesAvailable, initialCopies);
    assert.strictEqual(returned.fineAmount, 0);
  });

  it('Milestone 6.5: Fixed Asset Registry, Maintenance Tickets & PTA Project Levies', async () => {
    // 1. Create fixed asset
    const asset = await createFixedAsset(TENANT_A_ID, principalSessionA, {
      assetCode: 'LAB-MIC-08',
      name: 'Olympus Binocular Biological Microscope (Set of 8)',
      category: 'LAB_EQUIPMENT',
      location: 'Advanced Biology Laboratory',
      condition: 'GOOD',
      purchaseDate: '2025-04-10',
      purchaseCost: 3200000,
      custodian: 'Mr. Jude Okafor (Head of Sciences)',
    });
    assert.strictEqual(asset.assetCode, 'LAB-MIC-08');

    // 2. Report maintenance ticket with EMERGENCY priority
    const ticket = await reportMaintenanceTicket(TENANT_A_ID, teacherSessionA, {
      assetId: asset.id,
      issueDescription: 'Fine adjustment knob slipping and objective lens 40x calibration loose.',
      priority: 'HIGH',
      estimatedCost: 45000,
    });
    assert.strictEqual(ticket.status, 'OPEN');
    assert.strictEqual(asset.condition, 'NEEDS_REPAIR');

    // 3. Resolve maintenance ticket
    const resolvedTicket = await resolveMaintenanceTicket(
      TENANT_A_ID,
      principalSessionA,
      asset.id,
      ticket.id,
      42000,
      'Optical gears recalibrated and tested with biological slides.'
    );
    assert.strictEqual(resolvedTicket.status, 'COMPLETED');
    assert.strictEqual(asset.condition, 'GOOD');

    // 4. Create PTA project
    const ptaProj = await createPtaProject(TENANT_A_ID, principalSessionA, {
      title: 'Multipurpose Sports Pavilion & AstroTurf Pitch',
      session: '2026/2027',
      targetAmount: 8000000,
      levyPerStudent: 30000,
      description: 'PTA-funded modernization of school athletics field and installation of spectator pavilion.',
      committeeChairman: 'Engr. Dapo Balogun',
    });
    assert.strictEqual(ptaProj.status, 'ACTIVE');

    // 5. Record PTA contribution
    const contrib = await recordPtaContribution(TENANT_A_ID, bursarSessionA, {
      projectId: ptaProj.id,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      amount: 30000,
      paymentMethod: 'PAYSTACK',
    });
    assert.strictEqual(contrib.amount, 30000);
    assert.ok(contrib.receiptReference.startsWith('PTA-REC-'));
    assert.strictEqual(ptaProj.raisedAmount, 30000);

    // 6. Check auxiliary aggregate metrics
    const metrics = await getAuxiliaryMetrics(TENANT_A_ID, principalSessionA);
    assert.ok(metrics.totalFixedAssetsCount >= 3);
    assert.ok(metrics.activePtaProjectsCount >= 2);
  });

  // ============================================================================
  // Phase 13: Lightweight LMS & Virtual Classroom (Module 12)
  // ============================================================================
  it('Milestone 6.6: Course Modules, Rich Lessons & Completion Progress Tracking', async () => {
    // 1. Create a course module
    const module = await createCourseModule(TENANT_A_ID, teacherSessionA, {
      subjectName: 'Basic Science & Tech',
      classArm: 'JSS 1 Gold',
      title: 'Matter and Chemical Energy Foundations',
      orderIndex: 2,
      description: 'Understanding physical states of matter, kinetic theory, and energy transformations.',
      isPublished: true,
    });
    assert.strictEqual(module.title, 'Matter and Chemical Energy Foundations');

    // 2. Create rich lesson with video and PDF worksheets
    const lesson = await createLesson(TENANT_A_ID, teacherSessionA, {
      moduleId: module.id,
      title: 'Kinetic Particle Theory of Solids, Liquids and Gases',
      orderIndex: 1,
      contentMarkdown: '# Kinetic Particle Theory\nMatter is composed of tiny moving particles whose kinetic energy depends on temperature.',
      videoUrl: 'https://cdn.schoolos.ng/science/kinetic-theory.mp4',
      resourcePdfUrl: 'https://cdn.schoolos.ng/science/kinetic-worksheet.pdf',
      estimatedDurationMinutes: 50,
      isPublished: true,
    });
    assert.strictEqual(lesson.title, 'Kinetic Particle Theory of Solids, Liquids and Gases');
    assert.strictEqual(module.lessons.length, 1);

    // 3. Mark lesson complete for student
    const completion = await markLessonComplete(TENANT_A_ID, teacherSessionA, 'stu_kcl_001', lesson.id);
    assert.strictEqual(completion.success, true);
  });

  it('Milestone 6.7: Online Quizzes with Automated Objective Scoring Engine', async () => {
    const modules = await listCourseModules(TENANT_A_ID, teacherSessionA);
    const mathMod = modules[0];

    // 1. Create quiz
    const quiz = await createQuiz(TENANT_A_ID, teacherSessionA, {
      moduleId: mathMod.id,
      title: 'Linear Equations Quick Diagnostic',
      instructions: 'Solve the 2 linear equation problems. Passing score is 50%.',
      timeLimitMinutes: 10,
      passingScorePercent: 50,
      questions: [
        {
          prompt: 'Solve: 2x + 6 = 18. What is x?',
          questionType: 'MULTIPLE_CHOICE',
          options: ['4', '6', '8', '12'],
          correctOptionIndex: 1, // 6
          points: 10,
          explanation: '2x = 12 => x = 6',
        },
        {
          prompt: 'True or False: In the equation 5a - 3 = 12, the variable is a.',
          questionType: 'TRUE_FALSE',
          options: ['True', 'False'],
          correctOptionIndex: 0, // True
          points: 10,
          explanation: 'a is the unknown variable symbol.',
        },
      ],
      isPublished: true,
    });
    assert.strictEqual(quiz.questions.length, 2);

    // 2. Student submits passing attempt (both correct: 20/20 = 100%)
    const passAttempt = await submitQuizAttempt(TENANT_A_ID, teacherSessionA, {
      quizId: quiz.id,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      answers: [
        { questionId: quiz.questions[0].id, selectedOptionIndex: 1 },
        { questionId: quiz.questions[1].id, selectedOptionIndex: 0 },
      ],
      startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    });
    assert.strictEqual(passAttempt.scorePercent, 100);
    assert.strictEqual(passAttempt.passed, true);

    // 3. Student submits failing attempt (both wrong: 0/20 = 0%)
    const failAttempt = await submitQuizAttempt(TENANT_A_ID, teacherSessionA, {
      quizId: quiz.id,
      studentId: 'stu_kcl_002',
      studentName: 'Zainab Danjuma',
      classArm: 'JSS 1 Gold',
      answers: [
        { questionId: quiz.questions[0].id, selectedOptionIndex: 0 }, // wrong
        { questionId: quiz.questions[1].id, selectedOptionIndex: 1 }, // wrong
      ],
      startedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    });
    assert.strictEqual(failAttempt.scorePercent, 0);
    assert.strictEqual(failAttempt.passed, false);
  });

  it('Milestone 6.8: Assignment Homework Submissions & Teacher Rubric Feedback', async () => {
    const modules = await listCourseModules(TENANT_A_ID, teacherSessionA);
    const mathMod = modules[0];

    // 1. Create assignment
    const assignment = await createAssignment(TENANT_A_ID, teacherSessionA, {
      moduleId: mathMod.id,
      title: 'Word Problem Algebraic Translation Task',
      description: 'Translate 3 complex word scenarios into linear equations and find their values.',
      instructions: 'Show all working steps clearly.',
      rubricCriteria: [
        { criterion: 'Equation Translation', maxPoints: 50 },
        { criterion: 'Calculation Precision', maxPoints: 50 },
      ],
      maxScore: 100,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      isPublished: true,
    });
    assert.strictEqual(assignment.maxScore, 100);

    // 2. Student submits assignment
    const submission = await submitAssignment(TENANT_A_ID, teacherSessionA, {
      assignmentId: assignment.id,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      submissionText: 'Let the age of father be F and son be S. Equation 1: F = 3S. Equation 2: F + 5 = 2(S + 5) + 10. Solving gives S = 15, F = 45.',
      attachmentFileUrl: 'https://cdn.schoolos.ng/submissions/stu001_math_hw.pdf',
    });
    assert.strictEqual(submission.status, 'SUBMITTED');

    // 3. Teacher grades submission with rubric feedback
    const graded = await gradeAssignment(TENANT_A_ID, teacherSessionA, {
      submissionId: submission.id,
      scoreAwarded: 95,
      teacherFeedback: 'Outstanding mathematical reasoning and spotless step-by-step presentation! Keep it up.',
    });
    assert.strictEqual(graded.status, 'GRADED');
    assert.strictEqual(graded.scoreAwarded, 95);
    assert.ok(graded.gradedBy);
  });

  it('Milestone 6.9: Virtual Class Scheduling & Learning Analytics Aggregation', async () => {
    // 1. Schedule Zoom live class
    const session = await scheduleVirtualClass(TENANT_A_ID, teacherSessionA, {
      subjectName: 'Mathematics',
      classArm: 'JSS 1 Gold',
      title: 'Live Interactive Problem Solving & Exam Revision',
      provider: 'ZOOM',
      joinUrl: 'https://zoom.us/j/99283746152',
      meetingId: '992 8374 6152',
      passcode: 'REVISE26',
      scheduledStartTime: '2026-10-24T10:00:00Z',
      durationMinutes: 60,
    });
    assert.strictEqual(session.provider, 'ZOOM');

    // 2. Record attendance
    const attendedSession = await recordVirtualClassAttendance(
      TENANT_A_ID,
      teacherSessionA,
      session.id,
      'stu_kcl_001'
    );
    assert.ok(attendedSession.attendeeStudentIds.includes('stu_kcl_001'));

    // 3. Query student LMS analytics
    const analytics = await getStudentLmsAnalytics(
      TENANT_A_ID,
      teacherSessionA,
      'stu_kcl_001',
      'Chidubem Adeleke'
    );
    assert.strictEqual(analytics.studentName, 'Chidubem Adeleke');
    assert.ok(analytics.totalLessonsCount >= 2);
  });

  // ============================================================================
  // Phase 14: Justified Assistive AI & Smart Automation (Module 13)
  // ============================================================================
  it('Milestone 6.10: Teacher AI Curriculum Assistant (Questions & Lesson Plans)', async () => {
    // 1. Generate exam questions
    const qDraft = await generateExamQuestions(TENANT_A_ID, teacherSessionA, {
      subject: 'Basic Science',
      classLevel: 'JSS 1',
      topic: 'Renewable and Non-Renewable Energy Sources',
      difficulty: 'MEDIUM',
      questionCount: 4,
    });
    assert.strictEqual(qDraft.taskDomain, 'TEACHER_EXAM_QUESTIONS');
    assert.strictEqual(qDraft.status, 'DRAFT_PENDING_REVIEW'); // Strict ADR-05 Human Review Gate
    assert.strictEqual(qDraft.structuredPayload?.questions.length, 4);

    // 2. Generate lesson plan
    const lpDraft = await generateLessonPlan(TENANT_A_ID, teacherSessionA, {
      subject: 'English Language',
      classLevel: 'JSS 1',
      topic: 'Active and Passive Voice Constructions',
      durationMinutes: 45,
      specialFocus: 'Include cultural Nigerian narrative context examples.',
    });
    assert.strictEqual(lpDraft.taskDomain, 'TEACHER_LESSON_PLAN');
    assert.strictEqual(lpDraft.status, 'DRAFT_PENDING_REVIEW');
    assert.ok(lpDraft.generatedContent.includes('Active and Passive Voice'));
  });

  it('Milestone 6.11: Parent Progress Narrative Summarizer & Bursar Debtor Analyzer', async () => {
    // 1. Parent progress narrative summarizer
    const parentDraft = await generateParentProgressSummary(TENANT_A_ID, teacherSessionA, {
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      term: 'Term 1',
      grades: [
        { subject: 'Mathematics', score: 92, grade: 'A' },
        { subject: 'English Language', score: 84, grade: 'A' },
        { subject: 'Basic Science', score: 88, grade: 'A' },
        { subject: 'French', score: 55, grade: 'C' },
      ],
      attendancePercent: 96,
      conductNotes: 'Exemplary leadership in class group work and punctual in morning devotions.',
    });
    assert.strictEqual(parentDraft.taskDomain, 'PARENT_PROGRESS_SUMMARY');
    assert.strictEqual(parentDraft.status, 'DRAFT_PENDING_REVIEW');
    assert.ok(parentDraft.generatedContent.includes('Chidubem Adeleke'));
    assert.ok(parentDraft.generatedContent.includes('French')); // Identified growth area

    // 2. Bursar debtor narrative analyzer
    const bursarDraft = await analyzeDebtorNarrative(TENANT_A_ID, bursarSessionA, {
      studentId: 'stu_kcl_008',
      studentName: 'Segun Balogun',
      guardianName: 'Dr. Kehinde Balogun',
      guardianPhone: '+234 803 111 2233',
      outstandingAmount: 185000,
      agingTier: '61_90_DAYS',
      lastPaymentDate: '2026-08-15',
    });
    assert.strictEqual(bursarDraft.taskDomain, 'BURSAR_DEBTOR_ANALYSIS');
    assert.strictEqual(bursarDraft.status, 'DRAFT_PENDING_REVIEW');
    assert.ok(bursarDraft.generatedContent.includes('₦185,000'));

    // 3. Principal executive brief
    const execBrief = await generatePrincipalExecutiveBrief(TENANT_A_ID, principalSessionA, {
      attendanceRatePercent: 94.8,
      chronicAbsenteeCount: 3,
      latenessCountToday: 12,
      unmoderatedResultsCount: 4,
      feeCollectionPercent: 88.5,
    });
    assert.strictEqual(execBrief.taskDomain, 'PRINCIPAL_EXECUTIVE_BRIEF');
    assert.strictEqual(execBrief.status, 'DRAFT_PENDING_REVIEW');
  });

  it('Milestone 6.12: Strict ADR-05 Human Review Gate & Direct Unreviewed Commit Rejection', async () => {
    // 1. Generate draft
    const draft = await generateExamQuestions(TENANT_A_ID, teacherSessionA, {
      subject: 'Mathematics',
      classLevel: 'JSS 1',
      topic: 'Simple Interest',
      difficulty: 'EASY',
      questionCount: 2,
    });
    assert.strictEqual(draft.status, 'DRAFT_PENDING_REVIEW');

    // 2. Attempting to commit unreviewed draft MUST fail with strict ADR-05 violation error
    await assert.rejects(
      async () => {
        await commitAiDraft(TENANT_A_ID, teacherSessionA, draft.id);
      },
      {
        message: /Cannot commit AI draft: Draft must be explicitly APPROVED by an authorized human reviewer/,
      }
    );

    // 3. Human reviewer explicitly reviews, edits, and approves
    const reviewed = await reviewAiDraft(TENANT_A_ID, teacherSessionA, {
      draftId: draft.id,
      decision: 'APPROVE',
      reviewerNotes: 'Verified alignment with syllabus formulas (I = PRT / 100).',
      editedContent: draft.generatedContent + '\n*Verified Teacher Note: Ensure calculators are disabled.*',
    });
    assert.strictEqual(reviewed.status, 'APPROVED');
    assert.ok(reviewed.editedContent);

    // 4. Commit approved draft successfully
    const committed = await commitAiDraft(TENANT_A_ID, teacherSessionA, draft.id);
    assert.strictEqual(committed.success, true);
    assert.ok(committed.committedContent.includes('Ensure calculators are disabled'));
  });

  // ============================================================================
  // Phase 15: Security Hardening, Backup Drills & NDPA 2023 (Module 14, 15)
  // ============================================================================
  it('Milestone 6.13: Automated Disaster Recovery Restore Drills (RPO <= 15m, RTO <= 60m)', async () => {
    const snapshots = await listSnapshots(TENANT_A_ID, principalSessionA);
    assert.ok(snapshots.length >= 1);
    const liveSnapshot = snapshots[0];

    // Execute disaster recovery restore drill
    const drillReport = await executeBackupRestoreDrill(
      TENANT_A_ID,
      principalSessionA,
      liveSnapshot.id,
      'Quarterly Automated Disaster Recovery Verification Drill'
    );

    assert.strictEqual(drillReport.status, 'PASSED_VERIFIED');
    assert.ok(drillReport.measuredRpoMinutes <= 15.0, 'RPO must be <= 15 minutes per Playbook p. 41');
    assert.ok(drillReport.measuredRtoMinutes <= 60.0, 'RTO must be <= 60 minutes per Playbook p. 41');
    assert.strictEqual(drillReport.integrityVerification.checksumMatch, true);
    assert.strictEqual(drillReport.integrityVerification.doubleEntryLedgerBalanced, true);
    assert.strictEqual(drillReport.integrityVerification.foreignKeysIntact, true);

    const drillHistory = await listBackupDrillReports(TENANT_A_ID, principalSessionA);
    assert.ok(drillHistory.length >= 2);
  });

  it('Milestone 6.14: NDPA 2023 Guardian Consent, Data Portability & Right to Erasure', async () => {
    // 1. Register lawful guardian consent
    const consent = await registerGuardianConsent(TENANT_A_ID, principalSessionA, {
      studentId: 'stu_kcl_002',
      guardianName: 'Alhaji Danjuma Garba',
      guardianPhone: '+234 802 888 9900',
      lawfulBasis: 'CONTRACTUAL_OBLIGATION',
      consentedPurposes: [
        'School academic instruction & term report cards',
        'Health center triage and emergency treatment',
        'Direct fee invoicing and payment reconciliation',
      ],
    });
    assert.strictEqual(consent.lawfulBasis, 'CONTRACTUAL_OBLIGATION');
    assert.strictEqual(consent.withdrawn, false);

    // 2. Export one-click data portability package (Section 34 NDPA 2023)
    const exportPackage = await exportStudentDataPortabilityPackage(
      TENANT_A_ID,
      principalSessionA,
      'stu_kcl_001'
    );
    assert.strictEqual(exportPackage.exportMetadata.formatVersion, 'NDPA-2023-V1');
    assert.ok(exportPackage.studentBiodata.fullName);
    assert.ok(exportPackage.attendanceSummary.attendanceRatePercent >= 90);
    assert.ok(exportPackage.financialStatement.ledgerTransactions.length >= 1);

    // 3. Right to Erasure / Pseudonymization
    const anonymized = await anonymizeStudentForErasure(
      TENANT_A_ID,
      principalSessionA,
      'stu_kcl_999',
      'Statutory transfer to overseas institution with guardian erasure request.'
    );
    assert.strictEqual(anonymized.success, true);
    assert.ok(anonymized.anonymizedIdentifier.startsWith('ANON-SHA256-'));
  });

  it('Milestone 6.15: SaaS Multi-Tenancy & Security Cross-Tenant Isolation Enforcement', async () => {
    // 1. SaaS Tenants and Health Metrics
    const tenants = await listPlatformTenants(principalSessionA);
    assert.strictEqual(tenants.length, 2);

    const health = await getPlatformHealthMetrics(principalSessionA);
    assert.strictEqual(health.backupReadinessScorePercent, 100);
    assert.strictEqual(health.ndpaComplianceScorePercent, 100);

    // 2. Strict IDOR / Cross-Tenant Isolation Protections:
    // Tenant B cannot query Tenant A's auxiliary records
    await assert.rejects(
      async () => {
        await listClinicVisits(TENANT_A_ID, principalSessionB);
      },
      { message: /Tenant Isolation Violation/ }
    );

    // Tenant B cannot mutate Tenant A's LMS modules
    await assert.rejects(
      async () => {
        await createCourseModule(TENANT_A_ID, principalSessionB, {
          subjectName: 'Biology',
          classArm: 'SS 1 Gold',
          title: 'Malicious Cross-Tenant Module',
          description: 'Attempting cross-tenant write',
        });
      },
      { message: /Tenant Isolation Violation/ }
    );

    // Tenant B cannot access Tenant A's AI drafts
    await assert.rejects(
      async () => {
        await listAiDrafts(TENANT_A_ID, principalSessionB);
      },
      { message: /Tenant Isolation Violation/ }
    );

    // Tenant B cannot trigger disaster recovery drills on Tenant A
    await assert.rejects(
      async () => {
        await executeBackupRestoreDrill(TENANT_A_ID, principalSessionB, 'snap_wal_live_01');
      },
      { message: /Tenant Isolation Violation/ }
    );
  });
});
