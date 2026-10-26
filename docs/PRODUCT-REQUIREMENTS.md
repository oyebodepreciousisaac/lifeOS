# School Operating System (SchoolOS)
## Product Requirements Document (PRD)

> **Document Version**: 1.0  
> **Source Document**: *School Operating System Complete Product Validation, Feature Blueprint, Security Architecture and Development Playbook (28 September 2026)*  
> **Target Environment**: Nigerian Nursery, Primary, and Secondary Schools (K-12) with extensible architecture for wider African and emerging markets.  
> **Methodology**: Oyebode Builder Operating Framework  
> **Status**: Comprehensive Baseline (Pending User Sign-Off)

---

## 1. Executive Summary & Problem Framing

### 1.1 The Operational Reality [Playbook p. 4, 8]
Schools in Nigeria operate in an environment characterized by extreme administrative fragmentation:
- **Paper & Physical Ledgers**: Class attendance registers, admission files, health clinic logbooks, and library cards.
- **Disconnected Spreadsheets**: Termly score sheets, exam compilation templates, fee collection sheets, and debt lists managed by individual teachers or bursars.
- **Informal Messaging**: Unstructured WhatsApp and Telegram groups for announcements, payment proofs, and parent inquiries.
- **Fragmented Portals**: Standalone report-card generators, separate bank portals, bank SMS alerts, and uncoordinated school websites.

### 1.2 The Core Product Thesis [Playbook p. 4]
Operational cost, data tampering, and financial leakage are not created merely by individual tasks, but by **manual reconciliation between disconnected systems**. 

### 1.3 The Core Solution Promise [Playbook p. 6-7]
- **One Student Record**: A unified, persistent student record from initial admission inquiry to graduation and alumni status.
- **One Operational Source of Truth**: All attendance, grade, financial, and disciplinary views derive from authoritative transactional records.
- **School Governance by Design**: Multi-person Maker-Checker approval workflows for sensitive actions (locked result corrections, payment reversals, role elevations, sensitive exports).
- **Actionable, Transparent Dashboards**: Every metric displays its definition, timestamp, filters, and drill-down path to underlying records.
- **Offline Tolerance**: Critical daily operations (e.g., morning attendance) tolerate intermittent power and internet connectivity through client queuing and deterministic synchronization.
- **Data Sovereignty & Handover**: Complete data export, transparent schemas, and structured IT handover procedures to prevent vendor lock-in.

---

## 2. Market Reality & Commercial Wedge [Playbook p. 4, 8]

Existing vendors in Nigeria (e.g., Edves, SchoolTry, SAFSMS) have established market awareness for school software. SchoolOS wins not by adding superficial features, but by competing on **reliability, governance, financial reconciliation, and data integrity**:

| Competitive Area | Standard Market Reality | SchoolOS Differentiator [Playbook p. 8] |
| :--- | :--- | :--- |
| **Governance & Security** | Single-admin accounts with unchecked permissions; direct edits to grades and payments. | **Maker-Checker Dual Control**: No sensitive change (exam scores, fee refunds, role changes) can be completed by a single individual alone. |
| **Financial Integrity** | Flat balance fields on student profiles that are manually edited. | **Double-Entry Transaction Ledger**: Balances are dynamically derived from authoritative charges and settled payments. Immutable audit trails. |
| **Academic Pipeline** | Loose spreadsheet imports prone to formula breaks and overwritten terms. | **Controlled Score-to-Report Pipeline**: Configurable CA weights, boundary validation, teacher submission, head moderation, cryptographic locking, and QR-code verification. |
| **Connectivity** | Complete failure when school network or MTN/Airtel/Starlink drops. | **Offline-Tolerant PWA Architecture**: Attendance and score staging function locally with conflict-aware synchronization. |
| **Compliance** | Little to no alignment with statutory data privacy laws. | **Built-in NDPA 2023 Compliance**: Built-in data inventory, lawful basis mapping, guardian consent records, and automated data-subject rights workflows. |

---

## 3. Complete Module Requirements & Checklists

```
+-------------------------------------------------------------------------------------------------------+
|                                    SCHOOLOS COMPLETE MODULE TAXONOMY                                  |
+-------------------------------------------------------------------------------------------------------+
|  1. School Admin & Setup         |  6. Assessments & Report Cards   |  11. School Operations (Auxiliary)|
|  2. Admissions & Enrollment      |  7. Fees, Finance & Ledger       |  12. Learning Management (LMS)   |
|  3. Student Information (SIS)    |  8. Communication & Notifications|  13. AI & Intelligent Automation |
|  4. Role Portals (Parent/Teacher)|  9. PTA, Events & Community      |  14. Dashboards & Analytics      |
|  5. Academics & Attendance       | 10. Scholarships & Vouchers      |  15. Platform & Multi-Tenancy    |
+-------------------------------------------------------------------------------------------------------+
```

---

### Module 1: School Administration & Setup [Playbook p. 11, 16]
*Enables complete multi-campus institutional configuration without hardcoded academic structures.*

- [ ] **School Onboarding Wizard [Playbook p. 16]**:
  - Organization creation, tenant provisioning, and owner account verification.
  - School profile setup: official name, government registration code, crest/logo, primary contact, currency (default NGN), time zone (Africa/Lagos).
  - Multi-campus / branch support: Main campus, Annex, Early Years campus with independent physical addresses and shared or dedicated administrators.
- [ ] **Configurable Academic Structure [Playbook p. 16]**:
  - Academic sessions (e.g., `2026/2027`, `2027/2028`) with start and end dates.
  - Academic terms (e.g., 1st Term, 2nd Term, 3rd Term) with term open/close date boundaries.
  - Configurable school sections/levels: Creche, Nursery, Primary, Junior Secondary (JSS), Senior Secondary (SSS), or international equivalents (Year 1–12). *Must not be hard-coded*.
  - Class levels and arms (e.g., `JSS 1 Gold`, `JSS 1 Diamond`, `Primary 4 Emerald`).
  - Subject catalog with department mappings (e.g., Mathematics, Basic Science, Civic Education, Yoruba, French).
- [ ] **Institutional Calendar & Operation Rules [Playbook p. 16]**:
  - Term calendars, school holidays, exam windows, visiting days, and mid-term breaks.
  - School working hours, period duration (e.g., 40 minutes), break times, and lateness cutoff thresholds.
  - Dynamic custom fields per school (e.g., State of Origin, LGA, Religion, NIN, House color).

---

### Module 2: Admissions & Enrollment [Playbook p. 11, 17]
*Manages the prospective student journey from initial inquiry to registered student.*

- [ ] **Inquiry & Digital Application [Playbook p. 17]**:
  - Public online application portal with school-branded vanity URL.
  - Step-by-step application form with real-time validation and progress auto-save.
  - Required document upload: Birth certificate, previous term report cards, passport photos, immunization/medical records.
  - Online application fee checkout (via Paystack/Flutterwave) with automatic invoice generation and payment receipt.
- [ ] **Entrance Assessment & Interview Scheduling [Playbook p. 17]**:
  - Automated scheduling of entrance examination slots and parent interview dates.
  - Reviewer score entry: Entrance test score, interviewer ratings, and admissions officer qualitative comments.
- [ ] **Decision Workflow & Conversion [Playbook p. 17]**:
  - Admissions committee review workflow: Accept, Waitlist, Reject with automated notification triggers.
  - Branded conditional offer letter PDF generation with digital signature.
  - Parent digital acceptance and registration deposit collection.
  - One-click applicant-to-student conversion: Automatically generates student profile, assigns unique admission number, establishes guardian links, and assigns initial class arm.
  - Admissions analytics: Conversion funnel by marketing channel, application volume by class level, drop-off analysis.

---

### Module 3: Student Information System (SIS) [Playbook p. 11-12, 18]
*The authoritative, non-destructive core database of institutional student records.*

- [ ] **Unified Student Profile [Playbook p. 18]**:
  - Stable unique identifier (Permanent Admission Number) across school lifecycle.
  - Comprehensive biodata: Full legal name, preferred name, DOB, gender, blood group, genotype, allergies, state of origin, LGA, nationality.
  - Linked parent/guardian accounts with designated custody and billing flags.
  - Emergency contact registry with verified phone numbers.
  - Digital document vault: Birth certificate, enrollment contract, past school transfer certificates.
- [ ] **Historical Enrollment & Non-Destructive Lifecycle [Playbook p. 18]**:
  - Non-destructive class history: Class promotions, demotions, and arm transfers create new timestamped enrollment periods rather than overwriting past records.
  - Student status state machine: `ACTIVE`, `SUSPENDED`, `EXPELLED`, `TRANSFERRED`, `GRADUATED`, `WITHDRAWN`.
  - Withdrawn and graduated students remain fully queryable for historical reporting and transcript generation according to retention policy.
- [ ] **Behavioral, Welfare & Disciplinary Tracking [Playbook p. 12, 18]**:
  - Incident logging: Disciplinary infractions, merits, awards, leadership appointments.
  - Strict confidentiality controls on sensitive welfare notes.
- [ ] **Advanced Student Discovery & Search [Playbook p. 18]**:
  - Multi-parameter search: By admission number, student name, guardian phone/email, class/arm, session, fee debtor status, attendance risk level, and medical tag.

---

### Module 4: Academics, Timetable & Attendance [Playbook p. 13, 21]
*Controls daily school schedules, instructional tracking, and student attendance.*

- [ ] **Timetable Engine [Playbook p. 21]**:
  - Automated period grid builder: Period rules, duration, morning devotion, assembly, short break, lunch break.
  - Subject frequency rules per week (e.g., Mathematics 5x/week, Basic Science 3x/week).
  - Teacher subject/class allocation matrix with weekly maximum workload constraints.
  - Room and facility allocation (e.g., Science Lab, Computer Lab, Art Studio).
  - Double-booking conflict detector: Prevents assigning a teacher or a classroom to multiple classes at the same period.
  - Role-specific timetable views (Student timetable, Teacher weekly schedule, Master school grid) with printable PDF exports.
- [ ] **Attendance Engine [Playbook p. 21]**:
  - Daily morning and afternoon registers, or subject-by-subject attendance recording.
  - Configurable attendance statuses: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `SICKBAY`.
  - Automatic triggers:
    - Instant parent SMS/in-app alert upon student marked absent.
    - Repeated absence warning trigger (e.g., 3 consecutive days absent flags class tutor and principal).
    - Lateness tracking with aggregate term lateness penalties.
  - End-of-day register freeze with Maker-Checker Level 1 approval required for post-lock attendance alterations.
- [ ] **Offline Tolerance for Attendance [Playbook p. 21]**:
  - PWA local queuing: Teachers can mark morning attendance on a mobile phone or tablet without active internet.
  - Local transaction storage with cryptographic timestamps.
  - Background synchronization upon network restoration with conflict-resolution rules.

---

### Module 5: Assessments, Exams, Results & Report Cards [Playbook p. 13, 22]
*Delivers an end-to-end, tamper-proof academic results pipeline.*

- [ ] **Configurable Grading Scheme & Assessment Structure [Playbook p. 16, 22]**:
  - Flexible score components: Continuous Assessment (e.g., CA1: 10 marks, CA2: 10 marks, Mid-Term: 20 marks) and Terminal Examination (e.g., Exam: 60 marks). Total: 100 marks.
  - Configurable grade bands per school section:
    - E.g., `A (75-100, Excellent)`, `B (65-74, Very Good)`, `C (50-64, Good)`, `D (45-49, Fair)`, `F (0-44, Fail)`.
  - Affective and psychomotor domain evaluation (punctuality, neatness, teamwork, leadership, sports, rated 1 to 5).
- [ ] **Controlled Score-to-Report Pipeline [Playbook p. 22]**:
  - Secure teacher score entry grid with boundary guards (rejects scores outside minimum/maximum allowed range).
  - Missing mark detector: Highlights unentered scores before batch submission.
  - Multi-stage approval workflow:
    - `DRAFT`: Teacher entering scores.
    - `SUBMITTED`: Formally submitted for departmental moderation.
    - `MODERATED`: Reviewed by Subject Lead / Vice Principal (Academics).
    - `APPROVED`: Authorized by Principal.
    - `LOCKED`: Cryptographically sealed. Cannot be edited directly.
- [ ] **Maker-Checker Post-Lock Correction Engine [Playbook p. 22, 36, 67]**:
  - Any edit to a locked result requires a Level 2 Dual-Control approval request:
    - Must specify exact subject, student, old score, new proposed score, and written justification.
    - Requires sign-off from Academic Lead AND Principal.
    - Immutable audit record written preserving before/after values and timestamps.
- [ ] **Automated Report-Card PDF Engine [Playbook p. 22]**:
  - School-branded layout: School crest, watermarked background, student passport photograph, class teacher and principal digital signatures.
  - Comprehensive performance summary: Subject scores, class average, highest/lowest class score, student position in arm and level (configurable per school preference), term cumulative average, attendance summary.
  - Automated teacher and principal comments generated from customizable phrase banks or manual entry.
  - Tamper-proofing: Embedded QR code linking to a secure public result verification URL verifying the report card's authenticity.
  - Term promotion engine: Rules-based automated student promotion to next academic class at the end of the 3rd term.

---

### Module 6: Fees, Payments & Financial Ledger [Playbook p. 13, 23-24]
*A double-entry, auditable financial subsystem eliminating school revenue leakage.*

- [ ] **Configurable Fee Schedules [Playbook p. 13, 23]**:
  - Fee categories: Mandatory tuition, boarding, bus transport (route-based), PTA levy, uniform, science lab, sports, lunch plan.
  - Class-level and term-specific fee schedules with optional sibling discount rules and scholarship deductions.
- [ ] **Itemized Invoicing & Billing Engine [Playbook p. 23]**:
  - Automated termly invoice generation for all enrolled students.
  - Itemized charges with flexible installment payment plans (e.g., 60% on resumption, 40% before mid-term).
  - Surcharge and late-payment penalty automation.
- [ ] **Integrated Payment Gateway Rails [Playbook p. 23-24]**:
  - Paystack and Flutterwave gateway integrations supporting Debit Cards, Bank Transfer, USSD, and dedicated Virtual Bank Accounts per student.
  - Strict server-side webhook signature verification.
  - Idempotency key enforcement on all payment callbacks to prevent double-crediting.
  - Browser redirect verification: Web application never treats client-side return URLs as payment confirmation.
  - Manual bank teller / POS transaction entry by bursar with required bank deposit reference and teller slip upload.
- [ ] **Double-Entry Student Account Ledger [Playbook p. 23, 44]**:
  - Strict ledger principle: Balances are dynamically calculated from immutable charges and settled credits.
  - Instant automated PDF payment receipts with unique receipt numbers, school crest, and QR validation.
  - Aging Debtors Report: Tracks outstanding receivables grouped by 30, 60, 90+ days.
- [ ] **Refunds, Reversals & Dual-Control Governance [Playbook p. 23, 36, 67]**:
  - Zero unilateral payment deletions or balance edits.
  - Any refund or payment reversal requires Level 2 Maker-Checker approval (Bursar requests, Finance Lead reviews, School Owner approves).
  - Compensating ledger transaction recorded with full audit context.

---

### Module 7: Communication & Notification System [Playbook p. 13-14, 25]
*An event-driven messaging service providing authoritative school-family communication.*

- [ ] **Event-Driven Architecture [Playbook p. 25]**:
  - Business domain events trigger asynchronous notification jobs (e.g., `INVOICE_GENERATED`, `PAYMENT_RECEIVED`, `STUDENT_ABSENT`, `RESULT_PUBLISHED`, `EMERGENCY_ALERT`).
  - Notification Engine matches events against configurable school delivery rules and user channel preferences.
- [ ] **Multi-Channel Adapter Pipeline [Playbook p. 25]**:
  - **In-App Notifications**: Real-time notification drawer and bell indicator with read/unread tracking.
  - **Transactional Email**: Branded HTML email templates dispatched via Resend / Postmark with delivery and bounce tracking.
  - **SMS Gateways**: Integrated with Nigerian SMS routes (Termii) for instant delivery of high-priority OTPs and absent alerts.
  - **WhatsApp Business Integration**: Automated WhatsApp notifications for fee invoices, payment receipts, and report card readiness links.
- [ ] **Delivery Tracking & State Machine [Playbook p. 25]**:
  - Explicit delivery states: `QUEUED`, `SENT`, `DELIVERED`, `FAILED`, `RETRIED`, `SUPPRESSED`, `CANCELLED`.
  - Automated retries with exponential backoff on transient network failures.
  - Broadcast management: Filter broadcasts by campus, class level, class arm, or debtor status.
  - School announcement board with expiration dates and pinned notices.

---

### Module 8: Dedicated Parent, Teacher & Student Portals [Playbook p. 12-13, 19-20]
*Role-specific, responsive experiences tailored to each distinct stakeholder persona.*

- [ ] **Parent Portal [Playbook p. 19]**:
  - Secure parent login via email/phone OTP.
  - Multi-child switcher: Seamlessly toggle between children across different classes or campuses within the same school.
  - Consolidated financial summary: View outstanding balance, download itemized term invoice, pay online via Paystack/Flutterwave, download receipts.
  - Academic records: View real-time subject assessments, download stamped PDF report cards.
  - Attendance history calendar with absence explanation submission.
  - Digital permission slips and appointment booking with teachers/principal.
- [ ] **Teacher Portal [Playbook p. 19]**:
  - "Today View": Daily schedule, current period, assigned classes, and pending tasks.
  - Quick attendance register: Mark class attendance in under 60 seconds with mobile optimization.
  - Continuous assessment scorebook: Input test, assignment, and exam marks with auto-calculated totals and grade bands.
  - Assignment creator: Create homework with file attachments, deadlines, and submission tracking.
  - Direct parent messaging (moderated and scoped to assigned students).
- [ ] **Student Portal [Playbook p. 19-20]**:
  - Personalized timetable and daily class schedule.
  - Subject study guides and learning resource downloads.
  - Homework and assignment submission portal.
  - Online quiz taking with immediate or deferred feedback.
  - Published term results and historical performance archive.
  - *Child Account Policy*: Configurable parent-managed access for Nursery/Primary vs independent secure login for Secondary students.

---

### Module 9: PTA, Events & Community [Playbook p. 14, 26]
*Fosters parent-school partnership with clear financial governance.*

- [ ] **PTA Governance & Organization [Playbook p. 26]**:
  - PTA executive committee membership directory and tenure tracking.
  - Meeting scheduler with automated calendar invites, agenda publication, and verified attendance taking.
  - Repository for meeting minutes, constitution, and financial audit reports.
- [ ] **Dedicated PTA Project Levies [Playbook p. 26]**:
  - Dedicated PTA project funding accounts (e.g., School Bus Project, Science Lab Expansion).
  - Explicit separation: PTA levy transactions are maintained in a segregated ledger domain, separate from school tuition.
  - Transparent fundraising progress bars and real-time contribution leaderboards.
- [ ] **Community Engagement & Events [Playbook p. 26]**:
  - School event management: Inter-house sports, Speech & Prize-Giving day, Carol service, Parent-Teacher conferences.
  - Parent RSVP tracking, visitor registration, and event ticketing if applicable.
  - Parent sentiment polling and digital voting on PTA agenda items.

---

### Module 10: Scholarships, Sponsorships & Vouchers [Playbook p. 14, 27]
*Manages tuition assistance, external sponsor funding, and commercial fee discounts.*

- [ ] **Scholarship Lifecycle Engine [Playbook p. 27]**:
  - Scholarship program definition: Merit-based, sports, underprivileged, staff child, board discretion.
  - Criteria definition: Minimum GPA, attendance threshold, financial need documentation.
  - Application intake, committee scoring, and approval workflow.
  - Automated award allocation: Applies specified percentage or fixed deduction against student invoices.
  - Termly scholarship renewal reviews based on academic performance.
- [ ] **External Sponsor Records [Playbook p. 27]**:
  - Sponsor entity management (e.g., Philanthropic Foundations, Alumni Sets, Corporate CSR).
  - Sponsor contribution ledger linked to specific beneficiary student accounts.
  - Sponsor progress reports: Termly academic performance and attendance summaries dispatched to verified sponsors.
- [ ] **Promotional Voucher Engine [Playbook p. 27]**:
  - Unique alphanumeric voucher code generation.
  - Value types: Fixed amount or percentage discount.
  - Usage restrictions: Specific fee items (e.g., registration fee only), maximum redemptions, student exclusivity, expiration dates.
  - Comprehensive redemption audit log with rate-limiting fraud controls.

---

### Module 11: Auxiliary School Operations [Playbook p. 14, 28-29]
*Unifies campus logistics, welfare, boarding, and facility management.*

- [ ] **Library Management [Playbook p. 28]**:
  - Book cataloging: Title, Author, ISBN, Category, Physical shelf location, barcode tracking.
  - Circulation desk: Issue book, return book, reservation queue.
  - Overdue book tracking with automatic fine calculation and integration with student billing ledger.
- [ ] **School Clinic & Student Welfare [Playbook p. 28]**:
  - Confidential medical profiles: Blood group, genotype, chronic conditions, emergency rescue medications, verified allergies.
  - Clinic visit log: Chief complaint, vital signs, administered first-aid/medication, attending nurse.
  - Parent emergency notification triggers for clinic admissions.
  - High-privilege access controls with strict medical privacy logging.
- [ ] **Transport & Bus Fleet Management [Playbook p. 28]**:
  - Vehicle fleet register: Registration number, roadworthiness expiry, insurance, assigned driver.
  - Bus routes and pickup/drop-off stops with estimated schedule times.
  - Student bus allocation and daily passenger manifests.
  - Route-specific transport fee billing integration.
- [ ] **Hostel & Boarding House Administration [Playbook p. 28-29]**:
  - Boarding facilities: Hostels, blocks, rooms, and bed-space allocation.
  - House master / mistress ward assignments.
  - Exeat and student movement management: Digital exeat application, parent authorization, gate pass verification, and check-in/out logging.
- [ ] **Cafeteria & Meal Management [Playbook p. 29]**:
  - Meal plan subscription tracking (Day students lunch plan vs Boarders daily feeding).
  - Special dietary requirement and food allergy alerts displayed at point of meal service.
- [ ] **Fixed Assets & Facility Maintenance [Playbook p. 29]**:
  - School asset inventory: Desks, lab equipment, IT hardware, generators, sports equipment.
  - Asset location, condition rating, designated custodian, warranty tracking.
  - Maintenance request ticketing: Request, approval, repair logging, cost recording.

---

### Module 12: Learning Management System (LMS) [Playbook p. 15, 30]
*A lightweight, integrated digital learning environment for hybrid education.*

- [ ] **Curriculum & Course Management [Playbook p. 30]**:
  - Course curriculum hierarchy: Subjects, Units/Modules, Lessons.
  - Rich lesson content authoring: Formatted text, downloadable PDF worksheets, slide presentations, embedded videos.
- [ ] **Online Assessments & Quizzes [Playbook p. 30]**:
  - Quiz builder: Multiple choice, True/False, short answer questions.
  - Timed online examinations with automated grading for objective questions.
  - Assignment submission portal: Students upload homework files; teachers provide inline feedback and scores.
- [ ] **Virtual Classroom Integrations [Playbook p. 30]**:
  - Direct integration with Zoom and Google Meet APIs.
  - Teachers schedule live classes directly from the lesson calendar.
  - Platform records lesson metadata, join links, and student attendance, while external providers host video streaming.
- [ ] **Learning Analytics [Playbook p. 30]**:
  - Student course progress tracking, lesson completion rates, quiz attempt counts, assignment submission timeliness.

---

### Module 13: AI & Intelligent Automation [Playbook p. 15, 31]
*Strictly assistive, human-governed AI tools that amplify staff productivity without hallucinated records.*

- [ ] **Strict AI Governance Standards [Playbook p. 31]**:
  - **Assistant, Not Authority**: AI never autonomously commits financial, academic, identity, or access-control mutations.
  - Mandatory human review: Every AI-generated draft must be reviewed and approved by an authorized user before publishing.
  - Contextual grounding: Generative features use authorized school records via RAG (Retrieval-Augmented Generation) rather than guessing.
  - Zero model training on student PII without explicit school contractual agreement and NDPA compliance.
- [ ] **Validated AI Use Cases [Playbook p. 31]**:
  - **Teacher**: Exam question draft generation from approved curriculum topics; lesson plan outline generator.
  - **Student**: Curated study buddy / concept explainer strictly bounded by curriculum and age-appropriate guardrails.
  - **Parent**: Plain-language student termly academic and attendance performance summary.
  - **Principal**: Automated executive synthesis of school-wide attendance anomalies and termly grade distribution trends.
  - **Bursar**: Fee anomaly and debtor explanation summaries derived directly from ledger transactions.

---

### Module 14: Dashboards, Analytics & Visual Reporting [Playbook p. 15, 32-35]
*High-density, filterable, action-oriented visualization for institutional leaders.*

- [ ] **Universal Dashboard Design Rules [Playbook p. 34-35]**:
  - Every major dashboard must answer: *What is happening? Where is it happening? What action should the user take next?*
  - KPI cards must display value, comparison period, timestamp, and clickable drill-down to underlying records.
  - All charts must feature labeled axes, units, time frames, and eliminate decorative clutter.
  - Multi-dimensional filters: Filter by campus, class level, arm, session, term, date range.
  - Data freshness indicators showing last sync/updated time.
- [ ] **Owner / Proprietor Executive Dashboard [Playbook p. 32]**:
  - Total student enrollment, campus distribution, and term-over-term student movement.
  - Revenue collection performance: Total billed, total collected, collection percentage, outstanding debtors aging breakdown.
  - School-wide attendance rate and academic pass rate benchmarks.
  - Action Center: Overdue fee notices, pending high-level approvals, critical system health alerts.
- [ ] **Principal & Academic Leadership Dashboard [Playbook p. 33]**:
  - Today's student attendance and unmarked class registers.
  - Incomplete result alert board: Teachers with outstanding score submissions.
  - Student welfare and clinic incident flags.
  - Academic performance distribution: Top-performing and at-risk students across class levels.
- [ ] **IT & Security Administrator Dashboard [Playbook p. 34]**:
  - Platform health, API error rates, and database response latency.
  - Automated backup status, last completed restore drill timestamp, and recovery readiness score.
  - Security audit monitor: Failed login spikes, suspicious IP locations, privileged role assignments, and active break-glass sessions.

---

### Module 15: Platform Administration & SaaS Multi-Tenancy [Playbook p. 15, 43, 64]
*SaaS operational controls for platform operators.*

- [ ] **Tenant Provisioning & Lifecycle [Playbook p. 43, 64]**:
  - Onboard new schools, manage school tenant states (`ACTIVE`, `TRIAL`, `SUSPENDED`, `ARCHIVED`).
  - SaaS subscription plans: Starter, Standard, Enterprise with seat and storage quotas.
  - Feature flag management: Toggle modules (e.g., enable LMS, Hostel, or Transport per school).
- [ ] **Platform Health & Audit Monitoring [Playbook p. 64]**:
  - Global tenant health metrics, background queue latencies, and third-party API quotas (Paystack, Termii).
  - Platform-level audit trail tracking all superadmin interventions.
  - Tenant database backup management and cross-school data export utilities.

---

## 4. Non-Functional, Security & Compliance Requirements

### 4.1 Security Baseline (OWASP ASVS 5.0) [Playbook p. 38-39]
- **Authentication**:
  - Password policies: Minimum 10 characters, complexity requirements, hashed using Argon2id or Bcrypt (cost factor 12).
  - Mandatory Multi-Factor Authentication (MFA via TOTP or SMS OTP) for all privileged roles (Proprietor, Principal, Bursar, IT Admin).
  - Session security: Secure HTTP-only cookies, `SameSite=Lax`, automatic session expiration (15 minutes idle for financial/admin portals).
  - Brute-force protection: Rate limiting on authentication and password reset endpoints (5 attempts per IP/account window).
- **Authorization & Tenant Isolation [Playbook p. 38, 43]**:
  - Strict logical tenant isolation: Every database table contains `school_id`.
  - Data access middleware enforces `where: { schoolId }` automatically on all read, write, and delete queries.
  - Direct Object Reference (IDOR) prevention: All API endpoints verify resource ownership and user role/assignment permissions.
  - Deny-by-default API policies: Unauthenticated or unassigned requests receive `403 Forbidden`.
- **Encryption & Secrets Management [Playbook p. 38]**:
  - TLS 1.3 enforced for all data in transit; HSTS enabled.
  - Sensitive data at rest (passwords, tokens, API secrets) encrypted using AES-256-GCM.
  - Zero secrets committed to version control; runtime injection via environment variables.

### 4.2 Data Protection & Nigerian Compliance (NDPA 2023) [Playbook p. 4, 40]
- **Statutory Alignment**: Designed strictly to fulfill the Nigeria Data Protection Act 2023 and the NDPC General Application and Implementation Directive (GAID 2025).
- **Data Inventory & Lawful Purpose**: Explicit mapping of data fields collected, retention periods, and lawful basis (Contractual obligation, Legal obligation, or Consent).
- **Children's Privacy**: Clear guardian authorization records for processing minor student data; parent-controlled access for primary students.
- **Data Subject Rights Engine**:
  - Right to Access & Portability: One-click export of complete student data in structured JSON/CSV format.
  - Right to Rectification: Tracked correction workflows for identity and biodata fields.
  - Right to Erasure / Restriction: De-identification and pseudonymization workflows that comply with statutory educational record retention laws.

### 4.3 Disaster Recovery & Business Continuity [Playbook p. 41-42]
- **Recovery Point Objective (RPO)**: **≤ 15 minutes** (Continuous Write-Ahead Log replication and automated snapshots).
- **Recovery Time Objective (RTO)**: **60 – 120 minutes** (Documented, automated restore runbook).
- **Backup Architecture**:
  - Daily full encrypted snapshots + continuous point-in-time recovery (PITR).
  - Geographic isolation: Backup replicas stored in separate failure domains / cloud regions.
  - Immutable backups: School administrators cannot delete backups; write-once-read-many (WORM) storage controls.
  - Mandatory periodic restore drills to verify database and file integrity before emergencies.

---

## 5. Unresolved Items, Contradictions & Risks Flagged for Approval

The following items are explicitly surfaced from our analysis of the 70-page blueprint for user decision:

| ID | Category | Item / Question | Blueprint Reference | Proposed Resolution |
| :---: | :--- | :--- | :--- | :--- |
| **Q1** | **Academic Logic** | Handling student ranking/position on report cards: Should ranking (e.g., "1st out of 35") be mandatory or configurable per school? | [Playbook p. 22] | Make position calculation **strictly configurable per school** in the School Setup Wizard, as modern early-years and international curricula reject public student ranking. |
| **Q2** | **Finance Model** | Multi-child family invoicing: Should invoices be billed per student or aggregated per parent/family? | [Playbook p. 19, 23] | Maintain **invoices at the individual student record level**, with an aggregated "Family Billing Summary" view in the Parent Portal for single-click joint settlement. |
| **Q3** | **Tenant Architecture** | Schema-per-tenant vs Shared-Database with tenant key (`school_id`): | [Playbook p. 43] | Start with **Shared Database + strict `school_id` tenant scoping and RLS** to keep operational overhead and costs minimal during early SaaS phase, while architecting schema isolation hooks for large enterprise networks. |
| **Q4** | **Payment Gateway** | Paystack sub-accounts vs direct merchant credentials: | [Playbook p. 24, 56] | Support **Paystack Split Payments / Subaccounts** so schools receive funds directly into their commercial bank accounts while the platform deducts SaaS subscription/transaction fees automatically. |
| **Q5** | **Offline Attendance** | Conflict resolution when attendance is marked offline on two devices: | [Playbook p. 21] | Implement **Last-Write-Wins with explicit teacher timestamp attribution** and flag conflicting statuses for class tutor review upon sync. |
