import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Backpack, BookOpen, CalendarDays, ClipboardList, LogOut, UserCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AuthScreen } from './components/AuthScreen';
import { BagChecklistView } from './components/BagChecklistView';
import { BentoScheduleView } from './components/BentoScheduleView';
import { ConfettiBurst, ConfettiCelebration } from './components/ConfettiCelebration';
import { HomeworkView } from './components/HomeworkView';
import { ProfileView } from './components/ProfileView';
import { ActiveReminderBanner, ReminderModal } from './components/ReminderBannerAndModal';
import { StudentAvatar } from './components/StudentAvatar';
import { buildDefaultDaySchedule, DAYS_META, getTodayDayKey } from './data/defaultSchedules';
import { useScheduleReminder } from './hooks/useScheduleReminder';
import { auth } from './lib/firebase';
import { getUserCustomPhoto, setUserCustomPhoto } from './lib/photoStorage';
import {
  addChecklistItem,
  addHomeworkTask,
  deleteChecklistItem,
  deleteHomeworkTask,
  ensureUserBootstrap,
  getUserShift,
  resetAllSchedulesToDefault,
  resetDayChecklistToDefault,
  resetDayScheduleToDefault,
  saveDaySchedule,
  setUserShift,
  subscribeChecklist,
  subscribeSchedules,
  subscribeTasks,
  subscribeUserProfile,
  toggleChecklistItem,
  toggleHomeworkTask,
  updateHomeworkTask,
  updateUserProfile,
} from './lib/studentService';
import {
  BagChecklistItem,
  DayKey,
  DaySchedule,
  HomeworkTask,
  NavSection,
  SchoolShift,
  UserProfile,
} from './types';

function buildInitialScheduleMap(
  uid: string,
  shift: SchoolShift = 'pagi'
): Record<DayKey, DaySchedule> {
  const map = {} as Record<DayKey, DaySchedule>;
  for (const d of DAYS_META) {
    map[d.key] = buildDefaultDaySchedule(uid, d.key, shift);
  }
  return map;
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [bootstrappedUid, setBootstrappedUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schedules, setSchedules] = useState<Record<DayKey, DaySchedule>>(() =>
    buildInitialScheduleMap('guest')
  );
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [checklist, setChecklist] = useState<BagChecklistItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayKey>(() => getTodayDayKey());
  const [activeSection, setActiveSection] = useState<NavSection>('jadwal');
  const [dataLoading, setDataLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [schoolShift, setSchoolShift] = useState<SchoolShift>('pagi');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [confettiBurst, setConfettiBurst] = useState<ConfettiBurst | null>(null);

  const handleClearConfetti = useCallback(() => {
    setConfettiBurst(null);
  }, []);

  const reminder = useScheduleReminder(authUser?.uid ?? null, schedules);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setBootstrappedUid(null);
        setProfile(null);
        setCustomPhoto(null);
        setTasks([]);
        setChecklist([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      setErrorBanner(null);
      try {
        await ensureUserBootstrap(user);
        const savedShift = getUserShift(user.uid);
        setSchoolShift(savedShift);
        setCustomPhoto(getUserCustomPhoto(user.uid));
        setBootstrappedUid(user.uid);
      } catch (err) {
        setErrorBanner(
          err instanceof Error ? err.message : 'Gagal menyiapkan ruang data akun.'
        );
        setDataLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!authUser || bootstrappedUid !== authUser.uid) return;

    const uid = authUser.uid;
    const savedShift = getUserShift(uid);
    setSchoolShift(savedShift);
    setCustomPhoto(getUserCustomPhoto(uid));
    setSchedules(buildInitialScheduleMap(uid, savedShift));

    const handleSubError = (err: Error) => {
      setErrorBanner(`Kendala sinkronisasi data: ${err.message}`);
      setDataLoading(false);
    };

    const unsubProfile = subscribeUserProfile(
      uid,
      (prof) => {
        if (prof) {
          setProfile(prof);
          setDataLoading(false);
        }
      },
      handleSubError
    );

    const unsubSchedules = subscribeSchedules(
      uid,
      (schedMap) => {
        setSchedules(schedMap);
      },
      handleSubError
    );

    const unsubTasks = subscribeTasks(
      uid,
      (taskList) => {
        setTasks(taskList);
      },
      handleSubError
    );

    const unsubChecklist = subscribeChecklist(
      uid,
      (itemList) => {
        setChecklist(itemList);
      },
      handleSubError
    );

    return () => {
      unsubProfile();
      unsubSchedules();
      unsubTasks();
      unsubChecklist();
    };
  }, [authUser, bootstrappedUid]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveSection('jadwal');
  };

  const handleSwitchShift = async (nextShift: SchoolShift) => {
    if (!authUser) return;
    setUserShift(authUser.uid, nextShift);
    setSchoolShift(nextShift);
    await resetAllSchedulesToDefault(authUser.uid, nextShift);
  };

  const handleSaveCustomPhoto = (dataUrl: string | null) => {
    if (!authUser) return;
    setUserCustomPhoto(authUser.uid, dataUrl);
    setCustomPhoto(dataUrl);
  };

  const handleToggleChecklist = async (itemId: string, checked: boolean) => {
    if (!authUser) return;
    const targetItem = checklist.find((item) => item.id === itemId);
    if (checked && targetItem) {
      const dayItems = checklist.filter((item) => item.dayKey === targetItem.dayKey);
      const willCompleteAll =
        dayItems.length > 0 &&
        dayItems.every((item) => (item.id === itemId ? true : item.checked));
      if (willCompleteAll) {
        const dayLabel =
          DAYS_META.find((d) => d.key === targetItem.dayKey)?.label || targetItem.dayKey;
        setConfettiBurst({ id: Date.now(), dayLabel });
      }
    }
    await toggleChecklistItem(authUser.uid, itemId, checked);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#EAE7E0] rounded-3xl p-8 space-y-4">
          <div className="h-6 w-40 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
          <div className="h-24 w-full bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreen onAuthenticated={() => setActiveSection('jadwal')} />;
  }

  const effectiveProfile: UserProfile = profile || {
    uid: authUser.uid,
    email: authUser.email || '',
    fullName: authUser.displayName || authUser.email?.split('@')[0] || 'Siswa SMPN 3 KARAWANG',
    className: '7A',
    avatarId: 'mint',
  };

  const navItems: { id: NavSection; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    { id: 'jadwal', label: 'Jadwal', mobileLabel: 'Jadwal', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'tugas', label: 'Tugas PR', mobileLabel: 'Tugas PR', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'tas', label: 'Checklist Tas', mobileLabel: 'Tas', icon: <Backpack className="w-5 h-5" /> },
    { id: 'profil', label: 'Profil', mobileLabel: 'Profil', icon: <UserCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen text-slate-900 pb-24 md:pb-12">
      {/* Desktop & Tablet 3-Zone Top Bar */}
      <header className="hidden md:block sticky top-0 z-30 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-[#EDE6D6]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveSection('jadwal')}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer group"
          >
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#D8F3DC] to-[#D0EBFF] text-emerald-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </span>
            <span>MAPEL</span>
          </button>

          {/* Zone 2: 4 single-line text links with subtle hover underline */}
          <nav aria-label="Navigasi utama" className="flex items-center gap-7">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`py-2 text-sm font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-[#0F766E] text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-white border border-[#EAE7E0] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-800 text-slate-800 text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Top App Bar (52px) */}
      <header className="md:hidden sticky top-0 z-30 h-[52px] bg-white/90 backdrop-blur-md border-b border-[#EAE7E0] px-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setActiveSection('profil')}
          aria-label="Buka profil siswa"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
        >
          <StudentAvatar
            avatarId={effectiveProfile.avatarId}
            fullName={effectiveProfile.fullName}
            customPhotoUrl={customPhoto}
            sizeClass="w-8 h-8"
          />
        </button>

        <span className="font-display text-base font-bold text-slate-900 truncate">
          {activeSection === 'jadwal' && 'MAPEL'}
          {activeSection === 'tugas' && 'Catatan PR & Tugas'}
          {activeSection === 'tas' && 'Checklist Tas Sekolah'}
          {activeSection === 'profil' && 'Profil Siswa'}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Keluar dari akun"
          className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-700 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        <ActiveReminderBanner
          alert={reminder.activeAlert}
          onDismiss={reminder.dismissAlert}
        />

        {errorBanner && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-900 flex items-center justify-between gap-3">
            <span className="break-all">{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 shrink-0 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {dataLoading && !profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 h-44 rounded-2xl bg-white border border-[#EAE7E0]" />
            <div className="lg:col-span-4 h-44 rounded-2xl bg-[#FEF7D6] border border-[#F2E6B1]" />
            <div className="lg:col-span-7 h-96 rounded-2xl bg-white border border-[#EAE7E0]" />
            <div className="lg:col-span-5 h-96 rounded-2xl bg-white border border-[#EAE7E0]" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'jadwal' && (
                <BentoScheduleView
                  profile={effectiveProfile}
                  customPhotoUrl={customPhoto}
                  shift={schoolShift}
                  onSwitchShift={handleSwitchShift}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  schedule={schedules[selectedDay]}
                  tasks={tasks}
                  checklist={checklist}
                  onSaveSchedule={(updated) => saveDaySchedule(authUser.uid, updated)}
                  onResetDay={(dayKey) =>
                    resetDayScheduleToDefault(authUser.uid, dayKey, schoolShift)
                  }
                  onAddTask={(payload) => addHomeworkTask(authUser.uid, payload)}
                  onToggleTask={(taskId, completed) =>
                    toggleHomeworkTask(authUser.uid, taskId, completed)
                  }
                  onToggleChecklist={handleToggleChecklist}
                  onNavigateSection={setActiveSection}
                  reminderInfo={{
                    todayLabel: reminder.todayLabel,
                    currentLesson: reminder.currentLesson,
                    nextLesson: reminder.nextLesson,
                    minutesUntilNext: reminder.minutesUntilNext,
                    settings: reminder.settings,
                    onOpenSettings: () => setReminderModalOpen(true),
                  }}
                />
              )}

              {activeSection === 'tugas' && (
                <HomeworkView
                  selectedDay={selectedDay}
                  tasks={tasks}
                  onAddTask={(payload) => addHomeworkTask(authUser.uid, payload)}
                  onUpdateTask={(taskId, payload) =>
                    updateHomeworkTask(authUser.uid, taskId, payload)
                  }
                  onToggleTask={(taskId, completed) =>
                    toggleHomeworkTask(authUser.uid, taskId, completed)
                  }
                  onDeleteTask={(taskId) => deleteHomeworkTask(authUser.uid, taskId)}
                />
              )}

              {activeSection === 'tas' && (
                <BagChecklistView
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  items={checklist}
                  onAddItem={(payload) => addChecklistItem(authUser.uid, payload)}
                  onToggleItem={handleToggleChecklist}
                  onDeleteItem={(itemId) => deleteChecklistItem(authUser.uid, itemId)}
                  onResetDayChecklist={(dayKey) =>
                    resetDayChecklistToDefault(authUser.uid, dayKey)
                  }
                />
              )}

              {activeSection === 'profil' && (
                <ProfileView
                  profile={effectiveProfile}
                  customPhotoUrl={customPhoto}
                  onSaveCustomPhoto={handleSaveCustomPhoto}
                  shift={schoolShift}
                  onSwitchShift={handleSwitchShift}
                  onUpdateProfile={(payload) => updateUserProfile(authUser.uid, payload)}
                  onResetAllSchedules={() =>
                    resetAllSchedulesToDefault(authUser.uid, schoolShift)
                  }
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (64px) */}
      <nav
        aria-label="Navigasi bawah mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE6D6] pb-safe"
      >
        <div className="grid grid-cols-4 items-center h-16 px-2">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`min-h-[48px] mx-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.96] cursor-pointer ${
                  active
                    ? 'bg-[#E5F9EE] text-[#0F766E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.icon}
                <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <ReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        settings={reminder.settings}
        onUpdateSettings={reminder.updateSettings}
        notificationPermission={reminder.notificationPermission}
        onRequestBrowserPermission={reminder.requestBrowserPermission}
        onTestReminder={reminder.triggerTestReminder}
      />

      <ConfettiCelebration burst={confettiBurst} onComplete={handleClearConfetti} />
    </div>
  );
}
