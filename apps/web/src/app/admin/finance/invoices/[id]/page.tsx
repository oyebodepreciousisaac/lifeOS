'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Receipt,
  CreditCard,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Building,
  ExternalLink,
  RotateCcw,
  Plus,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

import {
  getInvoiceAction,
  recordManualPaymentAction,
  initializePaystackCheckoutAction,
  requestPaymentReversalAction,
} from '../../../../actions/finance';
import { StudentInvoice } from '../../../../../lib/finance/finance-types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = React.useState<StudentInvoice | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [paystackLoading, setPaystackLoading] = React.useState<boolean>(false);
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual Payment Modal
  const [manualPayOpen, setManualPayOpen] = React.useState<boolean>(false);
  const [payAmount, setPayAmount] = React.useState<number>(0);
  const [payMethod, setPayMethod] = React.useState<'BANK_TRANSFER' | 'POS' | 'CASH'>('BANK_TRANSFER');
  const [payRef, setPayRef] = React.useState<string>('');
  const [payNotes, setPayNotes] = React.useState<string>('');
  const [submittingPayment, setSubmittingPayment] = React.useState<boolean>(false);

  // Reversal Request Modal
  const [reversalOpen, setReversalOpen] = React.useState<boolean>(false);
  const [selectedReceiptNo, setSelectedReceiptNo] = React.useState<string>('');
  const [reversalReason, setReversalReason] = React.useState<string>('');
  const [submittingReversal, setSubmittingReversal] = React.useState<boolean>(false);

  const fetchInvoice = React.useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const res = await getInvoiceAction(invoiceId);
      if (res.success && res.data) {
        setInvoice(res.data);
        setPayAmount(res.data.balanceDue);
      } else {
        setNotification({ type: 'error', message: res.error || 'Invoice not found.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error fetching invoice.' });
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  React.useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Handle Paystack Checkout Initiation
  const handlePaystackCheckout = async () => {
    if (!invoice) return;
    setPaystackLoading(true);
    setNotification(null);

    const res = await initializePaystackCheckoutAction(
      invoice.id,
      invoice.guardianEmail,
      typeof window !== 'undefined' ? `${window.location.origin}/admin/finance/invoices/${invoice.id}?paid=1` : undefined
    );

    setPaystackLoading(false);
    if (res.success && res.data) {
      // In production / browser, redirect to Paystack authorization url
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Could not initialize Paystack payment session.',
      });
    }
  };

  // Handle Manual Payment Submission
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setSubmittingPayment(true);
    setNotification(null);

    const res = await recordManualPaymentAction({
      invoiceId: invoice.id,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      channel: payMethod.toLowerCase(),
      transactionReference: payRef || `TX-REC-${Date.now()}`,
      notes: payNotes,
    });

    setSubmittingPayment(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Payment of ₦${Number(payAmount).toLocaleString()} recorded! Receipt #${res.data.payment.receiptNumber} generated. Student ledger credited.`,
      });
      setManualPayOpen(false);
      fetchInvoice();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to record manual payment.',
      });
    }
  };

  // Handle Level 2 Reversal Request
  const handleRequestReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || !invoice.receiptNumbers || invoice.receiptNumbers.length === 0) return;

    setSubmittingReversal(true);
    setNotification(null);

    // Default to the first receipt or payment record
    const res = await requestPaymentReversalAction(
      `pay_${invoice.receiptNumbers[0]}`,
      reversalReason
    );

    setSubmittingReversal(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Payment reversal request #${res.data.id} submitted for Level 2 Maker-Checker review.`,
      });
      setReversalOpen(false);
      setReversalReason('');
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to request reversal.',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-slate-600">Retrieving official invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-xl text-center">
          <Alert type="error">
            <div className="flex-1 font-medium text-sm">Invoice {invoiceId} was not found.</div>
          </Alert>
          <div className="mt-4">
            <Link href="/admin/finance">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Return to Finance Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/finance"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Finance Hub
              </Link>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-xs font-bold text-emerald-800">{invoice.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Invoice
              </Button>

              {invoice.balanceDue > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setManualPayOpen(true)}
                    className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Record Bank / POS Payment
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePaystackCheckout}
                    disabled={paystackLoading}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 shadow-xs"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {paystackLoading ? 'Connecting...' : 'Pay with Paystack'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Notification */}
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

        {/* Printable Official Invoice Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          {/* Institutional Header */}
          <div className="flex flex-col justify-between border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                <Building className="h-3.5 w-3.5" /> KING'S COLLEGE LAGOS
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Official Student Bill & Invoicing Slip
              </h2>
              <p className="text-xs text-slate-500">
                3 Catholic Mission Street, Lagos Island • finance@kcl.edu.ng • +234 803 000 0000
              </p>
            </div>

            <div className="mt-4 sm:mt-0 sm:text-right">
              <Badge
                className={
                  invoice.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1'
                    : invoice.status === 'PARTIALLY_PAID'
                    ? 'bg-amber-100 text-amber-800 border-amber-200 text-xs px-3 py-1'
                    : 'bg-rose-100 text-rose-800 border-rose-200 text-xs px-3 py-1'
                }
              >
                {invoice.status}
              </Badge>
              <div className="mt-2 font-mono text-xs text-slate-500">
                Invoice ID: <span className="font-bold text-slate-900">{invoice.id}</span>
              </div>
              <div className="text-xs text-slate-500">
                Term: <span className="font-medium text-slate-800">{invoice.termName}</span>
              </div>
            </div>
          </div>

          {/* Student & Guardian Particulars */}
          <div className="grid grid-cols-1 gap-6 py-6 sm:grid-cols-2 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Billed Student
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">{invoice.studentName}</p>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                <div>Admission No: <span className="font-mono font-medium text-slate-800">{invoice.admissionNumber}</span></div>
                <div>Class Level: <span className="font-medium text-slate-800">{invoice.classLevelName} - {invoice.classArmName}</span></div>
                <div>Session: <span className="font-medium text-slate-800">{invoice.sessionName}</span></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Billing Recipient (Guardian)
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">{invoice.guardianName}</p>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                <div>Phone: <span className="font-medium text-slate-800">{invoice.guardianPhone}</span></div>
                <div>Email: <span className="font-medium text-slate-800">{invoice.guardianEmail}</span></div>
                <div>Due Date: <span className="font-bold text-rose-600">{invoice.dueDate}</span></div>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="py-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="font-semibold text-xs">#</TableHead>
                  <TableHead className="font-semibold text-xs">Fee Description</TableHead>
                  <TableHead className="font-semibold text-xs">Category</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Standard Fee (₦)</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Sibling Discount (₦)</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Net Amount (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-400">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-slate-900">{item.name}</div>
                      {item.discountReason && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          {item.discountReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" className="font-mono text-[10px] text-slate-600">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 text-right">
                      ₦{item.unitAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-emerald-600 text-right">
                      {item.discountAmount > 0 ? `-₦${item.discountAmount.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 text-right">
                      ₦{item.netAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Financial Summary Breakdown */}
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-xs space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-medium text-slate-900">₦{invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span>Sibling Discounts:</span>
                    <span>-₦{invoice.totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span>₦{invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Amount Paid to Date:</span>
                  <span>₦{invoice.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-rose-600">
                  <span>Balance Due:</span>
                  <span>₦{invoice.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Receipts & Reversals Section */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                Issued Payment Receipts ({invoice.receiptNumbers?.length || 0})
              </h3>
              {invoice.amountPaid > 0 && (
                <button
                  onClick={() => setReversalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                >
                  <RotateCcw className="h-3 w-3" /> Request L2 Maker-Checker Reversal
                </button>
              )}
            </div>

            {invoice.receiptNumbers && invoice.receiptNumbers.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {invoice.receiptNumbers.map((rec) => (
                  <div
                    key={rec}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">{rec}</div>
                      <div className="text-[10px] text-slate-500">Settled via Paystack / Bank Transfer</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500 italic">
                No payment receipts issued against this invoice yet.
              </p>
            )}
          </div>

          {/* Double Entry Ledger Footnote */}
          <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Double-Entry Audit-Grade Ledger Record
            </div>
            <p className="text-slate-300">
              This invoice forms an immutable DEBIT ledger event in the student's institutional account. Payments recorded via Paystack or manual teller reflect as immutable CREDIT events. No mutable balance columns are updated.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: RECORD MANUAL PAYMENT */}
      {manualPayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                Record Offline Payment
              </h3>
              <button
                onClick={() => setManualPayOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Amount (₦)</label>
                <Input
                  type="number"
                  min="1"
                  max={invoice.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="mt-1 font-bold text-emerald-700"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Maximum allowable: ₦{invoice.balanceDue.toLocaleString()}
                </p>
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
                    placeholder="e.g. ZEN-TX-00918"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Audit Notes</label>
                <Input
                  placeholder="Notes for bursary audit trail..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualPayOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPayment}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {submittingPayment ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LEVEL 2 REVERSAL REQUEST */}
      {reversalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-rose-600" />
                Request Payment Reversal
              </h3>
              <button
                onClick={() => setReversalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestReversal} className="mt-4 space-y-4">
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 space-y-1">
                <div className="font-bold">Level 2 Maker-Checker Requirement</div>
                <div>
                  This request will be sent to the Principal/Owner for cryptographic approval. Upon approval, a compensating DEBIT entry will be appended to the ledger.
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Mandatory Audit Justification
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-hidden"
                  placeholder="e.g. Bank reconciler identified duplicate charge settlement from Access Bank POS."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReversalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReversal}
                  variant="destructive"
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  {submittingReversal ? 'Submitting...' : 'Submit for L2 Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
