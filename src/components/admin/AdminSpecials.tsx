import React, { useState } from 'react';
import {
  Flame,
  Plus,
  RotateCcw,
  Archive,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../services/store';
import { SpecialCampaign } from '../../types';
import { formatZAR } from '../../utils/pricing';

export const AdminSpecials: React.FC = () => {
  const { specials, products, createSpecial, updateSpecial, rerunSpecial } = useStore();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // New special modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formLabel, setFormLabel] = useState('Month End Special');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');

  // Re-run modal
  const [rerunModalSpecial, setRerunModalSpecial] = useState<SpecialCampaign | null>(null);
  const [rerunStartDate, setRerunStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rerunEndDate, setRerunEndDate] = useState('');

  const activeSpecials = specials.filter(s => s.active);
  const archivedSpecials = specials.filter(s => !s.active);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSpecial({
      title: formTitle.trim(),
      label: formLabel.trim(),
      startDate: `${formStartDate}T00:00:00Z`,
      endDate: formEndDate ? `${formEndDate}T23:59:59Z` : undefined,
      active: true,
      productIds: formProductIds,
      description: formDescription.trim() || undefined
    });
    setIsCreateOpen(false);
  };

  const handleRerunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rerunModalSpecial) return;
    rerunSpecial(
      rerunModalSpecial.id,
      `${rerunStartDate}T00:00:00Z`,
      rerunEndDate ? `${rerunEndDate}T23:59:59Z` : undefined
    );
    setRerunModalSpecial(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Specials & Promotion Campaigns
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Automated promotional campaigns, timed expiry, and one-click campaign re-running.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus size={15} />
          <span>+ Create Special</span>
        </button>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex border-b border-[#2D2D2D] gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-[#D7141A] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flame size={15} className="text-[#D7141A]" />
          <span>Active Campaigns ({activeSpecials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'archived'
              ? 'border-[#FFC400] text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Archive size={15} className="text-[#FFC400]" />
          <span>Expired / Archived ({archivedSpecials.length})</span>
        </button>
      </div>

      {/* Campaign List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(activeTab === 'active' ? activeSpecials : archivedSpecials).map(special => {
          const matchedProducts = products.filter(p => special.productIds.includes(p.id));

          return (
            <div
              key={special.id}
              className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="bg-[#D7141A] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                      {special.label}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-white uppercase mt-1">
                      {special.title}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      special.active
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {special.active ? 'Active' : 'Expired / Archived'}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 mt-2">
                  {special.description || 'Special butchery cut pricing and hamper savings.'}
                </p>

                <div className="mt-3 pt-3 border-t border-[#2A2A2A] text-xs text-neutral-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[#FFC400]" />
                    <span>
                      Start: {new Date(special.startDate).toLocaleDateString()}
                    </span>
                    {special.endDate && (
                      <span>— End: {new Date(special.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Products attached to this special */}
                <div className="mt-3 pt-2 border-t border-[#2A2A2A]">
                  <span className="text-[11px] font-bold text-neutral-300 block mb-1">
                    Promotional Products ({matchedProducts.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {matchedProducts.map(p => (
                      <span
                        key={p.id}
                        className="bg-neutral-900 border border-[#333] text-neutral-200 text-[10px] px-2 py-0.5 rounded font-mono"
                      >
                        {p.name} ({formatZAR(p.price)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                {special.active ? (
                  <button
                    onClick={() => updateSpecial(special.id, { active: false })}
                    className="text-xs text-neutral-400 hover:text-red-400 font-bold transition cursor-pointer"
                  >
                    Archive / End Now
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setRerunModalSpecial(special);
                      setRerunStartDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Re-Run Campaign</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE SPECIAL MODAL */}
      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold uppercase text-white">
              Create Promotional Special
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Month End Special"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Badge Ribbon Label</label>
                  <select
                    value={formLabel}
                    onChange={e => setFormLabel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  >
                    <option value="Month End Special">Month End Special</option>
                    <option value="While Stock Lasts">While Stock Lasts</option>
                    <option value="Weekend Braai Deal">Weekend Braai Deal</option>
                    <option value="Budget Combo">Budget Combo</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  End Date (Leave blank for "While Stock Lasts")
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={e => setFormEndDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* Attach Products */}
              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  Select Products to Include:
                </label>
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 max-h-40 overflow-y-auto space-y-1">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-neutral-900 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formProductIds.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormProductIds(prev => [...prev, p.id]);
                          } else {
                            setFormProductIds(prev => prev.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded bg-neutral-900 border-neutral-700 text-[#D7141A]"
                      />
                      <span className="text-white text-xs">{p.name} ({formatZAR(p.price)})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Promo Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white rounded-lg cursor-pointer font-bold"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RE-RUN CAMPAIGN MODAL */}
      {rerunModalSpecial && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRerunModalSpecial(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-[#FFC400]" />
              <span>Re-Run Campaign: {rerunModalSpecial.title}</span>
            </h3>

            <p className="text-xs text-neutral-300">
              Set new dates to bring this archived promotional special back to life on the homepage carousel.
            </p>

            <form onSubmit={handleRerunSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">New Start Date</label>
                <input
                  type="date"
                  required
                  value={rerunStartDate}
                  onChange={e => setRerunStartDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">New End Date (Optional)</label>
                <input
                  type="date"
                  value={rerunEndDate}
                  onChange={e => setRerunEndDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRerunModalSpecial(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white rounded-lg cursor-pointer font-bold"
                >
                  Re-Activate Special
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
