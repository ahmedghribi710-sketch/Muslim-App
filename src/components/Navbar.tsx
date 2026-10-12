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
import { TakiAcademyLogo } from './TakiAcademyLogo';

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
    <header className="sticky top-0 z-40 bg-[#0F382A] text-amber-50 border-b border-emerald-800/40 shadow-[0_8px_24px_-4px_rgba(15,56,42,0.35)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        
        {/* Brand, Tunisian Curriculum & Taki Academy Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#C5A059] text-stone-900 flex items-center justify-center font-bold text-lg sm:text-xl shadow-[3px_4px_12px_rgba(197,160,89,0.35),inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.15)] border border-amber-200 shrink-0">
            ☪
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-black tracking-wide text-white">
                مخططي المسلم
              </h1>
              <span className="bg-[#C5A059]/25 text-amber-300 border border-[#C5A059]/50 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3)]">
                8 أساسي • تونس
              </span>
              <a
                href="https://www.takiacademy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xs:inline-flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-400/50 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-colors"
                title="منصة Taki Academy التعليمية"
              >
                <TakiAcademyLogo variant="icon" size="xs" className="w-3.5 h-3.5" />
                <span>Taki Academy</span>
              </a>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 hidden sm:block">
              {currentUser ? currentUser.displayName || settings.studentName : settings.studentName} • توازن العلم والعبادة والنجاح
            </p>
          </div>
        </div>

        {/* Live Clock & Dates (Hidden on small mobile, visible on tablet & desktop) */}
        <div className="hidden lg:flex items-center gap-3.5 bg-emerald-950/70 px-3.5 py-1.5 rounded-2xl border border-emerald-700/40 text-xs shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Cloud Auth / Sync Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-emerald-900/90 border border-emerald-600/70 px-2 py-1 rounded-2xl text-[11px] sm:text-xs shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15)]">
              <button
                onClick={onSyncCloud}
                className="flex items-center gap-1 text-emerald-200 hover:text-white font-bold transition-transform active:scale-95 cursor-pointer"
                title="مزامنة فورية مع سحابة Firebase"
              >
                <Cloud className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden sm:inline">سحابي</span>
              </button>
              <button
                onClick={onLogout}
                className="text-emerald-400 hover:text-red-300 p-0.5 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/25 text-emerald-100 px-2.5 py-1 sm:py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all shadow-[2px_3px_8px_rgba(0,0,0,0.15),inset_1.5px_1.5px_3px_rgba(255,255,255,0.25)] active:scale-95 cursor-pointer"
              title="تسجيل الدخول بجوجل لمزامنة بياناتك عبر الأجهزة"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">دخول Google</span>
            </button>
          )}

          {/* Streak */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-br from-amber-500/25 to-amber-600/15 border border-amber-400/40 text-amber-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl text-[11px] sm:text-xs font-black shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.2)]"
            title="سلسلة أيام الالتزام المتتالية"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{stats.streakDays} د</span>
          </div>

          {/* Level / XP */}
          <div
            className="hidden md:flex items-center gap-1.5 bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 px-2.5 py-1.5 rounded-2xl text-xs font-bold shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15)]"
            title={`المستوى ${stats.level} (${stats.xp} XP)`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>م {stats.level}</span>
            <span className="text-amber-300 text-[10px]">({stats.xp} XP)</span>
          </div>

          {/* Adhkar quick button */}
          <button
            onClick={onOpenAdhkar}
            className="flex items-center gap-1 bg-gradient-to-br from-[#FBBF24] to-[#C5A059] hover:from-amber-400 hover:to-amber-500 text-stone-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all shadow-[3px_4px_10px_rgba(0,0,0,0.18),inset_2px_2px_4px_rgba(255,255,255,0.65),inset_-2px_-2px_4px_rgba(0,0,0,0.15)] active:scale-95 cursor-pointer"
            title="قراءة أذكار الصباح والمساء"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-900" />
            <span className="hidden xs:inline">أذكار</span>
          </button>

          {/* PDF export button */}
          <button
            onClick={onOpenPdf}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all shadow-[3px_4px_10px_rgba(0,0,0,0.15),inset_1.5px_1.5px_3px_rgba(255,255,255,0.25)] active:scale-95 cursor-pointer"
            title="تصدير وطباعة المستندات بصيغة PDF"
          >
            <FileDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
            <span>PDF</span>
          </button>

          {/* Dark mode */}
          <button
            onClick={onToggleDark}
            className="p-1.5 sm:p-2 rounded-2xl bg-emerald-900/70 hover:bg-emerald-800 text-amber-200 border border-emerald-700/60 shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.15)] transition-all active:scale-95 cursor-pointer"
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-amber-200" />}
          </button>

        </div>

      </div>
    </header>
  );
};
