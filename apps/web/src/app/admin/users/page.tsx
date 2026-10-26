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
import { DEMO_USERS } from '@/lib/auth/demo-users';
import { Users, UserPlus, Search, ArrowLeft, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { isPrivilegedRole } from '@/lib/auth/rbac';

export default function UsersManagementPage() {
  const [search, setSearch] = React.useState('');
  const [usersList, setUsersList] = React.useState(Object.values(DEMO_USERS));

  const filteredUsers = usersList.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );
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
            <Users className="h-6 w-6 text-navy-900" />
            Institutional User & Role Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated accounts, assign resource-scoped roles, and verify MFA compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => alert('Add User workflow initiated')}
          >
            Provision User
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftElement={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="text-xs text-slate-500 sm:ml-auto">
            Total Enrolled: <strong className="text-slate-800">{filteredUsers.length}</strong> institutional users
          </div>
        </CardContent>
      </Card>

      {/* Users Directory Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Identity</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>School Tenant</TableHead>
              <TableHead>MFA Compliance</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const privileged = isPrivilegedRole(u.role);
              return (
                <TableRow key={u.email}>
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
                  <TableCell className="text-xs text-slate-700">
                    <span className="block font-medium">{u.schoolName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {u.campusId ? `Campus: ${u.campusId}` : 'Multi-Campus / All'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {privileged ? (
                      <Badge variant="paid">Mandatory MFA Active</Badge>
                    ) : (
                      <Badge variant="neutral">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Review permissions for ${u.name}`)}
                    >
                      Inspect Roles
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
