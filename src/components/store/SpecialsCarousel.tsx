import React from 'react';
import { useStore } from '../../services/store';
import { formatZAR, calcPricePerKg } from '../../utils/pricing';
import { Product } from '../../types';
import { ProductPhoto } from '../ui/ProductPhoto';
import { PRICE_UNIT } from './ProductCard';

interface SpecialsCarouselProps {
  onSelectProduct: (product: Product) => void;
}

export const SpecialsCarousel: React.FC<SpecialsCarouselProps> = ({ onSelectProduct }) => {
  const { products, specials, addToCart } = useStore();

  const activeSpecials = specials.filter(s => s.active);
  const specialProductIds = new Set(activeSpecials.flatMap(s => s.productIds));
  const activeSpecialProducts = products.filter(
    p => p.stockStatus !== 'hidden' && (p.isSpecial || specialProductIds.has(p.id))
  );

  return (
    <section className="pt-16 md:pt-20" aria-labelledby="specials-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="specials-title" className="display text-4xl sm:text-5xl mb-8">
          This week's <span className="text-brand-accent">specials</span>
        </h2>

        {activeSpecialProducts.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="display text-2xl">No specials running right now</p>
            <p className="text-ink-soft mt-2">Check back at month end for the next butchery deals.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {activeSpecialProducts.map(product => {
              const matchedSpecial = activeSpecials.find(s => s.productIds.includes(product.id));
              const badgeLabel = product.specialLabel || matchedSpecial?.label || 'Special';
              const pricePerKg = calcPricePerKg(product.price, product.weightKg);

              return (
                <article
                  key={product.id}
                  className="group panel w-72 sm:w-80 shrink-0 snap-start overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    aria-label={`View ${product.name}`}
                    className="relative block aspect-[4/3] bg-sand overflow-hidden"
                  >
                    <ProductPhoto product={product} alt={product.name} className="photo-zoom" />
                    <span className="badge bg-brand-accent text-white absolute top-2.5 left-2.5">{badgeLabel}</span>
                    <span className="price-tag absolute bottom-2.5 right-2.5">
                      {formatZAR(product.price)}
                      {PRICE_UNIT[product.pricingType] && (
                        <span className="text-xs font-semibold">{PRICE_UNIT[product.pricingType]}</span>
                      )}
                    </span>
                  </button>

                  <div className="p-5 flex-1 flex flex-col">
                    <p className="num text-sm text-brand-accent-deep font-semibold">
                      {pricePerKg || product.category}
                    </p>
                    <h3 className="display text-2xl mt-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-ink-soft mt-1.5 line-clamp-2 flex-1">{product.description}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product, 1)}
                      className="btn btn-accent btn-block mt-4"
                    >
                      <span>Add to cart</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
