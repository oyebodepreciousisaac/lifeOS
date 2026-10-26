# School Operating System (SchoolOS)
## Master Development Roadmap & Phased Execution Plan

> **Document Version**: 1.0  
> **Source Document**: *School Operating System Complete Product Validation, Feature Blueprint, Security Architecture and Development Playbook (28 September 2026)*  
> **Execution Standard**: Oyebode Builder Phase-Gate Operating Protocol  
> **Total Scope**: 6 Strategic Milestones • 15 Discrete Phases  
> **Status**: Comprehensive Baseline (Pending User Sign-Off)

---

## 1. Roadmap Architecture & Phase Exit Philosophy [Playbook p. 50, 53]

Implementation must proceed sequentially. **"Code exists" is not a valid condition for completing a phase.** 

### The Non-Negotiable Phase Exit Rule [Playbook p. 53, 68]
A phase exits and unlocks the next phase **only** when:
1. **Acceptance Criteria Passed**: All mapped functional requirements from the Playbook are demonstrably functional.
2. **Automated Tests Green**: Unit, integration, and security tests pass with zero regressions.
3. **Tenant Scoping Verified**: Automated tests confirm zero cross-tenant data leakage.
4. **Audit Logging Active**: Sensitive actions write immutable `AuditEvent` records.
5. **State Machine Fully Implemented**: Loading, Empty, Validation, Error, and Permission states are handled in the UI.
6. **Documentation Updated**: Schemas, API contracts, and runbooks reflect current implementation reality.

---

## 2. High-Level Dependency Graph & Critical Path [Playbook p. 50-52]

```mermaid
graph TD
    subgraph Milestone 1: Foundations & Tenancy
        P0[Phase 0: Architecture & Specs] --> P1[Phase 1: Monorepo & Design System]
        P1 --> P2[Phase 2: Multi-Tenancy & RBAC Auth]
    end

    subgraph Milestone 2: Setup, SIS & Admissions
        P2 --> P3[Phase 3: School Config Wizard]
        P3 --> P4[Phase 4: SIS & Admissions Funnel]
    end

    subgraph Milestone 3: Academic Engine & Results
        P4 --> P5[Phase 5: Timetable & Attendance]
        P5 --> P8[Phase 8: Assessments & Report Cards]
    end

    subgraph Milestone 4: Finance & Comms
        P4 --> P6[Phase 6: Fees, Ledger & Payments]
        P6 --> P7[Phase 7: Multi-Channel Notifications]
    end

    subgraph Milestone 5: Dashboards, Portals & Governance
        P8 --> P11[Phase 11: Maker-Checker Approval Engine]
        P6 --> P11
        P8 --> P9[Phase 9: Role-Specific Dashboards]
        P6 --> P9
        P7 --> P10[Phase 10: Parent, Teacher & Student Portals]
        P9 --> P10
    end

    subgraph Milestone 6: Operations, LMS, AI & Pilot
        P10 --> P12[Phase 12: School Auxiliary Operations]
        P10 --> P13[Phase 13: Lightweight LMS]
        P11 --> P14[Phase 14: Assistive AI & Smart Automation]
        P12 --> P15[Phase 15: Security Hardening & Pilot Handover]
        P13 --> P15
        P14 --> P15
    end
```

---

## 3. Detailed Milestone & Phase Breakdown

---

### Milestone 1: Foundations, Monorepo & Identity (Phases 0 – 2)

#### Phase 0: Discovery, Architecture Blueprint & Specification Freeze [Playbook p. 4-10, 48-50]
- **Objective**: Establish the single source of truth for requirements, system architecture, database design, and user roles.
- **Deliverables**:
  - `docs/PRODUCT-REQUIREMENTS.md` (Checked against 70-page blueprint).
  - `docs/SYSTEM-ARCHITECTURE.md` (Modular monolith, multi-tenancy, background queues).
  - `docs/DATABASE-DESIGN.md` (PostgreSQL schemas, append-only ledgers, audit models).
  - `docs/USER-ROLES.md` (6 organizational tiers, 4-tier Maker-Checker matrix).
  - `docs/DESIGN-SYSTEM.md` (Color tokens, typography, component state machine).
- **Dependencies**: None.
- **Exit Criteria**: Formal user review and sign-off on all planning documents.

#### Phase 1: Project Scaffolding, Monorepo & Design System Foundation [Playbook p. 48, 50, 69]
- **Objective**: Construct the developer substrate and production build pipeline.
- **Tasks**:
  - Scaffold Next.js (App Router) + TypeScript monorepo with Turborepo or npm workspaces.
  - Setup `packages/db` with PostgreSQL and Prisma / Drizzle ORM.
  - Setup `packages/ui` containing Tailwind CSS design tokens, base typography, and accessible primitives (buttons, inputs, cards, tables).
  - Configure ESLint (strict type checking), Prettier, and GitHub Actions CI workflow.
  - Integrate structured JSON logging (Pino) with correlation ID middleware.
- **Dependencies**: Phase 0 sign-off.
- **Exit Criteria**: Clean compile, automated lint and test scripts pass, UI showcase runs locally.

#### Phase 2: Multi-Tenancy, Identity, RBAC & Audit Engine [Playbook p. 10, 38-39, 43, 50]
- **Objective**: Implement secure tenant isolation, authentication, and role authorization.
- **Tasks**:
  - Implement `TenantMiddleware` resolving `school_id` from session claims and custom subdomains.
  - User authentication engine: Argon2id password hashing, HTTP-only secure cookies, session revocation.
  - Multi-Factor Authentication (MFA) via TOTP for privileged administrative accounts.
  - RBAC permission engine with fine-grained predicates (`can(user, 'results.enter', classArmId)`).
  - Append-only `audit_events` logger with before/after state diff capture.
- **Dependencies**: Phase 1.
- **Test Requirements**:
  - Unit tests for password hashing, token generation, and permission evaluations.
  - Security integration test: Automated cross-tenant data leak tests (attempt to read School A records from School B session returns `403`).
- **Exit Criteria**: Authenticated user session with verified tenant scoping and audit persistence.

---

### Milestone 2: School Setup, SIS & Admissions (Phases 3 – 4)

#### Phase 3: School Configuration & Academic Setup Wizard [Playbook p. 11, 16, 50]
- **Objective**: Enable a newly provisioned school to configure its institutional parameters.
- **Tasks**:
  - Interactive School Onboarding Wizard: Organization name, crest/logo, campuses/branches.
  - Academic session and term configuration with active session toggling.
  - Dynamic class structure builder: School sections, class levels (Creche to SS3), arms (Gold, Diamond).
  - Subject catalog and departmental mappings.
  - School calendar, holidays, and working hours settings.
- **Dependencies**: Phase 2.
- **Exit Criteria**: School administrator can complete full institutional onboarding and produce a configured academic structure.

#### Phase 4: Student Information System (SIS) & Admissions Funnel [Playbook p. 11-12, 17-18, 51]
- **Objective**: Establish the authoritative central student record and digital admissions pipeline.
- **Tasks**:
  - Public online application portal with step-by-step form validation and document upload.
  - Entrance test and interview scheduling, reviewer scoring, and conditional offer letter generation.
  - One-click applicant-to-student conversion with automatic admission number generation.
  - Unified Student Profile: Biographical data, medical flags, guardian links, emergency contacts.
  - Non-destructive class enrollment history: Arm assignments, promotions, and transfers.
  - Batch Excel/CSV student and guardian data import with quarantine and validation error reporting.
- **Dependencies**: Phase 3.
- **Exit Criteria**: Successful bulk import of 100 sample students; end-to-end admissions application-to-enrolled student flow verified.

---

### Milestone 3: Core Academic Engine & Result Pipeline (Phases 5 & 8)

#### Phase 5: Academics, Timetable & Attendance Engine [Playbook p. 13, 21, 51]
- **Objective**: Deliver daily classroom scheduling and high-speed attendance registers.
- **Tasks**:
  - Timetable grid builder: Period rules, teacher availability, subject frequency, clash detection.
  - Fast teacher attendance register (web and mobile-responsive): Mark attendance in under 60 seconds.
  - Automatic absence alert engine: Triggers parent SMS/Email upon absence marking.
  - Lateness tracking and consecutive absence threshold alerts.
  - Offline-tolerant PWA service worker with IndexedDB local queue for morning attendance during network dropouts.
- **Dependencies**: Phase 4.
- **Exit Criteria**: Conflict-free timetable generation; attendance register functional online and in simulated offline mode.

#### Phase 8: Assessments, Exam Moderation, Result Locking & Report Cards [Playbook p. 13, 22, 51]
- **Objective**: Create the tamper-proof academic evaluation and branded report-card subsystem.
- **Tasks**:
  - Continuous Assessment (CA) and terminal examination score entry grid with boundary guards.
  - Missing marks detector highlighting un-submitted scores before compilation.
  - Moderation workflow: Teacher submission → Academic Lead moderation → Principal approval.
  - Cryptographic result locking: Sealed results cannot be modified without formal Level 2 approval.
  - Pixel-perfect branded PDF report card generator with affective/psychomotor ratings, remarks, and digital QR verification code.
  - Termly student promotion engine based on school-defined passing criteria.
- **Dependencies**: Phase 5.
- **Exit Criteria**: Score submission, principal approval, cryptographic lock, and automated rendering of verified PDF report card.

---

### Milestone 4: Finance, Payments & Communications (Phases 6 – 7)

#### Phase 6: Fees, Invoicing, Payment Gateways & Ledger [Playbook p. 13, 23-24, 51]
- **Objective**: Eliminate school revenue leakage with an immutable financial transaction ledger.
- **Tasks**:
  - Configurable fee schedules: Class-based tuition, boarding, bus routes, uniform, PTA levy.
  - Bulk termly student invoicing engine with itemized line items and sibling discounts.
  - Integrated Paystack and Flutterwave payment checkout (Cards, Bank Transfer, USSD).
  - Server-side webhook controller with signature verification and Redis idempotency locks.
  - Double-entry student ledger: Dynamic balance calculation from charges and verified payments.
  - Instant automated PDF payment receipts with unique receipt numbers.
  - Level 2 Maker-Checker queue for payment refunds and ledger reversals.
- **Dependencies**: Phase 4.
- **Exit Criteria**: Simulated Paystack payment verified server-side, ledger credited, receipt generated, zero double-crediting on duplicate webhooks.

#### Phase 7: Multi-Channel Communication & Notification Engine [Playbook p. 13-14, 25, 51]
- **Objective**: Provide automated, multi-channel parent and staff communications.
- **Tasks**:
  - Event-driven notification dispatcher powered by Redis/BullMQ.
  - Provider adapters: In-app notification drawer, Resend (Email), Termii (SMS), WhatsApp Cloud API.
  - Template manager with merge fields (e.g., student name, outstanding amount, receipt URL).
  - Scheduled broadcasts and targeted announcements (filter by class, campus, debtor status).
  - Message delivery tracking state machine (`QUEUED`, `SENT`, `DELIVERED`, `FAILED`).
- **Dependencies**: Phase 6.
- **Exit Criteria**: Triggered invoice generation automatically dispatches personalized email and SMS with delivery state confirmation.

---

### Milestone 5: Dashboards, Portals & Governance Engine (Phases 9 – 11)

#### Phase 9: Role-Specific Actionable Dashboards & Analytics [Playbook p. 15, 32-35, 51]
- **Objective**: Provide executive clarity and actionable exception centers for leadership.
- **Tasks**:
  - Proprietor / Owner Dashboard: Total enrollment, fee collection velocity, aging debtors analysis, cash flow.
  - Principal Dashboard: Today's attendance rate, unmarked class registers, result completion tracker, welfare flags.
  - IT / Security Dashboard: System uptime, failed logins, backup health, active Maker-Checker requests.
  - Multi-dimensional filtering by campus, class level, arm, session, and term.
  - Strict compliance with visual design rules (labeled axes, clickable drill-downs, freshness timestamps).
- **Dependencies**: Phases 6, 8.
- **Exit Criteria**: Dashboards load under 1.5 seconds, all metrics match underlying database transactions, and drill-downs navigate correctly.

#### Phase 10: Dedicated Parent, Teacher & Student Portals [Playbook p. 12-13, 19-20]
- **Objective**: Deliver tailored, mobile-optimized portals for daily stakeholders.
- **Tasks**:
  - Parent Portal: Multi-child switcher, fee invoices & online Paystack payment, receipt archive, published report card viewer, attendance history.
  - Teacher Portal: Daily "Today View", quick attendance register, Continuous Assessment scorebook, assignment creator, parent messaging.
  - Student Portal: Timetable, lesson notes, homework submission, online quiz portal.
  - Mobile responsiveness verification (iPhone/Android 375px+).
- **Dependencies**: Phases 7, 9.
- **Exit Criteria**: A parent switches between two enrolled children, pays school fees via Paystack, and downloads a stamped report card seamlessly on a mobile device.

#### Phase 11: Enterprise Governance & Maker-Checker Approval Workflows [Playbook p. 23, 36-37, 67]
- **Objective**: Enforce multi-person authorization on all sensitive academic and financial modifications.
- **Tasks**:
  - Centralized Approval Queue for administrators and executives.
  - Visual Before/After diff cards highlighting proposed record alterations.
  - Dual-control enforcement on locked result amendments and fee reversals.
  - Re-authentication / MFA verification prompt before executive sign-off.
  - Automatic expiration after 72 hours and immutable audit logging.
- **Dependencies**: Phases 6, 8.
- **Exit Criteria**: Teacher requests locked score change → VP verifies → Principal approves with MFA → Score automatically updates with complete audit trail.

---

### Milestone 6: Auxiliary Operations, LMS, AI & Pilot Handover (Phases 12 – 15)

#### Phase 12: School Auxiliary Operations & Community [Playbook p. 14, 28-29, 51-52]
- **Objective**: Unify campus logistics, health, boarding, assets, and PTA community.
- **Tasks**:
  - Library book cataloging, checkout/return, and automated overdue fine billing.
  - School Clinic visit logs, allergy registries, and emergency parent alert triggers.
  - Bus fleet management, routes, pickup stops, and passenger manifests.
  - Hostel room and bed-space allocation with digital exeat gate-pass logging.
  - Fixed asset registry and maintenance tracking.
  - PTA executive register, meeting minutes, and segregated project levy contributions.
- **Dependencies**: Phase 10.
- **Exit Criteria**: Student clinic visit logged with parent alert; student assigned to hostel bed and bus route.

#### Phase 13: Lightweight LMS & Virtual Classroom Integrations [Playbook p. 15, 30, 52]
- **Objective**: Provide hybrid curriculum delivery and assignment management.
- **Tasks**:
  - Course curriculum hierarchy: Subjects, Modules, Lessons with rich text, video, and PDF materials.
  - Online quiz engine with automated objective question scoring.
  - Student assignment upload and teacher grading with rubric comments.
  - Zoom and Google Meet live class integration with join link scheduling and attendance recording.
- **Dependencies**: Phase 10.
- **Exit Criteria**: Teacher publishes a lesson module with quiz; student completes quiz and receives automated grade.

#### Phase 14: Justified Assistive AI & Smart Automation [Playbook p. 15, 31, 52]
- **Objective**: Accelerate staff productivity with strictly human-in-the-loop assistive AI.
- **Tasks**:
  - Teacher curriculum assistant: Generates draft exam questions and lesson plan outlines from approved topics.
  - Parent student summary assistant: Translates termly grades and attendance trends into plain-language progress narratives.
  - Bursar fee exception analyzer: Identifies payment delays and drafts personalized reminders.
  - Strict human review gate: AI drafts cannot commit to the database without explicit human approval.
- **Dependencies**: Phases 11, 13.
- **Exit Criteria**: Teacher generates draft quiz questions, edits content, and publishes to class; zero unreviewed automated record mutations.

#### Phase 15: Security Hardening, Backup Drills, NDPA Compliance & Pilot Handover [Playbook p. 41-42, 52-59, 68]
- **Objective**: Validate institutional security, disaster recovery, data protection, and execute pilot handover.
- **Tasks**:
  - OWASP ASVS 5.0 security audit: Penetration testing for IDOR, SQLi, CSRF, and privilege escalation.
  - Disaster Recovery Drill: Simulate complete database corruption, execute automated restore from isolated backup, achieve RPO ≤ 15 min and RTO ≤ 60 min.
  - NDPA 2023 compliance audit: Verify student data export utilities, consent tracking, and sanitization workflows.
  - Automated data migration scripts for legacy school Excel/Access files with reconciliation reports.
  - School IT Handover Package: Administrator guide, teacher cheat sheet, and disaster runbooks.
- **Dependencies**: All preceding phases.
- **Exit Criteria**: 100% green security audit; successful restore drill with verified data integrity; pilot school sign-off on acceptance criteria.

---

## 4. Definition of Done (DoD) by Feature [Playbook p. 68]

Every feature pull request must fulfill the 12-point quality gate before merging into the main branch:
1. **Requirement Traced**: Directly linked to a requirement in `PRODUCT-REQUIREMENTS.md`.
2. **Acceptance Criteria Verified**: Feature passes all positive, negative, and edge-case criteria.
3. **Multi-Tenancy Guarded**: Automated tests verify no data leaks across `school_id`.
4. **RBAC Enforced**: API routes reject unauthorized roles with `403 Forbidden`.
5. **Maker-Checker Bound**: Sensitive actions require dual control before execution.
6. **Audit Event Emitted**: Structured JSON audit record created with before/after diffs.
7. **Complete State Machine**: Loading skeletons, empty states, and error alerts implemented.
8. **Mobile Tested**: Verified on 375px viewport with touch-accessible targets (≥44px).
9. **Reversible Migrations**: Database changes include reversible migration scripts.
10. **Zero Secrets in Code**: Environment configuration validated via strict Zod schemas.
11. **Unit & Integration Tests**: Test coverage exceeds 85% for financial and academic domain logic.
12. **Documentation Updated**: Schema, API contract, and changelog updated in `docs/`.
