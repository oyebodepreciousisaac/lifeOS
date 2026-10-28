'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { verifyMfaAction, AuthState } from '@/app/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Alert } from '@school-os/ui';
import { KeyRound, ShieldAlert, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function MfaChallengePage() {
  const [state, formAction] = useFormState<AuthState, FormData>(verifyMfaAction, {});
  const [code, setCode] = React.useState('123456');
  const [timeLeft, setTimeLeft] = React.useState(30);

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
            Multi-Factor Authentication
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mandatory secondary verification for privileged administrative roles (OWASP ASVS 5.0).
          </p>
        </div>

        {/* Verification Card */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Enter 6-Digit Authenticator Code</CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Open Google Authenticator or Authy</span>
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
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
                className="font-mono text-center text-2xl tracking-[0.4em] font-extrabold text-navy-950"
                placeholder="000000"
              />

              <Button type="submit" variant="primary" className="w-full" size="md">
                Verify Code & Enter Dashboard
              </Button>
            </form>

            <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Authorized Institutional Passkey:
              </div>
              <p className="text-slate-600">
                Enter your Authenticator TOTP token, or default evaluation code <code className="font-mono font-bold text-navy-950 bg-white px-1.5 py-0.5 rounded border border-emerald-200">123456</code>.
              </p>
            </div>
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
