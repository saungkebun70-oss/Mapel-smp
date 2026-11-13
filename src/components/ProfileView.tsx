import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { AVATAR_OPTIONS, CLASS_OPTIONS } from '../data/defaultSchedules';
import { AvatarId, SchoolShift, UserProfile } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface ProfileViewProps {
  profile: UserProfile;
  shift: SchoolShift;
  onSwitchShift: (shift: SchoolShift) => Promise<void>;
  onUpdateProfile: (payload: {
    fullName: string;
    className: string;
    avatarId: AvatarId;
  }) => Promise<void>;
  onResetAllSchedules: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  shift,
  onSwitchShift,
  onUpdateProfile,
  onResetAllSchedules,
  onLogout,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [className, setClassName] = useState(profile.className);
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [resettingAll, setResettingAll] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [switchingShift, setSwitchingShift] = useState(false);

  useEffect(() => {
    setFullName(profile.fullName);
    setClassName(profile.className);
    setAvatarId(profile.avatarId);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    setSavedNotice(false);
    try {
      await onUpdateProfile({
        fullName: fullName.trim(),
        className,
        avatarId,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    setResettingAll(true);
    setResetDone(false);
    try {
      await onResetAllSchedules();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    } finally {
      setResettingAll(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Edit Profile Form */}
      <div className="lg:col-span-7 bg-white border border-[#ECE6DA] rounded-3xl p-6 sm:p-8 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)]">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <StudentAvatar
            avatarId={avatarId}
            fullName={fullName || profile.fullName}
            sizeClass="w-20 h-20"
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Profil Siswa SMPN 3 KARAWANG
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {profile.email || 'Akun Siswa Terdaftar'} · Kelas {profile.className}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={80}
                required
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kelas SMPN 3 KARAWANG
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Foto / Avatar Lucu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const active = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarId(av.id)}
                    className={`relative rounded-2xl p-3 border transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      active
                        ? 'border-emerald-700 bg-[#E6F7EE]/70 ring-2 ring-emerald-600/25'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={av.src}
                      alt={av.label}
                      referrerPolicy="no-referrer"
                      className={`w-16 h-16 rounded-xl object-cover ${av.bgClass}`}
                    />
                    <span className="text-xs font-bold text-slate-800">{av.label}</span>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 absolute top-2 right-2 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-display font-bold text-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Profil berhasil diperbarui!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Right: Account Isolation & Security Actions */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-[#E6F7EE] border border-[#C2EAD4] rounded-3xl p-6 shadow-[0_6px_20px_-8px_rgba(15,118,110,0.08)]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-base font-bold text-emerald-950">
                Privasi & Isolasi Data Akun Aktif
              </h2>
              <p className="mt-1.5 text-xs text-emerald-900/85 leading-relaxed">
                Seluruh jadwal pelajaran, catatan PR, dan checklist tasmu tersimpan di jalur pribadi Firestore yang dikunci khusus untuk ID akunmu:
              </p>
              <p className="mt-2 font-mono text-xs text-emerald-950 bg-white/80 px-3 py-2 rounded-xl break-all">
                users/{profile.uid}
              </p>
              <p className="mt-2 text-xs text-emerald-900/80 leading-relaxed">
                Akun siswa lain tidak memiliki akses baca maupun tulis ke data milikmu.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#ECE6DA] rounded-3xl p-6 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)] space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Jam Belajar & Pengaturan Jadwal
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih template Jam Belajar Pagi atau Jam Belajar Siang SMPN 3 KARAWANG, atau keluar dari akun dengan aman.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={switchingShift}
              onClick={async () => {
                if (shift === 'pagi') return;
                setSwitchingShift(true);
                try {
                  await onSwitchShift('pagi');
                } finally {
                  setSwitchingShift(false);
                }
              }}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                shift === 'pagi'
                  ? 'border-emerald-700 bg-[#E6F7EE] text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>☀️</span>
              <span>Jam Pagi</span>
            </button>
            <button
              type="button"
              disabled={switchingShift}
              onClick={async () => {
                if (shift === 'siang') return;
                setSwitchingShift(true);
                try {
                  await onSwitchShift('siang');
                } finally {
                  setSwitchingShift(false);
                }
              }}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                shift === 'siang'
                  ? 'border-amber-600 bg-[#FEF7D6] text-amber-950'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🌤️</span>
              <span>Jam Siang</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            disabled={resettingAll}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>
              {resettingAll
                ? 'Mengembalikan jadwal...'
                : resetDone
                ? 'Jadwal Senin–Minggu berhasil direset!'
                : 'Reset Semua Jadwal ke Default Sekolah'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
