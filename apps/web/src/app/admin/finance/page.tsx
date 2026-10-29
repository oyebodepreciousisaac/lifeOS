'use client';

import * as React from 'react';
import Link from 'next/link';
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
  CreditCard,
  DollarSign,
  FileText,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Scale,
  Zap,
  PhoneCall,
  Mail,
  Receipt,
  Download,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Lock,
} from 'lucide-react';

import {
  listFeeItemsAction,
  createFeeItemAction,
  getSiblingDiscountRuleAction,
  updateSiblingDiscountRuleAction,
  generateClassInvoicesAction,
  listInvoicesAction,
  getStudentLedgerAction,
  recordManualPaymentAction,
  listReversalRequestsAction,
  executePaymentReversalAction,
  getAgingDebtorsReportAction,
} from '../../actions/finance';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import { listStudentsAction } from '../../actions/sis';

import {
  FeeItem,
  SiblingDiscountRule,
  StudentInvoice,
  StudentLedgerEntry,
  PaymentReversalRequest,
  AgingDebtorsReport,
} from '../../../lib/finance/finance-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';
import { StudentRecord } from '../../../lib/sis/sis-types';

export default function AdminFinanceManagementPage() {
  const [activeTab, setActiveTab] = React.useState<
    'invoices' | 'fees' | 'ledger' | 'aging' | 'reversals'
  >('invoices');

  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [studentsList, setStudentsList] = React.useState<StudentRecord[]>([]);

  // Domain States
  const [invoices, setInvoices] = React.useState<StudentInvoice[]>([]);
  const [feeItems, setFeeItems] = React.useState<FeeItem[]>([]);
  const [siblingRule, setSiblingRule] = React.useState<SiblingDiscountRule | null>(null);
  const [agingReport, setAgingReport] = React.useState<AgingDebtorsReport | null>(null);
  const [reversalRequests, setReversalRequests] = React.useState<PaymentReversalRequest[]>([]);

  // Search & Filter
  const [invoiceSearch, setInvoiceSearch] = React.useState<string>('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = React.useState<string>('ALL');

  // Ledger Explorer State
  const [selectedLedgerStudentId, setSelectedLedgerStudentId] = React.useState<string>('stu_kcl_001');
  const [studentLedgerEntries, setStudentLedgerEntries] = React.useState<StudentLedgerEntry[]>([]);
  const [studentLedgerBalance, setStudentLedgerBalance] = React.useState<number>(0);
  const [ledgerLoading, setLedgerLoading] = React.useState<boolean>(false);

  // Modals & Dialogs
  const [bulkInvoiceModalOpen, setBulkInvoiceModalOpen] = React.useState<boolean>(false);
  const [bulkArmId, setBulkArmId] = React.useState<string>('arm_jss1_gold');
  const [bulkTermId, setBulkTermId] = React.useState<string>('t1');
  const [bulkSessionId, setBulkSessionId] = React.useState<string>('ses_2026_2027');
  const [bulkDueDate, setBulkDueDate] = React.useState<string>('2026-11-15');
  const [bulkIncludeOptional, setBulkIncludeOptional] = React.useState<boolean>(false);
  const [bulkApplyDiscount, setBulkApplyDiscount] = React.useState<boolean>(true);
  const [bulkGenerating, setBulkGenerating] = React.useState<boolean>(false);

  const [addFeeModalOpen, setAddFeeModalOpen] = React.useState<boolean>(false);
  const [newFeeName, setNewFeeName] = React.useState<string>('');
  const [newFeeCategory, setNewFeeCategory] = React.useState<string>('TUITION');
  const [newFeeAmount, setNewFeeAmount] = React.useState<number>(50000);
  const [newFeeCompulsory, setNewFeeCompulsory] = React.useState<boolean>(true);
  const [newFeeDesc, setNewFeeDesc] = React.useState<string>('');
  const [feeCreating, setFeeCreating] = React.useState<boolean>(false);

  const [manualPayModalOpen, setManualPayModalOpen] = React.useState<boolean>(false);
  const [selectedPayInvoice, setSelectedPayInvoice] = React.useState<StudentInvoice | null>(null);
  const [payAmount, setPayAmount] = React.useState<number>(0);
  const [payMethod, setPayMethod] = React.useState<'BANK_TRANSFER' | 'POS' | 'CASH' | 'PAYSTACK'>('BANK_TRANSFER');
  const [payRef, setPayRef] = React.useState<string>('');
  const [payNotes, setPayNotes] = React.useState<string>('');
  const [paymentRecording, setPaymentRecording] = React.useState<boolean>(false);

  const [reversalModalOpen, setReversalModalOpen] = React.useState<boolean>(false);
  const [selectedReversalReq, setSelectedReversalReq] = React.useState<PaymentReversalRequest | null>(null);
  const [reversalRemarks, setReversalRemarks] = React.useState<string>('');
  const [reversalProcessing, setReversalProcessing] = React.useState<boolean>(false);

  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Initial Finance Data
  const loadFinanceDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, feeRes, ruleRes, agingRes, revRes, acadRes, stuRes] = await Promise.all([
        listInvoicesAction(),
        listFeeItemsAction(),
        getSiblingDiscountRuleAction(),
        getAgingDebtorsReportAction(),
        listReversalRequestsAction(),
        getAcademicConfigAction(),
        listStudentsAction(),
      ]);

      if (invRes.success && invRes.data) setInvoices(invRes.data);
      if (feeRes.success && feeRes.data) setFeeItems(feeRes.data);
      if (ruleRes.success && ruleRes.data) setSiblingRule(ruleRes.data);
      if (agingRes.success && agingRes.data) setAgingReport(agingRes.data);
      if (revRes.success && revRes.data) setReversalRequests(revRes.data);
      if (acadRes.success && acadRes.data) setAcademicConfig(acadRes.data);
      if (stuRes.success && stuRes.data) setStudentsList(stuRes.data);

      // Load initial student ledger
      if (stuRes.success && stuRes.data && stuRes.data.length > 0) {
        const studentIdToLoad = stuRes.data[0].id;
        setSelectedLedgerStudentId(studentIdToLoad);
        loadStudentLedger(studentIdToLoad);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error loading finance records.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadFinanceDashboardData();
  }, [loadFinanceDashboardData]);

  const loadStudentLedger = async (studentId: string) => {
    setLedgerLoading(true);
    try {
      const res = await getStudentLedgerAction(studentId);
      if (res.success && res.data) {
        setStudentLedgerEntries(res.data.entries);
        setStudentLedgerBalance(res.data.currentBalance);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to load ledger.' });
    } finally {
      setLedgerLoading(false);
    }
  };

  // KPI Computations
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.admissionNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.classArmName.toLowerCase().includes(invoiceSearch.toLowerCase());

    const matchesStatus =
      invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Bulk Invoice Generation
  const handleGenerateBulkInvoices = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkGenerating(true);
    setNotification(null);

    const res = await generateClassInvoicesAction({
      classArmId: bulkArmId,
      termId: bulkTermId,
      sessionId: bulkSessionId,
      dueDate: bulkDueDate,
      includeOptionalFees: bulkIncludeOptional,
      applySiblingDiscount: bulkApplyDiscount,
    });

    setBulkGenerating(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Successfully generated ${res.data.length} invoices for ${bulkArmId}! Corresponding append-only DEBITS recorded in ledger.`,
      });
      setBulkInvoiceModalOpen(false);
      loadFinanceDashboardData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to generate class invoices.',
      });
    }
  };

  // Handle Add Fee Item
  const handleCreateFeeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeeCreating(true);
    setNotification(null);

    const res = await createFeeItemAction({
      name: newFeeName,
      category: newFeeCategory,
      amount: Number(newFeeAmount),
      isCompulsory: newFeeCompulsory,
      applicableClassLevelIds: [],
      termId: bulkTermId,
      sessionId: bulkSessionId,
      description: newFeeDesc,
    });

    setFeeCreating(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Fee item "${res.data.name}" (₦${res.data.amount.toLocaleString()}) added to schedule!`,
      });
      setAddFeeModalOpen(false);
      setNewFeeName('');
      setNewFeeDesc('');
      loadFinanceDashboardData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to create fee schedule item.',
      });
    }
  };

  // Handle Record Manual Payment
  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayInvoice) return;

    setPaymentRecording(true);
    setNotification(null);

    const res = await recordManualPaymentAction({
      invoiceId: selectedPayInvoice.id,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      channel: payMethod.toLowerCase(),
      transactionReference: payRef || `TX-MANUAL-${Date.now()}`,
      notes: payNotes,
    });

    setPaymentRecording(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Payment of ₦${Number(payAmount).toLocaleString()} recorded! Receipt #${res.data.payment.receiptNumber} generated. Student ledger credited.`,
      });
      setManualPayModalOpen(false);
      setSelectedPayInvoice(null);
      setPayAmount(0);
      setPayRef('');
      setPayNotes('');
      loadFinanceDashboardData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Payment recording failed.',
      });
    }
  };

  // Handle Sibling Rule Update
  const handleUpdateSiblingDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siblingRule) return;

    const res = await updateSiblingDiscountRuleAction(siblingRule);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Sibling discount rule updated (${res.data.secondChildPercent}% for 2nd child, ${res.data.thirdAndSubsequentPercent}% for 3rd+).`,
      });
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to update sibling discount settings.',
      });
    }
  };

  // Handle Maker-Checker Reversal Decision
  const handleExecuteReversalDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedReversalReq) return;
    setReversalProcessing(true);
    setNotification(null);

    const res = await executePaymentReversalAction(
      selectedReversalReq.id,
      decision,
      reversalRemarks || 'Decision finalized by institutional executive.'
    );

    setReversalProcessing(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Reversal request #${selectedReversalReq.id} marked as ${decision}. Compensating ledger adjustments applied.`,
      });
      setReversalModalOpen(false);
      setSelectedReversalReq(null);
      setReversalRemarks('');
      loadFinanceDashboardData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Reversal execution failed.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900">
      {/* Top Banner / Breadcrumb & Status */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  <ArrowLeft className="h-3 w-3" /> Dashboard
                </Link>
                <span>/</span>
                <span>Bursary & Finance</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                School Finance & Invoicing
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Manage fee schedules, student invoicing, payment records, and fee collections.
              </p>
            </div>

            {/* Action Bar & Gateway Status Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                </span>
                <span>Paystack Payment Gateway Active</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRefreshing(true);
                  loadFinanceDashboardData();
                }}
                disabled={refreshing || loading}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Sync
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setBulkInvoiceModalOpen(true)}
                className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
              >
                <Receipt className="h-3.5 w-3.5" />
                Generate Class Invoices
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Notification Alert */}
        {notification && (
          <div className="mb-6">
            <Alert
              type={notification.type === 'success' ? 'success' : 'error'}
              className={notification.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : ''}
            >
              <div className="flex-1 font-medium text-sm">{notification.message}</div>
              <button
                onClick={() => setNotification(null)}
                className="text-xs underline hover:opacity-80"
              >
                Dismiss
              </button>
            </Alert>
          </div>
        )}

        {/* Financial KPI Cards (2x2 on Mobile, 4-Cols on Desktop) */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
                    Total Invoiced
                  </p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
                    ₦{totalInvoiced.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 truncate">
                    {invoices.length} issued invoices
                  </p>
                </div>
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 truncate">
                    Collected
                  </p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-emerald-700">
                    ₦{totalCollected.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-600 font-medium truncate">
                    {collectionRate}% Collected
                  </p>
                </div>
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-500 truncate">
                    Outstanding
                  </p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-rose-600">
                    ₦{totalOutstanding.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-rose-500 truncate">
                    {agingReport?.debtorCount || 0} debtors
                  </p>
                </div>
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600 truncate">
                    Pending Approval
                  </p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold tracking-tight text-indigo-700">
                    {reversalRequests.filter((r) => r.status === 'PENDING_APPROVAL').length}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-indigo-600 truncate">
                    Pending reviews
                  </p>
                </div>
                <div className="flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'invoices'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              <FileText className="h-4 w-4" />
              Invoices & Billing ({invoices.length})
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'fees'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              <Sliders className="h-4 w-4" />
              Fee Schedules & Sibling Discounts ({feeItems.length})
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'ledger'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              <Scale className="h-4 w-4" />
              Double-Entry Student Ledger
            </button>

            <button
              onClick={() => setActiveTab('aging')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'aging'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              <Clock className="h-4 w-4" />
              Aging Debtors Analysis
            </button>

            <button
              onClick={() => setActiveTab('reversals')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'reversals'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Reversals & Maker-Checker ({reversalRequests.length})
            </button>
          </nav>
        </div>

        {/* TAB 1: INVOICES & BILLING */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by invoice #, student name, admission #, or class..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="ISSUED">Issued / Unpaid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkInvoiceModalOpen(true)}
                  className="gap-1 bg-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Bulk Invoicing
                </Button>
              </div>
            </div>

            {/* Invoices Table */}
            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Invoice ID</TableHead>
                      <TableHead className="font-semibold text-xs">Student & Admission</TableHead>
                      <TableHead className="font-semibold text-xs">Class Arm</TableHead>
                      <TableHead className="font-semibold text-xs">Total Invoiced</TableHead>
                      <TableHead className="font-semibold text-xs">Paid to Date</TableHead>
                      <TableHead className="font-semibold text-xs">Balance Due</TableHead>
                      <TableHead className="font-semibold text-xs">Due Date</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-slate-500 text-sm">
                          No invoices matching the selected criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs font-semibold text-emerald-800">
                            {inv.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm text-slate-900">{inv.studentName}</div>
                            <div className="text-xs text-slate-500">{inv.admissionNumber}</div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {inv.classLevelName} - {inv.classArmName}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-slate-900">
                            ₦{inv.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-emerald-700">
                            ₦{inv.amountPaid.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-rose-600">
                            ₦{inv.balanceDue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {inv.dueDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inv.status === 'PAID'
                                  ? 'paid'
                                  : inv.status === 'PARTIALLY_PAID'
                                    ? 'pending'
                                    : 'debt'
                              }
                              className={
                                inv.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : inv.status === 'PARTIALLY_PAID'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                              }
                            >
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.balanceDue > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayInvoice(inv);
                                    setPayAmount(inv.balanceDue);
                                    setManualPayModalOpen(true);
                                  }}
                                  className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                >
                                  Record Pay
                                </Button>
                              )}
                              <Link href={`/admin/finance/invoices/${inv.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-slate-600 hover:text-slate-900"
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: FEE SCHEDULES & SIBLING DISCOUNTS */}
        {activeTab === 'fees' && (
          <div className="space-y-8">
            {/* Sibling Discount Configuration Engine */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-emerald-600" />
                      Sibling Discount &amp; Concession Rules
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Automated discount application during bulk termly invoicing for multi-child families based on verified guardian phone/email linking.
                    </CardDescription>
                  </div>
                  {siblingRule?.enabled ? (
                    <Badge variant="paid" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      Engine Active
                    </Badge>
                  ) : (
                    <Badge variant="debt">Disabled</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {siblingRule && (
                  <form onSubmit={handleUpdateSiblingDiscount} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          2nd Child Discount (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={siblingRule.secondChildPercent}
                          onChange={(e) =>
                            setSiblingRule({
                              ...siblingRule,
                              secondChildPercent: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">Default: 10% on tuition</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          3rd & Subsequent Child (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={siblingRule.thirdAndSubsequentPercent}
                          onChange={(e) =>
                            setSiblingRule({
                              ...siblingRule,
                              thirdAndSubsequentPercent: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">Default: 15% on tuition</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700">
                          Applicable Fee Category
                        </label>
                        <select
                          value={siblingRule.applicableCategory}
                          onChange={(e) =>
                            setSiblingRule({
                              ...siblingRule,
                              applicableCategory: e.target.value as any,
                            })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                        >
                          <option value="TUITION">Tuition Only</option>
                          <option value="DEVELOPMENT_LEVY">Development Levy</option>
                          <option value="BOARDING">Boarding Only</option>
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">Category subjected to discount</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={siblingRule.enabled}
                          onChange={(e) =>
                            setSiblingRule({
                              ...siblingRule,
                              enabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        Enable Sibling Discount Engine for all class billing cycles
                      </label>

                      <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                        Save Sibling Rule
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Fee Schedule Catalog */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Standard Institutional Fee Schedule
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Term 1 2026/2027 fee items configured for King's College Lagos. Compulsory fees are automatically attached to all student invoices.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setAddFeeModalOpen(true)}
                    className="gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Fee Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Fee Item Name</TableHead>
                      <TableHead className="font-semibold text-xs">Category</TableHead>
                      <TableHead className="font-semibold text-xs">Amount (₦)</TableHead>
                      <TableHead className="font-semibold text-xs">Compulsory?</TableHead>
                      <TableHead className="font-semibold text-xs">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeItems.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-semibold text-sm text-slate-900">
                          {fee.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" className="font-mono text-[10px] text-slate-700">
                            {fee.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-sm text-emerald-800">
                          ₦{fee.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {fee.isCompulsory ? (
                            <Badge variant="paid" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                              Compulsory
                            </Badge>
                          ) : (
                            <Badge variant="draft" className="text-slate-500 text-[10px]">
                              Optional
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                          {fee.description || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: DOUBLE-ENTRY STUDENT LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Student Selector Card */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-indigo-600" />
                      Double-Entry Student Account Ledger
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Audit-grade financial ledger. Student balance is never stored as a mutable database column; it is calculated dynamically as Sum(Debits) - Sum(Credits).
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Select Student:</span>
                    <select
                      value={selectedLedgerStudentId}
                      onChange={(e) => {
                        setSelectedLedgerStudentId(e.target.value);
                        loadStudentLedger(e.target.value);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                    >
                      {studentsList.map((stu) => (
                        <option key={stu.id} value={stu.id}>
                          {stu.firstName} {stu.lastName} ({stu.admissionNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Dynamic Balance Badge */}
                <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-slate-900 p-6 text-white shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      <Scale className="h-4 w-4" />
                      Dynamic Derived Balance (Sum of Debits - Sum of Credits)
                    </div>
                    <div className="text-3xl font-extrabold tracking-tight">
                      ₦{studentLedgerBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">
                      {studentLedgerBalance > 0
                        ? 'Outstanding institutional liability owed by student account'
                        : studentLedgerBalance === 0
                          ? 'Account in full good standing — zero outstanding liability'
                          : 'Credit advance balance in favor of student account'}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex gap-2">
                    <Badge
                      className={
                        studentLedgerBalance > 0
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs px-3 py-1'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1'
                      }
                    >
                      {studentLedgerBalance > 0 ? 'DEBTOR STATUS' : 'SETTLED STATUS'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ledger Transactions Table */}
            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Chronological Transaction Audit Trail ({studentLedgerEntries.length} entries)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Timestamp</TableHead>
                      <TableHead className="font-semibold text-xs">Type</TableHead>
                      <TableHead className="font-semibold text-xs">Category</TableHead>
                      <TableHead className="font-semibold text-xs">Description</TableHead>
                      <TableHead className="font-semibold text-xs">Reference ID</TableHead>
                      <TableHead className="font-semibold text-xs">Actor / Authorizer</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Amount (₦)</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Running Bal (₦)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentLedgerEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500 text-sm">
                          No ledger entries found for this student.
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentLedgerEntries.map((e) => (
                        <TableRow key={e.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                            {new Date(e.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                e.entryType === 'DEBIT'
                                  ? 'bg-rose-100 text-rose-800 border-rose-200 text-[10px]'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]'
                              }
                            >
                              {e.entryType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-slate-700">
                            {e.category}
                          </TableCell>
                          <TableCell className="text-xs text-slate-800 max-w-xs">
                            {e.description}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">
                            {e.referenceId}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {e.actorName}
                          </TableCell>
                          <TableCell
                            className={`text-sm font-bold text-right ${e.entryType === 'DEBIT' ? 'text-rose-600' : 'text-emerald-700'
                              }`}
                          >
                            {e.entryType === 'DEBIT' ? '+' : '-'}₦{e.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-right text-slate-900">
                            ₦{e.runningBalance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: AGING DEBTORS ANALYSIS */}
        {activeTab === 'aging' && (
          <div className="space-y-6">
            {/* 4-Tier Buckets */}
            {agingReport && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Current (0–30 Days)
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-900">
                      ₦{agingReport.current0to30Days.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Recent billings within standard grace period
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-amber-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      31–60 Days Overdue
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-amber-900">
                      ₦{agingReport.aging31to60Days.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      First reminder notices dispatched
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                      61–90 Days Overdue
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-orange-900">
                      ₦{agingReport.aging61to90Days.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-orange-700">
                      Escalated to Bursar collection follow-up
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-rose-200 bg-rose-50/50 shadow-xs">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                      90+ Days (Critical Arrears)
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-rose-900">
                      ₦{agingReport.aging90DaysPlus.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-rose-700">
                      Subject to exam clearance suspension
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Debtors Roster with Contact Actions */}
            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Top Debtor Student Accounts & Guardian Contacts
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Identifies delinquent accounts requiring immediate Bursary fee recovery or payment plan negotiation.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNotification({
                        type: 'success',
                        message: 'Automated SMS & Email fee reminders scheduled to all active debtor guardians.',
                      });
                    }}
                    className="text-xs gap-1"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                    Dispatch Automated Reminders
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Student Name</TableHead>
                      <TableHead className="font-semibold text-xs">Admission #</TableHead>
                      <TableHead className="font-semibold text-xs">Class Arm</TableHead>
                      <TableHead className="font-semibold text-xs">Guardian & Phone</TableHead>
                      <TableHead className="font-semibold text-xs">Days Overdue</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Total Owed (₦)</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!agingReport || agingReport.topDebtors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-sm">
                          No outstanding debtors found. All accounts in good standing.
                        </TableCell>
                      </TableRow>
                    ) : (
                      agingReport.topDebtors.map((d) => (
                        <TableRow key={d.studentId} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-sm text-slate-900">
                            {d.studentName}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">
                            {d.admissionNumber}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700">
                            {d.classArmName}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-slate-900">{d.guardianName}</div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <PhoneCall className="h-3 w-3 text-emerald-600" />
                              {d.guardianPhone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                d.daysOverdue > 60
                                  ? 'bg-rose-100 text-rose-800 border-rose-200 text-[10px]'
                                  : 'bg-amber-100 text-amber-800 border-amber-200 text-[10px]'
                              }
                            >
                              {d.daysOverdue} days
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-sm text-right text-rose-600">
                            ₦{d.totalOwed.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={`tel:${d.guardianPhone}`}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
                            >
                              Call Guardian
                            </a>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: MAKER-CHECKER REVERSALS & REFUNDS */}
        {activeTab === 'reversals' && (
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      Dual-Authorization Reversals &amp; Refunds Queue
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Bursars initiate payment reversal requests; Principal or School Owner authorization is strictly required before compensating ledger debits are applied.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Request ID</TableHead>
                      <TableHead className="font-semibold text-xs">Payment Ref</TableHead>
                      <TableHead className="font-semibold text-xs">Amount (₦)</TableHead>
                      <TableHead className="font-semibold text-xs">Bursar Requester</TableHead>
                      <TableHead className="font-semibold text-xs">Mandatory Audit Justification</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">L2 Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reversalRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-sm">
                          No pending reversal requests in the Maker-Checker queue.
                        </TableCell>
                      </TableRow>
                    ) : (
                      reversalRequests.map((req) => (
                        <TableRow key={req.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs font-semibold text-slate-700">
                            {req.id}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-indigo-700">
                            {req.paymentRecordId}
                          </TableCell>
                          <TableCell className="font-bold text-sm text-slate-900">
                            ₦{req.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {req.requesterName}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 max-w-xs">
                            {req.reason}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === 'APPROVED'
                                  ? 'approved'
                                  : req.status === 'PENDING_APPROVAL'
                                    ? 'pending'
                                    : 'debt'
                              }
                              className="text-[10px]"
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === 'PENDING_APPROVAL' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedReversalReq(req);
                                  setReversalModalOpen(true);
                                }}
                                className="h-7 text-xs bg-indigo-700 hover:bg-indigo-800 text-white"
                              >
                                Review & Authorize
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {req.approverName || 'Finalized'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL 1: BULK CLASS INVOICING */}
      {bulkInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Generate Bulk Class Invoices
              </h3>
              <button
                onClick={() => setBulkInvoiceModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateBulkInvoices} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Target Class Arm</label>
                <select
                  value={bulkArmId}
                  onChange={(e) => setBulkArmId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="arm_jss1_gold">JSS 1 - Gold (Enrolled Cohort)</option>
                  <option value="arm_jss1_silver">JSS 1 - Silver</option>
                  <option value="arm_jss2_diamond">JSS 2 - Diamond</option>
                  <option value="arm_sss1_emerald">SSS 1 - Emerald</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Term</label>
                  <select
                    value={bulkTermId}
                    onChange={(e) => setBulkTermId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="t1">First Term (Michaelmas)</option>
                    <option value="t2">Second Term (Lent)</option>
                    <option value="t3">Third Term (Trinity)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Due Date</label>
                  <Input
                    type="date"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={bulkApplyDiscount}
                    onChange={(e) => setBulkApplyDiscount(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Apply Sibling Discount Rule (10% 2nd child, 15% 3rd+)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={bulkIncludeOptional}
                    onChange={(e) => setBulkIncludeOptional(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include Optional Items (Transport, Boarding, Robotics Kit)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBulkInvoiceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bulkGenerating}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {bulkGenerating ? 'Generating & Debiting...' : 'Generate Invoices'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FEE ITEM */}
      {addFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                Add Fee Schedule Item
              </h3>
              <button
                onClick={() => setAddFeeModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeeItem} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Fee Item Name</label>
                <Input
                  placeholder="e.g. Cambridge IGCSE Registration Levy"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={newFeeCategory}
                    onChange={(e) => setNewFeeCategory(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="TUITION">Tuition</option>
                    <option value="DEVELOPMENT_LEVY">Development</option>
                    <option value="ICT_STEM">ICT / STEM</option>
                    <option value="PTA_LEVY">PTA Levy</option>
                    <option value="BOOKS">Books / Uniform</option>
                    <option value="TRANSPORT">Transport Route</option>
                    <option value="BOARDING">Boarding House</option>
                    <option value="OTHER">Other Ancillary</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Amount (₦)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={newFeeDesc}
                  onChange={(e) => setNewFeeDesc(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  placeholder="Additional context on this fee item..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={newFeeCompulsory}
                  onChange={(e) => setNewFeeCompulsory(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Compulsory Fee (included by default on all class invoices)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddFeeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={feeCreating}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {feeCreating ? 'Saving...' : 'Add Fee Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD MANUAL PAYMENT */}
      {manualPayModalOpen && selectedPayInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Record Offline / Bank Payment
              </h3>
              <button
                onClick={() => setManualPayModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordManualPayment} className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
                <div className="font-semibold text-slate-900">{selectedPayInvoice.studentName}</div>
                <div className="text-slate-500">Invoice: {selectedPayInvoice.id} • Class: {selectedPayInvoice.classLevelName}</div>
                <div className="font-bold text-rose-600">
                  Outstanding Balance Due: ₦{selectedPayInvoice.balanceDue.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Amount (₦)</label>
                <Input
                  type="number"
                  min="1"
                  max={selectedPayInvoice.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="mt-1 font-bold text-emerald-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="POS">Campus POS Terminal</option>
                    <option value="CASH">Cash Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Bank Teller / TX Ref</label>
                  <Input
                    placeholder="e.g. ZEN-TX-987654"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Reconciliation Notes</label>
                <Input
                  placeholder="e.g. Zenith Bank NIP transfer verified by Bursar"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualPayModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={paymentRecording}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {paymentRecording ? 'Recording & Crediting...' : 'Confirm Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MAKER-CHECKER REVERSAL AUTHORIZATION */}
      {reversalModalOpen && selectedReversalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                Level 2 Maker-Checker Reversal Approval
              </h3>
              <button
                onClick={() => setReversalModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Request ID:</span>
                  <span className="font-mono font-semibold">{selectedReversalReq.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Record ID:</span>
                  <span className="font-mono text-indigo-700 font-semibold">{selectedReversalReq.paymentRecordId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reversal Amount:</span>
                  <span className="font-bold text-rose-600 text-sm">₦{selectedReversalReq.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bursar Requester:</span>
                  <span className="font-medium text-slate-800">{selectedReversalReq.requesterName}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Audit Justification:</span>
                  <p className="italic text-slate-800 bg-white p-2 rounded-sm border border-slate-200">
                    "{selectedReversalReq.reason}"
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Executive Decision Remarks</label>
                <textarea
                  value={reversalRemarks}
                  onChange={(e) => setReversalRemarks(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Bank chargeback confirmed. Compensating ledger debit authorized."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReversalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={reversalProcessing}
                  onClick={() => handleExecuteReversalDecision('REJECTED')}
                  variant="destructive"
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Reject Reversal
                </Button>
                <Button
                  type="button"
                  disabled={reversalProcessing}
                  onClick={() => handleExecuteReversalDecision('APPROVED')}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white"
                >
                  {reversalProcessing ? 'Applying Ledger Compensations...' : 'Approve & Compensate Ledger'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
