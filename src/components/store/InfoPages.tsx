import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../services/store';

export const DeliveryAreasPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { deliveryAreas } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-white uppercase tracking-wide">
            Delivery Areas & Schedule
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Refrigerated butcher delivery straight to your doorstep across the Goldfields and Central Free State.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#FFC400] hover:underline cursor-pointer"
        >
          ← Back to Shop
        </button>
      </div>

      <div className="bg-[#1C1C1C] rounded-2xl border border-[#2D2D2D] p-6 mb-8 space-y-4">
        <div className="flex items-center gap-2 text-[#FFC400] font-bold text-sm">
          <Clock size={18} />
          <span>Cut-off Rule: 12h00 (Noon) the Day Before</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Because every meat hamper, boerewors coil, and butchery cut is freshly prepared by hand, orders must be placed and confirmed by <strong>12:00 noon on the day prior</strong> to your town’s scheduled delivery run.
        </p>
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs">
          <strong>Special Perk:</strong> Free delivery applies automatically to <strong>any order containing a Family Hamper or Meat Combo</strong> regardless of your town!
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#141414] text-neutral-400 font-bold uppercase text-xs border-b border-[#2D2D2D]">
            <tr>
              <th className="py-3.5 px-4">Town / Delivery Zone</th>
              <th className="py-3.5 px-4">Scheduled Days</th>
              <th className="py-3.5 px-4">Standard Fee</th>
              <th className="py-3.5 px-4 text-right">With Hamper/Combo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {deliveryAreas.map(area => (
              <tr key={area.id} className="hover:bg-neutral-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <MapPin size={15} className="text-[#D7141A]" />
                  <span>{area.name}</span>
                </td>
                <td className="py-3.5 px-4 text-neutral-300">
                  <span className="bg-neutral-800 px-2.5 py-1 rounded text-xs font-mono">
                    {area.days.join(', ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-neutral-400">
                  {area.fee === 0 ? 'Free' : `R${area.fee.toFixed(2)}`}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                  FREE
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const WholesalePage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { settings } = useStore();
  const digitsOnly = settings.whatsapp.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '27' + digitsOnly.slice(1) : digitsOnly;
  const wholesaleWa = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Powermeat! I would like to inquire about Wholesale / Bulk Catering pricing.'
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-white uppercase tracking-wide">
            Wholesale & Bulk Butchery Orders
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Supplying mines, canteens, restaurants, churches, weddings and funeral events across Welkom.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#FFC400] hover:underline cursor-pointer"
        >
          ← Back to Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-xl text-center space-y-2">
          <Building2 size={32} className="mx-auto text-[#D7141A]" />
          <h3 className="font-heading font-bold text-lg text-white">Canteens & Mine Catering</h3>
          <p className="text-xs text-neutral-400">
            Bulk frozen chicken bags (5kg/10kg), ground beef mince, boerewors coils and beef stew by the crate.
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-xl text-center space-y-2">
          <Truck size={32} className="mx-auto text-[#D7141A]" />
          <h3 className="font-heading font-bold text-lg text-white">Events & Funerals</h3>
          <p className="text-xs text-neutral-400">
            Wholesale bulk packs packaged to your exact portion specs with guaranteed refrigerated transport.
          </p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2D2D2D] p-5 rounded-xl text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-[#D7141A]" />
          <h3 className="font-heading font-bold text-lg text-white">Spaza & Fast Food</h3>
          <p className="text-xs text-neutral-400">
            Continental cheese russians, 2.5kg french fries, burger patties and bucket braaiwors at trade prices.
          </p>
        </div>
      </div>

      <div className="bg-[#1C1C1C] rounded-2xl border border-[#333] p-6 text-center space-y-4">
        <h3 className="font-heading text-xl font-bold text-white uppercase">
          Request a Custom Wholesale Meat Quotation
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Contact our butchery owner or manager directly to discuss volume discounts, weekly delivery accounts, and custom carcass cutting.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href={wholesaleWa}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-sm transition"
          >
            <MessageCircle size={18} className="fill-white" />
            <span>WhatsApp Wholesale Desk</span>
          </a>
          <a
            href="tel:0573963189"
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-sm border border-neutral-700 transition"
          >
            <Phone size={16} />
            <span>Call Butchery: 057 396 3189</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-white uppercase tracking-wide">
            Contact Info & Butchery Location
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Visit us in store or get in touch for prompt telephone and WhatsApp assistance.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#FFC400] hover:underline cursor-pointer"
        >
          ← Back to Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Contact details */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 space-y-4">
          <h3 className="font-heading text-xl font-bold text-white uppercase border-b border-[#2D2D2D] pb-3">
            Butchery Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[#D7141A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Physical Store Address</strong>
                <span className="text-neutral-300">{settings.address}</span>
                <span className="text-neutral-500 block text-xs mt-0.5">Welkom, Free State, South Africa</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={20} className="text-[#D7141A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Landline Phones</strong>
                <a href={`tel:${settings.phone1.replace(/\s+/g, '')}`} className="text-neutral-300 hover:text-white block">
                  {settings.phone1}
                </a>
                <a href={`tel:${settings.phone2.replace(/\s+/g, '')}`} className="text-neutral-300 hover:text-white block">
                  {settings.phone2}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle size={20} className="text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">WhatsApp Orders & Enquiries</strong>
                <a
                  href={`https://wa.me/27${settings.whatsapp.replace(/^0/, '').replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline block"
                >
                  {settings.whatsapp}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={20} className="text-[#D7141A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Store Trading Hours</strong>
                <p className="text-neutral-300 text-xs">Monday – Friday: 07:30 – 17:30</p>
                <p className="text-neutral-300 text-xs">Saturday: 07:30 – 14:00</p>
                <p className="text-neutral-400 text-xs">Sunday: Closed</p>
                <p className="text-neutral-400 text-xs">Public Holidays: 08:00 – 13:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Map visual */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 flex flex-col justify-between">
          <h3 className="font-heading text-xl font-bold text-white uppercase border-b border-[#2D2D2D] pb-3 mb-4">
            Find Us on Google Maps
          </h3>

          <div className="aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 border border-[#333] relative">
            <iframe
              title="Powermeat Welkom Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=145%20Power%20Road,%20Welkom,%20Free%20State&t=&z=15&ie=UTF8&iwloc=&output=embed"
            />
          </div>

          <div className="mt-4 pt-3 text-xs text-neutral-400">
            <span className="font-bold text-white">Free Parking Available</span> on site in front of butchery entrance. Easy access for bulk loading.
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-white uppercase tracking-wide">
            POPIA Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Protection of Personal Information Act (POPIA, Act 4 of 2013) compliance statement.
          </p>
        </div>
        <button
          onClick={onNavigateHome}
          className="text-xs font-bold text-[#FFC400] hover:underline cursor-pointer"
        >
          ← Back to Shop
        </button>
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] p-6 sm:p-8 space-y-6 text-sm text-neutral-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-white text-base">1. Commitment to Privacy</h3>
          <p>
            Powermeat Welkom ("we", "us", or "the Butchery") is committed to protecting your personal information and complying with the South African Protection of Personal Information Act (POPIA). We collect only the minimum required information necessary to fulfill butchery orders and coordinate safe delivery or collection.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-white text-base">2. Information We Collect</h3>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
            <li><strong>Customer Name:</strong> To address your hamper package and identify your order.</li>
            <li><strong>Cell Phone Number:</strong> To send order confirmation, notify when your order is out for delivery or ready for collection, and contact you if driver coordination is required.</li>
            <li><strong>Delivery Address:</strong> Strictly used for dispatching our delivery driver to your location.</li>
            <li><strong>Email Address (Optional):</strong> For digital tax invoices or receipts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-white text-base">3. Consent & Direct Marketing</h3>
          <p>
            We do not sell, rent, or lease customer data to any third party. Promotional communications (such as month-end specials or hamper discounts) are sent only to customers who have explicitly opted in via the checkbox at checkout. You may unsubscribe at any time by replying STOP to any promotional WhatsApp or SMS.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-white text-base">4. Data Retention & Security</h3>
          <p>
            Customer orders and payment records are retained only for statutory accounting and butchery logistics. Access is restricted exclusively to authorized Powermeat staff through role-based access control.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-white text-base">5. Contact Information Officer</h3>
          <p>
            If you have any questions or wish to exercise your rights regarding personal data, please contact the Information Officer at 145 Power Road, Welkom, or call 057 396 3189.
          </p>
        </section>
      </div>
    </div>
  );
};
