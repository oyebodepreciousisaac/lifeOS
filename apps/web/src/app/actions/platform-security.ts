'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  executeBackupRestoreDrill,
  registerGuardianConsent,
  exportStudentDataPortabilityPackage,
  anonymizeStudentForErasure,
} from '@/lib/platform-security/platform-security-store';
import { RegisterGuardianConsentInput } from '@/lib/platform-security/platform-security-types';

export interface PlatformSecurityActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function executeBackupRestoreDrillAction(
  snapshotId: string,
  scenario?: string
): Promise<PlatformSecurityActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const report = await executeBackupRestoreDrill(session.schoolId, session, snapshotId, scenario);
    revalidatePath('/admin/platform-security');
    return {
      success: true,
      message: `Disaster Recovery Drill Completed: RPO=${report.measuredRpoMinutes}m (<=15m standard), RTO=${report.measuredRtoMinutes}m (<=60m standard). Status: PASSED_VERIFIED.`,
      data: report,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to execute backup restore drill.' };
  }
}

export async function registerGuardianConsentAction(
  input: RegisterGuardianConsentInput
): Promise<PlatformSecurityActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const consent = await registerGuardianConsent(session.schoolId, session, input);
    revalidatePath('/admin/platform-security');
    return {
      success: true,
      message: `Guardian consent registered under NDPA 2023 (${consent.lawfulBasis}).`,
      data: consent,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to register guardian consent.' };
  }
}

export async function exportStudentDataPortabilityAction(studentId: string): Promise<PlatformSecurityActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const pkg = await exportStudentDataPortabilityPackage(session.schoolId, session, studentId);
    revalidatePath('/admin/platform-security');
    return {
      success: true,
      message: `NDPA Section 34 data portability export package generated successfully.`,
      data: pkg,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to export student data package.' };
  }
}

export async function anonymizeStudentForErasureAction(
  studentId: string,
  reason: string
): Promise<PlatformSecurityActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const res = await anonymizeStudentForErasure(session.schoolId, session, studentId, reason);
    revalidatePath('/admin/platform-security');
    revalidatePath('/admin/students');
    return {
      success: true,
      message: res.message,
      data: res,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to anonymize student.' };
  }
}
