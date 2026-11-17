import React from 'react';
import { Logo } from './Logo';
import { useStore } from '../../services/store';
import { whatsappLink, telLink } from '../../utils/contact';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onNavigateCategory: (cat: string) => void;
}

const linkClass = 'min-h-[44px] min-w-[44px] inline-flex items-center text-left text-white/80 hover:text-white transition-colors';

export const Footer: React.FC<FooterProps> = ({ onNavigatePage, onNavigateCategory }) => {
  const { settings } = useStore();

  return (
    <footer className="bg-charcoal text-white/80 pt-16 pb-28 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo size="md" showTagline onDark />
            <p className="mt-5 text-sm">
              Powermeat is Welkom's trusted butchery for premium beef, pork, chicken, boerewors and bulk family
              hampers. Fresh quality cuts daily at unbeatable prices.
            </p>
          </div>

          <nav aria-label="Shop">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">Shop</h2>
            <ul>
              {['Meat Combos', 'Family Hampers', 'Continental Hampers', 'SASSA Hamper', 'Beke Le Beke', 'Bulk Meat'].map(
                cat => (
                  <li key={cat}>
                    <button type="button" onClick={() => onNavigateCategory(cat)} className={linkClass}>
                      {cat}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">Trading hours</h2>
            <div className="num text-sm flex items-start gap-2.5">
              <ul>
                <li>{settings.tradingHours.weekdays}</li>
                <li>{settings.tradingHours.saturday}</li>
                <li>{settings.tradingHours.sunday}</li>
              </ul>
            </div>
            <p className="mt-4 text-sm">
              We deliver to Welkom, Thabong, Bronville, Riebeekstad, Virginia, Odendaalsrus, Theunissen / Bloemfontein
              and Kroonstad.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white mb-3">Contact</h2>
            <ul className="num text-sm">
              <li className="flex items-start gap-2.5 py-2">
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex flex-wrap gap-x-2">
                  <a href={telLink(settings.phone1)} className={linkClass}>
                    {settings.phone1}
                  </a>
                  <a href={telLink(settings.phone2)} className={linkClass}>
                    {settings.phone2}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp {settings.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row md:items-center justify-between text-sm gap-2">
          <p className="num">© {new Date().getFullYear()} Powermeat Welkom. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6">
            <button type="button" onClick={() => onNavigatePage('privacy')} className={linkClass}>
              Privacy Policy (POPIA)
            </button>
            <button type="button" onClick={() => onNavigatePage('delivery_areas')} className={linkClass}>
              Delivery Terms
            </button>
            <button type="button" onClick={() => onNavigatePage('wholesale')} className={linkClass}>
              Wholesale
            </button>
            <button type="button" onClick={() => onNavigatePage('signin')} className={linkClass}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
