import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../services/store';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const digitsOnly = settings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '27' + digitsOnly.slice(1) : digitsOnly;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Powermeat Welkom! I have an enquiry about meat hampers & orders.'
  )}`;

  return (
    <aside
      aria-label="Contact options"
      className="fixed bottom-5 right-5 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Powermeat Welkom"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <MessageCircle size={24} className="fill-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
        </div>
        <span className="text-sm tracking-wide hidden sm:inline-block font-sans">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
};
