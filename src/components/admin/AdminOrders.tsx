import React, { useState } from 'react';
import { Store, X,
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
import { toast } from '../ui/feedback';
import { proofKind } from '../../utils/validate';
import { useStore } from '../../services/store';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, Role } from '../../types';
import { formatZAR, calculateLineTotal } from '../../utils/pricing';
import { createStaffCustomerWhatsAppLink } from '../../utils/delivery';
import { AdminOrderSlip } from './AdminOrderSlip';

const PIPELINE_STATUSES: { key: OrderStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-red-50 text-red-800 border-red-200' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'packing', label: 'Packing', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'ready_for_collection', label: 'Ready for Collection', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-sand text-ink-soft border-ink/10' }
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
      toast('Enter the weight from the scale in kg, for example 1.25.', 'error');
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
          <h2 className="display text-3xl">
            {isDriver ? 'My Assigned Deliveries Today' : 'Order Processing & Dispatch Pipeline'}
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            {isDriver
              ? 'Update delivery status, record cash collected, or log delivery attempts.'
              : 'Process incoming web, WhatsApp, phone, and walk-in orders.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isDriver && (
            <>
              {/* Toggle List / Kanban */}
              <div className="p-1 flex items-center panel">
                <button
                  onClick={() => setViewMode('list')}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-brand-accent text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <List size={15} />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-brand-accent text-white' : 'text-ink-soft hover:text-ink'
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
                className="btn btn-sm btn-outline"
              >
                <Printer size={15} className="text-brand-yellow-deep" />
                <span>Run Sheet</span>
              </button>

              {/* + New Order */}
              <button
                onClick={onOpenNewOrderModal}
                className="btn btn-sm btn-accent"
              >
                <Plus size={15} />
                <span>New Order</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 panel">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
          <input
            type="text"
            placeholder="Search order #, customer, cell..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="field w-full pl-11"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="field w-full"
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
            className="field w-full"
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
            className="field w-full"
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
            className="field w-full"
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
        <div className="overflow-hidden panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
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
              <tbody className="divide-y divide-ink/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink-soft">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const statusObj = PIPELINE_STATUSES.find(s => s.key === order.orderStatus) || PIPELINE_STATUSES[0];

                    return (
                      <tr key={order.id} className="hover:bg-sand/40 transition">
                        {/* ID & Date */}
                        <td className="py-3.5 px-4 num">
                          <span className="font-bold text-brand-yellow-deep text-sm block">{order.id}</span>
                          <span className="text-ink-soft text-sm">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="inline-block text-sm px-1.5 py-0.2 rounded bg-sand text-ink-soft mt-0.5">
                            via {order.source}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <strong className="text-ink block">{order.customerName}</strong>
                          <span className="text-ink-soft">{order.customerCell}</span>
                        </td>

                        {/* Fulfillment & Area */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-semibold text-ink">
                            {order.deliveryType === 'delivery' ? (
                              <Truck size={13} className="text-brand-accent-deep" />
                            ) : (
                              <Store size={14} className="text-ink-soft" />
                            )}
                            <span>{order.deliveryType === 'delivery' ? 'Delivery' : 'Collection'}</span>
                          </div>
                          <span className="text-ink-soft text-sm block">{order.area}</span>
                          <span className="text-brand-yellow-deep text-sm block font-bold">
                            Date: {order.deliveryDate}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-ink block">{order.items.length} cut(s)</span>
                          <span className="text-ink-soft text-sm truncate max-w-40 block">
                            {order.items.map(it => it.name).join(', ')}
                          </span>
                        </td>

                        {/* Total & Payment */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-ink text-sm block">{formatZAR(order.total)}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-sm font-bold px-1.5 py-0.5 rounded ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            <span className="text-ink-soft text-sm ">
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
                            className={`min-h-[44px] px-3 rounded-xl text-sm font-semibold border cursor-pointer ${statusObj.color}`}
                          >
                            {PIPELINE_STATUSES.map(s => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          {order.assignedDriverId && (
                            <span className="block text-sm text-ink-soft mt-1">
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
                                className="btn btn-sm bg-emerald-700 text-white hover:bg-ink"
                              >
                                Mark Delivered
                              </button>
                            )}

                            {/* View / Detail */}
                            <button
                              onClick={() => setSelectedOrderForDetails(order)}
                              title="View Order Details"
                              className="icon-btn bg-sand hover:bg-sand text-ink cursor-pointer transition"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Print Slips */}
                            <button
                              onClick={() => setSlipModal({ order, mode: 'thermal_80mm' })}
                              title="Print 80mm Thermal Receipt"
                              className="icon-btn bg-sand hover:bg-sand text-brand-yellow-deep cursor-pointer transition"
                            >
                              <Printer size={15} />
                            </button>

                            <button
                              onClick={() => setSlipModal({ order, mode: 'invoice_a4' })}
                              title="Print A4 Tax Invoice"
                              className="icon-btn bg-sand hover:bg-sand text-ink cursor-pointer transition"
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
                              className="icon-btn bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
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
                className="w-72 shrink-0 bg-paper rounded-2xl border border-ink/10 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-ink/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="display text-sm text-ink ">
                      {col.label}
                    </span>
                    <span className="bg-sand text-ink-soft text-sm px-2 py-0.2 rounded-full font-bold">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 divide-y divide-ink/10">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-sm text-ink-soft">
                      No orders in this stage
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="hover:bg-[#262626] hover:border-brand-accent p-3.5 transition cursor-pointer space-y-2 pt-3 first:pt-0 panel rounded-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <span className="num font-bold text-sm text-brand-yellow-deep">
                            {order.id}
                          </span>
                          <span className="text-sm text-ink-soft">
                            {order.deliveryDate}
                          </span>
                        </div>

                        <div>
                          <strong className="text-ink text-sm block truncate">{order.customerName}</strong>
                          <span className="text-sm text-ink-soft block truncate">
                            {order.deliveryType === 'delivery' ? order.area : 'Collection'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-ink/10 text-sm">
                          <span className="font-bold text-ink">{formatZAR(order.total)}</span>
                          <span
                            className={`text-sm font-bold px-1.5 py-0.2 rounded ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>

                        {/* Quick Kanban Pipeline Move */}
                        <div className="pt-2 flex items-center justify-between gap-1 text-sm">
                          <select
                            value={order.orderStatus}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="field"
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
                            className="icon-btn text-ink-soft hover:text-ink"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedOrderForDetails(null)}
        >
          <div
            className="relative w-full max-w-2xl text-ink overflow-hidden my-6 panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-paper border-b border-ink/10">
              <div className="flex items-center gap-2">
                <span className="display text-2xl text-brand-yellow-deep">
                  {selectedOrderForDetails.id}
                </span>
                <span className="bg-sand text-ink-soft text-sm px-2.5 py-0.5 rounded font-bold ">
                  {selectedOrderForDetails.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-ink-soft hover:text-ink cursor-pointer"
              ><X size={18} /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-sm sm:text-sm">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 p-4 panel">
                <div>
                  <span className="text-ink-soft font-semibold block">Customer Details:</span>
                  <strong className="text-ink text-base block">{selectedOrderForDetails.customerName}</strong>
                  <span className="text-ink-soft block">{selectedOrderForDetails.customerCell}</span>
                  {selectedOrderForDetails.customerEmail && (
                    <span className="text-ink-soft block">{selectedOrderForDetails.customerEmail}</span>
                  )}
                </div>
                <div>
                  <span className="text-ink-soft font-semibold block">Delivery / Collection:</span>
                  <strong className="text-ink block">
                    {selectedOrderForDetails.deliveryType.toUpperCase()} — {selectedOrderForDetails.area}
                  </strong>
                  {selectedOrderForDetails.deliveryAddress && (
                    <span className="text-ink-soft block">{selectedOrderForDetails.deliveryAddress}</span>
                  )}
                  <span className="text-brand-yellow-deep font-bold block mt-1">
                    Scheduled Date: {selectedOrderForDetails.deliveryDate}
                  </span>
                </div>
              </div>

              {/* Items & Weigh Adjustment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-ink text-sm ">Order Lines</h4>
                  <span className="text-sm text-ink-soft">
                    Click "Weigh & Adjust" for butcher scale lines
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrderForDetails.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between gap-2 panel rounded-2xl"
                    >
                      <div>
                        <span className="font-bold text-ink text-sm block">{it.name}</span>
                        <div className="flex items-center gap-2 text-sm text-ink-soft mt-0.5">
                          <span>Qty: {it.quantity}{it.pricingType === 'per_kg' ? 'kg' : ''}</span>
                          {it.selectedOption && <span className="text-brand-yellow-deep">({it.selectedOption})</span>}
                          {it.actualWeightKg && (
                            <span className="text-emerald-800 font-bold">
                              [Weighed: {it.actualWeightKg}kg]
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-yellow-deep text-sm">
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
                            className="btn btn-sm btn-outline"
                          >
                            <Scale size={13} className="text-brand-yellow-deep" />
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
                <div className="p-4 space-y-3 panel">
                  <h4 className="font-bold text-ink text-sm">Assign Delivery Driver</h4>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrderForDetails.assignedDriverId || ''}
                      onChange={e => assignDriver(selectedOrderForDetails.id, e.target.value)}
                      className="field flex-1"
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
                      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 rounded-full text-sm font-bold transition cursor-pointer ${
                        selectedOrderForDetails.paymentStatus === 'paid'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {selectedOrderForDetails.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark as Paid'}
                    </button>
                  </div>
                </div>
              )}

              {/* POP Screenshot if uploaded */}
              {selectedOrderForDetails.popUrl && (
                <div className="p-4 panel">
                  <span className="font-bold text-ink block mb-2 text-sm">Proof of payment</span>
                  {proofKind(selectedOrderForDetails.popUrl) === 'image' ? (
                    <div className="max-h-48 overflow-hidden rounded-xl bg-sand flex items-center justify-center">
                      <img
                        src={selectedOrderForDetails.popUrl}
                        alt="Proof of payment"
                        className="max-h-48 object-contain"
                      />
                    </div>
                  ) : proofKind(selectedOrderForDetails.popUrl) === 'pdf' ? (
                    <a
                      href={selectedOrderForDetails.popUrl}
                      download={`proof-of-payment-${selectedOrderForDetails.id}.pdf`}
                      className="btn btn-sm btn-outline"
                    >
                      Download the PDF
                    </a>
                  ) : (
                    <p className="text-sm text-ink-soft">
                      The attached file is not a photo or PDF, so it is not shown. Ask the customer to send it again.
                    </p>
                  )}
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-paper p-4 rounded-xl border border-ink/10 flex items-center justify-between">
                <div>
                  <span className="text-ink-soft text-sm">Subtotal: {formatZAR(selectedOrderForDetails.subtotal)}</span>
                  <span className="text-ink-soft text-sm block">
                    Delivery: {selectedOrderForDetails.deliveryFee === 0 ? 'FREE' : formatZAR(selectedOrderForDetails.deliveryFee)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-ink-soft block font-semibold">Total Order Value:</span>
                  <span className="display text-2xl text-brand-yellow-deep">
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setWeighModal(null)}
        >
          <div
            className="w-full max-w-md text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="display flex items-center gap-2 text-2xl">
                <Scale size={18} className="text-brand-yellow-deep" />
                <span>Weigh & Adjust Per-Kg Line</span>
              </h3>
              <button onClick={() => setWeighModal(null)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-ink-soft hover:text-ink"><X size={18} /></button>
            </div>

            <p className="text-sm text-ink-soft">
              Enter the exact scale reading for <strong>{weighModal.productName}</strong>. Unit price: {formatZAR(weighModal.unitPrice)}/kg.
            </p>

            <form onSubmit={handleWeighSubmit} className="space-y-4">
              <div>
                <label className="field-label">
                  Actual Scale Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={actualWeightInput}
                  onChange={e => setActualWeightInput(e.target.value)}
                  className="field w-full num"
                />
              </div>

              <div>
                <label className="field-label">
                  Reason for Adjustment (Required for audit log):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weighed 1.85kg cut on butcher counter scale"
                  value={weighReasonInput}
                  onChange={e => setWeighReasonInput(e.target.value)}
                  className="field w-full"
                />
              </div>

              {actualWeightInput && !isNaN(parseFloat(actualWeightInput)) && (
                <div className="p-3 bg-paper rounded border border-ink/10 text-sm flex justify-between">
                  <span>Updated Line Price:</span>
                  <span className="font-bold text-brand-yellow-deep">
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
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDriverModal(null)}
        >
          <div
            className="w-full max-w-md text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="display text-2xl">
              Driver Delivery Result: {driverModal.order.id}
            </h3>

            <p className="text-sm text-ink-soft">
              Customer: <strong>{driverModal.order.customerName}</strong> ({driverModal.order.deliveryAddress || driverModal.order.area})
            </p>

            <form onSubmit={handleDriverRecordSubmit} className="space-y-4">
              <div>
                <label className="field-label">
                  Cash Collected (ZAR):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Expected: ${driverModal.order.total}`}
                  value={driverCashInput}
                  onChange={e => setDriverCashInput(e.target.value)}
                  className="field w-full num"
                />
              </div>

              <div>
                <label className="field-label">
                  Driver Notes / Reason (if failed or special instructions):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed to security gate / customer paid in full"
                  value={driverNotesInput}
                  onChange={e => setDriverNotesInput(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDriverModal(null)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm bg-emerald-700 text-white hover:bg-ink"
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
