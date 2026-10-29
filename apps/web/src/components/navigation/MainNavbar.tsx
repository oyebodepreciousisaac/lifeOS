'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  BookOpen,
  LogIn,
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface MainNavbarProps {
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
}

export default function MainNavbar({ user }: MainNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const getNavLinks = () => {
    if (user?.role === 'TEACHER') {
      return [
        { label: 'Teaching Schedule', href: '/portal/teacher' },
        { label: 'Daily Roll Call', href: '/admin/attendance' },
        { label: 'CA Scorebook', href: '/admin/assessments' },
        { label: 'Timetable', href: '/admin/timetable' },
      ];
    }
    if (user?.role === 'PARENT') {
      return [
        { label: 'My Wards', href: '/portal/parent' },
        { label: 'Pay Fees Online', href: '/portal/parent?tab=fees' },
        { label: 'Term Reports', href: '/portal/parent?tab=reports' },
        { label: 'School Broadcasts', href: '/admin/communications' },
      ];
    }
    if (user?.role === 'STUDENT') {
      return [
        { label: 'My Desk', href: '/portal/student' },
        { label: 'Timetable', href: '/portal/student?tab=timetable' },
        { label: 'Virtual LMS', href: '/admin/lms' },
        { label: 'My Report Card', href: '/portal/student?tab=report-card' },
      ];
    }
    if (user?.role === 'BURSAR') {
      return [
        { label: 'Finance Dashboard', href: '/dashboard' },
        { label: 'Invoices & Billing', href: '/admin/finance' },
        { label: 'Fee Schedules', href: '/admin/finance?tab=fees' },
        { label: 'Debtors Ledger', href: '/admin/students' },
      ];
    }
    if (user?.role === 'SUPERADMIN') {
      return [
        { label: 'Platform Overview', href: '/super-admin' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Register School', href: '/setup' },
        { label: 'Platform Security', href: '/admin/platform-security' },
        { label: 'Audit Trail', href: '/admin/audit-logs' },
      ];
    }
    if (user) {
      return [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Student Directory', href: '/admin/students' },
        { label: 'Finance Ledger', href: '/admin/finance' },
        { label: 'Daily Attendance', href: '/admin/attendance' },
        { label: 'Governance Queue', href: '/admin/governance' },
      ];
    }
    return [
      { label: 'Home', href: '/' },
      { label: 'Verify Report Card', href: '/admin/report-cards' },
      { label: 'Register Your School', href: '/signup' },
      { label: 'Sign In', href: '/login' },
    ];
  };

  const navLinks = getNavLinks();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-950 dark:bg-emerald-950 text-emerald-400 font-bold shadow-institutional group-hover:scale-105 transition-transform border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-navy-950 dark:text-white">
                  Square<span className="text-emerald-600 dark:text-emerald-400">OS</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-navy-200 border border-navy-200 dark:border-navy-800">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                School Operating System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${isActive(link.href)
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/50'
                    : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Action / Auth Button + Theme Toggle */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <Link
              href={
                user.role === 'TEACHER'
                  ? '/portal/teacher'
                  : user.role === 'PARENT'
                    ? '/portal/parent'
                    : user.role === 'STUDENT'
                      ? '/portal/student'
                      : user.role === 'BURSAR'
                        ? '/admin/finance'
                        : '/dashboard'
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-navy-950 dark:bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-navy-900 dark:hover:bg-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700/50"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              {user.role === 'TEACHER'
                ? 'Teacher Workspace'
                : user.role === 'PARENT'
                  ? 'Parent Portal'
                  : user.role === 'STUDENT'
                    ? 'Student Workspace'
                    : user.role === 'BURSAR'
                      ? 'Finance Dashboard'
                      : 'Dashboard'}
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <LogIn className="h-3.5 w-3.5" />
                Register School
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button + Theme Toggle */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />

          {user && (
            <Link
              href={
                user.role === 'TEACHER'
                  ? '/portal/teacher'
                  : user.role === 'PARENT'
                    ? '/portal/parent'
                    : user.role === 'STUDENT'
                      ? '/portal/student'
                      : '/dashboard'
              }
              className="sm:hidden inline-flex items-center gap-1 text-xs font-bold bg-navy-950 dark:bg-slate-800 text-white px-2.5 py-1.5 rounded-lg border border-slate-700/40"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
              {user.role === 'TEACHER'
                ? 'Teacher'
                : user.role === 'PARENT'
                  ? 'Parent'
                  : user.role === 'STUDENT'
                    ? 'Student'
                    : 'Dashboard'}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive(link.href)
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-navy-950 dark:bg-emerald-600 text-white font-bold text-sm shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4 text-emerald-400 dark:text-white" />
                  Go to Institutional Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-navy-950 dark:bg-slate-800 text-white font-bold text-sm shadow-sm"
                  >
                    <LogIn className="h-4 w-4 text-emerald-400" />
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500"
                  >
                    Register Your School
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
