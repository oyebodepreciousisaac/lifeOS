import { z } from 'zod';

/**
 * SchoolOS Finance, Payments, Invoicing & Append-Only Ledger Types
 * Grounded in Playbook Chapters 8, 14, 18, 23, 24, 44 and docs/DEVELOPMENT-ROADMAP.md (Phase 6)
 */

// ------------------------------------------------------------------------------
// Enums & Domain Constants
// ------------------------------------------------------------------------------

export const FEE_CATEGORY_VALUES = [
  'TUITION',
  'BOARDING',
  'TRANSPORT',
  'UNIFORM',
  'BOOKS',
  'PTA_LEVY',
  'LAB_SCIENCE',
  'ICT_STEM',
  'EXAMINATION',
  'DEVELOPMENT_LEVY',
  'OTHER',
] as const;
export type FeeCategory = (typeof FEE_CATEGORY_VALUES)[number];

export const INVOICE_STATUS_VALUES = [
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUS_VALUES)[number];

export const LEDGER_ENTRY_TYPE_VALUES = ['DEBIT', 'CREDIT'] as const;
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPE_VALUES)[number];

export const LEDGER_CATEGORY_VALUES = [
  'INVOICE_CHARGE',
  'PAYMENT_PAYSTACK',
  'PAYMENT_FLUTTERWAVE',
  'PAYMENT_BANK_TRANSFER',
  'PAYMENT_CASH',
  'PAYMENT_POS',
  'WAIVER_DISCOUNT',
  'REVERSAL_REFUND',
  'ADJUSTMENT',
] as const;
export type LedgerCategory = (typeof LEDGER_CATEGORY_VALUES)[number];

export const PAYMENT_METHOD_VALUES = [
  'PAYSTACK',
  'FLUTTERWAVE',
  'BANK_TRANSFER',
  'CASH',
  'POS',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const REVERSAL_STATUS_VALUES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
] as const;
export type ReversalStatus = (typeof REVERSAL_STATUS_VALUES)[number];

// ------------------------------------------------------------------------------
// Fee Structure & Sibling Discount
// ------------------------------------------------------------------------------

export interface FeeItem {
  id: string;
  schoolId: string;
  name: string;
  category: FeeCategory;
  amount: number; // in Naira (NGN)
  isCompulsory: boolean;
  applicableClassLevelIds: string[]; // empty array = all classes
  termId: string; // 't1', 't2', 't3' or 'ALL'
  sessionId: string;
  description?: string;
}

export interface SiblingDiscountRule {
  enabled: boolean;
  secondChildPercent: number; // e.g. 10%
  thirdAndSubsequentPercent: number; // e.g. 15%
  applicableCategory: FeeCategory; // typically 'TUITION'
}

export const DEFAULT_SIBLING_DISCOUNT_RULE: SiblingDiscountRule = {
  enabled: true,
  secondChildPercent: 10,
  thirdAndSubsequentPercent: 15,
  applicableCategory: 'TUITION',
};

// ------------------------------------------------------------------------------
// Invoicing & Line Items
// ------------------------------------------------------------------------------

export interface InvoiceLineItem {
  id: string;
  feeItemId: string;
  name: string;
  category: FeeCategory;
  unitAmount: number;
  discountAmount: number;
  discountReason?: string;
  netAmount: number;
}

export interface StudentInvoice {
  id: string; // e.g. INV-2026-0001
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  guardianId: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  termId: string;
  termName: string;
  sessionId: string;
  sessionName: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineItem[];
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paystackPaymentReference?: string;
  receiptNumbers: string[];
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Double-Entry Append-Only Ledger Entry (ADR-03)
// ------------------------------------------------------------------------------

export interface StudentLedgerEntry {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  entryType: LedgerEntryType; // DEBIT increases debt; CREDIT decreases debt
  category: LedgerCategory;
  amount: number;
  runningBalance: number; // Derived dynamically: sum(DEBIT) - sum(CREDIT)
  referenceId: string; // Invoice ID or Payment Gateway Transaction Reference
  description: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ------------------------------------------------------------------------------
// Payment Records & Receipts
// ------------------------------------------------------------------------------

export interface PaymentRecord {
  id: string;
  schoolId: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  channel: string; // 'card', 'bank_transfer', 'ussd', 'cash'
  transactionReference: string; // internal unique reference e.g. TX-KC-173829
  gatewayReference?: string; // Paystack reference e.g. T1928374
  receiptNumber: string; // REC-2026-0001
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paidAt: string;
  recordedById: string;
  recordedByName: string;
  metadata?: Record<string, any>;
}

// ------------------------------------------------------------------------------
// Level 2 Maker-Checker Reversals & Refunds (ADR-04)
// ------------------------------------------------------------------------------

export interface PaymentReversalRequest {
  id: string;
  schoolId: string;
  paymentRecordId: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  amount: number;
  reason: string;
  status: ReversalStatus;
  requesterId: string;
  requesterName: string;
  requestedAt: string;
  approverId?: string;
  approverName?: string;
  decisionRemarks?: string;
  decidedAt?: string;
}

// ------------------------------------------------------------------------------
// Aging Debtors Analytics Report
// ------------------------------------------------------------------------------

export interface ClassDebtorAggregate {
  classArmId: string;
  classArmName: string;
  debtorCount: number;
  totalOwed: number;
}

export interface StudentDebtorRecord {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classArmName: string;
  guardianName: string;
  guardianPhone: string;
  totalOwed: number;
  daysOverdue: number;
  invoiceId: string;
}

export interface AgingDebtorsReport {
  schoolId: string;
  asOfDate: string;
  totalOutstanding: number;
  current0to30Days: number;
  aging31to60Days: number;
  aging61to90Days: number;
  aging90DaysPlus: number;
  debtorCount: number;
  classBreakdown: ClassDebtorAggregate[];
  topDebtors: StudentDebtorRecord[];
}

// ------------------------------------------------------------------------------
// Zod Validation Schemas
// ------------------------------------------------------------------------------

export const CreateFeeItemSchema = z.object({
  name: z.string().min(2, 'Fee item name must be at least 2 characters'),
  category: z.enum(FEE_CATEGORY_VALUES),
  amount: z.number().positive('Fee amount must be greater than 0'),
  isCompulsory: z.boolean().default(true),
  applicableClassLevelIds: z.array(z.string()).default([]),
  termId: z.string().default('t1'),
  sessionId: z.string().default('ses_2026_2027'),
  description: z.string().optional(),
});
export type CreateFeeItemInput = z.infer<typeof CreateFeeItemSchema>;

export const GenerateClassInvoicesSchema = z.object({
  classArmId: z.string().min(1, 'Class Arm ID is required'),
  termId: z.string().default('t1'),
  sessionId: z.string().default('ses_2026_2027'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'),
  includeOptionalFees: z.boolean().default(false),
  applySiblingDiscount: z.boolean().default(true),
});
export type GenerateClassInvoicesInput = z.infer<typeof GenerateClassInvoicesSchema>;

export const RecordManualPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'POS']),
  channel: z.string().default('bank_transfer'),
  transactionReference: z.string().min(3, 'Transaction reference is required'),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});
export type RecordManualPaymentInput = z.infer<typeof RecordManualPaymentSchema>;

export const InitializePaystackPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  customerEmail: z.string().email('Valid email is required for Paystack receipting'),
  callbackUrl: z.string().url().optional(),
});
export type InitializePaystackPaymentInput = z.infer<typeof InitializePaystackPaymentSchema>;

export const RequestReversalSchema = z.object({
  paymentRecordId: z.string().min(1, 'Payment Record ID is required'),
  reason: z.string().min(10, 'Mandatory justification must be at least 10 characters'),
});
export type RequestReversalInput = z.infer<typeof RequestReversalSchema>;

export const ExecuteReversalSchema = z.object({
  requestId: z.string().min(1, 'Reversal Request ID is required'),
  decision: z.enum(['APPROVED', 'REJECTED']),
  decisionRemarks: z.string().min(5, 'Decision remarks are required'),
});
export type ExecuteReversalInput = z.infer<typeof ExecuteReversalSchema>;
