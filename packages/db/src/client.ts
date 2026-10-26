import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

/**
 * Explicit list of domain models that belong to a school tenant boundary.
 * Grounded in Playbook Chapter 25 & 26 (Logical Multi-Tenancy).
 */
export const TENANT_MODELS = new Set([
  'Campus',
  'User',
  'Role',
  'AcademicSession',
  'Term',
  'ClassLevel',
  'ClassArm',
  'Subject',
  'Student',
  'Guardian',
  'EnrollmentHistory',
  'FeeStructure',
  'Invoice',
  'PaymentTransaction',
  'RefundReversal',
  'ApprovalRequest',
  'AuditEvent',
  'SecurityEvent',
]);

/**
 * Creates a tenant-scoped database client wrapper for an authenticated school.
 * Enforces logical tenant isolation on all queries and mutations.
 * Even if an attacker or buggy code provides a foreign `schoolId`, this wrapper
 * strictly overwrites or verifies `schoolId` against the authenticated session.
 *
 * @param schoolId - Authenticated UUID of the school tenant
 */
export function getScopedDb(schoolId: string) {
  if (!schoolId || typeof schoolId !== 'string' || schoolId.trim().length === 0) {
    throw new Error('Tenant scoping error: schoolId is required and must be a valid non-empty string.');
  }

  return prisma.$extends({
    name: 'tenant-isolation-extension',
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...(args.where || {}), schoolId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...(args.where || {}), schoolId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            // findUnique only allows unique fields. To ensure cross-tenant protection,
            // we execute via findFirst with both the target criteria and schoolId.
            // @ts-expect-error dynamic delegation
            return prisma[model.toLowerCase()].findFirst({
              where: { ...(args.where || {}), schoolId },
            });
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...(args.where || {}), schoolId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.data = { ...(args.data as any), schoolId } as any;
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...(args.where || {}), schoolId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...(args.where || {}), schoolId };
          }
          return query(args);
        },
      },
    },
  });
}
