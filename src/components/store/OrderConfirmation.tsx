import React from 'react';
import { CheckCircle2, MessageCircle, MapPin, Calendar, Truck, ArrowLeft, RotateCcw } from 'lucide-react';
import { Order } from '../../types';
import { formatZAR } from '../../utils/pricing';
import { useStore } from '../../services/store';

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
  onReorder: (order: Order) => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onContinueShopping,
  onReorder
}) => {
  const { settings } = useStore();
  const digitsOnly = settings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '27' + digitsOnly.slice(1) : digitsOnly;
  const whatsappQuery = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello Powermeat! I've placed order ${order.id}. Could you confirm receipt?`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-[#1A1A1A] border border-[#2F2F2F] rounded-2xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-950/80 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
          Order Received!
        </h1>
        <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
          Thank you for ordering with Powermeat Welkom. Our butcher team is prepping your order.
        </p>

        {/* Order Number Box */}
        <div className="mt-6 p-4 bg-neutral-900 rounded-xl border border-[#333] inline-block">
          <span className="text-xs text-neutral-400 uppercase tracking-widest font-bold block mb-1">
            Your Order Number
          </span>
          <span className="font-heading font-black text-3xl sm:text-4xl text-[#FFC400] tracking-wider">
            {order.id}
          </span>
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <span className="inline-block bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            Status: {order.orderStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Details card */}
        <div className="mt-8 text-left bg-neutral-900/90 rounded-xl p-5 border border-[#2D2D2D] space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#333]">
            <div>
              <span className="text-neutral-400 font-semibold block">Customer Name</span>
              <span className="font-bold text-white text-base">{order.customerName}</span>
              <span className="text-neutral-400 block">{order.customerCell}</span>
            </div>
            <div>
              <span className="text-neutral-400 font-semibold block">Fulfillment</span>
              <span className="font-bold text-white flex items-center gap-1.5 text-base">
                {order.deliveryType === 'delivery' ? <Truck size={16} className="text-[#D7141A]" /> : <MapPin size={16} className="text-[#D7141A]" />}
                {order.deliveryType === 'delivery' ? 'Scheduled Delivery' : 'In-Store Collection'}
              </span>
              <span className="text-neutral-300 block">{order.area}</span>
              {order.deliveryAddress && (
                <span className="text-neutral-400 block text-xs mt-0.5">{order.deliveryAddress}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#333]">
            <div>
              <span className="text-neutral-400 font-semibold block">Scheduled Date</span>
              <span className="font-bold text-[#FFC400] text-base flex items-center gap-1.5">
                <Calendar size={16} />
                {order.deliveryDate}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 font-semibold block">Payment Method</span>
              <span className="font-bold text-white uppercase">{order.paymentMethod}</span>
              <span className="text-neutral-400 block text-xs">Payment status: {order.paymentStatus}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <span className="text-neutral-400 font-semibold block mb-2">Order Items:</span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-300 py-1 border-b border-neutral-800 last:border-0">
                  <div>
                    <span className="font-semibold text-white">{item.name}</span>
                    {item.selectedOption && (
                      <span className="text-[11px] text-[#FFC400] ml-1.5">({item.selectedOption})</span>
                    )}
                    <span className="text-neutral-500 text-xs ml-2">x {item.quantity}</span>
                  </div>
                  <span className="font-bold text-white">{formatZAR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#333] space-y-1 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span>{formatZAR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Fee:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : formatZAR(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#FFC400] pt-1 border-t border-neutral-800">
              <span>Total:</span>
              <span>{formatZAR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappQuery}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer text-sm"
          >
            <MessageCircle size={18} className="fill-white" />
            <span>Chat on WhatsApp about this order</span>
          </a>

          <button
            onClick={() => onReorder(order)}
            className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 border border-[#444] transition cursor-pointer text-sm"
          >
            <RotateCcw size={16} />
            <span>Reorder These Items</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </button>
        </div>
      </div>
    </div>
  );
};
