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
  ShieldAlert,
  Plus,
  KeyRound,
  CheckCircle2
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
import { formatZAR } from '../../utils/pricing';

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
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Manual Order Modal (+ New Order)
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
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
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === manualSelectedProductId) || products[0];
    const unitPrice = prod.price;
    const lineTotal = Math.round((unitPrice * manualQuantity + 0.0001) * 100) / 100;
    const deliveryFee = manualDeliveryType === 'delivery' ? 35 : 0;
    const total = lineTotal + deliveryFee;

    createOrder({
      customerName: manualCustomerName.trim() || 'Counter Customer',
      customerCell: manualCustomerCell.trim() || '0573963189',
      deliveryType: manualDeliveryType,
      area: manualArea,
      deliveryAddress: manualDeliveryType === 'delivery' ? manualAddress : undefined,
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
      notes: manualNotes.trim() || undefined,
      marketingOptIn: false
    });

    setIsManualOrderOpen(false);
    setActiveTab('orders');
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const ok = loginWithEmail(loginEmailInput);
    if (!ok) {
      setLoginError('Invalid staff credentials. Click any demo role button below for instant login.');
    }
  };

  // If not logged in, render the login screen with demo credentials & instant role switchers
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block cursor-pointer" onClick={onNavigateHome}>
              <Logo size="lg" showTagline={true} />
            </div>
            <h1 className="text-xl font-heading font-extrabold uppercase text-white tracking-wide pt-2">
              Staff & Back-Office Sign In
            </h1>
            <p className="text-xs text-neutral-400">
              Central management portal for 145 Power Road, Welkom
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-300 block mb-1">Staff Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. owner@powermeat.co.za"
                value={loginEmailInput}
                onChange={e => setLoginEmailInput(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#D7141A]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-300 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPasswordInput}
                onChange={e => setLoginPasswordInput(e.target.value)}
                className="w-full bg-neutral-900 border border-[#3E3E3E] rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#D7141A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D7141A] hover:bg-[#ba0f14] text-white font-heading text-base font-bold py-3 rounded-lg shadow-lg transition cursor-pointer"
            >
              Sign In to Back-Office
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-[#2B2B2B] space-y-3">
            <span className="text-[11px] uppercase font-extrabold text-[#FFC400] tracking-wider block text-center">
              Quick Demo Access (One-Click Role Login):
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemoRole('owner')}
                className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition cursor-pointer"
              >
                <strong className="text-white text-xs block">Owner / Admin</strong>
                <span className="text-[10px] text-neutral-400">Full system access</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoRole('manager')}
                className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition cursor-pointer"
              >
                <strong className="text-white text-xs block">Store Manager</strong>
                <span className="text-[10px] text-neutral-400">Products & orders</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoRole('counter')}
                className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition cursor-pointer"
              >
                <strong className="text-white text-xs block">Counter Staff</strong>
                <span className="text-[10px] text-neutral-400">Weigh & pack</span>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemoRole('driver')}
                className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition cursor-pointer"
              >
                <strong className="text-white text-xs block">Delivery Driver</strong>
                <span className="text-[10px] text-neutral-400">My route & cash</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onNavigateHome}
                className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
              >
                ← Return to Public Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define sidebar navigation items based on role
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'manager', 'counter', 'driver'] },
    { id: 'orders', label: isDriver ? 'My Deliveries' : 'Orders Pipeline', icon: ShoppingBag, roles: ['owner', 'manager', 'counter', 'driver'] },
    { id: 'products', label: 'Products & Hampers', icon: Package, roles: ['owner', 'manager'] },
    { id: 'specials', label: 'Specials & Promos', icon: Flame, roles: ['owner', 'manager'] },
    { id: 'delivery', label: 'Delivery Schedule', icon: Truck, roles: ['owner', 'manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['owner', 'manager'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { id: 'staff', label: 'Staff Management', icon: UserCog, roles: ['owner'] },
    { id: 'settings', label: 'Site Settings', icon: Settings, roles: ['owner'] },
    { id: 'logs', label: 'Activity Logs', icon: History, roles: ['owner', 'manager', 'counter'] }
  ].filter(item => item.roles.includes(currentRole || 'counter'));

  return (
    <div className="min-h-screen bg-[#111111] text-neutral-100 flex flex-col">
      {/* Top Staff Switcher & Quick Demo Bar */}
      <div className="bg-[#1C1C1C] border-b border-[#2B2B2B] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase text-[#FFC400]">Role Switcher:</span>
          <div className="flex items-center gap-1">
            {(['owner', 'manager', 'counter', 'driver'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => loginAsDemoRole(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                  currentRole === r
                    ? 'bg-[#D7141A] text-white shadow'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Store size={13} />
            <span>View Public Store</span>
          </button>

          <span className="text-neutral-600">|</span>

          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-bold"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Shell: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#161616] border-r border-[#262626] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2 cursor-pointer" onClick={onNavigateHome}>
              <Logo size="sm" showTagline={false} />
            </div>

            {/* Current Staff Badge */}
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Signed in as:</span>
              <strong className="text-white block text-sm">{currentUser.name}</strong>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="bg-[#FFC400] text-black text-[9px] uppercase font-extrabold px-1.5 rounded">
                  {currentUser.role}
                </span>
                <span className="text-neutral-400 text-[10px]">{currentUser.email}</span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#D7141A] text-white shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <item.icon size={17} className={isActive ? 'text-white' : 'text-[#D7141A]'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Manual Order Button */}
          {!isDriver && (
            <div className="pt-4 border-t border-[#262626]">
              <button
                onClick={() => setIsManualOrderOpen(true)}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-neutral-700 transition cursor-pointer"
              >
                <Plus size={15} className="text-[#FFC400]" />
                <span>+ Walk-In / Phone Order</span>
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={setActiveTab}
              onOpenNewOrderModal={() => setIsManualOrderOpen(true)}
              onOpenNewSpecialModal={() => setActiveTab('specials')}
              onOpenNewProductModal={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders onOpenNewOrderModal={() => setIsManualOrderOpen(true)} />
          )}

          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'specials' && <AdminSpecials />}
          {activeTab === 'delivery' && <AdminDeliverySettings />}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'staff' && <AdminStaff />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'logs' && <AdminActivityLogs />}
        </main>
      </div>

      {/* MANUAL ORDER ENTRY MODAL (+ New Order for phone/walk-in) */}
      {isManualOrderOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsManualOrderOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <Plus size={18} className="text-[#D7141A]" />
                <span>Capture Walk-In / Phone / WhatsApp Order</span>
              </h3>
              <button onClick={() => setIsManualOrderOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Mofokeng"
                    value={manualCustomerName}
                    onChange={e => setManualCustomerName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Cell Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="082 123 4567"
                    value={manualCustomerCell}
                    onChange={e => setManualCustomerCell(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Source</label>
                  <select
                    value={manualSource}
                    onChange={e => setManualSource(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  >
                    <option value="walk_in">Walk-in Counter</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp Order</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Fulfillment</label>
                  <select
                    value={manualDeliveryType}
                    onChange={e => setManualDeliveryType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  >
                    <option value="collection">In-store Collection</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Select Meat Hamper / Product</label>
                <select
                  value={manualSelectedProductId}
                  onChange={e => setManualSelectedProductId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatZAR(p.price)} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={manualQuantity}
                    onChange={e => setManualQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Area / Town</label>
                  <select
                    value={manualArea}
                    onChange={e => setManualArea(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  >
                    {deliveryAreas.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {manualDeliveryType === 'delivery' && (
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, Suburb"
                    value={manualAddress}
                    onChange={e => setManualAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Butcher Cutting Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Sliced eisbein, pack boerewors in 1kg bags"
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualOrderOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white rounded-lg cursor-pointer font-bold"
                >
                  Save & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
