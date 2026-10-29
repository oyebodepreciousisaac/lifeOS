'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Award,
  Receipt,
  CreditCard,
  HeartPulse,
  Video,
  Radio,
  Bot,
  Scale,
  Layers,
  ShieldCheck,
  FileText,
  Database,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Building,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface AdminShellProps {
  children: React.ReactNode;
  session: {
    firstName: string;
    lastName: string;
    userType: string;
    email: string;
    schoolId: string;
  };
  schoolName: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminShell({ children, session, schoolName }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  // Close on route navigation
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const getNavSections = (): NavSection[] => {
    const role = session.userType;
    if (role === 'TEACHER') {
      return [
        {
          title: 'Teaching Workspace',
          items: [
            { label: 'Teacher Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Schedule & Scorebook', href: '/portal/teacher', icon: BookOpen },
          ],
        },
        {
          title: 'Classroom & Academics',
          items: [
            { label: 'Daily Attendance', href: '/admin/attendance', icon: UserCheck },
            { label: 'Continuous Assessment', href: '/admin/assessments', icon: FileSpreadsheet },
            { label: 'Class Timetable', href: '/admin/timetable', icon: Calendar },
            { label: 'Virtual LMS', href: '/admin/lms', icon: Video },
            { label: 'Student Directory', href: '/admin/students', icon: Users },
          ],
        },
        {
          title: 'Tools & Broadcasts',
          items: [
            { label: 'School Broadcasts', href: '/admin/communications', icon: Radio },
            { label: 'AI Lesson Assistant', href: '/admin/assistive-ai', icon: Bot },
          ],
        },
      ];
    }

    if (role === 'BURSAR') {
      return [
        {
          title: 'Finance & Accounts',
          items: [
            { label: 'Finance Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Invoices & Billing', href: '/admin/finance', icon: Receipt },
            { label: 'Fee Schedules', href: '/admin/finance?tab=fees', icon: CreditCard },
          ],
        },
        {
          title: 'Students & Records',
          items: [
            { label: 'Student Billing Roster', href: '/admin/students', icon: Users },
            { label: 'Audit Trail', href: '/admin/audit-logs', icon: FileText },
          ],
        },
      ];
    }

    if (role === 'STUDENT') {
      return [
        {
          title: 'Student Desk',
          items: [
            { label: 'My Academic Desk', href: '/portal/student', icon: GraduationCap },
            { label: 'Class Timetable', href: '/portal/student?tab=timetable', icon: Calendar },
            { label: 'Terminal Report Card', href: '/portal/student?tab=report-card', icon: Award },
            { label: 'Virtual LMS', href: '/admin/lms', icon: Video },
          ],
        },
      ];
    }

    if (role === 'PARENT') {
      return [
        {
          title: 'Parent Portal',
          items: [
            { label: 'My Wards', href: '/portal/parent', icon: Users },
            { label: 'Tuition & Fees', href: '/portal/parent?tab=fees', icon: CreditCard },
            { label: 'Terminal Report Cards', href: '/portal/parent?tab=reports', icon: Award },
            { label: 'Attendance Records', href: '/portal/parent?tab=attendance', icon: UserCheck },
          ],
        },
      ];
    }

    // Default: Executive / School Admin / Principal / Superadmin
    return [
      {
        title: 'Core Management',
        items: [
          { label: 'Institutional Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Student Information (SIS)', href: '/admin/students', icon: Users },
          { label: 'Admissions Funnel', href: '/admin/admissions', icon: UserPlus },
        ],
      },
      {
        title: 'Academics & Teaching',
        items: [
          { label: 'Daily Attendance', href: '/admin/attendance', icon: UserCheck },
          { label: 'Class Timetable', href: '/admin/timetable', icon: Calendar },
          { label: 'CA & Examinations', href: '/admin/assessments', icon: FileSpreadsheet },
          { label: 'Terminal Report Cards', href: '/admin/report-cards', icon: Award },
        ],
      },
      {
        title: 'Finance & Bursary',
        items: [
          { label: 'Double-Entry Ledger', href: '/admin/finance', icon: Receipt },
          { label: 'Fee Schedules', href: '/admin/finance?tab=fees', icon: CreditCard },
        ],
      },
      {
        title: 'School Operations',
        items: [
          { label: 'Auxiliary Services', href: '/admin/auxiliary', icon: HeartPulse },
          { label: 'Virtual LMS', href: '/admin/lms', icon: Video },
          { label: 'School Broadcasts', href: '/admin/communications', icon: Radio },
          { label: 'Assistive AI Workbench', href: '/admin/assistive-ai', icon: Bot },
        ],
      },
      {
        title: 'Governance & Security',
        items: [
          { label: 'Maker-Checker Queue', href: '/admin/governance', icon: Scale },
          { label: 'Academic Setup', href: '/admin/academic-setup', icon: Layers },
          { label: 'Staff & Roles', href: '/admin/users', icon: ShieldCheck },
          { label: 'Audit Trail', href: '/admin/audit-logs', icon: FileText },
          { label: 'Security & Backup', href: '/admin/platform-security', icon: Database },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  const isCurrent = (href: string) => {
    const [path] = href.split('?');
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const getBreadcrumb = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (isCurrent(item.href)) {
          return { section: section.title, item: item.label };
        }
      }
    }
    return { section: 'Administration', item: 'Module Console' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Admin Utility Bar - Relative on mobile so it never covers content when scrolling, sticky on desktop */}
      <div className="relative lg:sticky lg:top-16 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-2 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-expanded={mobileOpen}
              aria-label="Open administration navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
              <Link href="/dashboard" className="hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden xs:inline">Dashboard</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 truncate">{breadcrumb.section}</span>
              <span className="hidden sm:inline shrink-0">
                <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
              </span>
              <span className="font-bold text-navy-950 dark:text-white truncate">
                {breadcrumb.item}
              </span>
            </div>
          </div>

          {/* School Context, Role & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700/60">
              <Building className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              <span className="truncate max-w-[130px] md:max-w-[200px]">{schoolName}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-emerald-400 border border-navy-200 dark:border-navy-800">
              {session.userType}
            </span>
            <ThemeToggle className="p-1.5" />
          </div>
        </div>
      </div>

      {/* Main Flex Row: Sidebar on Left, Content on Right */}
      <div className="flex-1 flex items-start">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-6.5rem)] p-4 sticky top-[6.25rem] transition-colors">
          <div className="space-y-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-navy-950 dark:text-white text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Operational Dashboard</span>
            </Link>

            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </h3>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrent(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${active
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold border-l-4 border-emerald-600'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-navy-950 dark:hover:text-white'
                          }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* User Signout */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-2 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl p-4 overflow-y-auto z-10 border-r border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-navy-950 dark:bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  S
                </div>
                <div>
                  <strong className="text-xs text-navy-950 dark:text-white block">SquareOS Admin</strong>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{session.userType}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-navy-950 dark:hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-navy-950 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Operational Dashboard</span>
              </Link>

              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isCurrent(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${active
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold border-l-4 border-emerald-600'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
