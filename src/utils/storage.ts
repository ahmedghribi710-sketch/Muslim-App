import {
  SchoolClass,
  HomeworkItem,
  ExamItem,
  UserSettings,
  AchievementBadge,
  UserStats,
  QuranProgress,
  DailyPrayerRecord,
} from '../types';
import {
  DEFAULT_SCHOOL_CLASSES,
  INITIAL_HOMEWORK,
  INITIAL_EXAMS,
  INITIAL_SETTINGS,
  INITIAL_BADGES,
} from './defaultData';

const KEYS = {
  CLASSES: 'muslim_planner_classes_v1',
  HOMEWORK: 'muslim_planner_homework_v1',
  EXAMS: 'muslim_planner_exams_v1',
  SETTINGS: 'muslim_planner_settings_v1',
  BADGES: 'muslim_planner_badges_v1',
  STATS: 'muslim_planner_stats_v1',
  QURAN: 'muslim_planner_quran_v1',
  PRAYERS_PREFIX: 'muslim_planner_prayers_',
  ROUTINE_PREFIX: 'muslim_planner_routine_',
};

export const storage = {
  getClasses(): SchoolClass[] {
    try {
      const data = localStorage.getItem(KEYS.CLASSES);
      return data ? JSON.parse(data) : DEFAULT_SCHOOL_CLASSES;
    } catch {
      return DEFAULT_SCHOOL_CLASSES;
    }
  },

  saveClasses(classes: SchoolClass[]): void {
    try {
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to save classes:', e);
    }
  },

  getHomework(): HomeworkItem[] {
    try {
      const data = localStorage.getItem(KEYS.HOMEWORK);
      return data ? JSON.parse(data) : INITIAL_HOMEWORK;
    } catch {
      return INITIAL_HOMEWORK;
    }
  },

  saveHomework(items: HomeworkItem[]): void {
    try {
      localStorage.setItem(KEYS.HOMEWORK, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save homework:', e);
    }
  },

  getExams(): ExamItem[] {
    try {
      const data = localStorage.getItem(KEYS.EXAMS);
      return data ? JSON.parse(data) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  },

  saveExams(items: ExamItem[]): void {
    try {
      localStorage.setItem(KEYS.EXAMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save exams:', e);
    }
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  getBadges(): AchievementBadge[] {
    try {
      const data = localStorage.getItem(KEYS.BADGES);
      return data ? JSON.parse(data) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  },

  saveBadges(badges: AchievementBadge[]): void {
    try {
      localStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.error('Failed to save badges:', e);
    }
  },

  getStats(): UserStats {
    const defaultStats: UserStats = {
      xp: 420,
      level: 3,
      streakDays: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedTasksCount: 14,
      completedPrayersCount: 22,
      totalStudyMinutes: 210,
      takiSessionsAttended: 6,
      quranPagesTotal: 18,
    };
    try {
      const data = localStorage.getItem(KEYS.STATS);
      return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats;
    } catch {
      return defaultStats;
    }
  },

  saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  getQuranProgress(): QuranProgress {
    const defaultQuran: QuranProgress = {
      currentPage: 32,
      dailyGoalPages: 2,
      pagesReadToday: 2,
      lastUpdated: new Date().toISOString().split('T')[0],
      currentSurah: 'البقرة',
      currentJuz: 2,
      memorizedSurahs: ['الفاتحة', 'النبأ', 'الملك', 'الإخلاص', 'الفلق', 'الناس'],
      reviewedSurahs: ['الملك', 'النبأ'],
    };
    try {
      const data = localStorage.getItem(KEYS.QURAN);
      return data ? { ...defaultQuran, ...JSON.parse(data) } : defaultQuran;
    } catch {
      return defaultQuran;
    }
  },

  saveQuranProgress(quran: QuranProgress): void {
    try {
      localStorage.setItem(KEYS.QURAN, JSON.stringify(quran));
    } catch (e) {
      console.error('Failed to save quran progress:', e);
    }
  },

  getDailyPrayers(dateStr: string): DailyPrayerRecord {
    const defaultPrayers: DailyPrayerRecord = {
      date: dateStr,
      fajr: true,
      dhuhr: true,
      asr: false,
      maghrib: false,
      isha: false,
      fajrSunnah: true,
      dhuhrSunnah: false,
    };
    try {
      const data = localStorage.getItem(`${KEYS.PRAYERS_PREFIX}${dateStr}`);
      return data ? { ...defaultPrayers, ...JSON.parse(data) } : defaultPrayers;
    } catch {
      return defaultPrayers;
    }
  },

  saveDailyPrayers(dateStr: string, prayers: DailyPrayerRecord): void {
    try {
      localStorage.setItem(`${KEYS.PRAYERS_PREFIX}${dateStr}`, JSON.stringify(prayers));
    } catch (e) {}
  },

  getCompletedRoutineIds(dateStr: string): string[] {
    try {
      const data = localStorage.getItem(`${KEYS.ROUTINE_PREFIX}${dateStr}`);
      return data ? JSON.parse(data) : ['r-wake', 'r-fajr', 'r-quran-morning'];
    } catch {
      return ['r-wake', 'r-fajr', 'r-quran-morning'];
    }
  },

  saveCompletedRoutineIds(dateStr: string, ids: string[]): void {
    try {
      localStorage.setItem(`${KEYS.ROUTINE_PREFIX}${dateStr}`, JSON.stringify(ids));
    } catch (e) {}
  },

  exportAllData(): string {
    return JSON.stringify(
      {
        classes: this.getClasses(),
        homework: this.getHomework(),
        exams: this.getExams(),
        settings: this.getSettings(),
        badges: this.getBadges(),
        stats: this.getStats(),
        quran: this.getQuranProgress(),
      },
      null,
      2
    );
  },

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.classes) this.saveClasses(parsed.classes);
      if (parsed.homework) this.saveHomework(parsed.homework);
      if (parsed.exams) this.saveExams(parsed.exams);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.badges) this.saveBadges(parsed.badges);
      if (parsed.stats) this.saveStats(parsed.stats);
      if (parsed.quran) this.saveQuranProgress(parsed.quran);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData(): void {
    try {
      localStorage.clear();
      this.saveClasses(DEFAULT_SCHOOL_CLASSES);
      this.saveHomework(INITIAL_HOMEWORK);
      this.saveExams(INITIAL_EXAMS);
      this.saveSettings(INITIAL_SETTINGS);
      this.saveBadges(INITIAL_BADGES);
    } catch (e) {
      console.error('Failed to reset all data:', e);
    }
  },
};
