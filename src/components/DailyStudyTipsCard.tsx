import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, Lightbulb, RefreshCw } from 'lucide-react';
import { DAILY_STUDY_TIPS, getDefaultTipIndexForDay } from '../data/defaultSchedules';
import { DayKey } from '../types';

interface DailyStudyTipsCardProps {
  selectedDay: DayKey;
  dayLabel: string;
}

export const DailyStudyTipsCard: React.FC<DailyStudyTipsCardProps> = ({
  selectedDay,
  dayLabel,
}) => {
  const [tipIndex, setTipIndex] = useState<number>(() => getDefaultTipIndexForDay(selectedDay));
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTipIndex(getDefaultTipIndexForDay(selectedDay));
  }, [selectedDay]);

  const currentTip = DAILY_STUDY_TIPS[tipIndex % DAILY_STUDY_TIPS.length];
  const isLiked = Boolean(likedIds[currentTip.id]);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % DAILY_STUDY_TIPS.length);
  };

  const handleToggleLike = () => {
    setLikedIds((prev) => ({
      ...prev,
      [currentTip.id]: !prev[currentTip.id],
    }));
  };

  return (
    <section
      aria-label="Tips Belajar Harian"
      className="bg-gradient-to-r from-[#F3ECFF] via-[#FFFDF7] to-[#E5F9EE] border border-[#DFD1FC] rounded-3xl px-5 py-4 sm:px-6 sm:py-5 shadow-[0_6px_20px_-8px_rgba(109,40,217,0.09)]"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#E5DBFF] flex items-center justify-center text-xl shrink-0 shadow-2xs">
            <span className="animate-cute-float inline-block" aria-hidden="true">
              {currentTip.emoji}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-extrabold text-violet-900">
              <span className="inline-flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Tips Belajar Harian</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-violet-800/80">{currentTip.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800">{dayLabel}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="mt-1"
              >
                <p className="font-display text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {currentTip.title}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentTip.tip}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            animate={{ scale: isLiked ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.22 }}
            onClick={handleToggleLike}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50/60'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
            />
            <span>{isLiked ? 'Semangat!' : 'Suka'}</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleNextTip}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-[#DFD1FC] hover:bg-[#F7F2FF] text-violet-950 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tips Lainnya</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
};
