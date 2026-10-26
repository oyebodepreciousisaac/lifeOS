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
  Select,
} from '@school-os/ui';
import { inMemoryAuditStore } from '@/lib/audit/logger';
import { FileText, Search, ShieldCheck, ArrowLeft, Eye, X, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [search, setSearch] = React.useState('');
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);

  const filteredLogs = inMemoryAuditStore.filter((event) => {
    const matchesSearch =
      event.action.toLowerCase().includes(search.toLowerCase()) ||
      event.actorName.toLowerCase().includes(search.toLowerCase()) ||
      event.resourceType.toLowerCase().includes(search.toLowerCase()) ||
      event.actorIp.includes(search);
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
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
            <FileText className="h-6 w-6 text-emerald-600" />
            Immutable Audit Event Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-proof record of all authentication, academic score modifications, and financial transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="paid">Append-Only Active</Badge>
          <Badge variant="neutral">OWASP ASVS 5.0</Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by action, actor, resource, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftElement={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="text-xs text-slate-500 sm:ml-auto">
            Showing <strong className="text-slate-800">{filteredLogs.length}</strong> recorded audit events
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Client IP</TableHead>
              <TableHead className="text-right">Inspection</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}{' '}
                  • {new Date(log.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold text-navy-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.actorRole}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-600">
                  {log.resourceType}
                  {log.resourceId && <span className="text-slate-400 block text-[10px]">#{log.resourceId}</span>}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{log.actorIp}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(log)}
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View Diff
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Diff Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-navy-950">
                  Audit Event Diff Inspector
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Event ID: {selectedEvent.id} • Action: {selectedEvent.action}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">ACTOR</span>
                  <strong className="text-slate-800">{selectedEvent.actorName} ({selectedEvent.actorRole})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">TARGET RESOURCE</span>
                  <strong className="font-mono text-slate-800">{selectedEvent.resourceType} ({selectedEvent.resourceId || 'N/A'})</strong>
                </div>
              </div>

              {/* Before and After Diffs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-2">
                    Before State (Pre-Mutation)
                  </span>
                  <pre className="text-slate-800 whitespace-pre-wrap break-all">
                    {selectedEvent.beforeState ? JSON.stringify(selectedEvent.beforeState, null, 2) : 'null (Created or Initial Action)'}
                  </pre>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">
                    After State (Committed Diff)
                  </span>
                  <pre className="text-slate-800 whitespace-pre-wrap break-all">
                    {selectedEvent.afterState ? JSON.stringify(selectedEvent.afterState, null, 2) : 'null (Deleted)'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button size="sm" variant="primary" onClick={() => setSelectedEvent(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
