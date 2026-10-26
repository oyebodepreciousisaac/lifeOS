import { z } from 'zod';

/**
 * SchoolOS Assessment, Result Moderation, Cryptographic Locking & Report Card Types
 * Grounded in Playbook Chapters 7, 13, 16, 22 and docs/DEVELOPMENT-ROADMAP.md (Phase 8)
 */

// ------------------------------------------------------------------------------
// Enums & Domain Constants
// ------------------------------------------------------------------------------

export const RESULT_STATUS_VALUES = [
  'DRAFT',
  'SUBMITTED',
  'MODERATED',
  'APPROVED',
  'LOCKED',
] as const;
export type ResultStatus = (typeof RESULT_STATUS_VALUES)[number];

export const GRADE_LETTER_VALUES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type GradeLetter = (typeof GRADE_LETTER_VALUES)[number];

export const PROMOTION_DECISION_VALUES = [
  'PROMOTED',
  'PROMOTED_ON_TRIAL',
  'REPEAT',
  'WITHDRAWN',
] as const;
export type PromotionDecision = (typeof PROMOTION_DECISION_VALUES)[number];

export const CORRECTION_REQUEST_STATUS_VALUES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'EXECUTED',
] as const;
export type CorrectionRequestStatus =
  (typeof CORRECTION_REQUEST_STATUS_VALUES)[number];

// ------------------------------------------------------------------------------
// Grade Bands & Assessment Configuration
// ------------------------------------------------------------------------------

export interface GradeBand {
  grade: GradeLetter;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  description: string; // e.g. "Excellent / Distinction", "Credit", "Fail"
}

export const DEFAULT_NIGERIAN_GRADE_BANDS: GradeBand[] = [
  { grade: 'A', minScore: 75, maxScore: 100, gradePoint: 5.0, description: 'Excellent' },
  { grade: 'B', minScore: 65, maxScore: 74, gradePoint: 4.0, description: 'Very Good' },
  { grade: 'C', minScore: 50, maxScore: 64, gradePoint: 3.0, description: 'Good / Credit' },
  { grade: 'D', minScore: 45, maxScore: 49, gradePoint: 2.0, description: 'Fair / Pass' },
  { grade: 'E', minScore: 40, maxScore: 44, gradePoint: 1.0, description: 'Weak Pass' },
  { grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, description: 'Fail' },
];

export interface AssessmentWeightConfig {
  ca1Max: number; // default 20
  ca2Max: number; // default 20
  examMax: number; // default 60
  totalMax: number; // default 100
  passMark: number; // default 50
  gradeBands: GradeBand[];
}

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentWeightConfig = {
  ca1Max: 20,
  ca2Max: 20,
  examMax: 60,
  totalMax: 100,
  passMark: 50,
  gradeBands: DEFAULT_NIGERIAN_GRADE_BANDS,
};

// ------------------------------------------------------------------------------
// Score Entry Schemas & Interfaces
// ------------------------------------------------------------------------------

export const SubjectScoreEntrySchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  studentName: z.string().min(1, 'Student Name is required'),
  admissionNumber: z.string().min(1, 'Admission Number is required'),
  ca1Score: z.number().min(0).max(20).nullable().optional(),
  ca2Score: z.number().min(0).max(20).nullable().optional(),
  examScore: z.number().min(0).max(60).nullable().optional(),
  teacherComment: z.string().max(200).optional(),
});
export type SubjectScoreEntryInput = z.infer<typeof SubjectScoreEntrySchema>;

export interface SubjectScoreRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  ca1Score: number | null;
  ca2Score: number | null;
  examScore: number | null;
  totalScore: number | null;
  gradeLetter: GradeLetter | null;
  gradePoint: number | null;
  remark: string | null;
  positionInArm?: number;
  teacherComment?: string;
}

export const SaveSubjectScoresSchema = z.object({
  classArmId: z.string().min(1, 'Class Arm ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  termId: z.string().default('t1'),
  sessionId: z.string().default('ses_2026_2027'),
  scores: z.array(SubjectScoreEntrySchema),
});
export type SaveSubjectScoresInput = z.infer<typeof SaveSubjectScoresSchema>;

export interface ClassSubjectAssessmentSheet {
  id: string;
  schoolId: string;
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  termId: string;
  termName: string;
  sessionId: string;
  sessionName: string;
  status: ResultStatus;
  scores: SubjectScoreRecord[];
  submittedById?: string;
  submittedByName?: string;
  submittedAt?: string;
  moderatedById?: string;
  moderatedByName?: string;
  moderatedAt?: string;
  moderationRemarks?: string;
  lockedById?: string;
  lockedByName?: string;
  lockedAt?: string;
  lockedSealHash?: string; // HMAC-SHA256 seal
  stats: {
    totalEnrolled: number;
    totalSubmitted: number;
    missingCount: number;
    classAverage: number;
    highestScore: number;
    lowestScore: number;
    passCount: number;
    failCount: number;
  };
}

// ------------------------------------------------------------------------------
// Affective & Psychomotor Behavioral Domains (1 to 5 scale)
// ------------------------------------------------------------------------------

export interface AffectiveDomainRatings {
  punctuality: number; // 1 to 5
  neatness: number;
  politeness: number;
  honesty: number;
  peerRelationship: number;
  leadership: number;
  attentiveness: number;
}

export interface PsychomotorDomainRatings {
  handwriting: number; // 1 to 5
  sports: number;
  verbalFluency: number;
  musicalSkills: number;
  manualDexterity: number;
  drawingCraft: number;
}

export const DEFAULT_AFFECTIVE_RATINGS: AffectiveDomainRatings = {
  punctuality: 4,
  neatness: 4,
  politeness: 5,
  honesty: 4,
  peerRelationship: 4,
  leadership: 4,
  attentiveness: 4,
};

export const DEFAULT_PSYCHOMOTOR_RATINGS: PsychomotorDomainRatings = {
  handwriting: 4,
  sports: 4,
  verbalFluency: 4,
  musicalSkills: 3,
  manualDexterity: 4,
  drawingCraft: 3,
};

// ------------------------------------------------------------------------------
// Report Card & Promotion Types
// ------------------------------------------------------------------------------

export interface ReportCardSubjectItem {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  ca1Score: number | null;
  ca2Score: number | null;
  examScore: number | null;
  totalScore: number;
  gradeLetter: GradeLetter;
  gradePoint: number;
  classAverage: number;
  highestInClass: number;
  lowestInClass: number;
  positionInArm: number;
  remark: string;
  teacherComment?: string;
}

export interface StudentTermReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gender: string;
  passportPhotoUrl?: string;
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  termId: string;
  termName: string;
  sessionId: string;
  sessionName: string;
  subjects: ReportCardSubjectItem[];
  overallTotalScore: number;
  totalPossibleMarks: number;
  overallAverage: number;
  overallGradeLetter: GradeLetter;
  positionInArm: number;
  totalStudentsInArm: number;
  attendanceSummary: {
    totalSessions: number;
    sessionsPresent: number;
    sessionsLate: number;
    sessionsAbsent: number;
    attendanceRate: number;
  };
  affectiveRatings: AffectiveDomainRatings;
  psychomotorRatings: PsychomotorDomainRatings;
  formTeacherRemark: string;
  principalRemark: string;
  nextTermBegins: string;
  promotionDecision?: PromotionDecision;
  promotionComment?: string;
  isLocked: boolean;
  lockedAt?: string;
  verificationHash: string; // SHA-256 digital stamp
  verificationUrl: string;
  issuedAt: string;
}

// ------------------------------------------------------------------------------
// Post-Lock Correction Request (Maker-Checker Level 2)
// ------------------------------------------------------------------------------

export const RequestResultCorrectionSchema = z.object({
  sheetId: z.string().min(1, 'Assessment Sheet ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  component: z.enum(['ca1Score', 'ca2Score', 'examScore']),
  proposedScore: z.number().min(0).max(60),
  justification: z.string().min(10, 'Mandatory detailed justification required for locked result mutation (min 10 chars)'),
});
export type RequestResultCorrectionInput = z.infer<
  typeof RequestResultCorrectionSchema
>;

export interface ResultCorrectionRequest {
  id: string;
  schoolId: string;
  sheetId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  subjectName: string;
  component: 'ca1Score' | 'ca2Score' | 'examScore';
  oldScore: number;
  proposedScore: number;
  justification: string;
  status: CorrectionRequestStatus;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  decisionRemarks?: string;
}
