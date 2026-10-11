import React from 'react';
import {
  Trophy,
  Flame,
  Award,
  Star,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { UserStats, AchievementBadge } from '../types';

interface AchievementsProps {
  stats: UserStats;
  badges: AchievementBadge[];
}

export const Achievements: React.FC<AchievementsProps> = ({ stats, badges }) => {
  const xpForNextLevel = stats.level * 250;
  const xpCurrentInLevel = stats.xp % 250;
  const levelProgress = Math.round((xpCurrentInLevel / 250) * 100);

  const levelTitles: Record<number, string> = {
    1: 'المجتهد المبتدئ 🥉',
    2: 'طالب العلم النشط 🥈',
    3: 'المثابر المتميز 🥇',
    4: 'بطل السنة الثامنة 🌟',
    5: 'فارس المعرفة والأخلاق 👑',
  };

  const currentTitle = levelTitles[stats.level] || 'طالب متميز متألق';

  // Sample weekly distribution (clean SVG representation)
  const weeklyStudyHours = [
    { day: 'الاثنين', hours: 2.5, completed: true },
    { day: 'الثلاثاء', hours: 2.0, completed: true },
    { day: 'الأربعاء', hours: 3.5, completed: true },
    { day: 'الخميس', hours: 2.0, completed: true },
    { day: 'الجمعة', hours: 3.0, completed: true },
    { day: 'السبت', hours: 3.0, completed: true },
    { day: 'الأحد', hours: 4.0, completed: false },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
          <span>الإنجازات ونظام التحفيز الإيماني والعلمي</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
          احتفِ بجهدك اليومي في الصلاة، ورد القرآن، التزامات Taki Academy، والدراسة الجادة
        </p>
      </div>

      {/* Level & XP Hero Banner */}
      <div className="bg-gradient-to-r from-[#0F382A] via-[#15523d] to-[#0d3326] text-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-stone-900 font-black text-xs px-3 py-1 rounded-full shadow-sm">
                المستوى {stats.level}
              </span>
              <span className="text-amber-300 font-bold text-sm">
                {currentTitle}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              مجموع النقاط: {stats.xp} نقطة XP ✨
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg leading-relaxed">
              «احرص على ما ينفعك، واستعن بالله ولا تعجز». كل صلاة، كل صفحة قرآن، وكل تمرين تحله يقربك خطوة نحو التفوق والجنة.
            </p>
          </div>

          {/* Level Progress Circle / Bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[220px] text-center space-y-3">
            <div className="flex justify-between text-xs font-bold text-emerald-200">
              <span>التقدم للمستوى {stats.level + 1}</span>
              <span>{levelProgress}%</span>
            </div>
            
            <div className="w-full bg-emerald-950/60 h-3 rounded-full overflow-hidden border border-emerald-700/50">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>

            <div className="text-[11px] text-amber-200 font-medium">
              متبقي {250 - xpCurrentInLevel} XP للارتقاء للمستوى التالي!
            </div>
          </div>
        </div>

        {/* Streak & Attendance Stats Row */}
        <div className="mt-6 pt-5 border-t border-emerald-850/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span className="font-black text-lg">{stats.streakDays}</span>
            </div>
            <span className="text-xs text-emerald-200">أيام التزام متتالية</span>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-center gap-1 text-indigo-300 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span className="font-black text-lg">{stats.takiSessionsAttended}</span>
            </div>
            <span className="text-xs text-emerald-200">حصص Taki Academy</span>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-center gap-1 text-emerald-300 mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="font-black text-lg">{stats.quranPagesTotal}</span>
            </div>
            <span className="text-xs text-emerald-200">صفحات قرآن مقروءة</span>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40">
            <div className="flex items-center justify-center gap-1 text-teal-300 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-black text-lg">{stats.completedTasksCount}</span>
            </div>
            <span className="text-xs text-emerald-200">واجبات منجزة</span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h3 className="font-black text-lg text-stone-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>الأوسمة والشارات المكتسبة</span>
          </h3>
          <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
            {badges.filter((b) => b.unlocked).length} من {badges.length} أوسمة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60 shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xl ${
                  badge.unlocked
                    ? 'bg-amber-400 text-stone-900 shadow-md'
                    : 'bg-stone-300 dark:bg-stone-700 text-stone-500'
                }`}
              >
                {badge.unlocked ? '🏅' : '🔒'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-stone-900 dark:text-white">
                    {badge.title}
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    +{badge.xpValue} XP
                  </span>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>

                {badge.unlocked && badge.unlockedAt && (
                  <span className="inline-block mt-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                    ✓ تم الحصول عليه في {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Study Distribution Chart */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <h3 className="font-black text-lg text-stone-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>نشاط المذاكرة الأسبوعي (يشمل Taki Academy والواجبات)</span>
          </h3>
          <span className="text-xs text-stone-500 font-bold">معدل: 2.8 ساعة / يوم</span>
        </div>

        {/* Bar chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-6 px-2">
          {weeklyStudyHours.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.hours / 5) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-stone-600 dark:text-stone-400">
                  {item.hours}س
                </span>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-t-xl h-28 flex items-end overflow-hidden p-1">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      item.completed
                        ? 'bg-gradient-to-t from-emerald-700 to-emerald-500'
                        : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 truncate w-full text-center">
                  {item.day.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Islamic Encouragement Philosophy Note */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-start gap-3.5">
        <Heart className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="font-bold text-sm">مبدأ الرفق والتشجيع في مخططي المسلم</div>
          <p className="leading-relaxed">
            إذا فاتتك مهمة أو تأخرت في إنجاز واجب بسبب التعب أو الظروف، لا تقلق ولا تفقد همتك! التطبيق لا يخصم نقاطًا، بل يشجعك دائمًا على الاستغفار واستئناف جدولك بهمة متجددة، فالمؤمن القوي خير وأحب إلى الله.
          </p>
        </div>
      </div>

    </div>
  );
};
