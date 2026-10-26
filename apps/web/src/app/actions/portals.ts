'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  getParentPortalData,
  getTeacherPortalData,
  getStudentPortalData,
} from '@/lib/portals/portal-service';
import { initializeInvoicePaystackCheckout } from '@/lib/finance/finance-store';

export interface PortalActionResult<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export async function getParentPortalDataAction(selectedStudentId?: string) {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return getParentPortalData(session.schoolId, session, selectedStudentId);
}

export async function getTeacherPortalDataAction() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return getTeacherPortalData(session.schoolId, session);
}

export async function getStudentPortalDataAction() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return getStudentPortalData(session.schoolId, session);
}

export async function submitParentPaystackPaymentAction(
  invoiceId: string,
  amount: number,
  studentId: string
): Promise<PortalActionResult<{ authorizationUrl: string; reference: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Session required for payment checkout.' };
  }

  try {
    const checkout = await initializeInvoicePaystackCheckout(
      session.schoolId,
      invoiceId,
      session.email
    );

    revalidatePath('/portal/parent');
    return {
      success: true,
      message: 'Paystack checkout session created.',
      data: {
        authorizationUrl: checkout.authorizationUrl,
        reference: checkout.reference,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to initialize Paystack checkout.';
    return { success: false, error: errorMsg };
  }
}
