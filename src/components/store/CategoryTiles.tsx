import React from 'react';
import { Package, Users, Compass, HeartHandshake, Zap, Beef } from 'lucide-react';

interface CategoryTilesProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const categories = [
    {
      id: 'Meat Combos',
      name: 'Meat Combos',
      subtitle: '10kg – 12.5kg Value Packs',
      icon: Package,
      freeDelivery: true,
      badge: 'FREE DELIVERY',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'Family Hampers',
      name: 'Family Hampers',
      subtitle: '10kg – 26.5kg Butcher Feast',
      icon: Users,
      freeDelivery: true,
      badge: 'FREE DELIVERY',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'Continental Hampers',
      name: 'Continental Hampers',
      subtitle: 'Traditional Pork & Braaimix',
      icon: Compass,
      freeDelivery: false,
      badge: 'BEST VALUE',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'SASSA Hamper',
      name: 'SASSA Hamper',
      subtitle: 'Available to everyone, any time',
      icon: HeartHandshake,
      freeDelivery: false,
      badge: 'COMMUNITY',
      image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'Beke Le Beke',
      name: 'Beke Le Beke',
      subtitle: 'Weekly budget packs from R90',
      icon: Zap,
      freeDelivery: false,
      badge: 'FROM R90',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'Bulk Meat',
      name: 'Bulk Meat & Deli',
      subtitle: 'Beef, Pork, Chicken, Wors, Fries',
      icon: Beef,
      freeDelivery: false,
      badge: 'PER KG / BAG',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <section className="py-8 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-wide text-white">
              Explore Our Butchery Hampers & Categories
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Select a category to filter our full range of fresh Free State meats
            </p>
          </div>
          {activeCategory !== 'All' && (
            <button
              onClick={() => onSelectCategory('All')}
              className="mt-2 sm:mt-0 text-xs font-bold text-[#FFC400] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Show All Products
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border text-left p-3.5 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#D7141A] bg-[#222222] ring-2 ring-[#D7141A]/50 shadow-lg'
                    : 'border-[#2D2D2D] bg-[#1A1A1A] hover:border-[#D7141A]/60 hover:bg-[#202020]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#D7141A] text-white' : 'bg-neutral-800 text-neutral-300 group-hover:text-white'
                      }`}
                    >
                      <cat.icon size={17} />
                    </div>
                    {cat.freeDelivery ? (
                      <span className="text-[9px] uppercase font-extrabold tracking-wider bg-red-950 text-red-200 border border-red-700/60 px-1.5 py-0.5 rounded">
                        FREE DEL
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-bold tracking-wider bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                        {cat.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-[#D7141A] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1 leading-snug">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#2B2B2B] flex items-center justify-between text-[11px] font-semibold text-neutral-400 group-hover:text-white">
                  <span>View cuts</span>
                  <span className="text-[#D7141A] font-bold">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
