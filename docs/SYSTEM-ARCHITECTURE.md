# School Operating System (SchoolOS)
## System Architecture & Technical Specification

> **Document Version**: 1.0  
> **Source Document**: *School Operating System Complete Product Validation, Feature Blueprint, Security Architecture and Development Playbook (28 September 2026)*  
> **Architecture Pattern**: Domain-Driven Modular Monolith with Multi-Tenant Logical Isolation  
> **Compliance Baselines**: OWASP ASVS 5.0, NDPA 2023, PCI-DSS v4.0.1  
> **Status**: Comprehensive Baseline (Pending User Sign-Off)

---

## 1. Architectural Principles & Overview

SchoolOS is architected as a **Domain-Driven Modular Monolith** [Playbook p. 1, 6, 43, 69]. 

### 1.1 Architectural Decision Rationale
1. **Modular Monolith over Microservices [Playbook p. 43]**:
   - Eliminates distributed transaction failures, network latency, and operational overhead during initial school deployments.
   - Enforces strict module boundaries at the code and folder level (`apps/web`, `packages/db`, `workers/`).
   - Enables shared TypeScript types between UI, business services, and database queries.
   - Can easily be decomposed into independent microservices (e.g., separating the Notification Engine or PDF Render Worker) if traffic surges warrant.
2. **Unified Relational Store (PostgreSQL) [Playbook p. 44, 69]**:
   - School operations require strict ACID transaction semantics: fee invoicing, payment settlements, and grade allocations cannot tolerate eventual consistency errors.
   - Rich support for complex foreign-key constraints, row-level tenant scoping, and JSONB for configurable school custom fields.
3. **Single Operational Source of Truth [Playbook p. 7]**:
   - Eliminates duplicated mutable data across disparate tables or caches. If a payment is settled, all parent statements, debt lists, and bursar views derive from that single authoritative transaction ledger.
4. **Governance by Design [Playbook p. 8, 36]**:
   - Core platform services treat multi-person approval workflows (Maker-Checker) and append-only audit logging as foundational primitives rather than retrofitted features.

---

## 2. High-Level System Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                         CLIENT EXPERIENCE LAYER                                    |
|   +--------------------------+  +--------------------------+  +--------------------------------+   |
|   |   Proprietor / Admin UI  |  |   Teacher / Staff Portal |  |  Parent / Student PWA Portal   |   |
|   +--------------------------+  +--------------------------+  +--------------------------------+   |
|                  Responsive Next.js App Router (React 19, TypeScript, Tailwind CSS)               |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  │ HTTPS / WSS / REST / Server Actions
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                       APPLICATION GATEWAY & SECURITY                               |
|   Edge Reverse Proxy / CDN | TLS 1.3 Termination | Rate Limiting (Redis) | Tenant Context Resolver |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                    DOMAIN APPLICATION MODULES                                      |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  |   Identity & RBAC   |  | School Configuration|  |  Student & Admin    |  | Academics & Results| |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  |   Finance & Ledger  |  |  Comms Engine       |  |  Operations (Hostel)|  |  LMS & Classroom   | |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
|  | Dashboards/Analytics|  | Maker-Checker Engine|  |  Assistive AI Suite |  | Tenant Management  | |
|  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                      PLATFORM SERVICES LAYER                                       |
|  +--------------------+  +--------------------+  +--------------------+  +-----------------------+ |
|  | Tenant Isolation   |  | Immutable Audit Log|  | Event Bus & PubSub |  | Job Dispatcher        | |
|  | Scoping Middleware |  | Append-Only Stream |  | Redis Streams / In-Mem| (BullMQ Queue Master)   | |
|  +--------------------+  +--------------------+  +--------------------+  +-----------------------+ |
+----------------------------------------------------------------------------------------------------+
                         │                                              │
                         ▼                                              ▼
+--------------------------------------------------+  +----------------------------------------------+
|            PRIMARY PERSISTENT STORAGE            |  |             ASYNC QUEUE & CACHE              |
|  PostgreSQL 16+ (ACID Relational Ledger)         |  |  Redis 7+ (BullMQ Queues, Session Store,     |
|  - Logical Tenant Isolation (school_id RLS)      |  |  Rate Limiting, Ephemeral Caching)           |
|  - Connection Pooling (PgBouncer)                |  +----------------------------------------------+
+--------------------------------------------------+                         │
                         │                                                   ▼
                         ▼                                    +------------------------------+
+--------------------------------------------------+          |     BACKGROUND WORKERS       |
|              OBJECT STORAGE REPOSITORY           |          |  - Bulk Invoice Generator    |
|  Encrypted S3-Compatible Object Store            |          |  - PDF Report Card Renderer  |
|  - Student KYC Documents & Passports             |          |  - SMS / Email / WhatsApp    |
|  - Stamped PDF Report Cards & Receipts           |          |  - Nightly Analytics Job     |
|  - Time-limited Pre-Signed Access URLs           |          |  - Webhook Reconciliation    |
+--------------------------------------------------+          +------------------------------+
                         │                                                   │
                         ▼                                                   ▼
+----------------------------------------------------------------------------------------------------+
|                                      EXTERNAL SERVICE INTEGRATIONS                                 |
|  +----------------------+  +----------------------+  +--------------------+  +-------------------+ |
|  |   Payment Gateways   |  |   Messaging Adapters |  | Video Conferencing |  |   Identity / SSO  | |
|  | Paystack/Flutterwave |  | Termii / Resend /    |  | Zoom / Google Meet |  | Google / SAML     | |
|  | (Webhooks + Idemp)   |  | WhatsApp Cloud API   |  | (Link metadata)    |  | (Staff accounts)  | |
|  +----------------------+  +----------------------+  +--------------------+  +-------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Selection & Evaluation

| Component | Selected Technology | Justification [Playbook p. 48, 69] |
| :--- | :--- | :--- |
| **Web Framework** | **Next.js (App Router) + React 19** | Industry-standard React full-stack framework. Server Components reduce bundle size for low-bandwidth mobile users; API Route Handlers provide clear domain endpoints. |
| **Language** | **TypeScript (Strict Mode)** | End-to-end type safety between database schemas, business logic, and UI components. Eliminates runtime nil/undefined crashes across complex fee and grading rules. |
| **Styling & Design** | **Tailwind CSS + Headless UI** | Ultra-clean, deterministic CSS utility system with zero runtime CSS-in-JS overhead. Facilitates an institutional design system and accessible WCAG 2.1 AA UI components. |
| **Database** | **PostgreSQL (v16+)** | World-class relational database engine. Strong transaction isolation, powerful indexing, JSONB support for dynamic school custom fields, and native row-level security (RLS). |
| **ORM / Data Access** | **Prisma / Drizzle ORM** | Type-safe query building, declarative schema modeling, and robust automated database migrations with version control. |
| **Caching & Queues** | **Redis + BullMQ** | High-performance in-memory broker. Powering job queues for asynchronous invoice generation, PDF rendering, email/SMS dispatch, and API rate limiting. |
| **File Storage** | **S3-Compatible Object Storage** (Cloudflare R2 / AWS S3) | Keeps large files (student documents, report cards, receipts) out of the relational database. Time-limited pre-signed URLs enforce NDPA privacy controls. |
| **Payments** | **Paystack & Flutterwave** | The leading payment infrastructure in Nigeria. Supports local cards, direct debit, USSD, and virtual bank accounts with webhook signature verification. |
| **SMS & Messaging** | **Termii & Resend** | Termii provides high-delivery routes for Nigerian telecommunications networks (MTN, Airtel, Glo, 9mobile); Resend handles high-deliverability transactional emails. |
| **Logging & Telemetry**| **Pino + OpenTelemetry** | Structured JSON logging with request correlation IDs (`x-request-id`), tenant tagging, and performance monitoring without logging sensitive PII. |

---

## 4. Multi-Tenancy & Data Isolation Model [Playbook p. 43]

### 4.1 Tenancy Strategy: Shared Database with Strict Tenant Key
SchoolOS implements **Logical Tenant Isolation**:
- Every school tenant is identified by a unique UUID `school_id`.
- Every tenant-aware database table includes a mandatory, indexed foreign key `school_id REFERENCES schools(id) ON DELETE RESTRICT`.
- **Tenant Context Extraction**: Incoming requests pass through `TenantMiddleware`, which resolves the school tenant via:
  1. Authenticated session token claims (`session.schoolId`), OR
  2. Custom subdomain (e.g., `kingscollege.schoolos.ng`), OR
  3. API header `X-School-ID` for verified programmatic access.
- **Data Scoping Guard**: A database query wrapper or Prisma client extension automatically injects `where: { schoolId }` into every `find`, `update`, `delete`, and `create` operation:

```typescript
// Architectural Guard: Automatic Tenant Scoping
export function getScopedDb(schoolId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (isTenantModel(model)) {
            args.where = { ...args.where, schoolId };
          }
          return query(args);
        },
      },
    },
  });
}
```

### 4.2 Cross-Tenant Isolation Verification
- Automated integration test suites execute negative tests: User from School A attempts to access records from School B via IDOR (Insecure Direct Object Reference) vectors. All such requests must strictly return `403 Forbidden` or `404 Not Found`.

---

## 5. Security Architecture & Threat Defense (OWASP ASVS 5.0) [Playbook p. 38-39]

### 5.1 Authentication Subsystem [Playbook p. 38]
- **Credential Storage**: Passwords hashed using **Argon2id** (m=65536, t=3, p=4) or **Bcrypt** (work factor 12).
- **Multi-Factor Authentication (MFA)**: Mandatory for all privileged institutional roles (School Owner, Principal, Bursar, IT Admin) via TOTP (Authenticator apps) or encrypted SMS OTP.
- **Session Lifecycle**:
  - Stateless cryptographic session tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
  - Absolute session expiration: 12 hours. Idle session expiration: 15 minutes for admin/financial interfaces.
  - Immediate server-side token revocation on logout or password reset.
- **Rate Limiting**: Tiered IP and account rate limiting via Redis token-bucket algorithms:
  - Auth endpoints: 5 failed attempts per 15-minute window before exponential lock.
  - Public admission inquiry forms: 20 submissions per IP per hour.
  - Payment callback endpoints: Validated against payment provider IP whitelist.

### 5.2 Authorization Subsystem (RBAC + Resource Scopes) [Playbook p. 10, 38]
- **Hierarchical Permission Structure**: `module.action_scope` (e.g., `results.enter_assigned`, `results.lock_school`, `payments.reverse_dual`).
- **Resource-Level Scoping**:
  - A Subject Teacher can enter scores *only* for the specific subjects and class arms explicitly assigned to them in the academic timetable.
  - A Parent can access records *only* for students linked via an active `GuardianStudentLink`.
- **Deny-by-Default Policy**: Any unauthenticated request or request lacking explicit permission grants is rejected immediately.

### 5.3 Cryptographic Ledger & Audit Logging [Playbook p. 44-45]
- **Immutable Append-Only Audit Stream**:
  - The `audit_events` table is append-only. No `UPDATE` or `DELETE` permissions are granted to the application database user on this table.
  - Every sensitive change captures: `actor_id`, `school_id`, `ip_address`, `user_agent`, `action`, `resource_type`, `resource_id`, `before_state` (JSONB), and `after_state` (JSONB).
- **Sensitive Data Redaction**: Passwords, bank account PINs, credit card numbers, and secret keys are stripped before log serialization.

---

## 6. Financial Ledger & Payment Gateway Architecture [Playbook p. 23-24]

### 6.1 Double-Entry Principles
SchoolOS treats student accounts with financial accounting rigor:
- **Zero Mutable Balances**: A student's current debt or surplus balance is *derived dynamically* by calculating:
  $$\text{Balance} = \sum(\text{Authoritative Charges}) - \sum(\text{Settled Payments}) - \sum(\text{Approved Discounts/Scholarships})$$
- When an invoice is created, a debit charge entry is posted.
- When an online or bank transfer payment is confirmed, a credit payment entry is posted.
- When a refund or correction occurs, a compensating reversing transaction is posted through the Maker-Checker workflow. No transaction is ever deleted.

### 6.2 Payment Webhook Processing Lifecycle [Playbook p. 23-24]

```
[Payment Provider (Paystack/Flutterwave)] 
             │
             │ POST Webhook (X-Paystack-Signature)
             ▼
[SchoolOS Webhook Controller]
   ├── 1. Cryptographically verify webhook signature against secret key
   ├── 2. Extract transaction reference & check idempotency in Redis/DB
   │       └── If already processed: Return 200 OK immediately (no duplication)
   ├── 3. Query Payment Provider API directly server-side to verify settled status & amount
   ├── 4. Open PostgreSQL Transaction:
   │       ├── Record PaymentTransaction (SETTLED)
   │       ├── Generate unique Receipt Number & PDF
   │       ├── Update Student Ledger
   │       └── Emit PAYMENT_RECEIVED domain event
   └── 5. Return HTTP 200 OK
             │
             ▼ (Async BullMQ)
[Notification Worker] ──► Dispatches instant SMS / WhatsApp Receipt to Parent
```

---

## 7. Maker-Checker Governance & Approval State Machine [Playbook p. 23, 36-37]

### 7.1 Approval State Machine
Every sensitive operation (locked result edit, payment refund, role elevation, bulk student export) is governed by a formal state machine:

```
  +---------+         +-------------+         +------------------+
  |  DRAFT  | ──────► |  SUBMITTED  | ──────► | PENDING_APPROVAL |
  +---------+         +-------------+         +------------------+
                             │                          │
                             │ Cancelled                ├── Approved (Approver 1 & 2)
                             ▼                          ▼
                      +-------------+            +--------------+
                      |  CANCELLED  |            |   APPROVED   |
                      +-------------+            +--------------+
                                                        │
                                                        │ Automated Worker
                                                        ▼
+-------------+       +-------------+            +--------------+
|   FAILED    | ◄──── | ROLLED_BACK | ◄───────── |  EXECUTING   |
+-------------+       +-------------+            +--------------+
                                                        │
                                                        │ Success
                                                        ▼
                                                 +--------------+
                                                 |  COMPLETED   |
                                                 +--------------+
```

### 7.2 Separation of Duties Enforcement [Playbook p. 36]
1. **Self-Approval Prohibition**: The user creating the `ApprovalRequest` cannot be an approver (`requester_id != approver_id`).
2. **Dual Control**: High-risk actions require two distinct designated approvers from different organizational tiers.
3. **Time Expiry**: Approval requests automatically transition to `EXPIRED` after 72 hours if unreviewed.

---

## 8. Offline Tolerance Architecture for School Campuses [Playbook p. 21, 63]

To maintain operations during internet outages, SchoolOS provides an offline-tolerant PWA mode for high-frequency daily routines (primarily Attendance Marking and Classroom Observation):

```
+------------------------------------------------------------------------------------+
|                                BROWSER / CLIENT PWA                                |
|  +-------------------------+                     +-------------------------------+ |
|  |   Teacher Attendance UI |                     |   Offline Sync Service Worker | |
|  +-------------------------+                     +-------------------------------+ |
|               │                                                  │                 |
|               ▼ Writes locally when offline                      ▼ Syncs online    |
|  +-------------------------------------------------------------------------------+ |
|  |                         Client-Side IndexedDB Storage                         | |
|  |  - Active Class Roster Cache (Encrypted)                                      | |
|  |  - Pending Attendance Transactions Queue: [{ studentId, status, timestamp }]  | |
|  +-------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------+
                                         │
                                         │ HTTPS Sync (When Network Returns)
                                         ▼
+------------------------------------------------------------------------------------+
|                               SERVER SYNC CONTROLLER                               |
|  - Validates authentication token & class teacher assignment                       |
|  - Detects conflicting submissions (e.g. attendance submitted from two devices)    |
|  - Commits validated batch to PostgreSQL database                                  |
|  - Returns sync confirmation and updates client sync status to GREEN               |
+------------------------------------------------------------------------------------+
```

---

## 9. Background Job Topology & BullMQ Worker Architecture [Playbook p. 46]

Background operations are decoupled from user web requests using Redis-backed BullMQ queues:

| Queue Name | Typical Payload | Worker Responsibility |
| :--- | :--- | :--- |
| `finance-queue` | `{ schoolId, termId, classId }` | Bulk termly invoice generation; late fee calculation; reconciliation checks. |
| `pdf-render-queue`| `{ schoolId, studentId, termId, templateId }` | Headless Chrome/Puppeteer rendering of high-resolution, branded PDF report cards and official receipts. |
| `notifications-queue`| `{ channel, recipient, templateId, data }` | Multi-channel dispatch (SMS, Email, WhatsApp) with retry logic and delivery callback logging. |
| `analytics-queue` | `{ schoolId, date }` | Nightly computation of attendance aggregations, grade distributions, and fee collection metrics for cached dashboard display. |
| `backup-queue` | `{ timestamp, scope }` | Nightly database dump orchestration, archive encryption, S3 upload, and automated restore drill validation. |

---

## 10. Disaster Recovery, RPO/RTO & Backup Topology [Playbook p. 41-42]

### 10.1 Recovery Metrics
- **Recovery Point Objective (RPO)**: **≤ 15 minutes**. Achieved via automated WAL (Write-Ahead Logging) archiving to geographically isolated storage.
- **Recovery Time Objective (RTO)**: **60 – 120 minutes**. Documented recovery runbook with single-command provisioning.

### 10.2 Backup Architecture
1. **Continuous WAL Archiving**: PostgreSQL transactions are streamed continuously to redundant private cloud storage.
2. **Daily Full Encrypted Snapshots**: Executed at 02:00 WAT. Encrypted using AES-256 before storage.
3. **Immutable WORM Storage**: Backups stored in buckets with Object Lock enabled. Normal school administrators and even standard compromised platform accounts cannot delete historical backup archives.
4. **Automated Monthly Restore Drills**: A background worker spins up a temporary isolated staging database, restores the latest backup, runs schema and data integrity verification tests, and logs the result to the IT Security Dashboard.

---

## 11. Workspace Structure & Monorepo Layout [Playbook p. 48]

Following the canonical Antigravity structure specified in Chapter 29 of the playbook:

```
school-os/
├── docs/                      # Authoritative product and architecture specifications
│   ├── PRODUCT-REQUIREMENTS.md
│   ├── SYSTEM-ARCHITECTURE.md
│   ├── DATABASE-DESIGN.md
│   ├── USER-ROLES.md
│   ├── DESIGN-SYSTEM.md
│   ├── DEVELOPMENT-ROADMAP.md
│   └── PROGRESS-TRACKER.md
├── apps/
│   ├── web/                   # Main Next.js App Router full-stack web application
│   │   ├── src/
│   │   │   ├── app/           # App Router routes (admin, teacher, parent, student)
│   │   │   ├── components/    # Domain-specific UI components
│   │   │   ├── lib/           # Utility helpers and clients
│   │   │   └── server/        # Server actions and route controllers
│   │   ├── public/            # Static assets
│   │   └── package.json
│   └── workers/               # Background processing service (BullMQ jobs)
│       ├── src/
│       │   ├── queues/        # Queue definitions
│       │   └── processors/    # Invoicing, PDF, Notification, and Analytics processors
│       └── package.json
├── packages/
│   ├── db/                    # Authoritative database package
│   │   ├── prisma/            # Schema definition and migrations
│   │   ├── src/               # Scoped client exports and seeders
│   │   └── package.json
│   ├── ui/                    # Shared design system components
│   │   ├── src/               # Buttons, Inputs, Modals, Tables, Cards, Badges
│   │   └── package.json
│   └── config/                # Shared ESLint, Prettier, and TypeScript configurations
├── tests/                     # Cross-domain integration, E2E, and ASVS security test suites
├── skill-creator/             # [PROTECTED] Skill infrastructure (DO NOT MODIFY)
└── package.json               # Root monorepo workspace definition
```
