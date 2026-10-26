import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  FileCheck2,
  Users,
  CreditCard,
  GraduationCap,
  Bell,
  Activity,
  HeartPulse,
  Video,
  Bot,
  UserCheck,
  Receipt,
  Calendar,
  LogIn,
  Layers,
  Sparkles,
  TrendingUp,
  Award,
  Check,
} from 'lucide-react';
import HomeInteractiveSection from '@/components/home/HomeInteractiveSection';

export default function HomePage() {
  const operationalModules = [
    {
      name: 'Student Information System',
      icon: Users,
      desc: 'Authoritative student profiles, medical alerts, non-destructive class history, and rapid CSV importer with dirty-data quarantine.',
      href: '/admin/students',
    },
    {
      name: 'Admissions & Enrollment',
      icon: FileCheck2,
      desc: 'Public inquiry forms, 70/30 entrance examination & interview rubrics, conditional offer letters, and 1-click student conversion.',
      href: '/admin/admissions',
    },
    {
      name: 'Daily Attendance Register',
      icon: Smartphone,
      desc: 'Under-60-second mobile morning roll call, 08:15 AM bell cutoff lateness alerts, and offline-tolerant local synchronization.',
      href: '/admin/attendance',
    },
    {
      name: 'Assessments & Report Cards',
      icon: GraduationCap,
      desc: 'Continuous Assessment (CA 40%) and Exam (60%) scorebooks, multi-stage moderation, and anti-forgery QR verification seals.',
      href: '/admin/report-cards',
    },
    {
      name: 'Append-Only Bursary Ledger',
      icon: CreditCard,
      desc: 'Zero mutable balance columns. Timing-safe Paystack checkout, sibling concession discounts, and automated 4-tier aging debtors.',
      href: '/admin/finance',
    },
    {
      name: 'School Broadcast Communications',
      icon: Bell,
      desc: 'Event-driven notifications routed via Termii SMS (Nigerian DND bypass), WhatsApp Cloud API, and dynamic parent merge tags.',
      href: '/admin/communications',
    },
    {
      name: 'Auxiliary School Operations',
      icon: HeartPulse,
      desc: 'Student clinic triage, transport bus passenger manifests, digital hostel exeat passes, and library overdue fine management.',
      href: '/admin/auxiliary',
    },
    {
      name: 'Virtual Classroom & LMS',
      icon: Video,
      desc: 'Hierarchical lesson modules, auto-graded objective quizzes, student assignment submissions, and Google Meet/Zoom scheduling.',
      href: '/admin/lms',
    },
    {
      name: 'Assistive Educational AI',
      icon: Bot,
      desc: 'Curriculum-aligned lesson plans and exam questions with strict human review gates. Zero autonomous database alterations.',
      href: '/admin/assistive-ai',
    },
    {
      name: 'Maker-Checker Dual Control',
      icon: Lock,
      desc: 'Level 2 secondary authorization for locked grade amendments and fee reversals with side-by-side visual mutation diffs.',
      href: '/admin/governance',
    },
    {
      name: 'Dedicated Stakeholder Portals',
      icon: Activity,
      desc: 'Customized web portals for Parents (multi-child switcher), Subject Teachers (today schedule), and Enrolled Students.',
      href: '/portal/parent',
    },
    {
      name: 'Institutional Data Security',
      icon: Database,
      desc: 'Tenant isolation by design, daily encrypted disaster recovery restore drills, and NDPA 2023 Section 34 data portability.',
      href: '/admin/platform-security',
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. HERO SECTION WITH HIGH-IMPACT DASHBOARD PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-950 p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-institutional-lg">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-navy-800/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Headline & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-navy-900/90 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Authoritative Institutional System for Schools</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
                Eliminate Fee Leakage. Prevent Grade Tampering.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                One authoritative student record from enrollment to graduation. Immutable double-entry financial ledgers, sub-60-second morning roll calls, and multi-person Maker-Checker governance—engineered specifically for Nigerian educational institutions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Square
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/portal/parent"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-navy-800 transition-colors"
                >
                  <Users className="h-4 w-4 text-emerald-400" />
                  Parent Portal
                </Link>

                <Link
                  href="/admissions/apply"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-transparent px-4 py-3.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileCheck2 className="h-4 w-4 text-emerald-400" />
                  Online Admissions
                </Link>
              </div>

              {/* Institutional Compliance Badges */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>NERDC 9-Year Basic Curriculum</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Paystack PCI-DSS Level 1 Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>NDPA 2023 Certified Privacy</span>
                </div>
              </div>
            </div>

            {/* Right: Live UI Mockup Image filling space */}
            <div className="lg:col-span-6 relative group h-full flex flex-col justify-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-navy-900 w-full h-[380px] sm:h-[460px] lg:h-[500px]">
                <img
                  src="/images/hero-dashboard.jpg"
                  alt="Square High-Performance Management Dashboard"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-400">Live Institutional Analytics</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">Apex Model College</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AUTHENTIC INSTITUTIONAL ATMOSPHERE SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 lg:p-14 shadow-institutional">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Students Photo */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-institutional-lg border border-slate-200 group">
                <img
                  src="/images/school-students.jpg"
                  alt="Nigerian secondary school students engaged with digital tablets in modern library"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-bold text-sm">Empowering the Next Generation of African Leaders</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Accredited by the Ministry of Education &amp; NERDC Standards</p>
                </div>
              </div>
            </div>

            {/* Right: Value Pillars */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Purpose-Built for West African Excellence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Designed for the Real-World Reality of Nigerian Schools
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Most foreign school software fails in West Africa because it assumes uninterrupted fiber internet, ignores National Examination frameworks, and lacks dual-control fraud prevention for bursaries. SchoolOS was architected in Nigeria, for Nigerian schools:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Offline-Tolerant PWA
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Morning roll call operates without internet. Queued locally and syncs automatically when power returns.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Termii SMS DND Bypass
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Emergency lateness and fee alerts route through certified national pipes, reaching parents regardless of DND.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Paystack Direct Invoicing
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Automated termly billing with instant bank card, USSD, and transfer checkout. Zero manual bank teller reconciliation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Cryptographic Seals
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    HMAC-SHA256 digital seals lock approved scorebooks. No teacher or staff can alter grades after publication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED PORTAL ACCESS CARDS WITH PARENT MOBILE APP PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Columns: 3 Portal Action Cards */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                Dedicated Stakeholder Workspaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
                Role-Tailored Portals for Every School Community Member
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/portal/parent" className="group">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-institutional hover:border-emerald-500 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-navy-950 mb-1">Parent Portal</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Multi-child switcher, punctuality alerts, sealed report cards with QR seals, and Paystack checkout.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>Enter Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>

              <Link href="/portal/teacher" className="group">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-institutional hover:border-blue-500 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-navy-950 mb-1">Teacher Portal</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      8-period daily teaching schedule, sub-60s roll call register, and continuous assessment scorebooks.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                    <span>Enter Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>

              <Link href="/portal/student" className="group">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-institutional hover:border-purple-500 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-navy-950 mb-1">Student Portal</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Personal timetable periods, subject assessment marks, class ranking, and official broadcasts.
                    </p>
                  </div>
                  <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                    <span>Enter Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Right 5 Columns: Smartphone Mobile App Mockup Image filling container */}
          <div className="lg:col-span-5 relative group h-full">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-institutional-lg overflow-hidden h-full flex flex-col justify-between">
              <div className="relative w-full h-[440px] sm:h-[480px] overflow-hidden bg-slate-900">
                <img
                  src="/images/parent-mobile-portal.jpg"
                  alt="Square Parent Portal Mobile App Interface with Paystack Checkout"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600/95 text-white text-[11px] font-bold mb-1.5 backdrop-blur-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>PWA Offline-Ready App</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">Mobile-First Parent Portal</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Instant Paystack fee settlement, attendance notifications, and sealed report cards.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Installable PWA for iOS &amp; Android</span>
                <Link href="/portal/parent" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                  Launch Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATOR, CALCULATOR & MODULE EXPLORER */}
      <HomeInteractiveSection />

      {/* 5. COMPLETE OPERATIONAL SUITE DIRECTORY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-institutional">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 mb-2">
                <Layers className="h-3.5 w-3.5" />
                <span>12 Integrated Modules</span>
              </div>
              <h2 className="text-2xl font-extrabold text-navy-950 tracking-tight">
                Complete School Administration Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Every department of your institution interconnected under one authoritative, tenant-isolated platform.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-950 text-white px-4 py-2.5 rounded-xl hover:bg-navy-900 transition-colors shadow-sm self-start sm:self-auto"
            >
              <span>Access Management Dashboard</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {operationalModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className="flex flex-col justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-institutional transition-all group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-navy-950 shrink-0 group-hover:bg-navy-950 group-hover:text-emerald-400 transition-colors shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy-950 block group-hover:text-emerald-700 transition-colors">
                        {mod.name}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                    <span>Explore Module</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. INSTITUTIONAL SECURITY & REGULATORY ASSURANCE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Institutional Security &amp; Compliance Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Data Protection for West African Schools
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Engineered from the ground up to comply with the Nigeria Data Protection Act (NDPA 2023) and the OWASP Application Security Verification Standard (ASVS 5.0).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">DATABASE ARCHITECTURE</span>
              <strong className="text-emerald-400 text-sm">PostgreSQL 16+</strong>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                ACID transactions with automated tenant query wrapper eliminating cross-school data access.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">PAYMENT INFRASTRUCTURE</span>
              <strong className="text-emerald-400 text-sm">Paystack PCI-DSS L1</strong>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Timing-safe HMAC-SHA512 webhook verification with Redis-backed idempotency locks.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">HIGH AVAILABILITY</span>
              <strong className="text-emerald-400 text-sm">Automated Drills</strong>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Validated recovery time objective (RTO ≤ 60m) and recovery point objective (RPO ≤ 15m).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">DATA GOVERNANCE</span>
              <strong className="text-emerald-400 text-sm">NDPA 2023 Standard</strong>
              <p className="text-slate-400 text-[11px] mt-1 font-sans">
                Explicit guardian consent tracking, Section 34 data portability, and right-to-erasure sanitization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONVERTING BOTTOM BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-emerald-950 p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-institutional-lg">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Secure and Modernize Your Institution?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Join forward-thinking school proprietors who have eliminated financial reconciliation stress and grade alteration risks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <span>Access Institutional Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admissions/apply"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-900/60 px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <span>Apply Online</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
