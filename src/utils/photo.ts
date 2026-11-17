/* Product photos taken on a phone are shrunk in the browser before saving, so the
   shop stays quick on mobile data. A saved photo is about 60-200 KB. */

export const PHOTO_MAX_CHARS = 300_000; // keep in step with firestore.rules

export async function shrinkPhoto(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Choose a photo (JPG, PNG or WebP).');
  }
  const bitmap = await createImageBitmap(file);
  try {
    for (const [side, quality] of [
      [1000, 0.8],
      [900, 0.72],
      [800, 0.65],
      [700, 0.6]
    ] as const) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let data = canvas.toDataURL('image/webp', quality);
      // Browsers without WebP give back PNG; JPEG is the safe fallback.
      if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', quality);
      if (data.length <= PHOTO_MAX_CHARS) return data;
    }
  } finally {
    bitmap.close();
  }
  throw new Error('That photo is too detailed to save. Try another photo.');
}
