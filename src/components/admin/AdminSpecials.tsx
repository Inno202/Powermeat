import React, { useState, useEffect } from 'react';
import { useBackToClose } from '../../utils/backButton';
import { X } from 'lucide-react';
import { useStore } from '../../services/store';
import { SpecialCampaign } from '../../types';
import { formatZAR } from '../../utils/pricing';

export const AdminSpecials: React.FC<{ startNew?: boolean; onStarted?: () => void }> = ({ startNew, onStarted }) => {
  const { specials, products, createSpecial, updateSpecial, rerunSpecial } = useStore();

  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // New special modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Opened from the dashboard's New special button: go straight to the form.
  useEffect(() => {
    if (startNew) {
      setIsCreateOpen(true);
      onStarted?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNew]);
  const [formTitle, setFormTitle] = useState('');
  const [formLabel, setFormLabel] = useState('Month End Special');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');

  // Re-run modal
  const [rerunModalSpecial, setRerunModalSpecial] = useState<SpecialCampaign | null>(null);
  // Back closes these windows first.
  useBackToClose(isCreateOpen, () => setIsCreateOpen(false));
  useBackToClose(!!rerunModalSpecial, () => setRerunModalSpecial(null));
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
          <h2 className="display text-3xl">
            Specials & Promotion Campaigns
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Automated promotional campaigns, timed expiry, and one-click campaign re-running.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-sm btn-accent"
        >
          <span>Create Special</span>
        </button>
      </div>

      {/* Tabs: Active vs Archived */}
      <div className="flex border-b border-ink/10 gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`min-h-[44px] min-w-[44px] pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-brand-accent text-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
          <span>Active Campaigns ({activeSpecials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('archived')}
          className={`min-h-[44px] min-w-[44px] pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'archived'
              ? 'border-brand-yellow text-ink'
              : 'border-transparent text-ink-soft hover:text-ink'
          }`}
        >
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
              className="p-5 flex flex-col justify-between space-y-4 panel"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="bg-brand-accent text-white text-sm font-bold px-2 py-0.5 rounded">
                      {special.label}
                    </span>
                    <h3 className="display mt-1 text-2xl">
                      {special.title}
                    </h3>
                  </div>

                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded ${
                      special.active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-sand text-ink-soft'
                    }`}
                  >
                    {special.active ? 'Active' : 'Expired / Archived'}
                  </span>
                </div>

                <p className="text-sm text-ink-soft mt-2">
                  {special.description || 'Special butchery cut pricing and hamper savings.'}
                </p>

                <div className="mt-3 pt-3 border-t border-ink/10 text-sm text-ink-soft space-y-1">
                  <div className="flex items-center gap-2">
                    <span>
                      Start: {new Date(special.startDate).toLocaleDateString()}
                    </span>
                    {special.endDate && (
                      <span>— End: {new Date(special.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Products attached to this special */}
                <div className="mt-3 pt-2 border-t border-ink/10">
                  <span className="text-sm font-bold text-ink-soft block mb-1">
                    Promotional Products ({matchedProducts.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {matchedProducts.map(p => (
                      <span
                        key={p.id}
                        className="bg-white border border-ink/10 text-ink text-sm px-2 py-0.5 rounded num"
                      >
                        {p.name} ({formatZAR(p.price)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-ink/10 flex items-center justify-between">
                {special.active ? (
                  <button
                    onClick={() => updateSpecial(special.id, { active: false })}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-sm text-ink-soft hover:text-red-800 font-bold transition cursor-pointer"
                  >
                    Archive / End Now
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setRerunModalSpecial(special);
                      setRerunStartDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="btn btn-sm btn-accent"
                  >
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm modal-overlay flex items-start justify-center p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-lg text-ink p-6 space-y-4 max-h-[85dvh] overflow-y-auto panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="display text-2xl">Create Promotional Special</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} aria-label="Close" className="icon-btn -mt-2 -mr-2 hover:bg-sand">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-sm">
              <div>
                <label className="field-label">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Month End Special"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Badge Ribbon Label</label>
                  <select
                    value={formLabel}
                    onChange={e => setFormLabel(e.target.value)}
                    className="field w-full"
                  >
                    <option value="Month End Special">Month End Special</option>
                    <option value="While Stock Lasts">While Stock Lasts</option>
                    <option value="Weekend Braai Deal">Weekend Braai Deal</option>
                    <option value="Budget Combo">Budget Combo</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">
                  End Date (Leave blank for "While Stock Lasts")
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={e => setFormEndDate(e.target.value)}
                  className="field w-full"
                />
              </div>

              {/* Attach Products */}
              <div>
                <label className="field-label">
                  Select Products to Include:
                </label>
                <div className="bg-paper p-3 rounded-lg border border-ink/10 max-h-40 overflow-y-auto space-y-1">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
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
                        className="rounded bg-white border-ink/10 text-brand-accent-deep"
                      />
                      <span className="text-ink text-sm">{p.name} ({formatZAR(p.price)})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">Promo Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm modal-overlay flex items-start justify-center p-4"
          onClick={() => setRerunModalSpecial(null)}
        >
          <div
            className="w-full max-w-md text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="display text-2xl">Re-Run Campaign: {rerunModalSpecial.title}</h3>
              <button type="button" onClick={() => setRerunModalSpecial(null)} aria-label="Close" className="icon-btn -mt-2 -mr-2 hover:bg-sand">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-ink-soft">
              Set new dates to bring this archived promotional special back to life on the homepage carousel.
            </p>

            <form onSubmit={handleRerunSubmit} className="space-y-4 text-sm">
              <div>
                <label className="field-label">New Start Date</label>
                <input
                  type="date"
                  required
                  value={rerunStartDate}
                  onChange={e => setRerunStartDate(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="field-label">New End Date (Optional)</label>
                <input
                  type="date"
                  value={rerunEndDate}
                  onChange={e => setRerunEndDate(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRerunModalSpecial(null)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
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
