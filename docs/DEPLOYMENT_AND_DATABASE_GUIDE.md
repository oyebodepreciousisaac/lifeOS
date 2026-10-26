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

## 2. GitHub Repository Initialization & Push

Run the following commands from your terminal in `c:\Users\THE LAPTOP STORE\Desktop\school-os`:

```bash
# 1. Verify git status
git status

# 2. Add your newly created GitHub repository as remote origin:
git remote add origin https://github.com/<your-username>/square-os.git

# 3. Rename branch to main if needed
git branch -M main

# 4. Push all code to GitHub
git push -u origin main
```

---

## 3. Supabase Database Setup

1. Log in to [Supabase Console](https://supabase.com/dashboard).
2. Click **New Project** and configure:
   - **Name**: `square-os-prod`
   - **Database Password**: Generate a secure 24-character password and store in your password manager.
   - **Region**: `eu-west-1` (Frankfurt or London) or closest region for low latency to West Africa.
3. Once provisioned, navigate to **Project Settings** → **Database**:
   - Copy the **Connection String (Transaction Pooler - Port 6543)**. This is your `DATABASE_URL`.
   - Copy the **Direct Connection String (Port 5432)**. This is your `DIRECT_URL` (used for running schema migrations).
4. Navigate to **Storage** → Create two private buckets:
   - `student-documents` (private, strictly authorized downloads)
   - `school-crests` (public read, cached via CDN)

---

## 4. Vercel Deployment

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project** and select your GitHub `square-os` repository.
3. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `apps/web/.next` (automatically resolved)
4. Add the following **Environment Variables** in Vercel:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `COOKIE_SECRET` | `64_char_cryptographically_secure_random_hex` | Required: Signs HMAC-SHA256 session cookies (anti-tamper). |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supavisor transaction pooler for Next.js API routes. |
| `DIRECT_URL` | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` | Direct connection for Prisma/migration tools. |
| `NEXT_PUBLIC_APP_URL` | `https://square-os.vercel.app` | Canonical production URL. |
| `PAYSTACK_SECRET_KEY` | `your_paystack_secret_key` | Paystack API Secret for live billing and webhook verification. |
| `PAYSTACK_PUBLIC_KEY` | `your_paystack_public_key` | Paystack public key for client-side checkout. |
| `TERMII_API_KEY` | `your_termii_api_key` | Nigerian SMS & DND bypass gateway. |

5. Click **Deploy**. Vercel will build and deploy the production bundle.

---

## 5. Domain & PWA Configuration

1. In Vercel Project Settings, navigate to **Domains** and add your custom domain (e.g. `square.school` or `app.yourdomain.ng`).
2. Point your DNS CNAME record to `cname.vercel-dns.com`.
3. SSL certificates are provisioned automatically via Let's Encrypt.
4. The PWA Web App Manifest (`apps/web/public/manifest.json`) and service worker will automatically prompt users on iOS Safari ("Add to Home Screen") and Android Chrome ("Install App") to install Square as a native mobile application.
