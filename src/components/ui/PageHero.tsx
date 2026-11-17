import React from 'react';

/** Splits a title so its last word can take the accent colour. */
export const AccentTitle: React.FC<{ text: string; accentClass?: string }> = ({
  text,
  accentClass = 'text-brand-accent-soft'
}) => {
  const words = text.trim().split(/\s+/);
  const last = words.pop();
  return (
    <>
      {words.join(' ')} <span className={accentClass}>{last}</span>
    </>
  );
};

interface PageHeroProps {
  title: string;
  image?: string;
}

/** Inner-page header: a rounded photo band with the title at its foot. */
export const PageHero: React.FC<PageHeroProps> = ({ title, image }) => (
  <div className="px-3 sm:px-4 pt-3 sm:pt-4">
    <div className="relative overflow-hidden rounded-[2rem] bg-charcoal min-h-[220px] sm:min-h-[300px] flex items-end">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" aria-hidden="true" />
      <div className="relative hero-rise w-full max-w-7xl mx-auto px-5 sm:px-8 pb-8 sm:pb-10">
        <h1 className="display text-white text-5xl sm:text-6xl md:text-7xl max-w-[18ch]">
          <AccentTitle text={title} />
        </h1>
      </div>
    </div>
  </div>
);

export const HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1600&q=80'
];
