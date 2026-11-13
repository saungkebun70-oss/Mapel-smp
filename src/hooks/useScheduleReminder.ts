import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DAYS_META, getTodayDayKey } from '../data/defaultSchedules';
import { DayKey, DaySchedule, LessonItem } from '../types';

export interface ReminderSettings {
  enabled: boolean;
  leadMinutes: 5 | 10 | 15;
  soundEnabled: boolean;
}

export interface ActiveReminderAlert {
  id: string;
  subject: string;
  emoji: string;
  startTime: string;
  teacherOrPlace: string;
  minutesLeft: number;
  isTest?: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  leadMinutes: 10,
  soundEnabled: true,
};

function parseTimeToMinutes(hhmm: string): number | null {
  const parts = hhmm.split(':');
  if (parts.length !== 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function playGentleChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.12, now + startOffset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    };

    playTone(587.33, 0, 0.28); // D5
    playTone(880.0, 0.16, 0.42); // A5
    setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 900);
  } catch {
    // Ignore audio context restrictions if user hasn't interacted yet
  }
}

export function useScheduleReminder(
  uid: string | null,
  schedules: Record<DayKey, DaySchedule>
) {
  const storageKey = uid ? `mapel_reminder_prefs_${uid}` : null;

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [nowTick, setNowTick] = useState(() => new Date());
  const [activeAlert, setActiveAlert] = useState<ActiveReminderAlert | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const alertedTodayRef = useRef<Set<string>>(new Set());

  // Load per-UID settings from localStorage
  useEffect(() => {
    if (!storageKey) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
        setSettings({
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
          leadMinutes: parsed.leadMinutes === 5 || parsed.leadMinutes === 10 || parsed.leadMinutes === 15 ? parsed.leadMinutes : 10,
          soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
    alertedTodayRef.current.clear();
  }, [storageKey]);

  const updateSettings = useCallback(
    (next: ReminderSettings) => {
      setSettings(next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
      }
    },
    [storageKey]
  );

  // Tick every 15 seconds to keep countdown and alerts accurate
  useEffect(() => {
    const id = window.setInterval(() => {
      setNowTick(new Date());
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  const todayKey = getTodayDayKey();
  const todaySchedule = schedules[todayKey];
  const todayLabel = DAYS_META.find((d) => d.key === todayKey)?.label || 'Hari Ini';

  const { currentLesson, nextLesson, minutesUntilNext } = useMemo(() => {
    const lessons = [...(todaySchedule?.lessons || [])].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    const nowMinutes = nowTick.getHours() * 60 + nowTick.getMinutes();

    let ongoing: LessonItem | null = null;
    let upcoming: LessonItem | null = null;
    let minsLeft: number | null = null;

    for (const lesson of lessons) {
      const start = parseTimeToMinutes(lesson.startTime);
      const end = parseTimeToMinutes(lesson.endTime);
      if (start === null || end === null) continue;

      if (nowMinutes >= start && nowMinutes < end) {
        ongoing = lesson;
      } else if (start > nowMinutes && upcoming === null) {
        upcoming = lesson;
        minsLeft = start - nowMinutes;
      }
    }

    return {
      currentLesson: ongoing,
      nextLesson: upcoming,
      minutesUntilNext: minsLeft,
    };
  }, [todaySchedule, nowTick]);

  const fireAlert = useCallback(
    (alert: ActiveReminderAlert) => {
      setActiveAlert(alert);

      if (settings.soundEnabled) {
        playGentleChime();
      }

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(`Pengingat MAPEL: ${alert.subject}`, {
            body: `${alert.emoji} Mulai pukul ${alert.startTime} (${alert.minutesLeft} menit lagi) · ${alert.teacherOrPlace}`,
          });
        } catch {
          // Ignore browser notification errors in restricted frames
        }
      }
    },
    [settings.soundEnabled]
  );

  // Automatic check for upcoming lesson within leadMinutes
  useEffect(() => {
    if (!uid || !settings.enabled || !nextLesson || minutesUntilNext === null) {
      return;
    }

    const dateStamp = nowTick.toISOString().slice(0, 10);
    const alertKey = `${dateStamp}_${todayKey}_${nextLesson.id}`;

    if (
      minutesUntilNext > 0 &&
      minutesUntilNext <= settings.leadMinutes &&
      !alertedTodayRef.current.has(alertKey)
    ) {
      alertedTodayRef.current.add(alertKey);
      fireAlert({
        id: alertKey,
        subject: nextLesson.subject,
        emoji: nextLesson.emoji,
        startTime: nextLesson.startTime,
        teacherOrPlace: nextLesson.teacherOrPlace,
        minutesLeft: minutesUntilNext,
      });
    }
  }, [uid, settings.enabled, settings.leadMinutes, nextLesson, minutesUntilNext, nowTick, todayKey, fireAlert]);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    } catch {
      // Ignore permission prompt failures
    }
  }, []);

  const triggerTestReminder = useCallback(() => {
    const sample = nextLesson || todaySchedule?.lessons.find((l) => !l.isBreak) || {
      id: 'sample',
      subject: 'Matematika',
      emoji: '📐',
      startTime: '07:15',
      teacherOrPlace: 'Ruang Kelas',
    };

    fireAlert({
      id: `test-${Date.now()}`,
      subject: sample.subject,
      emoji: sample.emoji,
      startTime: sample.startTime,
      teacherOrPlace: sample.teacherOrPlace,
      minutesLeft: minutesUntilNext ?? settings.leadMinutes,
      isTest: true,
    });
  }, [nextLesson, todaySchedule, minutesUntilNext, settings.leadMinutes, fireAlert]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    settings,
    updateSettings,
    todayLabel,
    currentLesson,
    nextLesson,
    minutesUntilNext,
    activeAlert,
    dismissAlert,
    notificationPermission,
    requestBrowserPermission,
    triggerTestReminder,
  };
}
