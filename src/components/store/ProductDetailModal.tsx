import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Scale,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Product } from '../../types';
import { formatZAR, calcPricePerKg, calculateLineTotal } from '../../utils/pricing';
import { useStore } from '../../services/store';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectRelated: (product: Product) => void;
  onNavigateCategory: (cat: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectRelated,
  onNavigateCategory
}) => {
  const { products, addToCart, deliveryAreas } = useStore();
  const [activeTab, setActiveTab] = useState<'description' | 'delivery' | 'reviews'>('description');

  if (!product) return null;

  const isPerKg = product.pricingType === 'per_kg';
  const initialQty = isPerKg ? 1.0 : 1;
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [selectedOption, setSelectedOption] = useState<string>(
    product.options && product.options.length > 0 ? product.options[0] : ''
  );

  const pricePerKg = calcPricePerKg(product.price, product.weightKg);
  const step = isPerKg ? 0.5 : 1;
  const estimatedTotal = calculateLineTotal(product.pricingType, product.price, quantity);

  // Related products from same category
  const related = products
    .filter(p => p.id !== product.id && p.category === product.category && p.stockStatus !== 'hidden')
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOption || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#1A1A1A] text-neutral-100 rounded-2xl border border-[#333] shadow-2xl overflow-hidden my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Product View"
          className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black text-white p-2 rounded-full border border-neutral-700 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-4 sm:p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4 flex-wrap">
            <button
              onClick={onClose}
              className="hover:text-white transition cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-neutral-600" />
            <button
              onClick={() => {
                onNavigateCategory(product.category);
                onClose();
              }}
              className="text-[#D7141A] font-semibold hover:underline cursor-pointer"
            >
              {product.category}
            </button>
            <ChevronRight size={13} className="text-neutral-600" />
            <span className="text-neutral-300 font-medium truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Main Content Grid: Image on left, Info on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left: Large Image with caption */}
            <div className="space-y-2">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-[#2D2D2D]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1E1E] to-[#121212] text-center p-6">
                    <span className="font-display italic text-[#D7141A] text-4xl">POWERMEAT</span>
                    <span className="text-xs text-neutral-400 mt-1">Welkom Quality Butcher</span>
                  </div>
                )}

                {/* Overlay Caption: "Image varies from product" */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-neutral-300 text-[10px] px-2.5 py-1 rounded">
                  Image varies from product
                </div>

                {/* Free Delivery Chip */}
                {product.isFreeDelivery && (
                  <div className="absolute top-3 left-3 bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded shadow uppercase flex items-center gap-1">
                    <Truck size={13} />
                    <span>Free Delivery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info, Price, Quantity & Add to Cart */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <button
                  onClick={() => {
                    onNavigateCategory(product.category);
                    onClose();
                  }}
                  className="text-xs uppercase font-extrabold tracking-wider text-[#D7141A] hover:underline"
                >
                  {product.category}
                </button>

                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white uppercase mt-1 leading-tight">
                  {product.name}
                </h1>

                {/* Large Price and Per-Kg */}
                <div className="mt-3 flex items-baseline gap-3">
                  <div className="price-starburst px-3 py-1 rounded-md text-xl sm:text-2xl font-extrabold inline-block">
                    {formatZAR(product.price)}
                    {isPerKg && <span className="text-sm font-bold">/kg</span>}
                    {product.pricingType === 'per_bucket' && <span className="text-sm font-bold">/bkt</span>}
                    {product.pricingType === 'per_bag' && <span className="text-sm font-bold">/bag</span>}
                  </div>

                  {pricePerKg && (
                    <span className="text-sm font-bold text-[#FFC400]">
                      ({pricePerKg})
                    </span>
                  )}
                </div>

                {/* One line description */}
                <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                  {product.description}
                </p>

                {/* Option selector if applicable (e.g. Pork Knuckle: Whole vs Sliced) */}
                {product.options && product.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#2C2C2C]">
                    <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wide">
                      Select Butchery Preparation:
                    </label>
                    <div className="flex gap-2">
                      {product.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSelectedOption(opt)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            selectedOption === opt
                              ? 'bg-[#D7141A] text-white border-[#D7141A]'
                              : 'bg-neutral-800 text-neutral-300 border-[#3A3A3A] hover:border-neutral-500'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper & Per-Kg handling */}
                <div className="mt-5 p-4 rounded-xl bg-neutral-900 border border-[#2B2B2B]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide block">
                        {isPerKg ? 'Quantity (Kilograms):' : 'Order Quantity:'}
                      </span>
                      {isPerKg && (
                        <span className="text-[11px] text-[#FFC400] font-medium">
                          0.5kg steps
                        </span>
                      )}
                    </div>

                    <div className="flex items-center border border-[#3E3E3E] rounded-lg bg-[#181818]">
                      <button
                        onClick={() =>
                          setQuantity(prev => Math.max(step, Math.round((prev - step) * 10) / 10))
                        }
                        aria-label="Decrease quantity"
                        className="p-2 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 text-sm font-extrabold min-w-14 text-center">
                        {quantity}
                        {isPerKg ? 'kg' : ''}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(prev => Math.round((prev + step) * 10) / 10)
                        }
                        aria-label="Increase quantity"
                        className="p-2 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {isPerKg && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Estimated Total:</span>
                      <span className="font-extrabold text-base text-[#FFC400]">
                        {formatZAR(estimatedTotal)}
                      </span>
                    </div>
                  )}

                  {isPerKg && (
                    <p className="mt-2 text-[11px] text-neutral-400 italic bg-neutral-800/60 p-2 rounded">
                      *Note: Final price confirmed after butchery weighing on butcher scale.
                    </p>
                  )}
                </div>
              </div>

              {/* Big Solid Red Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#D7141A] hover:bg-[#ba0f14] active:bg-[#8F0A0E] text-white font-heading text-lg font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-red-950/40 transition cursor-pointer select-none"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart ({formatZAR(estimatedTotal)})</span>
              </button>

              {/* Meta Row: SKU, Category, Tags */}
              <div className="pt-2 border-t border-[#2B2B2B] text-xs text-neutral-400 space-y-1">
                <p>
                  <strong className="text-neutral-300">SKU:</strong> {product.sku}
                </p>
                <p>
                  <strong className="text-neutral-300">Category:</strong> {product.category}
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center pt-0.5">
                    <strong className="text-neutral-300">Tags:</strong>
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section: Description ("What's inside"), Delivery, Reviews */}
          <div className="mt-8 pt-6 border-t border-[#2C2C2C]">
            <div className="flex border-b border-[#333] gap-4 sm:gap-8">
              {[
                { id: 'description', label: "What's Inside / Description" },
                { id: 'delivery', label: 'Delivery & Schedules' },
                { id: 'reviews', label: 'Reviews (0)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-bold uppercase tracking-wide transition cursor-pointer border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#D7141A] text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-4 text-sm">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  {product.hamperItems && product.hamperItems.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-bold text-[#FFC400] mb-2 uppercase tracking-wide">
                        What's Inside This Pack ({product.weightKg ? `${product.weightKg}kg total` : 'Bulk'}):
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                        {product.hamperItems.map((item, idx) => (
                          <li
                            key={item.id || idx}
                            className="bg-neutral-900/80 p-2.5 rounded-lg border border-[#2D2D2D] flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} className="text-[#D7141A] shrink-0" />
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-neutral-300">{product.description}</p>
                  )}
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-3 text-neutral-300">
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="font-bold text-white block mb-1">
                      {product.isFreeDelivery
                        ? '✅ Eligible for 100% Free Delivery'
                        : 'Standard Area Delivery Rates Apply'}
                    </span>
                    <p className="text-xs text-neutral-400">
                      Deliveries run Monday to Saturday across Welkom, Thabong, Bronville, Riebeekstad, Virginia, Odendaalsrus, Theunissen / Bloemfontein, and Kroonstad.
                    </p>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Cut-off for all deliveries and collections is strictly <strong>12:00 noon</strong> the day before.
                  </p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="py-6 text-center text-neutral-400">
                  <p>There are no customer reviews yet for this cut.</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Be the first Welkom customer to review this hamper!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Grid */}
          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#2C2C2C]">
              <h4 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-3">
                Related Products in {product.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="p-3 bg-neutral-900 rounded-xl border border-[#2D2D2D] hover:border-[#D7141A] transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-md bg-neutral-800 shrink-0 overflow-hidden">
                      {rel.imageUrl ? (
                        <img src={rel.imageUrl} alt={rel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#D7141A] font-bold">
                          PM
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate">{rel.name}</h5>
                      <span className="text-xs font-extrabold text-[#FFC400]">
                        {formatZAR(rel.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
