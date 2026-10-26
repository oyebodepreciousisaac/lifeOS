import { AuthSession } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import {
  CourseModule,
  CreateCourseModuleInput,
  CreateCourseModuleSchema,
  Lesson,
  CreateLessonInput,
  CreateLessonSchema,
  Quiz,
  CreateQuizInput,
  CreateQuizSchema,
  QuizAttempt,
  SubmitQuizAttemptInput,
  SubmitQuizAttemptSchema,
  Assignment,
  CreateAssignmentInput,
  CreateAssignmentSchema,
  AssignmentSubmission,
  SubmitAssignmentInput,
  SubmitAssignmentSchema,
  GradeAssignmentInput,
  GradeAssignmentSchema,
  VirtualClassSession,
  ScheduleVirtualClassInput,
  ScheduleVirtualClassSchema,
  StudentLmsAnalytics,
} from './lms-types';

/**
 * SchoolOS Lightweight LMS & Virtual Classroom Store
 * Phase 13 (Playbook pp. 15, 30, 52)
 */

const modulesStore: Map<string, CourseModule[]> = new Map();
const quizzesStore: Map<string, Quiz[]> = new Map();
const quizAttemptsStore: Map<string, QuizAttempt[]> = new Map();
const assignmentsStore: Map<string, Assignment[]> = new Map();
const assignmentSubmissionsStore: Map<string, AssignmentSubmission[]> = new Map();
const virtualClassesStore: Map<string, VirtualClassSession[]> = new Map();
const completedLessonsStore: Map<string, Set<string>> = new Map();

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

function initializeLmsStore() {
  if (modulesStore.size > 0) return;

  // Tenant A: Course Modules & Lessons
  modulesStore.set(TENANT_A_ID, [
    {
      id: 'mod_math_01',
      schoolId: TENANT_A_ID,
      subjectName: 'Mathematics',
      classArm: 'JSS 1 Gold',
      title: 'Algebraic Expressions & Linear Equations',
      orderIndex: 1,
      description: 'Foundations of algebra, substitution, grouping like terms, and solving simple linear equations.',
      isPublished: true,
      lessons: [
        {
          id: 'les_math_01',
          schoolId: TENANT_A_ID,
          moduleId: 'mod_math_01',
          title: 'Introduction to Algebraic Variables & Terms',
          orderIndex: 1,
          contentMarkdown:
            '# Introduction to Algebraic Variables\nIn algebra, letters stand in for unknown quantities. In the expression 3x + 5, 3 is the coefficient, x is the variable, and 5 is the constant.',
          videoUrl: 'https://cdn.schoolos.ng/lessons/jss1/algebra-intro.mp4',
          resourcePdfUrl: 'https://cdn.schoolos.ng/worksheets/jss1-algebra-notes.pdf',
          estimatedDurationMinutes: 40,
          isPublished: true,
        },
        {
          id: 'les_math_02',
          schoolId: TENANT_A_ID,
          moduleId: 'mod_math_01',
          title: 'Grouping and Combining Like Terms',
          orderIndex: 2,
          contentMarkdown:
            '# Grouping Like Terms\nTerms that have the exact same variable with the same power can be combined. Example: 4a + 7b - 2a = 2a + 7b.',
          videoUrl: 'https://cdn.schoolos.ng/lessons/jss1/like-terms.mp4',
          resourcePdfUrl: 'https://cdn.schoolos.ng/worksheets/jss1-like-terms.pdf',
          estimatedDurationMinutes: 45,
          isPublished: true,
        },
      ],
    },
  ]);
  modulesStore.set(TENANT_B_ID, []);

  // Tenant A: Quiz
  quizzesStore.set(TENANT_A_ID, [
    {
      id: 'quiz_alg_01',
      schoolId: TENANT_A_ID,
      moduleId: 'mod_math_01',
      lessonId: 'les_math_01',
      title: 'Algebraic Variables & Terms Concept Check',
      instructions: 'Answer all 3 questions within 15 minutes. A passing score is 60%.',
      timeLimitMinutes: 15,
      passingScorePercent: 60,
      isPublished: true,
      questions: [
        {
          id: 'q_01',
          prompt: 'In the expression 7y - 4, what is the coefficient of y?',
          questionType: 'MULTIPLE_CHOICE',
          options: ['-4', '4', '7', 'y'],
          correctOptionIndex: 2,
          points: 10,
          explanation: 'The coefficient is the numerical factor multiplying the variable, which is 7.',
        },
        {
          id: 'q_02',
          prompt: 'True or False: The terms 5x and 5x² are like terms and can be added to get 10x³.',
          questionType: 'TRUE_FALSE',
          options: ['True', 'False'],
          correctOptionIndex: 1,
          points: 10,
          explanation: 'False. They have different powers of x, so they are not like terms.',
        },
        {
          id: 'q_03',
          prompt: 'Simplify the algebraic expression: 8m + 3k - 5m + 2k',
          questionType: 'MULTIPLE_CHOICE',
          options: ['3m + 5k', '13m + 5k', '3m + k', '8m + 5k'],
          correctOptionIndex: 0,
          points: 10,
          explanation: 'Group like terms: (8m - 5m) + (3k + 2k) = 3m + 5k.',
        },
      ],
    },
  ]);
  quizzesStore.set(TENANT_B_ID, []);

  // Tenant A: Quiz Attempts Seed
  quizAttemptsStore.set(TENANT_A_ID, []);
  quizAttemptsStore.set(TENANT_B_ID, []);

  // Tenant A: Assignment
  assignmentsStore.set(TENANT_A_ID, [
    {
      id: 'asg_math_01',
      schoolId: TENANT_A_ID,
      moduleId: 'mod_math_01',
      title: 'Algebra Problem Set #1: Word Problems into Equations',
      description: 'Formulate and solve algebraic equations from 5 practical real-life word scenarios.',
      instructions: 'Upload your step-by-step handwritten solutions as PDF or type your steps clearly in the text submission area.',
      rubricCriteria: [
        { criterion: 'Equation Formulation', maxPoints: 40 },
        { criterion: 'Working & Steps Accuracy', maxPoints: 40 },
        { criterion: 'Final Solution & Units', maxPoints: 20 },
      ],
      maxScore: 100,
      dueDate: '2026-10-25T23:59:59Z',
      isPublished: true,
    },
  ]);
  assignmentsStore.set(TENANT_B_ID, []);

  assignmentSubmissionsStore.set(TENANT_A_ID, []);
  assignmentSubmissionsStore.set(TENANT_B_ID, []);

  // Tenant A: Virtual Classroom Sessions
  virtualClassesStore.set(TENANT_A_ID, [
    {
      id: 'vclass_001',
      schoolId: TENANT_A_ID,
      subjectName: 'Mathematics',
      classArm: 'JSS 1 Gold',
      title: 'Live Algebra Problem Clinic & Q&A Session',
      provider: 'ZOOM',
      joinUrl: 'https://zoom.us/j/88392019283?pwd=KCLMathLive2026',
      meetingId: '883 9201 9283',
      passcode: 'KCL2026',
      scheduledStartTime: '2026-10-22T16:00:00Z',
      durationMinutes: 60,
      hostTeacherName: 'Mr. Babatunde Raji',
      status: 'SCHEDULED',
      attendeeStudentIds: ['stu_kcl_001'],
    },
  ]);
  virtualClassesStore.set(TENANT_B_ID, []);
}

initializeLmsStore();

export function resetLmsStoreForTesting() {
  modulesStore.clear();
  quizzesStore.clear();
  quizAttemptsStore.clear();
  assignmentsStore.clear();
  assignmentSubmissionsStore.clear();
  virtualClassesStore.clear();
  completedLessonsStore.clear();
  initializeLmsStore();
}

// ------------------------------------------------------------------------------
// 1. Modules & Lessons Operations
// ------------------------------------------------------------------------------

export async function createCourseModule(
  schoolId: string,
  actor: AuthSession,
  input: CreateCourseModuleInput
): Promise<CourseModule> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant module creation rejected.');
  }

  const validated = CreateCourseModuleSchema.parse(input);

  const module: CourseModule = {
    id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    subjectName: validated.subjectName.trim(),
    classArm: validated.classArm.trim(),
    title: validated.title.trim(),
    orderIndex: validated.orderIndex,
    description: validated.description.trim(),
    isPublished: validated.isPublished,
    lessons: [],
  };

  if (!modulesStore.has(schoolId)) {
    modulesStore.set(schoolId, []);
  }

  modulesStore.get(schoolId)!.push(module);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_MODULE',
    resourceId: module.id,
    afterState: { title: module.title, subjectName: module.subjectName, classArm: module.classArm },
  });

  return module;
}

export async function listCourseModules(
  schoolId: string,
  actor: AuthSession,
  classArm?: string
): Promise<CourseModule[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant module query rejected.');
  }

  const modules = modulesStore.get(schoolId) || [];
  if (classArm) {
    return modules.filter((m) => m.classArm.toLowerCase() === classArm.toLowerCase());
  }
  return modules;
}

export async function createLesson(
  schoolId: string,
  actor: AuthSession,
  input: CreateLessonInput
): Promise<Lesson> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant lesson creation rejected.');
  }

  const validated = CreateLessonSchema.parse(input);
  const modules = modulesStore.get(schoolId) || [];
  const module = modules.find((m) => m.id === validated.moduleId);

  if (!module) {
    throw new Error(`Module ${validated.moduleId} not found.`);
  }

  const lesson: Lesson = {
    id: `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    moduleId: module.id,
    title: validated.title.trim(),
    orderIndex: validated.orderIndex || module.lessons.length + 1,
    contentMarkdown: validated.contentMarkdown.trim(),
    videoUrl: validated.videoUrl || undefined,
    resourcePdfUrl: validated.resourcePdfUrl || undefined,
    estimatedDurationMinutes: validated.estimatedDurationMinutes,
    isPublished: validated.isPublished,
  };

  module.lessons.push(lesson);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_LESSON',
    resourceId: lesson.id,
    afterState: { moduleTitle: module.title, lessonTitle: lesson.title },
  });

  return lesson;
}

export async function markLessonComplete(
  schoolId: string,
  actor: AuthSession,
  studentId: string,
  lessonId: string
): Promise<{ success: boolean; studentId: string; lessonId: string }> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant lesson completion rejected.');
  }

  const key = `${schoolId}:${studentId}`;
  if (!completedLessonsStore.has(key)) {
    completedLessonsStore.set(key, new Set());
  }

  completedLessonsStore.get(key)!.add(lessonId);
  return { success: true, studentId, lessonId };
}

// ------------------------------------------------------------------------------
// 2. Online Quiz & Automated Scoring Operations
// ------------------------------------------------------------------------------

export async function createQuiz(
  schoolId: string,
  actor: AuthSession,
  input: CreateQuizInput
): Promise<Quiz> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant quiz creation rejected.');
  }

  const validated = CreateQuizSchema.parse(input);

  const quiz: Quiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    moduleId: validated.moduleId,
    lessonId: validated.lessonId,
    title: validated.title.trim(),
    instructions: validated.instructions.trim(),
    timeLimitMinutes: validated.timeLimitMinutes,
    passingScorePercent: validated.passingScorePercent,
    questions: validated.questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 1}_${Math.random().toString(36).substring(2, 5)}`,
    })),
    isPublished: validated.isPublished,
  };

  if (!quizzesStore.has(schoolId)) {
    quizzesStore.set(schoolId, []);
  }

  quizzesStore.get(schoolId)!.push(quiz);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_QUIZ',
    resourceId: quiz.id,
    afterState: { title: quiz.title, totalQuestions: quiz.questions.length },
  });

  return quiz;
}

export async function listQuizzes(
  schoolId: string,
  actor: AuthSession,
  moduleId?: string
): Promise<Quiz[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant quiz query rejected.');
  }

  const quizzes = quizzesStore.get(schoolId) || [];
  if (moduleId) {
    return quizzes.filter((q) => q.moduleId === moduleId);
  }
  return quizzes;
}

export async function submitQuizAttempt(
  schoolId: string,
  actor: AuthSession,
  input: SubmitQuizAttemptInput
): Promise<QuizAttempt> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant quiz attempt rejected.');
  }

  const validated = SubmitQuizAttemptSchema.parse(input);
  const quizzes = quizzesStore.get(schoolId) || [];
  const quiz = quizzes.find((q) => q.id === validated.quizId);

  if (!quiz) {
    throw new Error(`Quiz ${validated.quizId} not found.`);
  }

  let pointsEarned = 0;
  let totalPoints = 0;

  for (const question of quiz.questions) {
    totalPoints += question.points;
    const answer = validated.answers.find((a) => a.questionId === question.id);

    if (answer) {
      if (
        (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') &&
        answer.selectedOptionIndex === question.correctOptionIndex
      ) {
        pointsEarned += question.points;
      } else if (
        question.questionType === 'SHORT_ANSWER' &&
        question.correctTextAnswer &&
        answer.textAnswer &&
        answer.textAnswer.trim().toLowerCase() === question.correctTextAnswer.trim().toLowerCase()
      ) {
        pointsEarned += question.points;
      }
    }
  }

  const scorePercent = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
  const passed = scorePercent >= quiz.passingScorePercent;

  const attempt: QuizAttempt = {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: validated.studentId,
    studentName: validated.studentName,
    classArm: validated.classArm,
    answers: validated.answers,
    scorePercent,
    pointsEarned,
    totalPoints,
    passed,
    startedAt: validated.startedAt,
    submittedAt: new Date().toISOString(),
  };

  if (!quizAttemptsStore.has(schoolId)) {
    quizAttemptsStore.set(schoolId, []);
  }

  quizAttemptsStore.get(schoolId)!.unshift(attempt);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_QUIZ_ATTEMPT',
    resourceId: attempt.id,
    afterState: {
      quizTitle: attempt.quizTitle,
      studentName: attempt.studentName,
      scorePercent: attempt.scorePercent,
      passed: attempt.passed,
    },
  });

  return attempt;
}

export async function listQuizAttempts(
  schoolId: string,
  actor: AuthSession,
  quizId?: string,
  studentId?: string
): Promise<QuizAttempt[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant quiz attempt query rejected.');
  }

  let attempts = quizAttemptsStore.get(schoolId) || [];
  if (quizId) {
    attempts = attempts.filter((a) => a.quizId === quizId);
  }
  if (studentId) {
    attempts = attempts.filter((a) => a.studentId === studentId);
  }
  return attempts;
}

// ------------------------------------------------------------------------------
// 3. Assignment Submission & Rubric Grading Operations
// ------------------------------------------------------------------------------

export async function createAssignment(
  schoolId: string,
  actor: AuthSession,
  input: CreateAssignmentInput
): Promise<Assignment> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant assignment creation rejected.');
  }

  const validated = CreateAssignmentSchema.parse(input);

  const assignment: Assignment = {
    id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    moduleId: validated.moduleId,
    title: validated.title.trim(),
    description: validated.description.trim(),
    instructions: validated.instructions.trim(),
    rubricCriteria: validated.rubricCriteria,
    maxScore: validated.maxScore,
    dueDate: validated.dueDate,
    isPublished: validated.isPublished,
  };

  if (!assignmentsStore.has(schoolId)) {
    assignmentsStore.set(schoolId, []);
  }

  assignmentsStore.get(schoolId)!.push(assignment);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_ASSIGNMENT',
    resourceId: assignment.id,
    afterState: { title: assignment.title, maxScore: assignment.maxScore, dueDate: assignment.dueDate },
  });

  return assignment;
}

export async function listAssignments(
  schoolId: string,
  actor: AuthSession,
  moduleId?: string
): Promise<Assignment[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant assignment query rejected.');
  }

  const assignments = assignmentsStore.get(schoolId) || [];
  if (moduleId) {
    return assignments.filter((a) => a.moduleId === moduleId);
  }
  return assignments;
}

export async function submitAssignment(
  schoolId: string,
  actor: AuthSession,
  input: SubmitAssignmentInput
): Promise<AssignmentSubmission> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant assignment submission rejected.');
  }

  const validated = SubmitAssignmentSchema.parse(input);
  const assignments = assignmentsStore.get(schoolId) || [];
  const assignment = assignments.find((a) => a.id === validated.assignmentId);

  if (!assignment) {
    throw new Error(`Assignment ${validated.assignmentId} not found.`);
  }

  const now = new Date();
  const isLate = now > new Date(assignment.dueDate);

  const submission: AssignmentSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentId: validated.studentId,
    studentName: validated.studentName,
    classArm: validated.classArm,
    submissionText: validated.submissionText.trim(),
    attachmentFileUrl: validated.attachmentFileUrl || undefined,
    submittedAt: now.toISOString(),
    status: isLate ? 'LATE' : 'SUBMITTED',
  };

  if (!assignmentSubmissionsStore.has(schoolId)) {
    assignmentSubmissionsStore.set(schoolId, []);
  }

  assignmentSubmissionsStore.get(schoolId)!.unshift(submission);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'LMS_SUBMISSION',
    resourceId: submission.id,
    afterState: { assignmentTitle: submission.assignmentTitle, studentName: submission.studentName },
  });

  return submission;
}

export async function gradeAssignment(
  schoolId: string,
  actor: AuthSession,
  input: GradeAssignmentInput
): Promise<AssignmentSubmission> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant assignment grading rejected.');
  }

  const validated = GradeAssignmentSchema.parse(input);
  const submissions = assignmentSubmissionsStore.get(schoolId) || [];
  const submission = submissions.find((s) => s.id === validated.submissionId);

  if (!submission) {
    throw new Error(`Submission ${validated.submissionId} not found.`);
  }

  submission.status = 'GRADED';
  submission.scoreAwarded = validated.scoreAwarded;
  submission.teacherFeedback = validated.teacherFeedback.trim();
  submission.gradedBy = `${actor.firstName} ${actor.lastName}`;
  submission.gradedAt = new Date().toISOString();

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'LMS_SUBMISSION',
    resourceId: submission.id,
    afterState: {
      status: submission.status,
      scoreAwarded: submission.scoreAwarded,
      gradedBy: submission.gradedBy,
    },
  });

  return submission;
}

export async function listAssignmentSubmissions(
  schoolId: string,
  actor: AuthSession,
  assignmentId?: string,
  studentId?: string
): Promise<AssignmentSubmission[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant assignment submission query rejected.');
  }

  let submissions = assignmentSubmissionsStore.get(schoolId) || [];
  if (assignmentId) {
    submissions = submissions.filter((s) => s.assignmentId === assignmentId);
  }
  if (studentId) {
    submissions = submissions.filter((s) => s.studentId === studentId);
  }
  return submissions;
}

// ------------------------------------------------------------------------------
// 4. Virtual Classroom Operations (Zoom & Google Meet)
// ------------------------------------------------------------------------------

export async function scheduleVirtualClass(
  schoolId: string,
  actor: AuthSession,
  input: ScheduleVirtualClassInput
): Promise<VirtualClassSession> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant virtual class scheduling rejected.');
  }

  const validated = ScheduleVirtualClassSchema.parse(input);

  const session: VirtualClassSession = {
    id: `vclass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    subjectName: validated.subjectName.trim(),
    classArm: validated.classArm.trim(),
    title: validated.title.trim(),
    provider: validated.provider,
    joinUrl: validated.joinUrl.trim(),
    meetingId: validated.meetingId.trim(),
    passcode: validated.passcode?.trim(),
    scheduledStartTime: validated.scheduledStartTime,
    durationMinutes: validated.durationMinutes,
    hostTeacherName: `${actor.firstName} ${actor.lastName}`,
    status: 'SCHEDULED',
    attendeeStudentIds: [],
  };

  if (!virtualClassesStore.has(schoolId)) {
    virtualClassesStore.set(schoolId, []);
  }

  virtualClassesStore.get(schoolId)!.unshift(session);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'VIRTUAL_CLASS',
    resourceId: session.id,
    afterState: { title: session.title, provider: session.provider, host: session.hostTeacherName },
  });

  return session;
}

export async function listVirtualClasses(
  schoolId: string,
  actor: AuthSession,
  classArm?: string
): Promise<VirtualClassSession[]> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant virtual class query rejected.');
  }

  const list = virtualClassesStore.get(schoolId) || [];
  if (classArm) {
    return list.filter((s) => s.classArm.toLowerCase() === classArm.toLowerCase());
  }
  return list;
}

export async function recordVirtualClassAttendance(
  schoolId: string,
  actor: AuthSession,
  sessionId: string,
  studentId: string
): Promise<VirtualClassSession> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant virtual attendance rejected.');
  }

  const sessions = virtualClassesStore.get(schoolId) || [];
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    throw new Error(`Virtual class session ${sessionId} not found.`);
  }

  if (!session.attendeeStudentIds.includes(studentId)) {
    session.attendeeStudentIds.push(studentId);
  }

  return session;
}

// ------------------------------------------------------------------------------
// 5. Learning Analytics
// ------------------------------------------------------------------------------

export async function getStudentLmsAnalytics(
  schoolId: string,
  actor: AuthSession,
  studentId: string,
  studentName = 'Student'
): Promise<StudentLmsAnalytics> {
  initializeLmsStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant analytics query rejected.');
  }

  const modules = modulesStore.get(schoolId) || [];
  let totalLessonsCount = 0;
  for (const mod of modules) {
    totalLessonsCount += mod.lessons.length;
  }

  const key = `${schoolId}:${studentId}`;
  const completedSet = completedLessonsStore.get(key) || new Set();
  const completedLessonsCount = completedSet.size;

  const attempts = (quizAttemptsStore.get(schoolId) || []).filter((a) => a.studentId === studentId);
  const quizzesAttemptedCount = attempts.length;
  const averageQuizScorePercent =
    quizzesAttemptedCount > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / quizzesAttemptedCount)
      : 0;

  const submissions = (assignmentSubmissionsStore.get(schoolId) || []).filter(
    (s) => s.studentId === studentId
  );
  const assignmentsSubmittedCount = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'GRADED' && s.scoreAwarded !== undefined);
  const assignmentsGradedCount = gradedSubmissions.length;
  const averageAssignmentScorePercent =
    assignmentsGradedCount > 0
      ? Math.round(
          gradedSubmissions.reduce((sum, s) => sum + (s.scoreAwarded || 0), 0) / assignmentsGradedCount
        )
      : 0;

  const lessonProgressPercent =
    totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return {
    studentId,
    studentName,
    completedLessonsCount,
    totalLessonsCount,
    lessonProgressPercent,
    quizzesAttemptedCount,
    averageQuizScorePercent,
    assignmentsSubmittedCount,
    assignmentsGradedCount,
    averageAssignmentScorePercent,
  };
}
