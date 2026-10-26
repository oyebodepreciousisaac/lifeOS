# School Operating System (SchoolOS)
## User Roles, Permissions & Governance Matrix

> **Document Version**: 1.0  
> **Source Document**: *School Operating System Complete Product Validation, Feature Blueprint, Security Architecture and Development Playbook (28 September 2026)*  
> **Governance Model**: Resource-Scoped RBAC + 4-Tier Maker-Checker Dual-Control Engine  
> **Compliance Baselines**: OWASP ASVS 5.0, NDPA 2023  
> **Status**: Comprehensive Baseline (Pending User Sign-Off)

---

## 1. Multi-Level Organizational Hierarchy [Playbook p. 10, 56-57]

To prevent unsafe privileges and ensure institutional accountability, SchoolOS strictly divides users across **6 distinct organizational levels**:

```
+------------------------------------------------------------------------------------+
| LEVEL 1: PLATFORM OPERATOR (SaaS Owner, Platform Admin, Support Engineer)          |
| Global tenant provisioning, system health, SaaS billing. Zero direct student view. |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
| LEVEL 2: SCHOOL OWNERSHIP (Proprietor, Board Chairman, Managing Director)          |
| Legal data controller, policy approvals, fee approval, high-risk dual control.     |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
| LEVEL 3: SCHOOL MANAGEMENT (Principal, Vice Principal, Bursar, Registrar)          |
| Daily institutional operations, admissions, academic moderation, financial ledger. |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
| LEVEL 4: OPERATIONAL STAFF (Class Teachers, Subject Specialists, Nurse, Drivers)   |
| Scoped strictly to assigned classes/subjects: attendance, scores, clinic visits.   |
+------------------------------------------------------------------------------------+
                                         │
                    +--------------------+--------------------+
                    ▼                                         ▼
+----------------------------------------+ +-----------------------------------------+
| LEVEL 5: FAMILIES (Parents/Guardians)  | | LEVEL 6: STUDENTS                       |
| Child switcher, fee payments, receipts,| | Timetable, class notes, homework, tests.|
| term report cards, attendance alerts.  | | Primary: parent-managed; Sec: direct login|
+----------------------------------------+ +-----------------------------------------+
```

---

## 2. Granular Permissions & Role Mapping Matrix [Playbook p. 10]

Permissions follow the standard convention: `domain.action_scope`.

| Role | Scope of Access | Key Permissions Granted | Sensitive / Restricted Capabilities |
| :--- | :--- | :--- | :--- |
| **Platform SuperAdmin** | Multi-tenant SaaS platform | `tenants.*`, `platform.billing`, `system.telemetry`, `platform.audit_view` | **Strictly prohibited** from viewing student PII or editing grades without an audited emergency Break-Glass session. |
| **School Proprietor / Owner** | Single School Tenant (all branches) | `school.profile_manage`, `fees.publish`, `approvals.level2_approve`, `audit.view_all`, `analytics.view_executive` | High-level business governance; receives automated alerts for all high-risk approval requests. |
| **School Principal** | School Academic Operations | `admissions.approve`, `results.approve_lock`, `timetable.publish`, `attendance.view_school`, `staff.manage` | Can moderate and approve termly results, authorize admissions, and review academic dispute escalations. |
| **Bursar / Finance Officer** | School Financial Subsystem | `fees.structure_draft`, `invoices.generate`, `payments.record_manual`, `payments.reconcile`, `reports.financial_view` | **Cannot edit academic grades.** Cannot execute unilateral refunds/reversals (requires Level 2 approval). |
| **Registrar / Admissions Officer** | Admissions & Student Records | `admissions.inquiry_manage`, `admissions.offer_generate`, `students.convert_applicant`, `students.read_all` | Cannot alter locked academic results or delete enrolled student files. |
| **Subject Teacher** | Strictly Assigned Subjects & Class Arms | `results.enter_assigned`, `assignments.create_assigned`, `learning.upload_resource` | Can only input Continuous Assessment marks for classes they teach. Cannot edit marks after submission. |
| **Class Form Teacher** | Assigned Class Arm (e.g., JSS 1 Gold) | `attendance.mark_assigned`, `reports.comment_assigned`, `behavior.log_assigned`, `students.read_assigned` | Manages daily morning/afternoon attendance register and termly report-card student character comments. |
| **School IT Administrator** | Technical System Configuration | `users.create_routine`, `settings.manage_config`, `devices.configure`, `audit.view_security` | **Cannot edit protected student grades or financial ledgers.** Must submit an approval request to change identity fields. |
| **School Nurse / Health Officer**| School Clinic | `clinic.log_visit`, `clinic.view_allergies`, `clinic.notify_parent` | Access strictly restricted to medical logs; zero access to academic grades or fee balances. |
| **Parent / Legal Guardian** | Linked Children Only | `children.view_profile`, `fees.view_invoices`, `payments.pay_online`, `results.view_published`, `attendance.view_child` | Zero visibility into other students' records or school-wide averages beyond benchmark distribution. |
| **Student (Secondary Level)**| Personal Account Only | `student.view_timetable`, `student.submit_assignment`, `student.take_quiz`, `student.view_results` | Read-only view of their own verified records; cannot view unapproved draft results. |

---

## 3. The 4-Tier Maker-Checker Governance Engine [Playbook p. 10, 23, 36-37, 67]

SchoolOS eliminates the risk of fraud, grade tampering, and unauthorized data leakage by enforcing **Separation of Duties** through 4 explicit approval tiers:

```
+---------------+---------------------+---------------------------------------------------------------+-----------------------------------------+
| Level         | Classification      | Permitted Operations                                          | Participant Requirements                |
+---------------+---------------------+---------------------------------------------------------------+-----------------------------------------+
| Level 0       | Direct / Low Risk   | Marking attendance register, drafting assignments, notices    | Requester only (logged in audit stream) |
| Level 1       | Single Approval     | Student contact address update, assessment score submission   | Requester + 1 Direct Supervisor         |
| Level 2       | Dual Control        | Locked result edit, payment reversal/refund, data export      | Requester + Lead Reviewer + Principal/Owner|
| Level 3       | Quorum / Triple Ctrl| Production DB restore, bulk student deletion, break-glass     | Requester + School Owner + Platform Ops |
+---------------+---------------------+---------------------------------------------------------------+-----------------------------------------+
```

### 3.1 The Master Approval Matrix [Playbook p. 67]

| Action | Requester | Approver 1 (Verification) | Approver 2 (Executive) | Executor | Audit Logging |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Edit Locked Exam Result** | Teacher / Admin | Academic Lead / VP | Principal / Owner Delegate | Automated Engine | **MANDATORY** |
| **Reverse / Refund Payment** | Bursar | Finance Lead | School Owner / Principal | Finance Operator | **MANDATORY** |
| **Change Privileged Role** | School IT Admin | School Owner | Platform Admin | System Controller| **MANDATORY** |
| **Bulk Student Deletion / Merge**| Registrar / IT | School Owner | Second Authorized Officer | Platform Operator| **MANDATORY** |
| **Production Database Restore** | IT / Vendor | School Owner / Incident Lead | Platform Operations Lead | Platform Operator| **MANDATORY** |
| **Delete / Purge Backup** | Platform Ops | Security / Owner Role | Second Platform Approver | Restricted Operator| **MANDATORY** |
| **Export Sensitive Student PII**| School IT / Admin| School Owner | Privacy Officer | Authorized Exporter| **MANDATORY** |
| **Change Published Fee Schedule**| Bursar | Finance Lead | School Owner / Principal | Bursar | **MANDATORY** |
| **Change Grading Scheme Post-Exam**| Academic Lead | Principal | School Owner / Delegate | Academic Admin | **MANDATORY** |

---

## 4. Separation-of-Duties Rules & Privileges Boundary [Playbook p. 10, 56-57]

### 4.1 Non-Negotiable Governance Invariants
1. **Self-Approval Prohibition**: A user can never approve a change request they created, regardless of how high their administrative rank is.
2. **Executor Isolation**: An approver cannot execute a protected mutation directly without passing through the automated execution engine or a distinct designated operator.
3. **School IT Administrator Boundary [Playbook p. 57]**:
   - The school IT administrator manages user passwords, campus device logins, and general configuration settings.
   - **The IT administrator has ZERO direct write permissions to academic results, fee structures, or financial transactions.**
   - If an IT admin attempts to modify a protected student identity field or score, the system enforces a `Request Only` modal that generates a Level 2 approval request.
4. **Time-Limited Request Expiry**:
   - Any approval request not acted upon within **72 hours** is automatically marked `EXPIRED` and must be re-requested with current justification.
5. **Emergency Break-Glass Protocol [Playbook p. 36, 44]**:
   - In catastrophic scenarios (e.g., active cybersecurity incident or critical data corruption during term closing), a designated superadmin can trigger a "Break-Glass Session".
   - Break-glass grants temporary elevated access for a maximum of **60 minutes**.
   - Triggers high-priority SMS/Email alerts to the School Proprietor and Platform Security Operator, requiring a mandatory post-incident audit review.

---

## 5. Approval Workflow User Experience (UX) Standards [Playbook p. 67]

The Maker-Checker interface is built into the core administrative navigation:

1. **Reason & Justification Required**: The requester must provide a written rationale (minimum 20 characters) and upload supporting documents (e.g., scanned exam paper or bank reversal letter).
2. **Before / After Diff Card**: Approvers are shown a clean visual comparison card showing:
   - Target Entity (e.g., `Student: Chioma Adeleke (ADM-2026-081) - Mathematics CA2`).
   - Old Value: `12 / 20` (entered by Teacher J. Okafor on 12/10/2026).
   - Proposed New Value: `18 / 20`.
   - Reason: `"Marking script re-check identified untallied Section B score (+6 marks)"`.
3. **Re-Authentication for Highest-Risk Actions**: For Level 2 and Level 3 actions, approvers must re-enter their password or provide an MFA token prior to submission.
4. **Immutable Audit Persistence**: Upon final execution, an append-only `AuditEvent` record is written capturing the full JSON diff, user identities, IP addresses, and timestamps.
