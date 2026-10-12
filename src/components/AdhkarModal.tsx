import React, { useState } from 'react';
import { X, Check, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { MORNING_EVENING_ADHKAR } from '../utils/defaultData';
import { sound } from '../utils/sound';

interface AdhkarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteAdhkar: () => void;
}

export const AdhkarModal: React.FC<AdhkarModalProps> = ({ isOpen, onClose, onCompleteAdhkar }) => {
  const [tab, setTab] = useState<'morning' | 'evening'>('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const currentHour = new Date().getHours();
  const defaultTab = currentHour < 15 ? 'morning' : 'evening';

  const list = MORNING_EVENING_ADHKAR.filter(
    (item) => item.type === 'both' || item.type === tab
  );

  const handleTap = (id: string, maxCount: number) => {
    const current = counts[id] || 0;
    if (current < maxCount) {
      sound.playSuccess();
      const updated = { ...counts, [id]: current + 1 };
      setCounts(updated);

      // Check if all completed
      const allDone = list.every(item => (updated[item.id] || 0) >= item.count);
      if (allDone) {
        onCompleteAdhkar();
      }
    }
  };

  const handleReset = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="clay-card bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden rounded-3xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#165b44] to-[#0F382A] text-amber-50 p-5 flex items-center justify-between border-b border-emerald-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-[2px_3px_8px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.7)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">أذكار المسلم اليومية</h2>
              <p className="text-xs text-emerald-200">حصن المسلم وبركة اليوم والتوفيق في الدراسة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-emerald-900/60 text-stone-200 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-200/60 dark:bg-stone-800/80 p-2 border-b border-stone-200 dark:border-stone-700 gap-2">
          <button
            onClick={() => setTab('morning')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer ${
              tab === 'morning'
                ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-stone-900 shadow-[3px_4px_10px_rgba(217,119,6,0.25),inset_1.5px_1.5px_3px_rgba(255,255,255,0.8)]'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            ☀️ أذكار الصباح (بعد الفجر)
          </button>
          <button
            onClick={() => setTab('evening')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer ${
              tab === 'evening'
                ? 'clay-btn-indigo text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            🌙 أذكار المساء (بعد العصر / المغرب)
          </button>
        </div>

        {/* Adhkar list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {list.map((item) => {
            const currentCount = counts[item.id] || 0;
            const isFinished = currentCount >= item.count;

            return (
              <div key={item.id}>
                <div className="clay-card p-4 sm:p-5">
                  <p className="font-quran text-lg leading-relaxed text-stone-800 dark:text-stone-100 text-right mb-3">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">
                        العدد المطلوب: {item.count}
                      </span>
                      {currentCount > 0 && (
                        <button
                          onClick={() => handleReset(item.id)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                          title="إعادة التصفير"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleTap(item.id, item.count)}
                      disabled={isFinished}
                      className={`px-5 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                        isFinished
                          ? 'bg-emerald-600 text-white cursor-default shadow-sm'
                          : 'clay-btn-emerald shadow-sm'
                      }`}
                    >
                      {isFinished ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" /> تم الإنجاز
                        </>
                      ) : (
                        <>
                          <span>اضغط</span>
                          <span className="bg-emerald-950/40 px-2.5 py-0.5 rounded-full text-white text-xs font-mono">
                            {currentCount} / {item.count}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-100/80 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center text-xs text-stone-600 dark:text-stone-400 font-bold">
          <span>نصيحة: داوم على الأذكار لحفظ النفس والتركيز الذهني</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-2xl font-bold cursor-pointer active:scale-95 transition-all"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
