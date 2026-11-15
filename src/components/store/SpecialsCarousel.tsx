import React from 'react';
import { Flame, Clock, Plus, Tag } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR, calcPricePerKg } from '../../utils/pricing';
import { Product } from '../../types';

interface SpecialsCarouselProps {
  onSelectProduct: (product: Product) => void;
}

export const SpecialsCarousel: React.FC<SpecialsCarouselProps> = ({ onSelectProduct }) => {
  const { products, specials, addToCart } = useStore();

  // Find active specials
  const activeSpecials = specials.filter(s => s.active);

  // Collect products in active specials
  const specialProductIds = new Set(activeSpecials.flatMap(s => s.productIds));
  const activeSpecialProducts = products.filter(
    p => p.stockStatus !== 'hidden' && (p.isSpecial || specialProductIds.has(p.id))
  );

  return (
    <section className="bg-[#141414] py-8 border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#D7141A] rounded-md text-white">
              <Flame size={20} className="fill-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-wide text-white">
                Active Specials & Promos
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Limited time butcher cuts and bulk deals while stock lasts
              </p>
            </div>
          </div>
        </div>

        {activeSpecialProducts.length === 0 ? (
          <div className="bg-[#1C1C1C] rounded-xl p-8 text-center border border-[#2E2E2E]">
            <p className="text-base font-bold text-neutral-300">
              No specials running right now — check back at month end!
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Our master butchers are preparing fresh cuts for upcoming promotions.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
            {activeSpecialProducts.map(product => {
              const matchedSpecial = activeSpecials.find(s => s.productIds.includes(product.id));
              const badgeLabel = product.specialLabel || matchedSpecial?.label || 'Special Deal';
              const pricePerKg = calcPricePerKg(product.price, product.weightKg);

              return (
                <div
                  key={product.id}
                  className="w-72 sm:w-80 shrink-0 snap-start bg-[#1F1F1F] rounded-xl border border-[#333] hover:border-[#D7141A] transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  {/* Image container */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-4/3 bg-neutral-900 cursor-pointer overflow-hidden"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[#D7141A] font-display text-4xl italic">
                        POWERMEAT
                      </div>
                    )}

                    {/* Ribbon badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-[#D7141A] text-white text-[11px] font-extrabold px-2.5 py-1 rounded shadow-md uppercase tracking-wide flex items-center gap-1">
                        <Flame size={12} className="fill-white" />
                        <span>{badgeLabel}</span>
                      </span>
                    </div>

                    {/* Yellow price starburst */}
                    <div className="absolute bottom-2.5 right-2.5 price-starburst px-3 py-1 rounded-md text-sm font-extrabold shadow-lg">
                      {formatZAR(product.price)}
                      {product.pricingType === 'per_kg' && <span className="text-xs">/kg</span>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                        <span className="uppercase font-semibold tracking-wider">
                          {product.category}
                        </span>
                        {pricePerKg && (
                          <span className="text-[#FFC400] font-bold">{pricePerKg}</span>
                        )}
                      </div>
                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="text-base font-bold text-white group-hover:text-[#D7141A] transition-colors cursor-pointer truncate"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2C2C2C] flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Clock size={12} className="text-[#FFC400]" />
                        <span>While stock lasts</span>
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add to cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
