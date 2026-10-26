'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import {
  logClinicVisit,
  createTransportRoute,
  assignStudentToBusRoute,
  requestExeatPass,
  reviewExeatPass,
  borrowBook,
  returnBook,
  createFixedAsset,
  reportMaintenanceTicket,
  resolveMaintenanceTicket,
  createPtaProject,
  recordPtaContribution,
} from '@/lib/auxiliary/auxiliary-store';
import {
  CreateClinicVisitInput,
  CreateTransportRouteInput,
  CreateExeatPassInput,
  CreateBookLoanInput,
  CreateFixedAssetInput,
  CreateMaintenanceTicketInput,
  CreatePtaProjectInput,
  RecordPtaContributionInput,
} from '@/lib/auxiliary/auxiliary-types';

export interface AuxiliaryActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export async function logClinicVisitAction(input: CreateClinicVisitInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const visit = await logClinicVisit(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    revalidatePath('/dashboard');
    return { success: true, message: `Clinic visit logged for ${visit.studentName}.`, data: visit };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to log clinic visit.' };
  }
}

export async function createTransportRouteAction(input: CreateTransportRouteInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const route = await createTransportRoute(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Transport route ${route.routeName} created.`, data: route };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create route.' };
  }
}

export async function assignStudentToBusRouteAction(routeId: string, studentId: string): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const route = await assignStudentToBusRoute(session.schoolId, session, routeId, studentId);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Student assigned to bus route.`, data: route };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to assign student to bus.' };
  }
}

export async function requestExeatPassAction(input: CreateExeatPassInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const exeat = await requestExeatPass(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Exeat pass requested with barcode ${exeat.gatePassBarcode}.`, data: exeat };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to request exeat pass.' };
  }
}

export async function reviewExeatPassAction(
  exeatId: string,
  status: 'APPROVED' | 'REJECTED' | 'CHECKED_OUT' | 'RETURNED',
  notes?: string
): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const exeat = await reviewExeatPass(session.schoolId, session, exeatId, status, notes || '');
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Exeat status updated to ${status}.`, data: exeat };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to review exeat pass.' };
  }
}

export async function borrowBookAction(input: CreateBookLoanInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const loan = await borrowBook(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Book "${loan.bookTitle}" borrowed by ${loan.borrowerName}.`, data: loan };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to borrow book.' };
  }
}

export async function returnBookAction(loanId: string): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const loan = await returnBook(session.schoolId, session, loanId);
    revalidatePath('/admin/auxiliary');
    return {
      success: true,
      message: `Book returned. Fine: ₦${loan.fineAmount.toLocaleString()}.`,
      data: loan,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to return book.' };
  }
}

export async function createFixedAssetAction(input: CreateFixedAssetInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const asset = await createFixedAsset(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Fixed asset ${asset.assetCode} registered.`, data: asset };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to register asset.' };
  }
}

export async function reportMaintenanceTicketAction(input: CreateMaintenanceTicketInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const ticket = await reportMaintenanceTicket(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Maintenance ticket opened for ${ticket.assetName}.`, data: ticket };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit maintenance ticket.' };
  }
}

export async function resolveMaintenanceTicketAction(
  assetId: string,
  ticketId: string,
  actualCost: number,
  resolutionNotes: string
): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const ticket = await resolveMaintenanceTicket(
      session.schoolId,
      session,
      assetId,
      ticketId,
      actualCost,
      resolutionNotes
    );
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `Maintenance ticket resolved successfully.`, data: ticket };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to resolve maintenance ticket.' };
  }
}

export async function createPtaProjectAction(input: CreatePtaProjectInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const project = await createPtaProject(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return { success: true, message: `PTA project "${project.title}" created.`, data: project };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create PTA project.' };
  }
}

export async function recordPtaContributionAction(input: RecordPtaContributionInput): Promise<AuxiliaryActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized: Active session required.' };

  try {
    const contribution = await recordPtaContribution(session.schoolId, session, input);
    revalidatePath('/admin/auxiliary');
    return {
      success: true,
      message: `PTA contribution of ₦${contribution.amount.toLocaleString()} recorded.`,
      data: contribution,
    };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to record PTA contribution.' };
  }
}
