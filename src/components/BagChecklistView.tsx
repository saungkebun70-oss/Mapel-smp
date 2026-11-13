import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Plus, RotateCcw, Square, Trash2 } from 'lucide-react';
import { DAYS_META } from '../data/defaultSchedules';
import { BagChecklistItem, DayKey } from '../types';

interface BagChecklistViewProps {
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  items: BagChecklistItem[];
  onAddItem: (payload: { dayKey: DayKey; label: string; emoji: string }) => Promise<void>;
  onToggleItem: (itemId: string, checked: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onResetDayChecklist: (dayKey: DayKey) => Promise<void>;
}

const BAG_EMOJI_OPTIONS = ['📚', '👔', '👕', '✏️', '🥤', '🍱', '💻', '⚽', '🎨', '⚜️', '🎒'];

export const BagChecklistView: React.FC<BagChecklistViewProps> = ({
  selectedDay,
  onSelectDay,
  items,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onResetDayChecklist,
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState(false);

  const dayMeta = DAYS_META.find((d) => d.key === selectedDay) || DAYS_META[0];
  const dayItems = items.filter((i) => i.dayKey === selectedDay);
  const checkedCount = dayItems.filter((i) => i.checked).length;
  const progressPct = dayItems.length > 0 ? Math.round((checkedCount / dayItems.length) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    try {
      await onAddItem({
        dayKey: selectedDay,
        label: newLabel.trim(),
        emoji: newEmoji,
      });
      setNewLabel('');
    } finally {
      setAdding(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetDayChecklist(selectedDay);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-[#FFF4EB] via-white to-[#FFF6D6] border border-[#F6DEC8] rounded-3xl p-6 sm:p-7 shadow-[0_6px_22px_-8px_rgba(194,65,12,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-bold text-orange-900/75">
            Persiapan Sekolah · Otomatis tersimpan ke akun pribadimu
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            <span className="inline-block animate-cute-float mr-1.5" aria-hidden="true">
              🎒
            </span>
            Checklist Persiapan Tas · {dayMeta.label}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 tabular-nums">
            {checkedCount} dari {dayItems.length} perlengkapan sudah masuk tas ({progressPct}%)
          </p>
        </div>

        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5 tabular-nums">
            <span>Kesiapan Tas</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-3.5 w-full rounded-full bg-white border border-orange-200/70 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0F766E] to-[#34D399] rounded-full"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            />
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {DAYS_META.map((day) => {
          const active = selectedDay === day.key;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDay(day.key)}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-sm font-bold transition-all active:scale-[0.97] whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                active
                  ? 'bg-[#0F766E] text-white shadow-[0_4px_12px_-2px_rgba(15,118,110,0.35)]'
                  : 'bg-white border border-[#ECE6DA] text-slate-700 hover:bg-[#FFFDF7]'
              }`}
            >
              <span aria-hidden="true">{day.emoji}</span>
              <span className="hidden sm:inline">{day.label}</span>
              <span className="sm:hidden">{day.short}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Add New Item Form */}
        <div className="lg:col-span-5 bg-[#EEF6FF] border border-[#CEE3FC] rounded-3xl p-6 shadow-[0_6px_20px_-8px_rgba(29,78,216,0.07)]">
          <h2 className="font-display text-lg font-bold text-blue-950">
            Tambah Barang ke Tas ({dayMeta.label})
          </h2>
          <p className="text-xs text-blue-900/80 mt-1">
            Misalnya: Baju Pramuka, Penggaris Busur, atau Bekal Makan Siang.
          </p>

          <form onSubmit={handleAdd} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5">Pilih Ikon</label>
              <div className="flex flex-wrap gap-1.5">
                {BAG_EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewEmoji(em)}
                    className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                      newEmoji === em
                        ? 'bg-white ring-2 ring-blue-700 shadow-xs'
                        : 'bg-white/60 hover:bg-white'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-950 mb-1.5">
                Nama Barang / Perlengkapan
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                maxLength={120}
                placeholder="Contoh: Buku Gambar A3 & Pensil Warna"
                required
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-blue-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{adding ? 'Menambahkan...' : 'Tambahkan ke Checklist'}</span>
            </button>
          </form>
        </div>

        {/* Checklist List */}
        <div className="lg:col-span-7 bg-white border border-[#ECE6DA] rounded-3xl p-6 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.07)]">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Daftar Isi Tas · {dayMeta.label}
            </h2>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetting ? 'Mereset...' : 'Reset Default'}</span>
            </button>
          </div>

          {dayItems.length > 0 && checkedCount === dayItems.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="mt-4 rounded-2xl bg-[#E5F9EE] border border-[#C2EAD4] px-4 py-3 flex items-center gap-3"
            >
              <span className="text-xl shrink-0 animate-cute-wave" aria-hidden="true">
                🎉
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                Mantap! Semua perlengkapan hari {dayMeta.label} sudah masuk tas 100%.
              </p>
            </motion.div>
          )}

          {dayItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Belum ada item di checklist tas hari {dayMeta.label}.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tambahkan barang di sebelah kiri atau klik Reset Default.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dayItems.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggleItem(item.id, !item.checked)}
                    className="flex-1 min-h-[44px] flex items-center gap-3 text-left cursor-pointer group"
                  >
                    <motion.span
                      animate={{ scale: item.checked ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                      className="shrink-0 flex items-center"
                    >
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                      )}
                    </motion.span>
                    <span className="text-xl shrink-0 transition-transform duration-200 group-hover:scale-115 group-hover:-rotate-6">
                      {item.emoji}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-semibold transition-colors ${
                        item.checked ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.label}
                    </span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`Hapus ${item.label}`}
                    className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
