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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <h1 className="display text-4xl sm:text-5xl">
          Today at the <span className="text-brand-accent">butchery</span>
        </h1>

        {/* Quick Action Buttons (Hidden for Drivers) */}
        {!isDriver && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewOrderModal}
              className="btn btn-sm btn-accent"
            >
              <Plus size={15} />
              <span>New Order</span>
            </button>
            <button
              onClick={onOpenNewSpecialModal}
              className="btn btn-sm btn-outline"
            >
              <Flame size={15} />
              <span>New Special</span>
            </button>
            <button
              onClick={onOpenNewProductModal}
              className="btn btn-sm btn-outline"
            >
              <Package size={15} />
              <span>New Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Critical Alerts Strip */}
      <div className="space-y-2">
        {unpaidEFTOrders.length > 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-brand-yellow-deep shrink-0" />
              <span>
                <strong>{unpaidEFTOrders.length} Unpaid EFT Orders:</strong> Waiting for bank clearance or customer POP screenshot.
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 underline font-bold text-amber-800 hover:text-ink ml-2 cursor-pointer"
            >
              View Orders
            </button>
          </div>
        )}

        {endingSpecials.length > 0 && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand-accent-deep shrink-0" />
              <span>
                <strong>{endingSpecials.length} Specials Ending Today:</strong> Check specials tab to re-run or archive.
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('specials')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 underline font-bold text-red-800 hover:text-ink ml-2 cursor-pointer"
            >
              Manage Specials
            </button>
          </div>
        )}
      </div>

      {/* Today's KPI Numbers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: New Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 hover:border-brand-accent transition cursor-pointer panel"
        >
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-sm font-bold ">New Orders</span>
            <div className="p-1.5 bg-red-50 text-brand-accent-deep rounded-lg">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="display text-3xl text-ink">
            {newOrders.length}
          </div>
          <p className="text-sm text-ink-soft mt-1">Requires confirmation</p>
        </div>

        {/* Metric 2: Orders to Pack */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 hover:border-brand-accent transition cursor-pointer panel"
        >
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-sm font-bold ">To Pack</span>
            <div className="p-1.5 bg-amber-50 text-brand-yellow-deep rounded-lg">
              <Package size={16} />
            </div>
          </div>
          <div className="display text-3xl text-ink">
            {ordersToPack.length}
          </div>
          <p className="text-sm text-ink-soft mt-1">In butchery prep</p>
        </div>

        {/* Metric 3: Active Deliveries */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 hover:border-brand-accent transition cursor-pointer panel"
        >
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-sm font-bold ">Deliveries</span>
            <div className="p-1.5 bg-blue-50 text-blue-800 rounded-lg">
              <Truck size={16} />
            </div>
          </div>
          <div className="display text-3xl text-ink">
            {deliveriesPending.length}
          </div>
          <p className="text-sm text-ink-soft mt-1">Across {Object.keys(deliveriesByArea).length} areas</p>
        </div>

        {/* Metric 4: Collections Pending */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 hover:border-brand-accent transition cursor-pointer panel"
        >
          <div className="flex items-center justify-between text-ink-soft mb-2">
            <span className="text-sm font-bold ">Store Pickups</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
              <Store size={16} />
            </div>
          </div>
          <div className="display text-3xl text-ink">
            {collectionsToday.length}
          </div>
          <p className="text-sm text-ink-soft mt-1">145 Power Rd counter</p>
        </div>
      </div>

      {/* Revenue Section (Owner / Manager only) */}
      {(currentUser?.role === 'owner' || currentUser?.role === 'manager') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel p-5">
            <span className="text-sm text-ink-soft font-bold block mb-1">
              Revenue Today
            </span>
            <span className="display text-2xl text-brand-yellow-deep">
              {formatZAR(revenueToday)}
            </span>
            <span className="text-sm text-ink-soft block mt-1">
              Active orders placed today
            </span>
          </div>

          <div className="panel p-5">
            <span className="text-sm text-ink-soft font-bold block mb-1">
              Total Order Volume
            </span>
            <span className="display text-2xl text-ink">
              {formatZAR(totalRevenue)}
            </span>
            <span className="text-sm text-ink-soft block mt-1">
              Across all {orders.length} captured orders
            </span>
          </div>

          <div className="panel p-5 flex items-center justify-between">
            <div>
              <span className="text-sm text-ink-soft font-bold block mb-1">
                Full Financial Reports
              </span>
              <span className="text-sm text-ink-soft">
                Category breakdown & CSV export
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="btn btn-sm btn-accent"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Two Columns: Deliveries per Area & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliveries Per Area Table */}
        <div className="p-5 space-y-3 panel">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="display flex items-center gap-2 text-2xl">
              <Truck size={18} className="text-brand-accent-deep" />
              <span>Deliveries Per Area</span>
            </h3>
            <span className="text-sm text-ink-soft font-semibold">Active Dispatch</span>
          </div>

          <div className="space-y-2">
            {deliveryAreas.map(area => {
              const count = deliveriesByArea[area.name] || 0;
              return (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-ink/10 text-sm"
                >
                  <div>
                    <span className="font-bold text-ink block">{area.name}</span>
                    <span className="text-ink-soft text-sm">Days: {area.days.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-sm ${
                        count > 0 ? 'bg-brand-accent text-white' : 'bg-sand text-ink-soft'
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
        <div className="p-5 space-y-3 panel">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="display flex items-center gap-2 text-2xl">
              <Clock size={18} className="text-brand-yellow-deep" />
              <span>Latest Customer Orders</span>
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-sm font-bold text-brand-yellow-deep hover:underline cursor-pointer"
            >
              View Pipeline
            </button>
          </div>

          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div
                key={order.id}
                onClick={() => onNavigateTab('orders')}
                className="p-3 hover:border-ink/10 transition cursor-pointer flex items-center justify-between text-sm panel rounded-2xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="num font-bold text-brand-yellow-deep">{order.id}</span>
                    <span className="text-ink font-semibold">{order.customerName}</span>
                  </div>
                  <p className="text-ink-soft text-sm mt-0.5">
                    {order.deliveryType === 'delivery' ? order.area : 'Collection'} • {order.items.length} items
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-ink block">{formatZAR(order.total)}</span>
                  <span
                    className={`inline-block text-sm font-bold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'new'
                        ? 'bg-red-50 text-red-800'
                        : order.orderStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-sand text-ink-soft'
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
