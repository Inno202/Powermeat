import React, { useState } from 'react';
import { LogoMark } from '../common/Logo';

interface ProductPhotoProps {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

/** A product photo that fills its frame. While it loads the frame shows a soft
 *  pulse; if there is no photo (or it fails to load) the Powermeat mark shows instead. */
export const ProductPhoto: React.FC<ProductPhotoProps> = ({ src: rawSrc, alt, className = '', eager }) => {
  // Only secure web addresses are loaded.
  const src = rawSrc && rawSrc.startsWith('https://') ? rawSrc : undefined;
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>(src ? 'loading' : 'failed');

  if (!src || state === 'failed') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-sand" role="img" aria-label={alt}>
        <LogoMark size={56} className="opacity-60" />
      </div>
    );
  }

  return (
    <>
      {state === 'loading' && <div className="absolute inset-0 bg-sand animate-pulse" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setState('ready')}
        onError={() => setState('failed')}
        className={`w-full h-full object-cover ${state === 'ready' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
      />
    </>
  );
};
