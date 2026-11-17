import React, { useState } from 'react';
import { Settings, Save, CreditCard, Store, Bell, CheckCircle2 } from 'lucide-react';
import { confirmAction, toast } from '../ui/feedback';
import { useStore, DEMO_MODE } from '../../services/store';
import { SEED_PRODUCTS } from '../../data/seedData';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, currentUser, resetAllData, loadStartingCatalogue, products } = useStore();
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone1, setPhone1] = useState(settings.phone1);
  const [phone2, setPhone2] = useState(settings.phone2);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle);
  const [announcementText, setAnnouncementText] = useState(settings.announcementBarText);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(settings.onlinePaymentEnabled);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tagline,
      address,
      phone1,
      phone2,
      whatsapp,
      heroTitle,
      heroSubtitle,
      announcementBarText: announcementText,
      onlinePaymentEnabled
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="display text-3xl">
          Store & System Settings (Owner Only)
        </h2>
        <p className="text-sm text-ink-soft mt-0.5">
          Configure butchery identity, telephone lines, WhatsApp number, and online gateway toggles.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-800 shrink-0" />
          <span>Store settings successfully updated and broadcast to public site.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-ink/10 p-6 space-y-6 text-sm">
        {/* Butchery Details */}
        <div className="space-y-4">
          <h3 className="display flex items-center gap-2 border-b border-ink/10 pb-2 text-2xl">
            <Store size={18} className="text-brand-accent-deep" />
            <span>Butchery Brand & Storefront</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="field w-full"
              />
            </div>

            <div>
              <label className="field-label">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="field w-full"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Physical Store Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="field w-full"
            />
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="space-y-4 pt-4 border-t border-ink/10">
          <h3 className="display text-2xl">
            Contact & WhatsApp Lines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">WhatsApp Orders Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="field w-full num"
              />
            </div>

            <div>
              <label className="field-label">Landline 1</label>
              <input
                type="text"
                value={phone1}
                onChange={e => setPhone1(e.target.value)}
                className="field w-full num"
              />
            </div>

            <div>
              <label className="field-label">Landline 2</label>
              <input
                type="text"
                value={phone2}
                onChange={e => setPhone2(e.target.value)}
                className="field w-full num"
              />
            </div>
          </div>
        </div>

        {/* Banner Texts */}
        <div className="space-y-4 pt-4 border-t border-ink/10">
          <h3 className="display flex items-center gap-2 text-2xl">
            <Bell size={18} className="text-brand-yellow-deep" />
            <span>Store Announcements & Hero Banner</span>
          </h3>

          <div>
            <label className="field-label">Announcement Bar Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              className="field w-full"
            />
          </div>

          <div>
            <label className="field-label">Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              className="field w-full"
            />
          </div>

          <div>
            <label className="field-label">Hero Subtitle</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              className="field w-full"
            />
          </div>
        </div>

        {/* Online Payment Gateway Toggle */}
        <div className="space-y-4 pt-4 border-t border-ink/10">
          <h3 className="display flex items-center gap-2 text-2xl">
            <CreditCard size={18} className="text-emerald-800" />
            <span>Online Card Payments (PayFast / Yoco)</span>
          </h3>

          <div className="p-4 bg-paper rounded-xl border border-ink/10 flex items-center justify-between">
            <div>
              <strong className="text-ink text-sm block">Enable Online Card Payment Gateway</strong>
              <p className="text-ink-soft text-sm mt-0.5">
                Switched off by default. When enabled, customers can pay via PayFast/Yoco card checkout at step 5.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onlinePaymentEnabled}
                onChange={e => setOnlinePaymentEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sand peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-ink/10">
          {DEMO_MODE ? (
            <button
              type="button"
              onClick={async () => {
                const ok = await confirmAction({
                  title: 'Reset all demo data?',
                  message: 'Products, orders and demo staff go back to the starting examples. This cannot be undone.',
                  confirmLabel: 'Reset demo data',
                  tone: 'danger'
                });
                if (ok) {
                  resetAllData();
                  toast('Demo data reset');
                }
              }}
              className="btn btn-sm btn-danger"
            >
              Reset demo data
            </button>
          ) : (
            <button
              type="button"
              disabled={loadingCatalogue}
              onClick={async () => {
                const ok = await confirmAction({
                  title: 'Load the starting catalogue?',
                  message: `This saves the ${SEED_PRODUCTS.length} starting products, the specials, the delivery areas and these store details to the live shop. Products with the same codes are replaced with the starting versions.`,
                  confirmLabel: 'Load catalogue',
                  tone: products.length > 0 ? 'danger' : 'default'
                });
                if (!ok) return;
                setLoadingCatalogue(true);
                if (await loadStartingCatalogue()) toast('Starting catalogue loaded');
                setLoadingCatalogue(false);
              }}
              className="btn btn-sm btn-outline"
            >
              {loadingCatalogue ? 'Loading' : products.length > 0 ? 'Reload the starting catalogue' : 'Load the starting catalogue'}
            </button>
          )}

          <button
            type="submit"
            className="btn btn-sm btn-accent"
          >
            <Save size={15} />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
