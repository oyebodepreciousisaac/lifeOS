import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Smartphone,
  Users,
  CreditCard,
  GraduationCap,
  Bell,
  Activity,
  HeartPulse,
  Video,
  Bot,
  UserCheck,
  LogIn,
  Layers,
  Award,
  Building2,
} from 'lucide-react';
import HomeInteractiveSection from '@/components/home/HomeInteractiveSection';

export default function HomePage() {
  const operationalModules = [
    {
      name: 'Student Records (SIS)',
      icon: Users,
      desc: 'Complete student biodata, guardian contacts, medical records, and bulk import from Excel.',
      href: '/admin/students',
    },
    {
      name: 'Admissions & Enrollment',
      icon: Layers,
      desc: 'Online school application forms, entrance exam scoring, and 1-click admission to class lists.',
      href: '/admin/admissions',
    },
    {
      name: 'Daily Attendance',
      icon: Smartphone,
      desc: 'Fast mobile roll call with instant SMS to parents for late arrival or absence. Works offline.',
      href: '/admin/attendance',
    },
    {
      name: 'Terminal Report Cards',
      icon: GraduationCap,
      desc: 'NERDC-compliant CA (40%) and Exam (60%) scorebooks. Locked with digital seals to stop grade alteration.',
      href: '/admin/report-cards',
    },
    {
      name: 'Fees & Bursary Ledger',
      icon: CreditCard,
      desc: 'Automated termly invoices, Paystack online payments, sibling discounts, and overdue debtor tracking.',
      href: '/admin/finance',
    },
    {
      name: 'Parent & Staff Broadcasts',
      icon: Bell,
      desc: 'Send urgent notices via SMS and WhatsApp. Reaches parents even with network DND active.',
      href: '/admin/communications',
    },
    {
      name: 'Hostel, Clinic & Library',
      icon: HeartPulse,
      desc: 'Manage school clinic visits, transport bus passenger lists, digital exeat passes, and library books.',
      href: '/admin/auxiliary',
    },
    {
      name: 'Online Classroom (LMS)',
      icon: Video,
      desc: 'Lesson materials, online quizzes, student homework submission, and Zoom or Google Meet classes.',
      href: '/admin/lms',
    },
    {
      name: 'AI Teaching Assistant',
      icon: Bot,
      desc: 'Curriculum-aligned lesson notes and exam question ideas. Teachers review and edit everything before use.',
      href: '/admin/assistive-ai',
    },
    {
      name: 'Dual Approval Controls',
      icon: Lock,
      desc: 'Any change to a locked exam score or fee reversal requires a second authorized person to approve.',
      href: '/admin/governance',
    },
    {
      name: 'Parent, Teacher & Student Portals',
      icon: Activity,
      desc: 'Dedicated web portals for parents (view all children), subject teachers, and senior students.',
      href: '/portal/parent',
    },
    {
      name: 'Data Security & Backups',
      icon: Database,
      desc: 'Each school’s data is fully isolated. Compliant with the Nigeria Data Protection Act (NDPA 2023).',
      href: '/admin/platform-security',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-16 py-0 sm:py-8">
      {/* 1. HERO SECTION: Full-bleed on mobile, rounded card on tablet/desktop */}
      <section className="px-0 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="bg-navy-950 text-white rounded-none sm:rounded-3xl px-4 py-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-institutional-lg">
          {/* Background glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-navy-800/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-navy-900 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Built for Nigerian Primary & Secondary Schools</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
                Stop Fee Leakage. Protect Student Results.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
                One simple system to manage student records, school fees, daily attendance, and report cards. Designed from the ground up for Nigerian schools.
              </p>

              {/* Action Buttons: Clean & Direct */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Register Your School</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-navy-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-navy-800 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Institutional Trust Badges */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>NERDC Curriculum</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Paystack Online Payments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>NDPA 2023 Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Mockup Dashboard — HIDDEN on mobile to maximize speed & remove clutter */}
            <div className="hidden lg:flex lg:col-span-6 relative group h-full flex-col justify-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-navy-900 w-full h-[460px]">
                <img
                  src="/images/hero-dashboard.jpg"
                  alt="SquareOS School Management Dashboard"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-emerald-400">Live School Analytics</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">City Model Academy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-WORLD REALITY SECTION: No student photo on mobile */}
      <section className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-10 lg:p-14 shadow-institutional">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: Students Photo — HIDDEN ON MOBILE */}
            <div className="hidden lg:block lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-institutional-lg border border-slate-200">
                <img
                  src="/images/school-students.jpg"
                  alt="Nigerian secondary school students"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-bold text-sm">Empowering Nigerian Students</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">NERDC & Ministry of Education Curriculum Standards</p>
                </div>
              </div>
            </div>

            {/* Right: Value Pillars */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>Engineered for Nigerian Schools</span>
              </div>

              <h2 className="text-xl sm:text-3xl font-extrabold text-navy-950 tracking-tight leading-tight">
                Designed for the Realities of Running a School in Nigeria
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Imported software often fails in Nigeria because it assumes 24/7 high-speed fiber internet and doesn’t handle local banking methods or national exam guidelines. SquareOS is purpose-built:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Works Without Internet
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Morning roll call works on any phone without internet. Records sync automatically once network returns.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Reaches Parents on DND
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Lateness and fee reminders are sent via telecom-approved pipes, reaching parents even if DND is active.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Direct Paystack Invoicing
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Parents pay term fees directly from their phone via card, bank transfer, or USSD. No lost bank tellers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Tamper-Proof Report Cards
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Once results are approved by the Principal, grades are locked. No single teacher or staff can secretly alter marks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STAKEHOLDER PORTALS: Mobile phone image hidden on mobile */}
      <section className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="space-y-3 mb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Role-Based Workspaces
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            A Dedicated Workspace for Everyone in Your School
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            School owners, teachers, parents, and students each have their own clean interface.
          </p>
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
                  Switch between all your children, check arrival times, view sealed report cards, and pay school fees via Paystack.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>Enter Parent Portal</span>
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
                  Daily teaching timetable, 1-click attendance roll call, and continuous assessment (CA) score entry.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                <span>Enter Teacher Portal</span>
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
                  Personal class periods, assignments, exam results, termly report cards, and school announcements.
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[11px] font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                <span>Enter Student Portal</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. INTERACTIVE SIMULATORS & CALCULATOR — HIDDEN ON MOBILE to keep phone view fast & concise */}
      <div className="hidden sm:block">
        <HomeInteractiveSection />
      </div>

      {/* 5. COMPLETE OPERATIONAL SUITE DIRECTORY */}
      <section className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-10 shadow-institutional">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 mb-2">
                <Layers className="h-3.5 w-3.5" />
                <span>12 Core Modules</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
                Everything Your School Needs to Run Smoothly
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Every department interconnected under one reliable school operating system.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-950 text-white px-4 py-2.5 rounded-xl hover:bg-navy-900 transition-colors shadow-sm self-start sm:self-auto"
            >
              <span>Sign In to School</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {operationalModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className="flex flex-col justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-institutional transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-navy-950 shrink-0 group-hover:bg-navy-950 group-hover:text-emerald-400 transition-colors shadow-xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy-950 block group-hover:text-emerald-700 transition-colors">
                        {mod.name}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
                    <span>View Module</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DATA SECURITY & COMPLIANCE */}
      <section className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:p-10">
          <div className="max-w-2xl mb-6 space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Institutional Security &amp; Compliance
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Enterprise Data Protection for West African Schools
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Fully compliant with the Nigeria Data Protection Act (NDPA 2023). Each school’s database and records are isolated from all others.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">TENANT ISOLATION</span>
              <strong className="text-emerald-400 text-sm">PostgreSQL Multi-Tenant</strong>
              <p className="text-slate-400 text-[11px] mt-1">
                Zero data leakage across schools. Every query is strictly locked to your institution.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">PAYMENT SECURITY</span>
              <strong className="text-emerald-400 text-sm">Paystack PCI-DSS L1</strong>
              <p className="text-slate-400 text-[11px] mt-1">
                Verified payment webhooks with idempotency locks preventing double credit.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">BACKUPS & RECOVERY</span>
              <strong className="text-emerald-400 text-sm">Daily Automated Backups</strong>
              <p className="text-slate-400 text-[11px] mt-1">
                Encrypted database snapshots taken daily to guarantee disaster recovery.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-slate-400 block mb-1 text-[10px]">LEGAL COMPLIANCE</span>
              <strong className="text-emerald-400 text-sm">NDPA 2023 Standards</strong>
              <p className="text-slate-400 text-[11px] mt-1">
                Guardian consent tracking and complete data portability on request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONVERTING BOTTOM BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-emerald-950 p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-institutional-lg">
          <div className="max-w-xl space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to Modernize Your School?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Register your institution today. Start managing student records, fees, and attendance in minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Register Your School</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-navy-900/60 px-5 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
