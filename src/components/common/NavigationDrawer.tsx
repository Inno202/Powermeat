import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Truck,
  Building2,
  PhoneCall,
  Home,
  Package,
  Layers,
  X
} from 'lucide-react';
import { useStore } from '../../services/store';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
  onNavigatePage?: (page: string) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onNavigatePage
}) => {
  const [hampersExpanded, setHampersExpanded] = useState(true);
  const [shopExpanded, setShopExpanded] = useState(false);

  if (!isOpen) return null;

  const handleLinkClick = (action: () => void) => {
    action();
    onClose();
  };

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (onNavigatePage) {
      onNavigatePage('store');
    }
    onClose();
  };

  const handlePageClick = (page: string) => {
    if (onNavigatePage) {
      onNavigatePage(page);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      {/* Slide-down Drawer Container: Light background with red text links */}
      <div
        className="relative w-full max-h-[88vh] overflow-y-auto bg-neutral-100 text-neutral-900 shadow-2xl transition-transform duration-300 ease-out border-b-4 border-[#D7141A]"
        onClick={e => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto px-5 py-6">
          {/* Header row in drawer */}
          <div className="flex items-center justify-between border-b border-neutral-300 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-wide text-[#D7141A] font-extrabold italic">
                POWERMEAT DIRECTORY
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 text-neutral-700 hover:text-[#D7141A] hover:border-[#D7141A] transition text-sm font-semibold cursor-pointer"
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>

          <nav className="flex flex-col divide-y divide-neutral-200">
            {/* 1. HOME */}
            <button
              onClick={() => handleLinkClick(() => handlePageClick('store'))}
              className="flex items-center gap-3 py-3.5 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
            >
              <Home size={20} className="text-[#D7141A]" />
              <span>Home</span>
            </button>

            {/* 2. SPECIALS (HIGHLIGHTED) */}
            <button
              onClick={() => handleLinkClick(() => handleCategoryClick('Specials'))}
              className="flex items-center justify-between py-3.5 text-left text-lg font-extrabold text-[#D7141A] hover:text-[#B30E13] transition bg-red-50/60 px-3 rounded-md my-1"
            >
              <div className="flex items-center gap-3">
                <Flame size={22} className="text-[#D7141A] fill-[#D7141A]" />
                <span className="tracking-wide">SPECIALS & PROMOTIONS</span>
              </div>
              <span className="bg-[#FFC400] text-neutral-950 text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
                HOT DEALS
              </span>
            </button>

            {/* 3. HAMPERS & COMBOS (EXPANDABLE) */}
            <div className="py-2">
              <button
                onClick={() => setHampersExpanded(!hampersExpanded)}
                className="w-full flex items-center justify-between py-2 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
              >
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-[#D7141A]" />
                  <span>Hampers & Combos</span>
                </div>
                {hampersExpanded ? (
                  <ChevronDown size={20} className="text-neutral-500" />
                ) : (
                  <ChevronRight size={20} className="text-neutral-500" />
                )}
              </button>

              {hampersExpanded && (
                <div className="pl-9 pr-2 py-2 flex flex-col gap-2.5 bg-neutral-50 rounded-lg border-l-2 border-[#D7141A] my-1">
                  {[
                    { label: 'Meat Combos', free: true },
                    { label: 'Family Hampers', free: true },
                    { label: 'Continental Hampers', free: false },
                    { label: 'SASSA Hamper', free: false },
                    { label: 'Beke Le Beke', free: false }
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={() => handleCategoryClick(sub.label)}
                      className="flex items-center justify-between text-left text-base font-semibold text-[#D7141A] hover:text-[#8F0A0E] hover:translate-x-1 transition py-1"
                    >
                      <span>{sub.label}</span>
                      {sub.free && (
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-red-100 text-[#D7141A] px-2 py-0.5 rounded">
                          Free Delivery
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. SHOP ONLINE (EXPANDABLE) */}
            <div className="py-2">
              <button
                onClick={() => setShopExpanded(!shopExpanded)}
                className="w-full flex items-center justify-between py-2 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
              >
                <div className="flex items-center gap-3">
                  <Layers size={20} className="text-[#D7141A]" />
                  <span>Shop Online</span>
                </div>
                {shopExpanded ? (
                  <ChevronDown size={20} className="text-neutral-500" />
                ) : (
                  <ChevronRight size={20} className="text-neutral-500" />
                )}
              </button>

              {shopExpanded && (
                <div className="pl-9 pr-2 py-2 grid grid-cols-2 gap-2 bg-neutral-50 rounded-lg border-l-2 border-neutral-400 my-1">
                  {[
                    'Beef',
                    'Pork',
                    'Chicken',
                    'Lamb',
                    'Wors & Sausages',
                    'Deli & Ham',
                    'Bulk Packs',
                    'Frozen & Extras'
                  ].map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="text-left text-sm font-semibold text-neutral-700 hover:text-[#D7141A] hover:translate-x-0.5 transition py-1.5"
                    >
                      • {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. DELIVERY AREAS */}
            <button
              onClick={() => handleLinkClick(() => handlePageClick('delivery_areas'))}
              className="flex items-center gap-3 py-3.5 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
            >
              <Truck size={20} className="text-[#D7141A]" />
              <span>Delivery Areas & Schedule</span>
            </button>

            {/* 6. WHOLESALE / BULK ORDERS */}
            <button
              onClick={() => handleLinkClick(() => handlePageClick('wholesale'))}
              className="flex items-center gap-3 py-3.5 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
            >
              <Building2 size={20} className="text-[#D7141A]" />
              <span>Wholesale / Bulk Orders</span>
            </button>

            {/* 7. CONTACT INFO */}
            <button
              onClick={() => handleLinkClick(() => handlePageClick('contact'))}
              className="flex items-center gap-3 py-3.5 text-left text-lg font-bold text-neutral-900 hover:text-[#D7141A] transition"
            >
              <PhoneCall size={20} className="text-[#D7141A]" />
              <span>Contact Info & Location</span>
            </button>
          </nav>

          {/* Bottom quick trading hours */}
          <div className="mt-6 pt-4 border-t border-neutral-300 text-xs text-neutral-600 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <span className="font-bold text-neutral-800">145 Power Road, Welkom</span> • Tel: 057 396 3189
            </div>
            <div>
              Mon-Fri 07:30–17:30 • Sat 07:30–14:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
