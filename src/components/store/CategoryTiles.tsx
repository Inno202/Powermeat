import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ProductPhoto } from '../ui/ProductPhoto';

interface CategoryTilesProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  {
    id: 'Meat Combos',
    name: 'Meat Combos',
    subtitle: '10kg – 12.5kg value packs',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'Family Hampers',
    name: 'Family Hampers',
    subtitle: '10kg – 26.5kg butcher feast',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'Continental Hampers',
    name: 'Continental Hampers',
    subtitle: 'Traditional pork and braaimix',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'SASSA Hamper',
    name: 'SASSA Hamper',
    subtitle: 'Available to everyone, any time',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'Beke Le Beke',
    name: 'Beke Le Beke',
    subtitle: 'Weekly budget packs from R90',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'Bulk Meat',
    name: 'Bulk Meat & Deli',
    subtitle: 'Beef, pork, chicken, wors, fries',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80'
  }
];

export const CategoryTiles: React.FC<CategoryTilesProps> = ({ activeCategory, onSelectCategory }) => (
  <section className="py-16 md:py-20" aria-labelledby="categories-title">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 id="categories-title" className="display text-4xl sm:text-5xl mb-8">
        Hampers, combos and <span className="text-brand-accent">bulk meat</span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              className={`group lift text-left rounded-3xl overflow-hidden bg-white border ${
                isSelected ? 'border-brand-accent' : 'border-ink/[0.07]'
              }`}
            >
              <span className="relative block aspect-[4/3] bg-sand overflow-hidden">
                <ProductPhoto src={cat.image} alt="" className="photo-zoom" />
              </span>
              <span className="block p-3.5">
                <span className="display text-xl flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{cat.name}</span>
                  <ArrowRight size={16} className="shrink-0 mt-1 text-brand-accent-deep" />
                </span>
                <span className="block text-sm text-ink-soft mt-1 line-clamp-2">{cat.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);
