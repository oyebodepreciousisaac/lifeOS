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
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  Users,
  Radio,
  FileText,
  CheckCheck,
  Zap,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';

import {
  listNotificationsAction,
  listTemplatesAction,
  saveTemplateAction,
  sendTargetedBroadcastAction,
  getCommunicationDashboardMetricsAction,
} from '../../actions/communication';

import {
  NotificationRecord,
  NotificationTemplate,
  BroadcastSummary,
  CommunicationDashboardMetrics,
  NotificationChannel,
  NotificationCategory,
  BroadcastTargetScope,
} from '../../../lib/communication/communication-types';

export default function AdminCommunicationsPage() {
  const [activeTab, setActiveTab] = React.useState<'logs' | 'templates' | 'broadcasts'>('logs');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  // Domain State
  const [notifications, setNotifications] = React.useState<NotificationRecord[]>([]);
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([]);
  const [metrics, setMetrics] = React.useState<CommunicationDashboardMetrics | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedChannelFilter, setSelectedChannelFilter] = React.useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('ALL');

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = React.useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = React.useState<string>('');
  const [broadcastCategory, setBroadcastCategory] = React.useState<NotificationCategory>('CAMPUS_BROADCAST');
  const [broadcastChannels, setBroadcastChannels] = React.useState<NotificationChannel[]>(['IN_APP', 'SMS']);
  const [broadcastScope, setBroadcastScope] = React.useState<BroadcastTargetScope>('ENTIRE_SCHOOL');
  const [broadcastArmId, setBroadcastArmId] = React.useState<string>('arm_jss1_gold');
  const [broadcastSubject, setBroadcastSubject] = React.useState<string>('');
  const [broadcastBody, setBroadcastBody] = React.useState<string>('');
  const [sendingBroadcast, setSendingBroadcast] = React.useState<boolean>(false);

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = React.useState<boolean>(false);
  const [templateName, setTemplateName] = React.useState<string>('');
  const [templateCategory, setTemplateCategory] = React.useState<NotificationCategory>('FEE_INVOICE_ISSUED');
  const [templateChannel, setTemplateChannel] = React.useState<NotificationChannel>('SMS');
  const [templateSubject, setTemplateSubject] = React.useState<string>('');
  const [templateContent, setTemplateContent] = React.useState<string>('');
  const [savingTemplate, setSavingTemplate] = React.useState<boolean>(false);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = React.useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = React.useState<NotificationRecord | null>(null);

  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [notifsRes, tplsRes, metricsRes] = await Promise.all([
        listNotificationsAction(),
        listTemplatesAction(),
        getCommunicationDashboardMetricsAction(),
      ]);

      if (notifsRes.success && notifsRes.data) setNotifications(notifsRes.data);
      if (tplsRes.success && tplsRes.data) setTemplates(tplsRes.data);
      if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error loading records.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Channel Toggle in Broadcast Modal
  const toggleBroadcastChannel = (ch: NotificationChannel) => {
    if (broadcastChannels.includes(ch)) {
      if (broadcastChannels.length > 1) {
        setBroadcastChannels(broadcastChannels.filter((c) => c !== ch));
      }
    } else {
      setBroadcastChannels([...broadcastChannels, ch]);
    }
  };

  // Handle Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setNotification(null);

    const res = await sendTargetedBroadcastAction({
      title: broadcastTitle,
      category: broadcastCategory,
      channels: broadcastChannels,
      targetScope: broadcastScope,
      targetScopeId: broadcastScope === 'CLASS_ARM' ? broadcastArmId : undefined,
      targetScopeName:
        broadcastScope === 'ENTIRE_SCHOOL'
          ? 'Entire School Community'
          : broadcastScope === 'CLASS_ARM'
          ? 'JSS 1 Gold Cohort'
          : 'Active Debtors',
      subject: broadcastSubject || undefined,
      body: broadcastBody,
    });

    setSendingBroadcast(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Broadcast "${res.data.title}" successfully dispatched to ${res.data.totalRecipients} recipients across ${res.data.channels.join(', ')}!`,
      });
      setBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastBody('');
      setBroadcastSubject('');
      loadData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to dispatch broadcast.',
      });
    }
  };

  // Handle Save Template
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTemplate(true);
    setNotification(null);

    const res = await saveTemplateAction({
      name: templateName,
      category: templateCategory,
      defaultChannel: templateChannel,
      subject: templateSubject || undefined,
      content: templateContent,
    });

    setSavingTemplate(false);
    if (res.success && res.data) {
      setNotification({
        type: 'success',
        message: `Template "${res.data.name}" saved with ${res.data.availableMergeTags.length} dynamic merge tags.`,
      });
      setTemplateModalOpen(false);
      setTemplateName('');
      setTemplateContent('');
      setTemplateSubject('');
      loadData();
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to save template.',
      });
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.recipient.phonePrimary && n.recipient.phonePrimary.includes(searchQuery)) ||
      (n.recipient.email && n.recipient.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel =
      selectedChannelFilter === 'ALL' || n.channel === selectedChannelFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' || n.status === selectedStatusFilter;
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || n.category === selectedCategoryFilter;

    return matchesSearch && matchesChannel && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900">
      {/* Top Banner / Header */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 hover:text-emerald-800"
                >
                  <ArrowLeft className="h-3 w-3" /> Dashboard
                </Link>
                <span>/</span>
                <span>Parent & Staff Communications</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Multi-Channel Communication & Notifications
              </h1>
              <p className="text-sm text-slate-600">
                Termii SMS (DND Bypass) • WhatsApp Cloud API • Resend Email • In-App Notification Drawer • Targeted Broadcasts
              </p>
            </div>

            {/* Action Bar & Gateways */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                </span>
                <span>Termii SMS & WhatsApp Active</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRefreshing(true);
                  loadData();
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
                onClick={() => setBroadcastModalOpen(true)}
                className="gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                New Targeted Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
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

        {/* Operational Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Dispatches
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {metrics?.totalMessagesSent || 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Across 4 active providers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Delivery Success Rate
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700">
                    {metrics?.deliverySuccessRate || 100}%
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    Automated DND retry active
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Termii SMS Balance
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-blue-700">
                    {metrics?.smsCreditsRemaining.toLocaleString() || '2,450'}
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    Credits remaining for Nigerian routes
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Smartphone className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Active Templates
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-indigo-700">
                    {templates.length}
                  </p>
                  <p className="mt-1 text-xs text-indigo-600">
                    Pre-seeded institutional triggers
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'logs'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Delivery Log & Message Stream ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'templates'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Template Library & Merge Tags ({templates.length})
            </button>
          </nav>
        </div>

        {/* TAB 1: MESSAGE STREAM & DELIVERY MONITOR */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search recipient name, phone, email, or message content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedChannelFilter}
                  onChange={(e) => setSelectedChannelFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">All Channels</option>
                  <option value="SMS">Termii SMS</option>
                  <option value="WHATSAPP">WhatsApp Cloud</option>
                  <option value="EMAIL">Resend Email</option>
                  <option value="IN_APP">In-App Notification</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="READ">Read</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="ALL">All Categories</option>
                  <option value="FEE_INVOICE_ISSUED">Fee Invoice</option>
                  <option value="PAYMENT_RECEIPT_CONFIRMED">Payment Receipt</option>
                  <option value="OVERDUE_DEBT_REMINDER">Overdue Debt</option>
                  <option value="STUDENT_ABSENCE_ALERT">Absence Alert</option>
                  <option value="CAMPUS_BROADCAST">Campus Broadcast</option>
                </select>
              </div>
            </div>

            {/* Notification Stream Table */}
            <Card className="border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/75">
                      <TableHead className="font-semibold text-xs">Timestamp</TableHead>
                      <TableHead className="font-semibold text-xs">Channel</TableHead>
                      <TableHead className="font-semibold text-xs">Category</TableHead>
                      <TableHead className="font-semibold text-xs">Recipient</TableHead>
                      <TableHead className="font-semibold text-xs">Message Excerpt</TableHead>
                      <TableHead className="font-semibold text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                          No communication dispatches found matching your filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <TableRow key={notif.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                            {new Date(notif.queuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.queuedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="neutral"
                              className={
                                notif.channel === 'SMS'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : notif.channel === 'WHATSAPP'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : notif.channel === 'EMAIL'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }
                            >
                              {notif.channel}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-slate-700">
                            {notif.category}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-xs text-slate-900">{notif.recipient.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {notif.recipient.phonePrimary || notif.recipient.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-800 max-w-sm truncate">
                            {notif.body}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                notif.status === 'DELIVERED' || notif.status === 'READ'
                                  ? 'paid'
                                  : notif.status === 'SENT' || notif.status === 'QUEUED'
                                  ? 'pending'
                                  : 'debt'
                              }
                              className="text-[10px]"
                            >
                              {notif.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedMessage(notif);
                                setDetailModalOpen(true);
                              }}
                              className="h-7 text-xs text-slate-600 hover:text-slate-900"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
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

        {/* TAB 2: TEMPLATE LIBRARY */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      Standard Institutional Notification Templates
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Standard templates with dynamic merge tags automatically populated during attendance, finance, and report card triggers.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setTemplateModalOpen(true)}
                    className="gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{tpl.name}</h4>
                            <Badge variant="neutral" className="text-[10px]">
                              {tpl.defaultChannel}
                            </Badge>
                            <Badge variant="paid" className="text-[10px]">
                              {tpl.category}
                            </Badge>
                          </div>
                          {tpl.subject && (
                            <div className="text-xs font-semibold text-slate-600">
                              Subject: <span className="font-normal text-slate-800">{tpl.subject}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-800 font-mono border border-slate-200">
                        {tpl.content}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Available Tags:</span>
                        {tpl.availableMergeTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700 border border-emerald-200"
                          >
                            {`{{${tag}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL 1: NEW TARGETED BROADCAST */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" />
                Dispatch Targeted Broadcast
              </h3>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Broadcast Title / Internal Reference</label>
                <Input
                  placeholder="e.g. Mid-Term Break Exeat & Gate-Pass Protocol"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="CAMPUS_BROADCAST">Campus Announcement</option>
                    <option value="OVERDUE_DEBT_REMINDER">Fee & Debt Reminder</option>
                    <option value="STUDENT_ABSENCE_ALERT">Attendance Emergency</option>
                    <option value="REPORT_CARD_PUBLISHED">Academic Notice</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Audience Scope</label>
                  <select
                    value={broadcastScope}
                    onChange={(e) => setBroadcastScope(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="ENTIRE_SCHOOL">Entire School (All Guardians)</option>
                    <option value="CLASS_ARM">Specific Class Arm</option>
                    <option value="DEBTORS_ONLY">Outstanding Debtors Only</option>
                  </select>
                </div>
              </div>

              {broadcastScope === 'CLASS_ARM' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Class Arm</label>
                  <select
                    value={broadcastArmId}
                    onChange={(e) => setBroadcastArmId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="arm_jss1_gold">JSS 1 - Gold (Enrolled Cohort)</option>
                    <option value="arm_jss1_silver">JSS 1 - Silver</option>
                    <option value="arm_jss2_diamond">JSS 2 - Diamond</option>
                    <option value="arm_sss1_emerald">SSS 1 - Emerald</option>
                  </select>
                </div>
              )}

              {/* Multi-Channel Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Active Dispatch Channels (Multi-Select)
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(['IN_APP', 'SMS', 'WHATSAPP', 'EMAIL'] as NotificationChannel[]).map((ch) => {
                    const isSelected = broadcastChannels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => toggleBroadcastChannel(ch)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        <span>{ch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Message Subject (for Email / In-App)</label>
                <Input
                  placeholder="e.g. Important Notice: King's College Lagos Exeat Schedule"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Message Body</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {broadcastBody.length} chars • {Math.ceil(broadcastBody.length / 160) || 1} SMS unit(s)
                  </span>
                </div>
                <textarea
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  placeholder="Type official communication message here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBroadcastModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendingBroadcast}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {sendingBroadcast ? 'Dispatching Across Channels...' : 'Dispatch Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE TEMPLATE */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Create Communication Template
              </h3>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Template Name</label>
                <Input
                  placeholder="e.g. Mid-Term Examination Timetable Release"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="CAMPUS_BROADCAST">Campus Broadcast</option>
                    <option value="FEE_INVOICE_ISSUED">Fee Invoice</option>
                    <option value="PAYMENT_RECEIPT_CONFIRMED">Payment Receipt</option>
                    <option value="OVERDUE_DEBT_REMINDER">Overdue Debt</option>
                    <option value="STUDENT_ABSENCE_ALERT">Absence Alert</option>
                    <option value="REPORT_CARD_PUBLISHED">Report Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Default Channel</label>
                  <select
                    value={templateChannel}
                    onChange={(e) => setTemplateChannel(e.target.value as any)}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-2xs focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="SMS">Termii SMS</option>
                    <option value="WHATSAPP">WhatsApp Cloud</option>
                    <option value="EMAIL">Resend Email</option>
                    <option value="IN_APP">In-App Notification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Subject (for Email)</label>
                <Input
                  placeholder="e.g. Official Update from {{schoolName}}"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Template Content</label>
                  <span className="text-[11px] text-slate-400">
                    Use <code className="bg-slate-100 px-1 py-0.5 rounded-sm text-emerald-700 font-mono">{"{{tag}}"}</code> syntax
                  </span>
                </div>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden font-mono"
                  placeholder="Dear {{guardianName}}, this is to inform you that {{studentName}} has..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTemplateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingTemplate}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {savingTemplate ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DISPATCH DETAILS */}
      {detailModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Message Dispatch Details
              </h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 text-xs space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Message ID:</span>
                  <span className="font-mono font-semibold">{selectedMessage.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel / Provider:</span>
                  <span className="font-semibold text-emerald-800">{selectedMessage.channel} ({selectedMessage.providerReference || 'Simulated'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-mono">{selectedMessage.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Name:</span>
                  <span className="font-bold text-slate-900">{selectedMessage.recipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone / Email:</span>
                  <span className="font-mono">{selectedMessage.recipient.phonePrimary || selectedMessage.recipient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Status:</span>
                  <Badge variant="paid" className="text-[10px]">{selectedMessage.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Queued Timestamp:</span>
                  <span>{new Date(selectedMessage.queuedAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Message Content</label>
                <div className="rounded-xl bg-white p-3.5 text-xs text-slate-900 border border-slate-200 leading-relaxed font-mono">
                  {selectedMessage.body}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
