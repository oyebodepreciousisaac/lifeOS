# SquareOS — Production Deployment & Database Architecture Guide

This guide details the recommended database architecture and step-by-step deployment procedure to launch **SquareOS** on **GitHub**, **Vercel**, and **Supabase**.

---

## 1. Database Architecture Recommendation: Supabase (Recommended)

After evaluating **Supabase** vs. **Neon** for a multi-tenant institutional operating system handling hundreds of schools, students, double-entry financial ledgers, and document uploads, **Supabase** is the recommended solution.

| Architectural Dimension | Supabase (Recommended) | Neon | Why It Matters for SquareOS |
| :--- | :--- | :--- | :--- |
| **Connection Pooling** | Built-in Supavisor pooler (Transaction & Session modes on port 6543) | PgBouncer built-in | Next.js serverless functions on Vercel spin up hundreds of concurrent connections; Supavisor prevents PostgreSQL connection exhaustion during morning roll calls and bulk term invoicing. |
| **Object Storage (Files)** | Native S3-compatible Storage buckets with CDN & Image transforms | None (requires AWS S3/Cloudflare R2) | SquareOS requires secure file storage for student passport photos, birth certificates, marking scripts, and medical reports. Supabase provides this out-of-the-box. |
| **Multi-Tenant Security** | PostgreSQL Row-Level Security (RLS) policies scoped to `school_id` | Standard Postgres RLS | Enforces database-level isolation so even if an application bug occurs, no tenant can ever read or mutate another school's rows. |
| **Disaster Recovery** | Automated Point-in-Time Recovery (PITR) + Daily Backups | Branching-based | Guarantees compliance with SquareOS Playbook RPO ≤ 15 min and RTO ≤ 60 min. |
| **Vercel Integration** | 1-Click native Vercel Marketplace Integration | 1-Click Vercel Integration | Automatically populates connection string environment variables into Vercel preview and production environments. |

---

## 2. GitHub Repository Status
All code, database schemas, and multi-tenant portals are pushed to your remote repository:
- **Repository URL**: `https://github.com/oyebodepreciousisaac/lifeOS.git`
- **Branch**: `main` (clean working tree, verified in sync)

---

## 3. Supabase Database Status (COMPLETED & VERIFIED)

The production database is fully provisioned and seeded:
- **Project Reference**: `gqwxuzbgsngqsmgasfxi`
- **Region**: `eu-west-1` (AWS Ireland)
- **Engine**: PostgreSQL 17.11
- **Schema Status**: `prisma db push` completed in 25.9s (All 22 institutional tables, foreign keys, indexes created)
- **Seed Status**: Reference tenant (`Apex Model College, Lagos`), permissions catalog, campuses, 2026/2027 sessions, terms, and JSS1 Gold class arm populated.

### Connection Strings:
- **Transaction Pooler (`DATABASE_URL`)**:
  ```text
  postgresql://postgres.gqwxuzbgsngqsmgasfxi:Krd364ca%402004@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
  ```
- **Session / Direct Migration URL (`DIRECT_URL`)**:
  ```text
  postgresql://postgres.gqwxuzbgsngqsmgasfxi:Krd364ca%402004@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
  ```

---

## 4. Vercel Deployment (Final Step)

1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: **`oyebodepreciousisaac/lifeOS`**.
4. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web` (or `./` if deploying from monorepo root)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. Paste the following **Environment Variables** in the Vercel dashboard:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.gqwxuzbgsngqsmgasfxi:Krd364ca%402004@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` | Supavisor pooler for serverless API routes. |
| `DIRECT_URL` | `postgresql://postgres.gqwxuzbgsngqsmgasfxi:Krd364ca%402004@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require` | Direct connection for Prisma engine. |
| `SESSION_SECRET` | `school-os-development-session-signing-secret-key-32-chars-min` | HMAC-SHA256 session cookie signing secret. |
| `NEXT_PUBLIC_APP_URL` | `https://life-os.vercel.app` (or your chosen Vercel domain) | Public application canonical URL. |
| `PAYSTACK_SECRET_KEY` | `sk_test_f06fd03d6c409b8fdf7ab64af6c206d141f0b5fe` | Paystack secret key. |
| `PAYSTACK_PUBLIC_KEY` | `pk_test_06684d9512c75a3a4f0d26f8930eaf3d31489a9d` | Paystack public checkout key. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_06684d9512c75a3a4f0d26f8930eaf3d31489a9d` | Paystack client-side public key. |
| `TERMII_API_KEY` | `your_termii_api_key_here` | Nigerian SMS & DND routing key. |

6. Click **Deploy**. Vercel will build and deploy the production bundle. (Verified local production build time: ~40s, 32/32 routes static & dynamic).

---

## 5. Domain & PWA Configuration

1. In Vercel Project Settings, navigate to **Domains** and add your custom domain (e.g. `square.school` or `app.yourdomain.ng`).
2. Point your DNS CNAME record to `cname.vercel-dns.com`.
3. SSL certificates are provisioned automatically via Let's Encrypt.
4. The PWA Web App Manifest (`apps/web/public/manifest.json`) and service worker will automatically prompt users on iOS Safari ("Add to Home Screen") and Android Chrome ("Install App") to install Square as a native mobile application.
