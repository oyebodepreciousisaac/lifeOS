'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  FileSpreadsheet,
  Award,
  CreditCard,
  Scale,
  Receipt,
  Radio,
  BookOpen,
  HeartPulse,
  Video,
  Bot,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface MetricProps {
  sisMetrics: {
    totalStudents: number;
    activeStudents: number;
    admissionsFunnel: { totalApplications: number; offered: number; enrolled: number };
  };
  attendanceMetrics: {
    overallAttendanceRate: number;
    totalPresent: number;
    totalLate: number;
  };
  financeMetrics: {
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
  };
  governanceMetrics: {
    pendingCount: number;
  };
}

type TabKey = 'ALL' | 'ACADEMICS' | 'FINANCE' | 'OPERATIONS' | 'GOVERNANCE';

export default function DashboardModuleDirectory({
  sisMetrics,
  attendanceMetrics,
  financeMetrics,
  governanceMetrics,
}: MetricProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');

  const modules = [
    // ── ACADEMICS & STUDENTS ──
    {
      category: 'ACADEMICS' as const,
      title: 'Student Directory',
      description: 'View student profiles, parent contacts, and class assignments.',
      href: '/admin/students',
      icon: Users,
      badge: `${sisMetrics.totalStudents} Enrolled`,
      accent: 'emerald',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Daily Attendance',
      description: 'Mark morning roll call, monitor lateness, and send parent alerts.',
      href: '/admin/attendance',
      icon: Calendar,
      badge: attendanceMetrics.overallAttendanceRate > 0 ? `${attendanceMetrics.overallAttendanceRate}% Rate` : 'Take Roll Call',
      accent: 'sky',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Academic Structure',
      description: 'Configure sessions, classes, class arms (Gold, Silver or A, B), and subjects.',
      href: '/admin/academic-setup',
      icon: Layers,
      badge: 'Classes & Arms',
      accent: 'indigo',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Admissions Pipeline',
      description: 'Review incoming applications, entrance exams, and offer letters.',
      href: '/admin/admissions',
      icon: UserPlus,
      badge: `${sisMetrics.admissionsFunnel.totalApplications} Applicants`,
      accent: 'blue',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Continuous Assessment',
      description: 'Record test marks, enter exam scores, and manage grade approvals.',
      href: '/admin/assessments',
      icon: FileSpreadsheet,
      badge: 'CA & Exams',
      accent: 'purple',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Report Cards',
      description: 'Generate term report sheets with teacher remarks and PDF downloads.',
      href: '/admin/report-cards',
      icon: Award,
      badge: 'Term Reports',
      accent: 'emerald',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Class Timetable',
      description: 'Weekly period schedules and subject teacher timetable grid.',
      href: '/admin/timetable',
      icon: Clock,
      badge: 'Weekly Grid',
      accent: 'indigo',
    },
    {
      category: 'ACADEMICS' as const,
      title: 'Digital Learning (LMS)',
      description: 'Share class notes, homework assignments, and student materials.',
      href: '/admin/lms',
      icon: Video,
      badge: 'Class Materials',
      accent: 'amber',
    },

    // ── FINANCE & BURSARY ──
    {
      category: 'FINANCE' as const,
      title: 'Fee Invoicing & Bills',
      description: 'Generate term fee invoices, track payments, and manage debtors.',
      href: '/admin/finance',
      icon: CreditCard,
      badge: `${financeMetrics.collectionRate}% Collected`,
      accent: 'purple',
    },
    {
      category: 'FINANCE' as const,
      title: 'Fee Structure Setup',
      description: 'Define tuition, lab fees, uniform charges, and payment schedules.',
      href: '/admin/finance',
      icon: Receipt,
      badge: 'Fee Setup',
      accent: 'emerald',
    },

    // ── OPERATIONS & AUXILIARY ──
    {
      category: 'OPERATIONS' as const,
      title: 'Parent Broadcasts (SMS & Email)',
      description: 'Send instant SMS alerts and school announcements to parents.',
      href: '/admin/communications',
      icon: Radio,
      badge: 'Parent SMS',
      accent: 'sky',
    },
    {
      category: 'OPERATIONS' as const,
      title: 'School Operations & Clinic',
      description: 'Manage clinic records, school bus transport, and hostel facilities.',
      href: '/admin/auxiliary',
      icon: HeartPulse,
      badge: 'Daily Ops',
      accent: 'rose',
    },
    {
      category: 'OPERATIONS' as const,
      title: 'AI Teaching Assistant',
      description: 'AI-assisted lesson planning, scheme of work, and quiz generation.',
      href: '/admin/assistive-ai',
      icon: Bot,
      badge: 'AI Assistant',
      accent: 'cyan',
    },

    // ── GOVERNANCE & SECURITY ──
    {
      category: 'GOVERNANCE' as const,
      title: 'Approval Queue',
      description: 'Review sensitive score adjustments, fee reversals, and arm transfers.',
      href: '/admin/governance',
      icon: Scale,
      badge: governanceMetrics.pendingCount > 0 ? `${governanceMetrics.pendingCount} Pending` : 'All Clear',
      accent: 'amber',
    },
    {
      category: 'GOVERNANCE' as const,
      title: 'Staff & User Access',
      description: 'Manage teacher accounts, bursar access, and parent credentials.',
      href: '/admin/users',
      icon: Users,
      badge: 'User Accounts',
      accent: 'slate',
    },
    {
      category: 'GOVERNANCE' as const,
      title: 'Security & Audit Trail',
      description: 'View full audit logs, sign-in sessions, and system security controls.',
      href: '/admin/platform-security',
      icon: ShieldCheck,
      badge: 'Security',
      accent: 'emerald',
    },
  ];

  const filtered = activeTab === 'ALL' ? modules : modules.filter((m) => m.category === activeTab);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Modules', count: modules.length },
    { key: 'ACADEMICS', label: 'Academics', count: modules.filter((m) => m.category === 'ACADEMICS').length },
    { key: 'FINANCE', label: 'Finance', count: modules.filter((m) => m.category === 'FINANCE').length },
    { key: 'OPERATIONS', label: 'Operations', count: modules.filter((m) => m.category === 'OPERATIONS').length },
    { key: 'GOVERNANCE', label: 'Governance', count: modules.filter((m) => m.category === 'GOVERNANCE').length },
  ];

  return (
    <div className="space-y-4">
      {/* ── APPLE-STYLE SEGMENTED TABS ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">School Management Modules</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Quickly access all administrative departments and daily tools</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.key ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RESPONSIVE MODULE GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filtered.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:scale-105 transition-transform">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

