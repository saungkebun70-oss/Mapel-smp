import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { AlertCircle, BookOpen, CheckCircle2, Lock, Mail, ShieldCheck, UserPlus, LogIn } from 'lucide-react';
import { AVATAR_OPTIONS, CLASS_OPTIONS } from '../data/defaultSchedules';
import { auth, googleProvider } from '../lib/firebase';
import { setPendingRegistrationProfile } from '../lib/studentService';
import { AvatarId, SchoolShift } from '../types';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('7A');
  const [shift, setShift] = useState<SchoolShift>('pagi');
  const [avatarId, setAvatarId] = useState<AvatarId>('mint');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsEmailProviderHelp, setNeedsEmailProviderHelp] = useState(false);

  const translateAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        setNeedsEmailProviderHelp(true);
        return 'Login Email & Password belum diaktifkan di Firebase Console proyek ini. Kamu bisa langsung masuk pakai tombol Google di bawah, atau aktifkan Email/Password di Firebase Console.';
      case 'auth/email-already-in-use':
        return 'Email ini sudah terdaftar. Silakan pindah ke tab Masuk untuk login.';
      case 'auth/invalid-email':
        return 'Format alamat email kurang tepat. Periksa kembali ya.';
      case 'auth/weak-password':
        return 'Password minimal 6 karakter agar akunmu tetap aman.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email atau password tidak cocok. Cek kembali data masukmu.';
      case 'auth/popup-closed-by-user':
        return 'Jendela login Google ditutup sebelum selesai.';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.';
      default:
        return err instanceof Error ? err.message : 'Terjadi kendala saat proses autentikasi.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNeedsEmailProviderHelp(false);

    if (!email.trim() || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Masukkan nama lengkapmu dulu ya.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        setPendingRegistrationProfile({
          fullName: fullName.trim(),
          className,
          avatarId,
          shift,
        });
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: fullName.trim() });
      } else {
        setPendingRegistrationProfile(null);
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onAuthenticated();
    } catch (err) {
      setPendingRegistrationProfile(null);
      setErrorMsg(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setNeedsEmailProviderHelp(false);
    setLoading(true);
    try {
      setPendingRegistrationProfile({
        className,
        avatarId,
        shift,
      });
      await signInWithPopup(auth, googleProvider);
      onAuthenticated();
    } catch (err) {
      setPendingRegistrationProfile(null);
      setErrorMsg(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Editorial / Student Welcome Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-white border border-[#EAE7E0] rounded-3xl p-7 sm:p-10 shadow-[0_2px_16px_-4px_rgba(24,39,75,0.06)]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-[#D8F3DC] flex items-center justify-center text-emerald-900">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-slate-900 leading-tight">
                  MAPEL
                </p>
                <p className="text-xs text-slate-500">SMPN 3 KARAWANG · Kurikulum Merdeka</p>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Atur jadwal sekolah Senin sampai Minggu di ruang pribadimu.
            </h1>

            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Dari upacara Senin, pelajaran inti, ekstrakurikuler sore, sampai persiapan tas dan catatan PR—semuanya rapi di satu tempat khusus untukmu.
            </p>

            {/* 4 Pastel Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="rounded-2xl bg-[#E6F7EE] p-4">
                <p className="text-sm font-bold text-emerald-950">🗓️ Jadwal Senin–Minggu</p>
                <p className="mt-1 text-xs text-emerald-900/80 leading-relaxed">
                  Pembiasaan pagi, jam inti, ekskul sore, proyek P5 Sabtu, hingga Me-Time Minggu.
                </p>
              </div>
              <div className="rounded-2xl bg-[#FEF7D6] p-4">
                <p className="text-sm font-bold text-amber-950">🎒 Checklist Tas Harian</p>
                <p className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                  Anti ketinggalan seragam, buku paket, atau perlengkapan olahraga.
                </p>
              </div>
              <div className="rounded-2xl bg-[#E6F2FF] p-4">
                <p className="text-sm font-bold text-blue-950">📝 Catatan PR Pribadi</p>
                <p className="mt-1 text-xs text-blue-900/80 leading-relaxed">
                  Catat tenggat tugas tiap mapel dan centang saat sudah beres dikerjakan.
                </p>
              </div>
              <div className="rounded-2xl bg-[#F1EAFF] p-4">
                <p className="text-sm font-bold text-violet-950">🔒 Privasi Terisolasi</p>
                <p className="mt-1 text-xs text-violet-900/80 leading-relaxed">
                  Data jadwal & tugas terkunci per ID akunmu sendiri. Teman lain tak bisa mengintip.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Setiap siswa mendapatkan ruang data terenkripsi di Firebase Firestore berdasarkan User ID unik. Akun A tidak dapat membaca atau mengubah jadwal milik Akun B.
            </p>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-6 bg-white border border-[#EAE7E0] rounded-3xl p-7 sm:p-10 shadow-[0_2px_16px_-4px_rgba(24,39,75,0.06)] flex flex-col justify-center">
          {/* Segmented Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#F4F2EC] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
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
              className={`min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun</span>
            </button>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900">
            {mode === 'login' ? 'Selamat datang kembali!' : 'Buat akun siswa baru'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login'
              ? 'Masuk dengan email atau akun Google untuk membuka jadwal pribadimu.'
              : 'Daftar pakai email untuk menyiapkan jadwal default SMPN 3 KARAWANG secara otomatis.'}
          </p>

          {errorMsg && (
            <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold leading-snug">{errorMsg}</p>
                  {needsEmailProviderHelp && (
                    <ol className="list-decimal list-inside text-xs text-rose-800 space-y-1">
                      <li>Buka Firebase Console → pilih proyek <strong>xenodochial-clover-g6tvw</strong>.</li>
                      <li>Masuk ke menu <strong>Authentication → Sign-in method</strong>.</li>
                      <li>Klik <strong>Add new provider → Email/Password</strong> lalu aktifkan dan klik Save.</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nama Lengkap Siswa
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Nabila Putri"
                      maxLength={80}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Kelas
                    </label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jam Belajar Sekolah
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShift('pagi')}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        shift === 'pagi'
                          ? 'border-emerald-700 bg-[#E6F7EE] text-emerald-950 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>☀️</span>
                      <span>Jam Belajar Pagi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShift('siang')}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        shift === 'siang'
                          ? 'border-amber-600 bg-[#FEF7D6] text-amber-950 ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>🌤️</span>
                      <span>Jam Belajar Siang</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Avatar Lucu
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {AVATAR_OPTIONS.map((av) => {
                      const active = avatarId === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setAvatarId(av.id)}
                          className={`group relative rounded-2xl p-2 border transition-all flex flex-col items-center gap-1.5 ${
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
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Siswa
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@siswa.sch.id"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

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

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">atau masuk instan</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
