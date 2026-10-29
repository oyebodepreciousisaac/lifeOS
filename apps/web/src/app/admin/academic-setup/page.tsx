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
  X,
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

  // In-page form for adding new class level
  const [showAddClassForm, setShowAddClassForm] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState('');
  const [newClassSection, setNewClassSection] = React.useState<SchoolSection>('JUNIOR_SECONDARY');
  const [newClassInitialArm, setNewClassInitialArm] = React.useState('A');

  // Inline arm inputs for each class card
  const [cardArmInputs, setCardArmInputs] = React.useState<Record<string, string>>({});

  // In-page form for adding subject
  const [showAddSubjectForm, setShowAddSubjectForm] = React.useState(false);
  const [newSubjectName, setNewSubjectName] = React.useState('');
  const [newSubjectCode, setNewSubjectCode] = React.useState('');
  const [newSubjectDept, setNewSubjectDept] = React.useState('General Studies');

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
        <p className="text-sm font-semibold text-slate-600">Loading Academic Setup &amp; Structure...</p>
      </div>
    );
  }

  const filteredLevels = config.classLevels.filter((lvl) => {
    if (selectedSection === 'ALL') return true;
    return lvl.section === selectedSection;
  });

  // Handle Quick Arm Preset Application
  const handleApplyArmPreset = (style: 'LETTERS' | 'METALS' | 'GEMS' | 'COLORS' | 'STREAMS') => {
    const updated = config.classLevels.map((lvl) => {
      let armNames: string[] = [];
      if (style === 'LETTERS') {
        armNames = ['A', 'B', 'C'];
      } else if (style === 'METALS') {
        armNames = ['Gold', 'Silver', 'Bronze', 'Platinum'];
      } else if (style === 'GEMS') {
        armNames = ['Diamond', 'Emerald', 'Sapphire', 'Ruby'];
      } else if (style === 'COLORS') {
        armNames = ['Blue', 'Green', 'Red', 'Yellow'];
      } else if (style === 'STREAMS') {
        if (lvl.section === 'SENIOR_SECONDARY') {
          armNames = ['Science', 'Arts', 'Commercial'];
        } else {
          armNames = ['A', 'B', 'C'];
        }
      }

      const arms = armNames.slice(0, Math.max(2, lvl.arms.length)).map((name, i) => ({
        id: `arm_${lvl.id}_${i}_${Date.now()}`,
        levelId: lvl.id,
        name,
        capacity: 35,
      }));

      return { ...lvl, arms };
    });

    setConfig({ ...config, classLevels: updated });
    saveClassStructureAction(updated);
    setFeedback({
      type: 'success',
      message: `Applied ${style.toLowerCase()} arm naming preset across all class levels.`,
    });
  };

  // Add a new Class Level
  const handleAddClassLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newLevel: ClassLevelItem = {
      id: `lvl_${Date.now()}`,
      schoolId: config.school.id,
      campusId: config.campuses[0]?.id || 'main',
      name: newClassName.trim(),
      levelOrder: config.classLevels.length + 1,
      section: newClassSection,
      arms: [
        {
          id: `arm_${Date.now()}`,
          levelId: `lvl_${Date.now()}`,
          name: newClassInitialArm.trim() || 'A',
          capacity: 35,
        },
      ],
    };

    const updated = [...config.classLevels, newLevel];
    setConfig({ ...config, classLevels: updated });
    saveClassStructureAction(updated);
    setFeedback({ type: 'success', message: `Class level "${newClassName}" added successfully.` });
    setNewClassName('');
    setShowAddClassForm(false);
  };

  // Add an Arm to a specific Class Level
  const handleAddArm = (levelId: string, levelName: string) => {
    const armName = cardArmInputs[levelId]?.trim();
    if (!armName) return;

    const nextLevels = [...config.classLevels];
    const idx = nextLevels.findIndex((l) => l.id === levelId);
    if (idx >= 0) {
      nextLevels[idx].arms.push({
        id: `arm_${Date.now()}`,
        levelId,
        name: armName,
        capacity: 35,
      });
      setConfig({ ...config, classLevels: nextLevels });
      saveClassStructureAction(nextLevels);
      setFeedback({ type: 'success', message: `Arm "${armName}" added to ${levelName}.` });
      setCardArmInputs((prev) => ({ ...prev, [levelId]: '' }));
    }
  };

  // Remove an Arm from a Class Level
  const handleRemoveArm = (levelId: string, armId: string) => {
    const nextLevels = [...config.classLevels];
    const idx = nextLevels.findIndex((l) => l.id === levelId);
    if (idx >= 0) {
      if (nextLevels[idx].arms.length <= 1) {
        setFeedback({ type: 'error', message: 'A class must have at least one arm.' });
        return;
      }
      nextLevels[idx].arms = nextLevels[idx].arms.filter((a) => a.id !== armId);
      setConfig({ ...config, classLevels: nextLevels });
      saveClassStructureAction(nextLevels);
    }
  };

  // Remove Class Level
  const handleRemoveLevel = (levelId: string, levelName: string) => {
    const nextLevels = config.classLevels.filter((l) => l.id !== levelId);
    setConfig({ ...config, classLevels: nextLevels });
    saveClassStructureAction(nextLevels);
    setFeedback({ type: 'success', message: `Class level "${levelName}" removed.` });
  };

  // Add Subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;

    const newSub: SubjectItem = {
      id: `sub_${Date.now()}`,
      schoolId: config.school.id,
      name: newSubjectName.trim(),
      code: newSubjectCode.toUpperCase().trim(),
      department: newSubjectDept,
      isElective: false,
      applicableSections: ['JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
    };

    const updated = [...config.subjects, newSub];
    setConfig({ ...config, subjects: updated });
    saveSubjectCatalogAction(updated);
    setFeedback({ type: 'success', message: `Subject "${newSubjectName}" added.` });
    setNewSubjectName('');
    setNewSubjectCode('');
    setShowAddSubjectForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <Layers className="h-6 w-6 text-navy-900" />
            Institutional Academic Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campuses, academic calendar, class levels, custom arms, and curriculum subject catalogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/setup"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Launch Setup Wizard
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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
          Classes &amp; Arms ({config.classLevels.length})
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
          Academic Calendar ({config.activeSession ? config.activeSession.name : '2026/2027'})
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
          Bell Schedule &amp; Rules
        </button>
      </div>

      {/* TAB 1: Classes & Arms */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Quick Presets Bar: Letters, Metals, Gems, Colors, Streams */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Quick Arm Naming Presets (1-Click Apply to All Classes):
              </span>
              <span className="text-[11px] text-slate-500">
                You can also add custom arm names to any individual class below.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyArmPreset('LETTERS')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-colors"
              >
                Letters: A, B, C
              </button>
              <button
                type="button"
                onClick={() => handleApplyArmPreset('METALS')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-colors"
              >
                Metals: Gold, Silver, Bronze, Platinum
              </button>
              <button
                type="button"
                onClick={() => handleApplyArmPreset('GEMS')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-colors"
              >
                Gems: Diamond, Emerald, Sapphire, Ruby
              </button>
              <button
                type="button"
                onClick={() => handleApplyArmPreset('COLORS')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-colors"
              >
                Colors: Blue, Green, Red, Yellow
              </button>
              <button
                type="button"
                onClick={() => handleApplyArmPreset('STREAMS')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-xs transition-colors"
              >
                Senior Streams: Science, Arts, Commercial
              </button>
            </div>
          </div>

          {/* Section Filter & Add Level Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => setShowAddClassForm((prev) => !prev)}
              className="bg-navy-950 hover:bg-navy-900 text-white font-bold"
            >
              <Plus className="h-4 w-4 mr-1" />
              {showAddClassForm ? 'Close Form' : 'Add Class Level'}
            </Button>
          </div>

          {/* In-Page Add Class Level Form (NO prompt!) */}
          {showAddClassForm && (
            <Card className="border-emerald-300 bg-emerald-50/40 animate-in fade-in">
              <CardContent className="p-5">
                <form onSubmit={handleAddClassLevel} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-navy-950">Add New Class Level</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddClassForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Class Name <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        placeholder="e.g. JSS 1, Grade 7, Nursery 1"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                      <select
                        value={newClassSection}
                        onChange={(e: any) => setNewClassSection(e.target.value)}
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="EARLY_YEARS">Early Years (Creche / Nursery)</option>
                        <option value="PRIMARY">Primary / Basic</option>
                        <option value="JUNIOR_SECONDARY">Junior Secondary (JSS)</option>
                        <option value="SENIOR_SECONDARY">Senior Secondary (SSS)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        First Arm Name (e.g. Gold, A, Science)
                      </label>
                      <Input
                        placeholder="e.g. Gold, A, or Diamond"
                        value={newClassInitialArm}
                        onChange={(e) => setNewClassInitialArm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddClassForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Save Class Level
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Class Cards Grid */}
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
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Class Arms ({level.arms.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {level.arms.map((arm, aIdx) => (
                        <span
                          key={arm.id || aIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200"
                        >
                          <span>{arm.name}</span>
                          <span className="text-[10px] text-slate-400">({arm.capacity} cap)</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveArm(level.id, arm.id || `${aIdx}`)}
                            className="text-slate-400 hover:text-rose-600 ml-0.5"
                            title="Remove Arm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Inline Add Arm Input (NO prompt!) */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add arm (e.g. Gold, A, Science)"
                        value={cardArmInputs[level.id] || ''}
                        onChange={(e) =>
                          setCardArmInputs({ ...cardArmInputs, [level.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddArm(level.id, level.name);
                          }
                        }}
                        className="flex-1 h-8 rounded-lg border border-slate-200 px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddArm(level.id, level.name)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveLevel(level.id, level.name)}
                        className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove Level
                      </button>
                    </div>
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
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Institutional Curriculum Subject Catalog</CardTitle>
              <CardDescription>
                Subject offerings, national curriculum codes, and department allocations.
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddSubjectForm((prev) => !prev)}
              className="bg-navy-950 text-white font-bold"
            >
              <Plus className="h-4 w-4 mr-1" />
              {showAddSubjectForm ? 'Close' : 'Add Subject'}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* In-Page Add Subject Form (NO prompt!) */}
            {showAddSubjectForm && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-3">
                <h4 className="text-xs font-bold text-navy-950">Add Curriculum Subject</h4>
                <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    required
                    placeholder="Subject Name (e.g. Further Maths)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Subject Code (e.g. FMTH)"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Department (e.g. Sciences)"
                      value={newSubjectDept}
                      onChange={(e) => setNewSubjectDept(e.target.value)}
                    />
                    <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold">
                      Add
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.subjects.map((sub, sIdx) => (
                  <TableRow key={sub.id || sIdx}>
                    <TableCell className="font-mono font-bold text-xs text-emerald-800">{sub.code}</TableCell>
                    <TableCell className="font-bold text-sm text-navy-950">{sub.name}</TableCell>
                    <TableCell className="text-xs text-slate-600">{sub.department}</TableCell>
                    <TableCell>
                      <Badge variant={sub.isElective ? 'neutral' : 'approved'}>
                        {sub.isElective ? 'Elective' : 'Core Required'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Academic Calendar */}
      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Sessions &amp; Term Schedules</CardTitle>
            <CardDescription>
              Configured academic terms and session timelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.activeSession ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-navy-950 block">{config.activeSession.name} Academic Session</span>
                    <span className="text-xs text-slate-500">
                      {config.activeSession.startDate} &rarr; {config.activeSession.endDate}
                    </span>
                  </div>
                  <Badge variant="paid">Active Session</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.activeSession.terms.map((term, tIdx) => (
                    <div key={term.id || tIdx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-xs text-navy-950 block">{term.name}</span>
                      <span className="text-[11px] text-slate-500 block">{term.startDate} to {term.endDate}</span>
                      {term.isCurrent && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 mt-1">
                          Current Term
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active session configured.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Campuses */}
      {activeTab === 'campuses' && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Institutional Campuses</CardTitle>
            <CardDescription>
              Locations and campus branches under this institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {config.campuses.map((campus, cIdx) => (
              <div key={campus.id || cIdx} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-navy-950 block">{campus.name}</span>
                  <span className="text-xs text-slate-500">{campus.address}, {campus.city}, {campus.state}</span>
                </div>
                {campus.isMain && <Badge variant="paid">Main Campus</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Bell Schedule & Operational Rules */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <CardTitle>Bell Schedule &amp; Attendance Rules</CardTitle>
            <CardDescription>
              Daily operational hours and lateness cutoff thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Working Hours</span>
              <span className="text-base font-bold text-navy-950">
                {config.operationalRules.workingHoursStart} &rarr; {config.operationalRules.workingHoursEnd}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Lateness Cutoff Bell</span>
              <span className="text-base font-bold text-navy-950">{config.operationalRules.latenessCutoff}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block">Period Duration</span>
              <span className="text-base font-bold text-navy-950">
                {config.operationalRules.periodDurationMinutes} mins / class
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
