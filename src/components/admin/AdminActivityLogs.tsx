import React, { useState } from 'react';
import { useStore } from '../../services/store';

export const AdminActivityLogs: React.FC = () => {
  const { activityLogs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = activityLogs.filter(log => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      log.action.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.userRole.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="display text-3xl">
            Staff Audit & Activity Trail
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Immutable log of back-office modifications: price updates, weigh adjustments, cancellations, and staff actions.
          </p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter audit logs by action, staff name, role or order details..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="field w-full pl-11"
        />
      </div>

      <div className="overflow-hidden panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-soft">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-sand/40 transition">
                    <td className="py-3 px-4 num text-ink-soft text-sm whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-ZA')}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-sand text-brand-yellow-deep text-sm font-bold px-2 py-0.5 rounded">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-accent-deep whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
