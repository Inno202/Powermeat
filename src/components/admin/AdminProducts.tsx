import React, { useState } from 'react';
import {
  Package,
  Plus,
  Copy,
  Trash2,
  Edit,
  TrendingUp,
  Scale,
  Sparkles,
  Layers,
  Percent,
  Check,
  X
} from 'lucide-react';
import { confirmAction, toast } from '../ui/feedback';
import { safeImageUrl } from '../../utils/validate';
import { useStore } from '../../services/store';
import { Product, PricingType, StockStatus, HamperItem } from '../../types';
import { formatZAR, calcPricePerKg, applyBulkPriceUpdate } from '../../utils/pricing';

export const AdminProducts: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    duplicateProduct,
    deleteProduct,
    bulkUpdatePrices,
    currentUser
  } = useStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit / Create Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('Family Hampers');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPricingType, setFormPricingType] = useState<PricingType>('fixed');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formWeightKg, setFormWeightKg] = useState<number>(0);
  const [formIsFreeDelivery, setFormIsFreeDelivery] = useState(false);
  const [formStockStatus, setFormStockStatus] = useState<StockStatus>('in_stock');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formTags, setFormTags] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formHamperItems, setFormHamperItems] = useState<HamperItem[]>([]);

  // Bulk Price Update Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('All');
  const [bulkPercentage, setBulkPercentage] = useState<number>(5);

  const categories = [
    'All',
    'Meat Combos',
    'Family Hampers',
    'Continental Hampers',
    'SASSA Hamper',
    'Beke Le Beke',
    'Bulk Meat',
    'Deli & Ham',
    'Bulk Packs',
    'Frozen & Extras'
  ];

  // Filter products
  const filteredProducts = products.filter(p => {
    if (activeCategoryFilter !== 'All' && p.category !== activeCategoryFilter && p.subCategory !== activeCategoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormName('');
    setFormSlug('');
    setFormCategory('Family Hampers');
    setFormSubCategory('');
    setFormSku(`PM-${Date.now().toString().slice(-4)}`);
    setFormDescription('');
    setFormPricingType('fixed');
    setFormPrice(999);
    setFormWeightKg(10);
    setFormIsFreeDelivery(true);
    setFormStockStatus('in_stock');
    setFormSortOrder(10);
    setFormTags('Hamper, Beef');
    setFormImageUrl('');
    setFormHamperItems([
      { id: 'h-1', name: 'Mince (4 × 500g)', quantity: 4, packSize: '500g', weightKg: 2 },
      { id: 'h-2', name: 'Boerewors (4 × 500g)', quantity: 4, packSize: '500g', weightKg: 2 }
    ]);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormCategory(p.category);
    setFormSubCategory(p.subCategory || '');
    setFormSku(p.sku);
    setFormDescription(p.description);
    setFormPricingType(p.pricingType);
    setFormPrice(p.price);
    setFormWeightKg(p.weightKg || 0);
    setFormIsFreeDelivery(p.isFreeDelivery);
    setFormStockStatus(p.stockStatus);
    setFormSortOrder(p.sortOrder);
    setFormTags(p.tags ? p.tags.join(', ') : '');
    setFormImageUrl(p.imageUrl || '');
    setFormHamperItems(p.hamperItems || []);
    setIsEditorOpen(true);
  };

  const handleAddHamperLine = () => {
    setFormHamperItems(prev => [
      ...prev,
      {
        id: `h-${Date.now()}`,
        name: 'Prime Cut (Pack)',
        quantity: 1,
        packSize: '1kg',
        weightKg: 1
      }
    ]);
  };

  const handleUpdateHamperLine = (id: string, updates: Partial<HamperItem>) => {
    setFormHamperItems(prev =>
      prev.map(it => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleRemoveHamperLine = (id: string) => {
    setFormHamperItems(prev => prev.filter(it => it.id !== id));
  };

  // Recalculate hamper weight
  const calculatedHamperWeight = formHamperItems.reduce((acc, it) => acc + (it.weightKg || 0), 0);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const productPayload = {
      name: formName.trim(),
      slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formCategory,
      subCategory: formSubCategory.trim() || undefined,
      sku: formSku.trim(),
      description: formDescription.trim(),
      pricingType: formPricingType,
      price: formPrice,
      weightKg: formHamperItems.length > 0 ? calculatedHamperWeight : formWeightKg,
      isFreeDelivery: formIsFreeDelivery,
      stockStatus: formStockStatus,
      sortOrder: formSortOrder,
      tags: tagArray,
      imageUrl: safeImageUrl(formImageUrl),
      hamperItems: formHamperItems.length > 0 ? formHamperItems : undefined
    };

    if (editingProductId) {
      updateProduct(editingProductId, productPayload);
    } else {
      addProduct(productPayload);
    }
    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="display text-3xl">
            Product & Hamper Management
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Manage butchery hampers, meat cuts, pricing types, stock statuses and bulk price updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Price Update Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn btn-sm btn-outline"
          >
            <TrendingUp size={15} />
            <span>Bulk Price Update</span>
          </button>

          {/* Add Product */}
          <button
            onClick={handleOpenCreate}
            className="btn btn-sm btn-accent"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 overflow-x-auto pb-1 flex gap-1.5 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`btn btn-sm shrink-0 whitespace-nowrap transition cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-brand-accent text-white'
                  : 'btn-outline'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search products or SKU..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="field w-full sm:w-64"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-hidden panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
              <tr>
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category & SKU</th>
                <th className="py-3.5 px-4">Pricing Type</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Weight & Per-Kg</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filteredProducts.map(p => {
                const perKg = calcPricePerKg(p.price, p.weightKg);

                return (
                  <tr key={p.id} className="hover:bg-sand/40 transition">
                    {/* Item */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-ink/10">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-brand-accent-deep font-bold">
                            PM
                          </div>
                        )}
                      </div>
                      <div>
                        <strong className="text-ink text-sm block">{p.name}</strong>
                        {p.isFreeDelivery && (
                          <span className="text-sm font-bold text-emerald-800">
                            Free Delivery
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category & SKU */}
                    <td className="py-3 px-4">
                      <span className="text-ink-soft block font-semibold">{p.category}</span>
                      <span className="text-ink-soft num text-sm">{p.sku}</span>
                    </td>

                    {/* Pricing Type */}
                    <td className="py-3 px-4">
                      <span className="bg-sand text-ink-soft text-sm px-2 py-0.5 rounded num">
                        {p.pricingType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-brand-yellow-deep text-sm block">
                        {formatZAR(p.price)}
                      </span>
                      {p.originalPrice && (
                        <span className="line-through text-ink-soft text-sm">
                          {formatZAR(p.originalPrice)}
                        </span>
                      )}
                    </td>

                    {/* Weight & Per-Kg */}
                    <td className="py-3 px-4">
                      <span className="text-ink font-semibold block">
                        {p.weightKg ? `${p.weightKg}kg` : '-'}
                      </span>
                      {perKg && <span className="text-brand-yellow-deep text-sm font-bold">{perKg}</span>}
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-bold px-2 py-0.5 rounded ${
                          p.stockStatus === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-800'
                            : p.stockStatus === 'low_stock'
                            ? 'bg-amber-50 text-amber-800'
                            : p.stockStatus === 'out_of_stock'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-sand text-ink-soft'
                        }`}
                      >
                        {p.stockStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Duplicate Product */}
                        <button
                          onClick={() => duplicateProduct(p.id)}
                          title="Duplicate Hamper (Quick Clone)"
                          className="icon-btn bg-sand hover:bg-sand text-ink-soft cursor-pointer transition"
                        >
                          <Copy size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="icon-btn bg-sand hover:bg-sand text-ink cursor-pointer transition"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete (Owner only) */}
                        {currentUser?.role === 'owner' && (
                          <button
                            onClick={async () => {
                              const ok = await confirmAction({
                                title: `Delete ${p.name}?`,
                                message: 'It will be removed from the website and the catalogue. Past orders keep their record of it.',
                                confirmLabel: 'Delete product',
                                tone: 'danger'
                              });
                              if (ok) {
                                deleteProduct(p.id);
                                toast(`${p.name} deleted`);
                              }
                            }}
                            aria-label={`Delete ${p.name}`}
                            title="Delete product"
                            className="icon-btn bg-sand hover:bg-red-50 text-red-800 cursor-pointer transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PRODUCT & HAMPER BUILDER EDITOR */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl text-ink p-6 space-y-5 my-6 max-h-[88vh] overflow-y-auto panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="display text-2xl">
                {editingProductId ? 'Edit Product / Hamper' : 'Create New Butchery Product'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-ink-soft hover:text-ink"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="field w-full"
                  />
                </div>
                <div>
                  <label className="field-label">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="field w-full num"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="field w-full"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">Pricing Type</label>
                  <select
                    value={formPricingType}
                    onChange={e => setFormPricingType(e.target.value as PricingType)}
                    className="field w-full"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="per_kg">Per Kilogram (kg)</option>
                    <option value="per_bag">Per Bag</option>
                    <option value="per_bucket">Per Bucket</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Price (ZAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="field w-full num"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Short Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="field w-full"
                />
              </div>

              {/* HAMPER BUILDER: "What's Inside" Lines */}
              <div className="bg-paper p-4 rounded-xl border border-ink/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="display text-brand-yellow-deep text-xl">
                      Hamper Contents Builder ("What's Inside")
                    </h4>
                    <p className="text-sm text-ink-soft">
                      Auto-computes total weight and price per kg
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHamperLine}
                    className="btn btn-sm btn-outline"
                  >
                    <Plus size={13} />
                    <span>Add Item Line</span>
                  </button>
                </div>

                {formHamperItems.length === 0 ? (
                  <p className="text-ink-soft text-sm">
                    No hamper breakdown lines. Enter simple total weight below for non-hamper products.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formHamperItems.map((line, idx) => (
                      <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Item Name (e.g. Mince 4 × 500g)"
                          value={line.name}
                          onChange={e => handleUpdateHamperLine(line.id, { name: e.target.value })}
                          className="field col-span-5"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={e =>
                            handleUpdateHamperLine(line.id, { quantity: parseInt(e.target.value) || 1 })
                          }
                          className="field col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Pack Size"
                          value={line.packSize}
                          onChange={e => handleUpdateHamperLine(line.id, { packSize: e.target.value })}
                          className="field col-span-2"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Kg"
                          value={line.weightKg}
                          onChange={e =>
                            handleUpdateHamperLine(line.id, { weightKg: parseFloat(e.target.value) || 0 })
                          }
                          className="field col-span-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHamperLine(line.id)}
                          className="icon-btn col-span-1 text-ink-soft hover:text-red-800 text-center"
                        ><X size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-ink/10 flex justify-between text-sm text-ink-soft font-bold">
                  <span>Calculated Hamper Weight: {calculatedHamperWeight}kg</span>
                  <span className="text-brand-yellow-deep">
                    Calculated Price/Kg: {calcPricePerKg(formPrice, calculatedHamperWeight) || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label">Stock Status</label>
                  <select
                    value={formStockStatus}
                    onChange={e => setFormStockStatus(e.target.value as StockStatus)}
                    className="field w-full"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    maxLength={500}
                    pattern="https://.*"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="field w-full"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFreeDelivery}
                      onChange={e => setFormIsFreeDelivery(e.target.checked)}
                      className="rounded bg-paper border-ink/10 text-brand-accent-deep"
                    />
                    <span className="font-bold text-ink">Free Delivery Eligible</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="field-label">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="btn btn-sm btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-accent"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK PRICE UPDATE MODAL WITH PREVIEW */}
      {isBulkModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsBulkModalOpen(false)}
        >
          <div
            className="w-full max-w-lg text-ink p-6 space-y-4 panel"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <h3 className="display flex items-center gap-2 text-2xl">
                <TrendingUp size={18} className="text-brand-yellow-deep" />
                <span>Bulk Price Adjustment</span>
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 text-ink-soft hover:text-ink"><X size={18} /></button>
            </div>

            <p className="text-sm text-ink-soft">
              Update multiple prices simultaneously (e.g. adjust all Beef items by 5% due to meat market changes).
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="field-label">Target Category:</label>
                <select
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value)}
                  className="field w-full"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Percentage Change (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={bulkPercentage}
                  onChange={e => setBulkPercentage(parseFloat(e.target.value) || 0)}
                  className="field w-full num"
                />
              </div>
            </div>

            {/* Live Preview List */}
            <div className="bg-paper p-3 rounded-xl border border-ink/10 max-h-48 overflow-y-auto space-y-2 text-sm">
              <span className="font-bold text-ink-soft block mb-1 text-sm">
                Price Adjustment Preview:
              </span>
              {products
                .filter(p => bulkCategory === 'All' || p.category === bulkCategory || p.subCategory === bulkCategory)
                .slice(0, 5)
                .map(p => {
                  const updated = applyBulkPriceUpdate(p.price, bulkPercentage);
                  return (
                    <div key={p.id} className="flex justify-between py-1 border-b border-ink/10 last:border-0">
                      <span className="truncate max-w-50">{p.name}</span>
                      <div className="flex items-center gap-2 num">
                        <span className="text-ink-soft">{formatZAR(p.price)}</span>
                        <span>→</span>
                        <span className="font-bold text-brand-yellow-deep">{formatZAR(updated)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="btn btn-sm btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdatePrices(bulkCategory, bulkPercentage);
                  setIsBulkModalOpen(false);
                }}
                className="btn btn-sm btn-accent"
              >
                Apply Bulk Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
