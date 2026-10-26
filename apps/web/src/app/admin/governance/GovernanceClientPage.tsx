'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Alert,
  Input,
} from '@school-os/ui';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  AlertTriangle,
  UserCheck,
  Lock,
  Filter,
  Check,
  X,
} from 'lucide-react';
import {
  GovernanceRequest,
  GovernanceMetrics,
  GovernanceStatus,
  GovernanceRequestType,
} from '@/lib/governance/governance-types';
import { reviewGovernanceRequestAction } from '@/app/actions/governance';
import { AuthSession } from '@/lib/auth/rbac';

interface GovernanceClientPageProps {
  session: AuthSession;
  initialRequests: GovernanceRequest[];
  metrics: GovernanceMetrics;
}

export default function GovernanceClientPage({
  session,
  initialRequests,
  metrics: initialMetrics,
}: GovernanceClientPageProps) {
  const [requests, setRequests] = useState<GovernanceRequest[]>(initialRequests);
  const [metrics, setMetrics] = useState<GovernanceMetrics>(initialMetrics);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<GovernanceRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (activeTab !== 'ALL' && r.status !== activeTab) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    return true;
  });

  const handleReview = async (action: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    if (!reviewNotes || reviewNotes.trim().length < 5) {
      setFeedback({ type: 'error', message: 'Mandatory review justification notes required (at least 5 characters).' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await reviewGovernanceRequestAction({
      requestId: selectedRequest.id,
      action,
      reviewNotes: reviewNotes.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      const updated = res.data as GovernanceRequest;
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMetrics((prev) => ({
        ...prev,
        pendingCount: Math.max(0, prev.pendingCount - 1),
        approvedCount: action === 'APPROVED' ? prev.approvedCount + 1 : prev.approvedCount,
        rejectedCount: action === 'REJECTED' ? prev.rejectedCount + 1 : prev.rejectedCount,
      }));
      setFeedback({ type: 'success', message: res.message || 'Governance review completed.' });
      setSelectedRequest(null);
      setReviewNotes('');
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to submit review decision.' });
    }
  };

  const isMaker = selectedRequest && session.userId === selectedRequest.makerId;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-navy-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-institutional-lg">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-navy-900 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Scale className="h-3.5 w-3.5" />
              Level 2 Dual-Control Governance
            </span>
            <Badge variant="paid">Maker-Checker Protocol</Badge>
            <Badge variant="approved">Tenant Scoped</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Centralized Governance & Approvals Queue
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl">
            Strict separation of duties engine enforcing dual-authorization on cryptographic score alterations, financial ledger reversals, and sensitive student transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-mono">REVIEWER IDENTITY</span>
            <span className="text-sm font-bold text-white">{session.firstName} {session.lastName}</span>
            <span className="text-xs text-emerald-400 block font-mono">[{session.userType}]</span>
          </div>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          title={feedback.type === 'success' ? 'Governance Action Confirmed' : 'Governance Guard Alert'}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Decisions
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
              {metrics.pendingCount}
            </CardTitle>
            <CardDescription className="text-xs text-amber-700 font-medium">
              Awaiting Level 2 Dual Authorization
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Approved Decisions
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-emerald-700 mt-1">
              {metrics.approvedCount}
            </CardTitle>
            <CardDescription className="text-xs text-emerald-600 font-medium">
              Cryptographically Re-Sealed
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rejected / Blocked
              </span>
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-rose-700 mt-1">
              {metrics.rejectedCount}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Audit trails retained
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg Resolution Time
              </span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
              {metrics.avgResolutionTimeHours}h
            </CardTitle>
            <CardDescription className="text-xs text-blue-600 font-medium">
              SLA Standard &lt; 24h
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
              }`}
            >
              {tab === 'PENDING' ? `Pending Review (${metrics.pendingCount})` : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="SCORE_ALTERATION">Score Alterations</option>
            <option value="FEE_REVERSAL">Fee & Payment Reversals</option>
            <option value="STUDENT_TRANSFER">Student Arm Transfers</option>
            <option value="CURRICULUM_OVERRIDE">Curriculum Overrides</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-navy-950">No governance requests found</p>
              <p className="text-xs text-slate-400 mt-1">All mutations and dual-control sign-offs are up to date.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className="overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="p-5 sm:p-6 space-y-4">
                {/* Top Row: Type, Status, Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {req.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'PENDING' && <Badge variant="pending">Pending Maker-Checker Sign-off</Badge>}
                    {req.status === 'APPROVED' && <Badge variant="paid">Approved & Executed</Badge>}
                    {req.status === 'REJECTED' && <Badge variant="debt">Rejected by Checker</Badge>}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-navy-950">{req.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{req.description}</p>
                </div>

                {/* Visual Before/After Diff Table */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Structured State Mutation Diff (Before &rarr; After)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {req.diff.map((field, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs">
                        <span className="text-slate-500 font-medium block truncate mb-1.5">{field.fieldLabel}</span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono font-bold line-through">
                            {String(field.oldValue ?? 'None')}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">
                            {String(field.newValue ?? 'None')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maker & Checker Provenance Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-mono block">MAKER (INITIATOR)</span>
                    <p className="font-semibold text-slate-800">
                      {req.makerName} <span className="font-mono text-slate-500">({req.makerRole})</span>
                    </p>
                    <p className="text-slate-500 italic bg-amber-50/60 p-2 rounded border border-amber-200/50">
                      &quot;{req.makerReason}&quot;
                    </p>
                  </div>

                  {req.checkerId ? (
                    <div className="space-y-1">
                      <span className="text-slate-400 font-mono block">CHECKER (REVIEWER)</span>
                      <p className="font-semibold text-slate-800">
                        {req.checkerName} <span className="font-mono text-slate-500">({req.checkerRole})</span>
                      </p>
                      <p className="text-slate-500 italic bg-emerald-50/60 p-2 rounded border border-emerald-200/50">
                        &quot;{req.reviewNotes}&quot;
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Reviewed at: {req.reviewedAt}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-end items-start md:items-end">
                      {session.userId === req.makerId ? (
                        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>Separation of Duties: You initiated this mutation and cannot approve it.</span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setReviewNotes('');
                            setFeedback(null);
                          }}
                          leftIcon={<Scale className="h-3.5 w-3.5" />}
                        >
                          Review & Decide
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Audit Proof Seal */}
                {req.auditProofHash && (
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pt-1">
                    <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>Cryptographic Audit Proof: {req.auditProofHash.substring(0, 32)}...</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="paid" className="mb-1">
                    Level 2 Dual-Control Review
                  </Badge>
                  <CardTitle className="text-lg font-bold text-navy-950">
                    {selectedRequest.title}
                  </CardTitle>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardDescription>
                Initiated by {selectedRequest.makerName} ({selectedRequest.makerRole})
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Diff Preview in Modal */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Proposed Alteration Diff
                </span>
                {selectedRequest.diff.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                    <span className="font-medium text-slate-600">{f.fieldLabel}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 line-through font-mono">{String(f.oldValue ?? 'None')}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="text-emerald-700 font-mono font-bold">{String(f.newValue ?? 'None')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Maker Reason */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Maker Justification:
                </span>
                <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/50">
                  {selectedRequest.makerReason}
                </p>
              </div>

              {/* Review Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy-950 block">
                  Checker Authorization Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="State the formal justification or audit rationale for this decision (minimum 5 characters)..."
                  rows={3}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Separation of duties warning if maker attempts review */}
              {isMaker && (
                <Alert
                  type="error"
                  title="Separation of Duties Violation"
                >
                  You are the Maker who created this request. Under Playbook Chapter 23 dual-control policies, you cannot review your own request.
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReview('REJECTED')}
                  disabled={isSubmitting || !!isMaker}
                  leftIcon={<XCircle className="h-3.5 w-3.5" />}
                >
                  Reject Mutation
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReview('APPROVED')}
                  disabled={isSubmitting || !!isMaker}
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Approve & Execute
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
