'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { loginAction, AuthState } from '@/app/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '@school-os/ui';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(loginAction, {});
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [helpOpen, setHelpOpen] = React.useState(false);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-emerald-400 font-bold shadow-institutional mb-2">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">
            Sign in to Square<span className="text-emerald-600">OS</span>
          </h1>
          <p className="text-xs text-slate-500">
            Secure institutional access for authorized staff, parents, and students.
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-navy-950">Institutional Credentials</CardTitle>
            <CardDescription>
              Enter your registered school email address and account password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <Alert type="error" title="Sign In Unsuccessful">
                {state.error}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <Input
                label="Registered School Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@school.edu.ng"
                leftElement={<Mail className="h-4 w-4 text-slate-400" />}
              />

              <div>
                <div className="relative">
                  <Input
                    label="Account Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your account password"
                    leftElement={<Lock className="h-4 w-4 text-slate-400" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700 focus:outline-none p-1 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>Remember this device</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setHelpOpen(!helpOpen)}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Password Assistance */}
              {helpOpen && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in-50 duration-150">
                  <strong className="text-navy-950 block font-semibold">Password Reset Guide</strong>
                  <p>
                    Staff, teachers, and students: Please contact your school administrator or bursar to trigger a secure password reset link or issue temporary credentials.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    School Owners: For verified institutional recovery, contact SquareOS platform support with your registered school email.
                  </p>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full bg-navy-950 hover:bg-navy-900 text-white" size="md">
                Sign In to Platform
                <ArrowRight className="h-4 w-4 ml-1 text-emerald-400" />
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                TLS 1.3 Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                MFA Protected
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Owner / SuperAdmin Quick Access */}
        <div className="p-3.5 bg-navy-950 text-white rounded-xl border border-navy-800 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Platform Owner Sign-in
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('superadmin@squareos.com');
                setPassword('SchoolOS@2026');
              }}
              className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2.5 py-1 rounded-md border border-emerald-500/40 transition cursor-pointer"
            >
              1-Click Fill Credentials
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            Login as the software owner to access the global Multi-School Super-Admin Dashboard:
          </p>
          <div className="text-[11px] font-mono text-slate-400 bg-navy-900/80 px-2.5 py-1 rounded flex justify-between">
            <span>Email: <strong className="text-white">superadmin@squareos.com</strong></span>
            <span>Password: <strong className="text-white">SchoolOS@2026</strong></span>
          </div>
        </div>

        {/* Access Links */}
        <div className="text-center text-xs text-slate-500 space-y-1.5">
          <p>
            School Proprietor or Admin?{' '}
            <Link href="/signup" className="text-emerald-700 hover:underline font-bold">
              Register Your School on SquareOS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
