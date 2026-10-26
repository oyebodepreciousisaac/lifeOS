'use server';

import { getSession } from '../../lib/auth/session';
import {
  listFeeItems,
  createFeeItem,
  getSiblingDiscountRule,
  updateSiblingDiscountRule,
  generateClassInvoices,
  getInvoice,
  listInvoices,
  getStudentLedger,
  recordPayment,
  initializeInvoicePaystackCheckout,
  requestPaymentReversal,
  executePaymentReversal,
  listReversalRequests,
  generateAgingDebtorsReport,
} from '../../lib/finance/finance-store';
import {
  FeeItem,
  SiblingDiscountRule,
  StudentInvoice,
  StudentLedgerEntry,
  PaymentRecord,
  PaymentReversalRequest,
  AgingDebtorsReport,
  RecordManualPaymentSchema,
} from '../../lib/finance/finance-types';

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
// Fee Schedules & Sibling Discount Actions
// ------------------------------------------------------------------------------

export async function listFeeItemsAction(
  termId?: string,
  sessionId?: string,
  classLevelId?: string
): Promise<ActionResponse<FeeItem[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const items = await listFeeItems(actor.schoolId, termId, sessionId, classLevelId);
    return { success: true, data: items };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list fee items.' };
  }
}

export async function createFeeItemAction(
  data: unknown
): Promise<ActionResponse<FeeItem>> {
  try {
    const actor = await getAuthenticatedActor();
    const item = await createFeeItem(actor.schoolId, data, actor);
    return { success: true, data: item };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Validation failed on fee item.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to create fee item.' };
  }
}

export async function getSiblingDiscountRuleAction(): Promise<ActionResponse<SiblingDiscountRule>> {
  try {
    const actor = await getAuthenticatedActor();
    const rule = await getSiblingDiscountRule(actor.schoolId);
    return { success: true, data: rule };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get sibling discount rule.' };
  }
}

export async function updateSiblingDiscountRuleAction(
  rule: SiblingDiscountRule
): Promise<ActionResponse<SiblingDiscountRule>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateSiblingDiscountRule(actor.schoolId, rule, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update sibling discount rule.' };
  }
}

// ------------------------------------------------------------------------------
// Invoicing Actions
// ------------------------------------------------------------------------------

export async function generateClassInvoicesAction(
  data: unknown
): Promise<ActionResponse<StudentInvoice[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const invoices = await generateClassInvoices(actor.schoolId, data, actor);
    return { success: true, data: invoices };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Invoice generation validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to generate class invoices.' };
  }
}

export async function getInvoiceAction(invoiceId: string): Promise<ActionResponse<StudentInvoice>> {
  try {
    const actor = await getAuthenticatedActor();
    const invoice = await getInvoice(actor.schoolId, invoiceId);
    return { success: true, data: invoice };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve invoice.' };
  }
}

export async function listInvoicesAction(filters?: {
  classArmId?: string;
  studentId?: string;
  status?: string;
  termId?: string;
}): Promise<ActionResponse<StudentInvoice[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const invoices = await listInvoices(actor.schoolId, filters);
    return { success: true, data: invoices };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list invoices.' };
  }
}

// ------------------------------------------------------------------------------
// Double-Entry Append-Only Ledger Actions (ADR-03)
// ------------------------------------------------------------------------------

export async function getStudentLedgerAction(
  studentId: string
): Promise<ActionResponse<{ entries: StudentLedgerEntry[]; currentBalance: number }>> {
  try {
    const actor = await getAuthenticatedActor();
    const ledger = await getStudentLedger(actor.schoolId, studentId);
    return { success: true, data: ledger };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve student ledger.' };
  }
}

// ------------------------------------------------------------------------------
// Payment Recording & Gateway Actions
// ------------------------------------------------------------------------------

export async function recordManualPaymentAction(
  data: unknown
): Promise<
  ActionResponse<{ payment: PaymentRecord; invoice: StudentInvoice; ledgerEntry: StudentLedgerEntry }>
> {
  try {
    const actor = await getAuthenticatedActor();
    const validated = RecordManualPaymentSchema.parse(data);

    const result = await recordPayment(
      actor.schoolId,
      {
        invoiceId: validated.invoiceId,
        amount: validated.amount,
        paymentMethod: validated.paymentMethod,
        channel: validated.channel,
        transactionReference: validated.transactionReference,
        metadata: { notes: validated.notes },
      },
      actor
    );

    return { success: true, data: result };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Payment validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to record payment.' };
  }
}

export async function initializePaystackCheckoutAction(
  invoiceId: string,
  customerEmail: string,
  callbackUrl?: string
): Promise<ActionResponse<{ authorizationUrl: string; reference: string }>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await initializeInvoicePaystackCheckout(
      actor.schoolId,
      invoiceId,
      customerEmail,
      callbackUrl
    );
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to initialize Paystack checkout.' };
  }
}

// ------------------------------------------------------------------------------
// Level 2 Maker-Checker Reversals & Refunds (ADR-04)
// ------------------------------------------------------------------------------

export async function requestPaymentReversalAction(
  paymentRecordId: string,
  reason: string
): Promise<ActionResponse<PaymentReversalRequest>> {
  try {
    const actor = await getAuthenticatedActor();
    const request = await requestPaymentReversal(actor.schoolId, paymentRecordId, reason, actor);
    return { success: true, data: request };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to request payment reversal.' };
  }
}

export async function executePaymentReversalAction(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionRemarks: string
): Promise<ActionResponse<PaymentReversalRequest>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await executePaymentReversal(
      actor.schoolId,
      requestId,
      decision,
      decisionRemarks,
      actor
    );
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to execute payment reversal.' };
  }
}

export async function listReversalRequestsAction(): Promise<
  ActionResponse<PaymentReversalRequest[]>
> {
  try {
    const actor = await getAuthenticatedActor();
    const list = await listReversalRequests(actor.schoolId, actor);
    return { success: true, data: list };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list reversal requests.' };
  }
}

// ------------------------------------------------------------------------------
// Aging Debtors Report Action
// ------------------------------------------------------------------------------

export async function getAgingDebtorsReportAction(
  asOfDate?: string
): Promise<ActionResponse<AgingDebtorsReport>> {
  try {
    const actor = await getAuthenticatedActor();
    const report = await generateAgingDebtorsReport(actor.schoolId, asOfDate);
    return { success: true, data: report };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to generate aging debtors report.' };
  }
}
