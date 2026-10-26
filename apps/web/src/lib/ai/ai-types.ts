import { z } from 'zod';

/**
 * SchoolOS Justified Assistive AI & Smart Automation Types
 * Phase 14 (Playbook pp. 15, 31, 52 & ADR-05 Strict Governance Standard)
 */

export type AiTaskDomain =
  | 'TEACHER_EXAM_QUESTIONS'
  | 'TEACHER_LESSON_PLAN'
  | 'PARENT_PROGRESS_SUMMARY'
  | 'BURSAR_DEBTOR_ANALYSIS'
  | 'PRINCIPAL_EXECUTIVE_BRIEF';

export type AiDraftStatus = 'DRAFT_PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMMITTED';

export interface AiDraftItem {
  id: string;
  schoolId: string;
  taskDomain: AiTaskDomain;
  targetEntityId?: string; // studentId, quizId, lessonId, invoiceId
  targetEntityName?: string;
  requestedBy: string;
  requestedAt: string;
  promptContext: Record<string, any>;
  generatedContent: string;
  structuredPayload?: Record<string, any>; // Parsed quiz questions, lesson plan sections, etc.
  status: AiDraftStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  editedContent?: string;
  committedAt?: string;
}

// ------------------------------------------------------------------------------
// Input Schemas
// ------------------------------------------------------------------------------

export const GenerateQuestionsInputSchema = z.object({
  subject: z.string().min(2, 'Subject required'),
  classLevel: z.string().min(2, 'Class level required'),
  topic: z.string().min(3, 'Topic required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  questionCount: z.number().min(1).max(20).default(5),
});

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

export const GenerateLessonPlanInputSchema = z.object({
  subject: z.string().min(2, 'Subject required'),
  classLevel: z.string().min(2, 'Class level required'),
  topic: z.string().min(3, 'Topic required'),
  durationMinutes: z.number().min(30).max(120).default(45),
  specialFocus: z.string().optional(),
});

export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

export const GenerateParentSummaryInputSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  classArm: z.string().min(1, 'Class arm required'),
  term: z.string().default('Term 1'),
  grades: z.array(
    z.object({
      subject: z.string(),
      score: z.number().min(0).max(100),
      grade: z.string(),
    })
  ),
  attendancePercent: z.number().min(0).max(100),
  conductNotes: z.string().optional(),
});

export type GenerateParentSummaryInput = z.infer<typeof GenerateParentSummaryInputSchema>;

export const AnalyzeDebtorNarrativeInputSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  guardianName: z.string().min(1, 'Guardian name required'),
  guardianPhone: z.string().min(10, 'Guardian phone required'),
  outstandingAmount: z.number().min(1, 'Outstanding amount required'),
  agingTier: z.enum(['0_30_DAYS', '31_60_DAYS', '61_90_DAYS', 'OVER_90_DAYS']),
  lastPaymentDate: z.string().optional(),
});

export type AnalyzeDebtorNarrativeInput = z.infer<typeof AnalyzeDebtorNarrativeInputSchema>;

export const ReviewAiDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID required'),
  decision: z.enum(['APPROVE', 'REJECT']),
  editedContent: z.string().optional(),
  reviewerNotes: z.string().min(2, 'Reviewer notes required'),
});

export type ReviewAiDraftInput = z.infer<typeof ReviewAiDraftSchema>;
