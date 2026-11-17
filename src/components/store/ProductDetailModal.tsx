import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../../types';
import { formatZAR, calcPricePerKg, calculateLineTotal } from '../../utils/pricing';
import { useStore } from '../../services/store';
import { ProductPhoto } from '../ui/ProductPhoto';
import { QuantityStepper } from '../ui/QuantityStepper';
import { PRICE_UNIT } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelated: (product: Product) => void;
  onNavigateCategory: (cat: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = props => {
  if (!props.product) return null;
  // Keyed by product so quantity and option reset when a related product is opened.
  return <ProductDetail key={props.product.id} {...props} product={props.product} />;
};

const ProductDetail: React.FC<ProductDetailModalProps & { product: Product }> = ({
  product,
  onClose,
  onSelectRelated,
  onNavigateCategory
}) => {
  const { products, addToCart } = useStore();

  const isPerKg = product.pricingType === 'per_kg';
  const step = isPerKg ? 0.5 : 1;
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<string>(
    product.options && product.options.length > 0 ? product.options[0] : ''
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pricePerKg = calcPricePerKg(product.price, product.weightKg);
  const estimatedTotal = calculateLineTotal(product.pricingType, product.price, quantity);
  const soldOut = product.stockStatus === 'out_of_stock';

  const related = products
    .filter(p => p.id !== product.id && p.category === product.category && p.stockStatus !== 'hidden')
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOption || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 modal-overlay flex items-start justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        className="sheet-in relative w-full max-w-md md:max-w-3xl bg-paper text-ink rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Stays in view while a long product is scrolled. */}
        <div className="sticky top-0 z-20 h-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product"
            className="icon-btn mt-3 mr-3 bg-white text-ink shadow-md hover:bg-sand"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-5">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6">
            <div>
              <div className="relative aspect-[16/10] md:aspect-square w-full rounded-[1.25rem] overflow-hidden bg-sand">
                <ProductPhoto product={product} alt={product.name} eager />
                {product.isFreeDelivery && (
                  <span className="badge bg-white text-ink absolute top-3 left-3">
                    Free delivery
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-2 px-1">Image varies from product</p>
            </div>

            <div className="flex flex-col px-2 pb-2 md:px-0 md:pt-8">
              <button
                type="button"
                onClick={() => {
                  onNavigateCategory(product.category);
                  onClose();
                }}
                className="link self-start text-sm text-brand-accent-deep"
              >
                {product.category}
              </button>

              <h2 id="product-title" className="display text-3xl sm:text-4xl">
                {product.name}
              </h2>

              <div className="mt-4 flex items-center flex-wrap gap-3">
                <span className="price-tag text-lg px-3.5 py-1">
                  {formatZAR(product.price)}
                  {PRICE_UNIT[product.pricingType] && (
                    <span className="text-sm font-semibold">{PRICE_UNIT[product.pricingType]}</span>
                  )}
                </span>
                <span className="num text-sm text-ink-soft">
                  {[product.weightKg ? `${product.weightKg}kg in total` : null, pricePerKg].filter(Boolean).join(' · ')}
                </span>
              </div>

              <p className="mt-3 text-sm text-ink-soft">{product.description}</p>

              {product.options && product.options.length > 0 && (
                <fieldset className="mt-5">
                  <legend className="field-label">How should we prepare it?</legend>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={selectedOption === opt}
                        onClick={() => setSelectedOption(opt)}
                        className={`btn btn-sm ${selectedOption === opt ? 'btn-primary hover:bg-ink' : 'btn-outline'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="font-semibold">{isPerKg ? 'Kilograms' : 'Quantity'}</span>
                <QuantityStepper
                  label={isPerKg ? 'Kilograms' : 'Quantity'}
                  value={quantity}
                  unit={isPerKg ? 'kg' : ''}
                  onDecrease={() => setQuantity(prev => Math.max(step, Math.round((prev - step) * 10) / 10))}
                  onIncrease={() => setQuantity(prev => Math.round((prev + step) * 10) / 10)}
                />
              </div>

              {isPerKg && (
                <p className="mt-3 text-sm text-ink-soft">
                  Estimated total <strong className="num text-ink">{formatZAR(estimatedTotal)}</strong>. The final price
                  is confirmed after weighing on the butcher scale.
                </p>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="btn btn-accent btn-block mt-5"
              >
                <span className="num">{soldOut ? 'Sold out' : `Add to cart · ${formatZAR(estimatedTotal)}`}</span>
              </button>

              <p className="mt-3 text-sm text-ink-soft">
                {product.isFreeDelivery ? 'This item qualifies for free delivery. ' : 'Standard area delivery rates apply. '}
                Order by <strong className="text-ink">12:00 noon</strong> the day before delivery or collection.
              </p>
            </div>
          </div>

          {product.hamperItems && product.hamperItems.length > 0 && (
            <section className="mt-6 px-2 md:px-0" aria-labelledby="inside-title">
              <h3 id="inside-title" className="display text-2xl mb-3">
                What's <span className="text-brand-accent">inside</span>
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-2 md:space-y-0">
                {product.hamperItems.map((item, idx) => (
                  <li key={item.id || idx}>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-6 px-2 pb-2 md:px-0" aria-labelledby="related-title">
              <h3 id="related-title" className="display text-2xl mb-3">
                More {product.category}
              </h3>
              <div className="flex flex-col gap-2 md:grid md:grid-cols-3">
                {related.map(rel => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectRelated(rel)}
                    className="panel rounded-2xl p-2 flex items-center gap-3 text-left hover:border-ink/30 transition-colors"
                  >
                    <span className="relative w-14 h-14 rounded-xl bg-sand shrink-0 overflow-hidden block">
                      <ProductPhoto product={rel} alt="" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold truncate">{rel.name}</span>
                      <span className="num block text-sm text-ink-soft">{formatZAR(rel.price)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
