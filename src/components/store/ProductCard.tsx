import React from 'react';
import { Product } from '../../types';
import { formatZAR, calcPricePerKg } from '../../utils/pricing';
import { useStore } from '../../services/store';
import { ProductPhoto } from '../ui/ProductPhoto';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const PRICE_UNIT: Record<string, string> = {
  per_kg: '/kg',
  per_bucket: '/bucket',
  per_bag: '/bag'
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useStore();
  const pricePerKg = calcPricePerKg(product.price, product.weightKg);
  const soldOut = product.stockStatus === 'out_of_stock';

  const handleQuickAdd = () => {
    const defaultQty = product.pricingType === 'per_kg' ? 1.0 : 1;
    const defaultOption = product.options && product.options.length > 0 ? product.options[0] : undefined;
    addToCart(product, defaultQty, defaultOption);
  };

  return (
    <article className="group panel lift overflow-hidden flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] w-full bg-sand overflow-hidden text-left"
      >
        <ProductPhoto product={product} alt={product.name} className="photo-zoom" />

        <span className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.isSpecial && (
            <span className="badge bg-brand-accent text-white">{product.specialLabel || 'Special'}</span>
          )}
          {product.isFreeDelivery && (
            <span className="badge bg-white text-ink">
              Free delivery
            </span>
          )}
          {soldOut && <span className="badge bg-ink text-white">Sold out</span>}
        </span>

        <span className="price-tag absolute bottom-2.5 right-2.5">
          {product.originalPrice && (
            <span className="line-through font-normal text-xs text-ink/70">{formatZAR(product.originalPrice)}</span>
          )}
          <span>{formatZAR(product.price)}</span>
          {PRICE_UNIT[product.pricingType] && (
            <span className="text-xs font-semibold">{PRICE_UNIT[product.pricingType]}</span>
          )}
        </span>
      </button>

      <div className="p-3.5 sm:p-5 flex-1 flex flex-col">
        <p className="num text-xs sm:text-sm text-brand-accent-deep font-semibold truncate">
          {[product.weightKg ? `${product.weightKg}kg` : null, pricePerKg].filter(Boolean).join(' · ') ||
            product.category}
        </p>
        <h3 className="display text-xl sm:text-2xl mt-1 line-clamp-1">{product.name}</h3>
        <p className="mt-1.5 text-sm text-ink-soft line-clamp-2 flex-1">{product.description}</p>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={soldOut}
          aria-label={`Add ${product.name} to cart`}
          className="btn btn-accent btn-block mt-4 px-3"
        >
          <span>{soldOut ? 'Sold out' : 'Add to cart'}</span>
        </button>
      </div>
    </article>
  );
};
