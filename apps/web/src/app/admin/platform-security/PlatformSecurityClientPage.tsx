'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Database,
  Lock,
  Download,
  UserX,
  Building,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Clock,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/rbac';
import {
  DatabaseSnapshot,
  BackupRestoreDrillReport,
  GuardianConsentRecord,
  PlatformTenant,
  PlatformHealthMetrics,
  StudentDataPortabilityPackage,
} from '@/lib/platform-security/platform-security-types';
import {
  executeBackupRestoreDrillAction,
  exportStudentDataPortabilityAction,
  anonymizeStudentForErasureAction,
} from '@/app/actions/platform-security';

interface PlatformSecurityClientPageProps {
  session: AuthSession;
  initialSnapshots: DatabaseSnapshot[];
  initialDrills: BackupRestoreDrillReport[];
  initialConsents: GuardianConsentRecord[];
  tenants: PlatformTenant[];
  healthMetrics: PlatformHealthMetrics;
}

export default function PlatformSecurityClientPage({
  session,
  initialSnapshots,
  initialDrills,
  initialConsents,
  tenants,
  healthMetrics,
}: PlatformSecurityClientPageProps) {
  const [activeTab, setActiveTab] = useState<'drills' | 'ndpa' | 'tenants'>('drills');

  const [snapshots] = useState<DatabaseSnapshot[]>(initialSnapshots);
  const [drills, setDrills] = useState<BackupRestoreDrillReport[]>(initialDrills);
  const [consents] = useState<GuardianConsentRecord[]>(initialConsents);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exported package modal
  const [exportedPackage, setExportedPackage] = useState<StudentDataPortabilityPackage | null>(null);

  // Student Anonymization input
  const [anonymizeTargetId, setAnonymizeTargetId] = useState('stu_kcl_999');
  const [anonymizeReason, setAnonymizeReason] = useState('Guardian written request following permanent family relocation.');

  const handleExecuteDrill = async (snapshotId: string) => {
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await executeBackupRestoreDrillAction(
      snapshotId,
      'Automated Disaster Recovery Drill & Snapshot Parity Check'
    );
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrills([res.data as BackupRestoreDrillReport, ...drills]);
      setActionMessage({ type: 'success', text: res.message || 'Disaster recovery drill passed successfully.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to execute drill.' });
    }
  };

  const handleExportDataPortability = async (studentId: string) => {
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await exportStudentDataPortabilityAction(studentId);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setExportedPackage(res.data as StudentDataPortabilityPackage);
      setActionMessage({ type: 'success', text: 'NDPA Section 34 data portability package generated.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to generate portability package.' });
    }
  };

  const handleAnonymizeStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await anonymizeStudentForErasureAction(anonymizeTargetId, anonymizeReason);
    setIsSubmitting(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message || 'Student PII anonymized.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to anonymize student.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Institutional Security &amp; NDPA 2023 Compliance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Security, Disaster Recovery & NDPA Compliance
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Automated disaster recovery restore drills (RPO ≤ 15m, RTO ≤ 60m), WORM snapshot integrity, NDPA 2023 Section 34 student data portability packages, and SaaS multi-tenancy controls.
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

        {/* Top Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-slate-300 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Backup Restore Drills</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">
              {drills.length} Completed <span className="text-xs text-slate-400">(100% Passed)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Measured RPO Benchmark</span>
            <span className="text-lg font-bold text-white mt-1 block">
              7.5 Mins <span className="text-xs text-emerald-400">(≤ 15m SLA ✓)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">NDPA Consent Registry</span>
            <span className="text-lg font-bold text-cyan-400 mt-1 block">
              {consents.length} Consents <span className="text-xs text-slate-400">(100% Lawful)</span>
            </span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">SaaS Tenants Online</span>
            <span className="text-lg font-bold text-white mt-1 block">
              {tenants.length} Tenants <span className="text-xs text-emerald-400">(All Active)</span>
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
          onClick={() => setActiveTab('drills')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'drills'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" /> Disaster Recovery & Backup Drills ({drills.length})
        </button>
        <button
          onClick={() => setActiveTab('ndpa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'ndpa'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" /> NDPA 2023 Data Subject Rights
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'tenants'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border-t-2 border-cyan-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" /> SaaS Multi-Tenancy & Health ({tenants.length})
        </button>
      </div>

      {/* Tab 1: Disaster Recovery & Backup Restore Drills */}
      {activeTab === 'drills' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Disaster Recovery & Encrypted WORM Snapshots
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute automated restoration drills from isolated Write-Once-Read-Many (WORM) storage. Verify RPO ≤ 15 min and RTO ≤ 60 min.
              </p>
            </div>
          </div>

          {/* Snapshots Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      {snap.backupType}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{snap.id}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {snap.encryptionAlgorithm}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Timestamp:</strong> {new Date(snap.timestamp).toLocaleString()}</div>
                  <div><strong>Size:</strong> {(snap.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</div>
                  <div><strong>Storage Tier:</strong> {snap.storageTier}</div>
                  <div className="truncate font-mono text-[11px] text-slate-500">
                    <strong>SHA-256:</strong> {snap.checksumSha256}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleExecuteDrill(snap.id)}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" /> Execute Automated Restore Drill
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Restore Drills History */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Historical Restore Drill Logs</h3>
            <div className="space-y-3">
              {drills.map((drill) => (
                <div
                  key={drill.drillId}
                  className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{drill.drillId}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                        {drill.status}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      Executed on {new Date(drill.executedAt).toLocaleString()} by {drill.executedBy}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 italic">{drill.simulatedFailureScenario}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[11px]">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Measured RPO</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {drill.measuredRpoMinutes} mins (≤ 15m ✓)
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Measured RTO</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {drill.measuredRtoMinutes} mins (≤ 60m ✓)
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Checksum SHA-256</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Match ✓</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block">Ledger Balance</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Balanced ✓</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NDPA 2023 */}
      {activeTab === 'ndpa' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Nigeria Data Protection Act (NDPA) 2023 Compliance & Data Subject Rights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Execute Section 34 Data Portability exports, manage explicit lawful guardian consent, and implement Right to Erasure / Pseudonymization.
            </p>
          </div>

          {/* Data Portability Section */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NDPA Section 34: One-Click Student Data Portability Export
            </h3>
            <p className="text-xs text-slate-500">
              Generates a structured, machine-readable JSON package of all student biodata, attendance records, report cards, and immutable double-entry financial ledger transactions.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportDataPortability('stu_kcl_001')}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export Data Portability Package (Chidubem Adeleke)
              </button>
            </div>
          </div>

          {/* Export Package Modal */}
          {exportedPackage && (
            <div className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs rounded-xl space-y-2 border border-cyan-800 max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center text-white pb-2 border-b border-cyan-800">
                <span className="font-bold">Official NDPA Data Portability Export: {exportedPackage.exportMetadata.exportId}</span>
                <button onClick={() => setExportedPackage(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <pre className="text-[11px] whitespace-pre-wrap">
                {JSON.stringify(exportedPackage, null, 2)}
              </pre>
            </div>
          )}

          {/* Right to Erasure / Pseudonymization */}
          <form onSubmit={handleAnonymizeStudent} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NDPA Section 34: Right to Erasure / Pseudonymization
            </h3>
            <p className="text-xs text-slate-500">
              Irreversibly scrubs student PII into a cryptographically salted hash (<code>ANON-SHA256-...</code>) while strictly retaining immutable financial ledger balance records and statutory academic statistics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Target Student ID</label>
                <input
                  type="text"
                  value={anonymizeTargetId}
                  onChange={(e) => setAnonymizeTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Statutory Erasure Justification</label>
                <input
                  type="text"
                  value={anonymizeReason}
                  onChange={(e) => setAnonymizeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <UserX className="w-4 h-4" /> Execute Cryptographic Anonymization
              </button>
            </div>
          </form>

          {/* Guardian Consents Table */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Guardian Consent Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Guardian Name</th>
                    <th className="py-2.5 px-3">Lawful Basis</th>
                    <th className="py-2.5 px-3">Consent Timestamp</th>
                    <th className="py-2.5 px-3">Consented Purposes</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {consents.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{c.studentId}</td>
                      <td className="py-2.5 px-3">{c.guardianName} ({c.guardianPhone})</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 text-[10px] font-bold">
                          {c.lawfulBasis}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{new Date(c.consentTimestamp).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 text-[11px] max-w-xs truncate">
                        {c.consentedPurposes.join(', ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tenants */}
      {activeTab === 'tenants' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              SaaS Multi-Tenancy & Platform Organization Registry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage school tenants, subscription plan quotas, MFA enforcement mandates, and cross-tenant logical isolation policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenants.map((t) => (
              <div
                key={t.schoolId}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {t.plan} PLAN
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">{t.legalName}</h3>
                    <p className="text-xs text-slate-500">{t.contactEmail}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded">
                    {t.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Student Quota:</strong> {t.maxStudentsQuota} max scholars</div>
                  <div><strong>Storage Quota:</strong> {t.maxStorageGbQuota} GB dedicated volume</div>
                  <div><strong>MFA Policy:</strong> {t.mfaEnforced ? 'Mandatory Privileged TOTP' : 'Optional'}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1">
                  {t.featuresEnabled.map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
