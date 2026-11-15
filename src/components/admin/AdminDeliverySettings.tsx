import React, { useState } from 'react';
import { Truck, Clock, Calendar, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../services/store';
import { DeliveryArea } from '../../types';

export const AdminDeliverySettings: React.FC = () => {
  const { deliveryAreas, updateDeliveryArea, settings, updateSettings, currentUser } = useStore();

  const [cutoffTime, setCutoffTime] = useState(settings.cutoffTime || '12:00');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);

  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSaveCutoff = () => {
    updateSettings({ cutoffTime });
    alert('Cutoff rule updated successfully to ' + cutoffTime);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (settings.blockedDates.includes(newBlockedDate)) return;
    updateSettings({ blockedDates: [...settings.blockedDates, newBlockedDate] });
    setNewBlockedDate('');
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    updateSettings({ blockedDates: settings.blockedDates.filter(d => d !== dateStr) });
  };

  const handleToggleDay = (day: string) => {
    if (!editingArea) return;
    const currentDays = editingArea.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    setEditingArea({ ...editingArea, days: newDays });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
          Delivery Logistics & Cut-off Rules
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure area delivery schedules, dispatch days, delivery fees and public holiday blackouts.
        </p>
      </div>

      {/* 12h00 Cut-off Rule Setting */}
      <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2D2D2D] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
            <Clock size={18} className="text-[#D7141A]" />
            <span>Standard Day-Before Order Cut-Off Time</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Customers must submit their orders prior to this time on the day before their scheduled delivery or in-store collection run.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <input
              type="time"
              value={cutoffTime}
              onChange={e => setCutoffTime(e.target.value)}
              className="bg-neutral-900 border border-[#3E3E3E] text-white text-sm font-mono font-bold px-3 py-2 rounded-lg"
            />
            <button
              onClick={handleSaveCutoff}
              className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer"
            >
              Update Cut-off
            </button>
          </div>
        </div>

        {/* Blocked Dates (Holidays/Closures) */}
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
            <Calendar size={18} className="text-[#FFC400]" />
            <span>Blocked Dates & Public Holidays</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Dates where the butchery is closed and checkout date-selection is blocked.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="date"
              value={newBlockedDate}
              onChange={e => setNewBlockedDate(e.target.value)}
              className="bg-neutral-900 border border-[#3E3E3E] text-white text-xs px-3 py-2 rounded-lg"
            />
            <button
              onClick={handleAddBlockedDate}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer"
            >
              + Block Date
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {settings.blockedDates.map(dateStr => (
              <span
                key={dateStr}
                className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-mono"
              >
                <span>{dateStr}</span>
                <button
                  onClick={() => handleRemoveBlockedDate(dateStr)}
                  className="text-neutral-500 hover:text-red-400 ml-1"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Areas Table */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <div className="p-4 bg-[#141414] border-b border-[#2D2D2D] flex items-center justify-between">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider flex items-center gap-2">
            <Truck size={17} className="text-[#D7141A]" />
            <span>Delivery Areas & Days Table</span>
          </h3>
          <span className="text-xs text-neutral-400">
            Free Delivery on Family Hampers & Meat Combos applies to all areas
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#111111] text-neutral-400 uppercase font-bold text-[10px] border-b border-[#2D2D2D]">
            <tr>
              <th className="py-3 px-4">Area Name</th>
              <th className="py-3 px-4">Delivery Days</th>
              <th className="py-3 px-4">Standard Fee</th>
              <th className="py-3 px-4">Active</th>
              <th className="py-3 px-4 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {deliveryAreas.map(area => (
              <tr key={area.id} className="hover:bg-neutral-800/40 transition">
                <td className="py-3 px-4 font-bold text-white text-sm">
                  {area.name}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {area.days.map(d => (
                      <span key={d} className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px]">
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 font-bold text-[#FFC400]">
                  {area.fee === 0 ? 'Free' : `R${area.fee.toFixed(2)}`}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${area.active ? 'bg-emerald-950 text-emerald-300' : 'bg-neutral-800 text-neutral-500'}`}>
                    {area.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setEditingArea(area)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer transition"
                  >
                    <Edit size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT AREA MODAL */}
      {editingArea && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingArea(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold uppercase text-white">
              Edit Delivery Area: {editingArea.name}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Standard Delivery Fee (ZAR):</label>
                <input
                  type="number"
                  step="5"
                  value={editingArea.fee}
                  onChange={e => setEditingArea({ ...editingArea, fee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1.5">Scheduled Delivery Days:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_DAYS.map(day => (
                    <label key={day} className="flex items-center gap-2 p-1.5 bg-neutral-950 rounded cursor-pointer border border-neutral-800">
                      <input
                        type="checkbox"
                        checked={editingArea.days.includes(day)}
                        onChange={() => handleToggleDay(day)}
                        className="rounded bg-neutral-900 text-[#D7141A]"
                      />
                      <span className="text-xs text-neutral-200">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={editingArea.active}
                    onChange={e => setEditingArea({ ...editingArea, active: e.target.checked })}
                    className="rounded bg-neutral-950 text-[#D7141A]"
                  />
                  <span className="font-bold text-white">Area Active for Deliveries</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateDeliveryArea(editingArea.id, editingArea);
                    setEditingArea(null);
                  }}
                  className="px-4 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Area Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
