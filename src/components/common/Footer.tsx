import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../../services/store';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onNavigateCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage, onNavigateCategory }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-[#0D0D0D] text-neutral-300 border-t border-[#222222] pt-12 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-neutral-400 leading-relaxed">
              Powermeat is Welkom's trusted butchery for premium beef, pork, chicken, boerewors and bulk family hampers. Fresh quality cuts daily at unbeatable prices.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-[#D7141A]/20 border border-[#D7141A]/50 text-[#FFC400] text-xs px-3 py-1.5 rounded font-extrabold italic">
                "{settings.tagline}"
              </span>
            </div>
          </div>

          {/* Col 2: Hampers & Quick Links */}
          <div>
            <h4 className="text-white font-heading text-lg font-bold uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
              Popular Hampers
            </h4>
            <ul className="space-y-2 text-sm">
              {['Meat Combos', 'Family Hampers', 'Continental Hampers', 'SASSA Hamper', 'Beke Le Beke', 'Bulk Meat'].map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigateCategory(cat)}
                    className="hover:text-[#D7141A] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="text-[#D7141A] text-xs">▸</span>
                    <span>{cat}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Trading Hours & Areas */}
          <div>
            <h4 className="text-white font-heading text-lg font-bold uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
              Trading Hours
            </h4>
            <div className="space-y-2 text-sm text-neutral-400">
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-[#D7141A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Mon – Fri:</p>
                  <p>07:30 – 17:30</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock size={16} className="text-[#D7141A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Saturday:</p>
                  <p>07:30 – 14:00</p>
                </div>
              </div>
              <div className="pt-2 text-xs text-neutral-400">
                <p><strong className="text-white">Delivery Areas:</strong> Welkom, Thabong, Bronville, Riebeekstad, Virginia, Odendaalsrus, Theunissen / Bloemfontein, Kroonstad.</p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Direct Butchery Lines */}
          <div>
            <h4 className="text-white font-heading text-lg font-bold uppercase tracking-wider mb-4 border-b border-[#262626] pb-2">
              Butchery Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin size={17} className="text-[#D7141A] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={17} className="text-[#D7141A] shrink-0" />
                <a href={`tel:${settings.phone1.replace(/\s+/g, '')}`} className="hover:text-white transition">
                  {settings.phone1} / {settings.phone2}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle size={17} className="text-[#25D366] shrink-0" />
                <a
                  href={`https://wa.me/27${settings.whatsapp.replace(/^0/, '').replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </div>
              <div className="pt-3">
                <button
                  onClick={() => onNavigatePage('admin')}
                  className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white border border-[#333] text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck size={14} className="text-[#D7141A]" />
                  <span>Central Admin & Staff Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with POPIA, copyright, disclaimer */}
        <div className="border-t border-[#1F1F1F] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Powermeat Welkom. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigatePage('privacy')}
              className="hover:text-neutral-300 underline cursor-pointer"
            >
              Privacy Policy (POPIA)
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigatePage('delivery_areas')}
              className="hover:text-neutral-300 underline cursor-pointer"
            >
              Delivery Terms
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigatePage('wholesale')}
              className="hover:text-neutral-300 underline cursor-pointer"
            >
              Wholesale
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
