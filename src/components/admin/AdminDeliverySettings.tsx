import React, { useState } from 'react';
import { X, Truck, Clock, Calendar, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from '../ui/feedback';
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
    toast(`Order cut-off saved: ${cutoffTime}`);
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
        <h2 className="display text-3xl">
          Delivery Logistics & Cut-off Rules
        </h2>
        <p className="text-sm text-ink-soft mt-0.5">
          Configure area delivery schedules, dispatch days, delivery fees and public holiday blackouts.
        </p>
      </div>

      {/* 12h00 Cut-off Rule Setting */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 panel">
        <div>
          <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
            <Clock size={18} className="text-brand-accent-deep" />
            <span>Standard Day-Before Order Cut-Off Time</span>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            Customers must submit their orders prior to this time on the day before their scheduled delivery or in-store collection run.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <input
              type="time"
              value={cutoffTime}
              onChange={e => setCutoffTime(e.target.value)}
              className="field num"
            />
            <button
              onClick={handleSaveCutoff}
              className="btn btn-sm btn-accent"
            >
              Update Cut-off
            </button>
          </div>
        </div>

        {/* Blocked Dates (Holidays/Closures) */}
        <div>
          <div className="flex items-center gap-2 text-ink font-bold text-sm mb-1">
            <Calendar size={18} className="text-brand-yellow-deep" />
            <span>Blocked Dates & Public Holidays</span>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            Dates where the butchery is closed and checkout date-selection is blocked.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="date"
              value={newBlockedDate}
              onChange={e => setNewBlockedDate(e.target.value)}
              className="field"
            />
            <button
              onClick={handleAddBlockedDate}
              className="btn btn-sm btn-outline"
            >
              + Block Date
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {settings.blockedDates.map(dateStr => (
              <span
                key={dateStr}
                className="bg-white border border-ink/10 text-ink-soft text-sm px-2 py-0.5 rounded flex items-center gap-1 num"
              >
                <span>{dateStr}</span>
                <button
                  onClick={() => handleRemoveBlockedDate(dateStr)}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-ink-soft hover:text-red-800 ml-1"
                ><X size={18} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Areas Table */}
      <div className="overflow-hidden panel">
        <div className="p-4 bg-paper border-b border-ink/10 flex items-center justify-between">
          <h3 className="display flex items-center gap-2 text-2xl">
            <span>Delivery Areas & Days Table</span>
          </h3>
          <span className="text-sm text-ink-soft">
            Free Delivery on Family Hampers & Meat Combos applies to all areas
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
            <tr>
              <th className="py-3 px-4">Area Name</th>
              <th className="py-3 px-4">Delivery Days</th>
              <th className="py-3 px-4">Standard Fee</th>
              <th className="py-3 px-4">Active</th>
              <th className="py-3 px-4 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {deliveryAreas.map(area => (
              <tr key={area.id} className="hover:bg-sand/40 transition">
                <td className="py-3 px-4 font-bold text-ink text-sm">
                  {area.name}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {area.days.map(d => (
                      <span key={d} className="bg-sand text-ink-soft px-2 py-0.5 rounded text-sm">
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 font-bold text-brand-yellow-deep">
                  {area.fee === 0 ? 'Free' : `R${area.fee.toFixed(2)}`}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-sm font-bold px-2 py-0.5 rounded ${area.active ? 'bg-emerald-50 text-emerald-800' : 'bg-sand text-ink-soft'}`}>
                    {area.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setEditingArea(area)}
                    className="icon-btn bg-sand hover:bg-sand text-ink cursor-pointer transition"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm modal-overlay flex items-start justify-center p-4"
          onClick={() => setEditingArea(null)}
        >
          <div
            className="w-full max-w-md text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="display text-2xl">
              Edit Delivery Area: {editingArea.name}
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="field-label">Standard Delivery Fee (ZAR):</label>
                <input
                  type="number"
                  step="5"
                  value={editingArea.fee}
                  onChange={e => setEditingArea({ ...editingArea, fee: parseFloat(e.target.value) || 0 })}
                  className="field w-full num"
                />
              </div>

              <div>
                <label className="field-label">Scheduled Delivery Days:</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_DAYS.map(day => (
                    <label key={day} className="flex items-center gap-2 p-1.5 bg-paper rounded cursor-pointer border border-ink/10">
                      <input
                        type="checkbox"
                        checked={editingArea.days.includes(day)}
                        onChange={() => handleToggleDay(day)}
                        className="rounded bg-white text-brand-accent-deep"
                      />
                      <span className="text-sm text-ink">{day}</span>
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
                    className="rounded bg-paper text-brand-accent-deep"
                  />
                  <span className="font-bold text-ink">Area Active for Deliveries</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateDeliveryArea(editingArea.id, editingArea);
                    setEditingArea(null);
                  }}
                  className="btn btn-sm btn-accent"
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
