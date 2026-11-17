import React, { useState } from 'react';
import { Users, UserPlus, Shield, UserX, UserCheck, KeyRound } from 'lucide-react';
import { useStore } from '../../services/store';
import { Role, UserProfile } from '../../types';

export const AdminStaff: React.FC = () => {
  const { users, addStaff, updateStaffRole, toggleStaffStatus, currentUser } = useStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<Role>('counter');

  const isOwner = currentUser?.role === 'owner';

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) return;

    addStaff({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      role: formRole,
      active: true
    });

    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setIsInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="display text-3xl">
            Staff & Role Management (Owner Only)
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Manage roles (Owner, Manager, Counter Staff, Driver). Accounts are deactivated rather than deleted to preserve history.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn btn-sm btn-accent"
          >
            <UserPlus size={15} />
            <span>Add Staff Account</span>
          </button>
        )}
      </div>

      {/* Staff Roster Table */}
      <div className="overflow-hidden panel">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-sand/40 transition">
                <td className="py-3.5 px-4">
                  <strong className="text-ink text-sm block">{u.name}</strong>
                  <span className="text-ink-soft num text-sm">{u.id}</span>
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-ink-soft block num">{u.email}</span>
                  <span className="text-ink-soft">{u.phone || 'No phone'}</span>
                </td>

                <td className="py-3.5 px-4">
                  {isOwner && u.id !== currentUser?.id ? (
                    <select
                      value={u.role}
                      onChange={e => updateStaffRole(u.id, e.target.value as Role)}
                      className="field"
                    >
                      <option value="owner">Owner / Admin</option>
                      <option value="manager">Manager</option>
                      <option value="counter">Counter Staff</option>
                      <option value="driver">Driver</option>
                    </select>
                  ) : (
                    <span className="bg-sand text-brand-yellow-deep px-2.5 py-1 rounded text-sm font-bold">
                      {u.role}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-sm font-bold px-2 py-0.5 rounded ${
                      u.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {u.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-ink-soft">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {isOwner && u.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleStaffStatus(u.id)}
                      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-sm font-bold px-2.5 rounded-full transition cursor-pointer ${
                        u.active
                          ? 'bg-red-50 hover:bg-red-50 text-red-800 border border-red-200'
                          : 'bg-emerald-50 hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsInviteOpen(false)}
        >
          <div
            className="w-full max-w-md text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="display flex items-center gap-2 text-2xl">
              <UserPlus size={18} className="text-brand-accent-deep" />
              <span>Add Staff Account</span>
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-sm">
              <div>
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho Ndlovu"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="field-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sipho@powermeat.co.za"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="field-label">Cell Phone Number</label>
                <input
                  type="tel"
                  placeholder="082 345 6789"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="field-label">Staff Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as Role)}
                  className="field w-full"
                >
                  <option value="counter">Counter Staff (Process & Weigh)</option>
                  <option value="driver">Driver (Deliveries & Cash)</option>
                  <option value="manager">Manager (Products & Schedule)</option>
                  <option value="owner">Owner / Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
