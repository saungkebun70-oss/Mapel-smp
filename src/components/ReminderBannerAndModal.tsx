import React from 'react';
import { Bell, BellOff, BellRing, Clock, Volume2, VolumeX, X } from 'lucide-react';
import { ActiveReminderAlert, ReminderSettings } from '../hooks/useScheduleReminder';
import { LessonItem } from '../types';
import { ModalShell } from './Modals';

interface ActiveReminderBannerProps {
  alert: ActiveReminderAlert | null;
  onDismiss: () => void;
}

export const ActiveReminderBanner: React.FC<ActiveReminderBannerProps> = ({
  alert,
  onDismiss,
}) => {
  if (!alert) return null;

  return (
    <div
      role="alert"
      className="mb-5 bg-[#FFF4C4] border border-[#F0D675] rounded-3xl p-4 sm:p-5 shadow-[0_6px_20px_-8px_rgba(161,98,7,0.18)] flex items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-white/90 flex items-center justify-center text-2xl shrink-0">
          {alert.emoji}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-900">
            🔔 Pengingat Disiplin Waktu {alert.isTest ? '· Uji Coba' : ''}
          </p>
          <p className="mt-0.5 font-display text-sm sm:text-base font-bold text-amber-950 truncate">
            {alert.subject} dimulai {alert.minutesLeft} menit lagi (pukul{' '}
            <span className="font-mono tabular-nums">{alert.startTime}</span>)
          </p>
          <p className="text-xs text-amber-900/80 truncate">
            {alert.teacherOrPlace} · Segera siapkan buku dan alat tulismu!
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup pengingat"
        className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
      >
        <span>Siap!</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ReminderStripCardProps {
  todayLabel: string;
  currentLesson: LessonItem | null;
  nextLesson: LessonItem | null;
  minutesUntilNext: number | null;
  settings: ReminderSettings;
  onOpenSettings: () => void;
}

export const ReminderStripCard: React.FC<ReminderStripCardProps> = ({
  todayLabel,
  currentLesson,
  nextLesson,
  minutesUntilNext,
  settings,
  onOpenSettings,
}) => {
  return (
    <div className="bg-white border border-[#ECE6DA] rounded-3xl px-5 py-4 shadow-[0_6px_20px_-8px_rgba(24,39,75,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            settings.enabled
              ? 'bg-[#D8F3DC] text-emerald-900'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {settings.enabled ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 text-slate-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Radar Jadwal · {todayLabel}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {settings.enabled
                ? `Alert ${settings.leadMinutes} menit sebelum mulai`
                : 'Pengingat nonaktif'}
            </span>
          </div>

          <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">
            {nextLesson && minutesUntilNext !== null ? (
              <>
                Berikutnya: {nextLesson.emoji} {nextLesson.subject} pukul{' '}
                <span className="font-mono tabular-nums">{nextLesson.startTime}</span> (
                <span className="tabular-nums">{minutesUntilNext} menit lagi</span>)
              </>
            ) : currentLesson ? (
              <>
                Sedang berlangsung: {currentLesson.emoji} {currentLesson.subject} sampai{' '}
                <span className="font-mono tabular-nums">{currentLesson.endTime}</span>
              </>
            ) : (
              'Semua sesi pelajaran hari ini selesai · Siapkan tas untuk esok!'
            )}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Bell className="w-3.5 h-3.5 text-[#0F766E]" />
        <span>Atur Pengingat</span>
      </button>
    </div>
  );
};

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onUpdateSettings: (next: ReminderSettings) => void;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestBrowserPermission: () => Promise<void>;
  onTestReminder: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  open,
  onClose,
  settings,
  onUpdateSettings,
  notificationPermission,
  onRequestBrowserPermission,
  onTestReminder,
}) => {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Pengingat Jadwal Pelajaran"
      subtitle="Terima alert sebelum pelajaran dimulai supaya selalu siap tepat waktu."
    >
      <div className="space-y-5">
        {/* Toggle Active */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-sm font-bold text-slate-900">Aktifkan Pengingat Otomatis</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tampilkan alert pengingat otomatis sebelum sesi dimulai.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enabled}
            onClick={() => onUpdateSettings({ ...settings, enabled: !settings.enabled })}
            className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              settings.enabled
                ? 'bg-[#0F766E] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {settings.enabled ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>

        {/* Lead Time Selection */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-2">
            Kapan alert muncul sebelum pelajaran dimulai?
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {([5, 10, 15] as const).map((mins) => {
              const active = settings.leadMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, leadMinutes: mins })}
                  className={`min-h-[44px] rounded-xl border text-xs font-bold transition-all cursor-pointer tabular-nums ${
                    active
                      ? 'border-[#0F766E] bg-[#E6F7EE] text-emerald-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mins} menit
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Chime Toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4F2EC] flex items-center justify-center text-slate-700">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Suara Bel Pengingat</p>
              <p className="text-xs text-slate-500">Bunyikan nada bel halus saat alert muncul.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            onClick={() =>
              onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
            }
            className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              settings.soundEnabled
                ? 'bg-[#0F766E] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {settings.soundEnabled ? 'Nyala' : 'Senyap'}
          </button>
        </div>

        {/* Browser Notification Permission */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Notifikasi Browser / HP</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {notificationPermission === 'granted'
                ? 'Izin notifikasi sudah aktif di browser ini.'
                : notificationPermission === 'denied'
                ? 'Izin notifikasi diblokir browser; alert tetap tampil di layar aplikasi.'
                : notificationPermission === 'unsupported'
                ? 'Browser ini memakai alert di dalam aplikasi.'
                : 'Izinkan notifikasi agar pengingat muncul meski tab sedang diminimalkan.'}
            </p>
          </div>
          {notificationPermission === 'default' && (
            <button
              type="button"
              onClick={onRequestBrowserPermission}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Izinkan Notifikasi
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onTestReminder();
              onClose();
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FEF7D6] hover:bg-[#FCEFA8] text-amber-950 text-xs font-bold flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>Uji Pengingat Sekarang</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
