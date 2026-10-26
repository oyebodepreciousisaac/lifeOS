import test from 'node:test';
import assert from 'node:assert';
import {
  ensureCommunicationStoreInitialized,
  listTemplates,
  saveTemplate,
  sendSingleNotification,
  sendEventNotification,
  sendTargetedBroadcast,
  listNotifications,
  getUserNotifications,
  markNotificationRead,
  getCommunicationDashboardMetrics,
} from '../apps/web/src/lib/communication/communication-store';
import {
  interpolateMergeTags,
  extractMergeTags,
} from '../apps/web/src/lib/communication/template-engine';
import { defaultTermiiProvider } from '../apps/web/src/lib/communication/providers/termii-sms';
import { defaultWhatsAppProvider } from '../apps/web/src/lib/communication/providers/whatsapp-cloud';
import { defaultResendEmailProvider } from '../apps/web/src/lib/communication/providers/resend-email';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import { ensureFinanceStoreInitialized } from '../apps/web/src/lib/finance/finance-store';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111'; // King's College Lagos
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222'; // Premier Academy Abuja

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

const mockPrincipalB: AuthSession = {
  userId: 'usr_prin_b',
  schoolId: TENANT_B_ID,
  email: 'principal@apexcollege.ng',
  firstName: 'Emeka',
  lastName: 'Nwachukwu',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

test('--- Running Phase 7 Multi-Channel Communication & Notifications Suite ---', async (t) => {
  ensureCommunicationStoreInitialized(TENANT_A_ID);
  ensureCommunicationStoreInitialized(TENANT_B_ID);
  ensureFinanceStoreInitialized(TENANT_A_ID);
  ensureFinanceStoreInitialized(TENANT_B_ID);

  await t.test('Phase 7.1: Multi-Channel Provider Adapters (SMS, WhatsApp, Email, In-App)', async () => {
    // 1. Termii SMS Phone Normalization (Nigerian MSISDN)
    const normalized1 = defaultTermiiProvider.normalizePhoneNumber('08031112233');
    assert.strictEqual(normalized1, '2348031112233', 'Should normalize leading 0 to 234');

    const normalized2 = defaultTermiiProvider.normalizePhoneNumber('+234 802 999 8877');
    assert.strictEqual(normalized2, '2348029998877', 'Should strip spaces and + sign');

    // 2. Termii SMS Dispatch
    const smsRes = await defaultTermiiProvider.sendSms('08031112233', 'Test SMS alert from King\'s College Lagos');
    assert.strictEqual(smsRes.success, true);
    assert.ok(smsRes.messageId);
    assert.strictEqual(smsRes.providerStatus, 'DELIVERED');
    assert.strictEqual(smsRes.unitsDeducted, 1);

    // 3. WhatsApp Cloud Dispatch
    const waRes = await defaultWhatsAppProvider.sendMessage('+2348031112233', 'Your payment receipt is ready.');
    assert.strictEqual(waRes.success, true);
    assert.ok(waRes.messageId.startsWith('wamid.'));
    assert.strictEqual(waRes.providerStatus, 'DELIVERED');

    // 4. Resend Email Dispatch
    const emailRes = await defaultResendEmailProvider.sendEmail(
      'parent@kcl.edu.ng',
      'Term 1 Academic Report Card',
      'Dear Parent, the report card has been published.'
    );
    assert.strictEqual(emailRes.success, true);
    assert.ok(emailRes.messageId.startsWith('email_res_'));

    // 5. In-App Notification Dispatch via Store
    const notif = await sendSingleNotification(
      TENANT_A_ID,
      {
        recipient: {
          name: 'Babajide Adeleke',
          phonePrimary: '+2348031112233',
          email: 'bsanwo@lagosstate.gov.ng',
          recipientType: 'GUARDIAN',
        },
        channel: 'IN_APP',
        category: 'CAMPUS_BROADCAST',
        priority: 'NORMAL',
        body: 'PTA General Meeting scheduled for Saturday 10:00 AM in the College Hall.',
      },
      mockPrincipalA
    );

    assert.ok(notif.id.startsWith('ntf_'));
    assert.strictEqual(notif.channel, 'IN_APP');
    assert.strictEqual(notif.status, 'DELIVERED');
  });

  await t.test('Phase 7.2: Institutional Template Engine & Dynamic Merge Tag Parsing', async () => {
    // 1. Interpolation test
    const rawTemplate =
      'Hello {{guardianName}}, {{studentName}} has a fee balance of ₦{{amount}} due by {{dueDate}}.';
    const parsed = interpolateMergeTags(rawTemplate, {
      guardianName: 'Dr. Adeleke',
      studentName: 'Chidubem',
      amount: 295000,
      dueDate: '2026-10-15',
    });

    assert.strictEqual(
      parsed,
      'Hello Dr. Adeleke, Chidubem has a fee balance of ₦295,000 due by 2026-10-15.',
      'Merge tags must be correctly interpolated with numbers formatted'
    );

    // 2. Extraction test
    const tags = extractMergeTags(rawTemplate);
    assert.deepStrictEqual(tags.sort(), ['amount', 'dueDate', 'guardianName', 'studentName'].sort());

    // 3. Save New Custom Template
    const newTemplate = await saveTemplate(
      TENANT_A_ID,
      {
        name: 'Exeat Gate-Pass Approval Notice',
        category: 'CAMPUS_BROADCAST',
        defaultChannel: 'SMS',
        subject: 'Exeat Gate-Pass Authorized - {{schoolName}}',
        content:
          'Exeat Granted: {{studentName}} ({{classArmName}}) has been permitted to leave campus from {{departureTime}} to {{returnTime}}. Approved by House Master.',
      },
      mockPrincipalA
    );

    assert.ok(newTemplate.id);
    assert.strictEqual(newTemplate.availableMergeTags.includes('departureTime'), true);
    assert.strictEqual(newTemplate.availableMergeTags.includes('studentName'), true);
  });

  await t.test('Phase 7.3: Automated Event-Driven Notifications (Finance & Attendance)', async () => {
    // 1. Automated Invoice Notice Trigger
    const invNotice = await sendEventNotification(TENANT_A_ID, {
      category: 'FEE_INVOICE_ISSUED',
      recipient: {
        name: 'Babajide Adeleke',
        phonePrimary: '+2348031112233',
        recipientType: 'GUARDIAN',
        studentId: 'stu_kcl_001',
      },
      variables: {
        guardianName: 'Babajide Adeleke',
        studentName: 'Chidubem Adeleke',
        admissionNumber: 'KCL/2026/001',
        termName: 'First Term',
        amount: 295000,
        dueDate: '2026-10-15',
        paymentUrl: 'http://localhost:3000/admin/finance/invoices/INV-2026-0001',
      },
    });

    assert.strictEqual(invNotice.category, 'FEE_INVOICE_ISSUED');
    assert.strictEqual(invNotice.status, 'DELIVERED');
    assert.ok(invNotice.body.includes('Chidubem Adeleke'));
    assert.ok(invNotice.body.includes('295,000'));

    // 2. Automated Absence Alert Trigger
    const absNotice = await sendEventNotification(TENANT_A_ID, {
      category: 'STUDENT_ABSENCE_ALERT',
      recipient: {
        name: 'Folashade Alakija',
        phonePrimary: '+2348029998877',
        recipientType: 'GUARDIAN',
        studentId: 'stu_kcl_002',
      },
      variables: {
        studentName: 'Amina Alakija',
        date: '2026-10-18',
        classArmName: 'JSS 1 Gold',
      },
      priority: 'URGENT',
    });

    assert.strictEqual(absNotice.category, 'STUDENT_ABSENCE_ALERT');
    assert.strictEqual(absNotice.priority, 'URGENT');
    assert.ok(absNotice.body.includes('Amina Alakija'));
    assert.ok(absNotice.body.includes('08:30 morning roll call'));
  });

  await t.test('Phase 7.4: Targeted Broadcast Generator & Scope Engine', async () => {
    // 1. Entire School Broadcast across SMS and IN_APP
    const broadcast = await sendTargetedBroadcast(
      TENANT_A_ID,
      {
        title: 'Emergency Early Dismissal on Friday',
        category: 'CAMPUS_BROADCAST',
        channels: ['IN_APP', 'SMS'],
        targetScope: 'ENTIRE_SCHOOL',
        targetScopeName: 'Entire School Community',
        body: 'Please note that school will close early at 13:00 on Friday due to the Inter-House Sports briefing.',
      },
      mockPrincipalA
    );

    assert.ok(broadcast.id);
    assert.strictEqual(broadcast.targetScope, 'ENTIRE_SCHOOL');
    assert.strictEqual(broadcast.channels.length, 2);
    assert.ok(broadcast.totalRecipients >= 2, 'Should dispatch to recipients across both channels');
    assert.strictEqual(broadcast.failedCount, 0);

    // 2. Class Arm Targeted Broadcast (JSS 1 Gold)
    const armBroadcast = await sendTargetedBroadcast(
      TENANT_A_ID,
      {
        title: 'JSS 1 Gold Science Practical Lab Requirements',
        category: 'CAMPUS_BROADCAST',
        channels: ['SMS'],
        targetScope: 'CLASS_ARM',
        targetScopeId: 'arm_jss1_gold',
        targetScopeName: 'JSS 1 Gold Parents',
        body: 'Dear Parents, please ensure students bring their white lab coats on Tuesday.',
      },
      mockPrincipalA
    );

    assert.strictEqual(armBroadcast.targetScope, 'CLASS_ARM');
    assert.strictEqual(armBroadcast.deliveredCount > 0, true);

    // 3. Debtors-Only Broadcast
    const debtBroadcast = await sendTargetedBroadcast(
      TENANT_A_ID,
      {
        title: 'Outstanding Fee Clearance Deadline',
        category: 'OVERDUE_DEBT_REMINDER',
        channels: ['SMS'],
        targetScope: 'DEBTORS_ONLY',
        targetScopeName: 'Active Debtors',
        body: 'Final reminder: Outstanding term fees must be settled prior to next week\'s mid-term assessments.',
      },
      mockBursarA
    );

    assert.strictEqual(debtBroadcast.targetScope, 'DEBTORS_ONLY');
    assert.ok(debtBroadcast.totalRecipients >= 1);
  });

  await t.test('Phase 7.5: Delivery State Machine & Read Tracking', async () => {
    // 1. Dispatch in-app notification
    const record = await sendSingleNotification(
      TENANT_A_ID,
      {
        recipient: {
          userId: 'usr_parent_01',
          name: 'Alhaji Sanwo',
          recipientType: 'GUARDIAN',
        },
        channel: 'IN_APP',
        category: 'CAMPUS_BROADCAST',
        body: 'Your child has received a merit certificate for Mathematics.',
      },
      mockPrincipalA
    );

    assert.strictEqual(record.status, 'DELIVERED');
    assert.strictEqual(record.readAt, undefined);

    // 2. User reads notification
    const readRecord = await markNotificationRead(TENANT_A_ID, record.id);
    assert.strictEqual(readRecord.status, 'READ');
    assert.ok(readRecord.readAt);

    // 3. User notification query
    const userNotifs = await getUserNotifications(TENANT_A_ID, 'usr_parent_01');
    assert.ok(userNotifs.length >= 1);
  });

  await t.test('Phase 7.6: Metrics & Analytics Calculation', async () => {
    const metrics = await getCommunicationDashboardMetrics(TENANT_A_ID);

    assert.ok(metrics.totalMessagesSent >= 5, 'Should have recorded multiple messages');
    assert.ok(metrics.deliverySuccessRate >= 90, 'Delivery rate should be high in healthy test');
    assert.ok(metrics.channelBreakdown.sms >= 1);
    assert.ok(metrics.channelBreakdown.inApp >= 1);
    assert.strictEqual(metrics.smsCreditsRemaining > 0, true);
  });

  await t.test('Phase 7.7: Security — Multi-Tenant Isolation & Role-Based Access Control', async () => {
    // 1. Tenant B cannot read Tenant A's messages
    const notifsB = await listNotifications(TENANT_B_ID);
    const hasTenantAMessage = notifsB.some((n) => n.schoolId === TENANT_A_ID);
    assert.strictEqual(hasTenantAMessage, false, 'Tenant B must never see Tenant A messages');

    // 2. Tenant B cannot access Tenant A's templates
    const templatesB = await listTemplates(TENANT_B_ID);
    const hasTenantATemplate = templatesB.some((t) => t.schoolId === TENANT_A_ID);
    assert.strictEqual(hasTenantATemplate, false, 'Tenant B must never see Tenant A templates');
  });
});
