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
      <div className="bg-[#FAF8F5] dark:bg-stone-900 border-2 border-stone-800 dark:border-stone-700 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F382A] text-amber-50 p-4 flex items-center justify-between border-b-2 border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-bold text-lg">أذكار المسلم اليومية</h2>
              <p className="text-xs text-emerald-200">حصن المسلم وبركة اليوم والتوفيق في الدراسة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-900/60 text-stone-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-200/80 dark:bg-stone-800 p-1 border-b border-stone-300 dark:border-stone-700">
          <button
            onClick={() => setTab('morning')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'morning'
                ? 'bg-amber-100 dark:bg-amber-900/60 text-emerald-900 dark:text-amber-200 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            ☀️ أذكار الصباح (بعد الفجر)
          </button>
          <button
            onClick={() => setTab('evening')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              tab === 'evening'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            🌙 أذكار المساء (بعد العصر / المغرب)
          </button>
        </div>

        {/* Adhkar list */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 divide-y divide-stone-200 dark:divide-stone-800">
          {list.map((item) => {
            const currentCount = counts[item.id] || 0;
            const isFinished = currentCount >= item.count;

            return (
              <div key={item.id} className="pt-3.5 first:pt-0">
                <div className="bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 shadow-sm">
                  <p className="font-quran text-lg leading-relaxed text-stone-800 dark:text-stone-100 text-right mb-3">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-700/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        العدد المطلوب: {item.count}
                      </span>
                      {currentCount > 0 && (
                        <button
                          onClick={() => handleReset(item.id)}
                          className="p-1 text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1"
                          title="إعادة التصفير"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleTap(item.id, item.count)}
                      disabled={isFinished}
                      className={`px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                        isFinished
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-[#0F382A] text-amber-300 hover:bg-emerald-800 active:scale-95 shadow-sm'
                      }`}
                    >
                      {isFinished ? (
                        <>
                          <Check className="w-4 h-4" /> تم الإنجاز
                        </>
                      ) : (
                        <>
                          <span>اضغط</span>
                          <span className="bg-emerald-950/40 px-2 py-0.5 rounded text-white text-xs">
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
        <div className="p-3 bg-stone-100 dark:bg-stone-900 border-t border-stone-300 dark:border-stone-700 flex justify-between items-center text-xs text-stone-600 dark:text-stone-400">
          <span>نصيحة: داوم على الأذكار لحفظ النفس والتركيز الذهني</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-medium"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
