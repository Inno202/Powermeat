import React from 'react';
import { ArrowDown, MessageCircle, Truck, Sparkles } from 'lucide-react';
import { useStore } from '../../services/store';

interface HeroBannerProps {
  onOrderNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOrderNow }) => {
  const { settings } = useStore();
  const digitsOnly = settings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '27' + digitsOnly.slice(1) : digitsOnly;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Powermeat Welkom! I want to place an order from your website catalog.'
  )}`;

  return (
    <div className="relative bg-gradient-to-b from-[#111111] via-[#1A1A1A] to-[#111111] border-b border-[#2B2B2B] overflow-hidden">
      {/* Background butchery texture overlay with low opacity */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-radial from-transparent via-[#111111]/80 to-[#111111] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Free Delivery Announcement Chip */}
        <div className="inline-flex items-center gap-2 bg-[#D7141A]/20 border border-[#D7141A] text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-6 shadow-sm">
          <Truck size={16} className="text-[#FFC400]" />
          <span>FREE DELIVERY on any Family Hamper & Meat Combo!</span>
        </div>

        {/* Main Title (Bebas / Oswald bold condensed) */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold italic tracking-wider text-white uppercase max-w-4xl drop-shadow-lg leading-none">
          {settings.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-2xl font-sans leading-relaxed">
          {settings.heroSubtitle}
        </p>

        {/* Local Welkom Badge */}
        <div className="mt-3 flex items-center gap-2 text-xs text-[#FFC400] font-semibold">
          <Sparkles size={14} />
          <span>Butchery at 145 Power Road, Welkom • Fast Free State Delivery</span>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onOrderNow}
            className="w-full sm:w-auto bg-[#D7141A] hover:bg-[#ba0f14] text-white font-heading text-xl font-bold py-3.5 px-8 rounded-lg shadow-xl shadow-red-950/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition cursor-pointer"
          >
            <span>Order Now</span>
            <ArrowDown size={20} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-heading text-xl font-bold py-3.5 px-8 rounded-lg shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 transition cursor-pointer"
          >
            <MessageCircle size={22} className="fill-white" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </div>
  );
};
