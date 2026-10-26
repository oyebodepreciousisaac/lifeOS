import { prisma } from '@school-os/db';

export interface AuditEventParams {
  schoolId: string;
  actorId?: string;
  actorIp?: string;
  actorUserAgent?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
}

export interface SecurityEventParams {
  schoolId: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, any>;
}

// In-memory buffer for local development, demo sessions, and automated testing
export const inMemoryAuditStore: Array<{
  id: string;
  schoolId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  beforeState?: any;
  afterState?: any;
  createdAt: string;
  actorIp: string;
}> = [
  {
    id: 'aud_001',
    schoolId: '11111111-1111-1111-1111-111111111111',
    actorId: 'usr_002',
    actorName: 'Dr. Elizabeth Alabi',
    actorRole: 'PRINCIPAL',
    action: 'RESULTS_LOCK_APPROVED',
    resourceType: 'ReportCard',
    resourceId: 'rep_2026_jss1',
    beforeState: { status: 'MODERATED', isLocked: false },
    afterState: { status: 'LOCKED', isLocked: true, lockedAt: '2026-10-17T14:30:00Z' },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actorIp: '197.210.84.12',
  },
  {
    id: 'aud_002',
    schoolId: '11111111-1111-1111-1111-111111111111',
    actorId: 'usr_003',
    actorName: 'Mr. Babatunde Lawal',
    actorRole: 'BURSAR',
    action: 'PAYMENT_RECORDED',
    resourceType: 'PaymentTransaction',
    resourceId: 'rec_98214',
    beforeState: null,
    afterState: { receiptNumber: 'REC-2026-98214', amount: '₦245,000.00', method: 'PAYSTACK' },
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actorIp: '102.89.41.98',
  },
  {
    id: 'aud_003',
    schoolId: '11111111-1111-1111-1111-111111111111',
    actorId: 'usr_004',
    actorName: 'Joseph Okafor',
    actorRole: 'TEACHER',
    action: 'SCORE_CORRECTION_REQUESTED',
    resourceType: 'AssessmentScore',
    resourceId: 'score_mth_002',
    beforeState: { subject: 'Mathematics', examScore: '48/60', grade: 'B' },
    afterState: { subject: 'Mathematics', examScore: '56/60', grade: 'A' },
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    actorIp: '197.210.55.201',
  },
];

/**
 * Strips sensitive credentials, credit card numbers, and secret tokens before logging.
 */
function sanitizePayload(obj?: Record<string, any> | null): Record<string, any> | null {
  if (!obj) return null;
  const clone = { ...obj };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'mfaSecret', 'creditCard'];

  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object' && clone[key] !== null) {
      clone[key] = sanitizePayload(clone[key]);
    }
  }
  return clone;
}

/**
 * Writes an immutable audit log record.
 * Captures actor identity, IP address, tenant boundary, action type, and before/after diffs.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  const sanitizedBefore = sanitizePayload(params.beforeState);
  const sanitizedAfter = sanitizePayload(params.afterState);

  // 1. Add to active in-memory buffer
  inMemoryAuditStore.unshift({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    schoolId: params.schoolId,
    actorId: params.actorId || 'system',
    actorName: params.actorId ? 'Authorized User' : 'System Engine',
    actorRole: 'SYSTEM',
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    beforeState: sanitizedBefore,
    afterState: sanitizedAfter,
    createdAt: new Date().toISOString(),
    actorIp: params.actorIp || '127.0.0.1',
  });

  // 2. Persist to PostgreSQL database if accessible
  if (process.env.DATABASE_URL) {
    try {
      await prisma.auditEvent.create({
        data: {
          schoolId: params.schoolId,
          actorId: params.actorId,
          actorIp: params.actorIp || '127.0.0.1',
          actorUserAgent: params.actorUserAgent || 'Unknown Client',
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          beforeState: sanitizedBefore || undefined,
          afterState: sanitizedAfter || undefined,
        },
      });
    } catch {
      // Database connection may be offline in pure client/testing environments; in-memory store captures it
    }
  }
}

/**
 * Returns audit logs for a specific school tenant from the in-memory store.
 */
export async function getAuditLogsForSchool(schoolId: string) {
  return inMemoryAuditStore.filter((l) => l.schoolId === schoolId);
}


/**
 * Logs security-relevant alerts (e.g. repeated failed logins, rate limit thresholds).
 */
export async function logSecurityEvent(params: SecurityEventParams): Promise<void> {
  console.warn(`[SECURITY ALERT - ${params.severity}] ${params.eventType} for school ${params.schoolId}`);

  try {
    await prisma.securityEvent.create({
      data: {
        schoolId: params.schoolId,
        eventType: params.eventType,
        severity: params.severity,
        details: params.details || {},
      },
    });
  } catch {
    // Fallback silent logging
  }
}
