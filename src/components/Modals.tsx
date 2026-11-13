import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DAYS_META, SUBJECT_PRESETS } from '../data/defaultSchedules';
import { DayKey, ExtracurricularItem, HomeworkTask, LessonItem, PastelTheme } from '../types';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#EAE7E0] shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Lesson Add / Edit Modal                                                    */
/* -------------------------------------------------------------------------- */

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  initialLesson: LessonItem | null;
  defaultStartTime?: string;
  defaultEndTime?: string;
  onSave: (lesson: LessonItem) => Promise<void>;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  open,
  onClose,
  initialLesson,
  defaultStartTime = '07:15',
  defaultEndTime = '08:35',
  onSave,
}) => {
  const [subject, setSubject] = useState('');
  const [teacherOrPlace, setTeacherOrPlace] = useState('');
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [emoji, setEmoji] = useState('📘');
  const [theme, setTheme] = useState<PastelTheme>('mint');
  const [isBreak, setIsBreak] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialLesson) {
      setSubject(initialLesson.subject);
      setTeacherOrPlace(initialLesson.teacherOrPlace);
      setStartTime(initialLesson.startTime);
      setEndTime(initialLesson.endTime);
      setEmoji(initialLesson.emoji);
      setTheme(initialLesson.theme);
      setIsBreak(initialLesson.isBreak);
    } else {
      setSubject('');
      setTeacherOrPlace('Ruang Kelas');
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
      setEmoji('📐');
      setTheme('sky');
      setIsBreak(false);
    }
  }, [initialLesson, defaultStartTime, defaultEndTime, open]);

  const handlePresetClick = (preset: (typeof SUBJECT_PRESETS)[number]) => {
    setSubject(preset.subject);
    setEmoji(preset.emoji);
    setTheme(preset.theme);
    setIsBreak(Boolean(preset.isBreak));
    if (preset.isBreak) {
      setTeacherOrPlace('Kantin / Halaman Sekolah');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: initialLesson?.id || `lesson-${Date.now()}`,
        subject: subject.trim().slice(0, 80),
        teacherOrPlace: teacherOrPlace.trim().slice(0, 80) || 'Ruang Kelas',
        startTime,
        endTime,
        emoji: emoji.trim().slice(0, 8) || '📘',
        isBreak,
        theme,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={initialLesson ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran'}
      subtitle="Sesuaikan jadwal dengan kelasmu sendiri di SMPN 3 KARAWANG."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">Pilih Cepat Mapel Kurikulum Merdeka</p>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_PRESETS.map((preset) => (
              <button
                key={preset.subject}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  subject === preset.subject
                    ? 'border-emerald-700 bg-[#E6F7EE] text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {preset.emoji} {preset.subject.replace('Ilmu Pengetahuan ', 'IP').replace(' (Mulok)', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ikon</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={8}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Mata Pelajaran / Sesi</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Matematika"
              maxLength={80}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Guru / Lokasi / Jam Ke-</label>
          <input
            type="text"
            value={teacherOrPlace}
            onChange={(e) => setTeacherOrPlace(e.target.value)}
            placeholder="Contoh: Bu Siti · Ruang 8B · Jam 1–2"
            maxLength={80}
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Mulai</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Selesai</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Warna Kartu Pastel</label>
          <div className="grid grid-cols-5 gap-2">
            {(
              [
                { id: 'mint', label: 'Mint', cls: 'bg-[#D8F3DC] text-emerald-950' },
                { id: 'yellow', label: 'Kuning', cls: 'bg-[#FFF3BF] text-amber-950' },
                { id: 'sky', label: 'Biru', cls: 'bg-[#D0EBFF] text-blue-950' },
                { id: 'lavender', label: 'Ungu', cls: 'bg-[#E5DBFF] text-violet-950' },
                { id: 'neutral', label: 'Istirahat', cls: 'bg-slate-100 text-slate-800' },
              ] as { id: PastelTheme; label: string; cls: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsBreak(t.id === 'neutral');
                }}
                className={`min-h-[40px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${t.cls} ${
                  theme === t.id ? 'border-slate-900 ring-2 ring-slate-900/15' : 'border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Morning Activity Modal                                                     */
/* -------------------------------------------------------------------------- */

interface MorningModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  time: string;
  emoji: string;
  note: string;
  onSave: (val: { title: string; time: string; emoji: string; note: string }) => Promise<void>;
}

export const MorningModal: React.FC<MorningModalProps> = ({
  open,
  onClose,
  title,
  time,
  emoji,
  note,
  onSave,
}) => {
  const [mTitle, setMTitle] = useState(title);
  const [mTime, setMTime] = useState(time);
  const [mEmoji, setMEmoji] = useState(emoji);
  const [mNote, setMNote] = useState(note);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMTitle(title);
    setMTime(time);
    setMEmoji(emoji);
    setMNote(note);
  }, [title, time, emoji, note, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title: mTitle.trim().slice(0, 120) || 'Pembiasaan Pagi',
        time: mTime.trim().slice(0, 40) || '06:30 – 07:15',
        emoji: mEmoji.trim().slice(0, 8) || '☀️',
        note: mNote.trim().slice(0, 240),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Sesi Pagi / Pembiasaan"
      subtitle="Atur kegiatan pembiasaan karakter sebelum pelajaran dimulai."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Emoji</label>
            <input
              type="text"
              value={mEmoji}
              onChange={(e) => setMEmoji(e.target.value)}
              maxLength={8}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Kegiatan Pagi</label>
            <input
              type="text"
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              maxLength={120}
              required
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Waktu</label>
          <input
            type="text"
            value={mTime}
            onChange={(e) => setMTime(e.target.value)}
            placeholder="06:30 – 07:15"
            maxLength={40}
            required
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Tambahan</label>
          <textarea
            value={mNote}
            onChange={(e) => setMNote(e.target.value)}
            rows={3}
            maxLength={240}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Extracurricular Add / Edit Modal                                           */
/* -------------------------------------------------------------------------- */

interface EkskulModalProps {
  open: boolean;
  onClose: () => void;
  initialItem: ExtracurricularItem | null;
  onSave: (item: ExtracurricularItem) => Promise<void>;
}

const EKSKUL_PRESETS = [
  { name: 'Pramuka Penggalang', emoji: '⚜️' },
  { name: 'Paskibra SMPN 3 KARAWANG', emoji: '🎖️' },
  { name: 'PMR', emoji: '🩹' },
  { name: 'Futsal / Basket', emoji: '⚽' },
  { name: 'Seni Tari / Paduan Suara', emoji: '🎶' },
  { name: 'English Club', emoji: '💬' },
  { name: 'Karya Ilmiah Remaja (KIR)', emoji: '🧪' },
];

export const EkskulModal: React.FC<EkskulModalProps> = ({
  open,
  onClose,
  initialItem,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [timeRange, setTimeRange] = useState('15:00 – 17:00');
  const [emoji, setEmoji] = useState('⚜️');
  const [location, setLocation] = useState('Lapangan Sekolah');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setTimeRange(initialItem.timeRange);
      setEmoji(initialItem.emoji);
      setLocation(initialItem.location);
    } else {
      setName('');
      setTimeRange('15:00 – 17:00');
      setEmoji('⚜️');
      setLocation('Lapangan Sekolah');
    }
  }, [initialItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: initialItem?.id || `ex-${Date.now()}`,
        name: name.trim().slice(0, 80),
        timeRange: timeRange.trim().slice(0, 40) || '15:00 – 17:00',
        emoji: emoji.trim().slice(0, 8) || '⭐',
        location: location.trim().slice(0, 80) || 'Area Sekolah',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={initialItem ? 'Ubah Kegiatan Sore / Ekskul' : 'Tambah Kegiatan Sore / Ekskul'}
      subtitle="Catat jadwal ekstrakurikuler atau aktivitas sore pilihanmu."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {EKSKUL_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setName(p.name);
                setEmoji(p.emoji);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                name === p.name
                  ? 'border-emerald-700 bg-[#E6F7EE] text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={8}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-center text-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Ekskul / Kegiatan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="Contoh: Pramuka Penggalang"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Waktu</label>
            <input
              type="text"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              maxLength={40}
              placeholder="15:00 – 17:00"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tempat</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
              placeholder="Lapangan Utama"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Ekskul'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Homework Add / Edit Modal                                                  */
/* -------------------------------------------------------------------------- */

interface HomeworkModalProps {
  open: boolean;
  onClose: () => void;
  defaultDay: DayKey;
  initialTask: HomeworkTask | null;
  onSave: (payload: {
    dayKey: DayKey;
    subject: string;
    title: string;
    notes: string;
    dueDate: string;
    completed: boolean;
  }) => Promise<void>;
}

export const HomeworkModal: React.FC<HomeworkModalProps> = ({
  open,
  onClose,
  defaultDay,
  initialTask,
  onSave,
}) => {
  const [dayKey, setDayKey] = useState<DayKey>(defaultDay);
  const [subject, setSubject] = useState('Matematika');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setDayKey(initialTask.dayKey);
      setSubject(initialTask.subject);
      setTitle(initialTask.title);
      setNotes(initialTask.notes);
      setDueDate(initialTask.dueDate);
    } else {
      setDayKey(defaultDay);
      setSubject('Matematika');
      setTitle('');
      setNotes('');
      const dayLabel = DAYS_META.find((d) => d.key === defaultDay)?.label || 'Senin';
      setDueDate(dayLabel);
    }
  }, [initialTask, defaultDay, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        dayKey,
        subject: subject.trim() || 'Umum',
        title: title.trim(),
        notes: notes.trim(),
        dueDate: dueDate.trim() || 'Pekan Ini',
        completed: initialTask?.completed || false,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={initialTask ? 'Ubah Catatan PR / Tugas' : 'Tambah Catatan PR / Tugas'}
      subtitle="Hanya akunmu sendiri yang bisa melihat dan mencentang tugas ini."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Untuk Hari</label>
            <select
              value={dayKey}
              onChange={(e) => setDayKey(e.target.value as DayKey)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {DAYS_META.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={80}
              required
              placeholder="Contoh: IPA"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Tugas / PR</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
            required
            placeholder="Contoh: Merangkum Bab Ekosistem halaman 45"
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Tenggat Pengumpulan</label>
          <input
            type="text"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            maxLength={40}
            placeholder="Contoh: Besok pagi / Jumat"
            className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Detail (Opsional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Kerjakan di buku tulis atau bawa karton manila..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Tugas'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Daily Quote Edit Modal                                                     */
/* -------------------------------------------------------------------------- */

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  initialQuote: string;
  onSave: (quote: string) => Promise<void>;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  open,
  onClose,
  initialQuote,
  onSave,
}) => {
  const [quote, setQuote] = useState(initialQuote);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuote(initialQuote);
  }, [initialQuote, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(quote.trim().slice(0, 280) || 'Tetap semangat belajar hari ini!');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Ubah Quote Penyemangat Hari Ini"
      subtitle="Tulis kalimat motivasi versimu sendiri."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={3}
          maxLength={280}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-bold cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Quote'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};
