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
  Alert,
} from '@school-os/ui';
import {
  FileSpreadsheet,
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { importStudentsFromCsvAction } from '../../../actions/sis';
import { BatchImportResult } from '../../../../lib/sis/sis-types';

const SAMPLE_CSV_HEADER = `FirstName,LastName,MiddleName,Gender,DateOfBirth,ClassLevel,ClassArm,GuardianFirstName,GuardianLastName,GuardianPhone,GuardianEmail,GuardianRelationship,StateOfOrigin,BloodGroup,Genotype,Allergies`;

const SAMPLE_ROWS = `Ibrahim,Shehu,Bello,MALE,2014-03-12,JSS 1,Gold,Alhaji,Shehu,+234 803 111 2233,shehu@example.com,FATHER,Kano,O+,AA,None
Chidinma,Okafor,Grace,FEMALE,2014-07-25,JSS 1,Diamond,Mrs,Okafor,+234 802 333 4455,okafor@example.com,MOTHER,Anambra,A+,AS,Peanuts
Oluwaseun,Adeyemi,John,MALE,2013-11-18,JSS 2,Gold,Engr,Adeyemi,+234 809 777 8899,adeyemi@example.com,FATHER,Ogun,O+,AA,Dust
Fatima,Aliyu,Zahra,FEMALE,2015-01-30,Primary 6,Gold,Dr,Aliyu,+234 818 555 6677,aliyu@example.com,FATHER,Kaduna,B+,AA,None`;

export default function BatchStudentImportPage() {
  const [csvContent, setCsvContent] = React.useState(`${SAMPLE_CSV_HEADER}\n${SAMPLE_ROWS}`);
  const [validating, setValidating] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<BatchImportResult | null>(null);
  const [finalResult, setFinalResult] = React.useState<BatchImportResult | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([`${SAMPLE_CSV_HEADER}\n${SAMPLE_ROWS}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schoolos_student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadBenchmark100 = () => {
    const states = ['Lagos', 'Ogun', 'Oyo', 'Rivers', 'Kano', 'Kaduna', 'Enugu', 'Anambra', 'Edo', 'Delta'];
    const firstNames = ['Emeka', 'Amaka', 'Tunde', 'Yetunde', 'Ibrahim', 'Fatima', 'Chukwudi', 'Nkechi', 'Segun', 'Bisi'];
    const lastNames = ['Okonkwo', 'Balogun', 'Bello', 'Adeyemi', 'Nwosu', 'Danjuma', 'Eze', 'Ojo', 'Abubakar', 'Lawal'];

    const rows = [SAMPLE_CSV_HEADER];
    for (let i = 1; i <= 100; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length] + i;
      const gender = i % 2 === 0 ? 'MALE' : 'FEMALE';
      const year = 2012 + (i % 4);
      const month = String(1 + (i % 12)).padStart(2, '0');
      const day = String(1 + (i % 28)).padStart(2, '0');
      const dob = `${year}-${month}-${day}`;
      const state = states[i % states.length];
      const arm = i % 2 === 0 ? 'Gold' : 'Diamond';

      rows.push(
        `${fn},${ln},Demo,${gender},${dob},JSS 1,${arm},Chief,${ln},+234 80${String(10000000 + i).slice(-8)},parent${i}@example.sch.ng,FATHER,${state},O+,AA,None`
      );
    }

    setCsvContent(rows.join('\n'));
    setValidationResult(null);
    setFinalResult(null);
    setFeedback({
      type: 'success',
      message: 'Generated 100 benchmark sample student records with Nigerian biodata.',
    });
  };

  const handleDryRunValidate = async () => {
    if (!csvContent.trim()) {
      setFeedback({ type: 'error', message: 'CSV content cannot be empty.' });
      return;
    }

    setValidating(true);
    setFeedback(null);
    setFinalResult(null);

    const res = await importStudentsFromCsvAction(csvContent, { dryRun: true });
    setValidating(false);

    if (res.success && res.data) {
      setValidationResult(res.data);
      if (res.data.quarantinedCount > 0) {
        setFeedback({
          type: 'error',
          message: `Validation detected ${res.data.quarantinedCount} quarantined row(s). Review errors below before importing.`,
        });
      } else {
        setFeedback({
          type: 'success',
          message: `All ${res.data.successfullyImported} student row(s) passed schema validation with 0 errors!`,
        });
      }
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to validate CSV.' });
    }
  };

  const handleExecuteImport = async () => {
    setImporting(true);
    setFeedback(null);

    const res = await importStudentsFromCsvAction(csvContent, { dryRun: false });
    setImporting(false);

    if (res.success && res.data) {
      setFinalResult(res.data);
      setValidationResult(null);
      setFeedback({
        type: 'success',
        message: `Successfully imported ${res.data.successfullyImported} student(s) into institutional registry!`,
      });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to import students.' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Student Directory
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            High-Volume Batch Student CSV Importer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk onboard students, create guardian links, and allocate class arms with automatic dirty-data quarantine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="h-4 w-4 text-slate-600" />}
          >
            Download CSV Template
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleLoadBenchmark100}
            leftIcon={<Sparkles className="h-4 w-4 text-amber-500" />}
          >
            Load 100 Sample Students
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type === 'error' ? 'error' : 'success'}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* CSV Input Form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-navy-950">
            Paste or Edit Student CSV Data
          </CardTitle>
          <CardDescription>
            Must include mandatory headers: FirstName, LastName, Gender, DateOfBirth, ClassLevel, ClassArm, GuardianFirstName, GuardianLastName, GuardianPhone, GuardianEmail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={csvContent}
            onChange={(e) => {
              setCsvContent(e.target.value);
              setValidationResult(null);
              setFinalResult(null);
            }}
            rows={12}
            className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-300 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Paste CSV rows here..."
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500 font-mono">
              Lines count: {csvContent.split('\n').filter((l) => l.trim().length > 0).length} (including header)
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDryRunValidate}
                disabled={validating || importing}
                leftIcon={<RefreshCw className={`h-4 w-4 ${validating ? 'animate-spin' : ''}`} />}
              >
                {validating ? 'Validating...' : 'Dry Run Validate'}
              </Button>

              <Button
                size="sm"
                className="bg-navy-950 text-white hover:bg-navy-900"
                onClick={handleExecuteImport}
                disabled={validating || importing || !validationResult || validationResult.quarantinedCount > 0}
                leftIcon={<Upload className="h-4 w-4 text-emerald-400" />}
              >
                {importing ? 'Importing...' : 'Commit & Import to Registry'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dry Run Validation Results Card */}
      {validationResult && (
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-navy-950 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Dry-Run Validation Summary
              </CardTitle>
              <CardDescription>
                {validationResult.successfullyImported} valid rows ready for import • {validationResult.quarantinedCount} quarantined
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="paid">{validationResult.successfullyImported} Valid</Badge>
              {validationResult.quarantinedCount > 0 && (
                <Badge variant="debt">{validationResult.quarantinedCount} Quarantined</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            {/* Quarantined Rows Table */}
            {validationResult.quarantinedRows.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  Quarantined Dirty Rows (Must resolve errors before importing):
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Row #</TableHead>
                      <TableHead>Candidate Info</TableHead>
                      <TableHead>Target Class</TableHead>
                      <TableHead>Itemized Validation Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.quarantinedRows.map((q, idx) => (
                      <TableRow key={idx} className="bg-red-50/40">
                        <TableCell className="font-mono text-xs font-bold text-red-800">
                          Row {q.rowNumber}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-bold text-slate-800">
                            {q.rowData.firstName || '[Missing]'} {q.rowData.lastName || '[Missing]'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {q.rowData.gender || 'Unknown'} • {q.rowData.dateOfBirth || 'No DOB'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700">
                          {q.rowData.classLevelName} {q.rowData.classArmName}
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                            {q.errors.map((err, eIdx) => (
                              <li key={eIdx}>{err}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>
                    Zero schema errors detected across all {validationResult.successfullyImported} rows. Click &quot;Commit &amp; Import to Registry&quot; above to finalize.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Successful Import Summary */}
      {finalResult && (
        <Card className="shadow-institutional border-emerald-300 bg-emerald-50/20">
          <CardHeader className="pb-3 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <CardTitle className="text-base font-extrabold">
                  Import Transaction Complete
                </CardTitle>
              </div>
              <Link href="/admin/students">
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
                  View Student Directory
                </Button>
              </Link>
            </div>
            <CardDescription className="text-emerald-800">
              Successfully assigned {finalResult.successfullyImported} student admission numbers with guardian records and class arms.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class Level & Arm</TableHead>
                  <TableHead>Guardian Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalResult.importedStudents.slice(0, 10).map((st) => (
                  <TableRow key={st.id}>
                    <TableCell className="font-mono text-xs font-bold text-navy-950">
                      {st.admissionNumber}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-800">
                      {st.firstName} {st.lastName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {st.currentClassLevelName} {st.currentClassArmName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {st.guardians[0]?.guardian.phonePrimary}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {finalResult.importedStudents.length > 10 && (
              <p className="text-xs text-slate-500 text-center pt-3">
                ...and {finalResult.importedStudents.length - 10} more students enrolled.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
