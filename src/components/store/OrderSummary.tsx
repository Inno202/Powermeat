import React from 'react';
import { Truck, Store } from 'lucide-react';
import { Order } from '../../types';
import { formatZAR } from '../../utils/pricing';
import { formatDate, paymentMethodLabel, PAYMENT_STATUS_LABEL } from '../../utils/labels';

/** The facts of one order: who, where, when, what and how much. */
export const OrderSummary: React.FC<{ order: Order }> = ({ order }) => (
  <div className="num">
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
      <div>
        <dt className="text-sm text-ink-soft">Name</dt>
        <dd className="font-semibold">{order.customerName}</dd>
        <dd className="text-ink-soft">{order.customerCell}</dd>
      </div>
      <div>
        <dt className="text-sm text-ink-soft">{order.deliveryType === 'delivery' ? 'Delivery' : 'Collection in store'}</dt>
        <dd className="font-semibold flex items-center gap-2">
          {order.deliveryType === 'delivery' ? (
            <Truck size={18} className="text-brand-accent-deep shrink-0" />
          ) : (
            <Store size={18} className="text-brand-accent-deep shrink-0" />
          )}
          {formatDate(order.deliveryDate)}
        </dd>
        <dd className="text-ink-soft">
          {order.area}
          {order.deliveryAddress ? `, ${order.deliveryAddress}` : ''}
        </dd>
      </div>
      <div>
        <dt className="text-sm text-ink-soft">Payment</dt>
        <dd className="font-semibold">{paymentMethodLabel(order.paymentMethod, order.deliveryType)}</dd>
        <dd className="text-ink-soft">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</dd>
      </div>
    </dl>

    <ul className="mt-6 divide-y divide-ink/10 border-t border-ink/10">
      {order.items.map((item, idx) => (
        <li key={idx} className="py-3 flex justify-between gap-4">
          <span className="min-w-0">
            <span className="font-semibold">{item.name}</span>
            <span className="text-ink-soft">
              {item.selectedOption ? ` (${item.selectedOption})` : ''} × {item.quantity}
              {item.pricingType === 'per_kg' ? 'kg' : ''}
            </span>
          </span>
          <span className="font-semibold shrink-0">{formatZAR(item.lineTotal)}</span>
        </li>
      ))}
    </ul>

    <dl className="border-t border-ink/10 pt-3 space-y-1">
      <div className="flex justify-between text-ink-soft">
        <dt>Subtotal</dt>
        <dd>{formatZAR(order.subtotal)}</dd>
      </div>
      <div className="flex justify-between text-ink-soft">
        <dt>Delivery</dt>
        <dd>{order.deliveryFee === 0 ? 'Free' : formatZAR(order.deliveryFee)}</dd>
      </div>
      <div className="flex justify-between items-baseline pt-2">
        <dt className="font-semibold">Total</dt>
        <dd className="display text-3xl">{formatZAR(order.total)}</dd>
      </div>
    </dl>
  </div>
);
