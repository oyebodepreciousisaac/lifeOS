# SquareOS — School Operating System

<div align="center">

[![CI Pipeline](https://github.com/oyebodepreciousisaac/square-os/actions/workflows/ci.yml/badge.svg)](https://github.com/oyebodepreciousisaac/square-os/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://square-os-tau.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.2_App_Router-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com)

**An institutional, multi-tenant school management and governance SaaS platform engineered for Nigerian and African primary and secondary educational institutions.**

[Live Production Demo](https://square-os-tau.vercel.app) &bull; [Documentation](docs/)

</div>

---

## Overview

**SquareOS** provides a single authoritative operational source of truth for educational institutions. Designed specifically around Nigerian curriculum frameworks (WAEC, NECO, Cambridge, Universal Basic Education) and monetary realities (₦ Naira currency, Paystack integration, flexible payment schedules, debtor management).

The platform eliminates fee leakage, automates classroom attendance, streamlines continuous assessment scorebooks, and enforces dual-authorization (Maker-Checker) governance over sensitive school operations.

---

## Core Capabilities

### 🎓 1. Student Information System (SIS) & Admissions
* Complete biometric, medical, and kinship biodata per student record.
* Custom class structures with customizable arms (Gold, Silver, Platinum, A, B, etc.).
* Automated admission numbering, student enrollment status, and parent guardian linking.

### ⏱️ 2. Rapid Classroom Roll Call & Attendance (<60s)
* Fast morning assembly and afternoon roll-call register.
* Lateness detection with bell cutoff times (default 08:15 AM).
* Automated parent absence notifications and daily punctuality analytics.
* PWA offline caching with background synchronization for low-bandwidth environments.

### 📊 3. Continuous Assessment (CA) & Examination Scorebook
* Boundary-guarded score entry adhering to statutory weightings: **CA 1 (20) + CA 2 (20) + Exam (60) = 100 Marks**.
* Automatic total score calculation, standard letter grading (A–F), and cumulative GPA.
* Tamper-evident moderation workflow with administrative approval.
* Terminal report card compilation with verified cryptographic digital seals.

### 💳 4. Double-Entry Bursary Ledger & Fee Collection
* Immutably logged invoices and payments—zero mutable balance columns.
* Direct Paystack payment gateway integration with verified webhook fulfillment.
* Term fee schedules, flexible concessions, and aging debtor tracking.
* Real-time cash collection rates and revenue forecasting.

### ⚖️ 5. Dual-Control Maker-Checker Governance
* Critical administrative operations (score alterations, tuition reversals, student withdrawal) require dual authorization before execution.
* Full immutable audit trails recording timestamps, IP addresses, and acting principals.

### 🌓 6. Native Light & Dark Mode
* System-wide theme switcher with instant toggle between crisp institutional light mode and dark mode.
* Apple-grade responsive layouts tailored for mobile devices (teachers, parents, students) and desktop workstations (bursars, principals, super-admins).

---

## Stakeholder Portals

| Role | Workspace Access | Primary Responsibilities |
|---|---|---|
| **Super Admin** | `/super-admin` | Platform owner command center, multi-school tenant directory, subscription billing, and system telemetry. |
| **School Administrator** | `/dashboard` | Institutional executive dashboard, admissions funnel, academic configuration, and staff management. |
| **Class Teacher** | `/portal/teacher` & `/admin/assessments` | Roll-call attendance register, CA scorebook marks entry, weekly timetable, and class roster. |
| **Bursar** | `/admin/finance` | Fee schedules, invoice generation, reconciliation, debtor ledgers, and payment verification. |
| **Parent** | `/portal/parent` | Wards overview, tuition online payment (Paystack), terminal report cards, and attendance alerts. |
| **Student** | `/portal/student` | Academic desk, class timetable, homework, learning materials, and terminal grades. |

---

## Monorepo Architecture

SquareOS is structured as a TypeScript npm monorepo separating concerns across apps and packages:

```text
square-os/
├── apps/
│   ├── web/               # Next.js 14 App Router full-stack web application
│   └── workers/           # Background event processors & notification queue workers
├── packages/
│   ├── db/                # Prisma ORM schema, tenant-scoped client, and migrations
│   ├── ui/                # Shared reusable Tailwind component library
│   └── config/            # Shared Tailwind, PostCSS, and TypeScript configurations
├── docs/                  # Architectural blueprints, database schemas, and guides
└── .github/workflows/     # CI/CD verification & build automation pipeline
```

---

## Getting Started

### Prerequisites
* **Node.js**: `v20.x` or later
* **npm**: `v10.x` or later
* **PostgreSQL Database**: Supabase or local PostgreSQL instance

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/oyebodepreciousisaac/square-os.git
cd square-os
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are configured:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_SECRET_KEY="sk_test_..."
SESSION_SECRET="your-32-char-random-secret-key"
```

### 3. Generate Database Client & Seed
```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Assurance

SquareOS enforces strict continuous integration standards on every pull request and commit:

```bash
# Typecheck all monorepo workspaces
npm run typecheck

# Codebase lint check
npm run lint

# Production build (Prisma client generation + Next.js static page compilation)
npm run build
```

---

## Documentation

Comprehensive product specifications, data schemas, and deployment guides are available in the [`docs/`](docs/) directory:

* [System Architecture](docs/SYSTEM-ARCHITECTURE.md)
* [Database Schema & Partitioning](docs/DATABASE-DESIGN.md)
* [Product Requirements](docs/PRODUCT-REQUIREMENTS.md)
* [User Roles & RBAC Matrix](docs/USER-ROLES.md)
* [Design System Specification](docs/DESIGN-SYSTEM.md)
* [Deployment & Supabase Setup Guide](docs/DEPLOYMENT_AND_DATABASE_GUIDE.md)

---

## License & Support

&copy; 2026 SquareOS Systems Ltd. Multi-Tenant Enterprise Software. Engineered by **Oyebode Precious**.
