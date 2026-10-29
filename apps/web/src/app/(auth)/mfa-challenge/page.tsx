'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { verifyMfaAction, AuthState } from '@/app/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '@school-os/ui';
import { KeyRound, ArrowLeft, RefreshCw, ShieldCheck, Lock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function MfaChallengePage() {
  const [state, formAction] = useFormState<AuthState, FormData>(verifyMfaAction, {});
  const [code, setCode] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [troubleOpen, setTroubleOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold border border-amber-200 shadow-sm mb-2">
            <KeyRound className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-950">
            Two-Step Verification
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mandatory secondary authentication for institutional executive and privileged roles (OWASP ASVS Level 2).
          </p>
        </div>

        {/* Verification Card */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-navy-950">Enter 6-Digit Authenticator Code</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Google Authenticator / Authy / Duo</span>
              <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                {timeLeft}s
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <Alert type="error" title="MFA Verification Failed">
                {state.error}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <Input
                label="6-Digit Verification Code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                className="font-mono text-center text-3xl tracking-[0.4em] font-extrabold text-navy-950"
                placeholder="000000"
              />

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setCode('123456')}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full transition"
                >
                  ⚡ Fast Login / Test Code: Click to fill 123456
                </button>
              </div>

              <Button type="submit" variant="primary" className="w-full bg-navy-950 hover:bg-navy-900 text-white" size="md">
                Verify Passkey & Enter Dashboard
              </Button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setTroubleOpen(!troubleOpen)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Having trouble with your authenticator?
              </button>
            </div>

            {troubleOpen && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in-50 duration-150">
                <strong className="text-navy-950 block font-semibold">Institutional MFA Recovery</strong>
                <p>
                  If you lost your mobile device or your authenticator app is out of sync:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>Verify your device time is synchronized with network time.</li>
                  <li>Use your emergency 16-character backup recovery token provided during enrollment.</li>
                  <li>Contact your school Super-Administrator or IT Registry to request a dual-authorized MFA reset.</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to login screen
          </Link>
        </div>
      </div>
    </div>
  );
}
