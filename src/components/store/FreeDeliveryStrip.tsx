import React, { useState } from 'react';
import { Truck, Calendar, Clock, ChevronDown, ChevronUp, MapPin, CheckCircle } from 'lucide-react';
import { useStore } from '../../services/store';

export const FreeDeliveryStrip: React.FC = () => {
  const { deliveryAreas } = useStore();
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  return (
    <section className="bg-gradient-to-r from-[#8F0A0E] via-[#D7141A] to-[#8F0A0E] text-white py-4 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-full shrink-0">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-wide">
                  FREE DELIVERY ON ANY FAMILY HAMPER & MEAT COMBO!
                </span>
                <span className="bg-[#FFC400] text-black text-[11px] font-extrabold px-2 py-0.5 rounded shadow">
                  SAVE UP TO R80
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-100 flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                <Clock size={14} className="text-[#FFC400]" />
                <span>Order by 12:00 noon the day before delivery or collection</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="inline-flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-white/30 transition cursor-pointer shrink-0"
          >
            <Calendar size={14} />
            <span>{isTableExpanded ? 'Hide Delivery Days' : 'View Area Delivery Days'}</span>
            {isTableExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Area Schedule Table */}
        {isTableExpanded && (
          <div className="mt-4 pt-4 border-t border-white/20 overflow-x-auto">
            <div className="bg-neutral-900/90 rounded-xl p-4 text-neutral-100 border border-neutral-700 shadow-xl max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-[#FFC400] flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>Goldfields & Central Free State Delivery Schedule</span>
                </span>
                <span className="text-neutral-400">Order cutoff: 12h00 day before</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-700 text-neutral-400 font-bold uppercase">
                      <th className="py-2 px-3">Area / Town</th>
                      <th className="py-2 px-3">Scheduled Delivery Days</th>
                      <th className="py-2 px-3">Standard Fee</th>
                      <th className="py-2 px-3 text-right">With Hamper/Combo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {deliveryAreas.map(area => (
                      <tr key={area.id} className="hover:bg-neutral-800/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {area.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded font-mono text-[11px]">
                            {area.days.join(', ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-400">
                          {area.fee === 0 ? 'Free' : `R${area.fee.toFixed(2)}`}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-emerald-400 font-extrabold inline-flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>FREE</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
