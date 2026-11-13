import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Edit3, Plus, Search, Square, Trash2 } from 'lucide-react';
import { DAYS_META } from '../data/defaultSchedules';
import { DayKey, HomeworkTask } from '../types';
import { HomeworkModal } from './Modals';

interface HomeworkViewProps {
  selectedDay: DayKey;
  tasks: HomeworkTask[];
  onAddTask: (payload: {
    dayKey: DayKey;
    subject: string;
    title: string;
    notes: string;
    dueDate: string;
  }) => Promise<void>;
  onUpdateTask: (
    taskId: string,
    payload: {
      dayKey: DayKey;
      subject: string;
      title: string;
      notes: string;
      dueDate: string;
      completed: boolean;
    }
  ) => Promise<void>;
  onToggleTask: (taskId: string, completed: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  selectedDay,
  tasks,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [dayFilter, setDayFilter] = useState<DayKey | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<HomeworkTask | null>(null);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter === 'pending' && t.completed) return false;
      if (statusFilter === 'done' && !t.completed) return false;
      if (dayFilter !== 'all' && t.dayKey !== dayFilter) return false;
      if (q) {
        const hay = `${t.subject} ${t.title} ${t.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, dayFilter, search]);

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-[#EEF6FF] via-white to-[#F3ECFF] border border-[#D4E4FA] rounded-3xl p-6 sm:p-7 shadow-[0_6px_22px_-8px_rgba(29,78,216,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-900/75">
            Catatan Pribadi · Tersimpan aman di akunmu
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            <span className="inline-block animate-cute-float mr-1.5" aria-hidden="true">
              📝
            </span>
            Catatan PR & Tugas Sekolah
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 tabular-nums">
            {pendingCount} tugas menunggu dikerjakan · {doneCount} sudah selesai
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] active:scale-[0.98] text-white font-display font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah PR Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#ECE6DA] rounded-3xl p-5 sm:p-6 shadow-[0_6px_22px_-8px_rgba(24,39,75,0.06)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F2EC] rounded-xl w-fit">
            {[
              { id: 'all', label: `Semua (${tasks.length})` },
              { id: 'pending', label: `Belum (${pendingCount})` },
              { id: 'done', label: `Selesai (${doneCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as 'all' | 'pending' | 'done')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value as DayKey | 'all')}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Hari (Senin–Minggu)</option>
              {DAYS_META.map((d) => (
                <option key={d.key} value={d.key}>
                  Hari {d.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari mapel atau judul PR..."
                className="w-full sm:w-60 min-h-[42px] pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center border-t border-slate-100">
            <p className="text-base font-bold text-slate-800">
              {tasks.length === 0
                ? 'Belum ada catatan PR yang tersimpan'
                : 'Tidak ada tugas yang cocok dengan filter'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {tasks.length === 0
                ? 'Catat PR pertamamu supaya tidak lupa saat malam persiapan tas.'
                : 'Coba ubah filter hari atau kata kunci pencarian.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {filteredTasks.map((task) => {
              const dayName = DAYS_META.find((d) => d.key === task.dayKey)?.label || task.dayKey;
              return (
                <li
                  key={task.id}
                  className="py-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.82 }}
                      animate={{ scale: task.completed ? [1, 1.22, 1] : 1 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => onToggleTask(task.id, !task.completed)}
                      aria-label={`Tandai ${task.title}`}
                      className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </motion.button>

                    <div className="min-w-0 flex-1 pt-2">
                      <p
                        className={`text-sm sm:text-base font-bold leading-snug ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>Hari {dayName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Tenggat: {task.dueDate}</span>
                      </div>
                      {task.notes && (
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task);
                        setModalOpen(true);
                      }}
                      aria-label={`Edit ${task.title}`}
                      className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Hapus ${task.title}`}
                      className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <HomeworkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDay={selectedDay}
        initialTask={editingTask}
        onSave={async (payload) => {
          if (editingTask) {
            await onUpdateTask(editingTask.id, payload);
          } else {
            await onAddTask(payload);
          }
        }}
      />
    </div>
  );
};
