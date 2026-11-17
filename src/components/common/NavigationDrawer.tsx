import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore, DEMO_MODE } from '../../services/store';
import { telLink } from '../../utils/contact';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
  onNavigatePage?: (page: string) => void;
}

const HAMPERS = ['Specials', 'Meat Combos', 'Family Hampers', 'Continental Hampers', 'SASSA Hamper', 'Beke Le Beke'];
const CUTS = ['Beef', 'Pork', 'Chicken', 'Lamb', 'Wors & Sausages', 'Deli & Ham', 'Bulk Packs', 'Frozen & Extras'];

const rowClass =
  'w-full min-h-[48px] flex items-center gap-3 px-3 rounded-xl text-left font-semibold hover:bg-sand transition-colors';
const subClass =
  'min-h-[44px] flex items-center px-3 rounded-xl text-left text-ink-soft hover:text-ink hover:bg-sand transition-colors';

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onNavigatePage
}) => {
  const { settings, currentUser, account } = useStore();
  const accountTarget = currentUser || DEMO_MODE ? 'admin' : account ? 'my-orders' : 'signin';
  const accountLabel = currentUser ? 'Business area' : account ? 'My account' : 'Sign in';

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const goCategory = (cat: string) => {
    onNavigatePage?.('store');
    onSelectCategory?.(cat);
    onClose();
  };
  const goPage = (page: string) => {
    onNavigatePage?.(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="sheet-in w-full max-h-[92dvh] overflow-y-auto bg-paper text-ink rounded-b-[2rem]"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="display text-3xl">Menu</h2>
            <button type="button" onClick={onClose} aria-label="Close menu" className="icon-btn hover:bg-sand">
              <X size={22} />
            </button>
          </div>

          <nav className="grid gap-x-10 gap-y-6 md:grid-cols-3 pb-4" aria-label="Main">
            <div>
              <button type="button" onClick={() => goPage('store')} className={rowClass}>
                Home
              </button>
              <button type="button" onClick={() => goPage('my-orders')} className={rowClass}>
                Track my order
              </button>
              <button type="button" onClick={() => goPage('delivery_areas')} className={rowClass}>
                Delivery areas and days
              </button>
              <button type="button" onClick={() => goPage('wholesale')} className={rowClass}>
                Wholesale and bulk orders
              </button>
              <button type="button" onClick={() => goPage('contact')} className={rowClass}>
                Contact and location
              </button>
              <button type="button" onClick={() => goPage(accountTarget)} className={rowClass}>
                {accountLabel}
              </button>
            </div>

            <div>
              <h3 className="px-3 text-xs font-semibold uppercase tracking-widest text-ink-soft mb-1">
                Hampers and combos
              </h3>
              <div className="flex flex-col">
                {HAMPERS.map(cat => (
                  <button key={cat} type="button" onClick={() => goCategory(cat)} className={subClass}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="px-3 text-xs font-semibold uppercase tracking-widest text-ink-soft mb-1">
                Butchery cuts
              </h3>
              <div className="grid grid-cols-2">
                {CUTS.map(cat => (
                  <button key={cat} type="button" onClick={() => goCategory(cat)} className={subClass}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <p className="num border-t border-ink/10 pt-4 pb-2 text-sm text-ink-soft flex flex-col sm:flex-row sm:justify-between gap-1">
            <span>
              {settings.address} ·{' '}
              <a href={telLink(settings.phone1)} className="link">
                {settings.phone1}
              </a>
            </span>
            <span>
              {settings.tradingHours.weekdays} · {settings.tradingHours.saturday}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
