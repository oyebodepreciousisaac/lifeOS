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
  Wifi,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface MobileBottomNavProps {
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
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
    return pathname.startsWith(href);
  };

  const getNavItems = () => {
    if (user?.role === 'TEACHER') {
      return [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Schedule', href: '/portal/teacher', icon: GraduationCap },
        { label: 'Roll Call', href: '/admin/attendance', icon: UserCheck },
        { label: 'CA Marks', href: '/admin/assessments', icon: FileCheck2 },
        {
          label: 'My Hub',
          isAction: true,
          href: '/dashboard',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    if (user?.role === 'BURSAR') {
      return [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Invoices', href: '/admin/finance', icon: CreditCard },
        { label: 'Schedules', href: '/admin/finance?tab=fees', icon: FileCheck2 },
        { label: 'Debtors', href: '/admin/students', icon: Users },
        {
          label: 'My Hub',
          isAction: true,
          href: '/dashboard',
          icon: Settings,
          onClick: () => setSheetOpen(true),
        },
      ];
    }

    return [
      { label: 'Home', href: '/', icon: Home },
      { label: 'Parent', href: '/portal/parent', icon: Users },
      { label: 'Teacher', href: '/portal/teacher', icon: GraduationCap },
      { label: 'Apply', href: '/admissions/apply', icon: FileCheck2 },
      {
        label: user ? 'App Hub' : 'Sign In',
        isAction: Boolean(user),
        href: user ? '/dashboard' : '/login',
        icon: user ? Settings : LogIn,
        onClick: user ? () => setSheetOpen(true) : undefined,
      },
    ];
  };

  const navItems = getNavItems();

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
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[60px] min-h-[48px] ${
                    active
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-500 hover:text-navy-950 font-medium'
                  }`}
                >
                  <div
                    className={`p-1 rounded-lg transition-transform ${
                      active ? 'bg-emerald-50 scale-110' : ''
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[60px] min-h-[48px] ${
                  active
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-500 hover:text-navy-950 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    active ? 'bg-emerald-50 scale-110' : ''
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── NATIVE APP SETTINGS & QUICK SWITCHER BOTTOM SHEET ── */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Up Sheet Card */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto z-10 border-t border-slate-200 animate-in slide-in-from-bottom duration-200 space-y-4">
            {/* Sheet Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

            {/* Header & User Profile */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-navy-950 text-emerald-400 font-extrabold flex items-center justify-center shadow-sm">
                  {user?.name ? user.name[0] : 'S'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-950">{user?.name || 'Square User'}</h3>
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
                aria-label="Close settings sheet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* PWA Offline Health Status */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-slate-700">Offline PWA Engine</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                Active &amp; Synced
              </span>
            </div>

            {/* Quick Portal Switcher Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Institutional Portals
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/portal/parent"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>Parent Portal</span>
                </Link>

                <Link
                  href="/portal/teacher"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>Teacher Portal</span>
                </Link>

                <Link
                  href="/portal/student"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span>Student Portal</span>
                </Link>

                <Link
                  href="/admin/finance"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  <span>Finance Ledger</span>
                </Link>

                <Link
                  href="/admin/attendance"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white transition-colors text-xs font-semibold text-navy-950"
                >
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>Attendance</span>
                </Link>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href="/signup"
                onClick={() => setSheetOpen(false)}
                className="text-xs font-semibold text-slate-600 hover:text-navy-950"
              >
                Register New School
              </Link>

              <form action={logoutAction} className="shrink-0">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
