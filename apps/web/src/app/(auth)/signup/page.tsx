'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { signupAction, SignUpState } from '@/app/actions/signup';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
} from '@school-os/ui';
import {
  ShieldCheck,
  Building,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  User,
} from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [state, formAction] = useFormState<SignUpState, FormData>(signupAction, {});
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-emerald-400 font-bold shadow-institutional mb-2">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            Register Your School on Square<span className="text-emerald-600">OS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Create your proprietor administrator account and start onboarding your institution in minutes.
          </p>
        </div>

        {/* Registration Card Form */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-navy-950">
              Institutional Registration
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your details and your school's information to get started.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <Alert type="error" title="Registration Incomplete">
                {state.error}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="roleType" value="OWNER" />

              {/* Full Name */}
              <Input
                label="Your Full Name (Proprietor / Administrator)"
                name="fullName"
                type="text"
                required
                placeholder="e.g. Chief Adeleke Davies"
                leftElement={<User className="h-4 w-4 text-slate-400" />}
              />

              {/* School Name & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Official School Name"
                  name="schoolName"
                  type="text"
                  required
                  placeholder="e.g. Apex Model College"
                  leftElement={<Building className="h-4 w-4 text-slate-400" />}
                />
                <Input
                  label="State & City Location"
                  name="stateLocation"
                  type="text"
                  required
                  placeholder="e.g. Lagos State"
                  leftElement={<MapPin className="h-4 w-4 text-slate-400" />}
                />
              </div>

              {/* Email Address */}
              <Input
                label="Official Contact Email"
                name="email"
                type="email"
                required
                placeholder="adeleke@apexcollege.ng"
                leftElement={<Mail className="h-4 w-4 text-slate-400" />}
              />

              {/* Password with working eye toggle */}
              <Input
                label="Account Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 8 characters"
                leftElement={<Lock className="h-4 w-4 text-slate-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {/* Security Compliance Note */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  Your school data is isolated in a private tenant partition and protected under the Nigeria Data Protection Act (NDPA 2023).
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-navy-950 hover:bg-navy-900 text-white font-bold py-3"
                size="md"
              >
                <span>Register School &amp; Continue Setup</span>
                <ArrowRight className="h-4 w-4 ml-1.5 text-emerald-400" />
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
                Multi-Tenant Scoped
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Existing Member Navigation */}
        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>
            Already registered your school?{' '}
            <Link href="/login" className="text-emerald-700 hover:underline font-bold">
              Sign In to Your Workspace
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Are you a teacher, parent, or student? Your school administrator provides your login credentials. Contact your school office to obtain access.
          </p>
        </div>
      </div>
    </div>
  );
}
