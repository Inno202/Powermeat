import React, { useState } from 'react';
import { Settings, Save, CreditCard, Store, Bell, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../services/store';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, currentUser, resetAllData } = useStore();

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
        <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
          Store & System Settings (Owner Only)
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure butchery identity, telephone lines, WhatsApp number, and online gateway toggles.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Store settings successfully updated and broadcast to public site.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 space-y-6 text-xs">
        {/* Butchery Details */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider flex items-center gap-2 border-b border-[#2B2B2B] pb-2">
            <Store size={18} className="text-[#D7141A]" />
            <span>Butchery Brand & Storefront</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-300 block mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-300 block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1">Physical Store Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white"
            />
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="space-y-4 pt-4 border-t border-[#2B2B2B]">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider">
            Contact & WhatsApp Lines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-neutral-300 block mb-1">WhatsApp Orders Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-300 block mb-1">Landline 1</label>
              <input
                type="text"
                value={phone1}
                onChange={e => setPhone1(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-300 block mb-1">Landline 2</label>
              <input
                type="text"
                value={phone2}
                onChange={e => setPhone2(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Banner Texts */}
        <div className="space-y-4 pt-4 border-t border-[#2B2B2B]">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider flex items-center gap-2">
            <Bell size={18} className="text-[#FFC400]" />
            <span>Store Announcements & Hero Banner</span>
          </h3>

          <div>
            <label className="font-bold text-neutral-300 block mb-1">Announcement Bar Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
              className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1">Hero Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white font-display text-base"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1">Hero Subtitle</label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white"
            />
          </div>
        </div>

        {/* Online Payment Gateway Toggle */}
        <div className="space-y-4 pt-4 border-t border-[#2B2B2B]">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-400" />
            <span>Online Card Payments (PayFast / Yoco)</span>
          </h3>

          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div>
              <strong className="text-white text-sm block">Enable Online Card Payment Gateway</strong>
              <p className="text-neutral-400 text-[11px] mt-0.5">
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
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D7141A]"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[#2B2B2B]">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all demo data back to factory seeds? This resets products, orders and demo users.')) {
                resetAllData();
              }
            }}
            className="text-neutral-500 hover:text-red-400 text-xs underline cursor-pointer"
          >
            Reset Demo Data to Seed
          </button>

          <button
            type="submit"
            className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Save size={15} />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
