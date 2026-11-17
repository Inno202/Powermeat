import React, { useEffect, useState } from 'react';
import { ArrowDown, MessageCircle, Pause, Play } from 'lucide-react';
import { useStore } from '../../services/store';
import { AccentTitle, HERO_PHOTOS } from '../ui/PageHero';
import { whatsappLink } from '../../utils/contact';

interface HeroBannerProps {
  onOrderNow: () => void;
}

const SLIDE_MS = 6000;

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOrderNow }) => {
  const { settings } = useStore();
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  // The slideshow does not auto-play for people who ask for reduced motion.
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setActive(i => (i + 1) % HERO_PHOTOS.length),
      SLIDE_MS
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  const whatsappUrl = whatsappLink(
    settings.whatsapp,
    'Hello Powermeat Welkom! I want to place an order from your website catalog.'
  );

  return (
    <section className="px-3 sm:px-4 pt-3 sm:pt-4" aria-label="Welcome">
      <div className="relative overflow-hidden rounded-[2rem] bg-charcoal min-h-[460px] sm:min-h-[560px] flex items-end">
        {HERO_PHOTOS.map((src, i) =>
          failed[i] ? null : (
            <div key={src} className="slide absolute inset-0" data-active={i === active} aria-hidden="true">
              <img
                src={src}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                onError={() => setFailed(f => ({ ...f, [i]: true }))}
                className="w-full h-full object-cover"
              />
            </div>
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" aria-hidden="true" />

        <div className="relative hero-rise w-full max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-16 pt-24">
          <h1 className="display text-white text-5xl sm:text-6xl md:text-7xl max-w-[14ch]">
            <AccentTitle text={settings.heroTitle} />
          </h1>
          <p className="mt-5 text-white/90 text-base sm:text-lg max-w-[46ch]">{settings.heroSubtitle}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={onOrderNow} className="btn btn-lg btn-accent hover:bg-white hover:text-ink">
              <span>Order now</span>
              <ArrowDown size={18} />
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-outline-light">
              <MessageCircle size={18} />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1">
          {HERO_PHOTOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${HERO_PHOTOS.length}`}
              aria-current={i === active}
              className="w-[44px] h-[44px] flex items-center justify-center"
            >
              <span className={`block h-2 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPlaying(p => !p)}
            aria-label={playing ? 'Pause photo slideshow' : 'Play photo slideshow'}
            className="icon-btn bg-white/15 text-white hover:bg-white/30"
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
    </section>
  );
};
