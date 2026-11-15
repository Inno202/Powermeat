import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR, calculateLineTotal } from '../../utils/pricing';

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

  if (!isCartDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCartDrawerOpen(false)}
    >
      <div
        className="fixed inset-y-0 right-0 flex max-w-full pl-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#1A1A1A] text-neutral-100 flex flex-col shadow-2xl border-l border-[#2E2E2E]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2E2E2E] bg-[#111111]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#D7141A]" size={22} />
              <h2 className="text-xl font-bold font-heading uppercase tracking-wide">
                Your Butchery Cart
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              aria-label="Close Cart"
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          {/* Free Delivery Banner */}
          <div
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b ${
              isCartFreeDelivery
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                : 'bg-neutral-800/80 border-neutral-700 text-neutral-300'
            }`}
          >
            <Truck size={16} className={isCartFreeDelivery ? 'text-emerald-400' : 'text-[#FFC400]'} />
            <div>
              {isCartFreeDelivery ? (
                <span>
                  <strong className="text-white">FREE DELIVERY UNLOCKED!</strong> Your order includes a Family Hamper or Meat Combo.
                </span>
              ) : (
                <span>
                  Add any <strong className="text-[#FFC400]">Family Hamper</strong> or <strong className="text-[#FFC400]">Meat Combo</strong> for Free Delivery!
                </span>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 divide-y divide-[#2B2B2B]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag size={54} className="text-neutral-600 mb-3" />
                <p className="text-lg font-bold text-neutral-200">Your cart is empty</p>
                <p className="text-sm text-neutral-400 mt-1 max-w-xs">
                  Browse our fresh meat combos, family hampers and daily specials to fill your basket.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-6 bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold px-6 py-2.5 rounded-lg text-sm transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const lineTotal = calculateLineTotal(
                  item.product.pricingType,
                  item.product.price,
                  item.quantity
                );
                const step = item.product.pricingType === 'per_kg' ? 0.5 : 1;
                const unitSuffix = item.product.pricingType === 'per_kg' ? 'kg' : '';

                return (
                  <div key={`${item.product.id}-${item.selectedOption || ''}-${idx}`} className="py-3 flex gap-3">
                    {/* Item thumbnail */}
                    <div className="w-16 h-16 rounded-md bg-neutral-800 shrink-0 overflow-hidden border border-[#333]">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[#D7141A] font-bold text-xs">
                          PM
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="text-xs text-neutral-400 uppercase font-semibold">
                            {item.product.category}
                          </p>
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          {item.selectedOption && (
                            <span className="inline-block text-[11px] bg-neutral-800 text-[#FFC400] px-1.5 py-0.2 rounded font-medium mt-0.5">
                              {item.selectedOption}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedOption)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#3A3A3A] rounded bg-neutral-900">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                Math.max(0, Math.round((item.quantity - step) * 10) / 10),
                                item.selectedOption
                              )
                            }
                            aria-label="Decrease quantity"
                            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-2 text-xs font-bold min-w-10 text-center">
                            {item.quantity}
                            {unitSuffix}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                Math.round((item.quantity + step) * 10) / 10,
                                item.selectedOption
                              )
                            }
                            aria-label="Increase quantity"
                            className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="text-right">
                          <span className="font-extrabold text-sm text-[#FFC400]">
                            {formatZAR(lineTotal)}
                          </span>
                          {item.product.pricingType === 'per_kg' && (
                            <p className="text-[10px] text-neutral-400">Est. total</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-[#2E2E2E] bg-[#111111] space-y-3">
              <div className="flex items-center justify-between text-neutral-300 text-sm">
                <span>Subtotal</span>
                <span className="font-extrabold text-xl text-white">
                  {formatZAR(cartSubtotal)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Delivery fee calculated at checkout based on selected area.
              </p>

              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onCheckout();
                }}
                className="w-full bg-[#D7141A] hover:bg-[#ba0f14] text-white font-heading text-lg font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex justify-between items-center pt-1 text-xs text-neutral-400">
                <button
                  onClick={clearCart}
                  className="text-neutral-400 hover:text-red-400 underline cursor-pointer"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="hover:underline cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
