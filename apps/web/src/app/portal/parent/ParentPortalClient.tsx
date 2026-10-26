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
} from '@school-os/ui';
import {
  Users,
  CreditCard,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  User,
  Heart,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { ParentPortalData, ParentChildSummary } from '@/lib/portals/portal-service';
import { getParentPortalDataAction, submitParentPaystackPaymentAction } from '@/app/actions/portals';
import { AuthSession } from '@/lib/auth/rbac';

interface ParentPortalClientProps {
  session: AuthSession;
  initialData: ParentPortalData;
}

export default function ParentPortalClient({
  session,
  initialData,
}: ParentPortalClientProps) {
  const [data, setData] = useState<ParentPortalData>(initialData);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPORT_CARD' | 'FEES' | 'RECEIPTS'>('OVERVIEW');
  const [isLoadingChild, setIsLoadingChild] = useState(false);
  
  // Paystack checkout state
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ url?: string; ref?: string; message?: string } | null>(null);

  const handleChildSwitch = async (studentId: string) => {
    if (studentId === data.activeChild.studentId) return;
    setIsLoadingChild(true);
    const updated = await getParentPortalDataAction(studentId);
    if (updated) {
      setData(updated);
    }
    setIsLoadingChild(false);
  };

  const handlePaystackPay = async (invoiceId: string, amount: number) => {
    setIsProcessingPayment(true);
    setPaymentResult(null);

    const res = await submitParentPaystackPaymentAction(
      invoiceId,
      amount,
      data.activeChild.studentId
    );

    setIsProcessingPayment(false);

    if (res.success && res.data) {
      setPaymentResult({
        url: res.data.authorizationUrl,
        ref: res.data.reference,
        message: 'Paystack checkout session created successfully.',
      });
    } else {
      alert(res.error || 'Failed to initialize Paystack checkout.');
    }
  };

  const child = data.activeChild;

  return (
    <div className="space-y-6">
      {data.isPreview && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-3 flex items-center justify-between text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              <strong>Staff Preview Mode:</strong> You are viewing the live Parent Portal workspace for registered guardian <strong>{data.guardian.name}</strong>. Logged in as: {data.previewActorName} ({data.previewActorRole}).
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Preview</span>
        </div>
      )}

      {/* Top Banner: Parent Identity & Multi-Child Switcher */}
      <div className="rounded-2xl bg-navy-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-institutional-lg">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-navy-900 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Users className="h-3.5 w-3.5" />
              Parent & Guardian Portal
            </span>
            <Badge variant="paid">Paystack Secured</Badge>
            <Badge variant="approved">Verified Custody</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {data.guardian.name}
          </h1>

          <p className="text-xs text-slate-300 flex items-center gap-2">
            <span>Primary Phone: <strong className="text-white">{data.guardian.phone}</strong></span>
            <span>•</span>
            <span className="text-slate-400">{data.guardian.email}</span>
          </p>
        </div>

        {/* Multi-Child Selector Switcher */}
        <div className="bg-navy-900/90 border border-slate-700 p-3 rounded-xl flex flex-col gap-1 min-w-[260px]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-emerald-400" />
            Switch Active Child ({data.children.length} Enrolled)
          </span>

          <select
            value={child.studentId}
            onChange={(e) => handleChildSwitch(e.target.value)}
            disabled={isLoadingChild}
            className="text-xs font-bold rounded-lg border border-slate-600 bg-navy-950 text-white px-3 py-2 focus:border-emerald-500 focus:outline-none"
          >
            {data.children.map((c) => (
              <option key={c.studentId} value={c.studentId}>
                {c.fullName} ({c.classArm})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'OVERVIEW'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Overview & Attendance
        </button>

        <button
          onClick={() => setActiveTab('REPORT_CARD')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'REPORT_CARD'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Academic Report Card
        </button>

        <button
          onClick={() => setActiveTab('FEES')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'FEES'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Fees & Paystack Billing
          {child.outstandingBalance > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              ₦{child.outstandingBalance.toLocaleString()}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RECEIPTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'RECEIPTS'
              ? 'bg-navy-950 text-white shadow-sm'
              : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Payment Receipts ({data.recentReceipts.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ATTENDANCE */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Child Profile Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-navy-950">
                    {child.fullName}
                  </CardTitle>
                  <Badge variant="approved">{child.classArm}</Badge>
                </div>
                <CardDescription>
                  Admission No: <strong className="font-mono text-slate-800">{child.admissionNumber}</strong> • {child.campusName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">DATE OF BIRTH</span>
                    <strong className="text-slate-800">{child.dateOfBirth}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">GENDER</span>
                    <strong className="text-slate-800">{child.gender}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">GENOTYPE & BLOOD</span>
                    <strong className="text-slate-800">{child.genotype} / {child.bloodGroup}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">MEDICAL ALERTS</span>
                    <strong className="text-amber-700">{child.allergies || 'None'}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50/50 border-emerald-200">
              <CardHeader className="pb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Attendance Score
                </span>
                <CardTitle className="text-3xl font-extrabold text-emerald-700 mt-1">
                  {child.attendanceRate}%
                </CardTitle>
                <CardDescription className="text-xs text-emerald-700">
                  {child.totalPresent} of {child.totalSchoolDays} term school days present
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 pt-2 border-t border-emerald-200/60">
                  <span>Days Late: <strong>{child.totalLate}</strong></span>
                  <span>Days Absent: <strong className="text-rose-600">{child.totalAbsent}</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Shortcuts to Results & Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => setActiveTab('REPORT_CARD')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-base font-bold text-navy-950">
                  View 1st Term Report Card
                </CardTitle>
                <CardDescription>
                  Cognitive marks, 1-5 affective/psychomotor grids, and Principal remarks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => setActiveTab('FEES')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
                <CardTitle className="text-base font-bold text-navy-950">
                  {child.outstandingBalance > 0
                    ? `Pay Balance: ₦${child.outstandingBalance.toLocaleString()}`
                    : 'All Term Fees Settled (₦0.00)'}
                </CardTitle>
                <CardDescription>
                  Instant checkout via Paystack with cards, bank transfers, and USSD.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC REPORT CARD */}
      {activeTab === 'REPORT_CARD' && (
        <div className="space-y-6">
          {data.reportCard ? (
            <Card className="border border-slate-200 shadow-institutional">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 block mb-0.5">
                      APEX MODEL COLLEGE, LAGOS • OFFICIAL TRANSCRIPT
                    </span>
                    <CardTitle className="text-lg font-bold text-navy-950">
                      {child.fullName} — {data.reportCard.term} ({data.reportCard.session})
                    </CardTitle>
                    <CardDescription>
                      Class: {child.classArm} • Admission: {child.admissionNumber}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                    >
                      Print Transcript
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Cognitive Domain Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-navy-950 text-white font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3 text-center">CA 1 (20)</th>
                        <th className="py-2.5 px-3 text-center">CA 2 (20)</th>
                        <th className="py-2.5 px-3 text-center">Exam (60)</th>
                        <th className="py-2.5 px-3 text-center">Total (100)</th>
                        <th className="py-2.5 px-3 text-center">Grade</th>
                        <th className="py-2.5 px-3">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.reportCard.cognitiveScores.map((score, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium">
                          <td className="py-2.5 px-3 font-bold text-navy-950">{score.subjectName}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{score.ca1}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{score.ca2}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{score.exam}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-navy-950">
                            {score.total}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              score.grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {score.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{score.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Behavioral & Affective Ratings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
                    <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                      Affective Domain Rating (Scale 1 - 5)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(data.reportCard.affectiveRatings).map(([trait, rating]) => (
                        <div key={trait} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
                          <span className="text-slate-600">{trait}</span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} ({rating}/5)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
                    <span className="text-xs font-bold text-navy-950 uppercase tracking-wider block">
                      Psychomotor Domain Rating (Scale 1 - 5)
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {Object.entries(data.reportCard.psychomotorRatings).map(([skill, rating]) => (
                        <div key={skill} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
                          <span className="text-slate-600">{skill}</span>
                          <span className="font-bold text-blue-700 font-mono">
                            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} ({rating}/5)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">CLASS TEACHER&apos;S REMARKS</span>
                    <p className="text-amber-800 italic">&quot;{data.reportCard.classTeacherRemarks}&quot;</p>
                  </div>

                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 text-xs">
                    <span className="font-bold text-emerald-900 block mb-0.5">PRINCIPAL&apos;S REMARKS & ENDORSEMENT</span>
                    <p className="text-emerald-800 italic">&quot;{data.reportCard.principalRemarks}&quot;</p>
                  </div>
                </div>

                {/* Verification QR Hash */}
                <div className="rounded-lg bg-slate-100 p-3 flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-slate-500" />
                    <span>Cryptographic Verification Seal: {data.reportCard.verificationHash}</span>
                  </div>
                  <span className="text-emerald-700 font-bold">Tamper Proof</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-950">Report card moderation in progress</p>
                <p className="text-xs text-slate-400 mt-1">This term&apos;s results are currently undergoing departmental moderation.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: FEES & PAYSTACK BILLING */}
      {activeTab === 'FEES' && (
        <div className="space-y-6">
          {paymentResult && (
            <Alert
              type="success"
              title="Paystack Checkout Ready"
            >
              {paymentResult.message} Transaction Ref: {paymentResult.ref}
            </Alert>
          )}

          <div className="space-y-4">
            {data.invoices.map((inv) => (
              <Card key={inv.id} className="border border-slate-200 overflow-hidden shadow-institutional">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-600">{inv.invoiceNumber}</span>
                        {inv.status === 'PAID' ? (
                          <Badge variant="paid">Fully Settled</Badge>
                        ) : inv.status === 'PARTIAL' ? (
                          <Badge variant="pending">Partial Payment</Badge>
                        ) : (
                          <Badge variant="debt">Unpaid</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-navy-950">{inv.title}</CardTitle>
                      <CardDescription>Due Date: {inv.dueDate}</CardDescription>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">BALANCE DUE</span>
                      <span className={`text-xl font-extrabold ${inv.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        ₦{inv.balanceDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Line Items */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold">
                        <tr>
                          <th className="py-2 px-3">Item Description</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {inv.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-slate-800">{item.description}</td>
                            <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                              ₦{item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td className="py-2 px-3 text-navy-950">Total Bill</td>
                          <td className="py-2 px-3 text-right font-mono text-navy-950">
                            ₦{inv.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-emerald-700">Amount Paid</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700">
                            ₦{inv.amountPaid.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Payment Button Action */}
                  {inv.balanceDue > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-slate-500">
                        Secure instant checkout powered by <strong>Paystack Gateway</strong>. Supports Debit Cards, USSD, Bank Transfer & Apple Pay.
                      </p>

                      <Button
                        variant="primary"
                        onClick={() => handlePaystackPay(inv.id, inv.balanceDue)}
                        disabled={isProcessingPayment}
                        leftIcon={<CreditCard className="h-4 w-4" />}
                      >
                        {isProcessingPayment ? 'Initializing...' : `Pay ₦${inv.balanceDue.toLocaleString()} with Paystack`}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT RECEIPTS */}
      {activeTab === 'RECEIPTS' && (
        <div className="space-y-4">
          {data.recentReceipts.map((rec) => (
            <Card key={rec.id} className="border border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-navy-950">{rec.receiptNumber}</span>
                    <Badge variant="paid">Settled</Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Payment Method: <strong className="text-slate-800">{rec.paymentMethod}</strong>
                    {rec.paystackRef && ` • Gateway Ref: ${rec.paystackRef}`}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">{rec.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-emerald-700 font-mono">
                    ₦{rec.amount.toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    PDF Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
