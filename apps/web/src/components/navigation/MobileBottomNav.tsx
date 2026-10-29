'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  GraduationCap,
  FileCheck2,
  LogIn,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  X,
  UserCheck,
  CreditCard,
  Building,
  Radio,
  Clock,
  Award,
  Video,
  Scale,
  FileText,
  BookOpen,
  LogOut,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface MobileBottomNavProps {
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
}

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
  onClick?: () => void;
}

export default function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Close sheet on route change
  React.useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const [path] = href.split('?');
    return pathname.startsWith(path);
  };

  const getNavItems = (): BottomNavItem[] => {
    if (user?.role === 'STUDENT') {
      return [
        { label: 'My Desk', href: '/portal/student', icon: GraduationCap },
        { label: 'Timetable', href: '/portal/student?tab=timetable', icon: Clock },
        { label: 'LMS Class', href: '/admin/lms', icon: Video },
        { label: 'Report Card', href: '/portal/student?tab=report-card', icon: Award },
        {
          label: 'Student Hub',
          isAction: true,
          href: '#hub',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    if (user?.role === 'PARENT') {
      return [
        { label: 'My Wards', href: '/portal/parent', icon: Users },
        { label: 'Pay Fees', href: '/portal/parent?tab=fees', icon: CreditCard },
        { label: 'Reports', href: '/portal/parent?tab=reports', icon: Award },
        { label: 'Broadcasts', href: '/admin/communications', icon: Radio },
        {
          label: 'Parent Hub',
          isAction: true,
          href: '#hub',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    if (user?.role === 'TEACHER') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Schedule', href: '/portal/teacher', icon: GraduationCap },
        { label: 'Roll Call', href: '/admin/attendance', icon: UserCheck },
        { label: 'CA Marks', href: '/admin/assessments', icon: FileCheck2 },
        {
          label: 'Teacher Hub',
          isAction: true,
          href: '#hub',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    if (user?.role === 'BURSAR') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Invoices', href: '/admin/finance', icon: CreditCard },
        { label: 'Fee Setup', href: '/admin/finance?tab=fees', icon: FileCheck2 },
        { label: 'Debtors', href: '/admin/students', icon: Users },
        {
          label: 'Finance Hub',
          isAction: true,
          href: '#hub',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    if (user) {
      // Platform Owner, Principal, SuperAdmin, IT Admin
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Academics', href: '/admin/students', icon: Users },
        { label: 'Finance', href: '/admin/finance', icon: CreditCard },
        { label: 'Attendance', href: '/admin/attendance', icon: UserCheck },
        {
          label: 'Admin Hub',
          isAction: true,
          href: '#hub',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    // Guest / Unauthenticated
    return [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Portals', href: '/portal/parent', icon: Users },
      { label: 'Verify', href: '/admin/report-cards', icon: ShieldCheck },
      { label: 'Register', href: '/signup', icon: Building },
      {
        label: 'Sign In',
        isAction: false,
        href: '/login',
        icon: LogIn,
      },
    ];
  };

  const navItems = getNavItems();

  const getRoleHubLinks = () => {
    const role = user?.role;
    if (role === 'STUDENT') {
      return [
        { label: 'My Academic Desk', href: '/portal/student', icon: GraduationCap },
        { label: 'Weekly Timetable', href: '/portal/student?tab=timetable', icon: Clock },
        { label: 'Terminal Report Card', href: '/portal/student?tab=report-card', icon: Award },
        { label: 'Virtual LMS & Homework', href: '/admin/lms', icon: Video },
        { label: 'School Library Catalog', href: '/admin/auxiliary', icon: BookOpen },
      ];
    }

    if (role === 'PARENT') {
      return [
        { label: 'Children Overview', href: '/portal/parent', icon: Users },
        { label: 'Tuition Invoices & Payment', href: '/portal/parent?tab=fees', icon: CreditCard },
        { label: 'Terminal Report Cards', href: '/portal/parent?tab=reports', icon: Award },
        { label: 'Attendance & Bell Cutoff', href: '/portal/parent?tab=attendance', icon: UserCheck },
        { label: 'School Announcements', href: '/admin/communications', icon: Radio },
      ];
    }

    if (role === 'TEACHER') {
      return [
        { label: 'Teacher Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Teaching Schedule', href: '/portal/teacher', icon: GraduationCap },
        { label: 'Morning Roll Call', href: '/admin/attendance', icon: UserCheck },
        { label: 'CA Scorebook', href: '/admin/assessments', icon: FileCheck2 },
        { label: 'AI Lesson Assistant', href: '/admin/assistive-ai', icon: Sparkles },
        { label: 'Score Alteration Request', href: '/admin/governance', icon: Scale },
      ];
    }

    if (role === 'BURSAR') {
      return [
        { label: 'Finance Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Invoices & Term Billing', href: '/admin/finance', icon: CreditCard },
        { label: 'Fee Schedules & Concessions', href: '/admin/finance?tab=fees', icon: FileCheck2 },
        { label: 'Aging Debtors Roster', href: '/admin/students', icon: Users },
        { label: 'Dual-Control Reversals', href: '/admin/governance', icon: Scale },
        { label: 'Audit Trail', href: '/admin/audit-logs', icon: FileText },
      ];
    }

    // Executive / Superadmin / Owner
    return [
      { label: 'Platform Overview', href: '/super-admin', icon: BarChart3 },
      { label: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Provision New School', href: '/setup', icon: Building },
      { label: 'Student Directory', href: '/admin/students', icon: Users },
      { label: 'Admissions Funnel', href: '/admin/admissions', icon: FileCheck2 },
      { label: 'Bursary Ledger', href: '/admin/finance', icon: CreditCard },
      { label: 'Maker-Checker Queue', href: '/admin/governance', icon: Scale },
      { label: 'Platform Security', href: '/admin/platform-security', icon: ShieldCheck },
    ];
  };

  const hubLinks = getRoleHubLinks();

  return (
    <>
      {/* ── NATIVE APP BOTTOM NAVIGATION BAR ── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-2xl safe-area-bottom"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isAction ? sheetOpen : isActive(item.href);

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                    active
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-500 hover:text-navy-950 font-medium'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-emerald-700 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  active
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-500 hover:text-navy-950 font-medium'
                }`}
                aria-label={item.label}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-emerald-700 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── ROLE-SEGREGATED BOTTOM ACTION HUB SHEET ── */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet Body */}
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250">
            {/* Sheet Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

            {/* Header & User Profile */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-navy-950 text-emerald-400 font-extrabold flex items-center justify-center shadow-sm">
                  {user?.name ? user.name[0] : 'S'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">{user?.name || 'SquareOS User'}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {user?.role || 'AUTHENTICATED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-navy-950"
                aria-label="Close hub sheet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Role-Specific Quick Links */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {user?.role} Workspace Links
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {hubLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white transition-colors text-xs font-semibold text-navy-950 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-emerald-700" />
                        <span>{link.label}</span>
                      </div>
                      <span className="text-slate-400 text-xs">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href="/dashboard"
                onClick={() => setSheetOpen(false)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Go to Main Dashboard
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
