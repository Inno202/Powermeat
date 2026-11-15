import React from 'react';
import {
  ShoppingBag,
  Package,
  Truck,
  Store,
  DollarSign,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewOrderModal: () => void;
  onOpenNewSpecialModal: () => void;
  onOpenNewProductModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenNewOrderModal,
  onOpenNewSpecialModal,
  onOpenNewProductModal
}) => {
  const { orders, specials, deliveryAreas, currentUser } = useStore();

  // Metrics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const newOrders = orders.filter(o => o.orderStatus === 'new');
  const ordersToPack = orders.filter(o => o.orderStatus === 'confirmed' || o.orderStatus === 'packing');
  const collectionsToday = orders.filter(
    o => o.deliveryType === 'collection' && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );
  const deliveriesPending = orders.filter(
    o => o.deliveryType === 'delivery' && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  );

  // Deliveries by area
  const deliveriesByArea: Record<string, number> = {};
  deliveriesPending.forEach(o => {
    deliveriesByArea[o.area] = (deliveriesByArea[o.area] || 0) + 1;
  });

  // Revenue metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const revenueToday = orders
    .filter(o => o.orderStatus !== 'cancelled' && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  // Alerts
  const unpaidEFTOrders = orders.filter(o => o.paymentMethod === 'eft' && o.paymentStatus === 'pending');
  const endingSpecials = specials.filter(s => s.active && s.endDate && s.endDate.startsWith(todayStr));

  // Role permissions
  const isDriver = currentUser?.role === 'driver';

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1C1C1C] p-5 rounded-2xl border border-[#2D2D2D]">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#D7141A]">
            Butchery Control Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase text-white tracking-wide">
            {currentUser?.name || 'Staff Member'} ({currentUser?.role.toUpperCase()})
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            145 Power Road, Welkom • Store & Delivery Dispatch Overview
          </p>
        </div>

        {/* Quick Action Buttons (Hidden for Drivers) */}
        {!isDriver && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewOrderModal}
              className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus size={15} />
              <span>+ New Order</span>
            </button>
            <button
              onClick={onOpenNewSpecialModal}
              className="bg-[#FFC400] hover:bg-[#e6b000] text-neutral-950 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Flame size={15} />
              <span>+ New Special</span>
            </button>
            <button
              onClick={onOpenNewProductModal}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-[#3E3E3E] text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Package size={15} />
              <span>+ New Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Critical Alerts Strip */}
      <div className="space-y-2">
        {unpaidEFTOrders.length > 0 && (
          <div className="p-3.5 bg-amber-950/70 border border-amber-800/80 rounded-xl text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#FFC400] shrink-0" />
              <span>
                <strong>{unpaidEFTOrders.length} Unpaid EFT Orders:</strong> Waiting for bank clearance or customer POP screenshot.
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="underline font-bold text-amber-300 hover:text-white ml-2 cursor-pointer"
            >
              View Orders →
            </button>
          </div>
        )}

        {endingSpecials.length > 0 && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#D7141A] shrink-0" />
              <span>
                <strong>{endingSpecials.length} Specials Ending Today:</strong> Check specials tab to re-run or archive.
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('specials')}
              className="underline font-bold text-red-300 hover:text-white ml-2 cursor-pointer"
            >
              Manage Specials →
            </button>
          </div>
        )}
      </div>

      {/* Today's KPI Numbers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: New Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2D2D] hover:border-[#D7141A] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">New Orders</span>
            <div className="p-1.5 bg-red-950 text-[#D7141A] rounded-lg">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-white">
            {newOrders.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Requires confirmation</p>
        </div>

        {/* Metric 2: Orders to Pack */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2D2D] hover:border-[#D7141A] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">To Pack</span>
            <div className="p-1.5 bg-amber-950 text-[#FFC400] rounded-lg">
              <Package size={16} />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-white">
            {ordersToPack.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">In butchery prep</p>
        </div>

        {/* Metric 3: Active Deliveries */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2D2D] hover:border-[#D7141A] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Deliveries</span>
            <div className="p-1.5 bg-blue-950 text-blue-400 rounded-lg">
              <Truck size={16} />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-white">
            {deliveriesPending.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across {Object.keys(deliveriesByArea).length} areas</p>
        </div>

        {/* Metric 4: Collections Pending */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2D2D] hover:border-[#D7141A] transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">Store Pickups</span>
            <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg">
              <Store size={16} />
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-white">
            {collectionsToday.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">145 Power Rd counter</p>
        </div>
      </div>

      {/* Revenue Section (Owner / Manager only) */}
      {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#151515] p-5 rounded-xl border border-[#333]">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
              Revenue Today
            </span>
            <span className="font-heading font-extrabold text-2xl text-[#FFC400]">
              {formatZAR(revenueToday)}
            </span>
            <span className="text-[11px] text-neutral-500 block mt-1">
              Active orders placed today
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#151515] p-5 rounded-xl border border-[#333]">
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
              Total Order Volume
            </span>
            <span className="font-heading font-extrabold text-2xl text-white">
              {formatZAR(totalRevenue)}
            </span>
            <span className="text-[11px] text-neutral-500 block mt-1">
              Across all {orders.length} captured orders
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#151515] p-5 rounded-xl border border-[#333] flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block mb-1">
                Full Financial Reports
              </span>
              <span className="text-xs text-neutral-300">
                Category breakdown & CSV export
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="bg-[#D7141A] hover:bg-[#ba0f14] text-white p-2.5 rounded-lg transition cursor-pointer"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Two Columns: Deliveries per Area & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliveries Per Area Table */}
        <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2D2D2D] space-y-3">
          <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-3">
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
              <Truck size={18} className="text-[#D7141A]" />
              <span>Deliveries Per Area</span>
            </h3>
            <span className="text-xs text-neutral-400 font-semibold">Active Dispatch</span>
          </div>

          <div className="space-y-2">
            {deliveryAreas.map(area => {
              const count = deliveriesByArea[area.name] || 0;
              return (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{area.name}</span>
                    <span className="text-neutral-500 text-[11px]">Days: {area.days.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full font-extrabold text-xs ${
                        count > 0 ? 'bg-[#D7141A] text-white' : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {count} orders
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Quick List */}
        <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2D2D2D] space-y-3">
          <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-3">
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={18} className="text-[#FFC400]" />
              <span>Latest Customer Orders</span>
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#FFC400] hover:underline cursor-pointer"
            >
              View Pipeline →
            </button>
          </div>

          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div
                key={order.id}
                onClick={() => onNavigateTab('orders')}
                className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700 transition cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#FFC400]">{order.id}</span>
                    <span className="text-white font-semibold">{order.customerName}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px] mt-0.5">
                    {order.deliveryType === 'delivery' ? `🚚 ${order.area}` : '🏪 Collection'} • {order.items.length} items
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-white block">{formatZAR(order.total)}</span>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'new'
                        ? 'bg-red-950 text-red-300'
                        : order.orderStatus === 'completed'
                        ? 'bg-emerald-950 text-emerald-300'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
