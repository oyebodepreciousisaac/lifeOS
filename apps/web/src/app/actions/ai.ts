'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  generateExamQuestions,
  generateLessonPlan,
  generateParentProgressSummary,
  analyzeDebtorNarrative,
  generatePrincipalExecutiveBrief,
  reviewAiDraft,
  commitAiDraft,
} from '@/lib/ai/ai-store';
import {
  GenerateQuestionsInput,
  GenerateLessonPlanInput,
  GenerateParentSummaryInput,
  AnalyzeDebtorNarrativeInput,
  ReviewAiDraftInput,
} from '@/lib/ai/ai-types';

export interface AiActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function generateExamQuestionsAction(input: GenerateQuestionsInput): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await generateExamQuestions(session.schoolId, session, input);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Draft generated: ${input.questionCount} questions for ${input.subject}. Pending educator review.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate questions.' };
  }
}

export async function generateLessonPlanAction(input: GenerateLessonPlanInput): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await generateLessonPlan(session.schoolId, session, input);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Draft generated: Lesson plan for ${input.topic}. Pending educator review.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate lesson plan.' };
  }
}

export async function generateParentProgressSummaryAction(input: GenerateParentSummaryInput): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await generateParentProgressSummary(session.schoolId, session, input);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Progress Narrative generated for ${input.studentName}. Pending educator review.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate parent summary.' };
  }
}

export async function analyzeDebtorNarrativeAction(input: AnalyzeDebtorNarrativeInput): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await analyzeDebtorNarrative(session.schoolId, session, input);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Debtor Advisory generated for ${input.studentName}. Pending bursar review.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to analyze debtor narrative.' };
  }
}

export async function generatePrincipalExecutiveBriefAction(metricsContext: {
  attendanceRatePercent: number;
  chronicAbsenteeCount: number;
  latenessCountToday: number;
  unmoderatedResultsCount: number;
  feeCollectionPercent: number;
}): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await generatePrincipalExecutiveBrief(session.schoolId, session, metricsContext);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Executive Brief generated for Principal. Pending review.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to generate executive brief.' };
  }
}

export async function reviewAiDraftAction(input: ReviewAiDraftInput): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const draft = await reviewAiDraft(session.schoolId, session, input);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `AI Draft reviewed: status is now ${draft.status}.`,
      data: draft,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to review AI draft.' };
  }
}

export async function commitAiDraftAction(draftId: string): Promise<AiActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const res = await commitAiDraft(session.schoolId, session, draftId);
    revalidatePath('/admin/assistive-ai');
    return {
      success: true,
      message: `Draft approved and committed successfully to official school records.`,
      data: res,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to commit AI draft.' };
  }
}
