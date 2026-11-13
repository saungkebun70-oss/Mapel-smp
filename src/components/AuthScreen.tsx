import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  AlertCircle,
  BookOpen,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  QrCode,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import { AVATAR_OPTIONS, CLASS_OPTIONS } from '../data/defaultSchedules';
import { auth } from '../lib/firebase';
import { processProfilePhotoFile } from '../lib/photoStorage';
import {
  isValidPin,
  normalizeStudentHandle,
  pinToAuthPassword,
  studentNameToAuthEmail,
} from '../lib/studentAuth';
import { setPendingRegistrationProfile } from '../lib/studentService';
import { AvatarId, SchoolShift } from '../types';
import { ShareInviteCard } from './ShareInviteCard';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

function getInitialAuthMode(): 'login' | 'register' {
  if (typeof window === 'undefined') return 'login';
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get('mode')?.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  if (modeParam === 'daftar' || modeParam === 'register' || path === '/daftar' || path === '/register') {
    return 'register';
  }
  return 'login';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>(() => getInitialAuthMode());
  const [fullName, setFullName] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [className, setClassName] = useState('7A');
  const [shift, setShift] = useState<SchoolShift>('pagi');
  const [avatarId, setAvatarId] = useState<AvatarId>('mint');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsProviderHelp, setNeedsProviderHelp] = useState(false);
  const [showShareQr, setShowShareQr] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrorMsg(null);
    setUploadingPhoto(true);
    try {
      const dataUrl = await processProfilePhotoFile(file);
      setCustomPhoto(dataUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membaca foto profil.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    setMode(getInitialAuthMode());
  }, []);

  const translateAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        setNeedsProviderHelp(true);
        return 'Autentikasi Nama & PIN membutuhkan metode Email/Password diaktifkan di Firebase Console proyek ini terlebih dahulu.';
      case 'auth/email-already-in-use':
        return 'Nama siswa ini sudah terdaftar. Jika itu akunmu, pindah ke tab Masuk. Jika nama sama dengan teman, tambahkan nama belakang atau kelas (contoh: Nabila 7A).';
      case 'auth/invalid-email':
        return 'Nama harus mengandung minimal 2 huruf atau angka.';
      case 'auth/weak-password':
        return 'PIN minimal 4 angka agar akunmu tetap aman.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Nama siswa atau PIN tidak cocok. Periksa kembali penulisan nama dan 4–6 angka PIN kamu.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan masuk. Tunggu sebentar sebelum mencoba lagi.';
      default:
        return err instanceof Error ? err.message : 'Terjadi kendala saat memproses akun.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNeedsProviderHelp(false);

    const trimmedName = fullName.trim();
    const handle = normalizeStudentHandle(trimmedName);
    if (handle.length < 2) {
      setErrorMsg('Masukkan nama lengkapmu minimal 2 huruf/angka ya.');
      return;
    }

    if (!isValidPin(pin)) {
      setErrorMsg('PIN harus berupa 4 sampai 6 angka (contoh: 1234 atau 123456).');
      return;
    }

    const internalEmail = studentNameToAuthEmail(trimmedName);
    const internalSecret = pinToAuthPassword(pin);

    setLoading(true);
    try {
      if (mode === 'register') {
        setPendingRegistrationProfile({
          fullName: trimmedName,
          className,
          avatarId,
          shift,
          customPhoto,
        });
        const cred = await createUserWithEmailAndPassword(auth, internalEmail, internalSecret);
        await updateProfile(cred.user, { displayName: trimmedName });
      } else {
        setPendingRegistrationProfile(null);
        await signInWithEmailAndPassword(auth, internalEmail, internalSecret);
      }
      onAuthenticated();
    } catch (err) {
      setPendingRegistrationProfile(null);
      setErrorMsg(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
        {/* Left Editorial / Student Welcome Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col justify-between bg-white border border-[#ECE6DA] rounded-3xl p-7 sm:p-10 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)]"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 360, damping: 16 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D8F3DC] to-[#D0EBFF] flex items-center justify-center text-emerald-900"
              >
                <BookOpen className="w-5 h-5" />
              </motion.div>
              <div>
                <p className="font-display font-extrabold text-lg text-slate-900 leading-tight">
                  MAPEL
                </p>
                <p className="text-xs text-slate-500">SMPN 3 KARAWANG · Kurikulum Merdeka</p>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Masuk cepat pakai Nama & PIN untuk atur jadwal sekolahmu{' '}
              <span className="animate-cute-wave" aria-hidden="true">
                🎒
              </span>
            </h1>

            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Dari upacara Senin, jam belajar pagi & siang, ekstrakurikuler, catatan PR, sampai checklist tas harian—semuanya tersimpan pribadi untuk akunmu sendiri.
            </p>

            {/* 4 Pastel Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-2xl bg-[#E5F9EE] p-4"
              >
                <p className="text-sm font-bold text-emerald-950">🗓️ Jadwal Pagi & Siang</p>
                <p className="mt-1 text-xs text-emerald-900/80 leading-relaxed">
                  Tersedia shift Jam Belajar Pagi & Siang dari Senin hingga Minggu.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-2xl bg-[#FFF5CC] p-4"
              >
                <p className="text-sm font-bold text-amber-950">🎒 Checklist Tas Harian</p>
                <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                  Anti ketinggalan seragam, buku paket, atau perlengkapan olahraga.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-2xl bg-[#EEF6FF] p-4"
              >
                <p className="text-sm font-bold text-blue-950">🔔 Pengingat Kelas</p>
                <p className="mt-1 text-xs text-blue-900/80 leading-relaxed">
                  Alert otomatis 5–15 menit sebelum pelajaran berikutnya dimulai.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-2xl bg-[#F3ECFF] p-4"
              >
                <p className="text-sm font-bold text-violet-950">🔒 Privasi Nama & PIN</p>
                <p className="mt-1 text-xs text-violet-900/80 leading-relaxed">
                  Cukup pakai Nama & PIN 4–6 angka. Data terisolasi per akun siswa.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Setiap akun siswa mendapatkan ruang penyimpanan pribadi yang terkunci di Firebase Firestore. Akun A tidak dapat membaca atau mengubah jadwal milik Akun B.
            </p>
          </div>
        </motion.div>

        {/* Right Auth Card: Nama & PIN */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 bg-white border border-[#ECE6DA] rounded-3xl p-7 sm:p-10 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)] flex flex-col justify-center"
        >
          {/* Segmented Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F4F2EC] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>

          <h2 className="font-display text-2xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Masuk dengan Nama & PIN' : 'Daftar Akun Siswa Baru'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Masukkan nama lengkap dan PIN rahasiamu untuk membuka jadwal.'
              : 'Buat akun pakai Nama & PIN untuk menyiapkan jadwal SMPN 3 KARAWANG otomatis.'}
          </p>

          {errorMsg && (
            <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold leading-snug">{errorMsg}</p>
                  {needsProviderHelp && (
                    <ol className="list-decimal list-inside text-xs text-rose-800 space-y-1">
                      <li>
                        Buka Firebase Console → pilih proyek <strong>xenodochial-clover-g6tvw</strong>.
                      </li>
                      <li>
                        Masuk ke menu <strong>Authentication → Sign-in method</strong>.
                      </li>
                      <li>
                        Aktifkan provider <strong>Email/Password</strong> lalu klik <strong>Save</strong> (dipakai di balik layar untuk login Nama & PIN).
                      </li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Siswa
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Nabila Putri"
                  maxLength={80}
                  autoComplete="name"
                  className="w-full min-h-[46px] pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                PIN (4–6 Angka)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]{4,6}"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Masukkan 4–6 angka PIN"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full min-h-[46px] pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  className="min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kelas
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jam Belajar Sekolah
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShift('pagi')}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          shift === 'pagi'
                            ? 'border-emerald-700 bg-[#E6F7EE] text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>☀️</span>
                        <span>Pagi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShift('siang')}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          shift === 'siang'
                            ? 'border-amber-600 bg-[#FEF7D6] text-amber-950'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>🌤️</span>
                        <span>Siang</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#FAF7EE] border border-[#ECE6DA] p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {customPhoto ? (
                      <img
                        src={customPhoto}
                        alt="Preview foto profil"
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <Camera className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {customPhoto ? 'Foto Sendiri Terpasang' : 'Upload Foto Sendiri (Opsional)'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {customPhoto ? 'Siap dipakai saat masuk!' : 'Bisa pakai foto dari galeri HP'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer whitespace-nowrap"
                    >
                      {uploadingPhoto ? 'Memproses...' : customPhoto ? 'Ganti' : 'Pilih Foto'}
                    </button>
                    {customPhoto && (
                      <button
                        type="button"
                        onClick={() => setCustomPhoto(null)}
                        aria-label="Hapus foto pilihan"
                        className="min-h-[36px] min-w-[36px] rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {customPhoto ? 'Avatar Cadangan' : 'Atau Pilih Avatar Lucu'}
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {AVATAR_OPTIONS.map((av) => {
                      const active = avatarId === av.id;
                      return (
                        <motion.button
                          key={av.id}
                          type="button"
                          whileHover={{ y: -3, scale: 1.04 }}
                          whileTap={{ scale: 0.93 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                          onClick={() => setAvatarId(av.id)}
                          className={`group relative rounded-2xl p-2 border transition-colors flex flex-col items-center gap-1.5 cursor-pointer ${
                            active
                              ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-600/30'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={av.src}
                            alt={av.label}
                            referrerPolicy="no-referrer"
                            className={`w-12 h-12 rounded-xl object-cover ${av.bgClass}`}
                          />
                          <span className="text-[11px] font-semibold text-slate-700 truncate w-full text-center">
                            {av.label.split(' ')[0]}
                          </span>
                          {active && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 absolute top-1.5 right-1.5 bg-white rounded-full" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] active:scale-[0.99] text-white font-display font-bold text-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading
                ? 'Memproses akun...'
                : mode === 'login'
                ? 'Masuk ke Jadwalku'
                : 'Daftar & Siapkan Jadwalku'}
            </button>
          </form>

          {/* Toggle Bagikan Link Vercel & QR ke WA */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowShareQr((prev) => !prev)}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-[#CFE3FA] bg-[#EEF6FF] hover:bg-[#E2F0FF] text-blue-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>
                {showShareQr
                  ? 'Tutup Link & QR WhatsApp'
                  : 'Buat Link Vercel & QR Code untuk WA'}
              </span>
            </button>

            <AnimatePresence>
              {showShareQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 overflow-hidden"
                >
                  <ShareInviteCard compact />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
