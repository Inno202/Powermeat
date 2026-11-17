import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Received',
  confirmed: 'Confirmed',
  packing: 'Being packed',
  ready_for_collection: 'Ready for collection',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Not yet paid',
  paid: 'Paid',
  refunded: 'Refunded'
};

export function paymentMethodLabel(method: PaymentMethod, deliveryType: Order['deliveryType']): string {
  if (method === 'eft') return 'Bank EFT';
  if (method === 'online_card') return 'Online card';
  return deliveryType === 'delivery' ? 'Pay on delivery' : 'Pay on collection';
}

/** Badge colours for an order status (real state, so it earns a badge). */
export function statusBadgeClass(status: OrderStatus): string {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-900';
  if (status === 'cancelled') return 'bg-red-50 text-red-800';
  return 'bg-sand text-ink';
}

/** 2026-11-18 -> Wed 18 Nov 2026 */
export function formatDate(iso: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
