import React, { useState } from 'react';
import {
  List,
  Columns3,
  Search,
  Filter,
  Printer,
  Scale,
  MessageCircle,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  DollarSign,
  ChevronRight,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { useStore } from '../../services/store';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, Role } from '../../types';
import { formatZAR, calculateLineTotal } from '../../utils/pricing';
import { createStaffCustomerWhatsAppLink } from '../../utils/delivery';
import { AdminOrderSlip } from './AdminOrderSlip';

const PIPELINE_STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-red-950 text-red-300 border-red-800' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  { key: 'packing', label: 'Packing', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  { key: 'ready_for_collection', label: 'Ready for Collection', color: 'bg-purple-950 text-purple-300 border-purple-800' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-neutral-800 text-neutral-400 border-neutral-700' }
];

interface AdminOrdersProps {
  onOpenNewOrderModal: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ onOpenNewOrderModal }) => {
  const {
    orders,
    users,
    deliveryAreas,
    currentUser,
    updateOrderStatus,
    updatePaymentStatus,
    adjustOrderLineWeight,
    assignDriver,
    recordDriverDelivery
  } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Modals & print states
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [slipModal, setSlipModal] = useState<{
    order: Order | null;
    mode: 'invoice_a4' | 'thermal_80mm' | 'run_sheet';
    areaName?: string;
  } | null>(null);

  // Weigh & adjust state
  const [weighModal, setWeighModal] = useState<{
    orderId: string;
    productId: string;
    productName: string;
    unitPrice: number;
    currentWeight: number;
  } | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState<string>('');
  const [weighReasonInput, setWeighReasonInput] = useState<string>('');

  // Driver completion modal
  const [driverModal, setDriverModal] = useState<{
    order: Order;
    status: 'completed' | 'cancelled';
  } | null>(null);
  const [driverCashInput, setDriverCashInput] = useState<string>('');
  const [driverNotesInput, setDriverNotesInput] = useState<string>('');

  const isDriver = currentUser?.role === 'driver';
  const drivers = users.filter(u => u.role === 'driver' && u.active);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    // If logged in as driver, only show orders assigned to this driver
    if (isDriver && o.assignedDriverId !== currentUser.id) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const match =
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerCell.includes(term) ||
        o.area.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (areaFilter !== 'all' && o.area !== areaFilter) return false;
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (sourceFilter !== 'all' && o.source !== sourceFilter) return false;

    return true;
  });

  const handleWeighSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weighModal) return;
    const wt = parseFloat(actualWeightInput);
    if (isNaN(wt) || wt <= 0) {
      alert('Please enter a valid weight in kg');
      return;
    }
    adjustOrderLineWeight(
      weighModal.orderId,
      weighModal.productId,
      wt,
      weighReasonInput.trim() || 'Scale weigh adjust'
    );
    setWeighModal(null);
  };

  const handleDriverRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverModal) return;
    const cash = driverCashInput ? parseFloat(driverCashInput) : undefined;
    recordDriverDelivery(
      driverModal.order.id,
      driverModal.status,
      cash,
      driverNotesInput.trim()
    );
    setDriverModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            {isDriver ? 'My Assigned Deliveries Today' : 'Order Processing & Dispatch Pipeline'}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isDriver
              ? 'Update delivery status, record cash collected, or log delivery attempts.'
              : 'Process incoming web, WhatsApp, phone, and walk-in orders.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDriver && (
            <>
              {/* Toggle List / Kanban */}
              <div className="bg-[#1C1C1C] border border-[#333] rounded-xl p-1 flex items-center">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#D7141A] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <List size={15} />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-[#D7141A] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Columns3 size={15} />
                  <span>Kanban</span>
                </button>
              </div>

              {/* Delivery Run Sheet Print */}
              <button
                onClick={() =>
                  setSlipModal({
                    order: null,
                    mode: 'run_sheet',
                    areaName: areaFilter !== 'all' ? areaFilter : 'All Active Delivery Areas'
                  })
                }
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-[#3E3E3E] text-xs font-bold py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer size={15} className="text-[#FFC400]" />
                <span>Run Sheet</span>
              </button>

              {/* + New Order */}
              <button
                onClick={onOpenNewOrderModal}
                className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus size={15} />
                <span>+ New Order</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#2D2D2D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search order #, customer, cell..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-[#333] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7141A]"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {PIPELINE_STATUSES.map(s => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div>
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7141A]"
          >
            <option value="all">All Delivery Areas</option>
            {deliveryAreas.map(a => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7141A]"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D7141A]"
          >
            <option value="all">All Sources</option>
            <option value="web">Web Store</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone Call</option>
            <option value="walk_in">Walk-in Counter</option>
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-neutral-400 uppercase font-bold text-[11px] border-b border-[#2D2D2D]">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Fulfillment & Area</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total & Payment</th>
                  <th className="py-3.5 px-4">Pipeline Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const statusObj = PIPELINE_STATUSES.find(s => s.key === order.orderStatus) || PIPELINE_STATUSES[0];

                    return (
                      <tr key={order.id} className="hover:bg-neutral-800/40 transition">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-extrabold text-[#FFC400] text-sm block">{order.id}</span>
                          <span className="text-neutral-500 text-[10px]">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="inline-block text-[9px] uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 mt-0.5">
                            via {order.source}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <strong className="text-white block">{order.customerName}</strong>
                          <span className="text-neutral-400">{order.customerCell}</span>
                        </td>

                        {/* Fulfillment & Area */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-semibold text-white">
                            {order.deliveryType === 'delivery' ? (
                              <Truck size={13} className="text-[#D7141A]" />
                            ) : (
                              <span className="text-neutral-400">🏪</span>
                            )}
                            <span>{order.deliveryType === 'delivery' ? 'Delivery' : 'Collection'}</span>
                          </div>
                          <span className="text-neutral-400 text-[11px] block">{order.area}</span>
                          <span className="text-[#FFC400] text-[10px] block font-bold">
                            Date: {order.deliveryDate}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{order.items.length} cut(s)</span>
                          <span className="text-neutral-400 text-[11px] truncate max-w-40 block">
                            {order.items.map(it => it.name).join(', ')}
                          </span>
                        </td>

                        {/* Total & Payment */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white text-sm block">{formatZAR(order.total)}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-amber-950 text-amber-300'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            <span className="text-neutral-500 text-[10px] uppercase">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </td>

                        {/* Pipeline Status Stepper */}
                        <td className="py-3.5 px-4">
                          <select
                            value={order.orderStatus}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={isDriver}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase focus:outline-none cursor-pointer ${statusObj.color}`}
                          >
                            {PIPELINE_STATUSES.map(s => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          {order.assignedDriverId && (
                            <span className="block text-[10px] text-neutral-400 mt-1">
                              Driver: {users.find(u => u.id === order.assignedDriverId)?.name.split(' ')[0]}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Driver Action Button */}
                            {isDriver && order.orderStatus !== 'completed' && (
                              <button
                                onClick={() => setDriverModal({ order, status: 'completed' })}
                                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-xs transition cursor-pointer"
                              >
                                Mark Delivered
                              </button>
                            )}

                            {/* View / Detail */}
                            <button
                              onClick={() => setSelectedOrderForDetails(order)}
                              title="View Order Details"
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md cursor-pointer transition"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Print Slips */}
                            <button
                              onClick={() => setSlipModal({ order, mode: 'thermal_80mm' })}
                              title="Print 80mm Thermal Receipt"
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-[#FFC400] rounded-md cursor-pointer transition"
                            >
                              <Printer size={15} />
                            </button>

                            <button
                              onClick={() => setSlipModal({ order, mode: 'invoice_a4' })}
                              title="Print A4 Tax Invoice"
                              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md cursor-pointer transition"
                            >
                              <FileText size={15} />
                            </button>

                            {/* WhatsApp Customer */}
                            <a
                              href={createStaffCustomerWhatsAppLink(
                                order.customerCell,
                                order.deliveryType === 'collection' ? 'ready_collection' : 'out_for_delivery',
                                order.id,
                                order.customerName,
                                { date: order.deliveryDate, total: order.total }
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Send WhatsApp Template"
                              className="p-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] rounded-md cursor-pointer transition"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {PIPELINE_STATUSES.filter(s => s.key !== 'cancelled').map(col => {
            const colOrders = filteredOrders.filter(o => o.orderStatus === col.key);

            return (
              <div
                key={col.key}
                className="w-72 shrink-0 bg-[#161616] rounded-2xl border border-[#2D2D2D] flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#282828] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-sm uppercase text-white tracking-wider">
                      {col.label}
                    </span>
                    <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.2 rounded-full font-bold">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 divide-y divide-[#242424]">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-600">
                      No orders in this stage
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="bg-[#202020] hover:bg-[#262626] border border-[#333] hover:border-[#D7141A] rounded-xl p-3.5 transition cursor-pointer shadow-md space-y-2 pt-3 first:pt-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-sm text-[#FFC400]">
                            {order.id}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {order.deliveryDate}
                          </span>
                        </div>

                        <div>
                          <strong className="text-white text-xs block truncate">{order.customerName}</strong>
                          <span className="text-[11px] text-neutral-400 block truncate">
                            {order.deliveryType === 'delivery' ? `🚚 ${order.area}` : '🏪 Collection'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#2C2C2C] text-xs">
                          <span className="font-extrabold text-white">{formatZAR(order.total)}</span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Quick Kanban Pipeline Move */}
                        <div className="pt-2 flex items-center justify-between gap-1 text-[11px]">
                          <select
                            value={order.orderStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-neutral-900 border border-[#444] rounded px-1.5 py-1 text-white text-[10px] uppercase font-semibold focus:outline-none"
                          >
                            {PIPELINE_STATUSES.map(s => (
                              <option key={s.key} value={s.key}>
                                Move: {s.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSlipModal({ order, mode: 'thermal_80mm' });
                            }}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ORDER DETAIL & WEIGH ADJUST MODAL */}
      {selectedOrderForDetails && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedOrderForDetails(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#1A1A1A] text-neutral-100 rounded-2xl border border-[#333] shadow-2xl overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#111111] border-b border-[#2B2B2B]">
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-2xl text-[#FFC400]">
                  {selectedOrderForDetails.id}
                </span>
                <span className="bg-neutral-800 text-neutral-300 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
                  {selectedOrderForDetails.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 font-semibold block">Customer Details:</span>
                  <strong className="text-white text-base block">{selectedOrderForDetails.customerName}</strong>
                  <span className="text-neutral-300 block">{selectedOrderForDetails.customerCell}</span>
                  {selectedOrderForDetails.customerEmail && (
                    <span className="text-neutral-400 block">{selectedOrderForDetails.customerEmail}</span>
                  )}
                </div>
                <div>
                  <span className="text-neutral-500 font-semibold block">Delivery / Collection:</span>
                  <strong className="text-white block">
                    {selectedOrderForDetails.deliveryType.toUpperCase()} — {selectedOrderForDetails.area}
                  </strong>
                  {selectedOrderForDetails.deliveryAddress && (
                    <span className="text-neutral-300 block">{selectedOrderForDetails.deliveryAddress}</span>
                  )}
                  <span className="text-[#FFC400] font-bold block mt-1">
                    Scheduled Date: {selectedOrderForDetails.deliveryDate}
                  </span>
                </div>
              </div>

              {/* Items & Weigh Adjustment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm uppercase">Order Lines</h4>
                  <span className="text-[11px] text-neutral-400">
                    Click "Weigh & Adjust" for butcher scale lines
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrderForDetails.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-white text-sm block">{it.name}</span>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span>Qty: {it.quantity}{it.pricingType === 'per_kg' ? 'kg' : ''}</span>
                          {it.selectedOption && <span className="text-[#FFC400]">({it.selectedOption})</span>}
                          {it.actualWeightKg && (
                            <span className="text-emerald-400 font-bold">
                              [Weighed: {it.actualWeightKg}kg]
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-[#FFC400] text-sm">
                          {formatZAR(it.lineTotal)}
                        </span>

                        {it.pricingType === 'per_kg' && (
                          <button
                            onClick={() => {
                              setWeighModal({
                                orderId: selectedOrderForDetails.id,
                                productId: it.productId,
                                productName: it.name,
                                unitPrice: it.unitPrice,
                                currentWeight: it.actualWeightKg || it.quantity
                              });
                              setActualWeightInput(String(it.actualWeightKg || it.quantity));
                              setWeighReasonInput(selectedOrderForDetails.weighAdjustReason || '');
                            }}
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-[#444] px-2.5 py-1 rounded text-xs flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Scale size={13} className="text-[#FFC400]" />
                            <span>Weigh & Adjust</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Assignment & Cash */}
              {!isDriver && (
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <h4 className="font-bold text-white uppercase text-xs">Assign Delivery Driver</h4>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrderForDetails.assignedDriverId || ''}
                      onChange={e => assignDriver(selectedOrderForDetails.id, e.target.value)}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="">No Driver Assigned</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        updatePaymentStatus(
                          selectedOrderForDetails.id,
                          selectedOrderForDetails.paymentStatus === 'paid' ? 'pending' : 'paid'
                        );
                        setSelectedOrderForDetails({
                          ...selectedOrderForDetails,
                          paymentStatus: selectedOrderForDetails.paymentStatus === 'paid' ? 'pending' : 'paid'
                        });
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedOrderForDetails.paymentStatus === 'paid'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {selectedOrderForDetails.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark as Paid'}
                    </button>
                  </div>
                </div>
              )}

              {/* POP Screenshot if uploaded */}
              {selectedOrderForDetails.popUrl && (
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                  <span className="font-bold text-white block mb-2 text-xs">Proof of Payment:</span>
                  <div className="max-h-48 overflow-hidden rounded bg-black flex items-center justify-center border border-neutral-800">
                    <img
                      src={selectedOrderForDetails.popUrl}
                      alt="Proof of payment"
                      className="max-h-48 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 text-xs">Subtotal: {formatZAR(selectedOrderForDetails.subtotal)}</span>
                  <span className="text-neutral-400 text-xs block">
                    Delivery: {selectedOrderForDetails.deliveryFee === 0 ? 'FREE' : formatZAR(selectedOrderForDetails.deliveryFee)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 block font-semibold">Total Order Value:</span>
                  <span className="font-heading font-black text-2xl text-[#FFC400]">
                    {formatZAR(selectedOrderForDetails.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: WEIGH & ADJUST PROMPT */}
      {weighModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWeighModal(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <Scale size={18} className="text-[#FFC400]" />
                <span>Weigh & Adjust Per-Kg Line</span>
              </h3>
              <button onClick={() => setWeighModal(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-300">
              Enter the exact scale reading for <strong>{weighModal.productName}</strong>. Unit price: {formatZAR(weighModal.unitPrice)}/kg.
            </p>

            <form onSubmit={handleWeighSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  Actual Scale Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={actualWeightInput}
                  onChange={e => setActualWeightInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#D7141A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  Reason for Adjustment (Required for audit log):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weighed 1.85kg cut on butcher counter scale"
                  value={weighReasonInput}
                  onChange={e => setWeighReasonInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D7141A]"
                />
              </div>

              {actualWeightInput && !isNaN(parseFloat(actualWeightInput)) && (
                <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs flex justify-between">
                  <span>Updated Line Price:</span>
                  <span className="font-extrabold text-[#FFC400]">
                    {formatZAR(
                      Math.round((weighModal.unitPrice * parseFloat(actualWeightInput) + 0.0001) * 100) / 100
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWeighModal(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save & Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DRIVER DELIVERY RECORDING */}
      {driverModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDriverModal(null)}
        >
          <div
            className="w-full max-w-md bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold uppercase text-white">
              Driver Delivery Result: {driverModal.order.id}
            </h3>

            <p className="text-xs text-neutral-300">
              Customer: <strong>{driverModal.order.customerName}</strong> ({driverModal.order.deliveryAddress || driverModal.order.area})
            </p>

            <form onSubmit={handleDriverRecordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  Cash Collected (ZAR):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Expected: ${driverModal.order.total}`}
                  value={driverCashInput}
                  onChange={e => setDriverCashInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#D7141A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  Driver Notes / Reason (if failed or special instructions):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed to security gate / customer paid in full"
                  value={driverNotesInput}
                  onChange={e => setDriverNotesInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D7141A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDriverModal(null)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SLIP MODAL */}
      {slipModal && (
        <AdminOrderSlip
          order={slipModal.order}
          mode={slipModal.mode}
          runSheetOrders={filteredOrders}
          areaName={slipModal.areaName}
          onClose={() => setSlipModal(null)}
        />
      )}
    </div>
  );
};
