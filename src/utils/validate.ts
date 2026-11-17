/* Input checks shared by the checkout and staff forms. They give helpful messages
   in the browser; the same limits are enforced again in firestore.rules. */

export const LIMITS = {
  name: 120,
  cell: 30,
  email: 254,
  address: 300,
  notes: 500,
  uploadBytes: 2 * 1024 * 1024
};

export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/** Removes control characters and trims, then caps the length. */
export function cleanText(value: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

/** South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX. */
export function isValidCell(value: string): boolean {
  const digits = value.replace(/[^0-9+]/g, '');
  return /^(0\d{9}|\+?27\d{9})$/.test(digits);
}

export function isValidEmail(value: string): boolean {
  return value.length <= LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/** Returns a message when a proof-of-payment file may not be attached, else null. */
export function uploadProblem(file: { type: string; size: number }): string | null {
  if (!UPLOAD_TYPES.includes(file.type)) return 'Attach a JPG, PNG or WebP photo, or a PDF.';
  if (file.size > LIMITS.uploadBytes) return 'That file is larger than 2 MB. Attach a smaller photo or PDF.';
  return null;
}

/** Product photos must come from a secure web address. Anything else is dropped. */
export function safeImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length > 500) return undefined;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** A stored proof of payment is only shown if it really is a photo or a PDF. */
export function proofKind(dataUrl: string | undefined): 'image' | 'pdf' | null {
  if (!dataUrl) return null;
  if (/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) return 'image';
  if (/^data:application\/pdf;base64,/.test(dataUrl)) return 'pdf';
  return null;
}
