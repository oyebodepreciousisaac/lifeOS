'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Input,
  Alert,
} from '@school-os/ui';
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Clock,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  getAcademicConfigAction,
  saveCampusesAction,
  saveAcademicSessionAction,
  saveClassStructureAction,
  saveSubjectCatalogAction,
  saveOperationalRulesAction,
} from '../../actions/academic-setup';
import {
  AcademicConfiguration,
  CampusItem,
  ClassLevelItem,
  SubjectItem,
  SchoolSection,
} from '../../../lib/academic/academic-types';

export default function AcademicSetupAdminPage() {
  const [activeTab, setActiveTab] = React.useState<
    'campuses' | 'calendar' | 'classes' | 'subjects' | 'rules'
  >('classes');
  const [config, setConfig] = React.useState<AcademicConfiguration | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Section filter for classes
  const [selectedSection, setSelectedSection] = React.useState<string>('ALL');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAcademicConfigAction();
      if (res.success && res.data) {
        setConfig(res.data);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to load school academic structure.',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !config) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-navy-900 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-600">Loading Academic Setup & Structure...</p>
      </div>
    );
  }

  const filteredLevels = config.classLevels.filter((lvl) => {
    if (selectedSection === 'ALL') return true;
    return lvl.section === selectedSection;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-navy-900" />
            Institutional Academic Structure & Setup
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campuses, manage academic calendars and terms, class hierarchy, and the institutional subject catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/setup">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Launch Setup Wizard
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type === 'error' ? 'error' : 'success'} title={feedback.type === 'error' ? 'Error' : 'Notice'}>
          {feedback.message}
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'classes'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          Classes & Arms ({config.classLevels.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'subjects'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Subjects Catalog ({config.subjects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Session & Terms ({config.activeSession?.name || 'None'})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('campuses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'campuses'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Campuses ({config.campuses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Clock className="h-4 w-4" />
          Bell Schedule & Rules
        </button>
      </div>

      {/* TAB 1: Classes & Arms */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Section:</span>
              {(['ALL', 'EARLY_YEARS', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                    selectedSection === sec
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sec.replace('_', ' ')}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => {
                const name = prompt('Enter new class level name (e.g. JSS 4 or Year 7):');
                if (name && name.trim()) {
                  const newLevel: ClassLevelItem = {
                    id: `lvl_${Date.now()}`,
                    schoolId: config.school.id,
                    campusId: config.campuses[0]?.id || 'main',
                    name: name.trim(),
                    levelOrder: config.classLevels.length + 1,
                    section: 'JUNIOR_SECONDARY',
                    arms: [{ id: `arm_${Date.now()}`, levelId: `lvl_${Date.now()}`, name: 'Gold', capacity: 35 }],
                  };
                  const updated = [...config.classLevels, newLevel];
                  setConfig({ ...config, classLevels: updated });
                  saveClassStructureAction(updated);
                  setFeedback({ type: 'success', message: `Class level "${name}" added.` });
                }
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Class Level
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLevels.map((level, lIdx) => (
              <Card key={level.id || lIdx} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy-950">{level.name}</CardTitle>
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
                  </div>
                  <CardDescription className="text-xs">Level Order: #{level.levelOrder}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Active Class Arms ({level.arms.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {level.arms.map((arm, aIdx) => (
                        <span
                          key={arm.id || aIdx}
                          className="px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200"
                        >
                          {arm.name} <span className="text-slate-400 font-normal">({arm.capacity} cap)</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const armName = prompt(`Enter new arm name for ${level.name} (e.g. Silver, Diamond):`);
                        if (armName && armName.trim()) {
                          const nextLevels = [...config.classLevels];
                          const idx = nextLevels.findIndex((l) => l.id === level.id);
                          if (idx >= 0) {
                            nextLevels[idx].arms.push({
                              id: `arm_${Date.now()}`,
                              levelId: level.id,
                              name: armName.trim(),
                              capacity: 35,
                            });
                            setConfig({ ...config, classLevels: nextLevels });
                            saveClassStructureAction(nextLevels);
                            setFeedback({ type: 'success', message: `Arm "${armName}" added to ${level.name}.` });
                          }
                        }
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Arm
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove class level "${level.name}"?`)) {
                          const nextLevels = config.classLevels.filter((l) => l.id !== level.id);
                          setConfig({ ...config, classLevels: nextLevels });
                          saveClassStructureAction(nextLevels);
                          setFeedback({ type: 'success', message: `Class level "${level.name}" removed.` });
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Subjects Catalog */}
      {activeTab === 'subjects' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Institutional Curriculum Subject Catalog</CardTitle>
                <CardDescription>
                  Core and elective subjects configured for student timetables, grade entries, and report cards.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const name = prompt('Subject Name (e.g. Technical Drawing):');
                  const code = prompt('Subject Code (e.g. TD):');
                  if (name && code) {
                    const newSub: SubjectItem = {
                      id: `sub_${Date.now()}`,
                      schoolId: config.school.id,
                      name: name.trim(),
                      code: code.trim().toUpperCase(),
                      department: 'Vocational',
                      isElective: true,
                      applicableSections: ['SENIOR_SECONDARY'],
                    };
                    const updated = [...config.subjects, newSub];
                    setConfig({ ...config, subjects: updated });
                    saveSubjectCatalogAction(updated);
                    setFeedback({ type: 'success', message: `Subject "${name}" added.` });
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applicable Sections</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.subjects.map((sub, sIdx) => (
                  <TableRow key={sub.id || sIdx}>
                    <TableCell className="font-mono font-bold text-navy-950">{sub.code}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{sub.name}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sub.department}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub.isElective ? (
                        <Badge variant="pending">Elective</Badge>
                      ) : (
                        <Badge variant="paid">Compulsory</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {sub.applicableSections.map((s) => s.replace('_', ' ')).join(', ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.subjects.filter((_, i) => i !== sIdx);
                          setConfig({ ...config, subjects: updated });
                          saveSubjectCatalogAction(updated);
                          setFeedback({ type: 'success', message: `Subject "${sub.name}" removed.` });
                        }}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Academic Session & Terms */}
      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Calendar & Term Schedules</CardTitle>
            <CardDescription>
              Current session dates, statutory terms, and active term switching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Academic Session</span>
                <h3 className="text-xl font-extrabold text-navy-950">{config.activeSession.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Resumption: <strong>{config.activeSession.startDate}</strong> &bull; Vacation:{' '}
                  <strong>{config.activeSession.endDate}</strong>
                </p>
              </div>
              <Badge variant="paid">Session Active</Badge>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Term Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {config.activeSession.terms.map((term, tIdx) => (
                  <div
                    key={term.id || tIdx}
                    className={`p-4 rounded-xl border ${
                      term.isCurrent
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-200 bg-white'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-navy-950">{term.name}</h5>
                      {term.isCurrent ? (
                        <Badge variant="paid">Current Term</Badge>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const nextTerms = config.activeSession.terms.map((t, i) => ({
                              ...t,
                              isCurrent: i === tIdx,
                            }));
                            const updatedSession = { ...config.activeSession, terms: nextTerms };
                            setConfig({ ...config, activeSession: updatedSession });
                            saveAcademicSessionAction(updatedSession);
                            setFeedback({ type: 'success', message: `${term.name} set as current active term.` });
                          }}
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          Set Current
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                      <div>Start: <strong>{term.startDate}</strong></div>
                      <div>End: <strong>{term.endDate}</strong></div>
                      <div>Status: <strong>{term.isLocked ? 'Locked' : 'Open for marks & billing'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Campuses */}
      {activeTab === 'campuses' && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Campuses & Branches</CardTitle>
            <CardDescription>
              Registered branch locations belonging to this institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.campuses.map((campus) => (
                <div key={campus.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-navy-950 text-base">{campus.name}</h4>
                    {campus.isMain ? (
                      <Badge variant="paid">Main Campus</Badge>
                    ) : (
                      <Badge variant="neutral">Branch</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Code: <strong>{campus.code}</strong></div>
                    <div>Address: {campus.address}</div>
                    <div>Location: {campus.city}, {campus.state}, {campus.country}</div>
                    {campus.phone && <div>Contact: {campus.phone}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Operational Rules */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <CardTitle>Bell Schedule & Operational Thresholds</CardTitle>
            <CardDescription>
              Core time parameters governing daily timetable generation, period allocations, and lateness tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">School Bell / Resumption</span>
                <p className="text-xl font-bold text-navy-950 mt-1">{config.operationalRules.workingHoursStart}</p>
                <span className="text-[11px] text-slate-400">Morning assembly starts</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">School Dismissal</span>
                <p className="text-xl font-bold text-navy-950 mt-1">{config.operationalRules.workingHoursEnd}</p>
                <span className="text-[11px] text-slate-400">End of instructional day</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">Lateness Cutoff</span>
                <p className="text-xl font-bold text-amber-700 mt-1">{config.operationalRules.latenessCutoff}</p>
                <span className="text-[11px] text-slate-400">Arrivals after flag LATE</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">Period Duration</span>
                <p className="text-xl font-bold text-navy-950 mt-1">{config.operationalRules.periodDurationMinutes} mins</p>
                <span className="text-[11px] text-slate-400">Per instructional slot</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">Assembly Duration</span>
                <p className="text-xl font-bold text-navy-950 mt-1">{config.operationalRules.assemblyDurationMinutes} mins</p>
                <span className="text-[11px] text-slate-400">Morning devotion</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-semibold text-slate-500">Lunch Break</span>
                <p className="text-xl font-bold text-navy-950 mt-1">{config.operationalRules.breakDurationMinutes} mins</p>
                <span className="text-[11px] text-slate-400">Mid-day break</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
