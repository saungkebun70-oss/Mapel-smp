import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  MessageCircle,
  QrCode,
  RotateCcw,
} from 'lucide-react';

interface ShareInviteCardProps {
  compact?: boolean;
}

type TargetEntryMode = 'login' | 'daftar';

const SAVED_SHARE_URL_KEY = 'mapel_share_base_url';
const PLACEHOLDER_VERCEL_URL = 'https://mapel-smpn3karawang.vercel.app';

function getActiveShareOrigin(): string {
  if (typeof window === 'undefined') return '';
  const { origin, hostname } = window.location;
  if (hostname.startsWith('ais-dev-') && hostname.endsWith('.run.app')) {
    return origin.replace('https://ais-dev-', 'https://ais-pre-');
  }
  return origin;
}

function getDefaultBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const { origin, hostname } = window.location;
  if (hostname.endsWith('.vercel.app')) {
    return origin;
  }
  try {
    const saved = window.localStorage.getItem(SAVED_SHARE_URL_KEY);
    if (saved && saved !== PLACEHOLDER_VERCEL_URL) {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return '';
  }
  return getActiveShareOrigin();
}

export const ShareInviteCard: React.FC<ShareInviteCardProps> = ({ compact = false }) => {
  const [baseUrl, setBaseUrl] = useState<string>(() => getDefaultBaseUrl());
  const [entryMode, setEntryMode] = useState<TargetEntryMode>('login');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  const activeFallbackOrigin = useMemo(() => getActiveShareOrigin(), []);
  const isHostedOnVercel =
    typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    try {
      if (trimmed && trimmed !== PLACEHOLDER_VERCEL_URL && !trimmed.includes('localhost')) {
        const normalized =
          trimmed.startsWith('http://') || trimmed.startsWith('https://')
            ? trimmed
            : `https://${trimmed}`;
        window.localStorage.setItem(SAVED_SHARE_URL_KEY, normalized);
      }
    } catch {
      // Ignore storage errors
    }
  }, [baseUrl]);

  const normalizedBaseUrl = useMemo(() => {
    const raw = baseUrl.trim().replace(/\/+$/, '');
    if (!raw) return activeFallbackOrigin;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `https://${raw}`;
  }, [baseUrl, activeFallbackOrigin]);

  const isUsingUnverifiedVercelUrl = useMemo(() => {
    if (!normalizedBaseUrl) return false;
    try {
      const parsed = new URL(normalizedBaseUrl);
      if (!parsed.hostname.endsWith('.vercel.app')) return false;
      if (typeof window !== 'undefined' && window.location.hostname === parsed.hostname) {
        return false;
      }
      return parsed.origin === PLACEHOLDER_VERCEL_URL || !isHostedOnVercel;
    } catch {
      return false;
    }
  }, [normalizedBaseUrl, isHostedOnVercel]);

  const shareUrl = useMemo(() => {
    if (!normalizedBaseUrl) return '';
    return entryMode === 'daftar'
      ? `${normalizedBaseUrl}/?mode=daftar`
      : `${normalizedBaseUrl}/?login=1`;
  }, [normalizedBaseUrl, entryMode]);

  const whatsappMessage = useMemo(() => {
    const actionText =
      entryMode === 'daftar'
        ? 'Klik link berikut untuk langsung *Daftar Nama & PIN*:'
        : 'Klik link berikut untuk langsung masuk pakai *Nama & PIN*:';
    return [
      'Halo teman-teman *SMPN 3 KARAWANG*! 📚✨',
      'Yuk pakai aplikasi *MAPEL* untuk lihat jadwal pelajaran (Jam Pagi & Siang), catatan PR, checklist tas sekolah, dan pengingat kelas.',
      '',
      actionText,
      shareUrl,
      '',
      'Atau scan QR Code yang dibagikan ya!',
    ].join('\n');
  }, [entryMode, shareUrl]);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  }, [whatsappMessage]);

  useEffect(() => {
    if (!shareUrl) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(shareUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const handleCopy = async (text: string, type: 'link' | 'wa') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } else {
        setCopiedWa(true);
        setTimeout(() => setCopiedWa(false), 2200);
      }
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleUseActiveOrigin = () => {
    if (!activeFallbackOrigin) return;
    setBaseUrl(activeFallbackOrigin);
    try {
      window.localStorage.removeItem(SAVED_SHARE_URL_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#EEF6FF] via-white to-[#EEFAF3] border border-[#CFE3FA] rounded-3xl ${
        compact ? 'p-5' : 'p-6'
      } shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)] space-y-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0F766E] shrink-0" />
            <span>Bagikan Link & QR ke WhatsApp</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Saat siswa membuka link atau scan QR Code, aplikasi langsung mengarah ke halaman masuk/daftar pakai <strong>Nama & PIN</strong>.
          </p>
        </div>
      </div>

      {/* Editable Website / Vercel URL */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Alamat Website (URL Vercel Asli / Link Aplikasi)</span>
          </label>
          {activeFallbackOrigin && normalizedBaseUrl !== activeFallbackOrigin && (
            <button
              type="button"
              onClick={handleUseActiveOrigin}
              className="text-[11px] font-bold text-[#0F766E] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Pakai Link Aktif Sekarang</span>
            </button>
          )}
        </div>
        <input
          type="url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Tempel link .vercel.app asli dari dashboard Vercel Anda"
          className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        />
        {isHostedOnVercel ? (
          <p className="text-[11px] font-semibold text-emerald-800">
            Terdeteksi berjalan langsung di domain Vercel aktif. Link siap dibagikan!
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Jika sudah deploy di Vercel, tempel domain <span className="font-mono">https://nama-project-anda.vercel.app</span> dari dashboard Vercel. Jika belum, biarkan memakai link aplikasi aktif di atas agar langsung bisa dibuka.
          </p>
        )}
      </div>

      {isUsingUnverifiedVercelUrl && (
        <div className="rounded-2xl bg-[#FFF5CC] border border-amber-300/80 p-3.5 text-xs text-amber-950 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Perhatian: Hindari error 404 DEPLOYMENT_NOT_FOUND di Vercel
              </p>
              <p className="text-amber-900/90 leading-relaxed">
                Pastikan alamat <span className="font-mono break-all">{normalizedBaseUrl}</span> benar-benar sudah berhasil di-deploy di akun <strong>vercel.com</strong> Anda (cek tombol <strong>Visit</strong> di dashboard Vercel). Jika belum deploy ke Vercel, gunakan link aktif aplikasi sekarang agar tidak 404.
              </p>
            </div>
          </div>
          {activeFallbackOrigin && (
            <button
              type="button"
              onClick={handleUseActiveOrigin}
              className="min-h-[34px] px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-950 text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gunakan Link Aktif Sekarang (Anti 404)</span>
            </button>
          )}
        </div>
      )}

      {/* Target Mode Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setEntryMode('login')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            entryMode === 'login'
              ? 'border-[#0F766E] bg-[#E5F9EE] text-emerald-950'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Langsung Masuk (Nama & PIN)
        </button>
        <button
          type="button"
          onClick={() => setEntryMode('daftar')}
          className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            entryMode === 'daftar'
              ? 'border-amber-600 bg-[#FFF5CC] text-amber-950'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Langsung Daftar Akun Baru
        </button>
      </div>

      {/* QR + Share Link Preview */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4">
        <div className="w-36 h-36 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code MAPEL SMPN 3 KARAWANG"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-[11px] text-center text-slate-400 px-2">
              {shareUrl ? 'Membuat QR...' : 'Isi alamat website di atas dulu'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 w-full space-y-2.5">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Link Siap Kirim
            </p>
            <p className="mt-0.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 break-all">
              {shareUrl || 'Belum ada alamat website'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {shareUrl && (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim ke WA</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(whatsappMessage, 'wa')}
                  className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copiedWa ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedWa ? 'Teks WA Disalin!' : 'Salin Pesan WA'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(shareUrl, 'link')}
                  className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLink ? 'Link Disalin!' : 'Salin Link'}</span>
                </button>

                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tes Buka Link</span>
                </a>
              </>
            )}

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`qr-mapel-${entryMode}.png`}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan QR</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
