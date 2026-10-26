import {
  FeeItem,
  SiblingDiscountRule,
  StudentInvoice,
  InvoiceLineItem,
  StudentLedgerEntry,
  PaymentRecord,
  PaymentReversalRequest,
  AgingDebtorsReport,
  DEFAULT_SIBLING_DISCOUNT_RULE,
  CreateFeeItemSchema,
  GenerateClassInvoicesSchema,
  RecordManualPaymentSchema,
} from './finance-types';
import { AuthSession, can } from '../auth/rbac';
import { listStudents } from '../sis/sis-store';
import { logAuditEvent } from '../audit/logger';
import { defaultPaystackClient } from './paystack-client';

/**
 * Multi-Tenant In-Memory Stores
 * Structured for zero mutable student balance columns (Append-Only Ledger ADR-03)
 */
const feeItemsStore = new Map<string, FeeItem[]>();
const siblingRulesStore = new Map<string, SiblingDiscountRule>();
const invoicesStore = new Map<string, Map<string, StudentInvoice>>();
const ledgerStore = new Map<string, StudentLedgerEntry[]>(); // Append-Only!
const paymentsStore = new Map<string, PaymentRecord[]>();
const reversalsStore = new Map<string, PaymentReversalRequest[]>();
const processedIdempotencyKeys = new Set<string>(); // Defeats webhook duplicate double-crediting (Risk R4)

/**
 * Initialize baseline seeds for institutional tenant
 */
export function ensureFinanceStoreInitialized(schoolId: string) {
  if (feeItemsStore.has(schoolId)) {
    return;
  }

  // 1. Initialize Sibling Discount Rule
  siblingRulesStore.set(schoolId, { ...DEFAULT_SIBLING_DISCOUNT_RULE });

  // 2. Initialize Seed Fee Items (Standard Nigerian Secondary Curriculum)
  const seedFeeItems: FeeItem[] = [
    {
      id: `fee_${schoolId}_1`,
      schoolId,
      name: 'Tuition Fee (Senior & Junior Secondary)',
      category: 'TUITION',
      amount: 180000,
      isCompulsory: true,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Standard academic tuition and instruction materials.',
    },
    {
      id: `fee_${schoolId}_2`,
      schoolId,
      name: 'Institutional Development Levy',
      category: 'DEVELOPMENT_LEVY',
      amount: 30000,
      isCompulsory: true,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Campus infrastructure maintenance and power generation fund.',
    },
    {
      id: `fee_${schoolId}_3`,
      schoolId,
      name: 'Science Laboratory & ICT STEM Levy',
      category: 'ICT_STEM',
      amount: 25000,
      isCompulsory: true,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Broadband internet, robotics kit, and laboratory consumables.',
    },
    {
      id: `fee_${schoolId}_4`,
      schoolId,
      name: 'PTA Termly Levy',
      category: 'PTA_LEVY',
      amount: 15000,
      isCompulsory: true,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Parent-Teacher Association welfare fund.',
    },
    {
      id: `fee_${schoolId}_5`,
      schoolId,
      name: 'Books, Stationery & Uniform Pack',
      category: 'BOOKS',
      amount: 45000,
      isCompulsory: true,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Standard workbooks, school diary, and branded sports jersey.',
    },
    {
      id: `fee_${schoolId}_6`,
      schoolId,
      name: 'School Bus Transit (Lekki / Victoria Island Route)',
      category: 'TRANSPORT',
      amount: 75000,
      isCompulsory: false,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Daily air-conditioned school bus pick-up and drop-off.',
    },
    {
      id: `fee_${schoolId}_7`,
      schoolId,
      name: 'Boarding House Accommodation & Catering',
      category: 'BOARDING',
      amount: 150000,
      isCompulsory: false,
      applicableClassLevelIds: [],
      termId: 't1',
      sessionId: 'ses_2026_2027',
      description: 'Full-term hostel boarding and nutritional meal plan.',
    },
  ];
  feeItemsStore.set(schoolId, seedFeeItems);

  // 3. Initialize Stores
  invoicesStore.set(schoolId, new Map());
  ledgerStore.set(schoolId, []);
  paymentsStore.set(schoolId, []);
  reversalsStore.set(schoolId, []);

  // 4. Seed 1 Pre-Existing Invoiced Student ONLY for Tenant A (King's College Lagos)
  if (schoolId === '11111111-1111-1111-1111-111111111111' || schoolId === 'kcl_lagos_001') {
    const seedInvoiceId = `INV-2026-0001`;
    const seedStudentId = `stu_kcl_001`;

    const seedLineItems: InvoiceLineItem[] = [
      {
        id: `line_1`,
        feeItemId: seedFeeItems[0].id,
        name: seedFeeItems[0].name,
        category: seedFeeItems[0].category,
        unitAmount: 180000,
        discountAmount: 0,
        netAmount: 180000,
      },
      {
        id: `line_2`,
        feeItemId: seedFeeItems[1].id,
        name: seedFeeItems[1].name,
        category: seedFeeItems[1].category,
        unitAmount: 30000,
        discountAmount: 0,
        netAmount: 30000,
      },
      {
        id: `line_3`,
        feeItemId: seedFeeItems[2].id,
        name: seedFeeItems[2].name,
        category: seedFeeItems[2].category,
        unitAmount: 25000,
        discountAmount: 0,
        netAmount: 25000,
      },
      {
        id: `line_4`,
        feeItemId: seedFeeItems[3].id,
        name: seedFeeItems[3].name,
        category: seedFeeItems[3].category,
        unitAmount: 15000,
        discountAmount: 0,
        netAmount: 15000,
      },
      {
        id: `line_5`,
        feeItemId: seedFeeItems[4].id,
        name: seedFeeItems[4].name,
        category: seedFeeItems[4].category,
        unitAmount: 45000,
        discountAmount: 0,
        netAmount: 45000,
      },
    ];

    const totalInvoiceAmount = 295000;
    const initialPaymentAmount = 150000;
    const balanceDue = totalInvoiceAmount - initialPaymentAmount;

    const seedInvoice: StudentInvoice = {
      id: seedInvoiceId,
      schoolId,
      studentId: seedStudentId,
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      guardianId: 'gua_kcl_001',
      guardianName: 'Babajide Adeleke',
      guardianEmail: 'baba.adeleke@gmail.com',
      guardianPhone: '+2348031234567',
      classArmId: 'arm_jss1_gold',
      classArmName: 'Gold',
      classLevelId: 'lvl_jss1',
      classLevelName: 'JSS 1',
      termId: 't1',
      termName: 'First Term (Michaelmas)',
      sessionId: 'ses_2026_2027',
      sessionName: '2026/2027 Academic Session',
      issueDate: '2026-09-14',
      dueDate: '2026-10-15',
      items: seedLineItems,
      subtotal: totalInvoiceAmount,
      totalDiscount: 0,
      totalAmount: totalInvoiceAmount,
      amountPaid: initialPaymentAmount,
      balanceDue,
      status: 'PARTIALLY_PAID',
      paystackPaymentReference: 'T99281726354',
      receiptNumbers: ['REC-2026-0001'],
      createdAt: new Date('2026-09-14T08:00:00Z').toISOString(),
      updatedAt: new Date('2026-09-20T10:30:00Z').toISOString(),
    };

    invoicesStore.get(schoolId)!.set(seedInvoiceId, seedInvoice);

    // Append-Only Ledger Entry 1: Invoice Charge (DEBIT)
    const ledger1: StudentLedgerEntry = {
      id: `led_${Date.now()}_1`,
      schoolId,
      studentId: seedStudentId,
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      entryType: 'DEBIT',
      category: 'INVOICE_CHARGE',
      amount: totalInvoiceAmount,
      runningBalance: totalInvoiceAmount,
      referenceId: seedInvoiceId,
      description: 'Term 1 2026/2027 Comprehensive Tuition & Ancillary Charges',
      actorId: 'usr_bursar_01',
      actorName: 'Folashade Adebayo (Bursar)',
      timestamp: new Date('2026-09-14T08:05:00Z').toISOString(),
    };

    // Append-Only Ledger Entry 2: Paystack Card Payment (CREDIT)
    const ledger2: StudentLedgerEntry = {
      id: `led_${Date.now()}_2`,
      schoolId,
      studentId: seedStudentId,
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      entryType: 'CREDIT',
      category: 'PAYMENT_PAYSTACK',
      amount: initialPaymentAmount,
      runningBalance: balanceDue,
      referenceId: 'T99281726354',
      description: 'Paystack Card Online Payment - Part Tuition Settlement',
      actorId: 'gateway_paystack',
      actorName: 'Paystack Automated Webhook Controller',
      timestamp: new Date('2026-09-20T10:30:00Z').toISOString(),
    };

    ledgerStore.get(schoolId)!.push(ledger1, ledger2);

    // Seed Payment Record
    const seedPayment: PaymentRecord = {
      id: `pay_${Date.now()}_01`,
      schoolId,
      invoiceId: seedInvoiceId,
      studentId: seedStudentId,
      studentName: 'Chidubem Emmanuel Adeleke',
      admissionNumber: 'KCL/2026/001',
      amount: initialPaymentAmount,
      paymentMethod: 'PAYSTACK',
      channel: 'card',
      transactionReference: 'TX-KC-1001',
      gatewayReference: 'T99281726354',
      receiptNumber: 'REC-2026-0001',
      status: 'SUCCESS',
      paidAt: new Date('2026-09-20T10:30:00Z').toISOString(),
      recordedById: 'gateway_paystack',
      recordedByName: 'Paystack Automated Gateway',
    };

    paymentsStore.get(schoolId)!.push(seedPayment);
    processedIdempotencyKeys.add('TX-KC-1001');
    processedIdempotencyKeys.add('T99281726354');
  }
}

// ------------------------------------------------------------------------------
// Fee Schedules Management
// ------------------------------------------------------------------------------

export async function listFeeItems(
  schoolId: string,
  termId?: string,
  sessionId?: string,
  classLevelId?: string
): Promise<FeeItem[]> {
  ensureFinanceStoreInitialized(schoolId);
  const items = feeItemsStore.get(schoolId) || [];

  return items.filter((f) => {
    if (termId && f.termId !== 'ALL' && f.termId !== termId) return false;
    if (sessionId && f.sessionId !== sessionId) return false;
    if (
      classLevelId &&
      f.applicableClassLevelIds.length > 0 &&
      !f.applicableClassLevelIds.includes(classLevelId)
    ) {
      return false;
    }
    return true;
  });
}

export async function createFeeItem(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<FeeItem> {
  ensureFinanceStoreInitialized(schoolId);

  const canManage =
    can(actor, 'fees.manage') ||
    actor.userType === 'BURSAR' ||
    actor.userType === 'OWNER';

  if (!canManage) {
    throw new Error('403 Forbidden: Insufficient authorization to configure fee schedules.');
  }

  const validated = CreateFeeItemSchema.parse(rawInput);

  const item: FeeItem = {
    id: `fee_${schoolId}_${Date.now()}`,
    schoolId,
    name: validated.name,
    category: validated.category,
    amount: validated.amount,
    isCompulsory: validated.isCompulsory,
    applicableClassLevelIds: validated.applicableClassLevelIds,
    termId: validated.termId,
    sessionId: validated.sessionId,
    description: validated.description,
  };

  const list = feeItemsStore.get(schoolId)!;
  list.push(item);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'FEE_ITEM_CREATED',
    resourceType: 'FeeItem',
    resourceId: item.id,
    afterState: { name: item.name, amount: item.amount, category: item.category },
  });

  return item;
}

export async function getSiblingDiscountRule(schoolId: string): Promise<SiblingDiscountRule> {
  ensureFinanceStoreInitialized(schoolId);
  return siblingRulesStore.get(schoolId) || { ...DEFAULT_SIBLING_DISCOUNT_RULE };
}

export async function updateSiblingDiscountRule(
  schoolId: string,
  rule: SiblingDiscountRule,
  actor: AuthSession
): Promise<SiblingDiscountRule> {
  ensureFinanceStoreInitialized(schoolId);

  const canManage =
    can(actor, 'fees.manage') ||
    actor.userType === 'BURSAR' ||
    actor.userType === 'OWNER';

  if (!canManage) {
    throw new Error('403 Forbidden: Insufficient permissions to modify sibling discount policy.');
  }

  siblingRulesStore.set(schoolId, { ...rule });

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'SIBLING_DISCOUNT_RULE_UPDATED',
    resourceType: 'SiblingDiscountRule',
    resourceId: schoolId,
    afterState: rule,
  });

  return rule;
}

// ------------------------------------------------------------------------------
// Bulk Termly Invoicing & Sibling Discount Engine
// ------------------------------------------------------------------------------

export async function generateClassInvoices(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<StudentInvoice[]> {
  ensureFinanceStoreInitialized(schoolId);

  const canInvoice =
    can(actor, 'invoices.generate') ||
    actor.userType === 'BURSAR' ||
    actor.userType === 'OWNER';

  if (!canInvoice) {
    throw new Error('403 Forbidden: Insufficient permissions to generate student fee invoices.');
  }

  const validated = GenerateClassInvoicesSchema.parse(rawInput);
  const feeItems = await listFeeItems(schoolId, validated.termId, validated.sessionId);

  // Filter compulsory fees + optional if requested
  const applicableFees = feeItems.filter(
    (f) => f.isCompulsory || validated.includeOptionalFees
  );

  if (applicableFees.length === 0) {
    throw new Error('Cannot generate invoices: No fee schedule items configured for this term.');
  }

  // Retrieve enrolled students for this class arm
  const allStudents = await listStudents(schoolId, {}, actor);
  const enrolledStudents = allStudents.filter(
    (s) =>
      s.currentClassArmId === validated.classArmId ||
      s.currentClassArmName.toLowerCase() === validated.classArmId.toLowerCase() ||
      validated.classArmId.toLowerCase().includes(s.currentClassArmName.toLowerCase()) ||
      s.currentClassArmId.toLowerCase().includes(validated.classArmId.toLowerCase())
  );

  if (enrolledStudents.length === 0) {
    throw new Error('Cannot generate invoices: No enrolled students found in this class arm.');
  }

  const siblingRule = await getSiblingDiscountRule(schoolId);
  const invoicesMap = invoicesStore.get(schoolId)!;
  const ledger = ledgerStore.get(schoolId)!;
  const generatedInvoices: StudentInvoice[] = [];

  // Group all students in school by guardian to detect sibling cohorts
  const guardianChildrenMap = new Map<string, string[]>();
  for (const s of allStudents) {
    const primaryG = s.guardians?.find((g) => g.isPrimaryContact) || s.guardians?.[0];
    const gRecord = primaryG?.guardian;
    const key = gRecord?.phonePrimary || gRecord?.email || gRecord?.id || s.id;
    if (!guardianChildrenMap.has(key)) {
      guardianChildrenMap.set(key, []);
    }
    guardianChildrenMap.get(key)!.push(s.id);
  }

  for (const student of enrolledStudents) {
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const primaryG = student.guardians?.find((g) => g.isPrimaryContact) || student.guardians?.[0];
    const gRecord = primaryG?.guardian;
    const guardianKey = gRecord?.phonePrimary || gRecord?.email || gRecord?.id || student.id;
    const siblingIds = guardianChildrenMap.get(guardianKey) || [student.id];
    const siblingOrderIndex = siblingIds.indexOf(student.id); // 0 = 1st child, 1 = 2nd child, 2+ = 3rd child

    const lineItems: InvoiceLineItem[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const fee of applicableFees) {
      let discountAmount = 0;
      let discountReason: string | undefined;

      // Apply sibling discount if enabled and applicable to category
      if (
        validated.applySiblingDiscount &&
        siblingRule.enabled &&
        fee.category === siblingRule.applicableCategory &&
        siblingOrderIndex > 0
      ) {
        const discountPct =
          siblingOrderIndex === 1
            ? siblingRule.secondChildPercent
            : siblingRule.thirdAndSubsequentPercent;

        discountAmount = Math.round((fee.amount * discountPct) / 100);
        discountReason = `Sibling Discount (${discountPct}% off - Child #${siblingOrderIndex + 1})`;
      }

      const netAmount = Math.max(0, fee.amount - discountAmount);
      subtotal += fee.amount;
      totalDiscount += discountAmount;

      lineItems.push({
        id: `line_${invoiceId}_${fee.id}`,
        feeItemId: fee.id,
        name: fee.name,
        category: fee.category,
        unitAmount: fee.amount,
        discountAmount,
        discountReason,
        netAmount,
      });
    }

    const totalAmount = subtotal - totalDiscount;

    const invoice: StudentInvoice = {
      id: invoiceId,
      schoolId,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      guardianId: gRecord?.id || 'grd_01',
      guardianName: gRecord ? `${gRecord.firstName} ${gRecord.lastName}` : 'Parent / Guardian',
      guardianEmail: gRecord?.email || 'guardian@kcl.edu.ng',
      guardianPhone: gRecord?.phonePrimary || '+2348030000000',
      classArmId: student.currentClassArmId,
      classArmName: student.currentClassArmName,
      classLevelId: student.currentClassLevelId,
      classLevelName: student.currentClassLevelName,
      termId: validated.termId,
      termName: 'First Term (Michaelmas)',
      sessionId: validated.sessionId,
      sessionName: '2026/2027 Academic Session',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: validated.dueDate,
      items: lineItems,
      subtotal,
      totalDiscount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      status: 'ISSUED',
      receiptNumbers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoicesMap.set(invoice.id, invoice);
    generatedInvoices.push(invoice);

    // Dynamic Balance Engine: Append-Only DEBIT to Student Ledger (ADR-03)
    const currentBalance = await calculateStudentBalance(schoolId, student.id);
    const ledgerEntry: StudentLedgerEntry = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId,
      studentId: student.id,
      studentName: invoice.studentName,
      admissionNumber: invoice.admissionNumber,
      entryType: 'DEBIT',
      category: 'INVOICE_CHARGE',
      amount: totalAmount,
      runningBalance: currentBalance + totalAmount,
      referenceId: invoice.id,
      description: `Term Fee Assessment (${invoice.classArmName} - ${invoice.termName})`,
      actorId: actor.userId,
      actorName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
      timestamp: new Date().toISOString(),
      metadata: { invoiceId: invoice.id, lineItemCount: lineItems.length },
    };
    ledger.push(ledgerEntry);
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CLASS_INVOICES_GENERATED',
    resourceType: 'StudentInvoice',
    resourceId: validated.classArmId,
    afterState: {
      invoicesCount: generatedInvoices.length,
      dueDate: validated.dueDate,
      classArmId: validated.classArmId,
    },
  });

  return generatedInvoices;
}

// ------------------------------------------------------------------------------
// Invoices Retrieval
// ------------------------------------------------------------------------------

export async function getInvoice(schoolId: string, invoiceId: string): Promise<StudentInvoice> {
  ensureFinanceStoreInitialized(schoolId);
  const invoice = invoicesStore.get(schoolId)?.get(invoiceId);
  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found.`);
  }
  return invoice;
}

export async function listInvoices(
  schoolId: string,
  filters?: {
    classArmId?: string;
    studentId?: string;
    status?: string;
    termId?: string;
  }
): Promise<StudentInvoice[]> {
  ensureFinanceStoreInitialized(schoolId);
  const map = invoicesStore.get(schoolId) || new Map();
  let list = Array.from(map.values());

  if (filters?.classArmId) {
    list = list.filter((i) => i.classArmId === filters.classArmId);
  }
  if (filters?.studentId) {
    list = list.filter((i) => i.studentId === filters.studentId);
  }
  if (filters?.status) {
    list = list.filter((i) => i.status === filters.status);
  }
  if (filters?.termId) {
    list = list.filter((i) => i.termId === filters.termId);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ------------------------------------------------------------------------------
// Double-Entry Append-Only Ledger & Dynamic Balance Calculator (ADR-03)
// ------------------------------------------------------------------------------

export async function getStudentLedger(
  schoolId: string,
  studentId: string
): Promise<{ entries: StudentLedgerEntry[]; currentBalance: number }> {
  ensureFinanceStoreInitialized(schoolId);
  const entries = (ledgerStore.get(schoolId) || [])
    .filter((e) => e.studentId === studentId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Dynamically derive current balance from sum(DEBITS) - sum(CREDITS)
  let currentBalance = 0;
  for (const entry of entries) {
    if (entry.entryType === 'DEBIT') {
      currentBalance += entry.amount;
    } else if (entry.entryType === 'CREDIT') {
      currentBalance -= entry.amount;
    }
  }

  return { entries, currentBalance };
}

export async function calculateStudentBalance(
  schoolId: string,
  studentId: string
): Promise<number> {
  const { currentBalance } = await getStudentLedger(schoolId, studentId);
  return currentBalance;
}

// ------------------------------------------------------------------------------
// Payment Recording & Gateway Idempotency Engine (Paystack / Manual)
// ------------------------------------------------------------------------------

export async function recordPayment(
  schoolId: string,
  params: {
    invoiceId: string;
    amount: number;
    paymentMethod: 'PAYSTACK' | 'FLUTTERWAVE' | 'BANK_TRANSFER' | 'CASH' | 'POS';
    channel?: string;
    transactionReference: string;
    gatewayReference?: string;
    metadata?: Record<string, any>;
  },
  actor: AuthSession
): Promise<{ payment: PaymentRecord; invoice: StudentInvoice; ledgerEntry: StudentLedgerEntry }> {
  ensureFinanceStoreInitialized(schoolId);

  // 1. Defeat Duplicate / Webhook Re-transmission (Playbook Risk R4)
  if (processedIdempotencyKeys.has(params.transactionReference)) {
    throw new Error(
      `Idempotency Guard: Transaction ${params.transactionReference} has already been processed and credited.`
    );
  }

  const invoice = invoicesStore.get(schoolId)?.get(params.invoiceId);
  if (!invoice) {
    throw new Error(`Invoice ${params.invoiceId} not found.`);
  }

  if (params.amount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  if (params.amount > invoice.balanceDue) {
    throw new Error(
      `Payment amount (₦${params.amount.toLocaleString()}) cannot exceed invoice balance due (₦${invoice.balanceDue.toLocaleString()}).`
    );
  }

  // 2. Generate Unique Receipt Number
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. Append to Immutable Ledger (CREDIT reduces student outstanding debt)
  const currentBal = await calculateStudentBalance(schoolId, invoice.studentId);
  const ledgerEntry: StudentLedgerEntry = {
    id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    admissionNumber: invoice.admissionNumber,
    entryType: 'CREDIT',
    category:
      params.paymentMethod === 'PAYSTACK'
        ? 'PAYMENT_PAYSTACK'
        : params.paymentMethod === 'FLUTTERWAVE'
        ? 'PAYMENT_FLUTTERWAVE'
        : 'PAYMENT_BANK_TRANSFER',
    amount: params.amount,
    runningBalance: currentBal - params.amount,
    referenceId: params.transactionReference,
    description: `Fee Payment via ${params.paymentMethod} (Receipt: ${receiptNumber})`,
    actorId: actor.userId,
    actorName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    timestamp: new Date().toISOString(),
    metadata: {
      invoiceId: invoice.id,
      receiptNumber,
      gatewayReference: params.gatewayReference,
    },
  };
  ledgerStore.get(schoolId)!.push(ledgerEntry);

  // 4. Update Invoice State
  invoice.amountPaid += params.amount;
  invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);
  invoice.receiptNumbers.push(receiptNumber);
  invoice.status = invoice.balanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';
  invoice.updatedAt = new Date().toISOString();

  // 5. Store Payment Record
  const payment: PaymentRecord = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    admissionNumber: invoice.admissionNumber,
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    channel: params.channel || 'online',
    transactionReference: params.transactionReference,
    gatewayReference: params.gatewayReference,
    receiptNumber,
    status: 'SUCCESS',
    paidAt: new Date().toISOString(),
    recordedById: actor.userId,
    recordedByName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    metadata: params.metadata,
  };
  paymentsStore.get(schoolId)!.push(payment);

  // 6. Lock Idempotency Key
  processedIdempotencyKeys.add(params.transactionReference);
  if (params.gatewayReference) {
    processedIdempotencyKeys.add(params.gatewayReference);
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'PAYMENT_RECORDED',
    resourceType: 'PaymentRecord',
    resourceId: payment.id,
    afterState: {
      amount: payment.amount,
      receiptNumber: payment.receiptNumber,
      invoiceId: invoice.id,
      newBalanceDue: invoice.balanceDue,
    },
  });

  return { payment, invoice, ledgerEntry };
}

// ------------------------------------------------------------------------------
// Paystack Online Checkout & Webhook Processor
// ------------------------------------------------------------------------------

export async function initializeInvoicePaystackCheckout(
  schoolId: string,
  invoiceId: string,
  customerEmail: string,
  callbackUrl?: string
): Promise<{ authorizationUrl: string; reference: string }> {
  ensureFinanceStoreInitialized(schoolId);
  const invoice = await getInvoice(schoolId, invoiceId);

  if (invoice.balanceDue <= 0) {
    throw new Error('This invoice is already fully settled.');
  }

  const reference = `TX-KC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const res = await defaultPaystackClient.initializeTransaction({
    email: customerEmail,
    amountInNaira: invoice.balanceDue,
    reference,
    callbackUrl,
    metadata: {
      schoolId,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      studentName: invoice.studentName,
    },
  });

  if (!res.status) {
    throw new Error(`Paystack Gateway Initialization Failed: ${res.message}`);
  }

  invoice.paystackPaymentReference = reference;

  return {
    authorizationUrl: res.data.authorization_url,
    reference: res.data.reference,
  };
}

export async function processPaystackWebhook(
  rawBody: string | Buffer,
  headerSignature: string
): Promise<{ success: boolean; message: string; data?: any }> {
  // 1. Cryptographic Signature Verification (HMAC-SHA512)
  const isValid = defaultPaystackClient.verifyWebhookSignature(rawBody, headerSignature);
  if (!isValid) {
    return { success: false, message: 'Invalid cryptographic signature from Paystack.' };
  }

  const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf8'));

  if (payload.event === 'charge.success') {
    const data = payload.data;
    const reference = data.reference;
    const amountInNaira = Math.round(data.amount / 100);
    const invoiceId = data.metadata?.invoiceId;
    const schoolId = data.metadata?.schoolId;

    if (!invoiceId || !schoolId) {
      return { success: false, message: 'Missing schoolId or invoiceId in webhook metadata.' };
    }

    // Process payment under system actor session
    const systemActor: AuthSession = {
      userId: 'system_paystack_webhook',
      schoolId,
      email: 'webhook@paystack.co',
      firstName: 'Paystack',
      lastName: 'Webhook',
      userType: 'BURSAR',
      isPrivileged: true,
      mfaVerified: true,
      expiresAt: Date.now() + 3600000,
    };

    try {
      const result = await recordPayment(
        schoolId,
        {
          invoiceId,
          amount: amountInNaira,
          paymentMethod: 'PAYSTACK',
          channel: data.channel || 'card',
          transactionReference: reference,
          gatewayReference: data.id?.toString(),
          metadata: { ip_address: data.ip_address, fees: data.fees },
        },
        systemActor
      );

      return {
        success: true,
        message: `Successfully credited invoice ${invoiceId} via Paystack webhook.`,
        data: result,
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  return { success: true, message: `Ignored unhandled event: ${payload.event}` };
}

// ------------------------------------------------------------------------------
// Level 2 Maker-Checker Ledger Reversals & Refunds (ADR-04)
// ------------------------------------------------------------------------------

export async function requestPaymentReversal(
  schoolId: string,
  paymentRecordId: string,
  reason: string,
  actor: AuthSession
): Promise<PaymentReversalRequest> {
  ensureFinanceStoreInitialized(schoolId);

  const payment = (paymentsStore.get(schoolId) || []).find((p) => p.id === paymentRecordId);
  if (!payment) {
    throw new Error(`Payment record ${paymentRecordId} not found.`);
  }

  const request: PaymentReversalRequest = {
    id: `rev_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    paymentRecordId,
    invoiceId: payment.invoiceId,
    studentId: payment.studentId,
    studentName: payment.studentName,
    admissionNumber: payment.admissionNumber,
    amount: payment.amount,
    reason,
    status: 'PENDING_APPROVAL',
    requesterId: actor.userId,
    requesterName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
    requestedAt: new Date().toISOString(),
  };

  reversalsStore.get(schoolId)!.push(request);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'PAYMENT_REVERSAL_REQUESTED',
    resourceType: 'PaymentReversalRequest',
    resourceId: request.id,
    beforeState: { paymentId: payment.id, amount: payment.amount },
    afterState: { reason },
  });

  return request;
}

export async function executePaymentReversal(
  schoolId: string,
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionRemarks: string,
  actor: AuthSession
): Promise<PaymentReversalRequest> {
  ensureFinanceStoreInitialized(schoolId);

  // Level 2 Privilege Guard (Principal or Owner only)
  const canApprove =
    can(actor, 'approvals.level2_approve') ||
    actor.userType === 'PRINCIPAL' ||
    actor.userType === 'OWNER';

  if (!canApprove) {
    throw new Error(
      '403 Forbidden: Level 2 Maker-Checker approval requires Principal or Owner authorization.'
    );
  }

  const list = reversalsStore.get(schoolId)!;
  const req = list.find((r) => r.id === requestId);
  if (!req) {
    throw new Error(`Reversal request ${requestId} not found.`);
  }

  if (req.status !== 'PENDING_APPROVAL') {
    throw new Error(`Cannot execute: Request is already ${req.status}.`);
  }

  req.status = decision;
  req.approverId = actor.userId;
  req.approverName = `${actor.firstName} ${actor.lastName} (${actor.userType})`;
  req.decisionRemarks = decisionRemarks;
  req.decidedAt = new Date().toISOString();

  if (decision === 'APPROVED') {
    // 1. Append Compensating DEBIT entry into Append-Only Ledger (ADR-03)
    const currentBal = await calculateStudentBalance(schoolId, req.studentId);
    const ledger = ledgerStore.get(schoolId)!;
    const compensatingEntry: StudentLedgerEntry = {
      id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId,
      studentId: req.studentId,
      studentName: req.studentName,
      admissionNumber: req.admissionNumber,
      entryType: 'DEBIT',
      category: 'REVERSAL_REFUND',
      amount: req.amount,
      runningBalance: currentBal + req.amount,
      referenceId: req.id,
      description: `L2 Approved Payment Reversal / Refund (Ref: ${req.paymentRecordId})`,
      actorId: actor.userId,
      actorName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
      timestamp: new Date().toISOString(),
      metadata: { remarks: decisionRemarks, requester: req.requesterName },
    };
    ledger.push(compensatingEntry);

    // 2. Adjust Invoice Balance
    const invoice = invoicesStore.get(schoolId)?.get(req.invoiceId);
    if (invoice) {
      invoice.amountPaid = Math.max(0, invoice.amountPaid - req.amount);
      invoice.balanceDue = invoice.totalAmount - invoice.amountPaid;
      invoice.status = invoice.amountPaid === 0 ? 'ISSUED' : 'PARTIALLY_PAID';
      invoice.updatedAt = new Date().toISOString();
    }
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'PAYMENT_REVERSAL_EXECUTED',
    resourceType: 'PaymentReversalRequest',
    resourceId: req.id,
    afterState: {
      decision,
      remarks: decisionRemarks,
      approver: req.approverName,
    },
  });

  return req;
}

export async function listReversalRequests(
  schoolId: string,
  _actor?: AuthSession
): Promise<PaymentReversalRequest[]> {
  ensureFinanceStoreInitialized(schoolId);
  return reversalsStore.get(schoolId) || [];
}

// ------------------------------------------------------------------------------
// Aging Debtors Analytics Report
// ------------------------------------------------------------------------------

export async function generateAgingDebtorsReport(
  schoolId: string,
  asOfDateStr?: string
): Promise<AgingDebtorsReport> {
  ensureFinanceStoreInitialized(schoolId);

  const asOf = asOfDateStr ? new Date(asOfDateStr) : new Date();
  const invoices = Array.from((invoicesStore.get(schoolId) || new Map()).values());

  // Filter all unpaid invoices
  const unpaidInvoices = invoices.filter((i) => i.balanceDue > 0 && i.status !== 'CANCELLED');

  let totalOutstanding = 0;
  let current0to30Days = 0;
  let aging31to60Days = 0;
  let aging61to90Days = 0;
  let aging90DaysPlus = 0;

  const classMap = new Map<string, { name: string; count: number; total: number }>();
  const topDebtors: Array<{
    studentId: string;
    studentName: string;
    admissionNumber: string;
    classArmName: string;
    guardianName: string;
    guardianPhone: string;
    totalOwed: number;
    daysOverdue: number;
    invoiceId: string;
  }> = [];

  for (const inv of unpaidInvoices) {
    totalOutstanding += inv.balanceDue;

    const dueDate = new Date(inv.dueDate);
    const diffTime = asOf.getTime() - dueDate.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    if (daysOverdue <= 30) {
      current0to30Days += inv.balanceDue;
    } else if (daysOverdue <= 60) {
      aging31to60Days += inv.balanceDue;
    } else if (daysOverdue <= 90) {
      aging61to90Days += inv.balanceDue;
    } else {
      aging90DaysPlus += inv.balanceDue;
    }

    // Class aggregate
    if (!classMap.has(inv.classArmId)) {
      classMap.set(inv.classArmId, { name: inv.classArmName, count: 0, total: 0 });
    }
    const classData = classMap.get(inv.classArmId)!;
    classData.count += 1;
    classData.total += inv.balanceDue;

    topDebtors.push({
      studentId: inv.studentId,
      studentName: inv.studentName,
      admissionNumber: inv.admissionNumber,
      classArmName: inv.classArmName,
      guardianName: inv.guardianName,
      guardianPhone: inv.guardianPhone,
      totalOwed: inv.balanceDue,
      daysOverdue,
      invoiceId: inv.id,
    });
  }

  // Sort top debtors by highest amount owed
  topDebtors.sort((a, b) => b.totalOwed - a.totalOwed);

  const classBreakdown = Array.from(classMap.entries()).map(([classArmId, d]) => ({
    classArmId,
    classArmName: d.name,
    debtorCount: d.count,
    totalOwed: d.total,
  }));

  return {
    schoolId,
    asOfDate: asOf.toISOString(),
    totalOutstanding,
    current0to30Days,
    aging31to60Days,
    aging61to90Days,
    aging90DaysPlus,
    debtorCount: unpaidInvoices.length,
    classBreakdown,
    topDebtors,
  };
}
