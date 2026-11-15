import React, { useState } from 'react';
import { Search, Package, Clock, RotateCcw, ArrowRight, Truck, Store } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';
import { Order } from '../../types';

interface MyOrdersViewProps {
  onReorder: (order: Order) => void;
  onNavigateHome: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onReorder, onNavigateHome }) => {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(o => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      o.id.toLowerCase().includes(term) ||
      o.customerCell.includes(term) ||
      o.customerName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white uppercase tracking-wide">
            Track / My Butchery Orders
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            View status of your delivery or collection, or easily reorder your favourite hampers.
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#FFC400] hover:underline self-start sm:self-auto cursor-pointer"
        >
          ← Continue Shopping
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by order number (e.g. PM-000101) or cell phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-xl p-10 text-center border border-[#2B2B2B]">
          <Package size={48} className="mx-auto text-neutral-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No orders found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            We couldn't find any orders matching "{searchTerm}". Check your number or place a new order.
          </p>
          <button
            onClick={onNavigateHome}
            className="mt-5 bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold text-xs uppercase tracking-wide px-5 py-2.5 rounded-lg transition cursor-pointer"
          >
            Browse Hampers
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-[#1C1C1C] border border-[#2D2D2D] hover:border-[#3D3D3D] rounded-xl p-5 shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-lg text-[#FFC400] tracking-wide">
                    {order.id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      order.orderStatus === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : order.orderStatus === 'cancelled'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                    }`}
                  >
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-neutral-400 flex items-center gap-2">
                  <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-bold text-white">{formatZAR(order.total)}</span>
                </div>
              </div>

              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                <div>
                  <span className="text-neutral-500 font-semibold block">Customer:</span>
                  <span className="font-bold text-white">{order.customerName} ({order.customerCell})</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-semibold block">Scheduled Date & Area:</span>
                  <span className="font-semibold text-white flex items-center gap-1">
                    {order.deliveryType === 'delivery' ? <Truck size={13} className="text-[#D7141A]" /> : <Store size={13} className="text-[#D7141A]" />}
                    {order.deliveryDate} — {order.area}
                  </span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="py-2 text-xs text-neutral-400 bg-neutral-900/60 p-2.5 rounded-lg border border-[#262626]">
                <span className="font-semibold text-neutral-300 block mb-1">Items ({order.items.length}):</span>
                <ul className="space-y-0.5">
                  {order.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="truncate max-w-xs">{it.name} x {it.quantity}</span>
                      <span className="font-semibold text-neutral-300">{formatZAR(it.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reorder Button */}
              <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  Payment: <strong className="text-neutral-300 uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
                </span>

                <button
                  onClick={() => onReorder(order)}
                  className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
