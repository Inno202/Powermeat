import React from 'react';
import { ShoppingCart, User, Menu, X, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../../services/store';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  onNavigateMyOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigateAdmin,
  onNavigateMyOrders
}) => {
  const {
    cartItemCount,
    setIsCartDrawerOpen,
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    currentUser,
    settings
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. TOP UTILITY BAR (POWERMEAT RED) */}
      <div className="bg-[#D7141A] text-white px-4 py-1.5 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 truncate">
            <span className="font-bold tracking-wide">📍 {settings.address}</span>
            <span className="text-red-200">|</span>
            <span className="text-red-100 truncate">{settings.announcementBarText}</span>
          </div>
          <div className="sm:hidden text-[11px] font-bold truncate">
            📍 Welkom & Free State Deliveries
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* My Orders */}
            <button
              onClick={onNavigateMyOrders}
              className="hover:underline flex items-center gap-1 cursor-pointer text-white/90 hover:text-white"
            >
              <span>Track / My Orders</span>
            </button>

            <span className="text-red-300">|</span>

            {/* Account / Admin Portal */}
            <button
              onClick={onNavigateAdmin}
              className="flex items-center gap-1.5 hover:underline cursor-pointer bg-black/20 hover:bg-black/30 px-2 py-0.5 rounded transition text-xs"
            >
              <User size={13} />
              {currentUser ? (
                <span className="flex items-center gap-1">
                  <span className="font-bold">{currentUser.name.split(' ')[0]}</span>
                  <span className="bg-[#FFC400] text-black text-[9px] uppercase px-1 rounded font-extrabold">
                    {currentUser.role}
                  </span>
                </span>
              ) : (
                <span>Staff Portal</span>
              )}
            </button>

            {/* Cart Icon with round count badge */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label={`Cart with ${cartItemCount} items`}
              className="relative flex items-center justify-center p-1 hover:scale-105 transition cursor-pointer ml-1"
            >
              <ShoppingCart size={18} className="text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FFC400] text-neutral-950 text-[11px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (BLACK) */}
      <div className="bg-[#111111] border-b border-[#2B2B2B] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo on the left */}
          <div
            onClick={onNavigateHome}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Powermeat Home"
          >
            <Logo size="md" showTagline={true} />
          </div>

          {/* Right side: Outlined "Navigate" button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
              aria-label={isNavDrawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="flex items-center gap-2 border-2 border-neutral-400 hover:border-[#D7141A] text-white hover:text-[#D7141A] px-3.5 py-1.5 rounded-lg transition-colors font-bold text-sm tracking-wide cursor-pointer select-none bg-neutral-900/60"
            >
              {isNavDrawerOpen ? (
                <>
                  <X size={20} className="text-[#D7141A]" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu size={20} />
                  <span>Navigate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
