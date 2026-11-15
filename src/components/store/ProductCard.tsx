import React from 'react';
import { ShoppingCart, Flame, Truck, Scale } from 'lucide-react';
import { Product } from '../../types';
import { formatZAR, calcPricePerKg } from '../../utils/pricing';
import { useStore } from '../../services/store';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useStore();
  const pricePerKg = calcPricePerKg(product.price, product.weightKg);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Default quantity is 1 unit (or 1kg for per-kg items)
    const defaultQty = product.pricingType === 'per_kg' ? 1.0 : 1;
    const defaultOption = product.options && product.options.length > 0 ? product.options[0] : undefined;
    addToCart(product, defaultQty, defaultOption);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-[#1E1E1E] rounded-xl border border-[#2F2F2F] hover:border-[#D7141A] transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl"
    >
      <div>
        {/* Square Image container with badges */}
        <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            // Dark tile with bull-horn logo fallback for cards without photos
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1C1C] to-[#121212] p-4 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#D7141A] mb-2 opacity-80"
              >
                <path d="M 12,20 C 18,36 32,54 44,60 C 34,50 26,38 24,22 C 22,12 14,8 12,20 Z" fill="currentColor" />
                <path d="M 88,20 C 82,36 68,54 56,60 C 66,50 74,38 76,22 C 78,12 86,8 88,20 Z" fill="currentColor" />
                <path d="M 28,32 C 38,36 62,36 72,32 C 68,44 64,54 62,70 C 60,78 54,84 50,86 C 46,84 40,78 38,70 C 36,54 32,44 28,32 Z" stroke="currentColor" strokeWidth="6" fill="#141414" />
              </svg>
              <span className="font-display italic font-extrabold text-[#D7141A] text-lg">
                POWERMEAT
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                WELKOM
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
            {product.isSpecial && (
              <span className="bg-[#D7141A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1 uppercase tracking-wide">
                <Flame size={11} className="fill-white" />
                <span>{product.specialLabel || 'SPECIAL'}</span>
              </span>
            )}
            {product.isFreeDelivery && (
              <span className="bg-emerald-700/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center gap-1 uppercase tracking-wide">
                <Truck size={11} />
                <span>FREE DELIVERY</span>
              </span>
            )}
          </div>

          {/* Weight Badge if available */}
          {product.weightKg && (
            <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-xs text-neutral-200 border border-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Scale size={11} className="text-[#FFC400]" />
              <span>{product.weightKg}kg Total</span>
            </div>
          )}

          {/* Yellow Starburst Price Badge (Lower-Right) */}
          <div className="absolute bottom-2.5 right-2.5 price-starburst px-2.5 py-1 rounded-md text-xs sm:text-sm font-extrabold shadow-md flex items-baseline gap-1">
            {product.originalPrice && (
              <span className="line-through text-neutral-700 text-[10px] mr-0.5 font-normal">
                {formatZAR(product.originalPrice)}
              </span>
            )}
            <span>{formatZAR(product.price)}</span>
            {product.pricingType === 'per_kg' && (
              <span className="text-[10px] font-bold">/kg</span>
            )}
            {product.pricingType === 'per_bucket' && (
              <span className="text-[10px] font-bold">/bkt</span>
            )}
            {product.pricingType === 'per_bag' && (
              <span className="text-[10px] font-bold">/bag</span>
            )}
          </div>
        </div>

        {/* Card Details */}
        <div className="p-3 sm:p-4">
          {/* Small grey category label */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase font-semibold tracking-wider truncate">
              {product.category}
            </span>
            {pricePerKg && (
              <span className="text-[#FFC400] font-bold ml-1 shrink-0">
                {pricePerKg}
              </span>
            )}
          </div>

          {/* Bold product name */}
          <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-[#D7141A] transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>

          {/* Special note for SASSA Hamper */}
          {product.category === 'SASSA Hamper' && (
            <p className="mt-1 text-[10px] bg-neutral-800 text-[#FFC400] px-2 py-0.5 rounded font-medium">
              Available to everyone, any time of the month.
            </p>
          )}

          {/* Short description */}
          <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="p-3 sm:p-4 pt-0">
        <button
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to cart`}
          className="w-full bg-[#D7141A] hover:bg-[#ba0f14] active:bg-[#8F0A0E] text-white font-heading text-sm sm:text-base font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer select-none"
        >
          <ShoppingCart size={15} />
          <span>Add to cart</span>
        </button>
      </div>
    </div>
  );
};
