'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  createGovernanceRequest,
  reviewGovernanceRequest,
  getGovernanceRequests,
  getGovernanceMetrics,
} from '@/lib/governance/governance-store';
import {
  CreateGovernanceRequestInput,
  ReviewGovernanceRequestInput,
  GovernanceRequestType,
  GovernanceStatus,
} from '@/lib/governance/governance-types';

export interface GovernanceActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function createGovernanceRequestAction(
  input: CreateGovernanceRequestInput
): Promise<GovernanceActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const request = await createGovernanceRequest(session.schoolId, session, input);
    revalidatePath('/admin/governance');
    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Governance request [${request.title}] submitted successfully for Level 2 review.`,
      data: request,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to submit governance request.';
    return { success: false, error: errorMsg };
  }
}

export async function reviewGovernanceRequestAction(
  input: ReviewGovernanceRequestInput
): Promise<GovernanceActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const reviewed = await reviewGovernanceRequest(session.schoolId, session, input);
    revalidatePath('/admin/governance');
    revalidatePath('/dashboard');
    revalidatePath('/admin/assessments');
    revalidatePath('/admin/finance');
    return {
      success: true,
      message: `Governance request [${reviewed.title}] marked as [${reviewed.status}].`,
      data: reviewed,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to review governance request.';
    return { success: false, error: errorMsg };
  }
}

export async function getGovernanceRequestsAction(filters?: {
  status?: GovernanceStatus;
  type?: GovernanceRequestType;
}) {
  const session = await getSession();
  if (!session) {
    return [];
  }
  return getGovernanceRequests(session.schoolId, session, filters);
}

export async function getGovernanceMetricsAction() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return getGovernanceMetrics(session.schoolId, session);
}
