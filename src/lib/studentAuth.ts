const SYNTHETIC_DOMAIN = 'siswa.smpn3karawang.app';

export function normalizeStudentHandle(fullName: string): string {
  const cleaned = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
  return cleaned.slice(0, 64);
}

export function studentNameToAuthEmail(fullName: string): string {
  const handle = normalizeStudentHandle(fullName);
  return `${handle}@${SYNTHETIC_DOMAIN}`;
}

export function pinToAuthPassword(pin: string): string {
  const cleanPin = pin.replace(/\D/g, '');
  return `mp3krw-pin-${cleanPin}`;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}

export function formatStudentIdLabel(email?: string): string {
  if (!email) return 'Akun Siswa Aktif';
  if (email.endsWith(`@${SYNTHETIC_DOMAIN}`)) {
    const handle = email.slice(0, email.indexOf('@'));
    return `@${handle}`;
  }
  return email;
}
