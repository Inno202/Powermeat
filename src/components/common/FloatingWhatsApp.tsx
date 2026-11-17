import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../services/store';
import { whatsappLink } from '../../utils/contact';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const whatsappUrl = whatsappLink(
    settings.whatsapp,
    'Hello Powermeat Welkom! I have an enquiry about meat hampers & orders.'
  );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat to Powermeat on WhatsApp"
      className="btn btn-whatsapp fixed bottom-5 right-5 z-30 shadow-lg px-4 sm:px-5"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">WhatsApp us</span>
    </a>
  );
};
