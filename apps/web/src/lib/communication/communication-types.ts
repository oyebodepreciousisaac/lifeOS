import { z } from 'zod';

// ------------------------------------------------------------------------------
// Channel & Delivery Enums
// ------------------------------------------------------------------------------

export const NOTIFICATION_CHANNELS = ['IN_APP', 'SMS', 'WHATSAPP', 'EMAIL'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const DELIVERY_STATUSES = ['QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const NOTIFICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_CATEGORIES = [
  'FEE_INVOICE_ISSUED',
  'PAYMENT_RECEIPT_CONFIRMED',
  'OVERDUE_DEBT_REMINDER',
  'STUDENT_ABSENCE_ALERT',
  'REPORT_CARD_PUBLISHED',
  'ADMISSIONS_OFFER_ISSUED',
  'CAMPUS_BROADCAST',
  'SECURITY_MFA_ALERT',
  'OTHER',
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const RECIPIENT_TYPES = ['GUARDIAN', 'STUDENT', 'TEACHER', 'STAFF', 'ADMIN'] as const;
export type RecipientType = (typeof RECIPIENT_TYPES)[number];

export const BROADCAST_TARGET_SCOPES = [
  'ENTIRE_SCHOOL',
  'CLASS_LEVEL',
  'CLASS_ARM',
  'DEBTORS_ONLY',
  'INDIVIDUAL',
] as const;
export type BroadcastTargetScope = (typeof BROADCAST_TARGET_SCOPES)[number];

// ------------------------------------------------------------------------------
// Domain Interfaces
// ------------------------------------------------------------------------------

export interface NotificationTemplate {
  id: string;
  schoolId: string;
  name: string;
  category: NotificationCategory;
  defaultChannel: NotificationChannel;
  subject?: string;
  content: string; // Contains merge tags e.g. {{studentName}}, {{amount}}, {{dueDate}}
  availableMergeTags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  userId?: string;
  studentId?: string;
  name: string;
  phonePrimary?: string;
  email?: string;
  recipientType: RecipientType;
  classArmName?: string;
}

export interface NotificationRecord {
  id: string;
  schoolId: string;
  templateId?: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  priority: NotificationPriority;
  recipient: NotificationRecipient;
  subject?: string;
  body: string;
  metadata?: Record<string, any>;
  status: DeliveryStatus;
  retryCount: number;
  providerReference?: string;
  deliveryError?: string;
  queuedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  dispatchedById?: string;
  dispatchedByName?: string;
}

export interface BroadcastSummary {
  id: string;
  schoolId: string;
  title: string;
  category: NotificationCategory;
  channels: NotificationChannel[];
  targetScope: BroadcastTargetScope;
  targetScopeId?: string;
  targetScopeName?: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  readCount: number;
  createdAt: string;
  senderName: string;
}

export interface CommunicationDashboardMetrics {
  totalMessagesSent: number;
  deliverySuccessRate: number; // percentage e.g. 98%
  channelBreakdown: {
    inApp: number;
    sms: number;
    whatsapp: number;
    email: number;
  };
  smsCreditsRemaining: number;
  recentFailuresCount: number;
}

// ------------------------------------------------------------------------------
// Zod Validation Schemas
// ------------------------------------------------------------------------------

export const SendSingleNotificationSchema = z.object({
  recipient: z.object({
    userId: z.string().optional(),
    studentId: z.string().optional(),
    name: z.string().min(1, 'Recipient name is required'),
    phonePrimary: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    recipientType: z.enum(RECIPIENT_TYPES),
    classArmName: z.string().optional(),
  }),
  channel: z.enum(NOTIFICATION_CHANNELS),
  category: z.enum(NOTIFICATION_CATEGORIES),
  priority: z.enum(NOTIFICATION_PRIORITIES).default('NORMAL'),
  subject: z.string().optional(),
  body: z.string().min(2, 'Message body cannot be empty'),
  metadata: z.record(z.any()).optional(),
});
export type SendSingleNotificationInput = z.infer<typeof SendSingleNotificationSchema>;

export const CreateBroadcastSchema = z.object({
  title: z.string().min(3, 'Broadcast title must be at least 3 characters'),
  category: z.enum(NOTIFICATION_CATEGORIES),
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)).min(1, 'At least one channel must be selected'),
  targetScope: z.enum(BROADCAST_TARGET_SCOPES),
  targetScopeId: z.string().optional(),
  targetScopeName: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(3, 'Broadcast message body cannot be empty'),
});
export type CreateBroadcastInput = z.infer<typeof CreateBroadcastSchema>;

export const SaveTemplateSchema = z.object({
  name: z.string().min(3, 'Template name is required'),
  category: z.enum(NOTIFICATION_CATEGORIES),
  defaultChannel: z.enum(NOTIFICATION_CHANNELS),
  subject: z.string().optional(),
  content: z.string().min(5, 'Template content is required'),
});
export type SaveTemplateInput = z.infer<typeof SaveTemplateSchema>;
