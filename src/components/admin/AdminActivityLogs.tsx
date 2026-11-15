import React, { useState } from 'react';
import { History, Search, ShieldCheck } from 'lucide-react';
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
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Staff Audit & Activity Trail
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Immutable log of back-office modifications: price updates, weigh adjustments, cancellations, and staff actions.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Filter audit logs by action, staff name, role or order details..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
        />
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-neutral-400 uppercase font-bold text-[10px] border-b border-[#2D2D2D]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Staff User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-ZA')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-neutral-800 text-[#FFC400] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#D7141A] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
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
