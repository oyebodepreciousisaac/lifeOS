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
} from '@school-os/ui';
import {
  Users,
  UserPlus,
  Search,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Trash2,
  Mail,
  User,
  Phone,
  CheckCircle2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { isPrivilegedRole } from '@/lib/auth/rbac';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  schoolName: string;
  status: 'ACTIVE' | 'INVITED';
  createdAt: string;
}

export default function UsersManagementPage() {
  const [search, setSearch] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);

  // Form state for provisioning new staff
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<'TEACHER' | 'BURSAR' | 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'IT_ADMIN'>('TEACHER');
  const [newPhone, setNewPhone] = React.useState('');

  // Start with clean initial state — only initial registered administrator
  const [usersList, setUsersList] = React.useState<StaffUser[]>([
    {
      id: 'usr_owner_01',
      name: 'School Proprietor / Admin',
      email: 'owner@school.sch.ng',
      role: 'OWNER',
      phone: '+234 800 000 0000',
      schoolName: 'Your School Workspace',
      status: 'ACTIVE',
      createdAt: 'Just now',
    },
  ]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newStaff: StaffUser = {
      id: `usr_staff_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.toLowerCase().trim(),
      role: newRole,
      phone: newPhone.trim() || undefined,
      schoolName: 'Your School Workspace',
      status: 'INVITED',
      createdAt: 'Just now',
    };

    setUsersList((prev) => [newStaff, ...prev]);
    setNotification(`Invitation issued for ${newStaff.name} (${newRole}). Credentials ready.`);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('TEACHER');
    setShowModal(false);

    setTimeout(() => setNotification(null), 4000);
  };

  const handleRemoveStaff = (id: string, name: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    setNotification(`Access revoked for ${name}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredUsers = usersList.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Back Navigation */}
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
            <Users className="h-6 w-6 text-navy-900" />
            Institutional Staff &amp; User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision internal accounts for your bursar, principal, and subject teachers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowModal(true)}
            className="bg-navy-950 hover:bg-navy-900 text-white font-bold"
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter & Metric Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search staff by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftElement={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="text-xs text-slate-500 sm:ml-auto">
            Staff Enrolled: <strong className="text-slate-800">{filteredUsers.length}</strong> active members
          </div>
        </CardContent>
      </Card>

      {/* Users Directory Table */}
      <Card className="overflow-hidden shadow-institutional">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Identity</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Phone / Contact</TableHead>
              <TableHead>MFA Compliance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                  <p className="font-semibold text-sm">No matching staff found</p>
                  <p className="text-xs mt-1">Try another search or click 'Add Staff Member' to provision a new account.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => {
                const privileged = isPrivilegedRole(u.role);
                const isOwner = u.role === 'OWNER';
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <span className="font-bold text-navy-950 block text-sm">{u.name}</span>
                        <span className="font-mono text-xs text-slate-500">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {u.phone || '—'}
                    </TableCell>
                    <TableCell>
                      {privileged ? (
                        <Badge variant="paid">Mandatory MFA</Badge>
                      ) : (
                        <Badge variant="neutral">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          Invited
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(u.id, u.name)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition-colors"
                          title="Revoke Staff Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Provision Staff Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-navy-950">Provision Staff Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Issue credentials to your school team.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Mr. Joseph Okafor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  leftElement={<User className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  type="email"
                  placeholder="e.g. okafor@school.sch.ng"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  leftElement={<Mail className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned School Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="TEACHER">Subject Teacher (Attendance & CA Scorebook)</option>
                  <option value="BURSAR">Bursar (Fees, Invoices, Paystack Settlement)</option>
                  <option value="PRINCIPAL">Principal (Academic Approval & Moderation)</option>
                  <option value="VICE_PRINCIPAL">Vice Principal (Discipline & Schedules)</option>
                  <option value="IT_ADMIN">IT Admin (System Setup & User Administration)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (SMS &amp; WhatsApp Alerts)
                </label>
                <Input
                  type="tel"
                  placeholder="+234 802 345 6789"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  leftElement={<Phone className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-navy-950 hover:bg-navy-900 text-white font-bold"
                >
                  Create &amp; Issue Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
