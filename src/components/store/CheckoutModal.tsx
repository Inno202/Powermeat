import React, { useState, useId } from 'react';
import {
  X,
  Truck,
  Store,
  Calendar,
  CreditCard,
  Banknote,
  FileText,
  MessageCircle,
  ArrowRight,
  Shield,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR, calculateDeliveryFee } from '../../utils/pricing';
import { getAvailableDates, createWhatsAppOrderLink } from '../../utils/delivery';
import { Order, OrderItem, PaymentMethod, DeliveryType } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderComplete
}) => {
  const {
    cart,
    cartSubtotal,
    isCartFreeDelivery,
    deliveryAreas,
    settings,
    createOrder,
    clearCart
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(() => {
    return deliveryAreas[0]?.id || 'area-welkom';
  });

  const selectedArea = deliveryAreas.find(a => a.id === selectedAreaId) || deliveryAreas[0];

  // Eligible delivery/collection dates
  const availableDates = getAvailableDates(
    selectedArea?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    settings.blockedDates,
    12
  );

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return availableDates[0]?.dateStr || '';
  });

  // Customer contact info
  const [customerName, setCustomerName] = useState('');
  const [customerCell, setCustomerCell] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [popFileUrl, setPopFileUrl] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const popUploadInputId = useId();

  if (!isOpen) return null;

  // Calculate delivery fee
  const deliveryFee = calculateDeliveryFee(
    deliveryType,
    selectedArea?.fee || 0,
    cart.map(c => ({ category: c.product.category, isFreeDelivery: c.product.isFreeDelivery }))
  );

  const finalTotal = Math.round((cartSubtotal + deliveryFee + 0.0001) * 100) / 100;

  const prepareOrderItems = (): OrderItem[] => {
    return cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      pricingType: item.product.pricingType,
      unitPrice: item.product.price,
      quantity: item.quantity,
      selectedOption: item.selectedOption,
      weightKg: item.product.weightKg,
      lineTotal: Math.round((item.product.price * item.quantity + 0.0001) * 100) / 100,
      notes: item.notes
    }));
  };

  const handlePopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPopFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      setValidationError('Please enter your full name.');
      return false;
    }
    if (!customerCell.trim() || customerCell.replace(/[^0-9]/g, '').length < 9) {
      setValidationError('Please provide a valid South African cell phone number.');
      return false;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setValidationError('Please enter your delivery street address in ' + selectedArea.name + '.');
      return false;
    }
    if (!selectedDateStr) {
      setValidationError('Please select an eligible delivery/collection date.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const items = prepareOrderItems();
    const newOrder = createOrder({
      customerName: customerName.trim(),
      customerCell: customerCell.trim(),
      customerEmail: customerEmail.trim() || undefined,
      deliveryType,
      area: selectedArea.name,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryDate: selectedDateStr,
      items,
      subtotal: cartSubtotal,
      deliveryFee,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'eft' && popFileUrl ? 'pending' : 'pending',
      orderStatus: 'new',
      source: 'web',
      notes: notes.trim() || undefined,
      marketingOptIn,
      popUrl: popFileUrl || undefined
    });

    clearCart();
    onOrderComplete(newOrder);
  };

  const handleWhatsAppOrderSubmit = () => {
    if (!validateForm()) return;

    const items = prepareOrderItems();
    const newOrder = createOrder({
      customerName: customerName.trim(),
      customerCell: customerCell.trim(),
      customerEmail: customerEmail.trim() || undefined,
      deliveryType,
      area: selectedArea.name,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryDate: selectedDateStr,
      items,
      subtotal: cartSubtotal,
      deliveryFee,
      total: finalTotal,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'new',
      source: 'whatsapp', // Tracked as WhatsApp source!
      notes: notes.trim() || undefined,
      marketingOptIn,
      popUrl: popFileUrl || undefined
    });

    // Create and launch WhatsApp link
    const waLink = createWhatsAppOrderLink(settings.whatsapp, {
      orderNumber: newOrder.id,
      customerName: customerName.trim(),
      customerCell: customerCell.trim(),
      deliveryType,
      area: selectedArea.name,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryDate: selectedDateStr,
      items,
      subtotal: cartSubtotal,
      deliveryFee,
      total: finalTotal,
      paymentMethod,
      notes: notes.trim() || undefined
    });

    clearCart();
    window.open(waLink, '_blank');
    onOrderComplete(newOrder);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#1A1A1A] text-neutral-100 rounded-2xl border border-[#333] shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2B2B] bg-[#111111]">
          <h2 className="text-xl font-heading font-extrabold uppercase tracking-wide text-white flex items-center gap-2">
            <span>Checkout & Order Placement</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close Checkout"
            className="p-1 rounded-md text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleStandardSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Step 1: Delivery or Collection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              1. Fulfillment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  deliveryType === 'delivery'
                    ? 'border-[#D7141A] bg-[#2A1617] text-white ring-2 ring-[#D7141A]/50'
                    : 'border-[#333] bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <Truck size={20} className={deliveryType === 'delivery' ? 'text-[#D7141A]' : 'text-neutral-500'} />
                <div>
                  <div className="text-sm font-bold text-white">Delivery to Address</div>
                  <div className="text-[11px] text-neutral-400">Welkom & Goldfields towns</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('collection')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  deliveryType === 'collection'
                    ? 'border-[#D7141A] bg-[#2A1617] text-white ring-2 ring-[#D7141A]/50'
                    : 'border-[#333] bg-neutral-900 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                <Store size={20} className={deliveryType === 'collection' ? 'text-[#D7141A]' : 'text-neutral-500'} />
                <div>
                  <div className="text-sm font-bold text-white">Collection in Store</div>
                  <div className="text-[11px] text-neutral-400">145 Power Rd, Welkom (Free)</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Area Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              2. Select Your Area / Town
            </label>
            <select
              value={selectedAreaId}
              onChange={e => setSelectedAreaId(e.target.value)}
              className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3.5 py-2.5 text-sm font-medium text-white focus:outline-none focus:border-[#D7141A]"
            >
              {deliveryAreas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name} — {area.days.join(', ')} ({area.fee === 0 ? 'Free' : `R${area.fee.toFixed(2)}`})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Date Selection with 12h00 Cutoff */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                3. {deliveryType === 'delivery' ? 'Delivery Date' : 'Collection Date'}
              </label>
              <span className="text-[11px] text-[#FFC400] font-semibold">
                Cutoff: 12h00 noon day before
              </span>
            </div>

            {availableDates.length === 0 ? (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-900">
                No delivery dates are currently available for this area. Please choose in-store collection or another area.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableDates.slice(0, 6).map(d => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(d.dateStr)}
                    className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer text-xs ${
                      selectedDateStr === d.dateStr
                        ? 'border-[#D7141A] bg-[#D7141A] text-white font-bold'
                        : 'border-[#333] bg-neutral-900 text-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    <div>{d.label}</div>
                    <div className="text-[10px] opacity-75">{d.dayName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Contact & Address */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              4. Customer Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Cell Number (e.g. 082 123 4567) *"
                  value={customerCell}
                  onChange={e => setCustomerCell(e.target.value)}
                  className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address (Optional, for digital receipt)"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
              />
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <textarea
                  required
                  rows={2}
                  placeholder={`Delivery Street Address & Suburb in ${selectedArea.name} *`}
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
                />
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Special butchery cutting or delivery notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-neutral-900 border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
              />
            </div>

            {/* POPIA Compliance Consent */}
            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={e => setMarketingOptIn(e.target.checked)}
                className="mt-0.5 rounded border-neutral-600 bg-neutral-900 text-[#D7141A] focus:ring-[#D7141A]"
              />
              <span className="text-[11px] text-neutral-400 leading-tight">
                Receive SMS / WhatsApp updates on Powermeat monthly specials & hamper promotions (POPIA compliant).
              </span>
            </label>
          </div>

          {/* Step 5: Payment Method */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              5. Payment Method
            </label>
            <div className="space-y-2">
              {/* Pay on Delivery/Collection */}
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-[#D7141A] bg-[#2A1617] text-white'
                    : 'border-[#333] bg-neutral-900 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#D7141A] focus:ring-[#D7141A]"
                  />
                  <Banknote size={18} className="text-[#FFC400]" />
                  <div>
                    <span className="text-sm font-bold block">
                      Pay on {deliveryType === 'delivery' ? 'Delivery' : 'Collection'}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Cash or Speedpoint Card Swipe with driver / counter
                    </span>
                  </div>
                </div>
              </label>

              {/* Bank EFT */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'eft'
                    ? 'border-[#D7141A] bg-[#2A1617] text-white'
                    : 'border-[#333] bg-neutral-900 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="eft"
                      checked={paymentMethod === 'eft'}
                      onChange={() => setPaymentMethod('eft')}
                      className="text-[#D7141A] focus:ring-[#D7141A]"
                    />
                    <FileText size={18} className="text-[#FFC400]" />
                    <div>
                      <span className="text-sm font-bold block">Direct Bank EFT</span>
                      <span className="text-[11px] text-neutral-400">
                        FNB Powermeat Welkom (Acc: 62891234567, Branch: 250655)
                      </span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'eft' && (
                  <div className="mt-3 pt-3 border-t border-[#3E2325] pl-6 text-xs text-neutral-300 space-y-2">
                    <p className="text-[11px] text-neutral-400">
                      Upload proof of payment now or WhatsApp it to 072 477 9314 with your order number.
                    </p>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={popUploadInputId}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded border border-[#444] cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Upload size={14} />
                        <span>Upload POP Screenshot</span>
                      </label>
                      <input
                        id={popUploadInputId}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handlePopFileUpload}
                        className="hidden"
                      />
                      {popFileUrl && (
                        <span className="text-emerald-400 text-xs font-bold">
                          ✓ File attached
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </label>

              {/* Online Card (PayFast/Yoco) Toggleable in Settings */}
              {settings.onlinePaymentEnabled ? (
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'online_card'
                      ? 'border-[#D7141A] bg-[#2A1617] text-white'
                      : 'border-[#333] bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="online_card"
                      checked={paymentMethod === 'online_card'}
                      onChange={() => setPaymentMethod('online_card')}
                      className="text-[#D7141A] focus:ring-[#D7141A]"
                    />
                    <CreditCard size={18} className="text-[#FFC400]" />
                    <div>
                      <span className="text-sm font-bold block">Online Card Payment</span>
                      <span className="text-[11px] text-neutral-400">
                        Visa, Mastercard & Instant EFT (PayFast / Yoco)
                      </span>
                    </div>
                  </div>
                </label>
              ) : null}
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="bg-neutral-900 rounded-xl p-4 border border-[#2D2D2D] space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Cart Subtotal</span>
              <span className="font-bold text-white">{formatZAR(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery Fee ({selectedArea.name})</span>
              <span className="font-bold text-white">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-400 font-extrabold">FREE</span>
                ) : (
                  formatZAR(deliveryFee)
                )}
              </span>
            </div>
            {isCartFreeDelivery && deliveryType === 'delivery' && (
              <p className="text-[11px] text-emerald-400 font-medium">
                🎉 Free delivery applied (Family Hamper / Meat Combo in cart)
              </p>
            )}
            <div className="pt-2 border-t border-[#333] flex justify-between items-baseline text-sm font-extrabold text-white">
              <span>Total Payable</span>
              <span className="text-xl text-[#FFC400] font-heading font-black">
                {formatZAR(finalTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Standard Place Order vs WhatsApp Order */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full bg-[#D7141A] hover:bg-[#ba0f14] active:bg-[#8F0A0E] text-white font-heading text-lg font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-red-950/40 transition cursor-pointer select-none"
            >
              <span>Place Order ({formatZAR(finalTotal)})</span>
              <ArrowRight size={18} />
            </button>

            {/* "Order via WhatsApp" alternative */}
            <button
              type="button"
              onClick={handleWhatsAppOrderSubmit}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa4f] text-white font-heading text-base font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition cursor-pointer select-none"
            >
              <MessageCircle size={20} className="fill-white" />
              <span>Order via WhatsApp (wa.me/27724779314)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
