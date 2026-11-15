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
      imageUrl: formImageUrl.trim() || undefined,
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
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Product & Hamper Management
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage butchery hampers, meat cuts, pricing types, stock statuses and bulk price updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Price Update Button */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-[#FFC400] border border-[#3E3E3E] text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <TrendingUp size={15} />
            <span>Bulk Price Update</span>
          </button>

          {/* Add Product */}
          <button
            onClick={handleOpenCreate}
            className="bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add Product</span>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-[#D7141A] text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
          className="bg-neutral-900 border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A] w-full sm:w-64"
        />
      </div>

      {/* Products Table */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-neutral-400 uppercase font-bold text-[11px] border-b border-[#2D2D2D]">
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
            <tbody className="divide-y divide-[#262626]">
              {filteredProducts.map(p => {
                const perKg = calcPricePerKg(p.price, p.weightKg);

                return (
                  <tr key={p.id} className="hover:bg-neutral-800/40 transition">
                    {/* Item */}
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-[#333]">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#D7141A] font-bold">
                            PM
                          </div>
                        )}
                      </div>
                      <div>
                        <strong className="text-white text-sm block">{p.name}</strong>
                        {p.isFreeDelivery && (
                          <span className="text-[9px] uppercase font-bold text-emerald-400">
                            Free Delivery
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category & SKU */}
                    <td className="py-3 px-4">
                      <span className="text-neutral-300 block font-semibold">{p.category}</span>
                      <span className="text-neutral-500 font-mono text-[10px]">{p.sku}</span>
                    </td>

                    {/* Pricing Type */}
                    <td className="py-3 px-4">
                      <span className="bg-neutral-800 text-neutral-300 uppercase text-[10px] px-2 py-0.5 rounded font-mono">
                        {p.pricingType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#FFC400] text-sm block">
                        {formatZAR(p.price)}
                      </span>
                      {p.originalPrice && (
                        <span className="line-through text-neutral-500 text-[10px]">
                          {formatZAR(p.originalPrice)}
                        </span>
                      )}
                    </td>

                    {/* Weight & Per-Kg */}
                    <td className="py-3 px-4">
                      <span className="text-white font-semibold block">
                        {p.weightKg ? `${p.weightKg}kg` : '-'}
                      </span>
                      {perKg && <span className="text-[#FFC400] text-[10px] font-bold">{perKg}</span>}
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                          p.stockStatus === 'in_stock'
                            ? 'bg-emerald-950 text-emerald-300'
                            : p.stockStatus === 'low_stock'
                            ? 'bg-amber-950 text-amber-300'
                            : p.stockStatus === 'out_of_stock'
                            ? 'bg-red-950 text-red-300'
                            : 'bg-neutral-800 text-neutral-500'
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
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer transition"
                        >
                          <Copy size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded cursor-pointer transition"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete (Owner only) */}
                        {currentUser?.role === 'owner' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 bg-neutral-800 hover:bg-red-900 text-red-400 rounded cursor-pointer transition"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-5 my-6 max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-heading text-xl font-bold uppercase text-white">
                {editingProductId ? 'Edit Product / Hamper' : 'Create New Butchery Product'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Pricing Type</label>
                  <select
                    value={formPricingType}
                    onChange={e => setFormPricingType(e.target.value as PricingType)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="per_kg">Per Kilogram (kg)</option>
                    <option value="per_bag">Per Bag</option>
                    <option value="per_bucket">Per Bucket</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Price (ZAR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              {/* HAMPER BUILDER: "What's Inside" Lines */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm uppercase text-[#FFC400]">
                      Hamper Contents Builder ("What's Inside")
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Auto-computes total weight and price per kg
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHamperLine}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Item Line</span>
                  </button>
                </div>

                {formHamperItems.length === 0 ? (
                  <p className="text-neutral-500 italic text-[11px]">
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
                          className="col-span-5 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-white text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={e =>
                            handleUpdateHamperLine(line.id, { quantity: parseInt(e.target.value) || 1 })
                          }
                          className="col-span-2 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Pack Size"
                          value={line.packSize}
                          onChange={e => handleUpdateHamperLine(line.id, { packSize: e.target.value })}
                          className="col-span-2 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-white text-xs"
                        />
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Kg"
                          value={line.weightKg}
                          onChange={e =>
                            handleUpdateHamperLine(line.id, { weightKg: parseFloat(e.target.value) || 0 })
                          }
                          className="col-span-2 bg-neutral-900 border border-neutral-700 rounded p-1.5 text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHamperLine(line.id)}
                          className="col-span-1 text-neutral-500 hover:text-red-400 p-1 text-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs text-neutral-300 font-bold">
                  <span>Calculated Hamper Weight: {calculatedHamperWeight}kg</span>
                  <span className="text-[#FFC400]">
                    Calculated Price/Kg: {calcPricePerKg(formPrice, calculatedHamperWeight) || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Stock Status</label>
                  <select
                    value={formStockStatus}
                    onChange={e => setFormStockStatus(e.target.value as StockStatus)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFreeDelivery}
                      onChange={e => setFormIsFreeDelivery(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-700 text-[#D7141A]"
                    />
                    <span className="font-bold text-white">Free Delivery Eligible</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold rounded-lg cursor-pointer"
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
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsBulkModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-neutral-900 text-white rounded-2xl border border-neutral-700 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-heading text-lg font-bold uppercase text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[#FFC400]" />
                <span>Bulk Price Adjustment</span>
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-neutral-300">
              Update multiple prices simultaneously (e.g. adjust all Beef items by 5% due to meat market changes).
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Target Category:</label>
                <select
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Percentage Change (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={bulkPercentage}
                  onChange={e => setBulkPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Live Preview List */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 max-h-48 overflow-y-auto space-y-2 text-xs">
              <span className="font-bold text-neutral-400 block mb-1 uppercase text-[10px]">
                Price Adjustment Preview:
              </span>
              {products
                .filter(p => bulkCategory === 'All' || p.category === bulkCategory || p.subCategory === bulkCategory)
                .slice(0, 5)
                .map(p => {
                  const updated = applyBulkPriceUpdate(p.price, bulkPercentage);
                  return (
                    <div key={p.id} className="flex justify-between py-1 border-b border-neutral-800 last:border-0">
                      <span className="truncate max-w-50">{p.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-neutral-500">{formatZAR(p.price)}</span>
                        <span>→</span>
                        <span className="font-bold text-[#FFC400]">{formatZAR(updated)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  bulkUpdatePrices(bulkCategory, bulkPercentage);
                  setIsBulkModalOpen(false);
                }}
                className="px-4 py-2 bg-[#D7141A] hover:bg-[#ba0f14] text-white text-xs font-bold rounded-lg cursor-pointer"
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
