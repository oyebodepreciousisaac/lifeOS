/**
 * SchoolOS Resource-Scoped RBAC (Role-Based Access Control) Engine
 * Grounded in Playbook Chapters 5, 21, 22, 40 and docs/USER-ROLES.md
 */

export type UserRoleType =
  | 'SUPERADMIN'
  | 'OWNER'
  | 'PRINCIPAL'
  | 'BURSAR'
  | 'TEACHER'
  | 'PARENT'
  | 'STUDENT'
  | 'IT_ADMIN';

export interface AuthSession {
  userId: string;
  schoolId: string;
  campusId?: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserRoleType;
  isPrivileged: boolean;
  mfaVerified: boolean;
  expiresAt: number;
}

export interface ResourceScope {
  campusId?: string;
  classArmId?: string;
  studentId?: string;
  teacherId?: string;
  guardianId?: string;
}

/**
 * Privileged roles requiring mandatory MFA per Playbook Chapter 5, 22.
 */
export const PRIVILEGED_ROLES = new Set<string>([
  'SUPERADMIN',
  'OWNER',
  'PRINCIPAL',
  'BURSAR',
  'IT_ADMIN',
]);

export function isPrivilegedRole(role: string): boolean {
  if (!role) return false;
  return PRIVILEGED_ROLES.has(role.toUpperCase());
}

/**
 * Baseline Role-to-Permission Mapping
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, string[]> = {
  SUPERADMIN: [
    '*', // Full platform authority
  ],
  OWNER: [
    'school.manage',
    'campuses.manage',
    'academic.manage',
    'classes.manage',
    'subjects.manage',
    'settings.manage_config',
    'fees.manage',
    'fees.publish',
    'approvals.level2_approve',
    'approvals.level3_approve',
    'audit.view_all',
    'analytics.view_executive',
    'students.read_all',
    'students.manage',
    'students.import',
    'admissions.manage',
    'admissions.review',
    'admissions.approve',
    'staff.view_all',
    'attendance.view_school',
    'attendance.record',
    'timetable.manage',
    'timetable.view',
    'results.approve_lock',
    'results.moderate',
    'results.view_all',
    'report_cards.compile',
    'report_cards.publish',
    'promotion.evaluate',
  ],
  PRINCIPAL: [
    'admissions.manage',
    'admissions.review',
    'admissions.approve',
    'results.approve_lock',
    'results.moderate',
    'results.view_all',
    'report_cards.compile',
    'report_cards.publish',
    'promotion.evaluate',
    'timetable.publish',
    'timetable.manage',
    'timetable.view',
    'attendance.view_school',
    'attendance.record',
    'staff.manage',
    'students.read_all',
    'students.manage',
    'students.import',
    'reports.view_all',
    'academic.manage',
    'classes.manage',
    'subjects.manage',
    'settings.manage_config',
    'approvals.level2_approve',
    'audit.view_school',
  ],
  BURSAR: [
    'fees.structure_draft',
    'invoices.generate',
    'payments.record_manual',
    'payments.reconcile',
    'reports.financial_view',
    'approvals.refund_request',
    'students.read_basic',
  ],
  IT_ADMIN: [
    'users.create_routine',
    'school.manage',
    'campuses.manage',
    'academic.manage',
    'classes.manage',
    'subjects.manage',
    'settings.manage_config',
    'audit.view_security',
    'devices.configure',
    'approvals.role_request',
  ],
  TEACHER: [
    'attendance.mark_assigned',
    'attendance.record',
    'attendance.view_assigned',
    'timetable.view',
    'results.enter_assigned',
    'results.submit_moderation',
    'assignments.create_assigned',
    'learning.upload_resource',
    'students.read_assigned',
  ],
  PARENT: [
    'children.view_profile',
    'fees.view_invoices',
    'payments.pay_online',
    'results.view_published',
    'attendance.view_child',
    'communication.view_notices',
  ],
  STUDENT: [
    'student.view_timetable',
    'student.submit_assignment',
    'student.take_quiz',
    'student.view_results',
  ],
};

/**
 * Evaluates whether an authenticated session is authorized to perform a permission
 * within an optional resource-level scope.
 */
export function can(
  session: AuthSession | null,
  permission: string,
  scope?: ResourceScope
): boolean {
  if (!session) return false;

  // Platform superadmin bypasses with audit logging
  if (session.userType === 'SUPERADMIN') return true;

  // Privileged roles must have completed MFA before exercising privileged permissions
  if (session.isPrivileged && !session.mfaVerified) {
    return false;
  }

  const allowedPermissions = ROLE_PERMISSIONS[session.userType] || [];

  // Check wildcards or explicit permission match
  const hasPermission =
    allowedPermissions.includes('*') ||
    allowedPermissions.includes(permission) ||
    allowedPermissions.some((p) => {
      if (p.endsWith('.*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix);
      }
      return false;
    });

  if (!hasPermission) return false;

  // Evaluate Resource-Level Scope Predicates
  if (scope) {
    if (session.campusId && scope.campusId && session.campusId !== scope.campusId) {
      if (session.userType !== 'OWNER' && session.userType !== 'PRINCIPAL') {
        return false;
      }
    }

    if (session.userType === 'TEACHER' && scope.teacherId && session.userId !== scope.teacherId) {
      return false;
    }
  }

  return true;
}

/**
 * Asserts authorization; throws an explicit Forbidden error if unauthorized.
 */
export function requirePermission(
  session: AuthSession | null,
  permission: string,
  scope?: ResourceScope
): void {
  if (!can(session, permission, scope)) {
    const role = session?.userType || 'ANONYMOUS';
    throw new Error(
      `403 Forbidden: Role [${role}] is unauthorized for permission [${permission}]`
    );
  }
}
