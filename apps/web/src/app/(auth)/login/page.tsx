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
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
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
                    Need login help?
                  </button>
                </div>
              </div>

              {/* Password Assistance / Institutional Help Note */}
              {helpOpen && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in-50 duration-150">
                  <strong className="text-navy-950 block font-semibold">Institutional Access Assistance</strong>
                  <p>
                    For student safety and institutional compliance, password resets are coordinated via your school administrator or IT registry desk.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    If you are locked out, contact your school administrative office or platform support with your registered National Identification / School Admission Number.
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
                Multi-Factor Compliant
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Links */}
        <div className="text-center text-xs text-slate-500 space-y-1.5">
          <p>
            Enrolling a new student?{' '}
            <Link href="/admissions/apply" className="text-emerald-700 hover:underline font-bold">
              Visit Admissions Application
            </Link>
          </p>
          <p>
            New institutional proprietor?{' '}
            <Link href="/setup" className="text-navy-900 hover:underline font-bold">
              Provision Your School On SquareOS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
