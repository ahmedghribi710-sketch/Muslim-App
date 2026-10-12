import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Compass,
  CheckSquare,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'timetable'
  | 'routine'
  | 'prayer-quran'
  | 'homework'
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingHomeworkCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingHomeworkCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'timetable' as TabType, label: 'الجدول المدرسي', icon: CalendarDays },
    { id: 'routine' as TabType, label: 'الروتين اليومي', icon: Clock },
    { id: 'prayer-quran' as TabType, label: 'الصلاة والقرآن', icon: Compass },
    {
      id: 'homework' as TabType,
      label: 'الواجبات والمراجعة',
      icon: CheckSquare,
      badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
    },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <>
      {/* Desktop / Tablet horizontal tab bar */}
      <nav className="tabs-navigation hidden md:block bg-[#F8F6F0]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-[0_4px_20px_-4px_rgba(15,56,42,0.06)] sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2.5 overflow-x-auto py-2.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#165b44] to-[#0F382A] text-amber-300 shadow-[5px_7px_16px_rgba(15,56,42,0.25),inset_2px_2px_4px_rgba(255,255,255,0.35),inset_-2px_-2px_4px_rgba(0,0,0,0.3)] border border-emerald-400/30 scale-[1.02]'
                      : 'bg-white dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white shadow-[4px_6px_14px_rgba(0,0,0,0.06),-2px_-2px_8px_rgba(255,255,255,0.9),inset_1.5px_1.5px_3px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.04)] border border-white/80 dark:border-stone-700/60 hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-[2px_2px_6px_rgba(217,119,6,0.3),inset_1px_1px_2px_rgba(255,255,255,0.6)] min-w-[20px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="tabs-navigation md:hidden fixed bottom-2 left-2 right-2 sm:left-3 sm:right-3 z-40 bg-[#FAF8F5]/95 dark:bg-stone-900/95 backdrop-blur-md rounded-3xl border border-white/70 dark:border-stone-700/60 px-1.5 sm:px-3 py-1.5 sm:py-2 shadow-[0_10px_28px_rgba(0,0,0,0.18),inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-0.5 sm:gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1.5 rounded-2xl relative transition-all min-w-0 ${
                  isActive
                    ? 'text-[#0F382A] dark:text-amber-300 font-black scale-[1.02] bg-amber-100/90 dark:bg-emerald-950/80 shadow-[3px_4px_10px_rgba(0,0,0,0.1),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9),inset_-1.5px_-1.5px_3px_rgba(0,0,0,0.08)] border border-amber-300/60'
                    : 'text-stone-600 dark:text-stone-400 font-bold hover:text-stone-900 active:scale-95'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-900 text-[8px] sm:text-[9px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tighter truncate max-w-full font-bold">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
