import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import {
  ensureFinanceStoreInitialized,
  listFeeItems,
  createFeeItem,
  getSiblingDiscountRule,
  updateSiblingDiscountRule,
  generateClassInvoices,
  getInvoice,
  listInvoices,
  getStudentLedger,
  calculateStudentBalance,
  recordPayment,
  initializeInvoicePaystackCheckout,
  processPaystackWebhook,
  requestPaymentReversal,
  executePaymentReversal,
  generateAgingDebtorsReport,
} from '../apps/web/src/lib/finance/finance-store';
import { defaultPaystackClient } from '../apps/web/src/lib/finance/paystack-client';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const mockBursarA: AuthSession = {
  userId: 'usr_bursar_01',
  schoolId: TENANT_A_ID,
  email: 'bursar@kcl.edu.ng',
  firstName: 'Folashade',
  lastName: 'Adebayo',
  userType: 'BURSAR',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const mockPrincipalA: AuthSession = {
  userId: 'usr_prin_01',
  schoolId: TENANT_A_ID,
  email: 'principal@kcl.edu.ng',
  firstName: 'Adeyemi',
  lastName: 'Ogunlesi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const mockTeacherA: AuthSession = {
  userId: 'usr_teach_01',
  schoolId: TENANT_A_ID,
  email: 'teacher@kcl.edu.ng',
  firstName: 'Ibrahim',
  lastName: 'Musa',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const mockBursarB: AuthSession = {
  userId: 'usr_bursar_b',
  schoolId: TENANT_B_ID,
  email: 'bursar@apexcollege.ng',
  firstName: 'Chidinma',
  lastName: 'Eze',
  userType: 'BURSAR',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

test('--- Running Phase 6 Finance, Fees, Invoicing & Append-Only Ledger Suite ---', async (t) => {
  ensureFinanceStoreInitialized(TENANT_A_ID);
  ensureFinanceStoreInitialized(TENANT_B_ID);

  await t.test('Phase 6.1: Configurable Institutional Fee Schedules', async () => {
    // 1. Verify default fee items loaded for Tenant A
    const feeItems = await listFeeItems(TENANT_A_ID, 't1', 'ses_2026_2027');
    assert.ok(feeItems.length >= 5, 'Should have at least 5 default fee items');

    const tuition = feeItems.find((f) => f.category === 'TUITION');
    assert.ok(tuition, 'Tuition fee item must exist');
    assert.strictEqual(tuition.amount, 180000);
    assert.strictEqual(tuition.isCompulsory, true);

    // 2. Create new fee item (Coding & Robotics STEM Kit)
    const newFee = await createFeeItem(
      TENANT_A_ID,
      {
        name: 'Coding & Robotics STEM Kit',
        category: 'ICT_STEM',
        amount: 35000,
        isCompulsory: false,
        applicableClassLevelIds: ['lvl_9'],
        termId: 't1',
        sessionId: 'ses_2026_2027',
        description: 'Microcontroller hardware kit and visual programming workbook.',
      },
      mockBursarA
    );

    assert.ok(newFee.id);
    assert.strictEqual(newFee.amount, 35000);

    // 3. Reject non-positive fee amount
    await assert.rejects(
      async () => {
        await createFeeItem(
          TENANT_A_ID,
          {
            name: 'Invalid Fee',
            category: 'OTHER',
            amount: -5000,
            termId: 't1',
            sessionId: 'ses_2026_2027',
          },
          mockBursarA
        );
      },
      /(greater than 0|Number must be greater than 0)/,
      'Must reject negative fee amount'
    );
  });

  await t.test('Phase 6.2: Automated Bulk Invoicing & Sibling Discount Engine', async () => {
    // 1. Verify Sibling Discount Rule
    const siblingRule = await getSiblingDiscountRule(TENANT_A_ID);
    assert.strictEqual(siblingRule.enabled, true);
    assert.strictEqual(siblingRule.secondChildPercent, 10);

    // 2. Generate class invoices for JSS 1 Gold (arm_jss1_gold)
    const invoices = await generateClassInvoices(
      TENANT_A_ID,
      {
        classArmId: 'arm_jss1_gold',
        termId: 't1',
        sessionId: 'ses_2026_2027',
        dueDate: '2026-11-15',
        includeOptionalFees: false,
        applySiblingDiscount: true,
      },
      mockBursarA
    );

    assert.ok(invoices.length >= 1, 'Invoices should be generated for enrolled students in arm_jss1_gold');
    const inv = invoices[0];
    assert.ok(inv.id.startsWith('INV-'));
    assert.ok(inv.items.length >= 4, 'Invoice should include all compulsory fees');
    assert.strictEqual(inv.status, 'ISSUED');
    assert.strictEqual(inv.balanceDue, inv.totalAmount);

    // 3. Verify that invoice generation appended a corresponding DEBIT charge into the student ledger
    const { entries, currentBalance } = await getStudentLedger(TENANT_A_ID, inv.studentId);
    const invoiceDebit = entries.find((e) => e.referenceId === inv.id);
    assert.ok(invoiceDebit, 'Ledger must contain DEBIT entry for generated invoice');
    assert.strictEqual(invoiceDebit.entryType, 'DEBIT');
    assert.strictEqual(invoiceDebit.amount, inv.totalAmount);
    assert.ok(currentBalance > 0, 'Student balance must be greater than zero after invoice debit');
  });

  await t.test('Phase 6.3: Double-Entry Append-Only Financial Ledger (ADR-03)', async () => {
    const studentId = 'stu_kcl_001';
    const { entries, currentBalance } = await getStudentLedger(TENANT_A_ID, studentId);

    assert.ok(entries.length >= 2, 'Should have initial debit and credit ledger entries');

    // Dynamic balance verification: sum(DEBIT) - sum(CREDIT)
    let expectedBal = 0;
    for (const e of entries) {
      if (e.entryType === 'DEBIT') expectedBal += e.amount;
      else if (e.entryType === 'CREDIT') expectedBal -= e.amount;
    }

    assert.strictEqual(
      currentBalance,
      expectedBal,
      'Student balance must match dynamic sum(DEBITS) - sum(CREDITS)'
    );
  });

  await t.test('Phase 6.4: Payment Recording & Idempotency Duplicate Prevention (Risk R4)', async () => {
    // 1. Fetch seed invoice
    const invoice = await getInvoice(TENANT_A_ID, 'INV-2026-0001');
    const initialDue = invoice.balanceDue;
    assert.ok(initialDue > 0, 'Seed invoice must have outstanding balance');

    const paymentAmount = 50000;
    const txRef = `TX-TEST-MANUAL-${Date.now()}`;

    // 2. Record manual bank transfer payment
    const { payment, invoice: updatedInvoice, ledgerEntry } = await recordPayment(
      TENANT_A_ID,
      {
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentMethod: 'BANK_TRANSFER',
        channel: 'bank_transfer',
        transactionReference: txRef,
      },
      mockBursarA
    );

    assert.strictEqual(payment.status, 'SUCCESS');
    assert.strictEqual(payment.amount, paymentAmount);
    assert.ok(payment.receiptNumber.startsWith('REC-'));
    assert.strictEqual(updatedInvoice.balanceDue, initialDue - paymentAmount);
    assert.strictEqual(ledgerEntry.entryType, 'CREDIT');
    assert.strictEqual(ledgerEntry.amount, paymentAmount);

    // 3. Idempotency Guard: Re-submitting the exact same transaction reference MUST fail
    await assert.rejects(
      async () => {
        await recordPayment(
          TENANT_A_ID,
          {
            invoiceId: invoice.id,
            amount: paymentAmount,
            paymentMethod: 'BANK_TRANSFER',
            channel: 'bank_transfer',
            transactionReference: txRef,
          },
          mockBursarA
        );
      },
      /Idempotency Guard: Transaction .* has already been processed/,
      'Idempotency guard must defeat duplicate payment attempts'
    );
  });

  await t.test('Phase 6.5: Paystack Gateway & Cryptographic Webhook Processor (HMAC-SHA512)', async () => {
    const invoice = await getInvoice(TENANT_A_ID, 'INV-2026-0001');

    // 1. Initialize Paystack Checkout
    const checkout = await initializeInvoicePaystackCheckout(
      TENANT_A_ID,
      invoice.id,
      'baba.adeleke@gmail.com',
      'http://localhost:3000/finance/callback'
    );

    assert.ok(checkout.authorizationUrl);
    assert.ok(checkout.reference.startsWith('TX-KC-'));

    // 2. Simulate Paystack charge.success webhook payload
    const webhookPayload = {
      event: 'charge.success',
      data: {
        id: 99887766,
        domain: 'test',
        status: 'success',
        reference: `TX-PAYSTACK-WEBHOOK-${Date.now()}`,
        amount: 2500000, // ₦25,000 in kobo
        message: null,
        channel: 'card',
        currency: 'NGN',
        ip_address: '197.210.65.12',
        metadata: {
          schoolId: TENANT_A_ID,
          invoiceId: invoice.id,
          studentId: invoice.studentId,
        },
      },
    };

    const rawBody = JSON.stringify(webhookPayload);
    const secretKey =
      process.env.PAYSTACK_SECRET_KEY || 'mock_paystack_secret_key_apex_demo';

    // Compute genuine HMAC-SHA512 signature
    const validSignature = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    // 3. Test genuine signature processing
    const webhookRes = await processPaystackWebhook(rawBody, validSignature);
    assert.strictEqual(webhookRes.success, true);
    assert.ok(webhookRes.message.includes('Successfully credited invoice'));

    // 4. Test forged / tampered signature rejection
    const invalidSignature = 'forged_tampered_signature_hex_1234567890abcdef';
    const forgedRes = await processPaystackWebhook(rawBody, invalidSignature);
    assert.strictEqual(forgedRes.success, false);
    assert.strictEqual(forgedRes.message, 'Invalid cryptographic signature from Paystack.');
  });

  await t.test('Phase 6.6: Level 2 Maker-Checker Reversals & Refunds (ADR-04)', async () => {
    // 1. Create a payment to reverse
    const invoice = await getInvoice(TENANT_A_ID, 'INV-2026-0001');
    const paymentAmount = 10000;
    const txRef = `TX-REVERSE-TARGET-${Date.now()}`;

    const { payment } = await recordPayment(
      TENANT_A_ID,
      {
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentMethod: 'POS',
        channel: 'pos',
        transactionReference: txRef,
      },
      mockBursarA
    );

    const balanceBeforeReversal = (await getInvoice(TENANT_A_ID, invoice.id)).balanceDue;

    // 2. Bursar requests payment reversal with mandatory audit justification
    const reversalReq = await requestPaymentReversal(
      TENANT_A_ID,
      payment.id,
      'Duplicate POS transaction settlement detected by Zenith Bank reconciler.',
      mockBursarA
    );

    assert.strictEqual(reversalReq.status, 'PENDING_APPROVAL');

    // 3. Unauthorized role (Teacher) cannot execute reversal (403 Forbidden)
    await assert.rejects(
      async () => {
        await executePaymentReversal(
          TENANT_A_ID,
          reversalReq.id,
          'APPROVED',
          'Attempted by teacher without L2 privilege',
          mockTeacherA
        );
      },
      /403 Forbidden: Level 2 Maker-Checker approval requires Principal or Owner authorization/,
      'Must reject unauthorized reversal execution'
    );

    // 4. Principal executes Level 2 Maker-Checker approval
    const executed = await executePaymentReversal(
      TENANT_A_ID,
      reversalReq.id,
      'APPROVED',
      'Bank chargeback notification verified. Compensating debit authorized.',
      mockPrincipalA
    );

    assert.strictEqual(executed.status, 'APPROVED');

    // 5. Verify that append-only ledger recorded a compensating DEBIT entry (ADR-03)
    const { entries } = await getStudentLedger(TENANT_A_ID, invoice.studentId);
    const compEntry = entries.find((e) => e.referenceId === reversalReq.id);
    assert.ok(compEntry, 'Compensating DEBIT ledger entry must exist for reversal');
    assert.strictEqual(compEntry.entryType, 'DEBIT');
    assert.strictEqual(compEntry.amount, paymentAmount);

    // 6. Verify invoice balance due restored
    const invoiceAfter = await getInvoice(TENANT_A_ID, invoice.id);
    assert.strictEqual(invoiceAfter.balanceDue, balanceBeforeReversal + paymentAmount);
  });

  await t.test('Phase 6.7: Aging Debtors Analysis & Reporting', async () => {
    const report = await generateAgingDebtorsReport(TENANT_A_ID, '2026-11-30');

    assert.strictEqual(report.schoolId, TENANT_A_ID);
    assert.ok(report.totalOutstanding > 0, 'Total outstanding should be greater than zero');
    assert.ok(report.debtorCount >= 1, 'Should identify at least 1 debtor');
    assert.ok(report.classBreakdown.length >= 1, 'Should contain class-level breakdown');
    assert.ok(report.topDebtors.length >= 1, 'Should list top debtor students');

    const top = report.topDebtors[0];
    assert.ok(top.studentName);
    assert.ok(top.guardianPhone);
    assert.ok(top.totalOwed > 0);
  });

  await t.test('Phase 6.8: Security — Multi-Tenant Isolation & Role-Based Access Control', async () => {
    // 1. Tenant B cannot read Tenant A invoices
    const invoicesB = await listInvoices(TENANT_B_ID);
    const hasTenantAInvoice = invoicesB.some((i) => i.schoolId === TENANT_A_ID);
    assert.strictEqual(hasTenantAInvoice, false, 'Tenant B must never see Tenant A invoices');

    // 2. Tenant B Bursar cannot record payment against Tenant A invoice
    await assert.rejects(
      async () => {
        await recordPayment(
          TENANT_B_ID,
          {
            invoiceId: 'INV-2026-0001',
            amount: 5000,
            paymentMethod: 'CASH',
            transactionReference: `CROSS-TENANT-${Date.now()}`,
          },
          mockBursarB
        );
      },
      /Invoice INV-2026-0001 not found/,
      'Cross-tenant payment injection must be defeated'
    );
  });
});
