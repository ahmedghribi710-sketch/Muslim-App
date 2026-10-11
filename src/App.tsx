import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Timetable } from './components/Timetable';
import { DailyRoutine } from './components/DailyRoutine';
import { PrayerAndQuran } from './components/PrayerAndQuran';
import { HomeworkAndPomodoro } from './components/HomeworkAndPomodoro';
import { Achievements } from './components/Achievements';
import { Settings } from './components/Settings';
import { AdhkarModal } from './components/AdhkarModal';
import { PdfExportModal } from './components/PdfExportModal';
import { AuthModal } from './components/AuthModal';

import {
  SchoolClass,
  HomeworkItem,
  ExamItem,
  UserSettings,
  UserStats,
  AchievementBadge,
  QuranProgress,
  DailyPrayerRecord,
  PrayerTimeData,
} from './types';
import { storage } from './utils/storage';
import { calculateAstronomicalTimes, fetchLivePrayerTimes } from './utils/prayerTimes';
import { getTodayDayOfWeek, parseMinutes } from './utils/arabicDates';
import { generateDailyRoutine } from './utils/smartScheduler';
import { sound } from './utils/sound';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  syncUserDataToCloud,
  loadUserDataFromCloud,
  testFirestoreConnection,
} from './utils/firebase';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('muslim_planner_theme') === 'dark';
    }
    return false;
  });

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Data loaded from storage
  const [classes, setClasses] = useState<SchoolClass[]>(() => storage.getClasses());
  const [homework, setHomework] = useState<HomeworkItem[]>(() => storage.getHomework());
  const [exams, setExams] = useState<ExamItem[]>(() => storage.getExams());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [stats, setStats] = useState<UserStats>(() => storage.getStats());
  const [badges, setBadges] = useState<AchievementBadge[]>(() => storage.getBadges());
  const [quran, setQuran] = useState<QuranProgress>(() => storage.getQuranProgress());

  const todayDateStr = new Date().toISOString().split('T')[0];
  const [dailyPrayers, setDailyPrayers] = useState<DailyPrayerRecord>(() =>
    storage.getDailyPrayers(todayDateStr)
  );
  const [completedRoutineIds, setCompletedRoutineIds] = useState<string[]>(() =>
    storage.getCompletedRoutineIds(todayDateStr)
  );

  // Prayer times for current city
  const [prayers, setPrayers] = useState<PrayerTimeData>(() =>
    calculateAstronomicalTimes(new Date(), 36.8065, 10.1815)
  );

  const [isAdhkarOpen, setIsAdhkarOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [takiAlertFired, setTakiAlertFired] = useState(false);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load cloud data if available
        const cloudData = await loadUserDataFromCloud(user.uid);
        if (cloudData) {
          if (cloudData.classes) setClasses(cloudData.classes);
          if (cloudData.homework) setHomework(cloudData.homework);
          if (cloudData.profile) {
            setSettings((prev) => ({
              ...prev,
              studentName: cloudData.profile?.studentName || prev.studentName,
              selectedCity: cloudData.profile?.selectedCity || prev.selectedCity,
            }));
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Cloud sync handler
  const handleSyncCloud = async () => {
    if (!currentUser) {
      const user = await loginWithGoogle();
      if (!user) return;
    }
    if (currentUser) {
      await syncUserDataToCloud(currentUser.uid, settings, stats, classes, homework);
      sound.playSuccess();
      confetti({ particleCount: 35, spread: 60 });
    }
  };

  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      sound.playSuccess();
      confetti({ particleCount: 40, spread: 70 });
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // Apply dark mode class to root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('muslim_planner_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('muslim_planner_theme', 'light');
    }
  }, [isDark]);

  // Fetch live prayer times
  useEffect(() => {
    let isMounted = true;
    fetchLivePrayerTimes(settings.selectedCity, new Date()).then((data) => {
      if (isMounted) setPrayers(data);
    });
    return () => {
      isMounted = false;
    };
  }, [settings.selectedCity]);

  // Check 19:15 Taki Academy alert
  useEffect(() => {
    if (!settings.enableTakiAlert) return;

    const checkTakiTime = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      if (mins >= 1155 && mins < 1170 && !takiAlertFired) {
        sound.playTakiAlert();
        setTakiAlertFired(true);
      } else if (mins < 1155 || mins >= 1170) {
        if (takiAlertFired) setTakiAlertFired(false);
      }
    };

    const interval = setInterval(checkTakiTime, 30000);
    checkTakiTime();
    return () => clearInterval(interval);
  }, [settings.enableTakiAlert, takiAlertFired]);

  // Handlers with persistence & XP rewards
  const addXP = useCallback(
    (amount: number, reason: string) => {
      setStats((prev) => {
        const nextXp = prev.xp + amount;
        const nextLevel = Math.floor(nextXp / 250) + 1;
        const updated = {
          ...prev,
          xp: nextXp,
          level: Math.max(prev.level, nextLevel),
        };
        storage.saveStats(updated);
        return updated;
      });
    },
    []
  );

  const handleSaveClasses = (newClasses: SchoolClass[]) => {
    setClasses(newClasses);
    storage.saveClasses(newClasses);
    if (currentUser) {
      syncUserDataToCloud(currentUser.uid, settings, stats, newClasses, homework);
    }
  };

  const handleSaveHomework = (newHomework: HomeworkItem[]) => {
    setHomework(newHomework);
    storage.saveHomework(newHomework);
    if (currentUser) {
      syncUserDataToCloud(currentUser.uid, settings, stats, classes, newHomework);
    }
  };

  const handleSaveExams = (newExams: ExamItem[]) => {
    setExams(newExams);
    storage.saveExams(newExams);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    if (currentUser) {
      syncUserDataToCloud(currentUser.uid, newSettings, stats, classes, homework);
    }
  };

  const handleUpdatePrayers = (newPrayers: DailyPrayerRecord) => {
    setDailyPrayers(newPrayers);
    storage.saveDailyPrayers(todayDateStr, newPrayers);
    addXP(20, 'صلاة مكتملة');
  };

  const handleUpdateQuran = (newQuran: QuranProgress) => {
    setQuran(newQuran);
    storage.saveQuranProgress(newQuran);
    addXP(15, 'قراءة صفحة قرآن');
  };

  const handleToggleRoutineItem = (id: string) => {
    setCompletedRoutineIds((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((i) => i !== id);
      } else {
        updated = [...prev, id];
        addXP(10, 'مهمة روتين');
      }
      storage.saveCompletedRoutineIds(todayDateStr, updated);
      return updated;
    });
  };

  const handleToggleHomework = (id: string) => {
    const updated = homework.map((h) => {
      if (h.id === id) {
        const isNowCompleted = h.status !== 'completed';
        if (isNowCompleted) {
          addXP(25, 'إنجاز واجب');
        }
        return {
          ...h,
          status: isNowCompleted ? ('completed' as const) : ('pending' as const),
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return h;
    });
    handleSaveHomework(updated);
  };

  const handleAddQuranPage = () => {
    const updated = {
      ...quran,
      pagesReadToday: quran.pagesReadToday + 1,
      currentPage: quran.currentPage + 1,
    };
    handleUpdateQuran(updated);
  };

  const handleAttendTaki = () => {
    setStats((prev) => {
      const updated = {
        ...prev,
        xp: prev.xp + 35,
        takiSessionsAttended: prev.takiSessionsAttended + 1,
      };
      storage.saveStats(updated);
      return updated;
    });
  };

  const handleCompletePomodoroSession = (minutes: number) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        xp: prev.xp + 20,
        totalStudyMinutes: prev.totalStudyMinutes + minutes,
      };
      storage.saveStats(updated);
      return updated;
    });
  };

  const handleCompleteAdhkar = () => {
    sound.playSuccess();
    confetti({ particleCount: 50, spread: 70 });
    addXP(25, 'إتمام أذكار اليوم');
    setIsAdhkarOpen(false);
  };

  const handleResetAll = () => {
    storage.resetAllData();
    setClasses(storage.getClasses());
    setHomework(storage.getHomework());
    setExams(storage.getExams());
    setSettings(storage.getSettings());
    setBadges(storage.getBadges());
    setStats(storage.getStats());
    setQuran(storage.getQuranProgress());
    setCompletedRoutineIds(storage.getCompletedRoutineIds(todayDateStr));
    setDailyPrayers(storage.getDailyPrayers(todayDateStr));
    sound.playSuccess();
    confetti({ particleCount: 50, spread: 70 });
  };

  const todayDay = getTodayDayOfWeek();
  const routine = generateDailyRoutine(todayDay, prayers, settings, homework);
  const pendingHomeworkCount = homework.filter((h) => h.status !== 'completed').length;

  return (
    <div className={`min-h-screen bg-[#F8F6F0] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200 ${settings.visualStyle === 'neobrutalism' ? 'style-neo' : 'style-clay'}`}>
      
      {/* 1. Top Navbar */}
      <Navbar
        stats={stats}
        settings={settings}
        currentUser={currentUser}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onSyncCloud={handleSyncCloud}
        onOpenAdhkar={() => setIsAdhkarOpen(true)}
        onOpenPdf={() => setIsPdfModalOpen(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
      />

      {/* 2. Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingHomeworkCount={pendingHomeworkCount}
      />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            prayers={prayers}
            homework={homework}
            classes={classes}
            settings={settings}
            stats={stats}
            quran={quran}
            dailyPrayers={dailyPrayers}
            completedRoutineIds={completedRoutineIds}
            totalRoutineCount={routine.length}
            onNavigate={setActiveTab}
            onToggleHomework={handleToggleHomework}
            onAddQuranPage={handleAddQuranPage}
            onAttendTaki={handleAttendTaki}
          />
        )}

        {activeTab === 'timetable' && (
          <Timetable
            classes={classes}
            settings={settings}
            onSaveClasses={handleSaveClasses}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {activeTab === 'routine' && (
          <DailyRoutine
            prayers={prayers}
            settings={settings}
            homework={homework}
            completedRoutineIds={completedRoutineIds}
            onToggleRoutineItem={handleToggleRoutineItem}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {activeTab === 'prayer-quran' && (
          <PrayerAndQuran
            prayers={prayers}
            dailyPrayers={dailyPrayers}
            quran={quran}
            settings={settings}
            onUpdatePrayers={handleUpdatePrayers}
            onUpdateQuran={handleUpdateQuran}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'homework' && (
          <HomeworkAndPomodoro
            homework={homework}
            exams={exams}
            settings={settings}
            onSaveHomework={handleSaveHomework}
            onSaveExams={handleSaveExams}
            onSessionComplete={handleCompletePomodoroSession}
          />
        )}

        {activeTab === 'achievements' && (
          <Achievements stats={stats} badges={badges} />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAll={handleResetAll}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* Adhkar Modal */}
      <AdhkarModal
        isOpen={isAdhkarOpen}
        onClose={() => setIsAdhkarOpen(false)}
        onCompleteAdhkar={handleCompleteAdhkar}
      />

      {/* PDF Export / Print Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        classes={classes}
        settings={settings}
        prayers={prayers}
        routine={routine}
      />

      {/* Accessible Neo-Brutalist Auth / Sign-in Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user, customEmail) => {
          if (user) {
            setCurrentUser(user);
          } else if (customEmail) {
            setSettings((prev) => ({
              ...prev,
              studentName: customEmail.split('@')[0],
            }));
          }
        }}
      />

    </div>
  );
}

