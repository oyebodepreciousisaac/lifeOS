'use server';

import { getSession } from '../../lib/auth/session';
import {
  listTemplates,
  saveTemplate,
  sendSingleNotification,
  sendTargetedBroadcast,
  listNotifications,
  getUserNotifications,
  markNotificationRead,
  getCommunicationDashboardMetrics,
} from '../../lib/communication/communication-store';
import {
  NotificationTemplate,
  NotificationRecord,
  BroadcastSummary,
  CommunicationDashboardMetrics,
  SendSingleNotificationSchema,
  CreateBroadcastSchema,
  SaveTemplateSchema,
} from '../../lib/communication/communication-types';

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthenticatedActor() {
  const session = await getSession();
  if (!session) {
    throw new Error('401 Unauthorized: Please log in to perform communication actions.');
  }
  return session;
}

// ------------------------------------------------------------------------------
// Template Actions
// ------------------------------------------------------------------------------

export async function listTemplatesAction(): Promise<ActionResponse<NotificationTemplate[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const templates = await listTemplates(actor.schoolId);
    return { success: true, data: templates };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list communication templates.' };
  }
}

export async function saveTemplateAction(data: unknown): Promise<ActionResponse<NotificationTemplate>> {
  try {
    const actor = await getAuthenticatedActor();
    const validated = SaveTemplateSchema.parse(data);
    const template = await saveTemplate(actor.schoolId, validated, actor);
    return { success: true, data: template };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Validation failed on template.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to save communication template.' };
  }
}

// ------------------------------------------------------------------------------
// Single & Broadcast Actions
// ------------------------------------------------------------------------------

export async function sendSingleNotificationAction(
  data: unknown
): Promise<ActionResponse<NotificationRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const validated = SendSingleNotificationSchema.parse(data);
    const record = await sendSingleNotification(actor.schoolId, validated, actor);
    return { success: true, data: record };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Notification validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to send notification.' };
  }
}

export async function sendTargetedBroadcastAction(
  data: unknown
): Promise<ActionResponse<BroadcastSummary>> {
  try {
    const actor = await getAuthenticatedActor();
    const validated = CreateBroadcastSchema.parse(data);
    const summary = await sendTargetedBroadcast(actor.schoolId, validated, actor);
    return { success: true, data: summary };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Broadcast validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to send targeted broadcast.' };
  }
}

// ------------------------------------------------------------------------------
// Listing & User Inbox Actions
// ------------------------------------------------------------------------------

export async function listNotificationsAction(filters?: {
  channel?: string;
  status?: string;
  category?: string;
  search?: string;
}): Promise<ActionResponse<NotificationRecord[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const records = await listNotifications(actor.schoolId, filters);
    return { success: true, data: records };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list notifications.' };
  }
}

export async function getUserNotificationsAction(
  userIdOrStudentId: string,
  unreadOnly?: boolean
): Promise<ActionResponse<NotificationRecord[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const records = await getUserNotifications(actor.schoolId, userIdOrStudentId, unreadOnly);
    return { success: true, data: records };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get user notifications.' };
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResponse<NotificationRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const record = await markNotificationRead(actor.schoolId, notificationId);
    return { success: true, data: record };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark notification as read.' };
  }
}

export async function getCommunicationDashboardMetricsAction(): Promise<
  ActionResponse<CommunicationDashboardMetrics>
> {
  try {
    const actor = await getAuthenticatedActor();
    const metrics = await getCommunicationDashboardMetrics(actor.schoolId);
    return { success: true, data: metrics };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve communication metrics.' };
  }
}
