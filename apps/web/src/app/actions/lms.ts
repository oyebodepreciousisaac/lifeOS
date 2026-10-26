'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  createCourseModule,
  createLesson,
  markLessonComplete,
  createQuiz,
  submitQuizAttempt,
  createAssignment,
  submitAssignment,
  gradeAssignment,
  scheduleVirtualClass,
  recordVirtualClassAttendance,
} from '@/lib/lms/lms-store';
import {
  CreateCourseModuleInput,
  CreateLessonInput,
  CreateQuizInput,
  SubmitQuizAttemptInput,
  CreateAssignmentInput,
  SubmitAssignmentInput,
  GradeAssignmentInput,
  ScheduleVirtualClassInput,
} from '@/lib/lms/lms-types';

export interface LmsActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function createCourseModuleAction(input: CreateCourseModuleInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const module = await createCourseModule(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Module "${module.title}" created.`, data: module };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create module.' };
  }
}

export async function createLessonAction(input: CreateLessonInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const lesson = await createLesson(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Lesson "${lesson.title}" published.`, data: lesson };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to publish lesson.' };
  }
}

export async function markLessonCompleteAction(studentId: string, lessonId: string): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const res = await markLessonComplete(session.schoolId, session, studentId, lessonId);
    revalidatePath('/admin/lms');
    return { success: true, message: 'Lesson marked as completed.', data: res };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to mark lesson complete.' };
  }
}

export async function createQuizAction(input: CreateQuizInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const quiz = await createQuiz(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Quiz "${quiz.title}" created with ${quiz.questions.length} questions.`, data: quiz };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create quiz.' };
  }
}

export async function submitQuizAttemptAction(input: SubmitQuizAttemptInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const attempt = await submitQuizAttempt(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return {
      success: true,
      message: `Quiz completed: Score ${attempt.scorePercent}% (${attempt.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}).`,
      data: attempt,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit quiz attempt.' };
  }
}

export async function createAssignmentAction(input: CreateAssignmentInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const asg = await createAssignment(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Assignment "${asg.title}" published.`, data: asg };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to publish assignment.' };
  }
}

export async function submitAssignmentAction(input: SubmitAssignmentInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const sub = await submitAssignment(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Assignment submitted successfully (${sub.status}).`, data: sub };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit assignment.' };
  }
}

export async function gradeAssignmentAction(input: GradeAssignmentInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const graded = await gradeAssignment(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Assignment graded: ${graded.scoreAwarded} points awarded.`, data: graded };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to grade assignment.' };
  }
}

export async function scheduleVirtualClassAction(input: ScheduleVirtualClassInput): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const vclass = await scheduleVirtualClass(session.schoolId, session, input);
    revalidatePath('/admin/lms');
    return { success: true, message: `Virtual class "${vclass.title}" scheduled via ${vclass.provider}.`, data: vclass };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to schedule virtual class.' };
  }
}

export async function recordVirtualClassAttendanceAction(sessionId: string, studentId: string): Promise<LmsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const res = await recordVirtualClassAttendance(session.schoolId, session, sessionId, studentId);
    revalidatePath('/admin/lms');
    return { success: true, message: 'Student attendance logged for live session.', data: res };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to record attendance.' };
  }
}
