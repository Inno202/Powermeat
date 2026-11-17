import React from 'react';
import { Order } from '../../types';
import { useStore } from '../../services/store';
import { whatsappLink } from '../../utils/contact';
import { ORDER_STATUS_LABEL, statusBadgeClass } from '../../utils/labels';
import { OrderSummary } from './OrderSummary';

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
  onReorder: (order: Order) => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping, onReorder }) => {
  const { settings } = useStore();
  const whatsappQuery = whatsappLink(
    settings.whatsapp,
    `Hello Powermeat! I've placed order ${order.id}. Could you confirm receipt?`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="hero-rise">
        <h1 className="display text-5xl sm:text-6xl">
          Your order is <span className="text-brand-accent">in</span>
        </h1>
        <p className="mt-4 text-ink-soft max-w-[52ch]">
          Thank you for ordering with Powermeat Welkom. Our butcher team is prepping your order.
        </p>
        <p className="mt-6 flex items-center flex-wrap gap-3">
          <span className="num display text-4xl">{order.id}</span>
          <span className={`badge ${statusBadgeClass(order.orderStatus)}`}>{ORDER_STATUS_LABEL[order.orderStatus]}</span>
        </p>
      </div>

      <div className="panel p-5 sm:p-8 mt-8">
        <OrderSummary order={order} />
      </div>

      <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
        <button type="button" onClick={onContinueShopping} className="btn btn-primary">
          Back to the store
        </button>
        <a href={whatsappQuery} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <span>Chat about this order</span>
        </a>
        <button type="button" onClick={() => onReorder(order)} className="btn btn-outline">
          <span>Order these again</span>
        </button>
      </div>
    </div>
  );
};
