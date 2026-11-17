import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Flame,
  Truck,
  Users,
  BarChart3,
  UserCog,
  Settings,
  History,
  LogOut,
  Store,
  Plus,
  X
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Role } from '../../types';
import { Logo } from '../common/Logo';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminSpecials } from './AdminSpecials';
import { AdminDeliverySettings } from './AdminDeliverySettings';
import { AdminCustomers } from './AdminCustomers';
import { AdminReports } from './AdminReports';
import { AdminStaff } from './AdminStaff';
import { AdminSettings } from './AdminSettings';
import { AdminActivityLogs } from './AdminActivityLogs';
import { formatZAR, calculateDeliveryFee } from '../../utils/pricing';
import { LIMITS, cleanText } from '../../utils/validate';
import { DEMO_MODE } from '../../services/store';
import { StaffSignIn } from './StaffSignIn';
import { toast } from '../ui/feedback';

const ROLES: Array<{ id: Role; label: string; does: string }> = [
  { id: 'owner', label: 'Owner', does: 'Full access' },
  { id: 'manager', label: 'Store manager', does: 'Products and orders' },
  { id: 'counter', label: 'Counter staff', does: 'Weigh and pack' },
  { id: 'driver', label: 'Delivery driver', does: 'My route and cash' }
];

interface AdminLayoutProps {
  onNavigateHome: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateHome }) => {
  const {
    currentUser,
    loginAsDemoRole,
    loginWithEmail,
    logout,
    deliveryAreas,
    products,
    createOrder
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Manual Order Modal (+ New Order)
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerCell, setManualCustomerCell] = useState('');
  const [manualDeliveryType, setManualDeliveryType] = useState<'delivery' | 'collection'>('collection');
  const [manualArea, setManualArea] = useState(deliveryAreas[0]?.name || 'Welkom');
  const [manualAddress, setManualAddress] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualSource, setManualSource] = useState<'phone' | 'whatsapp' | 'walk_in'>('walk_in');
  const [manualSelectedProductId, setManualSelectedProductId] = useState(products[0]?.id || '');
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualNotes, setManualNotes] = useState('');

  const currentRole = currentUser?.role;
  const isDriver = currentRole === 'driver';

  // Manual order submission
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === manualSelectedProductId) || products[0];
    const unitPrice = prod.price;
    const lineTotal = Math.round((unitPrice * manualQuantity + 0.0001) * 100) / 100;
    // The fee comes from the chosen area, with the same free-delivery rule as the website.
    const areaFee = deliveryAreas.find(a => a.name === manualArea)?.fee ?? 0;
    const deliveryFee = calculateDeliveryFee(manualDeliveryType, areaFee, [
      { category: prod.category, isFreeDelivery: prod.isFreeDelivery }
    ]);
    const total = Math.round((lineTotal + deliveryFee + 0.0001) * 100) / 100;

    if (savingOrder) return;
    setSavingOrder(true);
    try {
      await createOrder({
      customerName: cleanText(manualCustomerName, LIMITS.name) || 'Counter Customer',
      customerCell: cleanText(manualCustomerCell, LIMITS.cell) || '0573963189',
      deliveryType: manualDeliveryType,
      area: manualArea,
      deliveryAddress: manualDeliveryType === 'delivery' ? cleanText(manualAddress, LIMITS.address) : undefined,
      deliveryDate: manualDate,
      items: [
        {
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          pricingType: prod.pricingType,
          unitPrice,
          quantity: manualQuantity,
          lineTotal
        }
      ],
      subtotal: lineTotal,
      deliveryFee,
      total,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'new',
      source: manualSource,
      notes: cleanText(manualNotes, LIMITS.notes) || undefined,
      marketingOptIn: false
      });
      setIsManualOrderOpen(false);
      setActiveTab('orders');
      toast('Order saved');
    } catch (err) {
      console.error(err);
      toast('The order was not saved. Check your connection and try again.', 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  // Sign-in handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = loginWithEmail(loginEmailInput);
    if (result === 'inactive') {
      setLoginError('This staff account has been deactivated. Please contact the Owner.');
    } else if (result !== 'ok') {
      // The same message whether or not the email exists, so accounts cannot be guessed.
      setLoginError('We could not sign you in with that email.');
    }
  };

  if (!currentUser && !DEMO_MODE) {
    return <StaffSignIn onNavigateHome={onNavigateHome} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-4">
        <div className="panel w-full max-w-md p-6 sm:p-8">
          <button type="button" onClick={onNavigateHome} aria-label="Powermeat home" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl">
            <Logo size="lg" showTagline />
          </button>
          <h1 className="display text-4xl mt-6">
            Staff sign <span className="text-brand-accent">in</span>
          </h1>

          {!DEMO_MODE ? (
            <p className="mt-4 text-ink-soft">
              Staff sign-in is switched off on this site until secure accounts are connected. Please speak to the
              Owner.
            </p>
          ) : (
            <>
              <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm">
                Demo mode. There are no passwords yet, and everything is saved in this browser only. Do not use real
                customer details.
              </p>

              <form onSubmit={handleLoginSubmit} noValidate className="mt-6">
                <label htmlFor="staff-email" className="field-label">
                  Staff email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  autoComplete="username"
                  maxLength={254}
                  aria-invalid={!!loginError}
                  value={loginEmailInput}
                  onChange={e => setLoginEmailInput(e.target.value)}
                  className="field"
                />
                {loginError && (
                  <p className="field-error" role="alert">
                    {loginError}
                  </p>
                )}
                <button type="submit" className="btn btn-accent btn-block mt-4">
                  Sign in
                </button>
              </form>

              <h2 className="field-label mt-8">Or try a role</h2>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => loginAsDemoRole(r.id)}
                    className="min-h-[56px] px-4 py-2.5 rounded-2xl border border-ink/15 text-left hover:border-ink/40 transition-colors"
                  >
                    <span className="block font-semibold">{r.label}</span>
                    <span className="block text-sm text-ink-soft">{r.does}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button type="button" onClick={onNavigateHome} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 link mt-6 text-sm">
            Back to the store
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'counter', 'driver'] },
    { id: 'orders', label: isDriver ? 'My deliveries' : 'Orders', icon: ShoppingBag, roles: ['owner', 'manager', 'counter', 'driver'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['owner', 'manager'] },
    { id: 'specials', label: 'Specials', icon: Flame, roles: ['owner', 'manager'] },
    { id: 'delivery', label: 'Delivery', icon: Truck, roles: ['owner', 'manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['owner', 'manager'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { id: 'staff', label: 'Staff', icon: UserCog, roles: ['owner'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
    { id: 'logs', label: 'Activity', icon: History, roles: ['owner', 'manager', 'counter'] }
  ].filter(item => item.roles.includes(currentRole || 'counter'));

  // A tab the current role may not open falls back to the dashboard.
  const shownTab = navItems.some(n => n.id === activeTab) ? activeTab : 'dashboard';
  const roleLabel = ROLES.find(r => r.id === currentUser.role)?.label || currentUser.role;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <header className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-4 min-w-0">
            <button type="button" onClick={onNavigateHome} aria-label="Powermeat home" className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl shrink-0">
              <Logo size="sm" onDark />
            </button>
            <div className="min-w-0 border-l border-white/20 pl-4">
              <p className="font-semibold truncate">{currentUser.name}</p>
              <p className="text-sm text-white/80">{roleLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDriver && (
              <button type="button" onClick={() => setIsManualOrderOpen(true)} className="btn btn-sm btn-accent hover:bg-white hover:text-ink">
                <Plus size={18} />
                <span>New order</span>
              </button>
            )}
            <button type="button" onClick={onNavigateHome} className="btn btn-sm btn-outline-light">
              <Store size={18} />
              <span className="hidden sm:inline">View store</span>
            </button>
            <button type="button" onClick={logout} className="btn btn-sm btn-outline-light">
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {DEMO_MODE && (
          <div className="border-t border-white/15">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex flex-wrap items-center gap-x-3 text-sm text-white/80">
              <span>Demo mode, saved in this browser only. View as</span>
              <span className="flex flex-wrap">
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={currentRole === r.id}
                    onClick={() => loginAsDemoRole(r.id)}
                    className={`min-h-[44px] px-3 rounded-full font-semibold transition-colors ${
                      currentRole === r.id ? 'text-brand-yellow' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </span>
            </div>
          </div>
        )}
      </header>

      <nav aria-label="Staff area" className="border-b border-ink/10 bg-paper sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const isActive = shownTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[52px] px-3.5 flex items-center gap-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-brand-accent text-ink' : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {shownTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={setActiveTab}
            onOpenNewOrderModal={() => setIsManualOrderOpen(true)}
            onOpenNewSpecialModal={() => setActiveTab('specials')}
            onOpenNewProductModal={() => setActiveTab('products')}
          />
        )}
        {shownTab === 'orders' && <AdminOrders onOpenNewOrderModal={() => setIsManualOrderOpen(true)} />}
        {shownTab === 'products' && <AdminProducts />}
        {shownTab === 'specials' && <AdminSpecials />}
        {shownTab === 'delivery' && <AdminDeliverySettings />}
        {shownTab === 'customers' && <AdminCustomers />}
        {shownTab === 'reports' && <AdminReports />}
        {shownTab === 'staff' && <AdminStaff />}
        {shownTab === 'settings' && <AdminSettings />}
        {shownTab === 'logs' && <AdminActivityLogs />}
      </main>

      {isManualOrderOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 flex items-start sm:items-center justify-center p-2 sm:p-4"
          onClick={() => setIsManualOrderOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-order-title"
            className="sheet-in w-full max-w-xl bg-paper text-ink rounded-3xl p-5 sm:p-7 my-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="manual-order-title" className="display text-3xl sm:text-4xl">
                New walk-in, phone or WhatsApp order
              </h2>
              <button
                type="button"
                onClick={() => setIsManualOrderOpen(false)}
                aria-label="Close"
                className="icon-btn hover:bg-sand"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mo-name" className="field-label">Customer name</label>
                  <input id="mo-name" type="text" required maxLength={LIMITS.name} value={manualCustomerName} onChange={e => setManualCustomerName(e.target.value)} className="field" />
                </div>
                <div>
                  <label htmlFor="mo-cell" className="field-label">Cell number</label>
                  <input id="mo-cell" type="tel" required maxLength={LIMITS.cell} placeholder="082 123 4567" value={manualCustomerCell} onChange={e => setManualCustomerCell(e.target.value)} className="field num" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="mo-source" className="field-label">Came in by</label>
                  <select id="mo-source" value={manualSource} onChange={e => setManualSource(e.target.value as typeof manualSource)} className="field">
                    <option value="walk_in">Walk-in</option>
                    <option value="phone">Phone call</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mo-type" className="field-label">Collect or deliver</label>
                  <select id="mo-type" value={manualDeliveryType} onChange={e => setManualDeliveryType(e.target.value as typeof manualDeliveryType)} className="field">
                    <option value="collection">Collection</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mo-date" className="field-label">Date</label>
                  <input id="mo-date" type="date" required value={manualDate} onChange={e => setManualDate(e.target.value)} className="field num" />
                </div>
              </div>

              <div>
                <label htmlFor="mo-product" className="field-label">Product</label>
                <select id="mo-product" value={manualSelectedProductId} onChange={e => setManualSelectedProductId(e.target.value)} className="field">
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {formatZAR(p.price)} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mo-qty" className="field-label">Quantity</label>
                  <input id="mo-qty" type="number" min="1" max="999" value={manualQuantity} onChange={e => setManualQuantity(Math.min(999, Math.max(1, parseInt(e.target.value) || 1)))} className="field num" />
                </div>
                <div>
                  <label htmlFor="mo-area" className="field-label">Area</label>
                  <select id="mo-area" value={manualArea} onChange={e => setManualArea(e.target.value)} className="field">
                    {deliveryAreas.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {manualDeliveryType === 'delivery' && (
                <div>
                  <label htmlFor="mo-address" className="field-label">Delivery address</label>
                  <input id="mo-address" type="text" required maxLength={LIMITS.address} value={manualAddress} onChange={e => setManualAddress(e.target.value)} className="field" />
                </div>
              )}

              <div>
                <label htmlFor="mo-notes" className="field-label">Cutting notes</label>
                <input id="mo-notes" type="text" maxLength={LIMITS.notes} placeholder="Sliced eisbein, pack boerewors in 1kg bags" value={manualNotes} onChange={e => setManualNotes(e.target.value)} className="field" />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setIsManualOrderOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={savingOrder} className="btn btn-accent">
                  {savingOrder ? 'Saving' : 'Save order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
