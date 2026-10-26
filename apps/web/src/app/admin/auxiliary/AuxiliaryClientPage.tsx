'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Bus,
  Home,
  BookOpen,
  Wrench,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/rbac';
import {
  ClinicVisit,
  TransportRoute,
  ExeatPass,
  LibraryBook,
  BookLoan,
  FixedAsset,
  PtaProject,
  PtaContribution,
  AuxiliaryMetrics,
} from '@/lib/auxiliary/auxiliary-types';
import {
  logClinicVisitAction,
  reviewExeatPassAction,
  returnBookAction,
  reportMaintenanceTicketAction,
  recordPtaContributionAction,
} from '@/app/actions/auxiliary';

interface AuxiliaryClientPageProps {
  session: AuthSession;
  initialClinicVisits: ClinicVisit[];
  initialRoutes: TransportRoute[];
  initialExeats: ExeatPass[];
  initialBooks: LibraryBook[];
  initialLoans: BookLoan[];
  initialAssets: FixedAsset[];
  initialPta: PtaProject[];
  initialContributions: PtaContribution[];
  metrics: AuxiliaryMetrics;
}

export default function AuxiliaryClientPage({
  session,
  initialClinicVisits,
  initialRoutes,
  initialExeats,
  initialBooks,
  initialLoans,
  initialAssets,
  initialPta,
  initialContributions,
  metrics,
}: AuxiliaryClientPageProps) {
  const [activeTab, setActiveTab] = useState<
    'clinic' | 'transport' | 'hostel' | 'library' | 'assets' | 'pta'
  >('clinic');

  const [clinicVisits, setClinicVisits] = useState(initialClinicVisits);
  const [exeats, setExeats] = useState(initialExeats);
  const [loans, setLoans] = useState(initialLoans);
  const [assets, setAssets] = useState(initialAssets);
  const [ptaProjects] = useState(initialPta);
  const [contributions, setContributions] = useState(initialContributions);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick form states
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [clinicForm, setClinicForm] = useState({
    studentId: 'stu_kcl_001',
    studentName: 'Chidubem Adeleke',
    classArm: 'JSS 1 Gold',
    symptoms: 'Sudden fever and headache during assembly',
    diagnosis: 'Suspected Malaria / Elevated Temperature',
    treatment: 'Administered oral paracetamol, cooled with damp cloth',
    temperatureCelsius: 38.4,
    triageSeverity: 'MODERATE' as const,
    notifyParent: true,
    admitToSickBay: true,
  });

  const handleLogClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await logClinicVisitAction(clinicForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setClinicVisits([res.data as ClinicVisit, ...clinicVisits]);
      setShowClinicModal(false);
      setActionMessage({ type: 'success', text: res.message || 'Clinic visit logged.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to log clinic visit.' });
    }
  };

  const handleReviewExeat = async (exeatId: string, status: 'APPROVED' | 'CHECKED_OUT') => {
    setIsSubmitting(true);
    const res = await reviewExeatPassAction(exeatId, status, 'Verified by boarding house master.');
    setIsSubmitting(false);

    if (res.success) {
      setExeats(
        exeats.map((e) => (e.id === exeatId ? { ...e, status } : e))
      );
      setActionMessage({ type: 'success', text: res.message || `Exeat updated to ${status}.` });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to update exeat.' });
    }
  };

  const handleReturnBook = async (loanId: string) => {
    setIsSubmitting(true);
    const res = await returnBookAction(loanId);
    setIsSubmitting(false);

    if (res.success) {
      setLoans(
        loans.map((l) => (l.id === loanId ? { ...l, status: 'RETURNED' } : l))
      );
      setActionMessage({ type: 'success', text: res.message || 'Book returned.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to return book.' });
    }
  };

  const handleReportMaintenance = async (assetId: string) => {
    setIsSubmitting(true);
    const res = await reportMaintenanceTicketAction({
      assetId,
      issueDescription: 'Quarterly servicing and electrical wiring safety check.',
      priority: 'MEDIUM',
      estimatedCost: 25000,
    });
    setIsSubmitting(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message || 'Maintenance ticket reported.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to report maintenance.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Campus Logistics, Health &amp; Auxiliary Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              School Auxiliary Operations & Welfare Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Unified campus logistics: School clinic & emergency SMS triage, bus fleet routes, boarding hostel exeats, library circulation, fixed asset maintenance, and PTA project levies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800 text-slate-300 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Clinic Visits Today</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {metrics.totalClinicVisitsToday}{' '}
              {metrics.criticalCasesToday > 0 && (
                <span className="text-rose-400 text-xs font-normal">({metrics.criticalCasesToday} Critical)</span>
              )}
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Bus Routes Active</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {metrics.activeTransportRoutes} <span className="text-xs text-slate-400">({metrics.studentsOnBusesCount} riders)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Hostel Scholars</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {metrics.activeHostelScholarsCount}{' '}
              <span className="text-xs text-amber-400">({metrics.pendingExeatsCount} exeats)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Library Stock</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {metrics.totalLibraryBooksCount} <span className="text-xs text-slate-400">({metrics.booksOnLoanCount} on loan)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Fixed Assets</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {metrics.totalFixedAssetsCount}{' '}
              <span className="text-xs text-slate-400">({metrics.pendingMaintenanceCount} maint)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">PTA Projects</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">
              {metrics.activePtaProjectsCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <p className="font-medium">{actionMessage.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-2 pb-1">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'clinic'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HeartPulse className="w-4 h-4" /> School Clinic & Triage ({clinicVisits.length})
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'transport'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bus className="w-4 h-4" /> Transport & Bus Routes ({initialRoutes.length})
        </button>
        <button
          onClick={() => setActiveTab('hostel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'hostel'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" /> Hostel & Exeats ({exeats.length})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Library Circulation ({initialBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'assets'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" /> Fixed Assets ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('pta')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'pta'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> PTA Capital Projects ({ptaProjects.length})
        </button>
      </div>

      {/* Tab 1: Clinic & Health */}
      {activeTab === 'clinic' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                School Clinic & Sick Bay Visit Registry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log student ailments, record triage severity, and trigger automated emergency SMS alerts directly to parent phones.
              </p>
            </div>
            <button
              onClick={() => setShowClinicModal(!showClinicModal)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Record Clinic Visit
            </button>
          </div>

          {/* Quick Record Modal / Inline Form */}
          {showClinicModal && (
            <form onSubmit={handleLogClinic} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">New Clinic Patient Encounter</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Student Name</label>
                  <input
                    type="text"
                    value={clinicForm.studentName}
                    onChange={(e) => setClinicForm({ ...clinicForm, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class Arm</label>
                  <input
                    type="text"
                    value={clinicForm.classArm}
                    onChange={(e) => setClinicForm({ ...clinicForm, classArm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={clinicForm.temperatureCelsius}
                    onChange={(e) => setClinicForm({ ...clinicForm, temperatureCelsius: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Symptoms / Chief Complaint</label>
                  <input
                    type="text"
                    value={clinicForm.symptoms}
                    onChange={(e) => setClinicForm({ ...clinicForm, symptoms: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Triage Severity</label>
                  <select
                    value={clinicForm.triageSeverity}
                    onChange={(e) => setClinicForm({ ...clinicForm, triageSeverity: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  >
                    <option value="MILD">Mild (Rest / Minor first-aid)</option>
                    <option value="MODERATE">Moderate (Bed observation in sick bay)</option>
                    <option value="CRITICAL">Critical (Emergency parent SMS trigger)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClinicModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Patient Visit'}
                </button>
              </div>
            </form>
          )}

          {/* Visits Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Symptoms & Diagnosis</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4">Triage Severity</th>
                  <th className="py-3 px-4">Parent Alert</th>
                  <th className="py-3 px-4">Sick Bay</th>
                  <th className="py-3 px-4">Attending Nurse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {clinicVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {visit.studentName}
                    </td>
                    <td className="py-3 px-4">{visit.classArm}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{visit.diagnosis}</div>
                      <div className="text-[11px] text-slate-500 truncate">{visit.symptoms}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono ${visit.temperatureCelsius >= 38.0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {visit.temperatureCelsius}°C
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          visit.triageSeverity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            : visit.triageSeverity === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        {visit.triageSeverity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {visit.parentNotified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SMS Sent
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not Sent</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {visit.admittedToSickBay ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium text-[11px]">
                          Admitted
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Outpatient</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{visit.nurseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transport */}
      {activeTab === 'transport' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Campus Transport & Fleet Route Manager
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned vehicles, driver contact telephone numbers, scheduled stops, and live passenger capacity tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{route.routeName}</h3>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {route.zone}
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs font-mono font-bold">
                    ₦{route.termFee.toLocaleString()} / term
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Vehicle:</strong> {route.vehiclePlateNumber}</div>
                  <div><strong>Driver:</strong> {route.driverName} ({route.driverPhone})</div>
                  <div>
                    <strong>Capacity:</strong> {route.assignedStudentIds.length} / {route.vehicleCapacity} students booked
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Route Stops
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {route.stops.map((stop, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-700 dark:text-slate-300"
                      >
                        {sIdx + 1}. {stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Hostel & Exeat Management */}
      {activeTab === 'hostel' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Hostel Administration & Digital Exeat Passes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized weekend and medical gate passes with automated digital barcodes for campus security verification.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class & Room</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason & Destination</th>
                  <th className="py-3 px-4">Departure / Return</th>
                  <th className="py-3 px-4">Barcode Pass</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {exeats.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {ex.studentName}
                    </td>
                    <td className="py-3 px-4">
                      <div>{ex.classArm}</div>
                      <div className="text-[11px] text-slate-500">{ex.hostelRoom}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                        {ex.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-800 dark:text-slate-200">{ex.reason}</div>
                      <div className="text-[11px] text-slate-500 truncate">{ex.destinationAddress}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>Depart: {new Date(ex.departureDate).toLocaleDateString()}</div>
                      <div>Return: {new Date(ex.expectedReturnDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ex.gatePassBarcode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ex.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : ex.status === 'CHECKED_OUT'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ex.status === 'PENDING' && (
                        <button
                          onClick={() => handleReviewExeat(ex.id, 'APPROVED')}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                        >
                          Approve
                        </button>
                      )}
                      {ex.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReviewExeat(ex.id, 'CHECKED_OUT')}
                          disabled={isSubmitting}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          Gate Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Library */}
      {activeTab === 'library' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Library Cataloging & Circulation Desk
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage physical catalog, active book borrowings, and automatic overdue fine billing calculations (₦200 / day).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {initialBooks.map((book) => (
              <div
                key={book.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">{book.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold">
                    {book.copiesAvailable} / {book.copiesTotal} Avail
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Author: {book.author}</p>
                <p className="text-[11px] text-slate-500 font-mono">ISBN: {book.isbn}</p>
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                  Location: <span className="font-semibold text-slate-900 dark:text-white">{book.shelfLocation}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Active Book Loans & Checkouts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Book Title</th>
                    <th className="py-2.5 px-3">Borrower</th>
                    <th className="py-2.5 px-3">Borrow Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Fine</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{loan.bookTitle}</td>
                      <td className="py-2.5 px-3">{loan.borrowerName} ({loan.borrowerRole})</td>
                      <td className="py-2.5 px-3 font-mono">{loan.borrowDate}</td>
                      <td className="py-2.5 px-3 font-mono">{loan.dueDate}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">₦{loan.fineAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        {loan.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            disabled={isSubmitting}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                          >
                            Return Book
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Assets */}
      {activeTab === 'assets' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Fixed Asset Inventory & Facility Maintenance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track school infrastructure, generators, STEM lab equipment, condition audits, and open repair work-orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono rounded font-bold">
                      {asset.assetCode}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{asset.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.condition === 'GOOD'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    }`}
                  >
                    {asset.condition}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Category:</strong> {asset.category}</div>
                  <div><strong>Location:</strong> {asset.location}</div>
                  <div><strong>Custodian:</strong> {asset.custodian}</div>
                  <div><strong>Purchase Cost:</strong> ₦{asset.purchaseCost.toLocaleString()}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {asset.maintenanceTickets.length} maintenance tickets logged
                  </span>
                  <button
                    onClick={() => handleReportMaintenance(asset.id)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Request Maintenance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: PTA Projects */}
      {activeTab === 'pta' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Parent Teacher Association (PTA) Capital Projects & Levies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Segregated accounting for PTA infrastructure projects, meeting minutes, and tracked student levy contributions.
            </p>
          </div>

          <div className="space-y-4">
            {ptaProjects.map((proj) => {
              const progress = Math.min(100, Math.round((proj.raisedAmount / proj.targetAmount) * 100));
              return (
                <div
                  key={proj.id}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{proj.title}</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded">
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{proj.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500">Session {proj.session}</span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        Levy: ₦{proj.levyPerStudent.toLocaleString()} / student
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-600 dark:text-slate-300">
                        Raised: ₦{proj.raisedAmount.toLocaleString()} ({progress}%)
                      </span>
                      <span className="text-slate-500">Target: ₦{proj.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 gap-2">
                    <div><strong>Committee Chairman:</strong> {proj.committeeChairman}</div>
                    <div><strong>Last Exco Meeting:</strong> {proj.lastMeetingDate}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contributions Record */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recent PTA Student Contributions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Receipt Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {contributions.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{c.studentName}</td>
                      <td className="py-2.5 px-3">{c.classArm}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₦{c.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{c.paidDate}</td>
                      <td className="py-2.5 px-3">{c.paymentMethod}</td>
                      <td className="py-2.5 px-3 font-mono">{c.receiptReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
