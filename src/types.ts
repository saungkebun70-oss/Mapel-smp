export type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type AvatarId = 'mint' | 'yellow' | 'sky' | 'lavender';

export type PastelTheme = 'mint' | 'yellow' | 'sky' | 'lavender' | 'neutral';

export type SchoolShift = 'pagi' | 'siang';

export type NavSection = 'jadwal' | 'tugas' | 'tas' | 'profil';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  className: string;
  avatarId: AvatarId;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LessonItem {
  id: string;
  subject: string;
  teacherOrPlace: string;
  startTime: string;
  endTime: string;
  emoji: string;
  isBreak: boolean;
  theme: PastelTheme;
}

export interface ExtracurricularItem {
  id: string;
  name: string;
  timeRange: string;
  emoji: string;
  location: string;
}

export interface DaySchedule {
  userId: string;
  dayKey: DayKey;
  morningTitle: string;
  morningTime: string;
  morningEmoji: string;
  morningNote: string;
  lessons: LessonItem[];
  extracurriculars: ExtracurricularItem[];
  dailyQuote: string;
  updatedAt?: unknown;
}

export interface HomeworkTask {
  id: string;
  userId: string;
  dayKey: DayKey;
  subject: string;
  title: string;
  notes: string;
  dueDate: string;
  completed: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BagChecklistItem {
  id: string;
  userId: string;
  dayKey: DayKey;
  label: string;
  emoji: string;
  checked: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
