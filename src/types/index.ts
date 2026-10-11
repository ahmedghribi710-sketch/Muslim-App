export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface SchoolClass {
  id: string;
  day: DayOfWeek;
  startTime: string; // "08:15"
  endTime: string;   // "09:15"
  subject: string;   // e.g., "رياضيات", "عربية"
  classroom?: string;// e.g., "قاعة 12"
  teacher?: string;  // e.g., "أستاذ بن سالم"
  color?: string;
}

export interface DayEndInfo {
  day: DayOfWeek;
  dayNameAr: string;
  lastClassEnd: string;
  commuteMinutes: number;
  homeArrival: string;
  isSchoolDay: boolean;
}

export type Priority = 'low' | 'medium' | 'high';
export type HomeworkStatus = 'pending' | 'in_progress' | 'completed';

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  estimatedMinutes: number; // e.g. 30, 45, 60
  status: HomeworkStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ExamItem {
  id: string;
  subject: string;
  title: string; // e.g., "فرض مراقبة عدد 1"
  date: string;  // YYYY-MM-DD
  syllabus?: string;
  completed: boolean;
}

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface DailyPrayerRecord {
  date: string; // YYYY-MM-DD
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  fajrSunnah?: boolean;
  dhuhrSunnah?: boolean;
  maghribSunnah?: boolean;
  ishaSunnah?: boolean;
  qiyam?: boolean;
}

export interface QuranProgress {
  currentPage: number;
  dailyGoalPages: number;
  pagesReadToday: number;
  lastUpdated: string;
  currentSurah: string;
  currentJuz: number;
  memorizedSurahs: string[];
  reviewedSurahs: string[];
}

export interface RoutineItem {
  id: string;
  title: string;
  timeRange: string;
  category: 'prayer' | 'quran' | 'school' | 'taki' | 'study' | 'rest' | 'sleep' | 'routine';
  completed: boolean;
  description?: string;
  isFixed?: boolean;
  badge?: string;
}

export interface UserSettings {
  studentName: string;
  wakeUpTime: string; // default "05:30"
  targetBedTime: string; // default "21:45"
  commuteMinutes: number; // default 15
  selectedCity: string; // default "تونس"
  prayerCalcMethod: 'tunisia' | 'mwl' | 'egypt';
  enableAudioNotifications: boolean;
  enableTakiAlert: boolean; // 15 mins before 19:30
  weakSubjects: string[];
  pomodoroWorkMinutes: number; // default 25
  pomodoroBreakMinutes: number; // default 5
  theme: 'light' | 'dark' | 'system';
  visualStyle?: 'neobrutalism' | 'claymorphism';
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedTasksCount: number;
  completedPrayersCount: number;
  totalStudyMinutes: number;
  takiSessionsAttended: number;
  quranPagesTotal: number;
}
