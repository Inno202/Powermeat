import React, { useState, useId } from 'react';
import {
  X,
  Truck,
  Store,
  CreditCard,
  Banknote,
  FileText,
  MessageCircle,
  ArrowRight,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR, calculateDeliveryFee } from '../../utils/pricing';
import { getAvailableDates, createWhatsAppOrderLink } from '../../utils/delivery';
import { Order, OrderItem, PaymentMethod, DeliveryType } from '../../types';
import { toast } from '../ui/feedback';
import { LIMITS, cleanText, isValidCell, isValidEmail, uploadProblem } from '../../utils/validate';

type FieldErrors = Partial<Record<'name' | 'cell' | 'email' | 'address' | 'date' | 'pop', string>>;

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
    clearCart,
    account
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  // Only areas we currently deliver to are offered.
  // The store counter is kept as its own "area" (its own days, no fee). It is only
  // used for collection; delivery offers the towns we drive to.
  const isCollectionPoint = (a: { id: string; name: string }) => a.id === 'area-collection' || /collection/i.test(a.name);
  const activeAreas = deliveryAreas.some(a => a.active) ? deliveryAreas.filter(a => a.active) : deliveryAreas;
  const areaChoices = activeAreas.filter(a => !isCollectionPoint(a));
  const collectionPoint = activeAreas.find(isCollectionPoint) ?? {
    id: 'area-collection',
    name: 'Collection in store (145 Power Rd)',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    fee: 0,
    freeHamperThreshold: true,
    active: true
  };
  const [selectedAreaId, setSelectedAreaId] = useState<string>(() => {
    return areaChoices[0]?.id || 'area-welkom';
  });

  const selectedArea =
    deliveryType === 'collection'
      ? collectionPoint
      : areaChoices.find(a => a.id === selectedAreaId) || areaChoices[0] || collectionPoint;

  // Eligible delivery/collection dates
  const availableDates = getAvailableDates(
    selectedArea?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    settings.blockedDates,
    12
  );

  const [pickedDateStr, setSelectedDateStr] = useState<string>(() => {
    return availableDates[0]?.dateStr || '';
  });

  // If the area changes and the picked date no longer applies, fall back to the first open date.
  const selectedDateStr = availableDates.some(d => d.dateStr === pickedDateStr)
    ? pickedDateStr
    : availableDates[0]?.dateStr || '';

  // Customer contact info
  const [customerName, setCustomerName] = useState('');
  const [customerCell, setCustomerCell] = useState('');
  // A signed-in customer's orders are linked to their account by email.
  const [customerEmail, setCustomerEmail] = useState(account?.email ?? '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  // POPIA: marketing consent must be an active choice, so the box starts unticked.
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [popFileUrl, setPopFileUrl] = useState<string>('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState<false | 'web' | 'whatsapp'>(false);

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
    if (!file) return;
    const problem = uploadProblem(file);
    if (problem) {
      e.target.value = '';
      setPopFileUrl('');
      setErrors(prev => ({ ...prev, pop: problem }));
      return;
    }
    setErrors(prev => ({ ...prev, pop: undefined }));
    const reader = new FileReader();
    reader.onload = () => setPopFileUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const next: FieldErrors = {};
    if (cleanText(customerName, LIMITS.name).length < 2) next.name = 'Enter your full name.';
    if (!isValidCell(customerCell)) next.cell = 'Enter a South African cell number, for example 082 123 4567.';
    if (customerEmail.trim() && !isValidEmail(customerEmail.trim())) next.email = 'Check the email address, or leave it empty.';
    if (deliveryType === 'delivery' && cleanText(deliveryAddress, LIMITS.address).length < 5)
      next.address = `Enter your street address and suburb in ${selectedArea.name}.`;
    if (!selectedDateStr || !availableDates.some(d => d.dateStr === selectedDateStr))
      next.date = `Choose a ${deliveryType === 'delivery' ? 'delivery' : 'collection'} date.`;
    setErrors(next);
    const first = (['date', 'name', 'cell', 'email', 'address'] as const).find(k => next[k]);
    if (first) {
      window.setTimeout(() => document.getElementById(`checkout-${first}`)?.focus(), 0);
      return false;
    }
    return true;
  };

  const buildOrder = (source: 'web' | 'whatsapp') => ({
    customerName: cleanText(customerName, LIMITS.name),
    customerCell: cleanText(customerCell, LIMITS.cell),
    customerEmail: customerEmail.trim().toLowerCase() || undefined,
    deliveryType,
    area: selectedArea.name,
    deliveryAddress: deliveryType === 'delivery' ? cleanText(deliveryAddress, LIMITS.address) : undefined,
    deliveryDate: selectedDateStr,
    items: prepareOrderItems(),
    subtotal: cartSubtotal,
    deliveryFee,
    total: finalTotal,
    paymentMethod,
    paymentStatus: 'pending' as const,
    orderStatus: 'new' as const,
    source,
    notes: cleanText(notes, LIMITS.notes) || undefined,
    marketingOptIn,
    popUrl: popFileUrl || undefined
  });

  const placeOrder = async (source: 'web' | 'whatsapp') => {
    if (submitting || cart.length === 0 || !validateForm()) return;
    setSubmitting(source);
    const data = buildOrder(source);
    // Opened straight away so the browser does not block it as a pop-up.
    const waWindow = source === 'whatsapp' ? window.open('', '_blank') : null;
    try {
      const newOrder = await createOrder(data);
      if (source === 'whatsapp') {
        const waLink = createWhatsAppOrderLink(settings.whatsapp, {
          orderNumber: newOrder.id,
          customerName: data.customerName,
          customerCell: data.customerCell,
          deliveryType,
          area: data.area,
          deliveryAddress: data.deliveryAddress,
          deliveryDate: data.deliveryDate,
          items: data.items,
          subtotal: data.subtotal,
          deliveryFee,
          total: finalTotal,
          paymentMethod,
          notes: data.notes
        });
        if (waWindow) {
          waWindow.opener = null;
          waWindow.location.href = waLink;
        } else {
          window.open(waLink, '_blank', 'noopener,noreferrer');
        }
      }
      clearCart();
      onOrderComplete(newOrder);
    } catch (e) {
      console.error(e);
      waWindow?.close();
      toast(
        'Your order was not sent. Check your connection and try again, or order on WhatsApp on 072 477 9314.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder('web');
  };

  const handleWhatsAppOrderSubmit = () => placeOrder('whatsapp');

  const clearError = (key: keyof FieldErrors) =>
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const choiceClass = (on: boolean) =>
    `min-h-[56px] p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-colors ${
      on ? 'border-ink bg-white' : 'border-ink/15 bg-white/60 hover:border-ink/40'
    }`;
  const dateWord = deliveryType === 'delivery' ? 'Delivery' : 'Collection';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 modal-overlay flex items-start justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="sheet-in relative w-full max-w-md bg-paper text-ink rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-paper rounded-t-3xl flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-ink/10">
          <h2 id="checkout-title" className="display text-3xl">
            Checkout
          </h2>
          <button type="button" onClick={onClose} aria-label="Close checkout" className="icon-btn hover:bg-sand">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleStandardSubmit} noValidate className="px-4 sm:px-6 pt-4 pb-5 space-y-6">
          <fieldset>
            <legend className="field-label">How would you like to get your order?</legend>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                aria-pressed={deliveryType === 'delivery'}
                onClick={() => setDeliveryType('delivery')}
                className={choiceClass(deliveryType === 'delivery')}
              >
                <Truck size={22} className="shrink-0 text-brand-accent-deep" />
                <span>
                  <span className="block font-semibold">Delivery</span>
                  <span className="block text-sm text-ink-soft">Goldfields towns</span>
                </span>
              </button>
              <button
                type="button"
                aria-pressed={deliveryType === 'collection'}
                onClick={() => setDeliveryType('collection')}
                className={choiceClass(deliveryType === 'collection')}
              >
                <Store size={22} className="shrink-0 text-brand-accent-deep" />
                <span>
                  <span className="block font-semibold">Collect in store</span>
                  <span className="block text-sm text-ink-soft">145 Power Rd, free</span>
                </span>
              </button>
            </div>
          </fieldset>

          {deliveryType === 'delivery' ? (
          <div>
            <label htmlFor="checkout-area" className="field-label">
              Your town or suburb
            </label>
            <select
              id="checkout-area"
              value={selectedAreaId}
              onChange={e => setSelectedAreaId(e.target.value)}
              className="field"
            >
              {areaChoices.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.fee === 0 ? 'free delivery' : formatZAR(area.fee)})
                </option>
              ))}
            </select>
          </div>
          ) : (
            <p className="rounded-2xl bg-sand px-4 py-3">
              Collect from <strong>{settings.address}</strong> during trading hours. There is no delivery fee.
            </p>
          )}

          <fieldset>
            <legend className="field-label">{dateWord} date</legend>
            {availableDates.length === 0 ? (
              <p className="field-error">
                No dates are available for this area right now. Choose collection in store or another area.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableDates.slice(0, 6).map((d, i) => (
                  <button
                    key={d.dateStr}
                    id={i === 0 ? 'checkout-date' : undefined}
                    type="button"
                    aria-pressed={selectedDateStr === d.dateStr}
                    onClick={() => setSelectedDateStr(d.dateStr)}
                    className={`num min-h-[52px] py-1.5 px-1 rounded-2xl border text-center text-sm transition-colors ${
                      selectedDateStr === d.dateStr
                        ? 'border-ink bg-ink text-white'
                        : 'border-ink/15 bg-white/60 hover:border-ink/40'
                    }`}
                  >
                    <span className="block font-semibold">{d.label}</span>
                    <span className="block text-sm opacity-80">{d.dayName}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.date && <p className="field-error">{errors.date}</p>}
            <p className="field-help">Orders close at 12:00 noon the day before.</p>
          </fieldset>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="checkout-name" className="field-label">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  aria-invalid={!!errors.name}
                  value={customerName}
                  onChange={e => {
                    setCustomerName(e.target.value);
                    clearError('name');
                  }}
                  className="field"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="checkout-cell" className="field-label">
                  Cell number
                </label>
                <input
                  id="checkout-cell"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={LIMITS.cell}
                  placeholder="082 123 4567"
                  aria-invalid={!!errors.cell}
                  value={customerCell}
                  onChange={e => {
                    setCustomerCell(e.target.value);
                    clearError('cell');
                  }}
                  className="field num"
                />
                {errors.cell && <p className="field-error">{errors.cell}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="checkout-email" className="field-label">
                Email <span className="font-normal text-ink-soft">(optional, for a digital receipt)</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                autoComplete="email"
                maxLength={LIMITS.email}
                aria-invalid={!!errors.email}
                value={customerEmail}
                onChange={e => {
                    setCustomerEmail(e.target.value);
                    clearError('email');
                  }}
                className="field"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label htmlFor="checkout-address" className="field-label">
                  Street address and suburb in {selectedArea.name}
                </label>
                <textarea
                  id="checkout-address"
                  rows={2}
                  autoComplete="street-address"
                  maxLength={LIMITS.address}
                  aria-invalid={!!errors.address}
                  value={deliveryAddress}
                  onChange={e => {
                    setDeliveryAddress(e.target.value);
                    clearError('address');
                  }}
                  className="field"
                />
                {errors.address && <p className="field-error">{errors.address}</p>}
              </div>
            )}

            <div>
              <label htmlFor="checkout-notes" className="field-label">
                Cutting or delivery notes <span className="font-normal text-ink-soft">(optional)</span>
              </label>
              <input
                id="checkout-notes"
                type="text"
                maxLength={LIMITS.notes}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="field"
              />
            </div>

            <label className="flex items-start gap-3 min-h-[44px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={e => setMarketingOptIn(e.target.checked)}
                className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-brand-accent)]"
              />
              <span className="text-sm text-ink-soft">
                Receive SMS / WhatsApp updates on Powermeat monthly specials & hamper promotions (POPIA compliant).
              </span>
            </label>
          </div>

          <fieldset>
            <legend className="field-label">How would you like to pay?</legend>
            <div className="space-y-2.5">
              <label className={`${choiceClass(paymentMethod === 'cod')} cursor-pointer`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5 shrink-0 accent-[var(--color-brand-accent)]"
                />
                <Banknote size={22} className="shrink-0 text-ink-soft" />
                <span>
                  <span className="block font-semibold">Pay on {dateWord.toLowerCase()}</span>
                  <span className="block text-sm text-ink-soft">
                    Cash or Speedpoint card swipe with the driver or at the counter
                  </span>
                </span>
              </label>

              <div className={`${choiceClass(paymentMethod === 'eft')} flex-col !items-stretch`}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="eft"
                    checked={paymentMethod === 'eft'}
                    onChange={() => setPaymentMethod('eft')}
                    className="w-5 h-5 shrink-0 accent-[var(--color-brand-accent)]"
                  />
                  <FileText size={22} className="shrink-0 text-ink-soft" />
                  <span>
                    <span className="block font-semibold">Direct bank EFT</span>
                    <span className="num block text-sm text-ink-soft">
                      FNB Powermeat Welkom (Acc: 62891234567, Branch: 250655)
                    </span>
                  </span>
                </label>

                {paymentMethod === 'eft' && (
                  <div className="mt-3 pt-3 border-t border-ink/10 text-sm text-ink-soft">
                    <p>Upload proof of payment now or WhatsApp it to 072 477 9314 with your order number.</p>
                    <div className="mt-2 flex items-center flex-wrap gap-3">
                      <label htmlFor={popUploadInputId} className="btn btn-sm btn-outline cursor-pointer">
                        <Upload size={16} />
                        <span>Attach proof of payment</span>
                      </label>
                      <input
                        id={popUploadInputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handlePopFileUpload}
                        className="sr-only"
                      />
                      {popFileUrl && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <Check size={16} />
                          File attached
                        </span>
                      )}
                    </div>
                    {errors.pop ? (
                      <p className="field-error" role="alert">
                        {errors.pop}
                      </p>
                    ) : (
                      <p className="field-help">JPG, PNG, WebP or PDF, up to 2 MB.</p>
                    )}
                  </div>
                )}
              </div>

              {settings.onlinePaymentEnabled && (
                <label className={`${choiceClass(paymentMethod === 'online_card')} cursor-pointer`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online_card"
                    checked={paymentMethod === 'online_card'}
                    onChange={() => setPaymentMethod('online_card')}
                    className="w-5 h-5 shrink-0 accent-[var(--color-brand-accent)]"
                  />
                  <CreditCard size={22} className="shrink-0 text-ink-soft" />
                  <span>
                    <span className="block font-semibold">Online card payment</span>
                    <span className="block text-sm text-ink-soft">Visa, Mastercard & Instant EFT (PayFast / Yoco)</span>
                  </span>
                </label>
              )}
            </div>
          </fieldset>

          <dl className="panel p-5 space-y-2">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="num font-semibold">{formatZAR(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">
                {deliveryType === 'delivery' ? `Delivery to ${selectedArea.name}` : 'Collection in store'}
              </dt>
              <dd className="num font-semibold">
                {deliveryFee === 0 ? <span className="text-emerald-800">Free</span> : formatZAR(deliveryFee)}
              </dd>
            </div>
            {isCartFreeDelivery && deliveryType === 'delivery' && (
              <p className="text-sm text-emerald-800">Free delivery applied: a Family Hamper or Meat Combo is in your cart.</p>
            )}
            <div className="pt-3 border-t border-ink/10 flex justify-between items-baseline">
              <dt className="font-semibold">Total to pay</dt>
              <dd className="num display text-3xl">{formatZAR(finalTotal)}</dd>
            </div>
          </dl>

          <div className="space-y-2.5">
            <button type="submit" disabled={!!submitting || cart.length === 0} className="btn btn-accent btn-block">
              {submitting === 'web' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Placing your order</span>
                </>
              ) : (
                <>
                  <span className="num">Place order · {formatZAR(finalTotal)}</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleWhatsAppOrderSubmit}
              disabled={!!submitting || cart.length === 0}
              className="btn btn-whatsapp btn-block"
            >
              {submitting === 'whatsapp' ? <Loader2 size={20} className="animate-spin" /> : <MessageCircle size={20} />}
              <span>{submitting === 'whatsapp' ? 'Opening WhatsApp' : 'Order on WhatsApp instead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
