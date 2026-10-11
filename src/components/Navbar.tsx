import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Sun,
  Moon,
  Clock,
  BookOpen,
  Calendar,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  FileDown,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { formatGregorianArabic, formatHijriArabic, formatTimeString } from '../utils/arabicDates';
import { UserStats, UserSettings } from '../types';

interface NavbarProps {
  stats: UserStats;
  settings: UserSettings;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSyncCloud: () => void;
  onOpenAdhkar: () => void;
  onOpenPdf: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  settings,
  currentUser,
  onLogin,
  onLogout,
  onSyncCloud,
  onOpenAdhkar,
  onOpenPdf,
  isDark,
  onToggleDark,
}) => {
  const [timeStr, setTimeStr] = useState<string>(formatTimeString());
  const [currentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0F382A] text-amber-50 border-b-2 border-[#C5A059]/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Student Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059] text-stone-900 flex items-center justify-center font-bold text-xl shadow-inner border border-amber-300">
            ☪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-white">
                مخططي المسلم
              </h1>
              <span className="hidden sm:inline-block bg-[#C5A059]/20 text-amber-300 border border-[#C5A059]/40 text-[11px] font-bold px-2 py-0.5 rounded-full">
                8 أساسي • تونس
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 hidden xs:block">
              {currentUser ? currentUser.displayName || settings.studentName : settings.studentName} • توازن العلم والعبادة والنجاح
            </p>
          </div>
        </div>

        {/* Live Clock & Dates */}
        <div className="hidden md:flex items-center gap-4 bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{timeStr}</span>
          </div>
          <span className="text-emerald-700">|</span>
          <div className="flex items-center gap-1 text-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>{formatGregorianArabic(currentDate)}</span>
          </div>
          <span className="text-emerald-700">|</span>
          <div className="text-amber-200/90 font-medium">
            {formatHijriArabic(currentDate)}
          </div>
        </div>

        {/* Stats, Adhkar, Cloud & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Cloud Auth / Sync Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-600 px-2 py-1 rounded-xl text-xs">
              <button
                onClick={onSyncCloud}
                className="flex items-center gap-1 text-emerald-200 hover:text-white font-bold"
                title="مزامنة فورية مع سحابة Firebase"
              >
                <Cloud className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">سحابي</span>
              </button>
              <button
                onClick={onLogout}
                className="text-emerald-400 hover:text-red-300 p-0.5"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-100 px-2.5 py-1 rounded-xl text-xs font-bold transition-all"
              title="تسجيل الدخول بجوجل لمزامنة بياناتك عبر الأجهزة"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">دخول Google</span>
            </button>
          )}

          {/* Streak */}
          <div
            className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold"
            title="سلسلة أيام الالتزام المتتالية"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{stats.streakDays} أيام</span>
          </div>

          {/* Level / XP */}
          <div
            className="hidden sm:flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold"
            title={`المستوى ${stats.level} (${stats.xp} XP)`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>مستوى {stats.level}</span>
            <span className="text-amber-300 text-[10px]">({stats.xp} XP)</span>
          </div>

          {/* Adhkar quick button */}
          <button
            onClick={onOpenAdhkar}
            className="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#b8944d] text-stone-900 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            title="قراءة أذكار الصباح والمساء"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            <span className="hidden sm:inline">أذكار اليوم</span>
          </button>

          {/* PDF export button */}
          <button
            onClick={onOpenPdf}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
            title="تصدير وطباعة المستندات بصيغة PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-300" />
            <span>PDF</span>
          </button>

          {/* Dark mode */}
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 border border-emerald-700/60 transition-colors"
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-200" />}
          </button>

        </div>

      </div>
    </header>
  );
};
