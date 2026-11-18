import React, { useState } from 'react';
import { Check, Plus, Shield, UserCheck, UserPlus } from 'lucide-react';
import { Button, Modal } from '@/src/components/ui/Primitives';
import { useStaffQuery } from '@/src/hooks/useCafeQueries';
import { cn } from '@/src/lib/utils';
import { useCafeStore } from '@/src/store/useCafeStore';
import { UserRole } from '@/src/types/cafe';

export function StaffPage() {
  const { data: staff } = useStaffQuery();
  const { currentUser, addStaffMember, toggleStaffStatus, updateStaffRole, switchUserById } =
    useCafeStore();

  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addStaffMember({ name, email, role });
    setName('');
    setEmail('');
    setRole('Staff');
    setAddOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)]">
          {staff.filter((m) => m.status === 'Active').length} active team members with floor access.
        </p>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          <UserPlus className="w-4 h-4" />
          <span>Add Staff</span>
        </Button>
      </div>

      {/* Staff List Table */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 text-xs font-medium text-[var(--text-secondary)]">
                <th className="py-3 px-4">Team Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {staff.map((member) => {
                const isSelf = member.id === currentUser.id;
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-[var(--bg-elevated)]/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-[var(--border-subtle)] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-xs font-semibold text-[#8B5CF6] shrink-0">
                            {member.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-display font-semibold text-[var(--text-primary)]">
                            {member.name}
                            {isSelf && (
                              <span className="ml-2 text-[11px] font-normal text-[#8B5CF6]">
                                (You)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {member.email}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={member.role}
                        disabled={isSelf}
                        onChange={(e) => updateStaffRole(member.id, e.target.value as UserRole)}
                        className="h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] text-xs font-medium text-[var(--text-primary)] disabled:opacity-60"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-medium',
                          member.status === 'Active'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                            : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                        )}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--text-secondary)]">
                      {member.lastActive}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {!isSelf && member.status === 'Active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => switchUserById(member.id)}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Preview Role</span>
                          </Button>
                        )}
                        {!isSelf && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStaffStatus(member.id)}
                          >
                            {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Owner Permissions
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {[
              'Add, edit, disable, and delete gaming stations',
              'Configure hourly & duration pricing rates',
              'Manage staff accounts and access roles',
              'View revenue analytics & utilization reports',
              'Start, extend, finish sessions & record payments',
            ].map((perm) => (
              <li key={perm} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{perm}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-display font-bold text-[var(--text-primary)]">
              Staff Permissions
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {[
              'Monitor live Gaming Floor dashboard & timers',
              'Start prepaid gaming sessions for guests',
              'Extend active sessions & confirm stations ready',
              'Record Cash, Card, or Mobile Pay transactions',
              'View session history (restricted from Pricing & Reports)',
            ].map((perm) => (
              <li key={perm} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{perm}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Add Staff Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Invite Team Member"
        subtitle="Grant dashboard access to a café employee or co-owner"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-staff-form" variant="primary">
              <Plus className="w-4 h-4" />
              <span>Send Invitation</span>
            </Button>
          </>
        }
      >
        <form id="add-staff-form" onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nadia Berrada"
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nadia@arenapulse.ma"
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Access Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="Staff">Staff — Floor Operations</option>
              <option value="Owner">Owner — Full Administration</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
