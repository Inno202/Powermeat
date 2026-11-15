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
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Staff & Role Management (Owner Only)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage roles (Owner, Manager, Counter Staff, Driver). Accounts are deactivated rather than deleted to preserve history.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus size={15} />
            <span>+ Add Staff Account</span>
          </button>
        )}
      </div>

      {/* Staff Roster Table */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141414] text-neutral-400 uppercase font-bold text-[10px] border-b border-[#2D2D2D]">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Contact Details</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-neutral-800/40 transition">
                <td className="py-3.5 px-4">
                  <strong className="text-white text-sm block">{u.name}</strong>
                  <span className="text-neutral-500 font-mono text-[10px]">{u.id}</span>
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-neutral-300 block font-mono">{u.email}</span>
                  <span className="text-neutral-500">{u.phone || 'No phone'}</span>
                </td>

                <td className="py-3.5 px-4">
                  {isOwner && u.id !== currentUser?.id ? (
                    <select
                      value={u.role}
                      onChange={e => updateStaffRole(u.id, e.target.value as Role)}
                      className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white uppercase font-bold focus:outline-none"
                    >
                      <option value="owner">Owner / Admin</option>
                      <option value="manager">Manager</option>
                      <option value="counter">Counter Staff</option>
                      <option value="driver">Driver</option>
                    </select>
                  ) : (
                    <span className="bg-neutral-800 text-[#FFC400] px-2.5 py-1 rounded text-xs uppercase font-extrabold">
                      {u.role}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      u.active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {u.active ? 'Active' : 'Deactivated'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-neutral-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {isOwner && u.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleStaffStatus(u.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded transition cursor-pointer ${
                        u.active
                          ? 'bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800'
                          : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
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
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsInviteOpen(false)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
              <UserPlus size={18} className="text-[#D7141A]" />
              <span>Add Staff Account</span>
            </h3>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sipho Ndlovu"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sipho@powermeat.co.za"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Cell Phone Number</label>
                <input
                  type="tel"
                  placeholder="082 345 6789"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Staff Role</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as Role)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white uppercase font-bold"
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
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold rounded-lg cursor-pointer"
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
