import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface ConfettiBurst {
  id: number;
  dayLabel: string;
}

interface ConfettiCelebrationProps {
  burst: ConfettiBurst | null;
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
  alpha: number;
}

const PASTEL_CONFETTI_COLORS = [
  '#10B981', // Mint / Emerald
  '#34D399', // Soft Mint
  '#FBBF24', // Sunny Yellow
  '#60A5FA', // Sky Blue
  '#A78BFA', // Lavender
  '#F472B6', // Candy Pink
  '#FB923C', // Peach Orange
];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  burst,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!burst) return;

    const timer = window.setTimeout(() => {
      onComplete();
    }, 3400);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return () => window.clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => window.clearTimeout(timer);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return () => window.clearTimeout(timer);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    const total = 110;

    for (let i = 0; i < total; i++) {
      const fromLeft = i % 2 === 0;
      const originX = fromLeft ? width * 0.2 : width * 0.8;
      const originY = height * 0.72;
      const baseAngle = fromLeft ? -Math.PI / 3 : (-2 * Math.PI) / 3;
      const angle = baseAngle + (Math.random() - 0.5) * 0.85;
      const speed = 9 + Math.random() * 11;

      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 6 + Math.random() * 6,
        color: PASTEL_CONFETTI_COLORS[i % PASTEL_CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.22,
        shape: i % 3 === 0 ? 'circle' : 'rect',
        alpha: 1,
      });
    }

    let rafId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.vy += 0.34; // gravity
        p.vx *= 0.985; // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (elapsed > 1800) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        if (p.alpha > 0 && p.y < height + 40) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          }

          ctx.restore();
        }
      }

      if (alive && elapsed < 3200) {
        rafId = window.requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(rafId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [burst, onComplete]);

  return (
    <>
      {burst && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 z-50 pointer-events-none"
        />
      )}

      <AnimatePresence>
        {burst && (
          <motion.div
            key={burst.id}
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[calc(100%-2rem)] max-w-md"
          >
            <div className="bg-gradient-to-r from-[#E5F9EE] via-[#FFF8DD] to-[#EEF6FF] border border-[#C2EAD4] rounded-3xl px-5 py-3.5 shadow-[0_12px_30px_-8px_rgba(15,118,110,0.28)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shrink-0 shadow-2xs">
                🎒
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Tas {burst.dayLabel} 100% Siap!</span>
                </p>
                <p className="text-xs font-semibold text-emerald-900/85 mt-0.5">
                  Hebat! Semua perlengkapan sekolahmu sudah lengkap.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
