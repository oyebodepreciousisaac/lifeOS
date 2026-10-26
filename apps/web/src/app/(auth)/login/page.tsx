'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { loginAction, AuthState } from '@/app/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '@school-os/ui';
import { ShieldCheck, Lock, Mail, UserCheck, ArrowRight, Eye, EyeOff, HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(loginAction, {});
  const [email, setEmail] = React.useState('owner@apexcollege.ng');
  const [password, setPassword] = React.useState('SchoolOS@2026');
  const [showPassword, setShowPassword] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const demoAccounts = [
    { label: 'School Executive / Owner (Apex Model College)', email: 'owner@apexcollege.ng', requiresMfa: true },
    { label: 'Principal / Academics', email: 'principal@apexcollege.ng', requiresMfa: true },
    { label: 'Bursar / Finance Lead', email: 'bursar@apexcollege.ng', requiresMfa: true },
    { label: 'Subject Teacher (Mr. Joseph Okafor)', email: 'teacher@apexcollege.ng', requiresMfa: false },
    { label: 'Parent / Guardian (Mrs. Ngozi Adeleke)', email: 'parent@apexcollege.ng', requiresMfa: false },
    { label: 'Enrolled Student (Chidubem Emmanuel Adeleke)', email: 'student@apexcollege.ng', requiresMfa: false },
    { label: 'School Executive (Premier Academy Abuja - Tenant B)', email: 'owner@premierabuja.ng', requiresMfa: true },
  ];

  const handleSelectDemo = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('SchoolOS@2026');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-emerald-400 font-bold shadow-institutional mb-2">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">
            Sign in to School<span className="text-emerald-600">OS</span>
          </h1>
          <p className="text-xs text-slate-500">
            Institutional access for authorized staff, parents, and students.
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Institutional Credentials</CardTitle>
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
                placeholder="name@school.edu.ng"
                leftElement={<Mail className="h-4 w-4" />}
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
                    placeholder="Enter your password"
                    leftElement={<Lock className="h-4 w-4" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => setHelpOpen(!helpOpen)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Forgot password or need help?
                  </button>
                </div>
              </div>

              {/* Password Assistance Note */}
              {helpOpen && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in-50 duration-150">
                  <strong className="text-navy-950 block font-semibold">Institutional Password Security</strong>
                  <p>
                    For institutional data protection, account credentials and access resets are managed directly by your school administrator or IT department.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Please contact your school administrative office or send an inquiry with your registered name and identification number.
                  </p>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" size="md">
                Sign In to SchoolOS
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            {/* Quick Demo Evaluation Personas */}
            <details className="pt-3 border-t border-slate-100 group">
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between py-1 select-none">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Quick Evaluation Profiles (Click to load)
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="grid grid-cols-1 gap-1.5 text-xs pt-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc.email)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                      email === acc.email
                        ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate mr-2">{acc.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {acc.requiresMfa ? 'MFA Enabled' : 'Direct Sign-in'}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>

        {/* Security & Compliance Footer */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p>
            Need to register a school or activate staff/parent access?{' '}
            <Link href="/signup" className="text-emerald-600 hover:underline font-semibold">
              Create an Account
            </Link>
          </p>
          <p>
            Applying for a new student?{' '}
            <Link href="/admissions/apply" className="text-emerald-600 hover:underline font-semibold">
              Visit Admissions Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
