# School Operating System (SchoolOS)
## Design System & Visual Specification

> **Document Version**: 1.0  
> **Source Document**: *School Operating System Complete Product Validation, Feature Blueprint, Security Architecture and Development Playbook (28 September 2026)*  
> **Design Philosophy**: Executive, Trustworthy, Data-Dense, High-Contrast, Calm & Modern  
> **Accessibility Standard**: WCAG 2.1 AA Compliant (Touch targets ≥ 44px, Contrast ≥ 4.5:1)  
> **Status**: Comprehensive Baseline (Pending User Sign-Off)

---

## 1. Brand Identity & Product Aesthetics [Playbook p. 8, 32-35]

SchoolOS is an institutional operating platform deployed across diverse user personas—from high-net-worth School Proprietors reviewing multi-million Naira cash collections on a MacBook to Class Teachers marking morning attendance on a low-end Tecno/Infinix smartphone over an intermittent 3G connection.

### 1.1 Aesthetic Pillars
1. **Calm Institutional Authority**:
   - Uses deep institutional navies, crisp slate surfaces, and refined emerald accents that evoke stability, academic rigor, and financial security.
   - Avoids toy-like or juvenile educational gamification in administrative and finance workflows.
2. **Data Density without Cognitive Overload**:
   - High information density using clean typography, deliberate whitespace, and structured data tables.
   - Every metric answers: *What is happening? Where is it happening? What action should the user take next?* [Playbook p. 32].
3. **High Contrast & Sunlight Legibility**:
   - Deep text contrast ratios exceeding 7:1 for critical numbers and names, ensuring high legibility in bright West African classroom environments.
4. **Resilient Mobile-First Responsiveness**:
   - Designed to run seamlessly on small smartphone screens (375px viewport minimum), tablets, laptops, and ultra-wide administrative desktop monitors.

---

## 2. Color Palette & Semantic Design Tokens

### 2.1 Core Palette

```
+---------------------------------------------------------------------------------------+
|  PRIMARY BRAND: Deep Institutional Navy (Solidity, Trust, Governance)                 |
|  navy-950: #0B132B  |  navy-900: #1C2541  |  navy-800: #233157  |  navy-600: #3A506B  |
+---------------------------------------------------------------------------------------+
|  ACCENT / SUCCESS: Growth Emerald & Teal (Academic Achievement, Settled Finance)     |
|  emerald-700: #047857 | emerald-600: #059669 | emerald-500: #10B981 | teal-500: #14B8A6|
+---------------------------------------------------------------------------------------+
|  SURFACE & NEUTRALS: Crisp Warm Slate (Clarity, Low Eye Fatigue)                     |
|  slate-900: #0F172A | slate-800: #1E293B | slate-600: #475569 | slate-100: #F1F5F9  |
|  slate-50:  #F8FAFC | white:     #FFFFFF                                              |
+---------------------------------------------------------------------------------------+
|  SEMANTIC STATUS ALERTS: High-Visibility Feedback                                     |
|  Destructive/Debt: #DC2626 (Rose-600)   | Warning/Pending: #D97706 (Amber-600)       |
|  Info/Processing:  #2563EB (Blue-600)   | Neutral/Draft:   #64748B (Slate-500)       |
+---------------------------------------------------------------------------------------+
```

### 2.2 Semantic Color Mapping

| Token Name | Hex Value | Purpose & Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` (Light) / `#0A0F1D` (Dark) | Primary application background |
| `--bg-card` | `#FFFFFF` (Light) / `#111827` (Dark) | Dashboard cards, data tables, modals |
| `--border-subtle` | `#E2E8F0` (Light) / `#1F2937` (Dark) | Card dividers, table borders |
| `--text-primary` | `#0F172A` (Light) / `#F8FAFC` (Dark) | Headings, student names, fee sums |
| `--text-muted` | `#64748B` (Light) / `#94A3B8` (Dark) | Form labels, helper copy, timestamps |
| `--accent-brand` | `#059669` | Primary action buttons, active navigation indicators |
| `--status-paid` | `#ECFDF5` (bg) / `#065F46` (text) | Settled invoices, present attendance |
| `--status-debt` | `#FEF2F2` (bg) / `#991B1B` (text) | Overdue fees, student absences |
| `--status-pending` | `#FFFBEB` (bg) / `#92400E` (text) | Awaiting Maker-Checker approval |

---

## 3. Typography Hierarchy

### 3.1 Font Families
- **Primary Interface Font**: `Plus Jakarta Sans` or `Inter` (Google Fonts) — exceptional legibility at small sizes, crisp numerals, wide geometric weight range.
- **Monospace Font (Identifiers)**: `JetBrains Mono` — used strictly for permanent Admission Numbers (e.g. `ADM-2026-0041`), Payment References (`PAY-991204`), and QR Verification Hashes.

### 3.2 Type Scale

| Style / Level | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Heading** | 32px (`2rem`) | 38px | Bold (`700`) | Executive Dashboard Top KPI summaries |
| **Section Title** | 24px (`1.5rem`) | 30px | SemiBold (`600`) | Page headers (e.g., "Student Records", "Terminal Results") |
| **Subsection Title** | 18px (`1.125rem`)| 24px | SemiBold (`600`) | Card titles, modal headers, table group headers |
| **Body (Default)** | 14px (`0.875rem`)| 20px | Regular (`400`) | Table rows, general body text, form input values |
| **Body (Medium)** | 14px (`0.875rem`)| 20px | Medium (`500`) | Navigation items, table headers, button labels |
| **Caption / Muted** | 12px (`0.75rem`) | 16px | Regular (`400`) | Timestamps, audit diff subtext, status badges |
| **Mono Identifier** | 13px (`0.8125rem`)| 18px | Regular (`400`) | `ADM-2026-081`, transaction references, checksums |

---

## 4. Universal UI State Machine Standards [Playbook p. 9, 41, 68]

Every interactive component, page, and data table must explicitly implement all states of the **Universal State Machine**:

```
[IDLE / INITIAL] ──► [LOADING (Skeleton)] ──► [SUCCESS / POPULATED]
                            │                          │
                            ▼                          ├── [EMPTY STATE (Helpful CTA)]
                     [SERVER ERROR]                    ├── [PERMISSION DENIED (403)]
                            │                          └── [SESSION EXPIRED (Modal Re-Auth)]
                            ▼
               [RETRY / RECOVERY ACTION]
```

### 4.1 State Implementation Specifications

1. **Loading State (Skeleton Screens)**:
   - Zero generic blocking spinner wheels in full-page views.
   - Uses subtle pulse skeleton blocks matching the exact geometry of cards, KPI blocks, and table rows to prevent layout shift (CLS).
2. **Empty State (Actionable Guidance)**:
   - When no records exist (e.g., a new class with zero enrolled students), display:
     - Clear graphic icon.
     - Direct explanation: `"No students enrolled in JSS 1 Gold yet."`
     - Action CTA: `[+ Add Student]` or `[Import Students from CSV]`.
3. **Form Validation Error State**:
   - Field borders turn Rose-500 (`#F43F5E`) with an inline warning message beneath the affected input.
   - Form submission automatically scrolls to the first invalid field and focuses it.
4. **Server & Network Error State**:
   - Displays friendly, human explanation without leaking internal database stack traces or SQL snippets.
   - Always provides a tracking `Correlation ID: err_req_8921a` and a single-click `[Retry Request]` button.
5. **Permission Denied State (`403 Forbidden`)**:
   - Informs the user of their current role and why access is restricted (e.g., `"Bursar role does not have permission to view academic exam results. Contact your School Owner."`).
6. **Session Expired State**:
   - Pops a non-disruptive re-authentication modal that allows the user to re-enter their password/MFA without losing un-submitted form data.

---

## 5. Dashboard & Visual Reporting Standards [Playbook p. 32-35]

Every dashboard in SchoolOS adheres to strict visual rules to eliminate deceptive, decorative, or confusing visualizations:

```
+------------------------------------------------------------------------------------+
|  KPI CARD ANATOMY                                                                  |
|  +------------------------------------------------------------------------------+  |
|  | TOTAL FEES COLLECTED (TERM 1)                              [ Filter: JSS 1 v ]| |
|  | ₦ 42,850,000                                               ▲ +14.2% vs Term 3 | |
|  | Target: ₦ 48,000,000 (89.2% settled)                    Updated 2 mins ago ↻  | |
|  | [Click to view outstanding 42 debtors list ──►]                              |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

### 5.1 Visualization Rules [Playbook p. 34-35]
- **KPI Cards**: Must always feature the metric label, exact value, comparison benchmark (period-over-period), freshness timestamp, and a clickable link to the underlying filtered data.
- **Charts & Graphs**:
  - Every chart must have clearly labeled axes, units (₦, %, count), and time intervals.
  - No 3D charts, pie charts with >5 slices, or unlabeled doughnut charts.
  - Bar charts are preferred for discrete categories (e.g., Attendance by Class Arm, Collections by Fee Type); Line charts are used strictly for continuous time-series (e.g., Daily Fee Settlement Velocity).
- **Accessibility Safeguard**: **Color is never the sole communicator of status.** Badges and alerts always pair color with text labels and recognizable icons (e.g., ✓ Paid, ⚠ Pending Approval, ✕ Overdue).

---

## 6. Core Component Library Design Tokens

### 6.1 Buttons
- **Primary**: Solid Emerald (`bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium rounded-lg px-4 py-2.5`).
- **Secondary**: Crisp Slate Outline (`border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg px-4 py-2.5`).
- **Destructive**: Rose Subtle (`bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium rounded-lg px-4 py-2.5`).
- **Touch Target Safeguard**: Minimum touch boundary of `44px x 44px` on all mobile viewports.

### 6.2 Data Tables
- **Header**: Subtle slate background (`bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider py-3 px-4 border-b border-slate-200`).
- **Rows**: Alternating subtle zebra striping or crisp white with hover highlight (`hover:bg-slate-50/80 transition-colors`).
- **Sticky Columns**: First column (Student Name & Admission Number) remains pinned during horizontal scrolling on mobile and tablet devices.
- **Bulk Action Bar**: Floating sticky bottom bar appears when rows are selected (e.g., `"14 students selected — [Send SMS] [Export CSV] [Generate Invoices]"`).

### 6.3 Maker-Checker Diff Cards [Playbook p. 67]
- Renders sensitive change requests side-by-side:
  - Left pane: `CURRENT STATE` (highlighted in soft red / neutral).
  - Right pane: `PROPOSED MUTATION` (highlighted in soft green).
  - Footer: Written justification, requester profile, risk badge (Level 1, 2, or 3), and sign-off action buttons `[Reject with Note]` / `[Approve & Sign]`.
