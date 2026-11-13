const PHOTO_STORAGE_PREFIX = 'mapel_custom_photo_';

export function getUserCustomPhoto(uid: string): string | null {
  try {
    return localStorage.getItem(`${PHOTO_STORAGE_PREFIX}${uid}`);
  } catch {
    return null;
  }
}

export function setUserCustomPhoto(uid: string, dataUrl: string | null): void {
  try {
    const key = `${PHOTO_STORAGE_PREFIX}${uid}`;
    if (dataUrl) {
      localStorage.setItem(key, dataUrl);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export async function processProfilePhotoFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Pilih file gambar (JPG, PNG, atau WebP) ya.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran file maksimal 10 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca gambar. Coba pilih foto lain.'));
      el.src = objectUrl;
    });

    const targetSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung pemrosesan gambar.');
    }

    const srcSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - srcSize) / 2;
    const sy = (img.naturalHeight - srcSize) / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetSize, targetSize);
    ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, targetSize, targetSize);

    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
