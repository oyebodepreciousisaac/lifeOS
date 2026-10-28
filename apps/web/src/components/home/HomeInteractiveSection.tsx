'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ArrowRight,
  Calculator,
  Sparkles,
  Lock,
  Smartphone,
  Bell,
  Scale,
  Receipt,
  Eye,
  Check,
} from 'lucide-react';

type PersonaKey = 'proprietor' | 'principal' | 'teacher' | 'parent';

export default function HomeInteractiveSection() {
  // Persona Simulator State
  const [activePersona, setActivePersona] = React.useState<PersonaKey>('proprietor');

  // Calculator State
  const [studentCount, setStudentCount] = React.useState(450);
  const [termFee, setTermFee] = React.useState(220000);

  // Active Tab for Core Modules
  const [activeTab, setActiveTab] = React.useState<'academics' | 'finance' | 'attendance' | 'governance'>('academics');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  // Parent child switcher state for preview
  const [selectedChild, setSelectedChild] = React.useState<'ibrahim' | 'aisha'>('ibrahim');

  // Calculations for Tuition & Cost Savings
  const termlyRevenue = studentCount * termFee;
  const annualRevenue = termlyRevenue * 3;
  // Conservative estimate: 7.5% fee leakage recovered from uncollected/untracked debt
  const recoveredLeakage = Math.round(annualRevenue * 0.075);
  // Printing & administrative manual paper savings (₦4,200 per student per year)
  const paperSavings = studentCount * 4200;
  // Total economic advantage
  const totalAnnualAdvantage = recoveredLeakage + paperSavings;

  function formatNaira(num: number): string {
    return `₦${num.toLocaleString('en-NG')}`;
  }

  const personas = [
    {
      id: 'proprietor' as PersonaKey,
      label: 'School Proprietor',
      badge: 'Executive & Financial',
      icon: TrendingUp,
      title: 'Executive Financial Runway & Revenue Assurance',
      description:
        'Zero fee leakage. Real-time reconciliation between termly invoices, collections, and outstanding parent debt.',
    },
    {
      id: 'principal' as PersonaKey,
      label: 'School Principal',
      badge: 'Academics & Welfare',
      icon: ShieldCheck,
      title: 'Academic Integrity & Operational Control',
      description:
        'Oversee attendance rates across class arms, monitor continuous assessment moderations, and verify sealed report cards.',
    },
    {
      id: 'teacher' as PersonaKey,
      label: 'Subject Teacher',
      badge: 'Daily Classroom',
      icon: GraduationCap,
      title: 'Rapid Roll Call & Continuous Assessment',
      description:
        'Complete morning attendance in under 60 seconds and submit continuous assessment marks with instant missing mark detection.',
    },
    {
      id: 'parent' as PersonaKey,
      label: 'Parent / Guardian',
      badge: 'Family Portal',
      icon: Users,
      title: 'Multi-Child Oversight & Seamless Payments',
      description:
        'Monitor daily punctuality, download cryptographically sealed term reports, and pay tuition fees securely via Paystack.',
    },
  ];

  const faqs = [
    {
      question: 'How does SchoolOS handle morning attendance when the school internet is down?',
      answer:
        'SchoolOS features an offline-tolerant PWA queue. Teachers can record roll call on their mobile phones without active internet. The client timestamps each entry, compares arrival times against the 08:15 AM bell cutoff, and automatically synchronizes with the cloud once network connectivity is restored.',
    },
    {
      question: 'Can teachers or administrative staff alter report card grades after publication?',
      answer:
        'No. Once Continuous Assessment (CA) and Exam marks are moderated and approved by the Principal, the report sheet is cryptographically locked with an HMAC-SHA256 digital seal. Any post-lock grade amendment strictly requires a Level 2 Maker-Checker governance request with documented reason, before/after audit diffs, and secondary authorization from the School Principal or Owner.',
    },
    {
      question: 'How does the financial ledger prevent bursary fraud and double-crediting?',
      answer:
        'SchoolOS operates an append-only, double-entry financial ledger. Student balances are never stored as editable numbers; they are dynamically computed from immutable debit charges and verified credit receipts. Paystack payments are verified server-side with cryptographic HMAC-SHA512 webhook signatures and idempotency locks to eliminate duplicate credits.',
    },
    {
      question: 'Are parents automatically alerted when students are absent or arrive late?',
      answer:
        'Yes. When a student is marked Absent, or when morning arrival occurs after the school bell cutoff (08:15 AM), an automated notification is instantly dispatched. Messages are routed via Termii SMS (using Nigerian national DND bypass pipes), WhatsApp Cloud API, and in-app notifications.',
    },
    {
      question: 'Can we import our existing student biodata from Excel or our old system?',
      answer:
        'Yes. SchoolOS includes a dedicated bulk CSV ingestion engine equipped with a dirty-data quarantine parser. It automatically detects and isolates duplicate phone numbers, malformed dates, and missing guardian links before records are committed to the live school directory.',
    },
  ];

  return (
    <div className="space-y-20">
      {/* 1. INTERACTIVE STAKEHOLDER SIMULATOR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Interactive Live Role Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
            Experience SchoolOS from Every Stakeholder&apos;s Lens
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Click any role below to test drive the tailored dashboard interfaces built for school leaders, educators, and parents.
          </p>
        </div>

        {/* Role Selectors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = activePersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePersona(p.id)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 bg-white shadow-institutional-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold ${
                      isSelected ? 'bg-navy-950 text-emerald-400' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.badge}
                  </span>
                </div>
                <span className="font-bold text-sm text-navy-950">{p.label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Simulator Preview Canvas */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-institutional-lg">
          {activePersona === 'proprietor' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Apex Model College • First Term 2026/2027
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mt-1">Executive Financial Overview</h3>
                </div>
                <Link
                  href="/admin/finance"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-950 text-white px-4 py-2.5 rounded-xl hover:bg-navy-900 transition-colors self-start sm:self-auto"
                >
                  <span>Open Bursary Ledger</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </Link>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-xs font-medium text-emerald-800">Total Billed Fees</span>
                  <p className="text-2xl font-extrabold text-navy-950 mt-1">₦18,450,000</p>
                  <p className="text-[11px] text-emerald-700 mt-1">450 Enrolled Students</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-600">Settled Collections</span>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">₦14,180,000</p>
                  <p className="text-[11px] text-slate-500 mt-1">76.8% Collection Rate</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <span className="text-xs font-medium text-amber-900">Outstanding Receivables</span>
                  <p className="text-2xl font-extrabold text-amber-800 mt-1">₦4,270,000</p>
                  <p className="text-[11px] text-amber-700 mt-1">38 Families in 30d+ bucket</p>
                </div>

                <div className="p-4 rounded-2xl bg-navy-50/60 border border-navy-100">
                  <span className="text-xs font-medium text-navy-800">Operating Runway</span>
                  <p className="text-2xl font-extrabold text-navy-950 mt-1">4.2 Months</p>
                  <p className="text-[11px] text-navy-700 mt-1">Staff Payroll Fully Secured</p>
                </div>
              </div>

              {/* Progress & Debt Bucket Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                    <span>Term 1 Fee Realization Progress</span>
                    <span className="text-emerald-700">76.8% Completed</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: '76.8%' }} />
                  </div>
                  <p className="text-xs text-slate-500">
                    ₦14.18M paid via online Paystack gateway and bank direct debit reconciliation. Zero unverified cash handling.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="text-xs font-bold text-navy-950 block">Aging Debtors Distribution (4-Tier Recovery)</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-900 font-bold">
                      <div className="text-[10px] text-emerald-700">0–30 Days</div>
                      ₦2.1M
                    </div>
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-900 font-bold">
                      <div className="text-[10px] text-amber-700">31–60 Days</div>
                      ₦1.2M
                    </div>
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-900 font-bold">
                      <div className="text-[10px] text-orange-700">61–90 Days</div>
                      ₦640k
                    </div>
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-900 font-bold">
                      <div className="text-[10px] text-rose-700">90+ Days</div>
                      ₦330k
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automated, polite SMS payment notifications are ready to dispatch to guardians with 60d+ balances.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'principal' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Academic Administration Desk
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mt-1">School Academic Integrity & Attendance</h3>
                </div>
                <Link
                  href="/admin/report-cards"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-950 text-white px-4 py-2.5 rounded-xl hover:bg-navy-900 transition-colors self-start sm:self-auto"
                >
                  <span>Continuous Assessment Moderation</span>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                    <span>Morning Roll Call Status</span>
                    <span className="font-bold">100% Submitted</span>
                  </div>
                  <p className="text-2xl font-extrabold text-navy-950 mt-2">94.2%</p>
                  <p className="text-xs text-emerald-700 mt-1">424 Present • 18 Late • 8 Absent</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                    <span>Lateness Past Bell Cutoff</span>
                    <span className="font-bold">08:15 AM Bell</span>
                  </div>
                  <p className="text-2xl font-extrabold text-amber-900 mt-2">18 Students</p>
                  <p className="text-xs text-amber-700 mt-1">Automated parent SMS dispatched</p>
                </div>

                <div className="p-4 rounded-2xl bg-navy-50/70 border border-navy-100">
                  <div className="flex items-center justify-between text-xs text-navy-900 font-medium">
                    <span>Result Moderation Queue</span>
                    <span className="font-bold">12 Pending Approval</span>
                  </div>
                  <p className="text-2xl font-extrabold text-navy-950 mt-2">JSS 1 – SS 3</p>
                  <p className="text-xs text-navy-700 mt-1">Awaiting digital Principal seal</p>
                </div>
              </div>

              {/* Sample Moderation Queue Item */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-950 text-white">SS 2 Diamond</span>
                    <span className="font-bold text-sm text-navy-950">Further Mathematics • CA 1 & Exam Marks</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Submitted by Mrs. O. Adeleke (Subject Head). Verified 32/32 students scored. Class Mean: 74.5%.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    Passed Moderation Checks
                  </span>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'teacher' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Educator Workspace • Morning Register & Scorebook
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mt-1">Today&apos;s Class Schedule & Roll Call</h3>
                </div>
                <Link
                  href="/portal/teacher"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors self-start sm:self-auto"
                >
                  <span>Launch Rapid Register (&lt;60s)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Daily Schedule Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">Period 1 • 08:30 – 09:15</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">Active</span>
                  </div>
                  <p className="font-bold text-navy-950 mt-2 text-base">Mathematics</p>
                  <p className="text-xs text-slate-600">JSS 2 Gold • Room 14 (34 Students)</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Period 3 • 10:15 – 11:00</span>
                    <span className="text-slate-400">Upcoming</span>
                  </div>
                  <p className="font-bold text-navy-950 mt-2 text-base">Basic Technology</p>
                  <p className="text-xs text-slate-600">JSS 1 Diamond • Tech Lab</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Period 5 • 12:30 – 01:15</span>
                    <span className="text-slate-400">Upcoming</span>
                  </div>
                  <p className="font-bold text-navy-950 mt-2 text-base">General Mathematics</p>
                  <p className="text-xs text-slate-600">SS 1 Emerald • Room 22</p>
                </div>
              </div>

              {/* Fast Attendance Register Demo */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-bold text-navy-950 block">JSS 2 Gold • Morning Attendance Register</span>
                    <span className="text-[11px] text-slate-500">34 Students Enrolled • 1-Click Punctuality Trigger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                      32 Present (94%)
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">
                      2 Late
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-navy-950 block">Ibrahim Shehu Bello</span>
                      <span className="text-[11px] text-slate-500">Arrived 07:55 AM (Punctual)</span>
                    </div>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Present
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-navy-950 block">Chinedu Emeka Okafor</span>
                      <span className="text-[11px] text-amber-700">Arrived 08:24 AM (Past 08:15 Cutoff)</span>
                    </div>
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Late Alert
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'parent' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Guardian Portal • Family Overview
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-950 mt-1">Alhaji Shehu Bello&apos;s Family Workspace</h3>
                </div>
                <Link
                  href="/portal/parent"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors self-start sm:self-auto"
                >
                  <span>Open Full Parent Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Multi-Child Selector */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChild('ibrahim')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedChild === 'ibrahim'
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ibrahim Shehu (JSS 1 Gold)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChild('aisha')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedChild === 'aisha'
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Aisha Shehu (Primary 4 Diamond)
                </button>
              </div>

              {selectedChild === 'ibrahim' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Punctuality & Attendance</span>
                        <span className="font-bold text-emerald-700">96.8%</span>
                      </div>
                      <p className="text-2xl font-extrabold text-navy-950">58 / 60 Days</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Morning arrival average: 07:48 AM. Fully compliant with bell cutoff.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Excellent Attendance Standing
                    </div>
                  </div>

                  {/* Report Card with QR Seal */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>First Term Report Card</span>
                        <span className="font-bold text-emerald-700">Sealed</span>
                      </div>
                      <p className="text-2xl font-extrabold text-navy-950">84.6% Avg</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Class Rank: 4th of 36. Continuous assessment and exam signed with digital HMAC seal.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>QR Verification: OK</span>
                      <span className="font-bold text-navy-950">VERIFY-SHA256</span>
                    </div>
                  </div>

                  {/* Fee Checkout Card */}
                  <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-emerald-800 mb-2">
                        <span>Term 1 Outstanding Balance</span>
                        <span className="font-bold text-emerald-900">Term 1 Invoice</span>
                      </div>
                      <p className="text-2xl font-extrabold text-navy-950">₦145,000</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Tuition, ICT levy, and science lab materials. 10% sibling discount applied.
                      </p>
                    </div>
                    <div className="pt-4">
                      <Link
                        href="/portal/parent"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay ₦145,000 with Paystack</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Punctuality & Attendance</span>
                        <span className="font-bold text-emerald-700">100%</span>
                      </div>
                      <p className="text-2xl font-extrabold text-navy-950">60 / 60 Days</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Zero absences recorded this term. Arrives at 07:45 AM.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> 100% Attendance Award
                    </div>
                  </div>

                  {/* Report Card */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>First Term Report Card</span>
                        <span className="font-bold text-emerald-700">Sealed</span>
                      </div>
                      <p className="text-2xl font-extrabold text-navy-950">91.2% Avg</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Class Rank: 1st of 28. Distinction in Numeracy, Literacy & French.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>QR Verification: OK</span>
                      <span className="font-bold text-navy-950">VERIFY-SHA256</span>
                    </div>
                  </div>

                  {/* Fee Checkout Card */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Term 1 Outstanding Balance</span>
                        <span className="font-bold text-emerald-700">Fully Settled</span>
                      </div>
                      <p className="text-2xl font-extrabold text-emerald-600">₦0.00</p>
                      <p className="text-xs text-slate-600 mt-2">
                        Receipt #REC-2026-0814 settled via Paystack on 14 Sept 2026.
                      </p>
                    </div>
                    <div className="pt-4">
                      <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                        <Receipt className="h-4 w-4 text-emerald-600" />
                        <span>Download Official Receipt</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. INTERACTIVE TUITION & REVENUE RECOVERY CALCULATOR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-950 text-white p-6 sm:p-10 lg:p-14 relative overflow-hidden shadow-institutional-lg">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>Proprietor ROI & Efficiency Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Calculate How Much Revenue SchoolOS Recovers for Your School
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Nigerian private schools lose an average of 7% to 10% of billed revenue annually to untracked fee leakage, forgotten billing items, and manual ledger omissions. See your school&apos;s estimated financial advantage:
              </p>

              {/* Sliders */}
              <div className="space-y-6 pt-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Enrolled Student Population</span>
                    <span className="text-emerald-400 font-mono text-sm font-bold">{studentCount} Students</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={25}
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>50 Students</span>
                    <span>1,000 Students</span>
                    <span>2,000 Students</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-300">Average Termly Tuition & Fees per Child</span>
                    <span className="text-emerald-400 font-mono text-sm font-bold">{formatNaira(termFee)}</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1500000}
                    step={25000}
                    value={termFee}
                    onChange={(e) => setTermFee(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>₦50,000 / term</span>
                    <span>₦750,000 / term</span>
                    <span>₦1,500,000 / term</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Result Display */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-700 bg-navy-900/90 p-6 sm:p-8 space-y-6 backdrop-blur-sm">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Estimated Annual Recovered Value
                  </span>
                  <div className="text-3xl sm:text-5xl font-black text-emerald-400 mt-2 tracking-tight">
                    {formatNaira(totalAnnualAdvantage)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct financial and operational savings gained every 3-term academic session.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Recovered Fee Leakage</span>
                    <p className="text-lg font-bold text-white">{formatNaira(recoveredLeakage)}</p>
                    <p className="text-[10px] text-slate-500">Based on 7.5% untracked receivables recovery</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400">Paper & Printing Elimination</span>
                    <p className="text-lg font-bold text-white">{formatNaira(paperSavings)}</p>
                    <p className="text-[10px] text-slate-500">Report cards, registers & bank receipt booklets</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-navy-950/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Over 180 Staff Hours Saved per Term on Manual Score Compilation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE CORE OPERATIONS EXPLORER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Institutional Pillars Built Specifically for Nigerian Schools
          </h2>
          <p className="text-sm text-slate-600">
            Click each operational domain to explore the underlying security architecture and workflows.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'academics', label: 'Academics & NERDC Report Cards', icon: GraduationCap },
            { id: 'finance', label: 'Bursary & Append-Only Ledger', icon: CreditCard },
            { id: 'attendance', label: 'Attendance & Termii SMS DND', icon: Smartphone },
            { id: 'governance', label: 'Maker-Checker Dual Control', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-navy-950 text-white shadow-institutional-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-navy-950'
                }`}
              >
                <Icon className={`h-4 w-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-institutional">
          {activeTab === 'academics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  NERDC Curriculum Compliant
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-950">
                  Tamper-Proof Continuous Assessment & Digital Report Cards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Support for Continuous Assessment (CA 40%) and Terminal Examination (60%) weightings. Teachers enter marks into protected scorebooks with automatic range enforcement (CA1 ≤ 20, CA2 ≤ 20, Exam ≤ 60). Missing mark detection prevents accidental gaps.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Cryptographic HMAC-SHA256 digital seals lock approved score sheets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Public QR verification hash on every report card prevents physical forgery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>1-to-5 Psychomotor & Affective behavioral rating grids</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/admin/report-cards"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Academic Report Cards</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Graphic */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">OFFICIAL TERM REPORT CARD</span>
                    <p className="font-bold text-xs text-navy-950">Ibrahim Shehu Bello • JSS 1 Gold</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    SEALED
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">English Studies (CA: 34/40, Exam: 52/60)</span>
                    <strong className="text-navy-950">86% (A)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">General Mathematics (CA: 38/40, Exam: 54/60)</span>
                    <strong className="text-navy-950">92% (A)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Basic Science & Technology</span>
                    <strong className="text-navy-950">84% (A)</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Hash: SEAL-SHA256:7f9a...831c</span>
                  <span className="text-emerald-700 font-bold">Verified QR</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Audit-Proof Accounting
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-950">
                  Append-Only Student Ledger & Paystack Webhooks
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Student balances cannot be altered directly in the database. Every figure is dynamically calculated as the sum of immutable debit charges minus settled credit receipts.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Timing-safe HMAC-SHA512 verification for Paystack webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Idempotency locks prevent double-crediting during network retries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Automated sibling discounts (10% on 2nd child, 15% on 3rd+)</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/admin/finance"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Financial Module</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Graphic */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-navy-950 font-sans">DOUBLE-ENTRY RUNNING LEDGER</span>
                  <span className="text-[10px] text-emerald-700 font-bold">ACID COMPLIANT</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-rose-700 font-bold">DEBIT</span> Tuition Charge Term 1
                    </div>
                    <span className="font-bold">₦145,000</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                    <div>
                      <span className="text-emerald-700 font-bold">CREDIT</span> Paystack Webhook #PST-8192
                    </div>
                    <span className="font-bold">-₦145,000</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-100 text-emerald-950 flex justify-between font-bold">
                    <span>DYNAMIC BALANCE</span>
                    <span>₦0.00 (Settled)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Punctuality & Safety
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-950">
                  Sub-60s Register Roll Call & Termii SMS DND Routing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Teachers take morning roll call on any mobile phone in under one minute using the 1-click &quot;Mark All Present&quot; flow with lateness exception flags.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>08:15 AM bell cutoff lateness tracking with operational timestamps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Termii SMS integration bypassing Nigerian telecommunication DND restrictions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Chronic absenteeism alerts triggered at &lt;80% attendance rate</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/admin/attendance"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Attendance Register</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Graphic */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-navy-950">LIVE PARENT DISPATCH ENGINE</span>
                  <span className="text-emerald-700 font-bold text-[10px]">DELIVERY: 99.8%</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>SMS Broadcast via Termii (DND Safe)</span>
                    <span className="text-emerald-600">DELIVERED</span>
                  </div>
                  <p className="text-slate-800 text-[11px] italic bg-slate-50 p-2 rounded border border-slate-100">
                    &quot;Dear Alhaji Shehu, your ward Ibrahim arrived at 08:24 AM (after the 08:15 bell cutoff). Punctuality ensures academic discipline.&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  Maker-Checker Governance
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-950">
                  Dual-Control Protection on Sensitive Actions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  No single individual can execute a fee refund, reverse a student ledger debit, or edit a locked examination grade without secondary approval.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Strict Separation of Duties: makerId cannot equal checkerId</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Side-by-side visual before/after mutation diff cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Immutable cryptographic audit logs for complete board transparency</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    href="/admin/governance"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View Governance Queue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Graphic */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-navy-950">DUAL-AUTHORIZATION QUEUE</span>
                  <span className="text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded text-[10px]">
                    PENDING CHECKER
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <span className="font-bold text-navy-950 block">Action: Post-Lock Score Amendment</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-1.5 rounded bg-rose-50 text-rose-800">
                      BEFORE: CA 1 = 12/20
                    </div>
                    <div className="p-1.5 rounded bg-emerald-50 text-emerald-800">
                      AFTER: CA 1 = 18/20
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Justification: Calculation recount verified by HOD Mathematics. Requires Principal signature.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. INSTITUTIONAL FAQ ACCORDION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Clear Answers for School Proprietors &amp; Leaders
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about system reliability, data protection, and operational safety.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex items-center justify-between w-full p-5 text-left font-bold text-sm sm:text-base text-navy-950 hover:bg-slate-50/80 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
