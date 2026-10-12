import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Printer,
  Compass,
  BookOpen,
  School,
  Moon,
  Coffee,
  Check,
} from 'lucide-react';
import {
  DayOfWeek,
  PrayerTimeData,
  UserSettings,
  HomeworkItem,
  RoutineItem,
} from '../types';
import { ARABIC_DAYS, DAY_ORDER, getTodayDayOfWeek } from '../utils/arabicDates';
import {
  generateDailyRoutine,
  analyzeWorkloadForDay,
  getDayEndInfo,
} from '../utils/smartScheduler';
import { sound } from '../utils/sound';
import { TakiAcademyLogo } from './TakiAcademyLogo';

interface DailyRoutineProps {
  prayers: PrayerTimeData;
  settings: UserSettings;
  homework: HomeworkItem[];
  completedRoutineIds: string[];
  onToggleRoutineItem: (id: string) => void;
  onOpenPdfModal?: () => void;
}

export const DailyRoutine: React.FC<DailyRoutineProps> = ({
  prayers,
  settings,
  homework,
  completedRoutineIds,
  onToggleRoutineItem,
  onOpenPdfModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const todayDay = getTodayDayOfWeek();

  const routine = generateDailyRoutine(selectedDay, prayers, settings, homework);
  const workload = analyzeWorkloadForDay(selectedDay, homework, settings.commuteMinutes);
  const daySummary = getDayEndInfo(selectedDay, settings.commuteMinutes);

  const completedCount = routine.filter((r) => completedRoutineIds.includes(r.id)).length;
  const progressPercent = Math.round((completedCount / (routine.length || 1)) * 100);

  const handlePrint = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal();
    } else {
      window.print();
    }
  };

  const getCategoryIcon = (cat: RoutineItem['category']) => {
    switch (cat) {
      case 'prayer':
        return <Compass className="w-4 h-4 text-emerald-600" />;
      case 'quran':
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'taki':
        return <TakiAcademyLogo variant="icon" size="xs" className="w-4 h-4" />;
      case 'school':
        return <School className="w-4 h-4 text-blue-600" />;
      case 'study':
        return <CheckCircle2 className="w-4 h-4 text-amber-600" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-purple-600" />;
      case 'rest':
      default:
        return <Coffee className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in print-area">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
            <span>منظم الروتين اليومي الذكي</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            جدول زمني متوازن يوزع يومك بدقة بين المدرسة، الصلاة، التزامات Taki Academy والنوم المبكر
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة الروتين PDF</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 no-print scrollbar-none">
        {DAY_ORDER.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = day === todayDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-[#165b44] to-[#0F382A] text-amber-300 shadow-[5px_7px_16px_rgba(15,56,42,0.25),inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-2px_-2px_4px_rgba(0,0,0,0.3)] border border-emerald-400/30'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[4px_6px_14px_rgba(0,0,0,0.06),-2px_-2px_8px_rgba(255,255,255,0.9),inset_1.5px_1.5px_3px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] border border-white/80 dark:border-stone-700/60 hover:-translate-y-0.5'
              }`}
            >
              <span>{ARABIC_DAYS[day]}</span>
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Summary Card */}
      <div className="clay-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-stone-900 dark:text-white">
                خطة يوم {ARABIC_DAYS[selectedDay]}
              </span>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full font-black shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)] border border-emerald-200 dark:border-emerald-800">
                {daySummary.isSchoolDay
                  ? `دوام مدرسي (الوصول للمنزل ${daySummary.homeArrival})`
                  : 'عطلة نهاية الأسبوع'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              الوقت المتاح للمراجعة قبل حصة Taki Academy:{' '}
              <strong className="text-amber-700 dark:text-amber-400 font-black">
                {daySummary.availableStudyMinutesBeforeTaki} دقيقة
              </strong>
            </p>
          </div>

          {/* Routine progress bar */}
          <div className="min-w-[200px] space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-600 dark:text-stone-300">إنجاز الروتين:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                {completedCount} / {routine.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-stone-200/80 dark:bg-stone-800 h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Workload smart analyzer warning banner */}
        {workload.isOverloaded ? (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.7)]">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">تنبيه ذكي: حمل الواجبات يتجاوز الوقت المتاح اليوم!</div>
              {workload.recommendations.map((rec, i) => (
                <p key={i} className="text-stone-700 dark:text-stone-300">
                  • {rec}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-bold shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.6)]">
            ✓ جدول اليوم متناسق جدًا. ستنهي كل واجباتك براحة قبل حصة Taki Academy في 19:30.
          </div>
        )}
      </div>

      {/* Routine Timeline */}
      <div className="space-y-3">
        {routine.map((item) => {
          const isDone = completedRoutineIds.includes(item.id);
          const isTaki = item.category === 'taki';

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-3xl transition-all ${
                isTaki
                  ? 'bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-indigo-100/90 dark:from-indigo-950/60 dark:to-purple-950/40 border border-indigo-300/80 dark:border-indigo-700/60 shadow-[6px_10px_22px_rgba(79,70,229,0.12),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]'
                  : isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300/60 opacity-80 shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.03)]'
                  : 'clay-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => {
                      sound.playSuccess();
                      onToggleRoutineItem(item.id);
                    }}
                    className={`mt-0.5 w-7 h-7 rounded-2xl border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-stone-300 bg-white dark:bg-stone-800 hover:border-emerald-600 shadow-inner'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        <span
                          className={`font-black text-sm ${
                            isDone
                              ? 'line-through text-stone-500 dark:text-stone-400'
                              : isTaki
                              ? 'text-indigo-900 dark:text-indigo-200 text-base'
                              : 'text-stone-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      <span className="font-mono text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                        {item.timeRange}
                      </span>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                            isTaki
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fixed tag */}
                {item.isFixed && (
                  <span className="text-[10px] bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                    ثابت
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bedtime & Next Day Prep Notice */}
      <div className="clay-card p-5 text-xs text-stone-600 dark:text-stone-400 space-y-1.5 bg-[#FAF8F5] dark:bg-stone-900">
        <div className="font-black text-sm text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
          <Moon className="w-4 h-4 text-indigo-500" />
          قاعدة ذهبية لطالب السنة الثامنة أساسي:
        </div>
        <p className="leading-relaxed">
          بعد الساعة 21:00 انتهاء حصة Taki Academy، يُمنع البدء في حل واجبات جديدة أو سهر متأخر.
          صلِّ العشاء، جهز محفظتك لليوم التالي، واقرأ سورة الملك ونم في حدود 21:45 لتبدأ يومك في 05:30 بنشاط كامل.
        </p>
      </div>

    </div>
  );
};
