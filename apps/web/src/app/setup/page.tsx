'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  Alert,
} from '@school-os/ui';
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import {
  getAcademicConfigAction,
  saveSchoolProfileAction,
  saveCampusesAction,
  saveAcademicSessionAction,
  saveClassStructureAction,
  saveSubjectCatalogAction,
  saveOperationalRulesAction,
  applyNigerianPresetAction,
  completeOnboardingAction,
} from '../actions/academic-setup';
import {
  AcademicConfiguration,
  CampusItem,
  ClassLevelItem,
  SubjectItem,
  SchoolSection,
} from '../../lib/academic/academic-types';

const STEPS = [
  { id: 1, title: 'School Profile', description: 'Institutional identity & contacts', icon: Building2 },
  { id: 2, title: 'Campuses', description: 'Main & branch locations', icon: GraduationCap },
  { id: 3, title: 'Academic Session', description: 'Session & term calendars', icon: Calendar },
  { id: 4, title: 'Class Structure', description: 'Levels, sections & arms', icon: Layers },
  { id: 5, title: 'Subject Catalog', description: 'Subjects & departments', icon: BookOpen },
  { id: 6, title: 'Operation Rules', description: 'Bell schedule & hours', icon: Clock },
];

export default function SchoolSetupWizardPage() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Configuration State
  const [config, setConfig] = React.useState<AcademicConfiguration | null>(null);

  // Form States for step editing
  const [schoolProfile, setSchoolProfile] = React.useState({
    name: '',
    slug: '',
    officialCode: '',
    motto: '',
    contactEmail: '',
    contactPhone: '',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    address: '',
    city: '',
    state: '',
  });

  const [campuses, setCampuses] = React.useState<CampusItem[]>([]);
  const [sessionData, setSessionData] = React.useState({
    name: '2026/2027',
    startDate: '2026-09-14',
    endDate: '2027-07-23',
    isCurrent: true,
    terms: [
      { id: 't1', name: '1st Term', startDate: '2026-09-14', endDate: '2026-12-18', isCurrent: true, isLocked: false },
      { id: 't2', name: '2nd Term', startDate: '2027-01-11', endDate: '2027-04-09', isCurrent: false, isLocked: false },
      { id: 't3', name: '3rd Term', startDate: '2027-04-26', endDate: '2027-07-23', isCurrent: false, isLocked: false },
    ],
  });

  const [classLevels, setClassLevels] = React.useState<ClassLevelItem[]>([]);
  const [subjects, setSubjects] = React.useState<SubjectItem[]>([]);
  const [operationalRules, setOperationalRules] = React.useState({
    workingHoursStart: '07:45',
    workingHoursEnd: '15:30',
    periodDurationMinutes: 40,
    assemblyDurationMinutes: 20,
    breakDurationMinutes: 30,
    latenessCutoff: '08:15',
    daysPerWeek: 5,
  });

  // Load existing configuration on mount
  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAcademicConfigAction();
      if (res.success && res.data) {
        const d = res.data;
        setConfig(d);
        setSchoolProfile({
          name: d.school.name || '',
          slug: d.school.slug || '',
          officialCode: d.school.officialCode || '',
          motto: d.school.motto || '',
          contactEmail: d.school.contactEmail || '',
          contactPhone: d.school.contactPhone || '',
          currency: d.school.currency || 'NGN',
          timezone: d.school.timezone || 'Africa/Lagos',
          address: d.school.address || '',
          city: d.school.city || '',
          state: d.school.state || '',
        });
        setCampuses(d.campuses);
        if (d.activeSession) {
          setSessionData({
            name: d.activeSession.name,
            startDate: d.activeSession.startDate,
            endDate: d.activeSession.endDate,
            isCurrent: d.activeSession.isCurrent,
            terms: d.activeSession.terms,
          });
        }
        setClassLevels(d.classLevels);
        setSubjects(d.subjects);
        setOperationalRules(d.operationalRules);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to load configuration. Make sure you are logged in.',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  // Step 1: Save Profile
  async function handleSaveProfile() {
    setSaving(true);
    setFeedback(null);
    const res = await saveSchoolProfileAction(schoolProfile);
    setSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'School profile updated successfully.' });
      setCurrentStep(2);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  }

  // Step 2: Save Campuses
  async function handleSaveCampuses() {
    setSaving(true);
    setFeedback(null);
    const res = await saveCampusesAction(campuses);
    setSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Campuses configured successfully.' });
      setCurrentStep(3);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update campuses.' });
    }
  }

  // Step 3: Save Academic Session & Terms
  async function handleSaveSession() {
    setSaving(true);
    setFeedback(null);
    const res = await saveAcademicSessionAction(sessionData);
    setSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Academic session and terms configured successfully.' });
      setCurrentStep(4);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update academic session.' });
    }
  }

  // Step 4: Save Class Structure
  async function handleSaveClassStructure() {
    setSaving(true);
    setFeedback(null);
    const res = await saveClassStructureAction(classLevels);
    setSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Class levels and arms configured successfully.' });
      setCurrentStep(5);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update class structure.' });
    }
  }

  // Step 5: Save Subject Catalog
  async function handleSaveSubjects() {
    setSaving(true);
    setFeedback(null);
    const res = await saveSubjectCatalogAction(subjects);
    setSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Subject catalog configured successfully.' });
      setCurrentStep(6);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update subject catalog.' });
    }
  }

  // Step 6: Save Rules & Complete Wizard
  async function handleSaveRulesAndFinish() {
    setSaving(true);
    setFeedback(null);
    const rulesRes = await saveOperationalRulesAction(operationalRules);
    if (!rulesRes.success) {
      setSaving(false);
      setFeedback({ type: 'error', message: rulesRes.error || 'Failed to save operational rules.' });
      return;
    }
    const finishRes = await completeOnboardingAction();
    setSaving(false);
    if (finishRes.success) {
      setFeedback({ type: 'success', message: '🎉 Institutional setup complete! Ready for admissions and enrollment.' });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: finishRes.error || 'Failed to complete onboarding.' });
    }
  }

  // Preset Applicator
  async function handleApplyPreset() {
    setSaving(true);
    setFeedback(null);
    const res = await applyNigerianPresetAction();
    setSaving(false);
    if (res.success && res.data) {
      setClassLevels(res.data.classLevels);
      setSubjects(res.data.subjects);
      setFeedback({
        type: 'success',
        message: '⚡ Nigerian National Curriculum (NERDC) presets applied! 14 class levels and 20 core subjects loaded.',
      });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to apply preset.' });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-navy-900 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-600">Loading SchoolOS Configuration Engine...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-navy-950 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-navy-900">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Module 1: Institutional Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              School Setup & Academic Configuration
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Configure campuses, academic terms, class arms, subjects, and operational rules before student enrollment and fee collection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyPreset}
              disabled={saving}
              className="bg-navy-900/80 border-navy-700 text-slate-200 hover:text-white hover:bg-navy-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
              Load NERDC Curriculum Preset
            </Button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-4 mt-8 pt-6 border-t border-navy-900">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-white'
                    : isCompleted
                    ? 'bg-navy-900/60 text-emerald-400 hover:bg-navy-900'
                    : 'bg-navy-900/20 text-slate-400 hover:bg-navy-900/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span>Step {step.id}</span>
                </div>
                <span className="text-xs font-medium line-clamp-1">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type === 'error' ? 'error' : 'success'} title={feedback.type === 'error' ? 'Configuration Notice' : 'Success'}>
          {feedback.message}
        </Alert>
      )}

      {/* Step 1: School Profile */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-navy-900" />
              Step 1: Institutional Profile & Branding
            </CardTitle>
            <CardDescription>
              Official registration details, motto, contact credentials, and statutory information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official School Name"
                value={schoolProfile.name}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                placeholder="e.g. Meadows Model Academy"
                required
              />
              <Input
                label="School Web Address (URL Subdomain)"
                value={schoolProfile.slug}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, slug: e.target.value })}
                placeholder="e.g. meadows-academy"
                required
              />
              <Input
                label="Government / Official Registration Code"
                value={schoolProfile.officialCode}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, officialCode: e.target.value })}
                placeholder="e.g. KCL-FED-1909"
              />
              <Input
                label="Institutional Motto"
                value={schoolProfile.motto}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, motto: e.target.value })}
                placeholder="e.g. Floreat Collegium"
              />
              <Input
                label="Primary Contact Email"
                type="email"
                value={schoolProfile.contactEmail}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, contactEmail: e.target.value })}
                placeholder="admin@school.sch.ng"
                required
              />
              <Input
                label="Primary Contact Phone (Nigerian Format)"
                value={schoolProfile.contactPhone}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, contactPhone: e.target.value })}
                placeholder="+234 802 345 6789"
                required
              />
              <Input
                label="Operational Currency"
                value={schoolProfile.currency}
                disabled
                helperText="Fixed to Nigerian Naira (NGN)"
              />
              <Input
                label="Timezone"
                value={schoolProfile.timezone}
                disabled
                helperText="Fixed to Africa/Lagos (GMT+1)"
              />
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Physical Headquarters Address</h3>
              <Input
                label="Street Address"
                value={schoolProfile.address}
                onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                placeholder="3 Catholic Mission Street, Lagos Island"
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City / LGA"
                  value={schoolProfile.city}
                  onChange={(e) => setSchoolProfile({ ...schoolProfile, city: e.target.value })}
                  placeholder="Lagos Island"
                  required
                />
                <Input
                  label="State"
                  value={schoolProfile.state}
                  onChange={(e) => setSchoolProfile({ ...schoolProfile, state: e.target.value })}
                  placeholder="Lagos"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button onClick={handleSaveProfile} isLoading={saving}>
                Save & Proceed to Campuses
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Campuses */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-navy-900" />
                  Step 2: Campuses & Physical Branches
                </CardTitle>
                <CardDescription>
                  Configure multi-campus facilities, Annexes, or Early Years branches with independent addresses.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCampuses([
                    ...campuses,
                    {
                      id: `cmp_${Date.now()}`,
                      schoolId: config?.school.id || '',
                      name: `New Campus Branch`,
                      code: `ANNEX-${campuses.length + 1}`,
                      address: '',
                      city: schoolProfile.city,
                      state: schoolProfile.state,
                      country: 'Nigeria',
                      isMain: false,
                    },
                  ])
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Campus
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {campuses.map((campus, idx) => (
                <div key={campus.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-navy-100 text-navy-950">
                        Campus #{idx + 1}
                      </span>
                      {campus.isMain && (
                        <Badge variant="paid">Main Campus</Badge>
                      )}
                    </div>
                    {campuses.length > 1 && !campus.isMain && (
                      <button
                        type="button"
                        onClick={() => setCampuses(campuses.filter((_, i) => i !== idx))}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Campus Name"
                      value={campus.name}
                      onChange={(e) => {
                        const next = [...campuses];
                        next[idx].name = e.target.value;
                        setCampuses(next);
                      }}
                      placeholder="e.g. Main Campus or Annex"
                      required
                    />
                    <Input
                      label="Branch Code"
                      value={campus.code || ''}
                      onChange={(e) => {
                        const next = [...campuses];
                        next[idx].code = e.target.value;
                        setCampuses(next);
                      }}
                      placeholder="e.g. MAIN"
                    />
                    <Input
                      label="Contact Phone"
                      value={campus.phone || ''}
                      onChange={(e) => {
                        const next = [...campuses];
                        next[idx].phone = e.target.value;
                        setCampuses(next);
                      }}
                      placeholder="+234 1 234 5678"
                    />
                  </div>

                  <Input
                    label="Physical Address"
                    value={campus.address}
                    onChange={(e) => {
                      const next = [...campuses];
                      next[idx].address = e.target.value;
                      setCampuses(next);
                    }}
                    placeholder="Physical location street address"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="City / Area"
                      value={campus.city}
                      onChange={(e) => {
                        const next = [...campuses];
                        next[idx].city = e.target.value;
                        setCampuses(next);
                      }}
                      placeholder="e.g. Lagos Island"
                      required
                    />
                    <Input
                      label="State"
                      value={campus.state}
                      onChange={(e) => {
                        const next = [...campuses];
                        next[idx].state = e.target.value;
                        setCampuses(next);
                      }}
                      placeholder="e.g. Lagos"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSaveCampuses} isLoading={saving}>
                Save & Proceed to Academic Session
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Academic Session & Terms */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-navy-900" />
              Step 3: Academic Session & Term Boundaries
            </CardTitle>
            <CardDescription>
              Define the active school year and 3 statutory terms (1st Term, 2nd Term, 3rd Term).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <Input
                label="Academic Session Name (YYYY/YYYY)"
                value={sessionData.name}
                onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
                placeholder="2026/2027"
                required
              />
              <Input
                label="Session Resumption Date"
                type="date"
                value={sessionData.startDate}
                onChange={(e) => setSessionData({ ...sessionData, startDate: e.target.value })}
                required
              />
              <Input
                label="Session Vacation Date"
                type="date"
                value={sessionData.endDate}
                onChange={(e) => setSessionData({ ...sessionData, endDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Term Schedule & Active Term</h3>
              {sessionData.terms.map((term, tIdx) => (
                <div key={term.id || tIdx} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-navy-950">{term.name}</span>
                      {term.isCurrent ? (
                        <Badge variant="paid">Active Current Term</Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const next = sessionData.terms.map((t, i) => ({
                              ...t,
                              isCurrent: i === tIdx,
                            }));
                            setSessionData({ ...sessionData, terms: next });
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 underline"
                        >
                          Set as Current
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:w-80">
                    <Input
                      label="Start Date"
                      type="date"
                      value={term.startDate}
                      onChange={(e) => {
                        const next = [...sessionData.terms];
                        next[tIdx].startDate = e.target.value;
                        setSessionData({ ...sessionData, terms: next });
                      }}
                      required
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={term.endDate}
                      onChange={(e) => {
                        const next = [...sessionData.terms];
                        next[tIdx].endDate = e.target.value;
                        setSessionData({ ...sessionData, terms: next });
                      }}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSaveSession} isLoading={saving}>
                Save & Proceed to Class Structure
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Class Structure */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-navy-900" />
                  Step 4: School Sections, Class Levels & Arms
                </CardTitle>
                <CardDescription>
                  Configure dynamic classes (Creche to SS3) and arms with student capacity guards.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPreset}
                  disabled={saving}
                  className="text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Load Standard NERDC Hierarchy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {classLevels.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-4">
                <Layers className="h-10 w-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Class Levels Configured</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "Load Standard NERDC Hierarchy" to immediately generate 14 levels (Nursery, Primary, JSS, SSS) or add them manually.
                  </p>
                </div>
                <Button onClick={handleApplyPreset} isLoading={saving}>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Load 14 Standard Levels Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {classLevels.map((level, lIdx) => (
                  <div key={level.id || lIdx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-950">{level.name}</span>
                        <Badge
                          variant={
                            level.section === 'SENIOR_SECONDARY'
                              ? 'approved'
                              : level.section === 'JUNIOR_SECONDARY'
                              ? 'neutral'
                              : level.section === 'PRIMARY'
                              ? 'paid'
                              : 'pending'
                          }
                        >
                          {level.section.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">Order: #{level.levelOrder}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setClassLevels(classLevels.filter((_, i) => i !== lIdx))}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Level
                      </button>
                    </div>

                    {/* Arms list */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 mr-2">Arms & Capacities:</span>
                      {level.arms.map((arm, aIdx) => (
                        <div key={arm.id || aIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-800 border border-slate-200">
                          <span>{arm.name}</span>
                          <span className="text-[10px] text-slate-400">({arm.capacity} cap)</span>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const armName = prompt('Enter arm name (e.g. A, B, C or JSS1A):');
                          if (armName && armName.trim()) {
                            const next = [...classLevels];
                            next[lIdx].arms.push({
                              id: `arm_${Date.now()}`,
                              levelId: level.id,
                              name: armName.trim(),
                              capacity: 35,
                            });
                            setClassLevels(next);
                          }
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 ml-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Arm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSaveClassStructure} isLoading={saving} disabled={classLevels.length === 0}>
                Save & Proceed to Subject Catalog
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Subject Catalog */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-navy-900" />
                  Step 5: Institutional Subject Catalog
                </CardTitle>
                <CardDescription>
                  Define subjects, codes, departmental assignments, and elective designations.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = prompt('Subject Name (e.g. Further Mathematics):');
                  const code = prompt('Subject Code (e.g. FMTH):');
                  if (name && code) {
                    setSubjects([
                      ...subjects,
                      {
                        id: `sub_${Date.now()}`,
                        schoolId: config?.school.id || '',
                        name: name.trim(),
                        code: code.trim().toUpperCase(),
                        department: 'General',
                        isElective: false,
                        applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
                      },
                    ]);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subjects.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-4">
                <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Subjects Configured</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Load the standard NERDC subjects or create your custom departmental catalog.
                  </p>
                </div>
                <Button onClick={handleApplyPreset} isLoading={saving}>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Load Standard Subjects
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {subjects.map((sub, sIdx) => (
                  <div key={sub.id || sIdx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-navy-100 text-navy-950">
                          {sub.code}
                        </span>
                        {sub.isElective && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Elective
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubjects(subjects.filter((_, i) => i !== sIdx))}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{sub.name}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span>{sub.department}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...subjects];
                          next[sIdx].isElective = !next[sIdx].isElective;
                          setSubjects(next);
                        }}
                        className="text-[11px] font-medium text-navy-900 underline"
                      >
                        {sub.isElective ? 'Make Compulsory' : 'Make Elective'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSaveSubjects} isLoading={saving} disabled={subjects.length === 0}>
                Save & Proceed to Operational Rules
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Operational Rules & Finish */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-navy-900" />
              Step 6: School Working Hours & Bell Schedule
            </CardTitle>
            <CardDescription>
              Configure instructional period durations, assembly times, break rules, and lateness cutoffs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School Resumption / Bell Time (HH:MM)"
                value={operationalRules.workingHoursStart}
                onChange={(e) => setOperationalRules({ ...operationalRules, workingHoursStart: e.target.value })}
                placeholder="07:45"
                required
              />
              <Input
                label="School Dismissal Time (HH:MM)"
                value={operationalRules.workingHoursEnd}
                onChange={(e) => setOperationalRules({ ...operationalRules, workingHoursEnd: e.target.value })}
                placeholder="15:30"
                required
              />
              <Input
                label="Instructional Period Duration (Minutes)"
                type="number"
                value={operationalRules.periodDurationMinutes}
                onChange={(e) =>
                  setOperationalRules({ ...operationalRules, periodDurationMinutes: parseInt(e.target.value) || 40 })
                }
                required
              />
              <Input
                label="Morning Assembly / Devotion (Minutes)"
                type="number"
                value={operationalRules.assemblyDurationMinutes}
                onChange={(e) =>
                  setOperationalRules({ ...operationalRules, assemblyDurationMinutes: parseInt(e.target.value) || 20 })
                }
                required
              />
              <Input
                label="Mid-Day Lunch Break (Minutes)"
                type="number"
                value={operationalRules.breakDurationMinutes}
                onChange={(e) =>
                  setOperationalRules({ ...operationalRules, breakDurationMinutes: parseInt(e.target.value) || 30 })
                }
                required
              />
              <Input
                label="Lateness Cutoff Time (HH:MM)"
                value={operationalRules.latenessCutoff}
                onChange={(e) => setOperationalRules({ ...operationalRules, latenessCutoff: e.target.value })}
                placeholder="08:15"
                helperText="Students arriving after this time are automatically marked LATE"
                required
              />
            </div>

            {/* Ready to Finish Checklist */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Institutional Configuration Readiness Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                <div>✓ <strong>{campuses.length}</strong> Campus(es) Configured</div>
                <div>✓ <strong>{sessionData.name}</strong> Active Session</div>
                <div>✓ <strong>{classLevels.length}</strong> Class Levels Defined</div>
                <div>✓ <strong>{subjects.length}</strong> Curriculum Subjects</div>
                <div>✓ <strong>{operationalRules.periodDurationMinutes}m</strong> Period Duration</div>
                <div>✓ <strong>{operationalRules.latenessCutoff}</strong> Lateness Threshold</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button onClick={handleSaveRulesAndFinish} isLoading={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Complete Setup & Launch Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
