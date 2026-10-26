import { NotificationTemplate, NotificationCategory } from './communication-types';

export const DEFAULT_INSTITUTIONAL_TEMPLATES: Omit<
  NotificationTemplate,
  'id' | 'schoolId' | 'createdAt' | 'updatedAt'
>[] = [
  {
    name: 'Fee Invoice Issued Notice',
    category: 'FEE_INVOICE_ISSUED',
    defaultChannel: 'SMS',
    subject: 'School Fee Invoice Issued - {{schoolName}}',
    content:
      'Dear {{guardianName}}, the {{termName}} bill of ₦{{amount}} for {{studentName}} ({{admissionNumber}}) has been generated. Due date: {{dueDate}}. Settle online: {{paymentUrl}} - {{schoolName}}',
    availableMergeTags: [
      'guardianName',
      'studentName',
      'admissionNumber',
      'termName',
      'amount',
      'dueDate',
      'paymentUrl',
      'schoolName',
    ],
    isActive: true,
  },
  {
    name: 'Instant Payment Confirmation & Receipt',
    category: 'PAYMENT_RECEIPT_CONFIRMED',
    defaultChannel: 'SMS',
    subject: 'Official Fee Payment Receipt - {{schoolName}}',
    content:
      'Payment Confirmed! ₦{{amount}} received for {{studentName}} ({{admissionNumber}}). Receipt #{{receiptNumber}}. Outstanding Balance: ₦{{balanceDue}}. Thank you, {{schoolName}}.',
    availableMergeTags: [
      'studentName',
      'admissionNumber',
      'amount',
      'receiptNumber',
      'balanceDue',
      'schoolName',
    ],
    isActive: true,
  },
  {
    name: 'Delinquent Overdue Fee Reminder',
    category: 'OVERDUE_DEBT_REMINDER',
    defaultChannel: 'SMS',
    subject: 'Urgent: Overdue School Fee Reminder - {{schoolName}}',
    content:
      'Gentle Fee Reminder: {{studentName}} has an outstanding balance of ₦{{amount}} overdue since {{dueDate}}. Kindly settle promptly to ensure uninterrupted academic clearance: {{paymentUrl}}',
    availableMergeTags: [
      'studentName',
      'admissionNumber',
      'amount',
      'dueDate',
      'paymentUrl',
      'schoolName',
    ],
    isActive: true,
  },
  {
    name: 'Morning Roll Call Absence Alert',
    category: 'STUDENT_ABSENCE_ALERT',
    defaultChannel: 'SMS',
    subject: 'Student Attendance Alert - {{schoolName}}',
    content:
      'ATTENDANCE ALERT: {{studentName}} was marked ABSENT at 08:30 morning roll call today ({{date}}) at {{schoolName}}. If this is an error or emergency, please contact the Vice Principal.',
    availableMergeTags: [
      'studentName',
      'admissionNumber',
      'classArmName',
      'date',
      'schoolName',
    ],
    isActive: true,
  },
  {
    name: 'Official Term Report Card Published',
    category: 'REPORT_CARD_PUBLISHED',
    defaultChannel: 'EMAIL',
    subject: 'Academic Term Report Card Released - {{studentName}}',
    content:
      'Dear {{guardianName}}, the official stamped term report card for {{studentName}} ({{classArmName}}) has been sealed and published for {{termName}}. View and download with tamper-evident seal: {{verificationUrl}}',
    availableMergeTags: [
      'guardianName',
      'studentName',
      'classArmName',
      'termName',
      'verificationUrl',
      'schoolName',
    ],
    isActive: true,
  },
  {
    name: 'General Campus Broadcast Announcement',
    category: 'CAMPUS_BROADCAST',
    defaultChannel: 'IN_APP',
    subject: 'Important Announcement from {{schoolName}}',
    content:
      'Notice to all {{targetAudience}} of {{schoolName}}: {{broadcastBody}}',
    availableMergeTags: ['targetAudience', 'schoolName', 'broadcastBody'],
    isActive: true,
  },
];

/**
 * Interpolates variables into merge tags e.g. {{studentName}} -> "Chidubem Adeleke"
 */
export function interpolateMergeTags(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, key) => {
    const val = variables[key];
    if (val !== undefined && val !== null) {
      if (typeof val === 'number') {
        return val.toLocaleString();
      }
      return String(val);
    }
    return match; // Keep unresolved tag
  });
}

/**
 * Extracts list of merge tags from template content
 */
export function extractMergeTags(template: string): string[] {
  const matches = template.matchAll(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g);
  const tags = new Set<string>();
  for (const match of matches) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}
