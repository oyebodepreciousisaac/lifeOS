import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { getSession } from '@/lib/auth/session';
import MainNavbar from '@/components/navigation/MainNavbar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ShieldCheck, Layers, BookOpen, ExternalLink, Heart } from 'lucide-react';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={`h-full ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-full w-full max-w-full flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white pb-16 lg:pb-0 overflow-x-hidden font-sans transition-colors duration-150">
        <ThemeProvider>
          {/* Responsive Institutional Navbar */}
          <MainNavbar user={user} />

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>

          {/* Mobile PWA Bottom Navigation Bar */}
          <MobileBottomNav user={user} />

          {/* Institutional Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 transition-colors">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-navy-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <span className="font-extrabold text-navy-950 dark:text-white text-sm">Square<span className="text-emerald-600 dark:text-emerald-400">OS</span></span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <p>
                    Institutional Operating System &bull; WAEC &bull; NECO &bull; Cambridge &bull; CBN AML/CFT Compliant
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Link href="/signup" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Register School
                  </Link>
                  <Link href="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                <p>&copy; {new Date().getFullYear()} SquareOS Systems Ltd. Multi-Tenant Enterprise License.</p>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero Fee Leakage &bull; Double-Entry Append-Only Ledger &bull; Maker-Checker Signed</span>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
