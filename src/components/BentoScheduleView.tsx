import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckSquare,
  Edit3,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { DAYS_META } from '../data/defaultSchedules';
import {
  BagChecklistItem,
  DayKey,
  DaySchedule,
  ExtracurricularItem,
  HomeworkTask,
  LessonItem,
  NavSection,
  PastelTheme,
  SchoolShift,
  UserProfile,
} from '../types';
import { DailyStudyTipsCard } from './DailyStudyTipsCard';
import { EkskulModal, HomeworkModal, LessonModal, MorningModal, QuoteModal } from './Modals';
import { ReminderStripCard } from './ReminderBannerAndModal';
import { StudentAvatar } from './StudentAvatar';
import { ReminderSettings } from '../hooks/useScheduleReminder';

interface BentoScheduleViewProps {
  profile: UserProfile;
  customPhotoUrl?: string | null;
  shift: SchoolShift;
  onSwitchShift: (shift: SchoolShift) => Promise<void>;
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  schedule: DaySchedule;
  tasks: HomeworkTask[];
  checklist: BagChecklistItem[];
  onSaveSchedule: (updated: DaySchedule) => Promise<void>;
  onResetDay: (dayKey: DayKey) => Promise<void>;
  onAddTask: (payload: {
    dayKey: DayKey;
    subject: string;
    title: string;
    notes: string;
    dueDate: string;
  }) => Promise<void>;
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onToggleChecklist: (itemId: string, checked: boolean) => Promise<void>;
  onNavigateSection: (section: NavSection) => void;
  reminderInfo: {
    todayLabel: string;
    currentLesson: LessonItem | null;
    nextLesson: LessonItem | null;
    minutesUntilNext: number | null;
    settings: ReminderSettings;
    onOpenSettings: () => void;
  };
}

const THEME_ICON_BG: Record<PastelTheme, string> = {
  mint: 'bg-[#D8F3DC] text-emerald-950',
  yellow: 'bg-[#FFF3BF] text-amber-950',
  sky: 'bg-[#D0EBFF] text-blue-950',
  lavender: 'bg-[#E5DBFF] text-violet-950',
  neutral: 'bg-[#F4F2EC] text-slate-700',
};

export const BentoScheduleView: React.FC<BentoScheduleViewProps> = ({
  profile,
  customPhotoUrl,
  shift,
  onSwitchShift,
  selectedDay,
  onSelectDay,
  schedule,
  tasks,
  checklist,
  onSaveSchedule,
  onResetDay,
  onAddTask,
  onToggleTask,
  onToggleChecklist,
  onNavigateSection,
  reminderInfo,
}) => {
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [lessonDefaultStart, setLessonDefaultStart] = useState('07:15');
  const [lessonDefaultEnd, setLessonDefaultEnd] = useState('08:35');
  const [morningModalOpen, setMorningModalOpen] = useState(false);
  const [ekskulModalOpen, setEkskulModalOpen] = useState(false);
  const [editingEkskul, setEditingEkskul] = useState<ExtracurricularItem | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [homeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [switchingShift, setSwitchingShift] = useState(false);

  const dayMeta = DAYS_META.find((d) => d.key === selectedDay) || DAYS_META[0];
  const dayTasks = tasks.filter((t) => t.dayKey === selectedDay);
  const dayChecklist = checklist.filter((c) => c.dayKey === selectedDay);
  const checkedBagCount = dayChecklist.filter((c) => c.checked).length;
  const pendingTaskCount = dayTasks.filter((t) => !t.completed).length;

  const firstName = profile.fullName.split(' ')[0] || profile.fullName;

  const todayDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleSaveLesson = async (lesson: LessonItem) => {
    const exists = schedule.lessons.some((l) => l.id === lesson.id);
    const nextLessons = exists
      ? schedule.lessons.map((l) => (l.id === lesson.id ? lesson : l))
      : [...schedule.lessons, lesson].sort((a, b) => a.startTime.localeCompare(b.startTime));

    await onSaveSchedule({
      ...schedule,
      lessons: nextLessons,
    });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await onSaveSchedule({
      ...schedule,
      lessons: schedule.lessons.filter((l) => l.id !== lessonId),
    });
  };

  const handleSaveEkskul = async (item: ExtracurricularItem) => {
    const exists = schedule.extracurriculars.some((ex) => ex.id === item.id);
    const nextEkskul = exists
      ? schedule.extracurriculars.map((ex) => (ex.id === item.id ? item : ex))
      : [...schedule.extracurriculars, item];
    await onSaveSchedule({
      ...schedule,
      extracurriculars: nextEkskul,
    });
  };

  const handleDeleteEkskul = async (id: string) => {
    await onSaveSchedule({
      ...schedule,
      extracurriculars: schedule.extracurriculars.filter((ex) => ex.id !== id),
    });
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetDay(selectedDay);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bento Hero Row: Greeting (8 cols) + Daily Vibe Quote (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 bg-gradient-to-br from-[#EEFAF3] via-white to-[#EEF7FF] border border-[#DCEEE3] rounded-3xl p-6 sm:p-7 shadow-[0_6px_22px_-8px_rgba(15,118,110,0.10)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="p-1.5 rounded-[22px] bg-white shadow-xs w-fit shrink-0">
              <StudentAvatar
                avatarId={profile.avatarId}
                fullName={profile.fullName}
                customPhotoUrl={customPhotoUrl}
                sizeClass="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-emerald-900/75">
                <span>SMPN 3 KARAWANG</span>
                <span aria-hidden="true">·</span>
                <span>Kelas {profile.className}</span>
                <span aria-hidden="true">·</span>
                <span>{shift === 'pagi' ? '☀️ Shift Pagi' : '🌤️ Shift Siang'}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{todayDateFormatted}</span>
              </div>
              <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                Halo, {firstName}! Semangat sekolah hari ini{' '}
                <span className="animate-cute-wave" aria-hidden="true">
                  🚀
                </span>
              </h1>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-emerald-950/10 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500">Mapel {dayMeta.label}</p>
              <p className="mt-0.5 font-display text-xl font-extrabold text-slate-900 tabular-nums">
                {schedule.lessons.filter((l) => !l.isBreak).length} sesi
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">PR {dayMeta.label}</p>
              <p className="mt-0.5 font-display text-xl font-extrabold text-slate-900 tabular-nums">
                {pendingTaskCount} belum selesai
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Persiapan Tas</p>
              <p className="mt-0.5 font-display text-xl font-extrabold text-emerald-800 tabular-nums">
                {checkedBagCount}/{dayChecklist.length} siap
              </p>
            </div>
          </div>
        </div>

        {/* Daily Vibe / Quote Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="lg:col-span-4 bg-[#FFF5CC] border border-[#F5DF96] rounded-3xl p-6 shadow-[0_6px_22px_-8px_rgba(161,98,7,0.12)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                <span className="inline-block animate-cute-float" aria-hidden="true">
                  ✨
                </span>
                <span>Daily Vibe · {dayMeta.label}</span>
              </span>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                aria-label="Edit kutipan penyemangat"
                className="min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center text-amber-900/70 hover:text-amber-950 hover:bg-white/60 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <blockquote className="mt-3 font-display text-base sm:text-lg font-bold text-amber-950 leading-snug">
              “{schedule.dailyQuote}”
            </blockquote>
          </div>

          <p className="mt-5 text-xs font-semibold text-amber-900/80">
            {dayMeta.emoji} {dayMeta.subtitle} · Ruang pribadi {profile.fullName}
          </p>
        </motion.div>
      </div>

      {/* Live Schedule Reminder & Countdown Strip */}
      <ReminderStripCard
        todayLabel={reminderInfo.todayLabel}
        currentLesson={reminderInfo.currentLesson}
        nextLesson={reminderInfo.nextLesson}
        minutesUntilNext={reminderInfo.minutesUntilNext}
        settings={reminderInfo.settings}
        onOpenSettings={reminderInfo.onOpenSettings}
      />

      {/* Daily Study Tips Card */}
      <DailyStudyTipsCard selectedDay={selectedDay} dayLabel={dayMeta.label} />

      {/* Day Navigation Strip (Senin s.d. Minggu) */}
      <div
        role="tablist"
        aria-label="Pilih hari Senin sampai Minggu"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {DAYS_META.map((day) => {
          const isActive = selectedDay === day.key;
          return (
            <motion.button
              key={day.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => onSelectDay(day.key)}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-[0_4px_12px_-2px_rgba(15,118,110,0.35)]'
                  : 'bg-white border border-[#ECE6DA] text-slate-700 hover:bg-[#FFFDF7] hover:text-slate-900'
              }`}
            >
              <span aria-hidden="true">{day.emoji}</span>
              <span className="hidden sm:inline">{day.label}</span>
              <span className="sm:hidden">{day.short}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Bento Grid for Selected Day */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
        >
        {/* Left/Primary Column: Sesi Pagi + Jam Pelajaran Inti (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Sesi Pagi / Pembiasaan Karakter */}
          <section className="bg-[#E5F9EE] border border-[#C2EAD4] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_-8px_rgba(15,118,110,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  <span className="animate-cute-float inline-block">{schedule.morningEmoji}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs font-bold text-emerald-900">
                    <span>{dayMeta.isWeekend ? 'Rutinitas Pagi' : 'Pembiasaan Karakter Pagi'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{schedule.morningTime}</span>
                  </div>
                  <h2 className="mt-1 font-display text-lg font-bold text-emerald-950">
                    {schedule.morningTitle}
                  </h2>
                  {schedule.morningNote && (
                    <p className="mt-1 text-sm text-emerald-900/85 leading-relaxed">
                      {schedule.morningNote}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMorningModalOpen(true)}
                aria-label="Edit sesi pagi"
                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-emerald-900 hover:bg-white/70 transition-colors shrink-0 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Card 2: Jam Belajar Pagi & Jam Belajar Siang */}
          <section className="bg-white border border-[#ECE6DA] rounded-3xl p-5 sm:p-6 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {dayMeta.key === 'sabtu'
                    ? 'Pengembangan Bakat & Proyek P5'
                    : dayMeta.key === 'minggu'
                    ? 'Agenda Me-Time & Persiapan Sekolah'
                    : `Jam Belajar Pagi & Siang · ${dayMeta.label}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dayMeta.isWeekend
                    ? 'Fleksibel sesuai kebutuhan belajarmu di pagi dan siang hari.'
                    : 'Kurikulum Merdeka SMPN 3 KARAWANG · Pilih shift belajar atau tambah mapel.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  title="Kembalikan jadwal hari ini ke default SMPN 3 KARAWANG"
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resetting ? 'Mereset...' : 'Default'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLesson(null);
                    if (shift === 'siang') {
                      setLessonDefaultStart('12:00');
                      setLessonDefaultEnd('13:20');
                    } else {
                      setLessonDefaultStart('07:15');
                      setLessonDefaultEnd('08:35');
                    }
                    setLessonModalOpen(true);
                  }}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mapel</span>
                </button>
              </div>
            </div>

            {/* Shift Switcher: Jam Belajar Pagi vs Jam Belajar Siang */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-[#FAF7EE] border border-[#ECE6DA] rounded-2xl p-2">
              <span className="text-xs font-bold text-slate-600 px-2">
                {switchingShift ? 'Menerapkan jadwal shift...' : 'Pilih Shift Belajar:'}
              </span>
              <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
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
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    shift === 'pagi'
                      ? 'bg-[#E5F9EE] text-emerald-950 border border-[#C2EAD4] shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <span>☀️</span>
                  <span>Jam Belajar Pagi</span>
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
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                    shift === 'siang'
                      ? 'bg-[#FFF5CC] text-amber-950 border border-[#F5DF96] shadow-2xs'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  <span>🌤️</span>
                  <span>Jam Belajar Siang</span>
                </button>
              </div>
            </div>

            {schedule.lessons.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada jadwal pelajaran di hari {dayMeta.label}.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tambahkan mata pelajaran atau klik Default untuk memuat ulang jadwal sekolah.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                {[
                  {
                    id: 'pagi' as const,
                    title: '☀️ Jam Belajar Pagi (06:30 – 11:59)',
                    accent: 'text-emerald-900 bg-[#EEFAF3] border-[#DCEEE3]',
                    defaultStart: '08:00',
                    defaultEnd: '09:20',
                    addLabel: '+ Jam Pagi',
                    emptyText: 'Belum ada jadwal sesi pagi. Klik + Jam Pagi untuk menambah.',
                    items: schedule.lessons.filter((l) => l.startTime < '12:00'),
                  },
                  {
                    id: 'siang' as const,
                    title: '🌤️ Jam Belajar Siang (12:00 – 21:00)',
                    accent: 'text-amber-950 bg-[#FFF8DD] border-[#F5E4A4]',
                    defaultStart: '13:00',
                    defaultEnd: '14:20',
                    addLabel: '+ Jam Siang',
                    emptyText: 'Belum ada jadwal sesi siang. Klik + Jam Siang untuk menambah.',
                    items: schedule.lessons.filter((l) => l.startTime >= '12:00'),
                  },
                ].map((group) => (
                  <div key={group.id}>
                    <div
                      className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl border ${group.accent}`}
                    >
                      <span className="text-xs font-extrabold">{group.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLesson(null);
                          setLessonDefaultStart(group.defaultStart);
                          setLessonDefaultEnd(group.defaultEnd);
                          setLessonModalOpen(true);
                        }}
                        className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white/85 hover:bg-white text-slate-800 whitespace-nowrap cursor-pointer"
                      >
                        {group.addLabel}
                      </button>
                    </div>

                    {group.items.length === 0 ? (
                      <p className="py-3 px-2 text-xs text-slate-500">{group.emptyText}</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 mt-1">
                        {group.items.map((lesson) => (
                          <li
                            key={lesson.id}
                            className={`group py-3.5 flex items-center justify-between gap-3 ${
                              lesson.isBreak ? 'opacity-85' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6 ${
                                  THEME_ICON_BG[lesson.theme] || THEME_ICON_BG.mint
                                }`}
                              >
                                {lesson.emoji}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-sm sm:text-base font-bold truncate ${
                                    lesson.isBreak ? 'text-slate-600 italic' : 'text-slate-900'
                                  }`}
                                >
                                  {lesson.subject}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                  <span className="font-mono tabular-nums font-medium text-slate-700">
                                    {lesson.startTime} – {lesson.endTime}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate">{lesson.teacherOrPlace}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setLessonModalOpen(true);
                                }}
                                aria-label={`Edit ${lesson.subject}`}
                                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                aria-label={`Hapus ${lesson.subject}`}
                                className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right/Secondary Column: Ekstrakurikuler + Quick PR + Quick Bag Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 3: Kegiatan Sore / Ekstrakurikuler */}
          <section className="bg-[#F3ECFF] border border-[#DFD1FC] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_-8px_rgba(109,40,217,0.08)]">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-violet-200/70">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-violet-950">
                  Kegiatan & Ekstrakurikuler
                </h2>
                <p className="text-xs text-violet-900/75 mt-0.5">
                  {dayMeta.isWeekend
                    ? 'Kegiatan pilihan akhir pekan'
                    : shift === 'siang'
                    ? 'Pukul 09:30 – 11:00 WIB (Sebelum KBM Siang)'
                    : 'Pukul 15:00 – 17:00 WIB (Sepulang KBM Pagi)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingEkskul(null);
                  setEkskulModalOpen(true);
                }}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white text-violet-950 text-xs font-bold hover:bg-violet-50 flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {schedule.extracurriculars.length === 0 ? (
              <p className="pt-4 text-sm text-violet-900/80">
                Tidak ada jadwal ekskul sore pada hari {dayMeta.label}. Gunakan waktumu untuk istirahat atau hobi!
              </p>
            ) : (
              <ul className="divide-y divide-violet-200/60 mt-1">
                {schedule.extracurriculars.map((ex) => (
                  <li key={ex.id} className="group py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/85 flex items-center justify-center text-lg shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6">
                        {ex.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-violet-950 truncate">{ex.name}</p>
                        <p className="text-xs text-violet-900/80 mt-0.5">
                          <span className="font-mono tabular-nums">{ex.timeRange}</span> · {ex.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEkskul(ex);
                          setEkskulModalOpen(true);
                        }}
                        aria-label={`Edit ${ex.name}`}
                        className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-violet-800/70 hover:text-violet-950 hover:bg-white/70 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEkskul(ex.id)}
                        aria-label={`Hapus ${ex.name}`}
                        className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-violet-800/70 hover:text-rose-700 hover:bg-white/70 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Card 4: Catatan PR Hari Ini (Quick Bento Preview) */}
          <section className="bg-[#EEF6FF] border border-[#CEE3FC] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_-8px_rgba(29,78,216,0.07)]">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-blue-200/70">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-blue-950">
                  📝 PR & Tugas · {dayMeta.label}
                </h2>
                <p className="text-xs text-blue-900/75 mt-0.5 tabular-nums">
                  {pendingTaskCount} belum dikerjakan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHomeworkModalOpen(true)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white text-blue-950 text-xs font-bold hover:bg-blue-50 flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah PR</span>
              </button>
            </div>

            {dayTasks.length === 0 ? (
              <div className="py-5 text-center">
                <p className="text-sm text-slate-600">Belum ada PR untuk hari {dayMeta.label} 🎉</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 mt-1">
                {dayTasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="py-3 flex items-start gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      animate={{ scale: task.completed ? [1, 1.22, 1] : 1 }}
                      transition={{ duration: 0.24 }}
                      onClick={() => onToggleTask(task.id, !task.completed)}
                      aria-label={`Tandai ${task.title}`}
                      className="min-h-[40px] min-w-[40px] -ml-2 flex items-center justify-center text-emerald-700 cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </motion.button>
                    <div className="min-w-0 flex-1 pt-1.5">
                      <p
                        className={`text-sm font-bold leading-snug ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.subject} · Tenggat {task.dueDate}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => onNavigateSection('tugas')}
              className="mt-3 w-full min-h-[40px] rounded-xl text-xs font-bold text-[#0F766E] hover:bg-emerald-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Kelola semua PR & Tugas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* Card 5: Checklist Tas Cepat */}
          <section className="bg-[#FFF4EB] border border-[#F7DCC5] rounded-3xl p-5 sm:p-6 shadow-[0_6px_20px_-8px_rgba(194,65,12,0.07)]">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-orange-200/70">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-orange-950">
                  🎒 Checklist Tas · {dayMeta.label}
                </h2>
                <p className="text-xs text-orange-900/75 mt-0.5 tabular-nums">
                  {checkedBagCount} dari {dayChecklist.length} barang masuk tas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateSection('tas')}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white text-orange-950 text-xs font-bold hover:bg-orange-50 whitespace-nowrap cursor-pointer"
              >
                Atur Tas
              </button>
            </div>

            <ul className="divide-y divide-slate-100 mt-1">
              {dayChecklist.slice(0, 5).map((item) => (
                <li key={item.id} className="py-2.5 flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggleChecklist(item.id, !item.checked)}
                    className="w-full min-h-[42px] flex items-center gap-3 text-left cursor-pointer group"
                  >
                    <motion.span
                      animate={{ scale: item.checked ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.24 }}
                      className="shrink-0 flex items-center"
                    >
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                      )}
                    </motion.span>
                    <span className="text-base shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6">
                      {item.emoji}
                    </span>
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        item.checked ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <LessonModal
        open={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        initialLesson={editingLesson}
        defaultStartTime={lessonDefaultStart}
        defaultEndTime={lessonDefaultEnd}
        onSave={handleSaveLesson}
      />

      <MorningModal
        open={morningModalOpen}
        onClose={() => setMorningModalOpen(false)}
        title={schedule.morningTitle}
        time={schedule.morningTime}
        emoji={schedule.morningEmoji}
        note={schedule.morningNote}
        onSave={async (val) => {
          await onSaveSchedule({
            ...schedule,
            morningTitle: val.title,
            morningTime: val.time,
            morningEmoji: val.emoji,
            morningNote: val.note,
          });
        }}
      />

      <EkskulModal
        open={ekskulModalOpen}
        onClose={() => setEkskulModalOpen(false)}
        initialItem={editingEkskul}
        onSave={handleSaveEkskul}
      />

      <QuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialQuote={schedule.dailyQuote}
        onSave={async (q) => {
          await onSaveSchedule({
            ...schedule,
            dailyQuote: q,
          });
        }}
      />

      <HomeworkModal
        open={homeworkModalOpen}
        onClose={() => setHomeworkModalOpen(false)}
        defaultDay={selectedDay}
        initialTask={null}
        onSave={async (payload) => {
          await onAddTask(payload);
        }}
      />
    </div>
  );
};
