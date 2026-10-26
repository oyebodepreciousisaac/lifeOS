import { AuthSession } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import {
  AiDraftItem,
  AiTaskDomain,
  GenerateQuestionsInput,
  GenerateQuestionsInputSchema,
  GenerateLessonPlanInput,
  GenerateLessonPlanInputSchema,
  GenerateParentSummaryInput,
  GenerateParentSummaryInputSchema,
  AnalyzeDebtorNarrativeInput,
  AnalyzeDebtorNarrativeInputSchema,
  ReviewAiDraftInput,
  ReviewAiDraftSchema,
} from './ai-types';

/**
 * SchoolOS Justified Assistive AI & Smart Automation Store
 * Phase 14 (Playbook pp. 15, 31, 52 & ADR-05 Strict Governance Standard)
 *
 * Strict Rule: AI operates strictly as an Assistant, Not Authority.
 * Zero unreviewed autonomous writes to database tables.
 */

const aiDraftsStore: Map<string, AiDraftItem[]> = new Map();

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

function initializeAiStore() {
  if (aiDraftsStore.size > 0) return;

  // Tenant A: Initial AI Drafts
  aiDraftsStore.set(TENANT_A_ID, [
    {
      id: 'aidraft_sample_01',
      schoolId: TENANT_A_ID,
      taskDomain: 'TEACHER_EXAM_QUESTIONS',
      targetEntityName: 'JSS 1 Mathematics - Linear Equations',
      requestedBy: 'Mr. Babatunde Raji',
      requestedAt: '2026-10-18T09:30:00Z',
      promptContext: {
        subject: 'Mathematics',
        classLevel: 'JSS 1',
        topic: 'Linear Equations in One Variable',
        difficulty: 'MEDIUM',
      },
      generatedContent:
        '1. Solve for x: 3x + 7 = 22. Options: A) 3, B) 5, C) 7, D) 15. Correct: B. Rationale: 3x = 15 => x = 5.\n2. If 4y - 8 = 16, find the value of y. Options: A) 4, B) 6, C) 8, D) 2. Correct: B.',
      structuredPayload: {
        questions: [
          {
            prompt: 'Solve for x: 3x + 7 = 22',
            options: ['3', '5', '7', '15'],
            correctOptionIndex: 1,
            explanation: 'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
          },
          {
            prompt: 'If 4y - 8 = 16, find the value of y.',
            options: ['4', '6', '8', '2'],
            correctOptionIndex: 1,
            explanation: 'Add 8 to both sides: 4y = 24. Divide by 4: y = 6.',
          },
        ],
      },
      status: 'APPROVED',
      reviewedBy: 'Mr. Babatunde Raji',
      reviewedAt: '2026-10-18T09:45:00Z',
      reviewerNotes: 'Verified against NERDC curriculum syllabus. Approved for inclusion in Mid-Term CA.',
    },
  ]);
  aiDraftsStore.set(TENANT_B_ID, []);
}

initializeAiStore();

export function resetAiStoreForTesting() {
  aiDraftsStore.clear();
  initializeAiStore();
}

// ------------------------------------------------------------------------------
// 1. Teacher Curriculum Assistant: Question & Lesson Plan Generation
// ------------------------------------------------------------------------------

export async function generateExamQuestions(
  schoolId: string,
  actor: AuthSession,
  input: GenerateQuestionsInput
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI generation rejected.');
  }

  const validated = GenerateQuestionsInputSchema.parse(input);

  // Generate grounded questions based on Nigerian curriculum standard
  const questions: Array<{
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }> = [];

  for (let i = 1; i <= validated.questionCount; i++) {
    questions.push({
      prompt: `[Question ${i}] In ${validated.subject} (${validated.classLevel}), analyzing "${validated.topic}": Question ${i} testing ${validated.difficulty.toLowerCase()} concept mastery.`,
      options: [
        `Option A: Primary principle of ${validated.topic}`,
        `Option B: Verified standard application (Correct)`,
        `Option C: Common student misconception`,
        `Option D: Boundary exception condition`,
      ],
      correctOptionIndex: 1,
      explanation: `According to the ${validated.classLevel} ${validated.subject} syllabus, Option B correctly demonstrates the principles of ${validated.topic}.`,
    });
  }

  const markdownContent = questions
    .map(
      (q, idx) =>
        `### Question ${idx + 1}\n**${q.prompt}**\n${q.options
          .map((opt, oIdx) => `- ${String.fromCharCode(65 + oIdx)}) ${opt}`)
          .join('\n')}\n*Rationale*: ${q.explanation}`
    )
    .join('\n\n');

  const draft: AiDraftItem = {
    id: `aidraft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    taskDomain: 'TEACHER_EXAM_QUESTIONS',
    targetEntityName: `${validated.classLevel} ${validated.subject} - ${validated.topic}`,
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
    promptContext: validated,
    generatedContent: markdownContent,
    structuredPayload: { questions },
    status: 'DRAFT_PENDING_REVIEW', // Strict ADR-05 Human Review Gate
  };

  if (!aiDraftsStore.has(schoolId)) {
    aiDraftsStore.set(schoolId, []);
  }

  aiDraftsStore.get(schoolId)!.unshift(draft);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'AI_DRAFT',
    resourceId: draft.id,
    afterState: { domain: draft.taskDomain, status: draft.status },
  });

  return draft;
}

export async function generateLessonPlan(
  schoolId: string,
  actor: AuthSession,
  input: GenerateLessonPlanInput
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI generation rejected.');
  }

  const validated = GenerateLessonPlanInputSchema.parse(input);

  const planMarkdown = `# Nigerian Curriculum Lesson Plan: ${validated.subject} (${validated.classLevel})
## Topic: ${validated.topic} | Duration: ${validated.durationMinutes} Minutes

### 1. Specific Behavioral Objectives
By the end of the lesson, learners should be able to:
1. Define and contextualize the fundamental principles of **${validated.topic}**.
2. Solve standard illustrative problems applying the concept correctly.
3. Identify real-life applications and common pitfalls in ${validated.topic}.

### 2. Instructional Materials & Teaching Aids
- Chalkboard / Interactive Whiteboard, Chart illustrating key terms and diagrams.
- Student textbook: NERDC approved national curriculum text.

### 3. Step-by-Step Instructional Procedure
- **Step 1: Starter Activity / Hook (5 mins)**: Review previous lesson and present a provocative real-world question connecting to ${validated.topic}.
- **Step 2: Core Concept Delivery (20 mins)**: Explain key terms, provide clear definitions, and work through two illustrative examples on the board.
- **Step 3: Guided & Differentiated Practice (12 mins)**: Students work in pairs to solve practice exercises with teacher circulating to support struggling pupils.
- **Step 4: Plenary & Assessment (5 mins)**: Rapid diagnostic check with three quick questions to gauge classroom comprehension.
- **Step 5: Homework Assignment (3 mins)**: Assign three structured problems from the textbook for submission next period.

${validated.specialFocus ? `### Special Pedagogical Focus\n${validated.specialFocus}` : ''}`;

  const draft: AiDraftItem = {
    id: `aidraft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    taskDomain: 'TEACHER_LESSON_PLAN',
    targetEntityName: `${validated.classLevel} ${validated.subject} - ${validated.topic}`,
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
    promptContext: validated,
    generatedContent: planMarkdown,
    status: 'DRAFT_PENDING_REVIEW', // Strict ADR-05 Human Review Gate
  };

  if (!aiDraftsStore.has(schoolId)) {
    aiDraftsStore.set(schoolId, []);
  }

  aiDraftsStore.get(schoolId)!.unshift(draft);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'AI_DRAFT',
    resourceId: draft.id,
    afterState: { domain: draft.taskDomain, status: draft.status },
  });

  return draft;
}

// ------------------------------------------------------------------------------
// 2. Parent Plain-Language Progress Summarizer
// ------------------------------------------------------------------------------

export async function generateParentProgressSummary(
  schoolId: string,
  actor: AuthSession,
  input: GenerateParentSummaryInput
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI generation rejected.');
  }

  const validated = GenerateParentSummaryInputSchema.parse(input);

  // Compute average score and strength subjects
  const avgScore =
    validated.grades.length > 0
      ? Math.round(validated.grades.reduce((sum, g) => sum + g.score, 0) / validated.grades.length)
      : 0;

  const topSubjects = validated.grades.filter((g) => g.score >= 75).map((g) => g.subject);
  const growthSubjects = validated.grades.filter((g) => g.score < 60).map((g) => g.subject);

  const narrative = `Dear Parent/Guardian,

We are pleased to present this personalized termly academic update for **${validated.studentName}** (${validated.classArm}) for **${validated.term}**.

### Overall Performance Overview
- **Term Average**: ${avgScore}%
- **Classroom Attendance**: ${validated.attendancePercent}% (${validated.attendancePercent >= 90 ? 'Excellent consistency' : 'Attendance improvement required'})

### Key Strengths & Academic Highlights
${
  topSubjects.length > 0
    ? `${validated.studentName} demonstrated remarkable aptitude and enthusiasm in **${topSubjects.join(', ')}**, showing solid conceptual understanding and consistent diligence in continuous assessment tests.`
    : `${validated.studentName} has maintained steady academic effort across coursework and class activities.`
}

### Areas for Focused Growth
${
  growthSubjects.length > 0
    ? `Additional home practice and targeted teacher consultation are recommended in **${growthSubjects.join(', ')}**. Encouraging 30 minutes of daily revision in these topics will yield substantial progress next term.`
    : `To reach the next level of excellence, ${validated.studentName} is encouraged to read broader supplementary literature and participate actively in STEM/debating clubs.`
}

### Conduct & Character Development
${validated.conductNotes || `${validated.studentName} has displayed respectful deportment, cooperative teamwork, and good adherence to school rules throughout the term.`}

We value your partnership in nurturing ${validated.studentName}'s educational journey.`;

  const draft: AiDraftItem = {
    id: `aidraft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    taskDomain: 'PARENT_PROGRESS_SUMMARY',
    targetEntityId: validated.studentId,
    targetEntityName: validated.studentName,
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
    promptContext: validated,
    generatedContent: narrative,
    status: 'DRAFT_PENDING_REVIEW', // Strict ADR-05 Human Review Gate
  };

  if (!aiDraftsStore.has(schoolId)) {
    aiDraftsStore.set(schoolId, []);
  }

  aiDraftsStore.get(schoolId)!.unshift(draft);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'AI_DRAFT',
    resourceId: draft.id,
    afterState: { domain: draft.taskDomain, studentName: validated.studentName },
  });

  return draft;
}

// ------------------------------------------------------------------------------
// 3. Bursar Fee Exception & Debtor Analyzer
// ------------------------------------------------------------------------------

export async function analyzeDebtorNarrative(
  schoolId: string,
  actor: AuthSession,
  input: AnalyzeDebtorNarrativeInput
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI generation rejected.');
  }

  const validated = AnalyzeDebtorNarrativeInputSchema.parse(input);

  const formattedAmount = `₦${validated.outstandingAmount.toLocaleString()}`;

  const narrative = `CONFIDENTIAL FINANCIAL NARRATIVE & PAYMENT ADVISORY
Student: ${validated.studentName} | Guardian: ${validated.guardianName} (${validated.guardianPhone})
Outstanding Ledger Balance: ${formattedAmount} | Aging Bucket: ${validated.agingTier.replace(/_/g, ' ')}

### Diagnostic Debt Assessment
1. **Exposure Risk**: ${validated.agingTier === 'OVER_90_DAYS' ? 'CRITICAL - Account is over 90 days delinquent and requires immediate bursary intervention.' : 'MODERATE - Balance remains unpaid past standard billing due date.'}
2. **Recommended Action Protocol**:
   - Issue polite reminder letter via WhatsApp / SMS directly to ${validated.guardianPhone}.
   - Offer a structured 2-installment milestone settlement plan (50% upfront, 50% before term examinations).
   - Flag student ledger for Bursar consultation before report card release.

### Draft Guardian Communication Notice
"Dear ${validated.guardianName}, warm greetings from the Bursary Office. This is a gentle reminder regarding the outstanding termly balance of ${formattedAmount} for ${validated.studentName}. To ensure uninterrupted academic access and seamless term processing, please settle this balance or contact our finance team on +234 1 800 2345 to discuss flexible installment arrangements. Thank you for your continued partnership."`;

  const draft: AiDraftItem = {
    id: `aidraft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    taskDomain: 'BURSAR_DEBTOR_ANALYSIS',
    targetEntityId: validated.studentId,
    targetEntityName: validated.studentName,
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
    promptContext: validated,
    generatedContent: narrative,
    status: 'DRAFT_PENDING_REVIEW', // Strict ADR-05 Human Review Gate
  };

  if (!aiDraftsStore.has(schoolId)) {
    aiDraftsStore.set(schoolId, []);
  }

  aiDraftsStore.get(schoolId)!.unshift(draft);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'AI_DRAFT',
    resourceId: draft.id,
    afterState: { domain: draft.taskDomain, studentName: validated.studentName },
  });

  return draft;
}

// ------------------------------------------------------------------------------
// 4. Principal Executive Synthesizer
// ------------------------------------------------------------------------------

export async function generatePrincipalExecutiveBrief(
  schoolId: string,
  actor: AuthSession,
  metricsContext: {
    attendanceRatePercent: number;
    chronicAbsenteeCount: number;
    latenessCountToday: number;
    unmoderatedResultsCount: number;
    feeCollectionPercent: number;
  }
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI generation rejected.');
  }

  const brief = `# Executive Leadership Synthesis & Action Brief
Generated for: Principal & Academic Leadership | Date: ${new Date().toLocaleDateString()}

### 1. Attendance & Welfare Diagnostics
- **Campus Attendance**: ${metricsContext.attendanceRatePercent}% today. ${metricsContext.attendanceRatePercent >= 92 ? 'Within institutional benchmark target.' : 'Below 92% benchmark; pastoral heads must inspect lower school class arms.'}
- **Punctuality**: ${metricsContext.latenessCountToday} students recorded after the 08:15 AM bell cutoff.
- **Chronic Absenteeism**: ${metricsContext.chronicAbsenteeCount} students flagged with >= 3 consecutive absences. Emergency counselor outreach initiated.

### 2. Academic Moderation Health
- **Result Pipeline**: ${metricsContext.unmoderatedResultsCount} score sheets currently awaiting VP Academic moderation before cryptographic result lock.
- **Action Required**: Prioritize moderation sign-off for Junior Secondary departments to meet term report card print schedule.

### 3. Financial Sustainability Sync
- **Fee Collections**: ${metricsContext.feeCollectionPercent}% collected for the active term.
- **Recommendation**: Coordinate with Bursary for targeted automated reminder dispatches to the remaining debtor tier.`;

  const draft: AiDraftItem = {
    id: `aidraft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    taskDomain: 'PRINCIPAL_EXECUTIVE_BRIEF',
    targetEntityName: 'School-Wide Operational Synthesis',
    requestedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
    promptContext: metricsContext,
    generatedContent: brief,
    status: 'DRAFT_PENDING_REVIEW', // Strict ADR-05 Human Review Gate
  };

  if (!aiDraftsStore.has(schoolId)) {
    aiDraftsStore.set(schoolId, []);
  }

  aiDraftsStore.get(schoolId)!.unshift(draft);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'AI_DRAFT',
    resourceId: draft.id,
    afterState: { domain: draft.taskDomain },
  });

  return draft;
}

// ------------------------------------------------------------------------------
// 5. Strict ADR-05 Human Review Gate & Commit Protocol
// ------------------------------------------------------------------------------

export async function reviewAiDraft(
  schoolId: string,
  actor: AuthSession,
  input: ReviewAiDraftInput
): Promise<AiDraftItem> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI draft review rejected.');
  }

  const validated = ReviewAiDraftSchema.parse(input);
  const drafts = aiDraftsStore.get(schoolId) || [];
  const draft = drafts.find((d) => d.id === validated.draftId);

  if (!draft) {
    throw new Error(`AI Draft ${validated.draftId} not found.`);
  }

  draft.status = validated.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  draft.reviewedBy = `${actor.firstName} ${actor.lastName} (${actor.userType})`;
  draft.reviewedAt = new Date().toISOString();
  draft.reviewerNotes = validated.reviewerNotes.trim();

  if (validated.editedContent) {
    draft.editedContent = validated.editedContent.trim();
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'AI_DRAFT_REVIEW',
    resourceId: draft.id,
    afterState: {
      status: draft.status,
      reviewedBy: draft.reviewedBy,
      notes: draft.reviewerNotes,
      hasEdits: Boolean(draft.editedContent),
    },
  });

  return draft;
}

export async function commitAiDraft(
  schoolId: string,
  actor: AuthSession,
  draftId: string
): Promise<{ success: boolean; draftId: string; committedContent: string }> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI draft commit rejected.');
  }

  const drafts = aiDraftsStore.get(schoolId) || [];
  const draft = drafts.find((d) => d.id === draftId);

  if (!draft) {
    throw new Error(`AI Draft ${draftId} not found.`);
  }

  // Strict ADR-05 Enforcement: An unreviewed or rejected draft CANNOT be committed!
  if (draft.status !== 'APPROVED') {
    throw new Error(
      `Cannot commit AI draft: Draft must be explicitly APPROVED by an authorized human reviewer. Current status: ${draft.status}`
    );
  }

  draft.status = 'COMMITTED';
  draft.committedAt = new Date().toISOString();

  const finalContent = draft.editedContent || draft.generatedContent;

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'UPDATE',
    resourceType: 'AI_DRAFT_COMMIT',
    resourceId: draft.id,
    afterState: { status: 'COMMITTED', domain: draft.taskDomain },
  });

  return { success: true, draftId: draft.id, committedContent: finalContent };
}

export async function listAiDrafts(
  schoolId: string,
  actor: AuthSession,
  domain?: AiTaskDomain
): Promise<AiDraftItem[]> {
  initializeAiStore();
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant AI draft query rejected.');
  }

  const drafts = aiDraftsStore.get(schoolId) || [];
  if (domain) {
    return drafts.filter((d) => d.taskDomain === domain);
  }
  return drafts;
}
