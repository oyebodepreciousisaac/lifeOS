'use client';

import * as React from 'react';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
  EmptyState,
  Alert,
  DiffCard,
  formatNaira,
} from '@school-os/ui';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  Mail,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';

export default function DesignSystemPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasInputError, setHasInputError] = React.useState(false);
  const [showEmptyState, setShowEmptyState] = React.useState(false);
  const [makerCheckerStatus, setMakerCheckerStatus] = React.useState<string | null>(null);

  const sampleStudents = [
    {
      id: '1',
      adm: 'ADM-2026-001',
      name: 'Adewale Adeleke',
      class: 'JSS 1 Gold',
      status: 'paid' as const,
      termFee: 245000,
    },
    {
      id: '2',
      adm: 'ADM-2026-002',
      name: 'Chidinma Okafor',
      class: 'JSS 1 Diamond',
      status: 'pending' as const,
      termFee: 245000,
    },
    {
      id: '3',
      adm: 'ADM-2026-003',
      name: 'Fatima Mohammed',
      class: 'JSS 2 Blue',
      status: 'debt' as const,
      termFee: 260000,
    },
    {
      id: '4',
      adm: 'ADM-2026-004',
      name: 'Oluwaseun Bakare',
      class: 'SSS 1 Science',
      status: 'paid' as const,
      termFee: 310000,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <Layers className="h-3.5 w-3.5" />
            SchoolOS Design System v1.0
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            Institutional Component Showcase
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized, accessible primitives built with Institutional Navy, Growth Emerald, and WCAG 2.1 AA contrast.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => setIsLoading(!isLoading)}
          >
            {isLoading ? 'Disable Loading State' : 'Simulate Loading State'}
          </Button>
        </div>
      </div>

      {/* 1. BUTTONS & SIZES */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          1. Buttons & Interaction States
        </h2>

        <Card>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Emerald</Button>
              <Button variant="secondary">Secondary Navy</Button>
              <Button variant="outline">Outline Slate</Button>
              <Button variant="destructive">Destructive Action</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="primary" isLoading>
                Saving Data
              </Button>
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Add Student
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Touch Target Sizing:
              </span>
              <Button size="sm" variant="outline">
                Small (36px)
              </Button>
              <Button size="md" variant="primary">
                Medium Touch-Safe (44px)
              </Button>
              <Button size="lg" variant="secondary">
                Large (48px)
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. FORM INPUTS & SELECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            2. Accessible Form Controls & Validation States
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHasInputError(!hasInputError)}
          >
            {hasInputError ? 'Clear Validation Errors' : 'Trigger Validation Errors'}
          </Button>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Student Admission Number"
              placeholder="e.g. ADM-2026-042"
              required
              error={hasInputError ? 'Permanent admission number is required.' : undefined}
              helperText="Institutional unique identifier"
              leftElement={<Search className="h-4 w-4" />}
            />

            <Input
              label="Parent Contact Email"
              type="email"
              placeholder="parent@example.ng"
              error={hasInputError ? 'Invalid Nigerian email address format.' : undefined}
              leftElement={<Mail className="h-4 w-4" />}
            />

            <Select
              label="Academic Session & Class Arm"
              options={[
                { label: 'JSS 1 Gold (Main Campus)', value: 'jss1_gold' },
                { label: 'JSS 1 Diamond (Main Campus)', value: 'jss1_diamond' },
                { label: 'JSS 2 Blue (Annex)', value: 'jss2_blue' },
              ]}
              helperText="Enforces timetable and fee scope"
            />
          </CardContent>
        </Card>
      </section>

      {/* 3. STATUS BADGES */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          3. Status Badges & Indicators
        </h2>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge variant="paid">✓ Fully Paid</Badge>
            <Badge variant="pending">⚠ Pending Review</Badge>
            <Badge variant="debt">✕ Overdue Debt</Badge>
            <Badge variant="locked">🔒 Result Sealed</Badge>
            <Badge variant="approved">🛡️ Approved by Principal</Badge>
            <Badge variant="draft">📝 Draft Assessment</Badge>
            <Badge variant="neutral">Active Session</Badge>
          </CardContent>
        </Card>
      </section>

      {/* 4. DATA TABLE & SKELETON */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            4. Institutional Data Table (with Skeletons & Empty States)
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEmptyState(!showEmptyState)}
          >
            {showEmptyState ? 'Show Populated Table' : 'Show Empty State View'}
          </Button>
        </div>

        <Card className="overflow-hidden">
          {showEmptyState ? (
            <div className="p-6">
              <EmptyState
                icon={<GraduationCap className="h-6 w-6 text-slate-400" />}
                title="No Student Records Enrolled"
                description="This academic class currently contains no registered students for the 2026/2027 session."
                actionLabel="Import Students from CSV"
                onAction={() => alert('Import workflow triggered')}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class Arm</TableHead>
                  <TableHead>Billing Status</TableHead>
                  <TableHead className="text-right">Term Tuition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  sampleStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-xs font-semibold text-slate-600">
                        {student.adm}
                      </TableCell>
                      <TableCell className="font-bold text-navy-950">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {student.class}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status}>
                          {student.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900">
                        {formatNaira(student.termFee)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>

      {/* 5. MAKER-CHECKER VISUAL DIFF CARD */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          5. Maker-Checker Dual-Control Visual Diff Card
        </h2>

        {makerCheckerStatus && (
          <Alert
            type={makerCheckerStatus.includes('Approved') ? 'success' : 'error'}
            title="Governance Decision Logged"
            onClose={() => setMakerCheckerStatus(null)}
          >
            {makerCheckerStatus}
          </Alert>
        )}

        <DiffCard
          title="Terminal Exam Score Correction Request"
          actionType="RESULT_CORRECTION"
          approvalLevel={2}
          targetEntity="Chidinma Okafor (ADM-2026-002) — Mathematics Exam"
          requesterName="Mr. Joseph Okafor"
          requesterRole="Subject Teacher (Mathematics)"
          requestedAt="17 Oct 2026, 14:32 WAT"
          reason="Marking script audit re-check identified untallied Section B question 4 (+8 marks). Verified against original physical script."
          beforeValue={{
            subject: 'Mathematics',
            examScore: '48 / 60',
            totalScore: '72 / 100',
            gradeLetter: 'B',
            remark: 'Very Good',
          }}
          afterValue={{
            subject: 'Mathematics',
            examScore: '56 / 60',
            totalScore: '80 / 100',
            gradeLetter: 'A',
            remark: 'Excellent (Distinction)',
          }}
          onApprove={() => setMakerCheckerStatus('Approved & Digitally Signed: Score updated with immutable audit log.')}
          onReject={() => setMakerCheckerStatus('Rejected: Request dismissed back to teacher queue with audit note.')}
        />
      </section>

      {/* 6. SYSTEM ALERTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          6. Institutional System Alerts
        </h2>

        <div className="space-y-3">
          <Alert type="success" title="Reconciliation Complete">
            All 142 Paystack bank transfer transactions reconciled successfully against Zenith Bank virtual accounts.
          </Alert>

          <Alert type="warning" title="Maker-Checker Approval Expiring Soon">
            Fee structure amendment request #REQ-981 expires in 4 hours. Requires School Owner dual-control sign-off.
          </Alert>

          <Alert type="error" title="Attendance Synchronization Exception">
            Conflicting offline registers detected for JSS 1 Gold on device Tecno Spark 10. Manual resolution required.
          </Alert>
        </div>
      </section>
    </div>
  );
}
