import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Timetable } from './components/Timetable';
import { DailyRoutine } from './components/DailyRoutine';
import { PrayerAndQuran } from './components/PrayerAndQuran';
import { HomeworkAndPomodoro } from './components/HomeworkAndPomodoro';
import { Settings } from './components/Settings';
import { AdhkarModal } from './components/AdhkarModal';
import { PdfExportModal } from './components/PdfExportModal';
import { AuthModal } from './components/AuthModal';
import { FocusScratchpad } from './components/FocusScratchpad';
import { NotificationToastContainer } from './components/NotificationToast';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { getDailyChallengeForDate } from './utils/defaultData';
import {
  notifyTakiAcademyPrep,
  notifyPomodoroComplete,
  sendAppNotification,
  notifyDailyChallengePrompt,
  notifyDailyChallengeCompleted,
} from './utils/notifications';
import { EyeOff, Sparkles, Timer, Lightbulb } from 'lucide-react';

import {
  SchoolClass,
  HomeworkItem,
  ExamItem,
  UserSettings,
  UserStats,
  QuranProgress,
  DailyPrayerRecord,
  PrayerTimeData,
  DailyChallengeRecord,
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
  const [quran, setQuran] = useState<QuranProgress>(() => storage.getQuranProgress());

  const todayDateStr = new Date().toISOString().split('T')[0];
  const [dailyPrayers, setDailyPrayers] = useState<DailyPrayerRecord>(() =>
    storage.getDailyPrayers(todayDateStr)
  );
  const [completedRoutineIds, setCompletedRoutineIds] = useState<string[]>(() =>
    storage.getCompletedRoutineIds(todayDateStr)
  );

  const todayChallenge = getDailyChallengeForDate(todayDateStr);
  const [dailyChallengeRecord, setDailyChallengeRecord] = useState<DailyChallengeRecord | null>(() =>
    storage.getDailyChallengeRecord(todayDateStr)
  );
  const [isDailyChallengeModalOpen, setIsDailyChallengeModalOpen] = useState(false);

  useEffect(() => {
    const seen = storage.hasSeenDailyChallengePopup(todayDateStr);
    if (!seen) {
      storage.markDailyChallengePopupSeen(todayDateStr);
      setIsDailyChallengeModalOpen(true);
      notifyDailyChallengePrompt(todayChallenge.title, todayChallenge.xpReward);
    }
  }, [todayDateStr, todayChallenge]);

  const handleCompleteDailyChallenge = () => {
    const record: DailyChallengeRecord = {
      date: todayDateStr,
      challengeId: todayChallenge.id,
      completed: true,
      completedAt: new Date().toISOString(),
      xpAwarded: todayChallenge.xpReward,
    };
    storage.saveDailyChallengeRecord(record);
    setDailyChallengeRecord(record);
    sound.playChallengeComplete();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    addXP(todayChallenge.xpReward, 'إنجاز تحدي اليوم');
    notifyDailyChallengeCompleted(todayChallenge.title, todayChallenge.xpReward);
    setIsDailyChallengeModalOpen(false);
  };

  // Prayer times for current city
  const [prayers, setPrayers] = useState<PrayerTimeData>(() =>
    calculateAstronomicalTimes(new Date(), 36.8065, 10.1815)
  );

  const [isAdhkarOpen, setIsAdhkarOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [takiAlertFired, setTakiAlertFired] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFocusScratchpadOpen, setIsFocusScratchpadOpen] = useState(false);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // One-time safe purge of initial dummy test items if not previously purged
  useEffect(() => {
    if (!storage.isDemoPurged()) {
      const cleanHw = homework.filter((h) => !['hw-1', 'hw-2', 'hw-3'].includes(h.id));
      if (cleanHw.length !== homework.length) {
        setHomework(cleanHw);
        storage.saveHomework(cleanHw);
      }
      const cleanExams = exams.filter((e) => !['exam-1', 'exam-2', 'exam-3'].includes(e.id));
      if (cleanExams.length !== exams.length) {
        setExams(cleanExams);
        storage.saveExams(cleanExams);
      }
      storage.setDemoPurged(true);
    }
  }, []);

  // Unconditional Reactive Persistence: Any state change across the app is immediately persisted to LocalStorage
  const isHydratedRef = useRef(false);
  useEffect(() => {
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      return;
    }
    storage.saveClasses(classes);
  }, [classes]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveHomework(homework);
  }, [homework]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveExams(exams);
  }, [exams]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveStats(stats);
  }, [stats]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveQuranProgress(quran);
  }, [quran]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveDailyPrayers(todayDateStr, dailyPrayers);
  }, [dailyPrayers, todayDateStr]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    storage.saveCompletedRoutineIds(todayDateStr, completedRoutineIds);
  }, [completedRoutineIds, todayDateStr]);

  // Monitor Firebase Auth state & Smart Cloud Sync (Conflict-free & timestamp-aware)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const cloudData = await loadUserDataFromCloud(user.uid);
        if (cloudData) {
          const localTs = storage.getLastModified();
          // If local data is newer than cloud data, push local data to cloud immediately
          if (cloudData.lastModified && cloudData.lastModified < localTs) {
            syncUserDataToCloud(
              user.uid,
              settings,
              stats,
              classes,
              homework,
              exams,
              quran,
              localTs
            );
          } else {
            // Cloud data is newer or freshly synchronized: adopt cloud data and update LocalStorage
            if (cloudData.settings) {
              setSettings(cloudData.settings);
              storage.saveSettings(cloudData.settings);
            } else if (cloudData.profile) {
              setSettings((prev) => {
                const updated = {
                  ...prev,
                  studentName: cloudData.profile?.studentName || prev.studentName,
                  selectedCity: cloudData.profile?.selectedCity || prev.selectedCity,
                  wakeUpTime: cloudData.profile?.wakeUpTime || prev.wakeUpTime,
                  targetBedTime: cloudData.profile?.targetBedTime || prev.targetBedTime,
                  commuteMinutes: cloudData.profile?.commuteMinutes ?? prev.commuteMinutes,
                };
                storage.saveSettings(updated);
                return updated;
              });
            }

            if (cloudData.classes) {
              setClasses(cloudData.classes);
              storage.saveClasses(cloudData.classes);
            }

            if (cloudData.homework) {
              setHomework(cloudData.homework);
              storage.saveHomework(cloudData.homework);
            }

            if (cloudData.exams) {
              setExams(cloudData.exams);
              storage.saveExams(cloudData.exams);
            }

            if (cloudData.quran) {
              setQuran(cloudData.quran);
              storage.saveQuranProgress(cloudData.quran);
            }

            if (cloudData.stats) {
              setStats(cloudData.stats);
              storage.saveStats(cloudData.stats);
            } else if (cloudData.profile) {
              setStats((prev) => {
                const updated = {
                  ...prev,
                  xp: cloudData.profile?.xp ?? prev.xp,
                  level: cloudData.profile?.level ?? prev.level,
                  streakDays: cloudData.profile?.streakDays ?? prev.streakDays,
                  totalStudyMinutes: cloudData.profile?.totalStudyMinutes ?? prev.totalStudyMinutes,
                  weeklyHistory: cloudData.profile?.weeklyHistory ?? prev.weeklyHistory,
                };
                storage.saveStats(updated);
                return updated;
              });
            }

            if (cloudData.lastModified) {
              storage.recordLastModified(cloudData.lastModified);
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Cloud sync handler
  const handleSyncCloud = async () => {
    let user = currentUser;
    if (!user) {
      user = await loginWithGoogle();
      if (!user) return;
    }
    if (user) {
      const res = await syncUserDataToCloud(
        user.uid,
        settings,
        stats,
        classes,
        homework,
        exams,
        quran,
        storage.getLastModified()
      );
      if (res.success) {
        sound.playSuccess();
        confetti({ particleCount: 35, spread: 60 });
        sendAppNotification('تمت المزامنة السحابية بنجاح ☁️', {
          body: 'تم حفظ وتحديث كافة بياناتك وجدولك المدرسي وإعداداتك بنجاح على Firebase.',
          type: 'success',
        });
      }
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

  // Automatic Cloud Sync to Firebase (Mise à jour automatique des données)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!currentUser) return;

    // Fast debounce cloud sync (700ms) after user changes settings, stats, classes, or homework
    const timer = setTimeout(async () => {
      try {
        await syncUserDataToCloud(
          currentUser.uid,
          settings,
          stats,
          classes,
          homework,
          exams,
          quran,
          storage.getLastModified()
        );
      } catch (err) {
        console.warn('Auto-sync notice:', err);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [currentUser, settings, stats, classes, homework, exams, quran]);

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
        notifyTakiAcademyPrep(15);
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
    (amount: number, _reason: string) => {
      setStats((prev) => {
        const nextXp = prev.xp + amount;
        const nextLevel = Math.floor(nextXp / 250) + 1;
        
        // Update today's XP in weeklyHistory
        const todayStr = new Date().toISOString().split('T')[0];
        const existingHistory = prev.weeklyHistory ? [...prev.weeklyHistory] : [];
        const todayIndex = existingHistory.findIndex((r) => r.date === todayStr);

        if (todayIndex >= 0) {
          existingHistory[todayIndex] = {
            ...existingHistory[todayIndex],
            xpGained: existingHistory[todayIndex].xpGained + amount,
          };
        } else {
          existingHistory.push({
            date: todayStr,
            dayLabel: 'اليوم',
            studyMinutes: 0,
            xpGained: amount,
          });
        }

        const updated = {
          ...prev,
          xp: nextXp,
          level: Math.max(prev.level, nextLevel),
          weeklyHistory: existingHistory.slice(-14), // keep recent records
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
      syncUserDataToCloud(
        currentUser.uid,
        settings,
        stats,
        newClasses,
        homework,
        exams,
        quran,
        storage.getLastModified()
      );
    }
  };

  const handleSaveHomework = (newHomework: HomeworkItem[]) => {
    setHomework(newHomework);
    storage.saveHomework(newHomework);
    if (currentUser) {
      syncUserDataToCloud(
        currentUser.uid,
        settings,
        stats,
        classes,
        newHomework,
        exams,
        quran,
        storage.getLastModified()
      );
    }
  };

  const handleSaveExams = (newExams: ExamItem[]) => {
    setExams(newExams);
    storage.saveExams(newExams);
    if (currentUser) {
      syncUserDataToCloud(
        currentUser.uid,
        settings,
        stats,
        classes,
        homework,
        newExams,
        quran,
        storage.getLastModified()
      );
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    if (currentUser) {
      syncUserDataToCloud(
        currentUser.uid,
        newSettings,
        stats,
        classes,
        homework,
        exams,
        quran,
        storage.getLastModified()
      );
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
    if (currentUser) {
      syncUserDataToCloud(
        currentUser.uid,
        settings,
        stats,
        classes,
        homework,
        exams,
        newQuran,
        storage.getLastModified()
      );
    }
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
        const updatedItem: HomeworkItem = {
          ...h,
          status: isNowCompleted ? ('completed' as const) : ('pending' as const),
        };
        if (isNowCompleted) {
          updatedItem.completedAt = new Date().toISOString();
        } else {
          delete updatedItem.completedAt;
        }
        return updatedItem;
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
    notifyPomodoroComplete('work', minutes);
    setStats((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingHistory = prev.weeklyHistory ? [...prev.weeklyHistory] : [];
      const todayIndex = existingHistory.findIndex((r) => r.date === todayStr);

      if (todayIndex >= 0) {
        existingHistory[todayIndex] = {
          ...existingHistory[todayIndex],
          studyMinutes: existingHistory[todayIndex].studyMinutes + minutes,
          xpGained: existingHistory[todayIndex].xpGained + 20,
        };
      } else {
        existingHistory.push({
          date: todayStr,
          dayLabel: 'اليوم',
          studyMinutes: minutes,
          xpGained: 20,
        });
      }

      const nextXp = prev.xp + 20;
      const nextLevel = Math.floor(nextXp / 250) + 1;
      const updated = {
        ...prev,
        xp: nextXp,
        level: Math.max(prev.level, nextLevel),
        totalStudyMinutes: prev.totalStudyMinutes + minutes,
        weeklyHistory: existingHistory.slice(-14),
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
    setStats(storage.getStats());
    setQuran(storage.getQuranProgress());
    setCompletedRoutineIds(storage.getCompletedRoutineIds(todayDateStr));
    setDailyPrayers(storage.getDailyPrayers(todayDateStr));
    sound.playSuccess();
    confetti({ particleCount: 50, spread: 70 });
  };

  const handleClearAllDemoData = async () => {
    storage.clearAllDemoData();
    setHomework([]);
    setExams([]);
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
    setStats(cleanStats);
    setQuran(storage.getQuranProgress());
    setCompletedRoutineIds([]);
    setDailyPrayers({
      date: todayDateStr,
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    });
    sound.playSuccess();
    confetti({ particleCount: 40, spread: 70 });
    sendAppNotification('تم حذف جميع البيانات التجريبية بنجاح 🗑️', {
      body: 'تم تفريغ كافة الواجبات، الامتحانات، والإحصائيات التجريبية. المنصة نظيفة تمامًا الآن.',
      type: 'success',
    });

    if (currentUser) {
      await syncUserDataToCloud(
        currentUser.uid,
        settings,
        cleanStats,
        classes,
        [],
        [],
        storage.getQuranProgress(),
        storage.getLastModified()
      );
    }
  };

  const todayDay = getTodayDayOfWeek();
  const routine = generateDailyRoutine(todayDay, prayers, settings, homework);
  const pendingHomeworkCount = homework.filter((h) => h.status !== 'completed').length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all duration-500 relative ${
        isFocusMode
          ? 'bg-stone-950 text-stone-100'
          : 'bg-[#F8F6F0] dark:bg-stone-950 text-stone-900 dark:text-stone-100'
      } ${settings.visualStyle === 'neobrutalism' ? 'style-neo' : 'style-clay'}`}
    >
      {/* Night Study Mode Overlay (Blue-Light Filter & Screen Power Saving) */}
      {settings.enableNightStudyMode && (
        <div className="fixed inset-0 bg-amber-950/25 dark:bg-black/40 backdrop-brightness-95 pointer-events-none z-50 transition-all duration-500 flex flex-col justify-between p-3">
          <div className="flex items-center justify-between bg-indigo-950/80 text-indigo-200 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md w-fit mx-auto border border-indigo-500/40">
            <span>🌙 وضع المذاكرة الليلية نشط (فلتر الضوء الأزرق + توفير الطاقة)</span>
          </div>
        </div>
      )}

      {/* Dim overlay with subtle ambient radial glow in focus mode */}
      {isFocusMode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none z-10 transition-opacity duration-500" />
      )}

      {/* 1. Top Navbar (hidden or dimmed during Focus Mode with quick exit pill) */}
      {!isFocusMode ? (
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
      ) : (
        /* Minimal Focus Mode Top Bar */
        <header className="sticky top-0 z-30 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 text-stone-200 py-2.5 px-4 sm:px-6 shadow-md animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="font-black text-xs sm:text-sm text-amber-300">
                وضع التركيز نشط (Focus Mode)
              </span>
              <span className="text-[11px] text-stone-400 hidden sm:inline">
                • تم إخفاء شريط التنقل وتعتيم الخلفية لتصفية الذهن
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFocusScratchpadOpen(true)}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-black border border-amber-400/40 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="مساحة الملاحظات والأفكار الطارئة أثناء التركيز"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>ملاحظات طارئة</span>
              </button>

              <button
                onClick={() => setIsFocusMode(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-black border border-stone-700/80 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>إنهاء وضع التركيز</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. Main Navigation Tabs - HIDDEN when Focus Mode is active */}
      {!isFocusMode && (
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingHomeworkCount={pendingHomeworkCount}
        />
      )}

      {/* 3. Main Body Container */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-20 transition-all duration-300 ${isFocusMode ? 'max-w-5xl' : ''}`}>
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
            dailyChallenge={todayChallenge}
            dailyChallengeRecord={dailyChallengeRecord}
            onNavigate={setActiveTab}
            onToggleHomework={handleToggleHomework}
            onAddQuranPage={handleAddQuranPage}
            onAttendTaki={handleAttendTaki}
            onOpenDailyChallengeModal={() => setIsDailyChallengeModalOpen(true)}
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
            isFocusMode={isFocusMode}
            onToggleFocusMode={(enabled) => setIsFocusMode(enabled ?? !isFocusMode)}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            stats={stats}
            dailyPrayers={dailyPrayers}
            currentUser={currentUser}
            onSyncCloud={handleSyncCloud}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onClearDemoData={handleClearAllDemoData}
            onUpdateSettings={handleUpdateSettings}
            onResetAll={handleResetAll}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* Global In-App Notification Toast Container */}
      <NotificationToastContainer />

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
            const cleanName = customEmail.split('@')[0];
            setSettings((prev) => {
              const updated = {
                ...prev,
                studentName: cleanName,
              };
              storage.saveSettings(updated);
              return updated;
            });
          }
        }}
      />

      {/* Floating Focus Mode Scratchpad Modal */}
      {isFocusScratchpadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <FocusScratchpad
            isFocusMode={true}
            isFloatingModal={true}
            onClose={() => setIsFocusScratchpadOpen(false)}
          />
        </div>
      )}

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={isDailyChallengeModalOpen}
        onClose={() => setIsDailyChallengeModalOpen(false)}
        challenge={todayChallenge}
        record={dailyChallengeRecord}
        onComplete={handleCompleteDailyChallenge}
      />

    </div>
  );
}

