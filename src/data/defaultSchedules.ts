import type { AvatarId, DayKey, DaySchedule, PastelTheme, SchoolShift } from '../types';
import avatarMint from '../assets/images/avatar_mint_scholar_1794585478926.jpg';
import avatarYellow from '../assets/images/avatar_yellow_creator_1794585480481.jpg';
import avatarSky from '../assets/images/avatar_sky_athlete_1794585480935.jpg';
import avatarLavender from '../assets/images/avatar_lavender_reader_1794585479576.jpg';

export interface AvatarOption {
  id: AvatarId;
  label: string;
  bgClass: string;
  src: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'mint',
    label: 'Cendekia Mint',
    bgClass: 'bg-[#D8F3DC]',
    src: avatarMint,
  },
  {
    id: 'yellow',
    label: 'Kreator Ceria',
    bgClass: 'bg-[#FFF3BF]',
    src: avatarYellow,
  },
  {
    id: 'sky',
    label: 'Penggalang Aktif',
    bgClass: 'bg-[#D0EBFF]',
    src: avatarSky,
  },
  {
    id: 'lavender',
    label: 'Sahabat Literasi',
    bgClass: 'bg-[#E5DBFF]',
    src: avatarLavender,
  },
];

export const DAYS_META: {
  key: DayKey;
  label: string;
  short: string;
  emoji: string;
  subtitle: string;
  isWeekend: boolean;
}[] = [
  { key: 'senin', label: 'Senin', short: 'Sen', emoji: '🌟', subtitle: 'Upacara & Awal Pekan', isWeekend: false },
  { key: 'selasa', label: 'Selasa', short: 'Sel', emoji: '📚', subtitle: 'Literasi & Sains', isWeekend: false },
  { key: 'rabu', label: 'Rabu', short: 'Rab', emoji: '⚽', subtitle: 'Tadarus & Kebugaran', isWeekend: false },
  { key: 'kamis', label: 'Kamis', short: 'Kam', emoji: '🎋', subtitle: 'Kamis Nyunda & Karya', isWeekend: false },
  { key: 'jumat', label: 'Jumat', short: 'Jum', emoji: '🌿', subtitle: 'Senam & Jumat Bersih', isWeekend: false },
  { key: 'sabtu', label: 'Sabtu', short: 'Sab', emoji: '🎨', subtitle: 'Bakat, Ekskul & P5', isWeekend: true },
  { key: 'minggu', label: 'Minggu', short: 'Min', emoji: '☁️', subtitle: 'Me-Time & Recharge', isWeekend: true },
];

const CLASS_LETTERS = 'ABCDEFGHIJKLMNOPQ'.split('');
export const CLASS_OPTIONS: string[] = ['7', '8', '9'].flatMap((grade) =>
  CLASS_LETTERS.map((letter) => `${grade}${letter}`)
);

export const SUBJECT_PRESETS: {
  subject: string;
  emoji: string;
  theme: PastelTheme;
  isBreak?: boolean;
}[] = [
  { subject: 'Matematika', emoji: '📐', theme: 'sky' },
  { subject: 'Ilmu Pengetahuan Alam (IPA)', emoji: '🔬', theme: 'mint' },
  { subject: 'Ilmu Pengetahuan Sosial (IPS)', emoji: '🌏', theme: 'yellow' },
  { subject: 'Bahasa Indonesia', emoji: '📖', theme: 'lavender' },
  { subject: 'Bahasa Inggris', emoji: '🗣️', theme: 'sky' },
  { subject: 'Informatika', emoji: '💻', theme: 'mint' },
  { subject: 'Pendidikan Pancasila', emoji: '🇮🇩', theme: 'yellow' },
  { subject: 'PJOK', emoji: '⚽', theme: 'mint' },
  { subject: 'Seni Budaya', emoji: '🎨', theme: 'lavender' },
  { subject: 'Pendidikan Agama', emoji: '🕌', theme: 'mint' },
  { subject: 'Bahasa Sunda (Mulok)', emoji: '🎋', theme: 'yellow' },
  { subject: 'Proyek P5', emoji: '🧩', theme: 'lavender' },
  { subject: 'Istirahat', emoji: '🍱', theme: 'neutral', isBreak: true },
];

export function getTodayDayKey(): DayKey {
  const jsDay = new Date().getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
  const map: DayKey[] = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  return map[jsDay] || 'senin';
}

export function buildDefaultDaySchedule(
  userId: string,
  dayKey: DayKey,
  shift: SchoolShift = 'pagi'
): DaySchedule {
  const pagiDefaults: Record<DayKey, Omit<DaySchedule, 'userId' | 'updatedAt'>> = {
    senin: {
      dayKey: 'senin',
      morningTitle: 'Upacara Bendera & Pembinaan Karakter',
      morningTime: '06:30 – 07:15',
      morningEmoji: '🇮🇩',
      morningNote: 'Seragam Putih-Biru lengkap dengan dasi, topi sekolah, dan ikat pinggang.',
      lessons: [
        { id: 'sen-1', subject: 'Pendidikan Pancasila', teacherOrPlace: 'Ruang Kelas · Jam Pagi 1–2', startTime: '07:15', endTime: '08:35', emoji: '🇮🇩', isBreak: false, theme: 'yellow' },
        { id: 'sen-2', subject: 'Matematika', teacherOrPlace: 'Ruang Kelas · Jam Pagi 3–4', startTime: '08:35', endTime: '09:55', emoji: '📐', isBreak: false, theme: 'sky' },
        { id: 'sen-b1', subject: 'Istirahat Pertama', teacherOrPlace: 'Kantin / Halaman', startTime: '09:55', endTime: '10:15', emoji: '🥪', isBreak: true, theme: 'neutral' },
        { id: 'sen-3', subject: 'Bahasa Indonesia', teacherOrPlace: 'Ruang Kelas · Jam Pagi 5–6', startTime: '10:15', endTime: '11:35', emoji: '📖', isBreak: false, theme: 'lavender' },
        { id: 'sen-b2', subject: 'Istirahat & Shalat Dzuhur', teacherOrPlace: 'Masjid Sekolah', startTime: '11:35', endTime: '12:20', emoji: '🕌', isBreak: true, theme: 'neutral' },
        { id: 'sen-4', subject: 'Ilmu Pengetahuan Alam (IPA)', teacherOrPlace: 'Lab IPA · Jam Siang 7–8', startTime: '12:20', endTime: '13:40', emoji: '🔬', isBreak: false, theme: 'mint' },
        { id: 'sen-5', subject: 'Bahasa Sunda (Mulok)', teacherOrPlace: 'Ruang Kelas · Jam Siang 9', startTime: '13:40', endTime: '14:30', emoji: '🎋', isBreak: false, theme: 'yellow' },
      ],
      extracurriculars: [
        { id: 'sen-ex-1', name: 'Paskibra SMPN 3 KARAWANG', timeRange: '15:00 – 16:30', emoji: '🎖️', location: 'Lapangan Utama' },
        { id: 'sen-ex-2', name: 'English Club', timeRange: '15:30 – 17:00', emoji: '💬', location: 'Ruang Multimedia' },
      ],
      dailyQuote: 'Awal minggu yang keren dimulai dari tas yang siap sejak malam dan senyum paling ramah di gerbang sekolah!',
    },
    selasa: {
      dayKey: 'selasa',
      morningTitle: 'Gerakan Literasi Pagi & Membaca Nyaring',
      morningTime: '06:30 – 07:15',
      morningEmoji: '📚',
      morningNote: 'Bawa 1 buku bacaan fiksi atau non-fiksi favorit untuk dirangkum di jurnal literasi.',
      lessons: [
        { id: 'sel-1', subject: 'Bahasa Inggris', teacherOrPlace: 'Ruang Kelas · Jam Pagi 1–2', startTime: '07:15', endTime: '08:35', emoji: '🗣️', isBreak: false, theme: 'sky' },
        { id: 'sel-2', subject: 'Ilmu Pengetahuan Sosial (IPS)', teacherOrPlace: 'Ruang Kelas · Jam Pagi 3–4', startTime: '08:35', endTime: '09:55', emoji: '🌏', isBreak: false, theme: 'yellow' },
        { id: 'sel-b1', subject: 'Istirahat Pertama', teacherOrPlace: 'Kantin Sehat', startTime: '09:55', endTime: '10:15', emoji: '🧃', isBreak: true, theme: 'neutral' },
        { id: 'sel-3', subject: 'Informatika', teacherOrPlace: 'Lab Komputer · Jam Pagi 5–6', startTime: '10:15', endTime: '11:35', emoji: '💻', isBreak: false, theme: 'mint' },
        { id: 'sel-b2', subject: 'Istirahat & Shalat Dzuhur', teacherOrPlace: 'Masjid Sekolah', startTime: '11:35', endTime: '12:20', emoji: '🕌', isBreak: true, theme: 'neutral' },
        { id: 'sel-4', subject: 'Seni Budaya', teacherOrPlace: 'Studio Seni · Jam Siang 7–8', startTime: '12:20', endTime: '13:40', emoji: '🎨', isBreak: false, theme: 'lavender' },
        { id: 'sel-5', subject: 'Matematika', teacherOrPlace: 'Ruang Kelas · Jam Siang 9', startTime: '13:40', endTime: '14:30', emoji: '📐', isBreak: false, theme: 'sky' },
      ],
      extracurriculars: [
        { id: 'sel-ex-1', name: 'Futsal & Basket Putra/Putri', timeRange: '15:00 – 17:00', emoji: '🏀', location: 'Lapangan Olahraga' },
        { id: 'sel-ex-2', name: 'Paduan Suara', timeRange: '15:15 – 16:45', emoji: '🎶', location: 'Ruang Musik' },
      ],
      dailyQuote: 'Satu halaman buku setiap pagi bikin wawasanmu selangkah lebih luas dari kemarin.',
    },
    rabu: {
      dayKey: 'rabu',
      morningTitle: 'Tadarus Pagi & Pembiasaan Akhlak Mulia',
      morningTime: '06:30 – 07:15',
      morningEmoji: '🤲',
      morningNote: 'Membaca Juz Amma bersama di kelas dan refleksi kebaikan harian.',
      lessons: [
        { id: 'rab-1', subject: 'PJOK (Olahraga)', teacherOrPlace: 'Lapangan · Jam Pagi 1–2', startTime: '07:15', endTime: '08:35', emoji: '⚽', isBreak: false, theme: 'mint' },
        { id: 'rab-2', subject: 'Ilmu Pengetahuan Alam (IPA)', teacherOrPlace: 'Ruang Kelas · Jam Pagi 3–4', startTime: '08:35', endTime: '09:55', emoji: '🔬', isBreak: false, theme: 'mint' },
        { id: 'rab-b1', subject: 'Istirahat Pertama', teacherOrPlace: 'Kantin / Taman', startTime: '09:55', endTime: '10:15', emoji: '🍙', isBreak: true, theme: 'neutral' },
        { id: 'rab-3', subject: 'Bahasa Indonesia', teacherOrPlace: 'Ruang Kelas · Jam Pagi 5–6', startTime: '10:15', endTime: '11:35', emoji: '📖', isBreak: false, theme: 'lavender' },
        { id: 'rab-b2', subject: 'Istirahat & Shalat Dzuhur', teacherOrPlace: 'Masjid Sekolah', startTime: '11:35', endTime: '12:20', emoji: '🕌', isBreak: true, theme: 'neutral' },
        { id: 'rab-4', subject: 'Pendidikan Agama & Budi Pekerti', teacherOrPlace: 'Ruang Kelas · Jam Siang 7–8', startTime: '12:20', endTime: '13:40', emoji: '🕌', isBreak: false, theme: 'mint' },
        { id: 'rab-5', subject: 'Ilmu Pengetahuan Sosial (IPS)', teacherOrPlace: 'Ruang Kelas · Jam Siang 9', startTime: '13:40', endTime: '14:30', emoji: '🌏', isBreak: false, theme: 'yellow' },
      ],
      extracurriculars: [
        { id: 'rab-ex-1', name: 'Palang Merah Remaja (PMR)', timeRange: '15:00 – 16:45', emoji: '🩹', location: 'Ruang UKS' },
        { id: 'rab-ex-2', name: 'Karya Ilmiah Remaja (KIR)', timeRange: '15:00 – 17:00', emoji: '🧪', location: 'Lab IPA' },
      ],
      dailyQuote: 'Rabu itu tengah pekan: badan sehat lewat PJOK, hati tenang lewat doa pagi.',
    },
    kamis: {
      dayKey: 'kamis',
      morningTitle: 'Kamis Nyunda & Apresiasi Budaya Lokal',
      morningTime: '06:30 – 07:15',
      morningEmoji: '🎋',
      morningNote: 'Membiasakan sapaan ramah Bahasa Sunda (Wilujeng enjing!) dan literasi aksara/budaya Karawang.',
      lessons: [
        { id: 'kam-1', subject: 'Matematika', teacherOrPlace: 'Ruang Kelas · Jam Pagi 1–2', startTime: '07:15', endTime: '08:35', emoji: '📐', isBreak: false, theme: 'sky' },
        { id: 'kam-2', subject: 'Bahasa Inggris', teacherOrPlace: 'Ruang Kelas · Jam Pagi 3–4', startTime: '08:35', endTime: '09:55', emoji: '🗣️', isBreak: false, theme: 'sky' },
        { id: 'kam-b1', subject: 'Istirahat Pertama', teacherOrPlace: 'Kantin Sekolah', startTime: '09:55', endTime: '10:15', emoji: '🥨', isBreak: true, theme: 'neutral' },
        { id: 'kam-3', subject: 'Bahasa Sunda (Mulok)', teacherOrPlace: 'Ruang Kelas · Jam Pagi 5–6', startTime: '10:15', endTime: '11:35', emoji: '🎋', isBreak: false, theme: 'yellow' },
        { id: 'kam-b2', subject: 'Istirahat & Shalat Dzuhur', teacherOrPlace: 'Masjid Sekolah', startTime: '11:35', endTime: '12:20', emoji: '🕌', isBreak: true, theme: 'neutral' },
        { id: 'kam-4', subject: 'Informatika', teacherOrPlace: 'Lab Komputer · Jam Siang 7–8', startTime: '12:20', endTime: '13:40', emoji: '💻', isBreak: false, theme: 'mint' },
        { id: 'kam-5', subject: 'Bahasa Indonesia', teacherOrPlace: 'Ruang Kelas · Jam Siang 9', startTime: '13:40', endTime: '14:30', emoji: '📖', isBreak: false, theme: 'lavender' },
      ],
      extracurriculars: [
        { id: 'kam-ex-1', name: 'Seni Tari Tradisional & Modern', timeRange: '15:00 – 16:45', emoji: '💃', location: 'Aula Sekolah' },
        { id: 'kam-ex-2', name: 'Pramuka Inti Penggalang', timeRange: '15:00 – 17:00', emoji: '⚜️', location: 'Lapangan Utama' },
      ],
      dailyQuote: 'Bangga berbahasa daerah, jago teknologi masa depan—itulah siswa SMPN 3 KARAWANG!',
    },
    jumat: {
      dayKey: 'jumat',
      morningTitle: 'Senam Pagi, Shalat Dhuha & Jumat Bersih',
      morningTime: '06:30 – 07:30',
      morningEmoji: '🌿',
      morningNote: 'Pakai seragam olahraga/muslim sesuai ketentuan, lalu kerja bakti merawat kelas dan taman.',
      lessons: [
        { id: 'jum-1', subject: 'Ilmu Pengetahuan Alam (IPA)', teacherOrPlace: 'Ruang Kelas · Jam Pagi 1–2', startTime: '07:30', endTime: '08:50', emoji: '🔬', isBreak: false, theme: 'mint' },
        { id: 'jum-2', subject: 'Pendidikan Pancasila', teacherOrPlace: 'Ruang Kelas · Jam Pagi 3', startTime: '08:50', endTime: '09:30', emoji: '🇮🇩', isBreak: false, theme: 'yellow' },
        { id: 'jum-b1', subject: 'Istirahat & Kudapan Sehat', teacherOrPlace: 'Selasar Kelas', startTime: '09:30', endTime: '09:50', emoji: '🍌', isBreak: true, theme: 'neutral' },
        { id: 'jum-3', subject: 'Seni Budaya & Prakarya', teacherOrPlace: 'Studio Seni · Jam Pagi 4–5', startTime: '09:50', endTime: '11:15', emoji: '🎨', isBreak: false, theme: 'lavender' },
        { id: 'jum-4', subject: 'Review Materi & Tugas Akhir Pekan', teacherOrPlace: 'Rumah / Perpustakaan · Jam Siang', startTime: '13:30', endTime: '14:30', emoji: '📝', isBreak: false, theme: 'sky' },
      ],
      extracurriculars: [
        { id: 'jum-ex-1', name: 'Pramuka Wajib Penggalang', timeRange: '15:00 – 17:00', emoji: '⚜️', location: 'Lapangan SMPN 3 KARAWANG' },
      ],
      dailyQuote: 'Kelas yang bersih bikin pikiran segar dan ilmu lebih gampang masuk. Semangat Jumat Berkah!',
    },
    sabtu: {
      dayKey: 'sabtu',
      morningTitle: 'Sarapan Sehat & Persiapan Pengembangan Bakat',
      morningTime: '07:00 – 08:00',
      morningEmoji: '☀️',
      morningNote: 'Siapkan perlengkapan proyek P5 atau perlengkapan ekskul sebelum berangkat.',
      lessons: [
        { id: 'sab-1', subject: 'Proyek P5 (Profil Pelajar Pancasila)', teacherOrPlace: 'Aula / Kelompok Kelas · Jam Pagi', startTime: '08:00', endTime: '10:00', emoji: '🧩', isBreak: false, theme: 'lavender' },
        { id: 'sab-b1', subject: 'Istirahat & Diskusi Santai', teacherOrPlace: 'Taman Sekolah', startTime: '10:00', endTime: '10:20', emoji: '🥤', isBreak: true, theme: 'neutral' },
        { id: 'sab-2', subject: 'Ekskul Gabungan & Persiapan Lomba', teacherOrPlace: 'Lapangan / Lab · Jam Pagi', startTime: '10:20', endTime: '11:55', emoji: '🏆', isBreak: false, theme: 'sky' },
        { id: 'sab-3', subject: 'Belajar Mandiri & Evaluasi Mingguan', teacherOrPlace: 'Rumah · Jam Siang', startTime: '13:30', endTime: '15:00', emoji: '📚', isBreak: false, theme: 'mint' },
      ],
      extracurriculars: [
        { id: 'sab-ex-1', name: 'Klub Olimpiade Sains & Matematika', timeRange: '13:00 – 14:30', emoji: '🏅', location: 'Perpustakaan' },
        { id: 'sab-ex-2', name: 'Latihan Sparring Futsal / Basket', timeRange: '15:30 – 17:00', emoji: '⚽', location: 'GOR / Lapangan' },
      ],
      dailyQuote: 'Sabtu adalah waktunya mengasah bakat unikmu dan berkarya bareng teman sekelompok!',
    },
    minggu: {
      dayKey: 'minggu',
      morningTitle: 'Olahraga Santai & Jalan Pagi',
      morningTime: '06:30 – 08:00',
      morningEmoji: '🏃',
      morningNote: 'Gerak badan ringan di rumah atau car free day biar badan tetap bugar.',
      lessons: [
        { id: 'min-1', subject: 'Me-Time & Hobi Kreatif', teacherOrPlace: 'Rumah · Jam Pagi', startTime: '09:00', endTime: '11:30', emoji: '🎧', isBreak: false, theme: 'lavender' },
        { id: 'min-b1', subject: 'Makan Siang & Kumpul Keluarga', teacherOrPlace: 'Bersama Keluarga', startTime: '12:00', endTime: '14:00', emoji: '🍽️', isBreak: true, theme: 'neutral' },
        { id: 'min-2', subject: 'Review Catatan & Rapikan Meja Belajar', teacherOrPlace: 'Kamar Belajar · Jam Siang', startTime: '16:00', endTime: '17:00', emoji: '📝', isBreak: false, theme: 'mint' },
        { id: 'min-3', subject: 'Siapkan Seragam & Isi Tas untuk Senin', teacherOrPlace: 'Cek Checklist Tas', startTime: '19:30', endTime: '20:30', emoji: '🎒', isBreak: false, theme: 'yellow' },
      ],
      extracurriculars: [],
      dailyQuote: 'Istirahat yang cukup hari ini adalah bahan bakar terbaik untuk menang di hari Senin!',
    },
  };

  if (shift === 'pagi') {
    return {
      userId,
      ...pagiDefaults[dayKey],
    };
  }

  // Shift Siang (Jam Belajar Pagi = Belajar Mandiri/Ekskul, Jam Belajar Siang = KBM Siang 12:00 - 17:30)
  const base = pagiDefaults[dayKey];
  if (dayKey === 'sabtu' || dayKey === 'minggu') {
    return {
      userId,
      ...base,
    };
  }

  const siangLessonsByDay: Record<Exclude<DayKey, 'sabtu' | 'minggu'>, DaySchedule['lessons']> = {
    senin: [
      { id: 'sen-p1', subject: 'Belajar Mandiri & Cek PR Hari Ini', teacherOrPlace: 'Rumah · Jam Belajar Pagi', startTime: '08:00', endTime: '09:30', emoji: '📝', isBreak: false, theme: 'mint' },
      { id: 'sen-s0', subject: 'Apel Siang & Pembinaan Karakter', teacherOrPlace: 'Lapangan · Masuk Shift Siang', startTime: '12:00', endTime: '12:30', emoji: '🇮🇩', isBreak: false, theme: 'yellow' },
      { id: 'sen-s1', subject: 'Pendidikan Pancasila', teacherOrPlace: 'Ruang Kelas · Jam Siang 1–2', startTime: '12:30', endTime: '13:50', emoji: '🇮🇩', isBreak: false, theme: 'yellow' },
      { id: 'sen-s2', subject: 'Matematika', teacherOrPlace: 'Ruang Kelas · Jam Siang 3–4', startTime: '13:50', endTime: '15:10', emoji: '📐', isBreak: false, theme: 'sky' },
      { id: 'sen-sb1', subject: 'Istirahat & Shalat Ashar', teacherOrPlace: 'Masjid Sekolah', startTime: '15:10', endTime: '15:35', emoji: '🕌', isBreak: true, theme: 'neutral' },
      { id: 'sen-s3', subject: 'Bahasa Indonesia', teacherOrPlace: 'Ruang Kelas · Jam Siang 5–6', startTime: '15:35', endTime: '16:45', emoji: '📖', isBreak: false, theme: 'lavender' },
      { id: 'sen-s4', subject: 'Bahasa Sunda (Mulok)', teacherOrPlace: 'Ruang Kelas · Jam Siang 7', startTime: '16:45', endTime: '17:30', emoji: '🎋', isBreak: false, theme: 'yellow' },
    ],
    selasa: [
      { id: 'sel-p1', subject: 'Latihan Soal & Persiapan Materi', teacherOrPlace: 'Rumah · Jam Belajar Pagi', startTime: '08:00', endTime: '09:30', emoji: '📚', isBreak: false, theme: 'sky' },
      { id: 'sel-s1', subject: 'Bahasa Inggris', teacherOrPlace: 'Ruang Kelas · Jam Siang 1–2', startTime: '12:30', endTime: '13:50', emoji: '🗣️', isBreak: false, theme: 'sky' },
      { id: 'sel-s2', subject: 'Ilmu Pengetahuan Sosial (IPS)', teacherOrPlace: 'Ruang Kelas · Jam Siang 3–4', startTime: '13:50', endTime: '15:10', emoji: '🌏', isBreak: false, theme: 'yellow' },
      { id: 'sel-sb1', subject: 'Istirahat & Shalat Ashar', teacherOrPlace: 'Masjid Sekolah', startTime: '15:10', endTime: '15:35', emoji: '🕌', isBreak: true, theme: 'neutral' },
      { id: 'sel-s3', subject: 'Informatika', teacherOrPlace: 'Lab Komputer · Jam Siang 5–6', startTime: '15:35', endTime: '16:45', emoji: '💻', isBreak: false, theme: 'mint' },
      { id: 'sel-s4', subject: 'Seni Budaya', teacherOrPlace: 'Studio Seni · Jam Siang 7', startTime: '16:45', endTime: '17:30', emoji: '🎨', isBreak: false, theme: 'lavender' },
    ],
    rabu: [
      { id: 'rab-p1', subject: 'Membaca & Merangkum Buku Paket', teacherOrPlace: 'Rumah · Jam Belajar Pagi', startTime: '08:00', endTime: '09:30', emoji: '📖', isBreak: false, theme: 'lavender' },
      { id: 'rab-s1', subject: 'PJOK (Olahraga)', teacherOrPlace: 'Lapangan · Jam Siang 1–2', startTime: '12:30', endTime: '13:50', emoji: '⚽', isBreak: false, theme: 'mint' },
      { id: 'rab-s2', subject: 'Ilmu Pengetahuan Alam (IPA)', teacherOrPlace: 'Lab IPA · Jam Siang 3–4', startTime: '13:50', endTime: '15:10', emoji: '🔬', isBreak: false, theme: 'mint' },
      { id: 'rab-sb1', subject: 'Istirahat & Shalat Ashar', teacherOrPlace: 'Masjid Sekolah', startTime: '15:10', endTime: '15:35', emoji: '🕌', isBreak: true, theme: 'neutral' },
      { id: 'rab-s3', subject: 'Pendidikan Agama & Budi Pekerti', teacherOrPlace: 'Ruang Kelas · Jam Siang 5–6', startTime: '15:35', endTime: '16:45', emoji: '🕌', isBreak: false, theme: 'mint' },
      { id: 'rab-s4', subject: 'Bahasa Indonesia', teacherOrPlace: 'Ruang Kelas · Jam Siang 7', startTime: '16:45', endTime: '17:30', emoji: '📖', isBreak: false, theme: 'lavender' },
    ],
    kamis: [
      { id: 'kam-p1', subject: 'Berlatih Kosakata Sunda & Inggris', teacherOrPlace: 'Rumah · Jam Belajar Pagi', startTime: '08:00', endTime: '09:30', emoji: '🎋', isBreak: false, theme: 'yellow' },
      { id: 'kam-s1', subject: 'Matematika', teacherOrPlace: 'Ruang Kelas · Jam Siang 1–2', startTime: '12:30', endTime: '13:50', emoji: '📐', isBreak: false, theme: 'sky' },
      { id: 'kam-s2', subject: 'Bahasa Sunda (Mulok)', teacherOrPlace: 'Ruang Kelas · Jam Siang 3–4', startTime: '13:50', endTime: '15:10', emoji: '🎋', isBreak: false, theme: 'yellow' },
      { id: 'kam-sb1', subject: 'Istirahat & Shalat Ashar', teacherOrPlace: 'Masjid Sekolah', startTime: '15:10', endTime: '15:35', emoji: '🕌', isBreak: true, theme: 'neutral' },
      { id: 'kam-s3', subject: 'Bahasa Inggris', teacherOrPlace: 'Ruang Kelas · Jam Siang 5–6', startTime: '15:35', endTime: '16:45', emoji: '🗣️', isBreak: false, theme: 'sky' },
      { id: 'kam-s4', subject: 'Informatika', teacherOrPlace: 'Lab Komputer · Jam Siang 7', startTime: '16:45', endTime: '17:30', emoji: '💻', isBreak: false, theme: 'mint' },
    ],
    jumat: [
      { id: 'jum-p1', subject: 'Merapikan Catatan & Persiapan Tas', teacherOrPlace: 'Rumah · Jam Belajar Pagi', startTime: '08:00', endTime: '09:30', emoji: '🎒', isBreak: false, theme: 'mint' },
      { id: 'jum-s1', subject: 'Ilmu Pengetahuan Alam (IPA)', teacherOrPlace: 'Ruang Kelas · Jam Siang 1–2', startTime: '13:15', endTime: '14:35', emoji: '🔬', isBreak: false, theme: 'mint' },
      { id: 'jum-s2', subject: 'Pendidikan Pancasila', teacherOrPlace: 'Ruang Kelas · Jam Siang 3', startTime: '14:35', endTime: '15:15', emoji: '🇮🇩', isBreak: false, theme: 'yellow' },
      { id: 'jum-sb1', subject: 'Istirahat & Shalat Ashar', teacherOrPlace: 'Masjid Sekolah', startTime: '15:15', endTime: '15:40', emoji: '🕌', isBreak: true, theme: 'neutral' },
      { id: 'jum-s3', subject: 'Seni Budaya & Prakarya', teacherOrPlace: 'Studio Seni · Jam Siang 4–5', startTime: '15:40', endTime: '17:00', emoji: '🎨', isBreak: false, theme: 'lavender' },
    ],
  };

  return {
    userId,
    dayKey,
    morningTitle: `Pembiasaan & Persiapan Shift Siang · ${DAYS_META.find((d) => d.key === dayKey)?.label || ''}`,
    morningTime: '07:00 – 11:30',
    morningEmoji: '🌤️',
    morningNote: 'Gunakan pagi hari untuk sarapan bergizi, merapikan buku, dan mengikuti ekskul pagi sebelum masuk kelas pukul 12.30.',
    lessons: siangLessonsByDay[dayKey],
    extracurriculars: base.extracurriculars.map((ex) => ({
      ...ex,
      timeRange: '09:30 – 11:00',
    })),
    dailyQuote: base.dailyQuote,
  };
}

export function buildDefaultChecklistForDay(dayKey: DayKey): { label: string; emoji: string }[] {
  switch (dayKey) {
    case 'senin':
      return [
        { label: 'Seragam Putih-Biru, Dasi & Topi Upacara', emoji: '👔' },
        { label: 'Buku Paket & Catatan Matematika, PPKn, IPA', emoji: '📚' },
        { label: 'Kamus / Buku Bahasa Sunda', emoji: '🎋' },
        { label: 'Kotak Pensil Lengkap & Penggaris', emoji: '✏️' },
        { label: 'Botol Minum (Tumbler) & Bekal Sehat', emoji: '🥤' },
      ];
    case 'selasa':
      return [
        { label: 'Buku Bacaan Favorit untuk Literasi Pagi', emoji: '📖' },
        { label: 'Buku Paket B. Inggris, IPS & Seni Budaya', emoji: '📚' },
        { label: 'Flashdisk / Catatan Informatika', emoji: '💻' },
        { label: 'Alat Gambar / Seni Budaya', emoji: '🎨' },
        { label: 'Botol Minum (Tumbler)', emoji: '🥤' },
      ];
    case 'rabu':
      return [
        { label: 'Seragam Olahraga SMPN 3 KARAWANG', emoji: '👕' },
        { label: 'Al-Qur’an Saku / Juz Amma', emoji: '🤲' },
        { label: 'Buku IPA, B. Indonesia, Agama & IPS', emoji: '📚' },
        { label: 'Handuk Kecil & Baju Ganti', emoji: '🧴' },
        { label: 'Botol Minum Ekstra untuk PJOK', emoji: '💧' },
      ];
    case 'kamis':
      return [
        { label: 'Seragam Batik / Khas Kamis', emoji: '👘' },
        { label: 'Buku Matematika, B. Inggris & Bahasa Sunda', emoji: '📚' },
        { label: 'Perlengkapan Pramuka / Ekskul Sore', emoji: '⚜️' },
        { label: 'Alat Tulis & Kalkulator Dasar', emoji: '✏️' },
      ];
    case 'jumat':
      return [
        { label: 'Seragam Muslim / Olahraga Jumat', emoji: '👕' },
        { label: 'Alat Kebersihan Kelas (Lap/Kemoceng Sesuai Piket)', emoji: '🧹' },
        { label: 'Buku IPA, PPKn & Prakarya', emoji: '📚' },
        { label: 'Hasduk & Baret Pramuka Sore', emoji: '⚜️' },
      ];
    case 'sabtu':
      return [
        { label: 'Bahan & Alat Proyek P5 Kelompok', emoji: '🧩' },
        { label: 'Perlengkapan Ekskul Pilihan / Lomba', emoji: '🏆' },
        { label: 'Botol Minum & Snack Sehat', emoji: '🥪' },
      ];
    case 'minggu':
      return [
        { label: 'Setrika Seragam Putih-Biru untuk Senin', emoji: '👔' },
        { label: 'Cek Semua PR Minggu Ini Sudah Selesai', emoji: '✅' },
        { label: 'Isi Ulang Kotak Pensil & Masukkan Buku Senin', emoji: '🎒' },
      ];
  }
}
