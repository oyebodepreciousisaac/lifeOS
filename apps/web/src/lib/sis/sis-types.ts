import { z } from 'zod';

/**
 * SchoolOS Student Information System (SIS) & Admissions Types
 * Grounded in Playbook Chapters 7, 9, 12, 13, 21, 26 and docs/PRODUCT-REQUIREMENTS.md
 */

// ------------------------------------------------------------------------------
// Enums & Domain Constants
// ------------------------------------------------------------------------------

export const GENDER_VALUES = ['MALE', 'FEMALE'] as const;
export type Gender = (typeof GENDER_VALUES)[number];

export const STUDENT_STATUS_VALUES = [
  'ACTIVE',
  'SUSPENDED',
  'EXPELLED',
  'TRANSFERRED',
  'GRADUATED',
  'WITHDRAWN',
] as const;
export type StudentStatus = (typeof STUDENT_STATUS_VALUES)[number];

export const GUARDIAN_RELATIONSHIP_VALUES = [
  'FATHER',
  'MOTHER',
  'GUARDIAN',
  'SPONSOR',
] as const;
export type GuardianRelationship = (typeof GUARDIAN_RELATIONSHIP_VALUES)[number];

export const APPLICATION_STATUS_VALUES = [
  'SUBMITTED',
  'EXAM_SCHEDULED',
  'SCORED',
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'ENROLLED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export const BLOOD_GROUP_VALUES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'UNKNOWN',
] as const;

export const GENOTYPE_VALUES = ['AA', 'AS', 'SS', 'AC', 'UNKNOWN'] as const;

// ------------------------------------------------------------------------------
// Zod Schemas
// ------------------------------------------------------------------------------

export const GuardianInfoSchema = z.object({
  firstName: z.string().min(1, 'Guardian first name is required'),
  lastName: z.string().min(1, 'Guardian last name is required'),
  relationship: z.enum(GUARDIAN_RELATIONSHIP_VALUES),
  phonePrimary: z.string().min(7, 'Valid primary phone number is required'),
  phoneSecondary: z.string().optional(),
  email: z.string().email('Valid guardian email is required'),
  residentialAddress: z.string().optional(),
  occupation: z.string().optional(),
  isPrimaryContact: z.boolean().default(true),
  isBillingRecipient: z.boolean().default(true),
  hasCustody: z.boolean().default(true),
});

export type GuardianInfo = z.infer<typeof GuardianInfoSchema>;

export const ApplicationSubmissionSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  gender: z.enum(GENDER_VALUES),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  appliedClassLevelId: z.string().min(1, 'Target class level is required'),
  campusId: z.string().min(1, 'Campus is required'),
  stateOfOrigin: z.string().optional(),
  lga: z.string().optional(),
  nationality: z.string().default('Nigerian'),
  residentialAddress: z.string().optional(),
  allergies: z.string().optional(),
  previousSchoolName: z.string().optional(),
  previousSchoolClass: z.string().optional(),
  guardian: GuardianInfoSchema,
});

export type ApplicationSubmissionInput = z.infer<
  typeof ApplicationSubmissionSchema
>;

export const ApplicationScoringSchema = z.object({
  examScore: z.number().min(0).max(100, 'Exam score must be between 0 and 100'),
  interviewScore: z
    .number()
    .min(0)
    .max(100, 'Interview score must be between 0 and 100'),
  reviewerRemarks: z.string().min(3, 'Reviewer remarks are required'),
});

export type ApplicationScoringInput = z.infer<typeof ApplicationScoringSchema>;

export const OfferLetterSchema = z.object({
  tuitionDeposit: z.number().min(0, 'Deposit cannot be negative'),
  acceptanceDeadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be YYYY-MM-DD'),
  conditionalNotes: z.string().optional(),
});

export type OfferLetterInput = z.infer<typeof OfferLetterSchema>;

export const StudentConversionSchema = z.object({
  classArmId: z.string().min(1, 'Target class arm is required'),
  termId: z.string().min(1, 'Academic term is required'),
  admissionNumberPrefix: z.string().optional(),
});

export type StudentConversionInput = z.infer<typeof StudentConversionSchema>;

export const StudentProfileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  bloodGroup: z.enum(BLOOD_GROUP_VALUES).optional(),
  genotype: z.enum(GENOTYPE_VALUES).optional(),
  allergies: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  lga: z.string().optional(),
  nationality: z.string().optional(),
  status: z.enum(STUDENT_STATUS_VALUES).optional(),
});

export type StudentProfileUpdateInput = z.infer<
  typeof StudentProfileUpdateSchema
>;

export const ArmTransferSchema = z.object({
  newClassArmId: z.string().min(1, 'Target class arm is required'),
  termId: z.string().min(1, 'Term is required'),
  reason: z.string().min(3, 'Transfer reason is required'),
});

export type ArmTransferInput = z.infer<typeof ArmTransferSchema>;

// ------------------------------------------------------------------------------
// Domain Interfaces
// ------------------------------------------------------------------------------

export interface AdmissionApplication {
  id: string;
  schoolId: string;
  applicationNumber: string; // e.g. "APP/2026/001"
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  stateOfOrigin?: string;
  lga?: string;
  nationality: string;
  residentialAddress?: string;
  allergies?: string;
  appliedClassLevelId: string;
  appliedClassLevelName: string;
  campusId: string;
  previousSchoolName?: string;
  previousSchoolClass?: string;
  guardian: GuardianInfo;
  status: ApplicationStatus;
  examScore?: number;
  interviewScore?: number;
  totalScore?: number;
  reviewerRemarks?: string;
  scoredAt?: string;
  scoredBy?: string;
  offerLetter?: {
    offerDate: string;
    tuitionDeposit: number;
    acceptanceDeadline: string;
    conditionalNotes?: string;
    signedBy: string;
  };
  enrolledStudentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianRecord {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email: string;
  residentialAddress?: string;
  occupation?: string;
  createdAt: string;
}

export interface GuardianLink {
  guardianId: string;
  studentId: string;
  relationship: GuardianRelationship;
  isPrimaryContact: boolean;
  isBillingRecipient: boolean;
  hasCustody: boolean;
  guardian: GuardianRecord;
}

export interface EnrollmentHistoryRecord {
  id: string;
  schoolId: string;
  studentId: string;
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  termId: string;
  termName: string;
  sessionId: string;
  sessionName: string;
  enrollmentStatus: 'ACTIVE' | 'PROMOTED' | 'REPEATING' | 'TRANSFERRED' | 'WITHDRAWN';
  assignedAt: string;
  transferReason?: string;
}

export interface StudentRecord {
  id: string;
  schoolId: string;
  admissionNumber: string; // Stable institutional ID, e.g. "KCL/2026/001"
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  stateOfOrigin?: string;
  lga?: string;
  nationality: string;
  passportPhotoUrl?: string;
  status: StudentStatus;
  currentClassLevelId: string;
  currentClassLevelName: string;
  currentClassArmId: string;
  currentClassArmName: string;
  currentCampusId: string;
  guardians: GuardianLink[];
  enrollmentHistory: EnrollmentHistoryRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchImportRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: string;
  dateOfBirth: string;
  classLevelName: string;
  classArmName: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  stateOfOrigin?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  admissionNumber?: string;
}

export interface BatchImportQuarantine {
  rowNumber: number;
  rowData: Partial<BatchImportRow>;
  errors: string[];
}

export interface BatchImportResult {
  totalProcessed: number;
  successfullyImported: number;
  quarantinedCount: number;
  importedStudents: StudentRecord[];
  quarantinedRows: BatchImportQuarantine[];
}

export interface SisDashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  maleCount: number;
  femaleCount: number;
  bySection: {
    earlyYears: number;
    primary: number;
    juniorSecondary: number;
    seniorSecondary: number;
  };
  admissionsFunnel: {
    totalApplications: number;
    submitted: number;
    scored: number;
    offered: number;
    accepted: number;
    enrolled: number;
  };
}
