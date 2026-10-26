'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Input,
  Select,
  Alert,
} from '@school-os/ui';
import {
  GraduationCap,
  Building,
  User,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Phone,
  Mail,
  HeartPulse,
  Sparkles,
  Copy,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { submitPublicApplicationAction } from '../../actions/sis';
import { getPublicSchoolConfigAction } from '../../actions/academic-setup';
import {
  ApplicationSubmissionInput,
  AdmissionApplication,
} from '../../../lib/sis/sis-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

export default function PublicApplicationPage() {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<AdmissionApplication | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState<{
    firstName: string;
    lastName: string;
    middleName: string;
    gender: 'MALE' | 'FEMALE';
    dateOfBirth: string;
    stateOfOrigin: string;
    lga: string;
    nationality: string;
    residentialAddress: string;
    allergies: string;
    appliedClassLevelId: string;
    campusId: string;
    previousSchoolName: string;
    previousSchoolClass: string;
    guardian: {
      firstName: string;
      lastName: string;
      relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'SPONSOR';
      phonePrimary: string;
      phoneSecondary: string;
      email: string;
      occupation: string;
      residentialAddress: string;
      isPrimaryContact: boolean;
      isBillingRecipient: boolean;
      hasCustody: boolean;
    };
  }>({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: 'MALE',
    dateOfBirth: '',
    stateOfOrigin: 'Lagos',
    lga: 'Ikeja',
    nationality: 'Nigerian',
    residentialAddress: '',
    allergies: '',
    appliedClassLevelId: '',
    campusId: '',
    previousSchoolName: '',
    previousSchoolClass: '',
    guardian: {
      firstName: '',
      lastName: '',
      relationship: 'FATHER',
      phonePrimary: '',
      phoneSecondary: '',
      email: '',
      occupation: '',
      residentialAddress: '',
      isPrimaryContact: true,
      isBillingRecipient: true,
      hasCustody: true,
    },
  });

  // Load public academic configuration
  React.useEffect(() => {
    async function fetchConfig() {
      const res = await getPublicSchoolConfigAction();
      if (res.success && res.data) {
        setAcademicConfig(res.data);
        if (res.data.classLevels.length > 0) {
          setFormData((prev) => ({
            ...prev,
            appliedClassLevelId: prev.appliedClassLevelId || res.data!.classLevels[0].id,
            campusId: prev.campusId || res.data!.campuses[0]?.id || 'cmp_lagos_main',
          }));
        }
      }
    }
    fetchConfig();
  }, []);

  const handleCopyRef = () => {
    if (!submissionSuccess) return;
    navigator.clipboard.writeText(submissionSuccess.applicationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMsg('Student first and last names are mandatory.');
      return false;
    }
    if (!formData.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      setErrorMsg('Please specify a valid Date of Birth (YYYY-MM-DD).');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.appliedClassLevelId) {
      setErrorMsg('Please choose the applied class level.');
      return false;
    }
    if (!formData.campusId) {
      setErrorMsg('Please choose the desired campus.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!formData.guardian.firstName.trim() || !formData.guardian.lastName.trim()) {
      setErrorMsg('Guardian first and last names are mandatory.');
      return false;
    }
    if (!formData.guardian.phonePrimary.trim() || formData.guardian.phonePrimary.length < 7) {
      setErrorMsg('Please provide a valid primary contact phone number.');
      return false;
    }
    if (!formData.guardian.email.trim() || !formData.guardian.email.includes('@')) {
      setErrorMsg('Please provide a valid guardian email address for notices.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;
    setSubmitting(true);
    setErrorMsg(null);

    const schoolId = academicConfig?.school.id || '11111111-1111-1111-1111-111111111111';

    const payload: ApplicationSubmissionInput = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName.trim() || undefined,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      appliedClassLevelId: formData.appliedClassLevelId,
      campusId: formData.campusId,
      stateOfOrigin: formData.stateOfOrigin.trim() || undefined,
      lga: formData.lga.trim() || undefined,
      nationality: formData.nationality.trim() || 'Nigerian',
      residentialAddress: formData.residentialAddress.trim() || undefined,
      allergies: formData.allergies.trim() || undefined,
      previousSchoolName: formData.previousSchoolName.trim() || undefined,
      previousSchoolClass: formData.previousSchoolClass.trim() || undefined,
      guardian: {
        firstName: formData.guardian.firstName.trim(),
        lastName: formData.guardian.lastName.trim(),
        relationship: formData.guardian.relationship,
        phonePrimary: formData.guardian.phonePrimary.trim(),
        phoneSecondary: formData.guardian.phoneSecondary.trim() || undefined,
        email: formData.guardian.email.trim(),
        occupation: formData.guardian.occupation.trim() || undefined,
        residentialAddress: formData.guardian.residentialAddress.trim() || undefined,
        isPrimaryContact: formData.guardian.isPrimaryContact,
        isBillingRecipient: formData.guardian.isBillingRecipient,
        hasCustody: formData.guardian.hasCustody,
      },
    };

    const res = await submitPublicApplicationAction(schoolId, payload);
    setSubmitting(false);

    if (res.success && res.data) {
      setSubmissionSuccess(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to submit application. Please review form entries.');
    }
  };

  // Success view
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Institutional Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Building className="h-3.5 w-3.5" />
              {academicConfig?.school.name || "King's College Lagos"}
            </div>
            <h1 className="text-2xl font-black text-navy-950">
              Admissions Application Submitted
            </h1>
            <p className="text-sm text-slate-500">
              Academic Session {academicConfig?.activeSession.name || '2026/2027'}
            </p>
          </div>

          <Card className="border-emerald-200 shadow-institutional overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center space-y-2">
              <div className="mx-auto h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Application Received Successfully!</h2>
              <p className="text-xs text-emerald-100 max-w-md mx-auto">
                Your admission dossier has been officially registered with the academic registry. Please retain your reference number below.
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Application Number Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Official Application Reference Number
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-navy-950 tracking-wider">
                  {submissionSuccess.applicationNumber}
                </div>
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    leftIcon={<Copy className="h-3.5 w-3.5" />}
                    onClick={handleCopyRef}
                  >
                    {copied ? 'Copied to Clipboard!' : 'Copy Reference Number'}
                  </Button>
                </div>
              </div>

              {/* Summary of Record */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y py-4">
                <div>
                  <span className="text-slate-400 block">Candidate Name</span>
                  <strong className="text-slate-900 text-sm">
                    {submissionSuccess.firstName} {submissionSuccess.middleName ? `${submissionSuccess.middleName} ` : ''}{submissionSuccess.lastName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Applied Class Level</span>
                  <strong className="text-slate-900 text-sm">
                    {submissionSuccess.appliedClassLevelName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Primary Guardian</span>
                  <span className="text-slate-800">
                    {submissionSuccess.guardian.firstName} {submissionSuccess.guardian.lastName} ({submissionSuccess.guardian.relationship})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Guardian Phone / Email</span>
                  <span className="text-slate-800">
                    {submissionSuccess.guardian.phonePrimary} • {submissionSuccess.guardian.email}
                  </span>
                </div>
              </div>

              {/* Next Steps Roadmap */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  What Happens Next?
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <p>
                      <strong className="text-slate-900">Entrance Examination & Interview Schedule:</strong> You will receive an SMS and email notification with your child's assessment date and examination timetable.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <p>
                      <strong className="text-slate-900">Score Evaluation & Offer Letter:</strong> The admissions board evaluates scores based on a 70% exam and 30% interview composite rubric before issuing formal conditional letters.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <p>
                      <strong className="text-slate-900">Enrollment & Classroom Allocation:</strong> Upon offer acceptance, the candidate is automatically assigned an official admission number and registered into their class arm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => window.print()}
                >
                  Print Slip
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setCurrentStep(1);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      middleName: '',
                      gender: 'MALE',
                      dateOfBirth: '',
                      stateOfOrigin: 'Lagos',
                      lga: 'Ikeja',
                      nationality: 'Nigerian',
                      residentialAddress: '',
                      allergies: '',
                      appliedClassLevelId: academicConfig?.classLevels[0]?.id || '',
                      campusId: academicConfig?.campuses[0]?.id || 'cmp_lagos_main',
                      previousSchoolName: '',
                      previousSchoolClass: '',
                      guardian: {
                        firstName: '',
                        lastName: '',
                        relationship: 'FATHER',
                        phonePrimary: '',
                        phoneSecondary: '',
                        email: '',
                        occupation: '',
                        residentialAddress: '',
                        isPrimaryContact: true,
                        isBillingRecipient: true,
                        hasCustody: true,
                      },
                    });
                  }}
                >
                  Submit Another Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Institutional Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-bold">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span>SchoolOS Prospective Admissions Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
            {academicConfig?.school.name || "King's College Lagos"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Online student application for the {academicConfig?.activeSession.name || '2026/2027'} academic session. Please provide accurate biodata and guardian details.
          </p>
        </div>

        {/* Multi-step progress indicator */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              className={`p-2 rounded-lg font-bold transition-colors ${
                currentStep === 1
                  ? 'bg-navy-950 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-400'
              }`}
            >
              1. Student Biodata
            </div>
            <div
              className={`p-2 rounded-lg font-bold transition-colors ${
                currentStep === 2
                  ? 'bg-navy-950 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-400'
              }`}
            >
              2. Class & Campus
            </div>
            <div
              className={`p-2 rounded-lg font-bold transition-colors ${
                currentStep === 3
                  ? 'bg-navy-950 text-white'
                  : currentStep > 3
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-400'
              }`}
            >
              3. Guardian Details
            </div>
            <div
              className={`p-2 rounded-lg font-bold transition-colors ${
                currentStep === 4
                  ? 'bg-navy-950 text-white'
                  : 'text-slate-400'
              }`}
            >
              4. Review & Submit
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <Alert type="error" title="Form Validation Notice">
            {errorMsg}
          </Alert>
        )}

        {/* Step Forms */}
        <Card className="shadow-institutional">
          {/* STEP 1: Student Information */}
          {currentStep === 1 && (
            <CardContent className="p-6 space-y-4">
              <div className="border-b pb-3">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Candidate Personal Information
                </CardTitle>
                <CardDescription>
                  Enter the prospective student's legal name, gender, and birth chronology.
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Chukwuma"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Last Name (Surname) *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Adeleke"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Middle Name (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. David"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Date of Birth (YYYY-MM-DD) *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    State of Origin
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Lagos"
                    value={formData.stateOfOrigin}
                    onChange={(e) => setFormData({ ...formData, stateOfOrigin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Local Government Area (LGA)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ikeja"
                    value={formData.lga}
                    onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nationality
                  </label>
                  <Input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Residential Address
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                />
              </div>
            </CardContent>
          )}

          {/* STEP 2: Academic Program & Campus Selection */}
          {currentStep === 2 && (
            <CardContent className="p-6 space-y-4">
              <div className="border-b pb-3">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-600" />
                  Class Level & Campus Preferences
                </CardTitle>
                <CardDescription>
                  Select the target academic level and preferred institutional campus.
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Class Level *
                  </label>
                  <select
                    value={formData.appliedClassLevelId}
                    onChange={(e) => setFormData({ ...formData, appliedClassLevelId: e.target.value })}
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {academicConfig?.classLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.section})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Curriculum tailored according to Nigerian NERDC specifications.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Preferred Campus *
                  </label>
                  <select
                    value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {academicConfig?.campuses.map((cmp) => (
                      <option key={cmp.id} value={cmp.id}>
                        {cmp.name} ({cmp.city}) {cmp.isMain ? '— Main Campus' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  Previous Educational History (Optional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Last School Attended
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Corona Primary School"
                      value={formData.previousSchoolName}
                      onChange={(e) => setFormData({ ...formData, previousSchoolName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Last Class Completed
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Primary 6"
                      value={formData.previousSchoolClass}
                      onChange={(e) => setFormData({ ...formData, previousSchoolClass: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 3: Guardian Details */}
          {currentStep === 3 && (
            <CardContent className="p-6 space-y-4">
              <div className="border-b pb-3">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Primary Guardian Information
                </CardTitle>
                <CardDescription>
                  Contact details for billing, attendance alerts, and entrance examination scheduling.
                </CardDescription>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guardian First Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Babatunde"
                    value={formData.guardian.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, firstName: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guardian Last Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Adeleke"
                    value={formData.guardian.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, lastName: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Relationship *
                  </label>
                  <select
                    value={formData.guardian.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: {
                          ...formData.guardian,
                          relationship: e.target.value as any,
                        },
                      })
                    }
                    className="flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Legal Guardian</option>
                    <option value="SPONSOR">Sponsor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Phone Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="+234 803 123 4567"
                    value={formData.guardian.phonePrimary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, phonePrimary: e.target.value },
                      })
                    }
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Used for SMS alerts and exam notices
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="guardian@example.com"
                    value={formData.guardian.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, email: e.target.value },
                      })
                    }
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Offer letters and fee invoices will be sent here
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Occupation (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Civil Servant / Chartered Accountant"
                    value={formData.guardian.occupation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, occupation: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Secondary Phone (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. +234 802 987 6543"
                    value={formData.guardian.phoneSecondary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardian: { ...formData.guardian, phoneSecondary: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 4: Medical Flags & Review Submission */}
          {currentStep === 4 && (
            <CardContent className="p-6 space-y-5">
              <div className="border-b pb-3">
                <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Health Flags & Final Review
                </CardTitle>
                <CardDescription>
                  Confirm all details before submitting your application to the school board.
                </CardDescription>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medical Conditions, Chronic Illnesses or Allergies
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Asthmatic, Penicillin allergy (or leave empty if none)"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              {/* Dossier Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                  Application Dossier Overview
                </span>
                <div className="grid grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">Candidate:</span>
                    <strong>{formData.firstName} {formData.middleName} {formData.lastName} ({formData.gender})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth:</span>
                    <strong>{formData.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Applied Class:</span>
                    <strong>
                      {academicConfig?.classLevels.find((l) => l.id === formData.appliedClassLevelId)?.name || formData.appliedClassLevelId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Selected Campus:</span>
                    <strong>
                      {academicConfig?.campuses.find((c) => c.id === formData.campusId)?.name || formData.campusId}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Guardian:</span>
                    <strong>{formData.guardian.firstName} {formData.guardian.lastName} ({formData.guardian.relationship})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Contact:</span>
                    <strong>{formData.guardian.phonePrimary} • {formData.guardian.email}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  By submitting this application, you certify that all information provided is true and accurate. The school registrar will contact you via email and SMS with entrance examination details.
                </span>
              </div>
            </CardContent>
          )}

          {/* Stepper Footer Controls */}
          <CardFooter className="bg-slate-50 border-t p-4 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                disabled={submitting}
              >
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-navy-950 hover:bg-navy-900 text-white font-bold"
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={submitting}
                leftIcon={<Sparkles className="h-4 w-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6"
              >
                Submit Official Application
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
