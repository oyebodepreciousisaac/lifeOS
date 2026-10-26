import {
  NotificationTemplate,
  NotificationRecord,
  BroadcastSummary,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  CommunicationDashboardMetrics,
  SendSingleNotificationInput,
  SendSingleNotificationSchema,
  CreateBroadcastInput,
  CreateBroadcastSchema,
  SaveTemplateInput,
  SaveTemplateSchema,
  NotificationRecipient,
} from './communication-types';
import {
  DEFAULT_INSTITUTIONAL_TEMPLATES,
  interpolateMergeTags,
  extractMergeTags,
} from './template-engine';
import { defaultTermiiProvider } from './providers/termii-sms';
import { defaultWhatsAppProvider } from './providers/whatsapp-cloud';
import { defaultResendEmailProvider } from './providers/resend-email';
import { AuthSession } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import { listStudents } from '../sis/sis-store';
import { generateAgingDebtorsReport } from '../finance/finance-store';

// ------------------------------------------------------------------------------
// Multi-Tenant In-Memory Storage
// ------------------------------------------------------------------------------

const notificationsStore: Map<string, NotificationRecord[]> = new Map();
const templatesStore: Map<string, NotificationTemplate[]> = new Map();
const broadcastsStore: Map<string, BroadcastSummary[]> = new Map();

export function ensureCommunicationStoreInitialized(schoolId: string) {
  if (!templatesStore.has(schoolId)) {
    // Seed default institutional templates
    const initialTemplates: NotificationTemplate[] = DEFAULT_INSTITUTIONAL_TEMPLATES.map(
      (tpl, idx) => ({
        ...tpl,
        id: `tpl_${schoolId}_${idx + 1}`,
        schoolId,
        createdAt: new Date('2026-09-01T08:00:00Z').toISOString(),
        updatedAt: new Date('2026-09-01T08:00:00Z').toISOString(),
      })
    );
    templatesStore.set(schoolId, initialTemplates);
  }

  if (!notificationsStore.has(schoolId)) {
    // Seed sample dispatch history for demonstration
    const seedNotifications: NotificationRecord[] = [
      {
        id: `ntf_${schoolId}_01`,
        schoolId,
        category: 'FEE_INVOICE_ISSUED',
        channel: 'SMS',
        priority: 'HIGH',
        recipient: {
          name: 'Babajide Adeleke',
          phonePrimary: '+234 803 111 2233',
          email: 'bsanwo@lagosstate.gov.ng',
          recipientType: 'GUARDIAN',
          classArmName: 'JSS 1 Gold',
          studentId: 'stu_kcl_001',
        },
        body: 'Dear Babajide Adeleke, the First Term bill of ₦295,000 for Chidubem Adeleke (KCL/2026/001) has been generated. Due date: 2026-10-15. Settle online: http://localhost:3000/admin/finance/invoices/INV-2026-0001 - King\'s College Lagos',
        status: 'DELIVERED',
        retryCount: 0,
        providerReference: 'TRM-SIM-998811',
        queuedAt: '2026-09-14T08:10:00Z',
        sentAt: '2026-09-14T08:10:02Z',
        deliveredAt: '2026-09-14T08:10:05Z',
        dispatchedByName: 'Automated Billing Service',
      },
      {
        id: `ntf_${schoolId}_02`,
        schoolId,
        category: 'PAYMENT_RECEIPT_CONFIRMED',
        channel: 'WHATSAPP',
        priority: 'NORMAL',
        recipient: {
          name: 'Babajide Adeleke',
          phonePrimary: '+234 803 111 2233',
          recipientType: 'GUARDIAN',
          classArmName: 'JSS 1 Gold',
          studentId: 'stu_kcl_001',
        },
        body: 'Payment Confirmed! ₦150,000 received for Chidubem Adeleke (KCL/2026/001). Receipt #REC-2026-0001. Outstanding Balance: ₦145,000. Thank you, King\'s College Lagos.',
        status: 'READ',
        retryCount: 0,
        providerReference: 'wamid.HBgM987654321',
        queuedAt: '2026-09-20T10:31:00Z',
        sentAt: '2026-09-20T10:31:01Z',
        deliveredAt: '2026-09-20T10:31:03Z',
        readAt: '2026-09-20T10:35:12Z',
        dispatchedByName: 'Paystack Automated Webhook',
      },
      {
        id: `ntf_${schoolId}_03`,
        schoolId,
        category: 'STUDENT_ABSENCE_ALERT',
        channel: 'SMS',
        priority: 'URGENT',
        recipient: {
          name: 'Folashade Alakija',
          phonePrimary: '+234 802 999 8877',
          email: 'falakija@famfa.com',
          recipientType: 'GUARDIAN',
          classArmName: 'JSS 1 Gold',
          studentId: 'stu_kcl_002',
        },
        body: 'ATTENDANCE ALERT: Amina Alakija was marked ABSENT at 08:30 morning roll call today (2026-10-12) at King\'s College Lagos. If this is an error or emergency, please contact the Vice Principal.',
        status: 'DELIVERED',
        retryCount: 0,
        providerReference: 'TRM-SIM-442211',
        queuedAt: '2026-10-12T08:31:00Z',
        sentAt: '2026-10-12T08:31:02Z',
        deliveredAt: '2026-10-12T08:31:06Z',
        dispatchedByName: 'Attendance Roll Call Engine',
      },
    ];
    notificationsStore.set(schoolId, seedNotifications);
  }

  if (!broadcastsStore.has(schoolId)) {
    broadcastsStore.set(schoolId, [
      {
        id: `bc_${schoolId}_01`,
        schoolId,
        title: 'Mid-Term Break Campus Schedule & Exeat Protocols',
        category: 'CAMPUS_BROADCAST',
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        targetScope: 'ENTIRE_SCHOOL',
        targetScopeName: 'All Parents & Guardians',
        totalRecipients: 420,
        sentCount: 420,
        deliveredCount: 418,
        failedCount: 2,
        readCount: 385,
        createdAt: '2026-10-14T14:00:00Z',
        senderName: 'Principal Adeyemi Ogunlesi',
      },
    ]);
  }
}

// ------------------------------------------------------------------------------
// Template Management
// ------------------------------------------------------------------------------

export async function listTemplates(schoolId: string): Promise<NotificationTemplate[]> {
  ensureCommunicationStoreInitialized(schoolId);
  return templatesStore.get(schoolId) || [];
}

export async function saveTemplate(
  schoolId: string,
  input: SaveTemplateInput,
  actor: AuthSession
): Promise<NotificationTemplate> {
  ensureCommunicationStoreInitialized(schoolId);
  const validated = SaveTemplateSchema.parse(input);

  const templates = templatesStore.get(schoolId)!;
  const existingIdx = templates.findIndex((t) => t.name.toLowerCase() === validated.name.toLowerCase());

  const availableMergeTags = extractMergeTags(validated.content);

  const updatedOrNew: NotificationTemplate = {
    id: existingIdx >= 0 ? templates[existingIdx].id : `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    name: validated.name.trim(),
    category: validated.category,
    defaultChannel: validated.defaultChannel,
    subject: validated.subject,
    content: validated.content.trim(),
    availableMergeTags,
    isActive: true,
    createdAt: existingIdx >= 0 ? templates[existingIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    templates[existingIdx] = updatedOrNew;
  } else {
    templates.push(updatedOrNew);
  }

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: existingIdx >= 0 ? 'UPDATE' : 'CREATE',
    resourceType: 'COMMUNICATION_TEMPLATE',
    resourceId: updatedOrNew.id,
    afterState: updatedOrNew,
  });

  return updatedOrNew;
}

// ------------------------------------------------------------------------------
// Single Notification Dispatcher (Multi-Channel)
// ------------------------------------------------------------------------------

export async function sendSingleNotification(
  schoolId: string,
  input: SendSingleNotificationInput,
  actor?: AuthSession
): Promise<NotificationRecord> {
  ensureCommunicationStoreInitialized(schoolId);
  const validated = SendSingleNotificationSchema.parse(input);

  const notificationId = `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let providerStatus: string = 'DELIVERED';
  let providerReference: string | undefined;
  let deliveryError: string | undefined;

  try {
    if (validated.channel === 'SMS') {
      const phone = validated.recipient.phonePrimary || '+2348030000000';
      const result = await defaultTermiiProvider.sendSms(phone, validated.body);
      providerStatus = result.providerStatus;
      providerReference = result.messageId;
      if (!result.success) deliveryError = result.error;
    } else if (validated.channel === 'WHATSAPP') {
      const phone = validated.recipient.phonePrimary || '+2348030000000';
      const result = await defaultWhatsAppProvider.sendMessage(phone, validated.body);
      providerStatus = result.providerStatus;
      providerReference = result.messageId;
      if (!result.success) deliveryError = result.error;
    } else if (validated.channel === 'EMAIL') {
      const email = validated.recipient.email || 'guardian@kcl.edu.ng';
      const result = await defaultResendEmailProvider.sendEmail(
        email,
        validated.subject || 'SchoolOS Notification',
        validated.body
      );
      providerStatus = result.providerStatus;
      providerReference = result.messageId;
      if (!result.success) deliveryError = result.error;
    } else {
      // IN_APP
      providerStatus = 'DELIVERED';
      providerReference = `INAPP-${notificationId}`;
    }
  } catch (err: any) {
    providerStatus = 'FAILED';
    deliveryError = err.message;
  }

  const record: NotificationRecord = {
    id: notificationId,
    schoolId,
    category: validated.category,
    channel: validated.channel,
    priority: validated.priority,
    recipient: validated.recipient,
    subject: validated.subject,
    body: validated.body,
    metadata: validated.metadata,
    status: providerStatus === 'DELIVERED' ? 'DELIVERED' : 'FAILED',
    retryCount: 0,
    providerReference,
    deliveryError,
    queuedAt: now,
    sentAt: now,
    deliveredAt: providerStatus === 'DELIVERED' ? now : undefined,
    dispatchedById: actor?.userId || 'system',
    dispatchedByName: actor ? `${actor.firstName} ${actor.lastName}` : 'Automated System Dispatcher',
  };

  const notifications = notificationsStore.get(schoolId)!;
  notifications.unshift(record);

  return record;
}

// ------------------------------------------------------------------------------
// Automated Event-Driven Notification Dispatcher
// ------------------------------------------------------------------------------

export async function sendEventNotification(
  schoolId: string,
  event: {
    category: NotificationCategory;
    recipient: NotificationRecipient;
    variables: Record<string, string | number | undefined | null>;
    priority?: NotificationPriority;
    channelOverride?: NotificationChannel;
  }
): Promise<NotificationRecord> {
  ensureCommunicationStoreInitialized(schoolId);
  const templates = templatesStore.get(schoolId)!;

  // Find corresponding template or fallback to generic message
  const template = templates.find((t) => t.category === event.category && t.isActive);

  let body: string;
  let subject: string | undefined;
  let channel: NotificationChannel = event.channelOverride || template?.defaultChannel || 'SMS';

  if (template) {
    body = interpolateMergeTags(template.content, {
      ...event.variables,
      schoolName: 'King\'s College Lagos',
    });
    if (template.subject) {
      subject = interpolateMergeTags(template.subject, {
        ...event.variables,
        schoolName: 'King\'s College Lagos',
      });
    }
  } else {
    body = `Notice regarding ${event.category}: ${JSON.stringify(event.variables)}`;
  }

  return sendSingleNotification(schoolId, {
    recipient: event.recipient,
    channel,
    category: event.category,
    priority: event.priority || 'NORMAL',
    subject,
    body,
    metadata: event.variables as any,
  });
}

// ------------------------------------------------------------------------------
// Targeted Broadcast Dispatch Engine
// ------------------------------------------------------------------------------

export async function sendTargetedBroadcast(
  schoolId: string,
  input: CreateBroadcastInput,
  actor: AuthSession
): Promise<BroadcastSummary> {
  ensureCommunicationStoreInitialized(schoolId);
  const validated = CreateBroadcastSchema.parse(input);

  // 1. Resolve Target Recipients
  let recipients: NotificationRecipient[] = [];

  const allStudents = await listStudents(schoolId, {}, actor);

  if (validated.targetScope === 'ENTIRE_SCHOOL') {
    for (const s of allStudents) {
      const primaryG = s.guardians?.find((g) => g.isPrimaryContact) || s.guardians?.[0];
      if (primaryG?.guardian) {
        recipients.push({
          studentId: s.id,
          name: `${primaryG.guardian.firstName} ${primaryG.guardian.lastName}`,
          phonePrimary: primaryG.guardian.phonePrimary,
          email: primaryG.guardian.email,
          recipientType: 'GUARDIAN',
          classArmName: s.currentClassArmName,
        });
      }
    }
  } else if (validated.targetScope === 'CLASS_ARM') {
    const targetArmId = validated.targetScopeId || 'arm_jss1_gold';
    const classStudents = allStudents.filter(
      (s) =>
        s.currentClassArmId === targetArmId ||
        s.currentClassArmName.toLowerCase().includes(targetArmId.toLowerCase())
    );

    for (const s of classStudents) {
      const primaryG = s.guardians?.find((g) => g.isPrimaryContact) || s.guardians?.[0];
      if (primaryG?.guardian) {
        recipients.push({
          studentId: s.id,
          name: `${primaryG.guardian.firstName} ${primaryG.guardian.lastName}`,
          phonePrimary: primaryG.guardian.phonePrimary,
          email: primaryG.guardian.email,
          recipientType: 'GUARDIAN',
          classArmName: s.currentClassArmName,
        });
      }
    }
  } else if (validated.targetScope === 'DEBTORS_ONLY') {
    const debtorsReport = await generateAgingDebtorsReport(schoolId);
    for (const d of debtorsReport.topDebtors) {
      recipients.push({
        studentId: d.studentId,
        name: d.guardianName,
        phonePrimary: d.guardianPhone,
        recipientType: 'GUARDIAN',
        classArmName: d.classArmName,
      });
    }
  }

  // Fallback if no students enrolled
  if (recipients.length === 0) {
    recipients = [
      {
        name: 'Babajide Adeleke',
        phonePrimary: '+234 803 111 2233',
        email: 'bsanwo@lagosstate.gov.ng',
        recipientType: 'GUARDIAN',
        classArmName: 'JSS 1 Gold',
      },
    ];
  }

  // Deduplicate recipients by phone or email
  const uniqueRecipients = new Map<string, NotificationRecipient>();
  for (const r of recipients) {
    const key = r.phonePrimary || r.email || r.name;
    if (!uniqueRecipients.has(key)) {
      uniqueRecipients.set(key, r);
    }
  }
  const targetList = Array.from(uniqueRecipients.values());

  let sentCount = 0;
  let deliveredCount = 0;
  let failedCount = 0;

  // 2. Dispatch notifications across all chosen channels
  for (const recipient of targetList) {
    for (const channel of validated.channels) {
      try {
        const notif = await sendSingleNotification(
          schoolId,
          {
            recipient,
            channel,
            category: validated.category,
            priority: 'NORMAL',
            subject: validated.subject,
            body: validated.body,
          },
          actor
        );

        sentCount++;
        if (notif.status === 'DELIVERED') deliveredCount++;
        else failedCount++;
      } catch {
        sentCount++;
        failedCount++;
      }
    }
  }

  const broadcast: BroadcastSummary = {
    id: `bc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schoolId,
    title: validated.title,
    category: validated.category,
    channels: validated.channels,
    targetScope: validated.targetScope,
    targetScopeId: validated.targetScopeId,
    targetScopeName: validated.targetScopeName || validated.targetScope,
    totalRecipients: targetList.length * validated.channels.length,
    sentCount,
    deliveredCount,
    failedCount,
    readCount: 0,
    createdAt: new Date().toISOString(),
    senderName: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
  };

  const broadcasts = broadcastsStore.get(schoolId)!;
  broadcasts.unshift(broadcast);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CREATE',
    resourceType: 'COMMUNICATION_BROADCAST',
    resourceId: broadcast.id,
    afterState: { title: broadcast.title, totalDispatched: sentCount },
  });

  return broadcast;
}

// ------------------------------------------------------------------------------
// Notifications List & Read Tracker
// ------------------------------------------------------------------------------

export async function listNotifications(
  schoolId: string,
  filters?: {
    channel?: string;
    status?: string;
    category?: string;
    search?: string;
  }
): Promise<NotificationRecord[]> {
  ensureCommunicationStoreInitialized(schoolId);
  let list = notificationsStore.get(schoolId) || [];

  if (filters?.channel && filters.channel !== 'ALL') {
    list = list.filter((n) => n.channel === filters.channel);
  }
  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter((n) => n.status === filters.status);
  }
  if (filters?.category && filters.category !== 'ALL') {
    list = list.filter((n) => n.category === filters.category);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (n) =>
        n.recipient.name.toLowerCase().includes(q) ||
        (n.recipient.phonePrimary && n.recipient.phonePrimary.includes(q)) ||
        (n.recipient.email && n.recipient.email.toLowerCase().includes(q)) ||
        n.body.toLowerCase().includes(q) ||
        (n.subject && n.subject.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getUserNotifications(
  schoolId: string,
  userIdOrStudentId: string,
  unreadOnly?: boolean
): Promise<NotificationRecord[]> {
  ensureCommunicationStoreInitialized(schoolId);
  const list = notificationsStore.get(schoolId) || [];

  return list.filter((n) => {
    const matchesUser =
      n.recipient.userId === userIdOrStudentId ||
      n.recipient.studentId === userIdOrStudentId;
    if (!matchesUser) return false;
    if (unreadOnly) return n.status !== 'READ';
    return true;
  });
}

export async function markNotificationRead(
  schoolId: string,
  notificationId: string
): Promise<NotificationRecord> {
  ensureCommunicationStoreInitialized(schoolId);
  const list = notificationsStore.get(schoolId) || [];
  const notif = list.find((n) => n.id === notificationId);

  if (!notif) {
    throw new Error(`Notification ${notificationId} not found.`);
  }

  notif.status = 'READ';
  notif.readAt = new Date().toISOString();

  return notif;
}

// ------------------------------------------------------------------------------
// Communication Dashboard Metrics
// ------------------------------------------------------------------------------

export async function getCommunicationDashboardMetrics(
  schoolId: string
): Promise<CommunicationDashboardMetrics> {
  ensureCommunicationStoreInitialized(schoolId);
  const list = notificationsStore.get(schoolId) || [];

  const totalMessagesSent = list.length;
  const delivered = list.filter((n) => n.status === 'DELIVERED' || n.status === 'READ').length;
  const failed = list.filter((n) => n.status === 'FAILED').length;

  const deliverySuccessRate =
    totalMessagesSent > 0 ? Math.round((delivered / totalMessagesSent) * 100) : 100;

  const channelBreakdown = {
    inApp: list.filter((n) => n.channel === 'IN_APP').length,
    sms: list.filter((n) => n.channel === 'SMS').length,
    whatsapp: list.filter((n) => n.channel === 'WHATSAPP').length,
    email: list.filter((n) => n.channel === 'EMAIL').length,
  };

  return {
    totalMessagesSent,
    deliverySuccessRate,
    channelBreakdown,
    smsCreditsRemaining: 2450, // Standard balance allowance for demonstration
    recentFailuresCount: failed,
  };
}
