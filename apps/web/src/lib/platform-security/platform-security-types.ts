import { z } from 'zod';

/**
 * SchoolOS Platform Administration, Security Hardening, Backup Drills & NDPA 2023 Types
 * Phase 15 (Playbook pp. 4, 15, 38-42, 52-59, 68)
 */

// ------------------------------------------------------------------------------
// 1. Disaster Recovery & Backup Drills (Playbook p. 41-42)
// ------------------------------------------------------------------------------

export type BackupType = 'WAL_CONTINUOUS' | 'DAILY_ENCRYPTED_SNAPSHOT' | 'WEEKLY_COLD_ARCHIVE';
export type RestoreStatus = 'PASSED_VERIFIED' | 'FAILED_CORRUPT' | 'IN_PROGRESS';

export interface DatabaseSnapshot {
  id: string;
  schoolId: string;
  backupType: BackupType;
  timestamp: string;
  fileSizeBytes: number;
  checksumSha256: string;
  storageTier: 'ISOLATED_WORM_S3' | 'LOCAL_VAULT';
  encryptionAlgorithm: 'AES-256-GCM';
  verified: boolean;
  totalRecordsCount: number;
}

export interface BackupRestoreDrillReport {
  drillId: string;
  schoolId: string;
  snapshotId: string;
  executedAt: string;
  executedBy: string;
  simulatedFailureScenario: string;
  measuredRpoMinutes: number; // Must be <= 15 min per Playbook p. 41
  measuredRtoMinutes: number; // Must be <= 60 min per Playbook p. 41
  recordsRestored: {
    students: number;
    ledgerEntries: number;
    assessmentResults: number;
    auditLogs: number;
  };
  integrityVerification: {
    checksumMatch: boolean;
    foreignKeysIntact: boolean;
    doubleEntryLedgerBalanced: boolean;
  };
  status: RestoreStatus;
  complianceSignOff: string;
}

// ------------------------------------------------------------------------------
// 2. NDPA 2023 Compliance & Data Subject Rights (Playbook p. 4, 40)
// ------------------------------------------------------------------------------

export type LawfulProcessingBasis =
  | 'CONTRACTUAL_OBLIGATION'
  | 'LEGAL_OBLIGATION'
  | 'EXPLICIT_GUARDIAN_CONSENT'
  | 'VITAL_INTERESTS';

export interface GuardianConsentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  guardianName: string;
  guardianPhone: string;
  lawfulBasis: LawfulProcessingBasis;
  consentTimestamp: string;
  ipAddress: string;
  consentedPurposes: string[];
  withdrawn: boolean;
  withdrawnAt?: string;
}

export const RegisterGuardianConsentSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  guardianName: z.string().min(2, 'Guardian name required'),
  guardianPhone: z.string().min(10, 'Guardian phone required'),
  lawfulBasis: z.enum([
    'CONTRACTUAL_OBLIGATION',
    'LEGAL_OBLIGATION',
    'EXPLICIT_GUARDIAN_CONSENT',
    'VITAL_INTERESTS',
  ]),
  consentedPurposes: z.array(z.string()).min(1, 'At least one purpose required'),
});

export type RegisterGuardianConsentInput = z.infer<typeof RegisterGuardianConsentSchema>;

export interface StudentDataPortabilityPackage {
  exportMetadata: {
    exportId: string;
    schoolId: string;
    studentId: string;
    generatedAt: string;
    formatVersion: 'NDPA-2023-V1';
    statutoryNotice: string;
  };
  studentBiodata: Record<string, any>;
  attendanceSummary: {
    totalSessions: number;
    presentSessions: number;
    attendanceRatePercent: number;
  };
  academicResults: Array<Record<string, any>>;
  financialStatement: {
    totalDebits: number;
    totalCredits: number;
    netBalance: number;
    ledgerTransactions: Array<Record<string, any>>;
  };
  auditTrailEventsCount: number;
}

// ------------------------------------------------------------------------------
// 3. SaaS Multi-Tenancy & Platform Administration (Playbook p. 43, 64)
// ------------------------------------------------------------------------------

export type TenantPlan = 'STARTER' | 'STANDARD' | 'ENTERPRISE';
export type TenantLifecycleStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'ARCHIVED';

export interface PlatformTenant {
  schoolId: string;
  slug: string;
  legalName: string;
  contactEmail: string;
  plan: TenantPlan;
  status: TenantLifecycleStatus;
  maxStudentsQuota: number;
  maxStorageGbQuota: number;
  featuresEnabled: string[];
  mfaEnforced: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface PlatformHealthMetrics {
  totalTenantsCount: number;
  activeTenantsCount: number;
  totalStudentsEnrolled: number;
  totalTransactionsProcessed: number;
  averageApiResponseLatencyMs: number;
  lastBackupDrillTimestamp: string;
  backupReadinessScorePercent: number;
  ndpaComplianceScorePercent: number;
}
