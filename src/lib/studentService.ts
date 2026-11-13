import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  buildDefaultChecklistForDay,
  buildDefaultDaySchedule,
  DAYS_META,
} from '../data/defaultSchedules';
import {
  AvatarId,
  BagChecklistItem,
  DayKey,
  DaySchedule,
  HomeworkTask,
  OperationType,
  SchoolShift,
  UserProfile,
} from '../types';
import { db, handleFirestoreError } from './firebase';
import { setUserCustomPhoto } from './photoStorage';

function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export interface BootstrapExtraProfile {
  fullName?: string;
  className?: string;
  avatarId?: AvatarId;
  shift?: SchoolShift;
  customPhoto?: string | null;
}

export function getUserShift(uid: string): SchoolShift {
  try {
    const val = localStorage.getItem(`mapel_shift_${uid}`);
    return val === 'siang' ? 'siang' : 'pagi';
  } catch {
    return 'pagi';
  }
}

export function setUserShift(uid: string, shift: SchoolShift): void {
  try {
    localStorage.setItem(`mapel_shift_${uid}`, shift);
  } catch {
    // Ignore storage quota errors
  }
}

let pendingRegistrationProfile: BootstrapExtraProfile | null = null;
const inFlightBootstrap = new Map<string, Promise<void>>();

export function setPendingRegistrationProfile(extra: BootstrapExtraProfile | null): void {
  pendingRegistrationProfile = extra;
}

export function ensureUserBootstrap(
  user: User,
  extra?: BootstrapExtraProfile
): Promise<void> {
  const existingPromise = inFlightBootstrap.get(user.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const run = (async () => {
    const effectiveExtra = extra || pendingRegistrationProfile || undefined;
    const userRef = doc(db, 'users', user.uid);
    let snap;
    try {
      snap = await getDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    }

    if (snap.exists()) {
      pendingRegistrationProfile = null;
      return;
    }

    const displayName =
      clampString(
        effectiveExtra?.fullName ||
          user.displayName ||
          user.email?.split('@')[0] ||
          'Siswa SMPN 3 KARAWANG',
        80
      ) || 'Siswa SMPN 3 KARAWANG';

    const className = clampString(effectiveExtra?.className || '7A', 16) || '7A';
    const avatarId: AvatarId = effectiveExtra?.avatarId || 'mint';
    const shift: SchoolShift = effectiveExtra?.shift || getUserShift(user.uid);
    setUserShift(user.uid, shift);
    if (effectiveExtra?.customPhoto) {
      setUserCustomPhoto(user.uid, effectiveExtra.customPhoto);
    }
    const email = clampString(user.email || '', 160);

    const batch = writeBatch(db);

    batch.set(userRef, {
      uid: user.uid,
      email,
      fullName: displayName,
      className,
      avatarId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const dayMeta of DAYS_META) {
      const schedule = buildDefaultDaySchedule(user.uid, dayMeta.key, shift);
      const scheduleRef = doc(db, 'users', user.uid, 'schedules', dayMeta.key);
      batch.set(scheduleRef, {
        userId: user.uid,
        dayKey: schedule.dayKey,
        morningTitle: clampString(schedule.morningTitle, 120),
        morningTime: clampString(schedule.morningTime, 40),
        morningEmoji: clampString(schedule.morningEmoji, 16),
        morningNote: clampString(schedule.morningNote, 240),
        lessons: schedule.lessons.slice(0, 20),
        extracurriculars: schedule.extracurriculars.slice(0, 10),
        dailyQuote: clampString(schedule.dailyQuote, 280),
        updatedAt: serverTimestamp(),
      });

      const checklistItems = buildDefaultChecklistForDay(dayMeta.key);
      checklistItems.forEach((item) => {
        const itemRef = doc(collection(db, 'users', user.uid, 'checklist'));
        batch.set(itemRef, {
          userId: user.uid,
          dayKey: dayMeta.key,
          label: clampString(item.label, 120),
          emoji: clampString(item.emoji, 16),
          checked: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    }

    // Seed 2 helpful sample homework reminders for the new student
    const taskRef1 = doc(collection(db, 'users', user.uid, 'tasks'));
    batch.set(taskRef1, {
      userId: user.uid,
      dayKey: 'senin',
      subject: 'Matematika',
      title: 'Latihan Soal Bilangan Bulat Halaman 24',
      notes: 'Kerjakan nomor 1–5 di buku tugas berkotak.',
      dueDate: 'Senin',
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const taskRef2 = doc(collection(db, 'users', user.uid, 'tasks'));
    batch.set(taskRef2, {
      userId: user.uid,
      dayKey: 'kamis',
      subject: 'Bahasa Sunda (Mulok)',
      title: 'Membaca Teks Paguneman',
      notes: 'Siapkan dialog berpasangan bersama teman sebangku.',
      dueDate: 'Kamis',
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
      pendingRegistrationProfile = null;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  })().finally(() => {
    inFlightBootstrap.delete(user.uid);
  });

  inFlightBootstrap.set(user.uid, run);
  return run;
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(snap.data() as UserProfile);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function updateUserProfile(
  uid: string,
  payload: { fullName: string; className: string; avatarId: AvatarId }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      fullName: clampString(payload.fullName, 80) || 'Siswa SMPN 3 KARAWANG',
      className: clampString(payload.className, 16) || '7A',
      avatarId: payload.avatarId,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeSchedules(
  uid: string,
  onData: (schedules: Record<DayKey, DaySchedule>) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}/schedules`;
  return onSnapshot(
    query(collection(db, 'users', uid, 'schedules'), where('userId', '==', uid)),
    (snap) => {
      const result = {} as Record<DayKey, DaySchedule>;
      for (const dayMeta of DAYS_META) {
        result[dayMeta.key] = buildDefaultDaySchedule(uid, dayMeta.key);
      }
      snap.forEach((docSnap) => {
        const data = docSnap.data() as DaySchedule;
        if (data.dayKey) {
          result[data.dayKey] = data;
        }
      });
      onData(result);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function saveDaySchedule(uid: string, schedule: DaySchedule): Promise<void> {
  const path = `users/${uid}/schedules/${schedule.dayKey}`;
  try {
    await setDoc(doc(db, 'users', uid, 'schedules', schedule.dayKey), {
      userId: uid,
      dayKey: schedule.dayKey,
      morningTitle: clampString(schedule.morningTitle, 120),
      morningTime: clampString(schedule.morningTime, 40),
      morningEmoji: clampString(schedule.morningEmoji || '☀️', 16),
      morningNote: clampString(schedule.morningNote, 240),
      lessons: schedule.lessons.slice(0, 20),
      extracurriculars: schedule.extracurriculars.slice(0, 10),
      dailyQuote: clampString(schedule.dailyQuote, 280),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function resetDayScheduleToDefault(
  uid: string,
  dayKey: DayKey,
  shift: SchoolShift = getUserShift(uid)
): Promise<void> {
  const defaultSched = buildDefaultDaySchedule(uid, dayKey, shift);
  await saveDaySchedule(uid, defaultSched);
}

export async function resetAllSchedulesToDefault(
  uid: string,
  shift: SchoolShift = getUserShift(uid)
): Promise<void> {
  setUserShift(uid, shift);
  const batch = writeBatch(db);
  for (const dayMeta of DAYS_META) {
    const schedule = buildDefaultDaySchedule(uid, dayMeta.key, shift);
    const ref = doc(db, 'users', uid, 'schedules', dayMeta.key);
    batch.set(ref, {
      userId: uid,
      dayKey: schedule.dayKey,
      morningTitle: clampString(schedule.morningTitle, 120),
      morningTime: clampString(schedule.morningTime, 40),
      morningEmoji: clampString(schedule.morningEmoji, 16),
      morningNote: clampString(schedule.morningNote, 240),
      lessons: schedule.lessons.slice(0, 20),
      extracurriculars: schedule.extracurriculars.slice(0, 10),
      dailyQuote: clampString(schedule.dailyQuote, 280),
      updatedAt: serverTimestamp(),
    });
  }
  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}/schedules`);
  }
}

export function subscribeTasks(
  uid: string,
  onData: (tasks: HomeworkTask[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}/tasks`;
  return onSnapshot(
    query(collection(db, 'users', uid, 'tasks'), where('userId', '==', uid)),
    (snap) => {
      const list: HomeworkTask[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Omit<HomeworkTask, 'id'>), id: docSnap.id });
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function addHomeworkTask(
  uid: string,
  payload: { dayKey: DayKey; subject: string; title: string; notes: string; dueDate: string }
): Promise<void> {
  const ref = doc(collection(db, 'users', uid, 'tasks'));
  const path = `users/${uid}/tasks/${ref.id}`;
  try {
    await setDoc(ref, {
      userId: uid,
      dayKey: payload.dayKey,
      subject: clampString(payload.subject, 80) || 'Umum',
      title: clampString(payload.title, 160) || 'Tugas Baru',
      notes: clampString(payload.notes, 400),
      dueDate: clampString(payload.dueDate, 40),
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function toggleHomeworkTask(
  uid: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function updateHomeworkTask(
  uid: string,
  taskId: string,
  payload: {
    dayKey: DayKey;
    subject: string;
    title: string;
    notes: string;
    dueDate: string;
    completed: boolean;
  }
): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'tasks', taskId), {
      dayKey: payload.dayKey,
      subject: clampString(payload.subject, 80) || 'Umum',
      title: clampString(payload.title, 160) || 'Tugas',
      notes: clampString(payload.notes, 400),
      dueDate: clampString(payload.dueDate, 40),
      completed: payload.completed,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteHomeworkTask(uid: string, taskId: string): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeChecklist(
  uid: string,
  onData: (items: BagChecklistItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${uid}/checklist`;
  return onSnapshot(
    query(collection(db, 'users', uid, 'checklist'), where('userId', '==', uid)),
    (snap) => {
      const list: BagChecklistItem[] = [];
      snap.forEach((docSnap) => {
        list.push({ ...(docSnap.data() as Omit<BagChecklistItem, 'id'>), id: docSnap.id });
      });
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    }
  );
}

export async function addChecklistItem(
  uid: string,
  payload: { dayKey: DayKey; label: string; emoji: string }
): Promise<void> {
  const ref = doc(collection(db, 'users', uid, 'checklist'));
  const path = `users/${uid}/checklist/${ref.id}`;
  try {
    await setDoc(ref, {
      userId: uid,
      dayKey: payload.dayKey,
      label: clampString(payload.label, 120) || 'Perlengkapan',
      emoji: clampString(payload.emoji || '🎒', 16),
      checked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function toggleChecklistItem(
  uid: string,
  itemId: string,
  checked: boolean
): Promise<void> {
  const path = `users/${uid}/checklist/${itemId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'checklist', itemId), {
      checked,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteChecklistItem(uid: string, itemId: string): Promise<void> {
  const path = `users/${uid}/checklist/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'checklist', itemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function resetDayChecklistToDefault(
  uid: string,
  dayKey: DayKey
): Promise<void> {
  const path = `users/${uid}/checklist`;
  try {
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'checklist'), where('userId', '==', uid))
    );
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as BagChecklistItem;
      if (data.dayKey === dayKey) {
        batch.delete(docSnap.ref);
      }
    });
    const defaults = buildDefaultChecklistForDay(dayKey);
    defaults.forEach((item) => {
      const newRef = doc(collection(db, 'users', uid, 'checklist'));
      batch.set(newRef, {
        userId: uid,
        dayKey,
        label: clampString(item.label, 120),
        emoji: clampString(item.emoji, 16),
        checked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
