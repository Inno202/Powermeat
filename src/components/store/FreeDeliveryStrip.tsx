import React, { useState } from 'react';
import { Truck, ChevronDown } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';

export const FreeDeliveryStrip: React.FC = () => {
  const { deliveryAreas } = useStore();
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  return (
    <section className="px-3 sm:px-4" aria-labelledby="free-delivery-title">
      <div className="max-w-7xl mx-auto rounded-3xl bg-charcoal text-white p-6 sm:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="shrink-0 w-12 h-12 rounded-full bg-brand-yellow text-ink flex items-center justify-center">
              <Truck size={24} />
            </span>
            <div>
              <h2 id="free-delivery-title" className="display text-3xl sm:text-4xl">
                Free delivery on any Family Hamper or <span className="text-brand-yellow">Meat Combo</span>
              </h2>
              <p className="mt-2 text-white/80">Order by 12:00 noon the day before delivery or collection.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            aria-expanded={isTableExpanded}
            className="btn btn-outline-light shrink-0"
          >
            <span>{isTableExpanded ? 'Hide delivery days' : 'See delivery days'}</span>
            <ChevronDown size={18} className={`transition-transform ${isTableExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isTableExpanded && (
          <div className="sheet-in mt-8 rounded-2xl bg-white text-ink p-2 sm:p-4 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[520px]">
              <thead>
                <tr className="text-ink-soft">
                  <th className="py-3 px-3 font-semibold">Area</th>
                  <th className="py-3 px-3 font-semibold">Delivery days</th>
                  <th className="py-3 px-3 font-semibold">Standard fee</th>
                  <th className="py-3 px-3 font-semibold text-right">With a hamper or combo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {deliveryAreas.filter(a => a.active).map(area => (
                  <tr key={area.id}>
                    <td className="py-3 px-3 font-semibold">{area.name}</td>
                    <td className="py-3 px-3 text-ink-soft">{area.days.join(', ')}</td>
                    <td className="py-3 px-3">{area.fee === 0 ? 'Free' : formatZAR(area.fee)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-800">Free</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
