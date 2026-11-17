import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { LogoMark } from '../common/Logo';
import { Product } from '../../types';
import { db } from '../../services/firebase';
import { DEMO_MODE } from '../../services/store';

interface ProductPhotoProps {
  /** The product whose own photo (uploaded by staff) or web photo is shown. */
  product?: Product;
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

// Uploaded photos already fetched in this visit, by product and photo version.
const cache = new Map<string, Promise<string | undefined>>();

function loadUploadedPhoto(productId: string, version: number) {
  const key = `${productId}:${version}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      getDoc(doc(db, 'product_photos', productId)).then(
        snap => {
          const data = snap.exists() ? (snap.data().data as string) : undefined;
          return typeof data === 'string' && /^data:image\/(webp|jpeg);base64,/.test(data) ? data : undefined;
        },
        () => undefined
      )
    );
  }
  return cache.get(key)!;
}

/** A product photo that fills its frame. While it loads the frame shows a soft
 *  pulse; if there is no photo (or it fails) the Powermeat mark shows instead. */
export const ProductPhoto: React.FC<ProductPhotoProps> = ({ product, src: rawSrc, alt, className = '', eager }) => {
  const webSrc = rawSrc ?? product?.imageUrl;
  const uploaded = !DEMO_MODE && product?.photoVersion ? product : undefined;
  const ref = useRef<HTMLDivElement>(null);
  const [uploadedSrc, setUploadedSrc] = useState<string | undefined>(undefined);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  // Uploaded photos are fetched only when the card scrolls into view.
  useEffect(() => {
    setUploadedSrc(undefined);
    if (!uploaded) return;
    const el = ref.current;
    let cancelled = false;
    const start = () =>
      loadUploadedPhoto(uploaded.id, uploaded.photoVersion!).then(data => {
        if (!cancelled) setUploadedSrc(data ?? '');
      });
    if (eager || !el || !('IntersectionObserver' in window)) {
      start();
      return () => { cancelled = true; };
    }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { rootMargin: '300px' });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [uploaded?.id, uploaded?.photoVersion, eager]);

  // Only secure web addresses, or the shop's own uploaded photos, are shown.
  const src = uploaded
    ? uploadedSrc === undefined
      ? undefined
      : uploadedSrc || (webSrc?.startsWith('https://') ? webSrc : '')
    : webSrc && (webSrc.startsWith('https://') || (DEMO_MODE && webSrc.startsWith('data:image/')))
      ? webSrc
      : '';

  useEffect(() => setState('loading'), [src]);

  if (src === '' || state === 'failed') {
    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center bg-sand" role="img" aria-label={alt}>
        <LogoMark size={56} className="opacity-60" />
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute inset-0">
      {(src === undefined || state === 'loading') && <div className="absolute inset-0 bg-sand animate-pulse" aria-hidden="true" />}
      {src !== undefined && (
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
      )}
    </div>
  );
};
