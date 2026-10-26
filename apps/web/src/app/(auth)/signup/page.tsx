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
  GraduationCap,
  Users,
  UserCheck,
  Lock,
  Mail,
  Phone,
  FileText,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [state, formAction] = useFormState<SignUpState, FormData>(signupAction, {});
  const [roleType, setRoleType] = React.useState<'OWNER' | 'TEACHER' | 'PARENT' | 'STUDENT'>('OWNER');
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-950 text-emerald-400 font-bold shadow-institutional mb-2">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            Create Your School<span className="text-emerald-600">OS</span> Account
          </h1>
          <p className="text-xs text-slate-500">
            Select your stakeholder profile to register your institution or activate portal access.
          </p>
        </div>

        {/* Stakeholder Role Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
          <button
            type="button"
            onClick={() => setRoleType('OWNER')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'OWNER'
                ? 'bg-navy-950 text-emerald-400 shadow-sm'
                : 'text-slate-700 hover:text-navy-950 hover:bg-slate-300/50'
            }`}
          >
            <Building className="h-4 w-4 mb-1" />
            <span>School Owner</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType('TEACHER')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'TEACHER'
                ? 'bg-navy-950 text-emerald-400 shadow-sm'
                : 'text-slate-700 hover:text-navy-950 hover:bg-slate-300/50'
            }`}
          >
            <UserCheck className="h-4 w-4 mb-1" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType('PARENT')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'PARENT'
                ? 'bg-navy-950 text-emerald-400 shadow-sm'
                : 'text-slate-700 hover:text-navy-950 hover:bg-slate-300/50'
            }`}
          >
            <Users className="h-4 w-4 mb-1" />
            <span>Parent</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType('STUDENT')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'STUDENT'
                ? 'bg-navy-950 text-emerald-400 shadow-sm'
                : 'text-slate-700 hover:text-navy-950 hover:bg-slate-300/50'
            }`}
          >
            <GraduationCap className="h-4 w-4 mb-1" />
            <span>Student</span>
          </button>
        </div>

        {/* Registration Card Form */}
        <Card className="shadow-institutional-lg border-slate-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>
                {roleType === 'OWNER' && 'Register New School Institution'}
                {roleType === 'TEACHER' && 'Activate Staff & Teacher Account'}
                {roleType === 'PARENT' && 'Parent Registration & Ward Link'}
                {roleType === 'STUDENT' && 'Student Portal Activation'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {roleType} PORTAL
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {roleType === 'OWNER' && 'Set up your school tenant, configure campuses, and establish authoritative student records.'}
              {roleType === 'TEACHER' && 'Enter your institutional staff identification code issued by school administration.'}
              {roleType === 'PARENT' && 'Provide your mobile phone for SMS alerts and link your child with their Admission Number.'}
              {roleType === 'STUDENT' && 'Activate your student timetable, continuous assessment marks, and report card viewer.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <Alert type="error" title="Registration Incomplete">
                {state.error}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="roleType" value={roleType} />

              {/* Shared: Full Name */}
              <Input
                label="Full Official Name"
                name="fullName"
                type="text"
                required
                placeholder={roleType === 'PARENT' ? 'e.g. Mrs. Ngozi Adeleke' : 'e.g. Dr. Babatunde Adeleke'}
              />

              {/* Role-Specific Fields */}
              {roleType === 'OWNER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="School / Institution Name"
                    name="schoolName"
                    type="text"
                    required
                    placeholder="e.g. Apex Model College"
                  />
                  <Input
                    label="State & Campus Location"
                    name="stateLocation"
                    type="text"
                    required
                    placeholder="e.g. Lagos (Victoria Island)"
                  />
                </div>
              )}

              {roleType === 'TEACHER' && (
                <Input
                  label="Institutional Staff Code / Invite ID"
                  name="staffCode"
                  type="text"
                  required
                  placeholder="e.g. STF-2026-MATH"
                />
              )}

              {roleType === 'PARENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Primary Phone (SMS & WhatsApp)"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+234 803 123 4567"
                    leftElement={<Phone className="h-4 w-4" />}
                  />
                  <Input
                    label="Ward's Student Admission Number"
                    name="admissionNumber"
                    type="text"
                    required
                    placeholder="e.g. KCL/2026/001"
                  />
                </div>
              )}

              {roleType === 'STUDENT' && (
                <Input
                  label="Student Admission Number"
                  name="admissionNumber"
                  type="text"
                  required
                  placeholder="e.g. KCL/2026/001"
                />
              )}

              {/* Shared: Email Address */}
              <Input
                label="Official Email Address"
                name="email"
                type="email"
                required
                placeholder="name@apexcollege.ng"
                leftElement={<Mail className="h-4 w-4" />}
              />

              {/* Shared: Password */}
              <div className="relative">
                <Input
                  label="Secure Account Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  leftElement={<Lock className="h-4 w-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              {/* Security Compliance Note */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Accounts are encrypted with PBKDF2 hashing, NDPA 2023 certified privacy controls, and tenant-scoped session tokens.
                </span>
              </div>

              <Button type="submit" variant="primary" className="w-full" size="md">
                Complete {roleType === 'OWNER' ? 'School Setup' : 'Activation'} &amp; Enter Portal
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Switch to Sign In */}
        <div className="text-center text-xs text-slate-500">
          Already have an authorized institutional account?{' '}
          <Link href="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
