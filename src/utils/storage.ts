import {
  SchoolClass,
  HomeworkItem,
  ExamItem,
  UserSettings,
  AchievementBadge,
  UserStats,
  QuranProgress,
  DailyPrayerRecord,
  DailyChallengeRecord,
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
  CHALLENGE_PREFIX: 'muslim_planner_challenge_',
  CHALLENGE_POPUP_PREFIX: 'muslim_planner_challenge_popup_',
  LAST_MODIFIED: 'muslim_planner_last_modified_v1',
  DEMO_PURGED: 'muslim_planner_demo_purged_v1',
};

export const storage = {
  getLastModified(): number {
    try {
      const ts = localStorage.getItem(KEYS.LAST_MODIFIED);
      return ts ? Number(ts) : 0;
    } catch {
      return 0;
    }
  },

  recordLastModified(ts?: number): void {
    try {
      localStorage.setItem(KEYS.LAST_MODIFIED, String(ts || Date.now()));
    } catch (e) {
      console.error('Failed to record last modified:', e);
    }
  },

  isDemoPurged(): boolean {
    try {
      return localStorage.getItem(KEYS.DEMO_PURGED) === 'true';
    } catch {
      return false;
    }
  },

  setDemoPurged(purged: boolean): void {
    try {
      localStorage.setItem(KEYS.DEMO_PURGED, purged ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set demo purged flag:', e);
    }
  },

  getDailyChallengeRecord(dateStr: string): DailyChallengeRecord | null {
    try {
      const data = localStorage.getItem(`${KEYS.CHALLENGE_PREFIX}${dateStr}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDailyChallengeRecord(record: DailyChallengeRecord): void {
    try {
      localStorage.setItem(`${KEYS.CHALLENGE_PREFIX}${record.date}`, JSON.stringify(record));
      this.recordLastModified();
    } catch (e) {
      console.error('Failed to save daily challenge record:', e);
    }
  },

  hasSeenDailyChallengePopup(dateStr: string): boolean {
    try {
      return localStorage.getItem(`${KEYS.CHALLENGE_POPUP_PREFIX}${dateStr}`) === 'true';
    } catch {
      return false;
    }
  },

  markDailyChallengePopupSeen(dateStr: string): void {
    try {
      localStorage.setItem(`${KEYS.CHALLENGE_POPUP_PREFIX}${dateStr}`, 'true');
    } catch (e) {
      console.error('Failed to mark challenge popup seen:', e);
    }
  },

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
      this.recordLastModified();
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
      this.recordLastModified();
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
      this.recordLastModified();
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
      this.recordLastModified();
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
      this.recordLastModified();
    } catch (e) {
      console.error('Failed to save badges:', e);
    }
  },

  getStats(): UserStats {
    const defaultStats: UserStats = {
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedTasksCount: 0,
      completedPrayersCount: 0,
      totalStudyMinutes: 0,
      takiSessionsAttended: 0,
      quranPagesTotal: 0,
      weeklyHistory: [],
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
      this.recordLastModified();
    } catch (e) {
      console.error('Failed to save stats:', e);
    }
  },

  getQuranProgress(): QuranProgress {
    const defaultQuran: QuranProgress = {
      currentPage: 1,
      dailyGoalPages: 2,
      pagesReadToday: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      currentSurah: 'الفاتحة',
      currentJuz: 1,
      memorizedSurahs: [],
      reviewedSurahs: [],
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
      this.recordLastModified();
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
      this.recordLastModified();
    } catch (e) {}
  },

  getCompletedRoutineIds(dateStr: string): string[] {
    try {
      const data = localStorage.getItem(`${KEYS.ROUTINE_PREFIX}${dateStr}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCompletedRoutineIds(dateStr: string, ids: string[]): void {
    try {
      localStorage.setItem(`${KEYS.ROUTINE_PREFIX}${dateStr}`, JSON.stringify(ids));
      this.recordLastModified();
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

  /**
   * Completely purges all demo homework, exams, fake stats, and scratchpad notes.
   * Leaves a pristine workspace for real student usage.
   */
  clearAllDemoData(): void {
    try {
      // Clear homework and exams
      localStorage.setItem(KEYS.HOMEWORK, JSON.stringify([]));
      localStorage.setItem(KEYS.EXAMS, JSON.stringify([]));

      // Reset stats to zero
      const cleanStats: UserStats = {
        xp: 0,
        level: 1,
        streakDays: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedTasksCount: 0,
        completedPrayersCount: 0,
        totalStudyMinutes: 0,
        takiSessionsAttended: 0,
        quranPagesTotal: 0,
        weeklyHistory: [],
      };
      this.saveStats(cleanStats);

      // Lock all badges
      this.saveBadges(INITIAL_BADGES);

      // Clean Quran progress
      this.saveQuranProgress({
        currentPage: 1,
        dailyGoalPages: 2,
        pagesReadToday: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        currentSurah: 'الفاتحة',
        currentJuz: 1,
        memorizedSurahs: [],
        reviewedSurahs: [],
      });

      // Clear scratchpad notes
      localStorage.removeItem('muslim_student_focus_notes');
      localStorage.removeItem('muslim_student_focus_freeform');

      // Clear all saved routine checkmarks
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(KEYS.ROUTINE_PREFIX) || k.startsWith(KEYS.PRAYERS_PREFIX))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to clear demo data:', e);
    }
  },

  resetAllData(): void {
    try {
      localStorage.clear();
      this.saveClasses(DEFAULT_SCHOOL_CLASSES);
      this.saveHomework([]);
      this.saveExams([]);
      this.saveSettings(INITIAL_SETTINGS);
      this.saveBadges(INITIAL_BADGES);
    } catch (e) {
      console.error('Failed to reset all data:', e);
    }
  },
};
