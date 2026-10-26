import { z } from 'zod';
import { UserRoleType } from '../auth/rbac';

/**
 * SchoolOS Maker-Checker Dual-Control Governance Engine
 * Grounded in Playbook Chapters 23, 36-37, 67 and Risk Register R3
 */

export type GovernanceRequestType =
  | 'SCORE_ALTERATION'
  | 'FEE_REVERSAL'
  | 'STUDENT_TRANSFER'
  | 'CURRICULUM_OVERRIDE'
  | 'DISCIPLINARY_RECORD';

export type GovernanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface DiffField {
  fieldName: string;
  fieldLabel: string;
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

export interface GovernanceRequest {
  id: string;
  schoolId: string;
  type: GovernanceRequestType;
  title: string;
  description: string;
  status: GovernanceStatus;
  
  // Maker metadata (Who created the request)
  makerId: string;
  makerName: string;
  makerRole: UserRoleType;
  makerEmail: string;
  makerReason: string;
  createdAt: string;

  // Checker metadata (Who reviewed/approved the request)
  checkerId?: string;
  checkerName?: string;
  checkerRole?: UserRoleType;
  checkerEmail?: string;
  reviewNotes?: string;
  reviewedAt?: string;

  // Target entity
  targetEntityId: string;
  targetEntityType: string;
  
  // Structured Before / After diff for visual verification
  diff: DiffField[];
  
  // Optional payload for automated execution
  executionPayload?: Record<string, unknown>;
  
  // Cryptographic audit proof
  auditProofHash?: string;
}

export const CreateGovernanceRequestSchema = z.object({
  type: z.enum([
    'SCORE_ALTERATION',
    'FEE_REVERSAL',
    'STUDENT_TRANSFER',
    'CURRICULUM_OVERRIDE',
    'DISCIPLINARY_RECORD',
  ]),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  makerReason: z.string().min(10, 'Mandatory maker justification required (minimum 10 chars)'),
  targetEntityId: z.string().min(1, 'Target entity ID required'),
  targetEntityType: z.string().min(1, 'Target entity type required'),
  diff: z.array(
    z.object({
      fieldName: z.string(),
      fieldLabel: z.string(),
      oldValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
      newValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
    })
  ).min(1, 'At least one field diff must be provided'),
  executionPayload: z.record(z.unknown()).optional(),
});

export type CreateGovernanceRequestInput = z.infer<typeof CreateGovernanceRequestSchema>;

export const ReviewGovernanceRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  action: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().min(5, 'Mandatory review notes required (minimum 5 chars)'),
  reAuthCode: z.string().optional(),
});

export type ReviewGovernanceRequestInput = z.infer<typeof ReviewGovernanceRequestSchema>;

export interface GovernanceMetrics {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgResolutionTimeHours: number;
}
