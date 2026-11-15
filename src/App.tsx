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
import { MapPin, Phone, MessageCircle, Clock, Search, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[#111111] text-neutral-100">
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
      <main className="flex-1">
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

            {/* 5. MAIN CATALOG / BEST SELLERS SECTION */}
            <section id="products-section" className="py-10 bg-[#141414]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Catalog Controls Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-wide text-white">
                      {activeCategory === 'All'
                        ? 'Fresh Butchery Cuts & Family Hampers'
                        : `${activeCategory}`}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                      Showing {filteredProducts.length} items ready for delivery or store collection
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                    <input
                      type="text"
                      placeholder="Search meat, hampers, braai..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1F1F1F] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
                    />
                  </div>
                </div>

                {/* Category Pills Bar */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar text-xs">
                  {[
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
                  ].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-[#D7141A] text-white shadow'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-[#2D2D2D]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* PRODUCT CARDS GRID: 2 cols on mobile, 3-4 on desktop (Section 3.2) */}
                {filteredProducts.length === 0 ? (
                  <div className="bg-[#1C1C1C] rounded-2xl p-12 text-center border border-[#2B2B2B]">
                    <p className="text-base font-bold text-neutral-300">
                      No products found matching your filter.
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try selecting another category or clear your search query.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setSearchQuery('');
                      }}
                      className="mt-4 bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer"
                    >
                      View All Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={p => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 6. CONTACT BLOCK & INTERACTIVE MAP EMBED (Section 3.4) */}
            <section className="py-12 bg-[#101010] border-t border-[#222222]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#D7141A]">
                        Visit Our Welkom Store
                      </span>
                      <h2 className="text-3xl font-heading font-extrabold uppercase text-white tracking-wide mt-1">
                        Powermeat Butchery & Meat Wholesaler
                      </h2>
                      <p className="text-sm text-neutral-400 mt-1">
                        Fresh butcher counter cuts, bulk pack collections and friendly butchery service.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-[#D7141A] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Physical Store</strong>
                          <span>{settings.address}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={20} className="text-[#D7141A] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Butchery Counter Phones</strong>
                          <span>057 396 3189 / 057 396 1805</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MessageCircle size={20} className="text-[#25D366] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">WhatsApp Direct Order Desk</strong>
                          <a
                            href={`https://wa.me/27${settings.whatsapp.replace(/^0/, '').replace(/\s+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline"
                          >
                            {settings.whatsapp}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock size={20} className="text-[#FFC400] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Store Trading Hours</strong>
                          <p className="text-neutral-400">Monday – Friday: 07:30 – 17:30</p>
                          <p className="text-neutral-400">Saturday: 07:30 – 14:00 | Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Visual Frame */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 border border-[#2D2D2D] shadow-xl">
                    <iframe
                      title="Powermeat Butchery Welkom Location"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
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
          setConfirmedOrder(newOrder);
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
    </StoreProvider>
  );
}
