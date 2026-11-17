import React from 'react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';
import { whatsappLink, telLink } from '../../utils/contact';
import { PageHero, HERO_PHOTOS } from '../ui/PageHero';

type PageProps = { onNavigateHome: () => void };

const Shell: React.FC<{ title: string; image: string; children: React.ReactNode }> = ({ title, image, children }) => (
  <>
    <PageHero title={title} image={image} />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">{children}</div>
  </>
);

export const DeliveryAreasPage: React.FC<PageProps> = ({ onNavigateHome }) => {
  const { deliveryAreas } = useStore();
  const areas = deliveryAreas.filter(a => a.active);

  return (
    <Shell title="Delivery areas and days" image={HERO_PHOTOS[2]}>
      <p className="text-lg max-w-[60ch]">
        Refrigerated butcher delivery straight to your doorstep across the Goldfields and Central Free State.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="display text-3xl">Order by 12:00 the day before</h2>
          <p className="mt-3 text-ink-soft">
            Because every meat hamper, boerewors coil, and butchery cut is freshly prepared by hand, orders must be
            placed and confirmed by <strong className="text-ink">12:00 noon on the day prior</strong> to your town’s
            scheduled delivery run.
          </p>
        </div>
        <div>
          <h2 className="display text-3xl">
            Free delivery with a hamper or <span className="text-brand-accent">combo</span>
          </h2>
          <p className="mt-3 text-ink-soft">
            Free delivery applies automatically to{' '}
            <strong className="text-ink">any order containing a Family Hamper or Meat Combo</strong> regardless of your
            town.
          </p>
        </div>
      </div>

      <div className="panel mt-12 p-2 sm:p-4 overflow-x-auto">
        <table className="w-full text-left min-w-[520px]">
          <thead>
            <tr className="text-sm text-ink-soft">
              <th className="py-3 px-3 font-semibold">Town</th>
              <th className="py-3 px-3 font-semibold">Delivery days</th>
              <th className="py-3 px-3 font-semibold">Standard fee</th>
              <th className="py-3 px-3 font-semibold text-right">With a hamper or combo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {areas.map(area => (
              <tr key={area.id}>
                <td className="py-3.5 px-3 font-semibold">{area.name}</td>
                <td className="py-3.5 px-3 text-ink-soft">{area.days.join(', ')}</td>
                <td className="py-3.5 px-3">{area.fee === 0 ? 'Free' : formatZAR(area.fee)}</td>
                <td className="py-3.5 px-3 text-right font-semibold text-emerald-800">Free</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={onNavigateHome} className="btn btn-accent mt-10">
        Start an order
      </button>
    </Shell>
  );
};

export const WholesalePage: React.FC<PageProps> = () => {
  const { settings } = useStore();
  const wholesaleWa = whatsappLink(
    settings.whatsapp,
    'Hello Powermeat! I would like to inquire about Wholesale / Bulk Catering pricing.'
  );

  return (
    <Shell title="Wholesale and bulk orders" image={HERO_PHOTOS[0]}>
      <p className="text-lg max-w-[60ch]">
        Supplying mines, canteens, restaurants, churches, weddings and funeral events across Welkom.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="display text-3xl">Canteens and mine catering</h2>
          <p className="mt-3 text-ink-soft">
            Bulk frozen chicken bags (5kg/10kg), ground beef mince, boerewors coils and beef stew by the crate.
          </p>
        </div>
        <div>
          <h2 className="display text-3xl">Events and funerals</h2>
          <p className="mt-3 text-ink-soft">
            Wholesale bulk packs packaged to your exact portion specs with guaranteed refrigerated transport.
          </p>
        </div>
        <div>
          <h2 className="display text-3xl">Spaza and fast food</h2>
          <p className="mt-3 text-ink-soft">
            Continental cheese russians, 2.5kg french fries, burger patties and bucket braaiwors at trade prices.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl bg-charcoal text-white p-6 sm:p-10">
        <h2 className="display text-4xl">
          Ask for a wholesale <span className="text-brand-yellow">quotation</span>
        </h2>
        <p className="mt-3 text-white/80 max-w-[56ch]">
          Contact our butchery owner or manager directly to discuss volume discounts, weekly delivery accounts, and
          custom carcass cutting.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a href={wholesaleWa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp hover:bg-white hover:text-ink">
            <span>WhatsApp the wholesale desk</span>
          </a>
          <a href={telLink(settings.phone1)} className="btn btn-outline-light num">
            <span>Call {settings.phone1}</span>
          </a>
        </div>
      </div>
    </Shell>
  );
};

export const ContactPage: React.FC<PageProps> = () => {
  const { settings } = useStore();

  return (
    <Shell title="Contact and location" image={HERO_PHOTOS[1]}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ul className="num space-y-6">
          <li className="flex items-start gap-3.5">
            <div>
              <h2 className="font-semibold">Store address</h2>
              <p className="text-ink-soft">{settings.address}</p>
              <p className="text-ink-soft">Welkom, Free State, South Africa</p>
              <p className="text-ink-soft mt-2">
                Free parking on site in front of the butchery entrance. Easy access for bulk loading.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3.5">
            <div>
              <h2 className="font-semibold">Phone</h2>
              <p className="flex flex-wrap gap-x-4">
                <a href={telLink(settings.phone1)} className="link">
                  {settings.phone1}
                </a>
                <a href={telLink(settings.phone2)} className="link">
                  {settings.phone2}
                </a>
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3.5">
            <div>
              <h2 className="font-semibold">WhatsApp orders and enquiries</h2>
              <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="link">
                {settings.whatsapp}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3.5">
            <div>
              <h2 className="font-semibold">Trading hours</h2>
              <p className="text-ink-soft">{settings.tradingHours.weekdays}</p>
              <p className="text-ink-soft">{settings.tradingHours.saturday}</p>
              <p className="text-ink-soft">{settings.tradingHours.sunday}</p>
              <p className="text-ink-soft">{settings.tradingHours.publicHolidays}</p>
            </div>
          </li>
        </ul>

        <div className="frame aspect-[4/3] w-full self-start">
          <iframe
            title="Map showing Powermeat at 145 Power Road, Welkom"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups"
            src="https://maps.google.com/maps?q=145%20Power%20Road,%20Welkom,%20Free%20State&t=&z=15&ie=UTF8&iwloc=&output=embed"
          />
        </div>
      </div>
    </Shell>
  );
};

const Clause: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="display text-3xl">{title}</h2>
    <div className="mt-3 space-y-3 text-ink-soft">{children}</div>
  </section>
);

export const PrivacyPolicyPage: React.FC<PageProps> = () => {
  return (
    <Shell title="Privacy policy" image={HERO_PHOTOS[2]}>
      <p className="num text-sm text-ink-soft">Last updated 17 November 2026</p>
      <p className="mt-2 text-lg max-w-[60ch]">
        Protection of Personal Information Act (POPIA, Act 4 of 2013) compliance statement.
      </p>

      <div className="mt-10 space-y-10 max-w-[68ch]">
        <Clause title="1. Commitment to privacy">
          <p>
            Powermeat Welkom ("we", "us", or "the Butchery") is committed to protecting your personal information and
            complying with the South African Protection of Personal Information Act (POPIA). We collect only the
            minimum required information necessary to fulfill butchery orders and coordinate safe delivery or
            collection.
          </p>
        </Clause>

        <Clause title="2. Information we collect">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Customer name:</strong> To address your hamper package and identify your
              order.
            </li>
            <li>
              <strong className="text-ink">Cell phone number:</strong> To send order confirmation, notify when your
              order is out for delivery or ready for collection, and contact you if driver coordination is required.
            </li>
            <li>
              <strong className="text-ink">Delivery address:</strong> Strictly used for dispatching our delivery driver
              to your location.
            </li>
            <li>
              <strong className="text-ink">Email address (optional):</strong> For digital tax invoices or receipts.
            </li>
            <li>
              <strong className="text-ink">Proof of payment (optional):</strong> If you pay by EFT you may attach a
              photo or PDF of your proof of payment so we can match it to your order.
            </li>
          </ul>
        </Clause>

        <Clause title="3. Consent and direct marketing">
          <p>
            We do not sell, rent, or lease customer data to any third party. Promotional communications (such as
            month-end specials or hamper discounts) are sent only to customers who have explicitly opted in via the
            checkbox at checkout. The checkbox is not ticked for you. You may unsubscribe at any time by replying STOP
            to any promotional WhatsApp or SMS.
          </p>
        </Clause>

        <Clause title="4. Data retention and security">
          <p>
            Customer orders and payment records are retained only for statutory accounting and butchery logistics.
            Access is restricted exclusively to authorized Powermeat staff through role-based access control.
          </p>
          <p>
            Orders are stored in Google Firebase (Cloud Firestore), Google's database service, and may be kept on
            servers outside South Africa. Google processes them on our behalf under its data protection terms.
          </p>
          <p>
            This device keeps your cart and a copy of the orders you placed here, so you can see and repeat them. If you
            create an account or sign in with Google, we keep your email address (and a password, stored only in
            scrambled form by Firebase) and use it only to sign you in and show the orders placed with that email.
          </p>
        </Clause>

        <Clause title="5. Other services this site uses">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-ink">Google Firebase:</strong> Stores orders and the product catalogue (Cloud
              Firestore) and handles sign-in for everyone who chooses to create an account (Firebase
              Authentication).
            </li>
            <li>
              <strong className="text-ink">GitHub Pages:</strong> Hosts this website. GitHub receives your IP address
              when the page loads.
            </li>
            <li>
              <strong className="text-ink">Google Fonts and Google Maps:</strong> The lettering and the store map are
              loaded from Google, which receives your IP address when the page loads.
            </li>
            <li>
              <strong className="text-ink">WhatsApp:</strong> If you choose to order or chat on WhatsApp, your order
              details are opened in WhatsApp and handled under WhatsApp's own terms.
            </li>
            <li>
              <strong className="text-ink">Unsplash:</strong> Product and banner photographs are loaded from
              Unsplash's image servers.
            </li>
          </ul>
          <p>We do not use advertising or tracking cookies, or analytics. Signing in stores a sign-in token on your device so you stay signed in.</p>
        </Clause>

        <Clause title="6. Contact the Information Officer">
          <p>
            If you have any questions or wish to exercise your rights regarding personal data, please contact the
            Information Officer at 145 Power Road, Welkom, or call 057 396 3189.
          </p>
        </Clause>
      </div>
    </Shell>
  );
};
