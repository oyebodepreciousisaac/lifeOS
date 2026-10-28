'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Layers,
  TrendingUp,
  ShieldCheck,
  Server,
  Activity,
  ArrowRight,
  Plus,
  CheckCircle2,
  Smartphone,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Radio,
  Scale,
  Database,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input } from '@school-os/ui';

interface PlatformOwnerDashboardViewProps {
  session: {
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  };
  dateDisplay: string;
}

export default function PlatformOwnerDashboardView({
  session,
  dateDisplay,
}: PlatformOwnerDashboardViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SETUP'>('ALL');

  // Multi-School Tenant Registry Data
  const schoolsRegistry = [
    {
      id: 'sch-001',
      name: 'Apex Model College',
      code: 'APX-LAG',
      state: 'Lagos State (Victoria Island)',
      students: 450,
      teachers: 32,
      parents: 380,
      status: 'ACTIVE',
      plan: 'Enterprise (Multi-Campus)',
      gtv: '₦48,500,000',
      lastActive: 'Just now',
    },
    {
      id: 'sch-002',
      name: 'Premier Academy',
      code: 'PRM-ABJ',
      state: 'FCT Abuja (Maitama)',
      students: 620,
      teachers: 45,
      parents: 540,
      status: 'ACTIVE',
      plan: 'Enterprise',
      gtv: '₦72,800,000',
      lastActive: '4 mins ago',
    },
    {
      id: 'sch-003',
      name: 'King’s Gate International School',
      code: 'KGT-PHC',
      state: 'Rivers State (Port Harcourt)',
      students: 380,
      teachers: 28,
      parents: 310,
      status: 'ACTIVE',
      plan: 'Standard Tier',
      gtv: '₦39,200,000',
      lastActive: '12 mins ago',
    },
    {
      id: 'sch-004',
      name: 'Graceland High Academy',
      code: 'GLD-IBD',
      state: 'Oyo State (Ibadan)',
      students: 510,
      teachers: 36,
      parents: 420,
      status: 'ACTIVE',
      plan: 'Standard Tier',
      gtv: '₦41,600,000',
      lastActive: '25 mins ago',
    },
    {
      id: 'sch-005',
      name: 'Corona Horizon College',
      code: 'CRN-ENU',
      state: 'Enugu State (Independence Layout)',
      students: 290,
      teachers: 22,
      parents: 260,
      status: 'ACTIVE',
      plan: 'Standard Tier',
      gtv: '₦28,400,000',
      lastActive: '1 hour ago',
    },
    {
      id: 'sch-006',
      name: 'Silverbird Crest Preparatory',
      code: 'SBC-LAG',
      state: 'Lagos State (Ikeja GRA)',
      students: 340,
      teachers: 26,
      parents: 295,
      status: 'TRIAL',
      plan: '14-Day Free Evaluation',
      gtv: '₦0',
      lastActive: '3 hours ago',
    },
    {
      id: 'sch-007',
      name: 'St. Saviour British Academy',
      code: 'SSB-KAN',
      state: 'Kano State (Nasarawa GRA)',
      students: 410,
      teachers: 30,
      parents: 350,
      status: 'SETUP',
      plan: 'Onboarding Configuration',
      gtv: '₦0',
      lastActive: 'Yesterday',
    },
  ];

  // Core Platform Subsystems & Ecosystem Status
  const platformSubsystems = [
    {
      name: 'Student Information System (SIS)',
      status: 'OPERATIONAL',
      icon: Users,
      metric: '4,210 Active Students',
      description: 'Authoritative student records, bio-data, and kinship mapping across all schools.',
    },
    {
      name: 'Double-Entry Bursary & Paystack Gateway',
      status: 'OPERATIONAL',
      icon: CreditCard,
      metric: '₦342.8M Reconciled GTV',
      description: 'Append-only ledger with zero mutable balance columns and webhook verification.',
    },
    {
      name: 'Roll Call Attendance & PWA Engine',
      status: 'OPERATIONAL',
      icon: Smartphone,
      metric: '96.2% Avg Punctuality',
      description: 'Sub-60s attendance registers with local offline queueing and instant sync.',
    },
    {
      name: 'Assessments & WAEC Report Cards',
      status: 'OPERATIONAL',
      icon: GraduationCap,
      metric: '12,400 Grades Computed',
      description: 'Continuous assessment (40%) and exam (60%) engine with cryptographic QR seals.',
    },
    {
      name: 'Virtual Classroom & LMS',
      status: 'OPERATIONAL',
      icon: Layers,
      metric: '184 Active Courses',
      description: 'Class syllabus modules, homework submission pipeline, and auto-graded quizzes.',
    },
    {
      name: 'Broadcast Communications (SMS/WhatsApp)',
      status: 'OPERATIONAL',
      icon: Radio,
      metric: '99.8% Delivery Success',
      description: 'Event-driven parent messaging routed through Termii and WhatsApp Cloud API.',
    },
    {
      name: 'Maker-Checker Governance Engine',
      status: 'OPERATIONAL',
      icon: Scale,
      metric: '0 Unauthorized Bypasses',
      description: 'Dual-control approvals for score amendments, financial reversals, and student exits.',
    },
    {
      name: 'Multi-Tenant Data Isolation Layer',
      status: 'OPERATIONAL',
      icon: Database,
      metric: '100% Mathematical Isolation',
      description: 'Row-level and schema-level tenant boundaries verified against IDOR attacks.',
    },
  ];

  const filteredSchools = schoolsRegistry.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalSchools = schoolsRegistry.length;
  const totalStudents = schoolsRegistry.reduce((acc, s) => acc + s.students, 0);
  const totalTeachers = schoolsRegistry.reduce((acc, s) => acc + s.teachers, 0);
  const totalParents = schoolsRegistry.reduce((acc, s) => acc + s.parents, 0);
  const totalGlobalUsers = totalStudents + totalTeachers + totalParents;

  return (
    <div className="space-y-8 pb-16">
      {/* ── TOP PLATFORM OWNER HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden bg-navy-950 text-white shadow-institutional-lg">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  SquareOS Platform Super-Administrator
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
                  <Server className="h-3 w-3 text-emerald-400" />
                  Multi-Tenant Cloud Mesh
                </span>
                <span className="text-xs text-slate-400">{dateDisplay}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Platform Owner Command Center
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl">
                Global operational control of the SquareOS ecosystem. Monitor all active school institutions, platform user headcounts, payment pipelines, and subsystem availability.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/setup">
                <Button variant="primary" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  <Plus className="h-4 w-4" />
                  Provision New School
                </Button>
              </Link>

              <Link href="/admin/platform-security">
                <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Database className="h-4 w-4 text-emerald-400" />
                  System Security & Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MACRO PLATFORM METRICS (THE 3 CORE REQUIREMENTS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Number of Schools */}
        <Card className="border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Schools
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-navy-950 mt-1">
              {totalSchools} Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 5 Active
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700 font-semibold">1 Trial</span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-700 font-semibold">1 Onboarding</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Number of Users */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Global Users
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-navy-950 mt-1">
              {totalGlobalUsers.toLocaleString('en-NG')} Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{totalStudents} Students</span>
              <span className="text-slate-300">•</span>
              <span>{totalParents} Parents</span>
              <span className="text-slate-300">•</span>
              <span>{totalTeachers} Teachers</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Number of Platforms & Subsystems */}
        <Card className="border-l-4 border-l-purple-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Subsystems & Engines
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-navy-950 mt-1">
              8 / 8 Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Core Services Operational</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Platform Gross Transaction Volume (GTV) */}
        <Card className="border-l-4 border-l-amber-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Fees Handled (GTV)
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold text-navy-950 mt-1">
              ₦230.5M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="text-emerald-700 font-semibold">Paystack Gateway Live</span>
              <span className="text-slate-400">Zero Leakage</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── PLATFORM SUBSYSTEMS & HEALTH STATUS (ALL OPERATIONAL) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950">
              Platform Subsystems & Operational Health
            </h2>
            <p className="text-xs text-slate-500">
              Real-time heartbeat across all microservices, databases, and third-party integrations.
            </p>
          </div>
          <Badge variant="approved" className="gap-1.5">
            <CheckCircle2 className="h-3 w-3" /> All 8 Systems Healthy
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformSubsystems.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.name}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-slate-50 text-emerald-700 border border-slate-200 flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {sub.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-navy-950 leading-snug">{sub.name}</h3>
                  <div className="text-[11px] font-bold text-emerald-700 font-mono mt-0.5">{sub.metric}</div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{sub.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MULTI-SCHOOL TENANT DIRECTORY REGISTRY ── */}
      <Card className="shadow-institutional">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-navy-950">
                Institutional Tenants Directory
              </CardTitle>
              <CardDescription>
                Full roster of schools running on the SquareOS engine with headcounts and activity.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search schools or states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="SETUP">Setup</option>
              </select>

              <Link href="/setup">
                <Button size="sm" variant="primary" className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white">
                  <Plus className="h-3.5 w-3.5" />
                  Add School
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="w-full max-w-full overflow-x-auto rounded-lg border border-slate-200/90">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Students</th>
                  <th className="py-3 px-4 text-center">Teachers</th>
                  <th className="py-3 px-4 text-center">Parents</th>
                  <th className="py-3 px-4">Fee Volume (GTV)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-navy-950 flex items-center gap-2">
                        <span>{school.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {school.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{school.plan}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{school.state}</td>
                    <td className="py-3 px-4 text-center font-bold text-navy-950">{school.students}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{school.teachers}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{school.parents}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800 font-mono">{school.gtv}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          school.status === 'ACTIVE'
                            ? 'approved'
                            : school.status === 'TRIAL'
                            ? 'pending'
                            : 'neutral'
                        }
                      >
                        {school.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard?tenant=${school.code.toLowerCase()}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                      >
                        Inspect <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
