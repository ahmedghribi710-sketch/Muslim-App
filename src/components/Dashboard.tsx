import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  Moon,
  GraduationCap,
  Sparkles,
  ArrowRight,
  School,
  Clock,
  Flame,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  PrayerTimeData,
  HomeworkItem,
  SchoolClass,
  UserSettings,
  UserStats,
  QuranProgress,
  DailyPrayerRecord,
} from '../types';
import {
  formatGregorianArabic,
  formatHijriArabic,
  getTodayDayOfWeek,
  MOTIVATIONAL_QUOTES,
  parseMinutes,
} from '../utils/arabicDates';
import { getNextPrayer, NextPrayerInfo } from '../utils/prayerTimes';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface DashboardProps {
  prayers: PrayerTimeData;
  homework: HomeworkItem[];
  classes: SchoolClass[];
  settings: UserSettings;
  stats: UserStats;
  quran: QuranProgress;
  dailyPrayers: DailyPrayerRecord;
  completedRoutineIds: string[];
  totalRoutineCount: number;
  onNavigate: (tab: any) => void;
  onToggleHomework: (id: string) => void;
  onAddQuranPage: () => void;
  onAttendTaki: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  prayers,
  homework,
  classes,
  settings,
  stats,
  quran,
  dailyPrayers,
  completedRoutineIds,
  totalRoutineCount,
  onNavigate,
  onToggleHomework,
  onAddQuranPage,
  onAttendTaki,
}) => {
  const [currentDate] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo>(getNextPrayer(prayers));
  const [quoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));

  const todayDay = getTodayDayOfWeek(currentDate);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Update countdown every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer(prayers));
    }, 30000);
    return () => clearInterval(timer);
  }, [prayers]);

  // Find current and next school class today
  const todayClasses = classes
    .filter((c) => c.day === todayDay)
    .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));

  let currentClass: SchoolClass | null = null;
  let nextClass: SchoolClass | null = null;

  for (const c of todayClasses) {
    const startM = parseMinutes(c.startTime);
    const endM = parseMinutes(c.endTime);
    if (currentMinutes >= startM && currentMinutes < endM) {
      currentClass = c;
    } else if (currentMinutes < startM && !nextClass) {
      nextClass = c;
    }
  }

  // Today's homework items
  const todayDateStr = new Date().toISOString().split('T')[0];
  const pendingHomework = homework.filter(
    (h) => h.status !== 'completed' && (h.dueDate <= todayDateStr || h.priority === 'high')
  );

  // Taki Academy status
  const takiStart = parseMinutes('19:30');
  const takiEnd = parseMinutes('21:00');
  const takiPrep = parseMinutes('19:15');

  let takiState: 'upcoming' | 'prep' | 'active' | 'finished' = 'upcoming';
  let takiDiffMinutes = 0;

  if (currentMinutes < takiPrep) {
    takiState = 'upcoming';
    takiDiffMinutes = takiStart - currentMinutes;
  } else if (currentMinutes >= takiPrep && currentMinutes < takiStart) {
    takiState = 'prep';
    takiDiffMinutes = takiStart - currentMinutes;
  } else if (currentMinutes >= takiStart && currentMinutes < takiEnd) {
    takiState = 'active';
  } else {
    takiState = 'finished';
  }

  // Bedtime calculation
  const bedMinutes = parseMinutes(settings.targetBedTime || '21:45');
  const minsUntilBed = bedMinutes > currentMinutes ? bedMinutes - currentMinutes : 0;
  const bedHours = Math.floor(minsUntilBed / 60);
  const bedMins = minsUntilBed % 60;

  // Calculate overall goal completion % for today
  // 5 prayers + routine completed count + homework done + quran
  const prayersCount = [
    dailyPrayers.fajr,
    dailyPrayers.dhuhr,
    dailyPrayers.asr,
    dailyPrayers.maghrib,
    dailyPrayers.isha,
  ].filter(Boolean).length;

  const homeworkCompletedToday = homework.filter((h) => h.status === 'completed').length;
  const homeworkTotalToday = homework.length || 1;

  const totalPoints = 5 + (totalRoutineCount || 10) + homeworkTotalToday + 2;
  const earnedPoints =
    prayersCount +
    completedRoutineIds.length +
    homeworkCompletedToday +
    Math.min(2, quran.pagesReadToday);

  const completionPercent = Math.min(100, Math.round((earnedPoints / totalPoints) * 100));

  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. Header Hero Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0F382A] via-[#164e3b] to-[#0d2f23] text-white rounded-3xl p-6 sm:p-8 border-2 border-stone-900 shadow-[5px_5px_0px_0px_#1c1917] dark:shadow-[5px_5px_0px_0px_#000]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 border border-stone-900 shadow-[2px_2px_0px_#000] px-3 py-1 rounded-full text-xs font-black">
              <span>{formatGregorianArabic(currentDate)}</span>
              <span>•</span>
              <span>{formatHijriArabic(currentDate)}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-50 tracking-tight">
              السلام عليكم يا {settings.studentName}! يوم موفق ومبارك 🌟
            </h2>

            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
              أهلاً بك في يومك الدراسي الجديد. خطّط جيدًا، ابدأ باسم الله، وحافظ على صلواتك
              والتزام <span className="text-amber-300 font-bold underline decoration-amber-400 decoration-2">Taki Academy</span> ونومك المبكر.
            </p>
          </div>

          {/* Goals completion badge */}
          <div className="bg-stone-900/60 backdrop-blur-md border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-4 min-w-[200px] shadow-[3px_3px_0px_#000]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-emerald-950/40"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${completionPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-black text-lg text-amber-300">
                {completionPercent}%
              </span>
            </div>
            <div>
              <div className="text-xs text-emerald-200 font-bold">إنجاز اليوم</div>
              <div className="text-sm font-black text-white">
                {earnedPoints} / {totalPoints} أهداف
              </div>
              <button
                onClick={() => onNavigate('routine')}
                className="text-[11px] text-amber-300 hover:underline flex items-center gap-0.5 mt-0.5 font-bold"
              >
                تفاصيل الروتين <ArrowRight className="w-3 h-3 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Taki Academy Live Status Banner */}
      <div
        className={`rounded-2xl p-5 border-2 border-stone-900 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000] transition-all ${
          takiState === 'active'
            ? 'bg-amber-100 dark:bg-indigo-950/60 border-amber-500'
            : takiState === 'prep'
            ? 'bg-amber-200 dark:bg-amber-950/60 border-stone-900'
            : 'bg-white dark:bg-stone-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white border-2 border-stone-900 shadow-[2px_2px_0px_#000] flex items-center justify-center font-black shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-stone-900 dark:text-white">
                  Taki Academy • تقي أكاديمي
                </span>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-2 border-stone-900 dark:border-indigo-400 text-xs px-2.5 py-0.5 rounded-lg font-black shadow-[1.5px_1.5px_0px_#000]">
                  يوميًا 19:30 – 21:00
                </span>
                {takiState === 'active' && (
                  <span className="bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded-lg font-black border border-stone-900 animate-pulse flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000]">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> مباشر الآن
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
                {takiState === 'upcoming' && (
                  <>
                    الموعد القادم بعد{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                      {Math.floor(takiDiffMinutes / 60)} س و {takiDiffMinutes % 60} د
                    </strong>
                    . احرص على إنهاء واجباتك المدرسية قبل الساعة 19:30.
                  </>
                )}
                {takiState === 'prep' && (
                  <span className="text-amber-900 dark:text-amber-300 font-black">
                    ⏰ تنبيه: تبدأ الحصة بعد {takiDiffMinutes} دقيقة! جهز كراسك ومنصتك الآن.
                  </span>
                )}
                {takiState === 'active' && (
                  <span className="text-indigo-900 dark:text-indigo-200 font-bold">
                    حصة اليوم جارية الآن. ركّز جيدًا ولا تنشغل بأي مهمة أخرى حتى 21:00.
                  </span>
                )}
                {takiState === 'finished' && (
                  <span className="text-emerald-800 dark:text-emerald-400 font-bold">
                    ✓ انتهت حصة Taki Academy اليوم بنجاح! لا دراسة إضافية الليلة، استعد للنوم وصلاة العشاء.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playSuccess();
                confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
                onAttendTaki();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:translate-x-[2px] active:translate-y-[2px] text-white font-black text-xs sm:text-sm rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل الحضور (+35 XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Three Key Metrics Cards: Next Prayer, School Session, Sleep Target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Next Prayer */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-2 border-stone-900 flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">
                  الصلاة القادمة • {settings.selectedCity}
                </span>
                <h3 className="font-black text-lg text-stone-900 dark:text-white">
                  صلاة {nextPrayer.nameAr} ({nextPrayer.time})
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border-2 border-stone-900 flex items-center justify-between shadow-[2px_2px_0px_#000]">
            <span className="text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              الوقت المتبقي:
            </span>
            <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 text-sm">
              {nextPrayer.timeRemaining}
            </span>
          </div>

          <button
            onClick={() => onNavigate('prayer-quran')}
            className="w-full mt-3 text-xs text-[#0F382A] dark:text-emerald-400 hover:underline font-black flex items-center justify-center gap-1 pt-1"
          >
            سجل أداء الصلوات والورد <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* School Session */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000] transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-2 border-stone-900 flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">
                  الجدول المدرسي اليوم
                </span>
                <h3 className="font-black text-lg text-stone-900 dark:text-white">
                  {currentClass
                    ? `جارية: ${currentClass.subject}`
                    : nextClass
                    ? `القادمة: ${nextClass.subject}`
                    : todayClasses.length > 0
                    ? 'انتهت حصص اليوم'
                    : 'عطلة اليوم'}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-3 border-2 border-stone-900 flex items-center justify-between text-xs shadow-[2px_2px_0px_#000]">
            <span className="text-blue-900 dark:text-blue-200 font-bold">
              {currentClass
                ? `${currentClass.startTime} - ${currentClass.endTime} (${currentClass.classroom || 'الإعدادية'})`
                : nextClass
                ? `تبدأ الساعة ${nextClass.startTime} (${nextClass.classroom || 'الإعدادية'})`
                : 'العودة للمنزل وإنجاز الواجبات'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('timetable')}
            className="w-full mt-3 text-xs text-blue-700 dark:text-blue-400 hover:underline font-black flex items-center justify-center gap-1 pt-1"
          >
            عرض الجدول المدرسي الكامل <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* Sleep & Bedtime Countdown */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000] transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-2 border-stone-900 flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">
                  وقت النوم المستهدف
                </span>
                <h3 className="font-black text-lg text-stone-900 dark:text-white">
                  {settings.targetBedTime} ليلاً
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-xl p-3 border-2 border-stone-900 flex items-center justify-between text-xs shadow-[2px_2px_0px_#000]">
            <span className="text-purple-900 dark:text-purple-200 font-bold">
              {minsUntilBed > 0 ? (
                <>متبقي حتى النوم: {bedHours} س و {bedMins} د</>
              ) : (
                'حان وقت النوم المبكر الآن 😴'
              )}
            </span>
            <span className="font-black text-purple-700 dark:text-purple-300">
              استيقاظ: {settings.wakeUpTime}
            </span>
          </div>

          <p className="mt-3 text-[11px] text-stone-500 dark:text-stone-400 text-center font-bold">
            نوم 8 ساعات يحفز الذاكرة ويزيد استيعاب الرياضيات والعلوم
          </p>
        </div>

      </div>

      {/* 4. Two Columns: Today's Homework & Quran Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Homework to finish today */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-2 border-stone-900 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                واجبات اليوم (المطلوب قبل 19:30)
              </h3>
            </div>
            <span className="text-xs bg-amber-200 dark:bg-amber-950 text-stone-900 dark:text-amber-300 border border-stone-900 px-2 py-0.5 rounded-lg font-black shadow-[1.5px_1.5px_0px_#000]">
              {pendingHomework.length} متبقية
            </span>
          </div>

          {pendingHomework.length === 0 ? (
            <div className="p-6 text-center bg-stone-50 dark:bg-stone-800/40 rounded-xl border-2 border-dashed border-stone-400 dark:border-stone-700">
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                ما شاء الله! أنجزت جميع واجبات اليوم المقررة 🎉
              </p>
              <p className="text-xs text-stone-500 mt-1">
                أنت جاهز تمامًا لحصة Taki Academy براحة بال وثقة.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingHomework.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 border-2 border-stone-900 dark:border-stone-700 rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] transition-all"
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <button
                      onClick={() => onToggleHomework(item.id)}
                      className="mt-0.5 w-5 h-5 rounded border-2 border-stone-900 hover:border-emerald-600 flex items-center justify-center transition-colors shrink-0"
                    >
                      {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-stone-900 dark:text-stone-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-300 border border-stone-900 px-1.5 py-0.2 rounded font-black shrink-0">
                          {item.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3" /> {item.estimatedMinutes} دقيقة
                        </span>
                        {item.priority === 'high' && (
                          <span className="text-red-600 dark:text-red-400 font-black">عاجل</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleHomework(item.id)}
                    className="px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-black shrink-0 border border-stone-900 shadow-[1.5px_1.5px_0px_#000]"
                  >
                    تم
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t-2 border-stone-200 dark:border-stone-800 flex justify-between items-center">
            <span className="text-xs text-stone-500 font-bold">
              تذكير: لا تؤجل الواجبات لما بعد 21:00
            </span>
            <button
              onClick={() => onNavigate('homework')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-black flex items-center gap-1"
            >
              إدارة الواجبات ومؤقت بومودورو <ArrowRight className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>

        {/* Daily Quran portion */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-2 border-stone-900 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                ورد القرآن اليومي
              </h3>
            </div>
            <span className="text-xs bg-emerald-200 dark:bg-emerald-950 text-stone-900 dark:text-emerald-300 border border-stone-900 px-2 py-0.5 rounded-lg font-black shadow-[1.5px_1.5px_0px_#000]">
              الهدف: {quran.dailyGoalPages} صفحات
            </span>
          </div>

          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border-2 border-stone-900 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                الموضع الحالي: سورة {quran.currentSurah} • الجزء {quran.currentJuz}
              </span>
              <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-300">
                صـ {quran.currentPage}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 h-3 rounded-full overflow-hidden border border-stone-900">
              <div
                className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (quran.pagesReadToday / quran.dailyGoalPages) * 100)}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-stone-600 dark:text-stone-300">
              <span className="font-bold">
                قراءة اليوم:{' '}
                <strong className="text-emerald-800 dark:text-emerald-300 font-black">
                  {quran.pagesReadToday} من {quran.dailyGoalPages} صفحات
                </strong>
              </span>

              <button
                onClick={onAddQuranPage}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 active:translate-x-[1px] text-white rounded-lg font-black text-xs flex items-center gap-1 border border-stone-900 shadow-[1.5px_1.5px_0px_#000] transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> صفحة إضافية
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-stone-200 dark:border-stone-800 flex justify-between items-center">
            <span className="text-xs text-stone-500 font-bold">
              «خيركم من تعلم القرآن وعلمه»
            </span>
            <button
              onClick={() => onNavigate('prayer-quran')}
              className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-black flex items-center gap-1"
            >
              المصحف وسماع التلاوة <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>

      </div>

      {/* 5. Motivational Quote */}
      <div className="bg-[#FAF8F5] dark:bg-stone-900/80 border-2 border-stone-900 dark:border-stone-700 shadow-[4px_4px_0px_0px_#1c1917] dark:shadow-[4px_4px_0px_0px_#000] rounded-2xl p-4 text-center">
        <p className="font-quran text-lg sm:text-xl text-stone-900 dark:text-amber-200 font-bold">
          {quote.text}
        </p>
        <span className="text-xs text-stone-600 dark:text-stone-400 mt-1 inline-block font-bold">
          — {quote.source}
        </span>
      </div>

    </div>
  );
};
