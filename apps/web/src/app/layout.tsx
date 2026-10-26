import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import MainNavbar from '@/components/navigation/MainNavbar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { ShieldCheck, Layers, BookOpen, ExternalLink, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SquareOS — Complete School Operating System',
  description:
    'One student record. One operational source of truth. Controlled Maker-Checker workflows, real-time double-entry ledger, and actionable dashboards for schools.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session
    ? {
        name: `${session.firstName} ${session.lastName}`,
        role: session.userType,
        email: session.email,
      }
    : null;

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white pb-16 lg:pb-0">
        {/* Responsive Institutional Navbar */}
        <MainNavbar user={user} />

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Mobile PWA Bottom Navigation Bar */}
        <MobileBottomNav user={user} />

        {/* Institutional Footer */}
        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 text-xs text-slate-500">
              <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-navy-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <span className="font-extrabold text-navy-950 text-sm">Square<span className="text-emerald-600">OS</span></span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>The Operating System for West African Schools</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-emerald-700 font-medium">NDPA 2023 & OWASP ASVS 5.0 Compliant</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                <Link href="/" className="hover:text-emerald-700 transition-colors">
                  Overview
                </Link>
                <Link href="/admissions/apply" className="hover:text-emerald-700 transition-colors">
                  Admissions
                </Link>
                <Link href="/portal/parent" className="hover:text-emerald-700 transition-colors">
                  Parent Portal
                </Link>
                <Link href="/portal/teacher" className="hover:text-emerald-700 transition-colors">
                  Teacher Portal
                </Link>
                <Link href="/portal/student" className="hover:text-emerald-700 transition-colors">
                  Student Portal
                </Link>
                <Link href="/admin/governance" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Dual Governance
                </Link>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left">
              <p>© {new Date().getFullYear()} SchoolOS. The Authorized School Operating System for West African Educational Institutions.</p>
              <p>One authoritative student record • Double-entry immutable ledger • Multi-person dual control</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
