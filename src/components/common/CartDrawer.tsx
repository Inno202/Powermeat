import React, { useEffect } from 'react';
import { X, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR, calculateLineTotal } from '../../utils/pricing';
import { ProductPhoto } from '../ui/ProductPhoto';
import { QuantityStepper } from '../ui/QuantityStepper';
import { confirmAction } from '../ui/feedback';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    isCartFreeDelivery,
    isCartDrawerOpen,
    setIsCartDrawerOpen
  } = useStore();

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const close = () => setIsCartDrawerOpen(false);

  const handleEmpty = async () => {
    const ok = await confirmAction({
      title: 'Empty your cart?',
      message: 'Everything in your cart will be removed.',
      confirmLabel: 'Empty cart',
      tone: 'danger'
    });
    if (ok) clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="drawer-in fixed inset-y-0 right-0 w-full max-w-md bg-paper text-ink flex flex-col sm:rounded-l-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink/10">
          <h2 id="cart-title" className="display text-3xl">
            Your cart
          </h2>
          <button type="button" onClick={close} aria-label="Close cart" className="icon-btn hover:bg-sand">
            <X size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <p className="display text-3xl">Your cart is empty</p>
            <p className="text-ink-soft mt-2 max-w-xs">Add a meat combo, family hamper or one of this week's specials.</p>
            <button type="button" onClick={close} className="btn btn-primary mt-6">
              Browse the catalogue
            </button>
          </div>
        ) : (
          <>
            <p
              className={`mx-4 mt-4 rounded-2xl px-4 py-3 text-sm flex items-start gap-2.5 ${
                isCartFreeDelivery ? 'bg-emerald-50 text-emerald-900' : 'bg-sand text-ink'
              }`}
            >
              <Truck size={18} className="shrink-0 mt-0.5" />
              <span>
                {isCartFreeDelivery
                  ? 'Free delivery unlocked. Your order includes a Family Hamper or Meat Combo.'
                  : 'Add any Family Hamper or Meat Combo for free delivery.'}
              </span>
            </p>

            <ul className="flex-1 overflow-y-auto px-4 divide-y divide-ink/10">
              {cart.map((item, idx) => {
                const isPerKg = item.product.pricingType === 'per_kg';
                const lineTotal = calculateLineTotal(item.product.pricingType, item.product.price, item.quantity);
                const step = isPerKg ? 0.5 : 1;

                return (
                  <li key={`${item.product.id}-${item.selectedOption || ''}-${idx}`} className="py-4 flex gap-3.5">
                    <div className="relative w-20 h-20 rounded-2xl bg-sand shrink-0 overflow-hidden">
                      <ProductPhoto src={item.product.imageUrl} alt="" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug line-clamp-2">{item.product.name}</h3>
                          {item.selectedOption && <p className="text-sm text-ink-soft">{item.selectedOption}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.selectedOption)}
                          aria-label={`Remove ${item.product.name}`}
                          className="icon-btn -mt-2 -mr-2 text-ink-soft hover:text-brand-accent-deep hover:bg-sand"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <QuantityStepper
                          label={`Quantity of ${item.product.name}`}
                          value={item.quantity}
                          unit={isPerKg ? 'kg' : ''}
                          onDecrease={() =>
                            updateCartQuantity(
                              item.product.id,
                              Math.max(0, Math.round((item.quantity - step) * 10) / 10),
                              item.selectedOption
                            )
                          }
                          onIncrease={() =>
                            updateCartQuantity(
                              item.product.id,
                              Math.round((item.quantity + step) * 10) / 10,
                              item.selectedOption
                            )
                          }
                        />
                        <div className="text-right">
                          <span className="num font-semibold">{formatZAR(lineTotal)}</span>
                          {isPerKg && <p className="text-xs text-ink-soft">Estimated</p>}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="p-4 border-t border-ink/10 bg-white">
              <div className="flex items-baseline justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="num display text-3xl">{formatZAR(cartSubtotal)}</span>
              </div>
              <p className="text-sm text-ink-soft mt-1">The delivery fee is worked out at checkout from your area.</p>

              <button
                type="button"
                onClick={() => {
                  close();
                  onCheckout();
                }}
                className="btn btn-lg btn-accent btn-block mt-4"
              >
                <span>Go to checkout</span>
                <ArrowRight size={18} className="btn-arrow" />
              </button>

              <div className="flex justify-between items-center mt-1">
                <button type="button" onClick={handleEmpty} className="link font-medium text-sm">
                  Empty cart
                </button>
                <button type="button" onClick={close} className="link font-medium text-sm">
                  Keep shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
