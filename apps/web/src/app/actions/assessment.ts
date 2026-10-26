'use server';

import { getSession } from '../../lib/auth/session';
import {
  getClassSubjectScoreSheet,
  saveSubjectScores,
  submitScoresForModeration,
  moderateSubjectScores,
  approveAndCryptographicallyLockScores,
  requestLockedScoreCorrection,
  executeLockedScoreCorrection,
  compileClassReportCards,
  listClassReportCards,
  evaluateStudentPromotion,
  verifyReportCardHash,
  listCorrectionRequests,
} from '../../lib/assessment/assessment-store';
import {
  ClassSubjectAssessmentSheet,
  StudentTermReportCard,
  ResultCorrectionRequest,
  PromotionDecision,
} from '../../lib/assessment/assessment-types';

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthenticatedActor() {
  const session = await getSession();
  if (!session) {
    throw new Error('401 Unauthorized: Please log in to perform this operation.');
  }
  return session;
}

// ------------------------------------------------------------------------------
// Assessment Score Sheet Actions
// ------------------------------------------------------------------------------

export async function getClassSubjectScoreSheetAction(
  classArmId: string,
  subjectId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027'
): Promise<ActionResponse<ClassSubjectAssessmentSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await getClassSubjectScoreSheet(
      actor.schoolId,
      classArmId,
      subjectId,
      termId,
      sessionId,
      actor
    );
    return { success: true, data: sheet };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve subject assessment sheet.' };
  }
}

export async function saveSubjectScoresAction(
  data: unknown
): Promise<ActionResponse<ClassSubjectAssessmentSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await saveSubjectScores(actor.schoolId, data, actor);
    return { success: true, data: sheet };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Validation failed on score entry.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to save subject scores.' };
  }
}

export async function submitScoresForModerationAction(
  sheetId: string
): Promise<ActionResponse<ClassSubjectAssessmentSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await submitScoresForModeration(actor.schoolId, sheetId, actor);
    return { success: true, data: sheet };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit scores for moderation.' };
  }
}

export async function moderateSubjectScoresAction(
  sheetId: string,
  moderationRemarks: string
): Promise<ActionResponse<ClassSubjectAssessmentSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await moderateSubjectScores(actor.schoolId, sheetId, moderationRemarks, actor);
    return { success: true, data: sheet };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to moderate subject scores.' };
  }
}

export async function approveAndCryptographicallyLockScoresAction(
  sheetId: string
): Promise<ActionResponse<ClassSubjectAssessmentSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await approveAndCryptographicallyLockScores(actor.schoolId, sheetId, actor);
    return { success: true, data: sheet };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to cryptographically seal scores.' };
  }
}

// ------------------------------------------------------------------------------
// Post-Lock Correction Maker-Checker Actions
// ------------------------------------------------------------------------------

export async function requestLockedScoreCorrectionAction(
  data: unknown
): Promise<ActionResponse<ResultCorrectionRequest>> {
  try {
    const actor = await getAuthenticatedActor();
    const request = await requestLockedScoreCorrection(actor.schoolId, data, actor);
    return { success: true, data: request };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Correction request validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to request score correction.' };
  }
}

export async function executeLockedScoreCorrectionAction(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionRemarks: string
): Promise<ActionResponse<ResultCorrectionRequest>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await executeLockedScoreCorrection(
      actor.schoolId,
      requestId,
      decision,
      decisionRemarks,
      actor
    );
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to execute score correction.' };
  }
}

export async function listCorrectionRequestsAction(
  sheetId?: string
): Promise<ActionResponse<ResultCorrectionRequest[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const requests = await listCorrectionRequests(actor.schoolId, sheetId, actor);
    return { success: true, data: requests };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list correction requests.' };
  }
}

// ------------------------------------------------------------------------------
// Report Card & Promotion Actions
// ------------------------------------------------------------------------------

export async function listClassReportCardsAction(
  classArmId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027'
): Promise<ActionResponse<StudentTermReportCard[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const cards = await listClassReportCards(actor.schoolId, classArmId, termId, sessionId, actor);
    return { success: true, data: cards };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve report cards.' };
  }
}

export async function compileClassReportCardsAction(
  classArmId: string,
  termId: string = 't1',
  sessionId: string = 'ses_2026_2027'
): Promise<ActionResponse<StudentTermReportCard[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const cards = await compileClassReportCards(actor.schoolId, classArmId, termId, sessionId, actor);
    return { success: true, data: cards };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to compile report cards.' };
  }
}

export async function evaluateStudentPromotionAction(
  studentId: string,
  sessionId: string = 'ses_2026_2027'
): Promise<
  ActionResponse<{
    decision: PromotionDecision;
    overallAverage: number;
    totalSubjects: number;
    passedSubjects: number;
    passedEnglish: boolean;
    passedMath: boolean;
    rationale: string;
  }>
> {
  try {
    const actor = await getAuthenticatedActor();
    const evaluation = await evaluateStudentPromotion(actor.schoolId, studentId, sessionId, actor);
    return { success: true, data: evaluation };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to evaluate student promotion.' };
  }
}

export async function verifyReportCardHashAction(
  hash: string
): Promise<
  ActionResponse<{
    isValid: boolean;
    reportCard?: StudentTermReportCard;
    verifiedAt: string;
  }>
> {
  try {
    const result = await verifyReportCardHash(hash);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to verify report card hash.' };
  }
}
