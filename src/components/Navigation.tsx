import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Compass,
  CheckSquare,
  Trophy,
  Settings,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'timetable'
  | 'routine'
  | 'prayer-quran'
  | 'homework'
  | 'achievements'
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
    { id: 'achievements' as TabType, label: 'الإنجازات', icon: Trophy },
    { id: 'settings' as TabType, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <>
      {/* Desktop / Tablet horizontal tab bar */}
      <nav className="tabs-navigation hidden md:block bg-[#FAF8F5] dark:bg-stone-900 border-b-2 border-stone-900 dark:border-stone-700 shadow-sm sticky top-[57px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 ${
                    isActive
                      ? 'bg-[#0F382A] text-amber-300 border-stone-900 shadow-[3px_3px_0px_0px_#1c1917] dark:bg-emerald-950 dark:border-amber-400 dark:shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_#1c1917] active:translate-x-[1px] active:translate-y-[1px]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-amber-400 text-stone-900 text-[10px] font-black px-1.5 py-0.2 rounded-md border border-stone-900 shadow-[1px_1px_0px_#000] min-w-[18px] text-center">
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
      <nav className="tabs-navigation md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-stone-900/95 backdrop-blur-md border-t-2 border-stone-900 dark:border-stone-700 px-2 py-1.5 shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl relative transition-all ${
                  isActive
                    ? 'text-[#0F382A] dark:text-amber-400 font-black scale-105 border-2 border-stone-900 dark:border-amber-400 bg-amber-100 dark:bg-emerald-950 shadow-[2px_2px_0px_#1c1917]'
                    : 'text-stone-600 dark:text-stone-400 font-bold'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-amber-400 text-stone-900 text-[9px] font-black w-4 h-4 rounded-full border border-stone-900 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-bold">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
