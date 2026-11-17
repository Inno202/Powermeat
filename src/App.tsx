import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './services/store';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NavigationDrawer } from './components/common/NavigationDrawer';
import { CartDrawer } from './components/common/CartDrawer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { HeroBanner } from './components/store/HeroBanner';
import { SpecialsCarousel } from './components/store/SpecialsCarousel';
import { CategoryTiles } from './components/store/CategoryTiles';
import { FreeDeliveryStrip } from './components/store/FreeDeliveryStrip';
import { ProductCard } from './components/store/ProductCard';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderConfirmation } from './components/store/OrderConfirmation';
import { MyOrdersView } from './components/store/MyOrdersView';
import {
  DeliveryAreasPage,
  WholesalePage,
  ContactPage,
  PrivacyPolicyPage
} from './components/store/InfoPages';
import { AdminLayout } from './components/admin/AdminLayout';
import { Product, Order } from './types';
import { MapPin, Phone, MessageCircle, Clock, Search } from 'lucide-react';
import { FeedbackHost } from './components/ui/feedback';
import { whatsappLink, telLink } from './utils/contact';
import { rememberMyOrder } from './utils/myOrders';

const CATALOGUE_FILTERS = [
  'All',
  'Meat Combos',
  'Family Hampers',
  'Continental Hampers',
  'SASSA Hamper',
  'Beke Le Beke',
  'Bulk Meat',
  'Deli & Ham',
  'Bulk Packs',
  'Specials'
];

function StoreFront() {
  const {
    products,
    isNavDrawerOpen,
    setIsNavDrawerOpen,
    addToCart,
    settings
  } = useStore();

  const [activePage, setActivePage] = useState<string>('store');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Sync with browser URL /admin hash or path
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash.includes('admin')) {
        setActivePage('admin');
      }
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (page: string) => {
    setConfirmedOrder(null);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setActivePage('store');
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId) || {
        id: it.productId,
        name: it.name,
        slug: it.name.toLowerCase().replace(/\s+/g, '-'),
        category: it.category,
        sku: 'PM-RE',
        description: it.name,
        pricingType: it.pricingType,
        price: it.unitPrice,
        isFreeDelivery: false,
        stockStatus: 'in_stock' as const,
        sortOrder: 99,
        tags: []
      };
      addToCart(prod, it.quantity, it.selectedOption);
    });
    setConfirmedOrder(null);
    setActivePage('store');
  };

  // If on admin back-office page
  if (activePage === 'admin') {
    return <AdminLayout onNavigateHome={() => navigateTo('store')} />;
  }

  // Filter products for the store catalog
  const filteredProducts = products.filter(p => {
    if (p.stockStatus === 'hidden') return false;

    if (activeCategory === 'Specials') {
      if (!p.isSpecial) return false;
    } else if (activeCategory !== 'All') {
      if (p.category !== activeCategory && p.subCategory !== activeCategory) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      const match =
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(term)));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {/* Global Header */}
      <Header
        onNavigateHome={() => navigateTo('store')}
        onNavigateAdmin={() => navigateTo('admin')}
        onNavigateMyOrders={() => navigateTo('my-orders')}
      />

      {/* Slide-Down Navigation Drawer */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        onSelectCategory={handleSelectCategory}
        onNavigatePage={navigateTo}
      />

      {/* Main Page Routing */}
      <main id="main" className="flex-1">
        {confirmedOrder ? (
          <OrderConfirmation
            order={confirmedOrder}
            onContinueShopping={() => {
              setConfirmedOrder(null);
              navigateTo('store');
            }}
            onReorder={handleReorder}
          />
        ) : activePage === 'my-orders' ? (
          <MyOrdersView
            onReorder={handleReorder}
            onNavigateHome={() => navigateTo('store')}
          />
        ) : activePage === 'delivery_areas' ? (
          <DeliveryAreasPage onNavigateHome={() => navigateTo('store')} />
        ) : activePage === 'wholesale' ? (
          <WholesalePage onNavigateHome={() => navigateTo('store')} />
        ) : activePage === 'contact' ? (
          <ContactPage onNavigateHome={() => navigateTo('store')} />
        ) : activePage === 'privacy' ? (
          <PrivacyPolicyPage onNavigateHome={() => navigateTo('store')} />
        ) : (
          /* STORE HOMEPAGE */
          <>
            {/* 1. HERO BANNER */}
            <HeroBanner
              onOrderNow={() => {
                const el = document.getElementById('products-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. SPECIALS CAROUSEL */}
            <SpecialsCarousel onSelectProduct={prod => setSelectedProduct(prod)} />

            {/* 3. CATEGORY TILES */}
            <CategoryTiles
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* 4. FREE DELIVERY STRIP WITH AREA DAYS TABLE */}
            <FreeDeliveryStrip />

            {/* Catalogue */}
            <section id="products-section" className="py-16 md:py-20 scroll-mt-28" aria-labelledby="catalogue-title">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
                  <div>
                    <h2 id="catalogue-title" className="display text-4xl sm:text-5xl">
                      {activeCategory === 'All' ? (
                        <>
                          Fresh butchery cuts and <span className="text-brand-accent">family hampers</span>
                        </>
                      ) : (
                        activeCategory
                      )}
                    </h2>
                    <p className="num text-sm text-ink-soft mt-2" aria-live="polite">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="search"
                      aria-label="Search the catalogue"
                      placeholder="Search meat, hampers, braai"
                      maxLength={60}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="field pl-11"
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {CATALOGUE_FILTERS.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`btn btn-sm whitespace-nowrap shrink-0 ${
                        activeCategory === cat ? 'btn-primary hover:bg-ink' : 'btn-outline'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="panel p-10 text-center">
                    <h3 className="display text-3xl">Nothing matches that search</h3>
                    <p className="text-ink-soft mt-2">Try another category or clear the search.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('All');
                        setSearchQuery('');
                      }}
                      className="btn btn-primary mt-5"
                    >
                      Show all products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onSelect={p => setSelectedProduct(p)} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Visit the store */}
            <section className="pb-4" aria-labelledby="visit-title">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 id="visit-title" className="display text-4xl sm:text-5xl">
                      Visit the butchery in <span className="text-brand-accent">Welkom</span>
                    </h2>

                    <ul className="num mt-8 space-y-2">
                      <li className="flex items-start gap-3.5">
                        <MapPin size={22} className="text-brand-accent-deep shrink-0 mt-2.5" />
                        <span className="py-2">{settings.address}</span>
                      </li>
                      <li className="flex items-start gap-3.5">
                        <Phone size={22} className="text-brand-accent-deep shrink-0 mt-2.5" />
                        <span className="flex flex-wrap gap-x-4">
                          <a href={telLink(settings.phone1)} className="link">
                            {settings.phone1}
                          </a>
                          <a href={telLink(settings.phone2)} className="link">
                            {settings.phone2}
                          </a>
                        </span>
                      </li>
                      <li className="flex items-start gap-3.5">
                        <MessageCircle size={22} className="text-brand-accent-deep shrink-0 mt-2.5" />
                        <a
                          href={whatsappLink(settings.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          WhatsApp {settings.whatsapp}
                        </a>
                      </li>
                      <li className="flex items-start gap-3.5">
                        <Clock size={22} className="text-brand-accent-deep shrink-0 mt-2.5" />
                        <span className="py-2">
                          {settings.tradingHours.weekdays}
                          <br />
                          {settings.tradingHours.saturday}
                          <br />
                          {settings.tradingHours.sunday}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="frame aspect-[4/3] w-full">
                    <iframe
                      title="Map showing Powermeat at 145 Power Road, Welkom"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      src="https://maps.google.com/maps?q=145%20Power%20Road,%20Welkom,%20Free%20State&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={rel => setSelectedProduct(rel)}
        onNavigateCategory={handleSelectCategory}
      />

      {/* Cart Drawer */}
      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={newOrder => {
          setIsCheckoutOpen(false);
          rememberMyOrder(newOrder.id);
          setConfirmedOrder(newOrder);
          window.scrollTo({ top: 0 });
        }}
      />

      {/* 7. FLOATING WHATSAPP BUTTON (On every page) */}
      <FloatingWhatsApp />

      {/* Global Footer */}
      <Footer
        onNavigatePage={navigateTo}
        onNavigateCategory={handleSelectCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreFront />
      <FeedbackHost />
    </StoreProvider>
  );
}
