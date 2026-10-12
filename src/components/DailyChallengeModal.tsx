import React from 'react';
import { Sparkles, Trophy, CheckCircle2, X, Award } from 'lucide-react';
import { DailyChallenge, DailyChallengeRecord } from '../types';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DailyChallenge;
  record: DailyChallengeRecord | null;
  onComplete: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  challenge,
  record,
  onComplete,
}) => {
  if (!isOpen) return null;

  const isCompleted = record?.completed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 text-white shadow-[10px_16px_40px_rgba(0,0,0,0.6),inset_2px_2px_4px_rgba(255,255,255,0.15)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-9 h-9 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 rounded-2xl flex items-center justify-center shadow-[4px_6px_14px_rgba(217,119,6,0.35),inset_1.5px_1.5px_3px_rgba(255,255,255,0.6)]">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-black border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحدي اليوم المميز</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-100 mt-1">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Category & XP reward chip */}
        <div className="flex items-center gap-2 mb-5">
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-bold">
            {challenge.categoryLabel}
          </span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>+{challenge.xpReward} XP مكافأة إضافية</span>
          </span>
        </div>

        {/* Description box */}
        <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-4 sm:p-5 mb-6 text-stone-200 text-sm sm:text-base leading-relaxed">
          {challenge.description}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isCompleted ? (
            <div className="w-full bg-emerald-950/80 border border-emerald-500 text-emerald-300 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-black text-base shadow-[4px_6px_16px_rgba(6,95,70,0.3)]">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>تم إنجاز التحدي بنجاح (+{challenge.xpReward} XP مكتسبة)</span>
            </div>
          ) : (
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-stone-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[6px_8px_20px_rgba(217,119,6,0.4),inset_2px_2px_4px_rgba(255,255,255,0.7)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer text-base sm:text-lg"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>أتممت التحدي واستلام مكافأة (+{challenge.xpReward} XP)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-3.5 px-5 rounded-2xl transition-colors cursor-pointer text-sm"
          >
            {isCompleted ? 'إغلاق' : 'لاحقاً'}
          </button>
        </div>
      </div>
    </div>
  );
};
