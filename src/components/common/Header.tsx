import React from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useStore, DEMO_MODE } from '../../services/store';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigatePage
}) => {
  const {
    cartItemCount,
    setIsCartDrawerOpen,
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    currentUser,
    account,
    settings
  } = useStore();

  // One sign-in for everyone; the role on the account decides where it leads.
  const accountTarget = currentUser || DEMO_MODE ? 'admin' : account ? 'my-orders' : 'signin';
  const accountLabel = currentUser ? currentUser.name.split(' ')[0] : account ? 'My account' : 'Sign in';

  return (
    <header className="sticky top-0 z-40 w-full bg-paper/95 backdrop-blur border-b border-ink/10">
      {settings.announcementBarActive && settings.announcementBarText && (
        <div className="bg-ink text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-center text-xs sm:text-sm leading-snug">
            <span>{settings.announcementBarText}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onNavigateHome}
          aria-label="Powermeat home"
          className="rounded-xl min-h-[44px] flex items-center"
        >
          <span className="hidden sm:block">
            <Logo size="md" />
          </span>
          <span className="sm:hidden">
            <Logo size="sm" />
          </span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {!(account && !currentUser) && (
            <button
              type="button"
              onClick={() => onNavigatePage('my-orders')}
              className="hidden md:inline-flex btn btn-sm text-ink hover:bg-sand"
            >
              My orders
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigatePage(accountTarget)}
            className="hidden md:inline-flex btn btn-sm text-ink hover:bg-sand"
          >
            <span>{accountLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label={`Open cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
            className="icon-btn relative text-ink hover:bg-sand"
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="num absolute top-0 right-0 bg-brand-accent text-white text-[11px] font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            aria-expanded={isNavDrawerOpen}
            aria-label={isNavDrawerOpen ? 'Close menu' : 'Open menu'}
            className="btn btn-sm btn-outline min-w-[44px] px-3 sm:px-4"
          >
            {isNavDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="hidden min-[400px]:inline">{isNavDrawerOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
