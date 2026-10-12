import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Timer,
  AlertCircle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  GraduationCap,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  StickyNote,
} from 'lucide-react';
import { FocusScratchpad } from './FocusScratchpad';
import { TakiAcademyLogo } from './TakiAcademyLogo';
import {
  HomeworkItem,
  ExamItem,
  UserSettings,
  Priority,
  HomeworkStatus,
} from '../types';
import { getTodayDayOfWeek } from '../utils/arabicDates';
import { analyzeWorkloadForDay } from '../utils/smartScheduler';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface HomeworkAndPomodoroProps {
  homework: HomeworkItem[];
  exams: ExamItem[];
  settings: UserSettings;
  onSaveHomework: (items: HomeworkItem[]) => void;
  onSaveExams: (items: ExamItem[]) => void;
  onSessionComplete: (minutes: number) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: (enabled?: boolean) => void;
}

export const HomeworkAndPomodoro: React.FC<HomeworkAndPomodoroProps> = ({
  homework,
  exams,
  settings,
  onSaveHomework,
  onSaveExams,
  onSessionComplete,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isAddHomeworkOpen, setIsAddHomeworkOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  // New Homework Form State
  const [newHw, setNewHw] = useState<Partial<HomeworkItem>>({
    subject: 'رياضيات',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    estimatedMinutes: 30,
  });

  // New Exam Form State
  const [newExam, setNewExam] = useState<Partial<ExamItem>>({
    subject: 'رياضيات',
    title: 'فرض مراقبة عدد 1',
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    syllabus: '',
  });

  // Pomodoro Timer State
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoroWorkMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedTaskForPomo, setSelectedTaskForPomo] = useState<string>('');
  const [hasSavedNotes, setHasSavedNotes] = useState<boolean>(false);
  const [showReviewNotes, setShowReviewNotes] = useState<boolean>(false);

  useEffect(() => {
    const checkNotes = () => {
      try {
        const rawNotes = localStorage.getItem('muslim_student_focus_notes');
        const rawFreeform = localStorage.getItem('muslim_student_focus_freeform');
        const parsed = rawNotes ? JSON.parse(rawNotes) : [];
        setHasSavedNotes(parsed.length > 0 || !!(rawFreeform && rawFreeform.trim()));
      } catch {
        setHasSavedNotes(false);
      }
    };
    checkNotes();
    window.addEventListener('focus-notes-updated', checkNotes);
    return () => window.removeEventListener('focus-notes-updated', checkNotes);
  }, []);

  const todayDay = getTodayDayOfWeek();
  const workload = analyzeWorkloadForDay(todayDay, homework, settings.commuteMinutes);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      sound.playPomodoroFinish();
      confetti({ particleCount: 40, spread: 60 });
      setIsTimerRunning(false);

      if (pomodoroMode === 'work') {
        onSessionComplete(settings.pomodoroWorkMinutes);
        setPomodoroMode('break');
        setTimeLeft(settings.pomodoroBreakMinutes * 60);
      } else {
        setPomodoroMode('work');
        setTimeLeft(settings.pomodoroWorkMinutes * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, pomodoroMode, settings, onSessionComplete]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    if (pomodoroMode === 'work') {
      onToggleFocusMode?.(true);
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    onToggleFocusMode?.(false);
    setTimeLeft(
      pomodoroMode === 'work'
        ? settings.pomodoroWorkMinutes * 60
        : settings.pomodoroBreakMinutes * 60
    );
  };

  const handleSwitchPomoMode = (mode: 'work' | 'break') => {
    setIsTimerRunning(false);
    setPomodoroMode(mode);
    if (mode === 'break') {
      onToggleFocusMode?.(false);
    }
    setTimeLeft(
      mode === 'work'
        ? settings.pomodoroWorkMinutes * 60
        : settings.pomodoroBreakMinutes * 60
    );
  };

  // Toggle Homework Status
  const handleToggleHomework = (id: string) => {
    const updated = homework.map((h) => {
      if (h.id === id) {
        const nextStatus: HomeworkStatus = h.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          sound.playSuccess();
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        }
        const updatedItem: HomeworkItem = {
          ...h,
          status: nextStatus,
        };
        if (nextStatus === 'completed') {
          updatedItem.completedAt = new Date().toISOString();
        } else {
          delete updatedItem.completedAt;
        }
        return updatedItem;
      }
      return h;
    });
    onSaveHomework(updated);
  };

  const handleDeleteHomework = (id: string) => {
    onSaveHomework(homework.filter((h) => h.id !== id));
  };

  const handleAddHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHw.title?.trim()) return;

    const created: HomeworkItem = {
      id: `hw-${Date.now()}`,
      subject: newHw.subject || 'عام',
      title: newHw.title,
      description: newHw.description || '',
      dueDate: newHw.dueDate || new Date().toISOString().split('T')[0],
      priority: (newHw.priority as Priority) || 'medium',
      estimatedMinutes: Number(newHw.estimatedMinutes) || 30,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSaveHomework([created, ...homework]);
    sound.playSuccess();
    setIsAddHomeworkOpen(false);
    setNewHw({
      subject: 'رياضيات',
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      estimatedMinutes: 30,
    });
  };

  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title?.trim()) return;

    const created: ExamItem = {
      id: `exam-${Date.now()}`,
      subject: newExam.subject || 'رياضيات',
      title: newExam.title,
      date: newExam.date || new Date().toISOString().split('T')[0],
      syllabus: newExam.syllabus || '',
      completed: false,
    };

    onSaveExams([...exams, created]);
    sound.playSuccess();
    setIsAddExamOpen(false);
  };

  const handleDeleteExam = (id: string) => {
    onSaveExams(exams.filter((e) => e.id !== id));
  };

  // Filtered Homework List
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredHomework = homework.filter((item) => {
    if (filterStatus === 'pending' && item.status === 'completed') return false;
    if (filterStatus === 'completed' && item.status !== 'completed') return false;
    if (filterStatus === 'overdue' && (item.dueDate >= todayStr || item.status === 'completed')) return false;
    if (filterSubject !== 'all' && item.subject !== filterSubject) return false;
    return true;
  });

  const subjectsList = Array.from(new Set(homework.map((h) => h.subject)));

  const formatTimerDigits = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
            <span>الواجبات والمراجعة ومؤقت التركيز</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            إنجاز واجباتك قبل 19:30 استعدادًا لـ Taki Academy وتوزيع المهام بذكاء
          </p>
        </div>

        <button
          onClick={() => setIsAddHomeworkOpen(true)}
          className="clay-btn-emerald px-4 py-2.5 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة واجب جديد</span>
        </button>
      </div>

      {/* Smart Workload Redistribution Alert Banner */}
      {workload.isOverloaded && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-amber-100/90 dark:from-amber-950/60 dark:to-amber-900/40 border border-amber-300 rounded-3xl shadow-[6px_10px_20px_rgba(217,119,6,0.15),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 p-0.5 border border-sky-300 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <TakiAcademyLogo variant="icon" size="xs" className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 text-xs flex-1">
              <div className="font-black text-sm flex items-center gap-1.5 flex-wrap">
                <span>تنبيه توزيع الوقت: الواجبات تتجاوز الوقت المتاح قبل Taki Academy!</span>
              </div>
              <p>
                الوقت المتاح حتى 19:30 هو <strong>{workload.availableMinutesBeforeTaki} دقيقة</strong>، بينما مجموع الواجبات يتطلب <strong>{workload.totalRequiredMinutes} دقيقة</strong>.
              </p>
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                💡 الحل الذكي: أنجز الواجبات ذات الأولوية العالية اليوم، ورتّب تأجيل الواجبات غير العاجلة لأيام الأربعاء أو الجمعة أو عطلة نهاية الأسبوع لتنام قبل 22:00.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Timer Widget */}
      <div className={`relative transition-all duration-300 rounded-3xl p-6 sm:p-8 border ${
        isFocusMode
          ? 'bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.2),8px_14px_30px_rgba(0,0,0,0.5)] ring-2 ring-amber-400/30'
          : 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white border-white/10 shadow-[8px_14px_30px_rgba(0,0,0,0.35),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-3px_-3px_8px_rgba(0,0,0,0.6)]'
      }`}>
        {/* Focus Mode active pulse tag */}
        {isFocusMode && (
          <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-3.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg border border-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-stone-950"></span>
            <span>وضع التركيز نشط (تم إخفاء التشتيت)</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-black shadow-inner">
                <Timer className="w-3.5 h-3.5" />
                <span>مؤقت بومودورو للتركيز الفائق (Pomodoro)</span>
              </div>

              {/* Explicit Focus Mode Switch Button */}
              <button
                type="button"
                onClick={() => onToggleFocusMode?.(!isFocusMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all cursor-pointer ${
                  isFocusMode
                    ? 'bg-amber-400 text-stone-900 border-amber-300 shadow-md scale-105'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white hover:border-stone-500'
                }`}
                title="تفعيل أو إلغاء وضع التركيز"
              >
                {isFocusMode ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>وضع التركيز مفعّل</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>تفعيل وضع التركيز</span>
                  </>
                )}
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-100">
              {pomodoroMode === 'work' ? 'جلسة مذاكرة وحل واجبات' : 'استراحة استرجاع الطاقة'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed">
              {isFocusMode
                ? 'وضع التركيز يقوم بإخفاء شريط التنقل وتعتيم الخلفية لتوفير بيئة هادئة خالية من أي مشتتات.'
                : `جلسات مركزة لمدة ${settings.pomodoroWorkMinutes} دقيقة بدون هاتف أو مشتتات، تليها استراحة ${settings.pomodoroBreakMinutes} دقائق.`}
            </p>
          </div>

          {/* Timer Clock & Controls */}
          <div className="flex flex-col items-center gap-3.5">
            <div className="flex bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700/80 text-xs font-bold shadow-inner">
              <button
                onClick={() => handleSwitchPomoMode('work')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pomodoroMode === 'work'
                    ? 'bg-amber-400 text-stone-900 shadow-sm font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                مذاكرة ({settings.pomodoroWorkMinutes} د)
              </button>
              <button
                onClick={() => handleSwitchPomoMode('break')}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pomodoroMode === 'break'
                    ? 'bg-emerald-500 text-white shadow-sm font-black'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                استراحة ({settings.pomodoroBreakMinutes} د)
              </button>
            </div>

            <div className="font-mono text-5xl sm:text-6xl font-black text-amber-300 tracking-wider drop-shadow-md">
              {formatTimerDigits(timeLeft)}
            </div>

            <div className="flex items-center gap-2.5">
              {isTimerRunning ? (
                <button
                  onClick={handlePauseTimer}
                  className="clay-btn-amber px-6 py-2.5 text-stone-950 font-black rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" /> إيقاف مؤقت
                </button>
              ) : (
                <button
                  onClick={handleStartTimer}
                  className="clay-btn-emerald px-7 py-2.5 text-white font-black rounded-2xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" /> بدء التركيز
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
                title="إعادة ضبط المؤقت"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Mode Quick Scratchpad & Review Notes */}
      {isFocusMode ? (
        <FocusScratchpad isFocusMode={true} />
      ) : hasSavedNotes ? (
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-800 dark:text-stone-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm">
                  لديك ملاحظات وأفكار طارئة دوّنتها أثناء جلسات التركيز
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  تذكّر مراجعة النقاط والأفكار التي كتبتها قبل أن تنساها بعد انتهاء المؤقت.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewNotes(!showReviewNotes)}
              className="clay-btn-amber px-3.5 py-1.5 text-xs font-black rounded-xl text-stone-950 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>{showReviewNotes ? 'إخفاء مساحة الملاحظات' : 'مراجعة الملاحظات الطارئة'}</span>
            </button>
          </div>
          {showReviewNotes && <FocusScratchpad isFocusMode={false} />}
        </div>
      ) : null}

      {/* Homework List Section */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg text-stone-900 dark:text-white">
              قائمة الواجبات والتمارين
            </h3>
            <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full font-bold">
              {filteredHomework.length} واجبات
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterStatus === 'all' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterStatus === 'pending' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'
                }`}
              >
                قيد الإنجاز
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  filterStatus === 'completed' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'
                }`}
              >
                المكتملة
              </button>
            </div>

            {subjectsList.length > 0 && (
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-1 font-bold text-xs"
              >
                <option value="all">كل المواد</option>
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Homework Items */}
        {filteredHomework.length === 0 ? (
          <div className="py-10 text-center text-stone-500 dark:text-stone-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-stone-400 mb-2 opacity-50" />
            <p className="font-bold text-sm">لا توجد واجبات مطابقة للتصفية</p>
            <p className="text-xs mt-1">أضف واجبًا مدرسيًا جديدًا لتنظيم وقتك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHomework.map((item) => {
              const isCompleted = item.status === 'completed';
              const isOverdue = !isCompleted && item.dueDate < todayStr;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-300/60 opacity-75'
                      : isOverdue
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300'
                      : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-750 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleHomework(item.id)}
                      className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-400 hover:border-emerald-600'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-black text-sm ${
                            isCompleted
                              ? 'line-through text-stone-500'
                              : 'text-stone-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </span>

                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-full font-bold">
                          {item.subject}
                        </span>

                        {item.priority === 'high' && (
                          <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                            عاجل
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                            متأخر
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> التسليم: {item.dueDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.estimatedMinutes} دقيقة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleHomework(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                      }`}
                    >
                      {isCompleted ? 'إلغاء الإنجاز' : 'تم الإنجاز (+25 XP)'}
                    </button>

                    <button
                      onClick={() => handleDeleteHomework(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                      title="حذف الواجب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Exams & Controls (فروض المراقبة والتأليف) */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-lg text-stone-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>الفروض والاختبارات القادمة (Devoirs)</span>
            </h3>
          </div>

          <button
            onClick={() => setIsAddExamOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة فرض
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {exams.map((exam) => {
            const diffDays = Math.ceil(
              (new Date(exam.date).getTime() - new Date().getTime()) / 86400000
            );

            return (
              <div
                key={exam.id}
                className="p-4 rounded-xl border-2 border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold">
                    {exam.subject}
                  </span>

                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      diffDays <= 3
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {diffDays <= 0 ? 'اليوم' : `بعد ${diffDays} يوم`}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-stone-900 dark:text-white mt-2">
                  {exam.title}
                </h4>

                {exam.syllabus && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    المحاور: {exam.syllabus}
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-center text-[11px] text-stone-500">
                  <span>التاريخ: {exam.date}</span>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-red-500 hover:text-red-700 opacity-60 group-hover:opacity-100"
                  >
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Homework */}
      {isAddHomeworkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h3 className="font-black text-lg text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-200 dark:border-stone-800">
              إضافة واجب مدرسي جديد
            </h3>

            <form onSubmit={handleAddHomeworkSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  المادة الدراسية
                </label>
                <select
                  value={newHw.subject}
                  onChange={(e) => setNewHw({ ...newHw, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                >
                  <option value="رياضيات">رياضيات</option>
                  <option value="عربية">عربية</option>
                  <option value="فرنسية">فرنسية</option>
                  <option value="إنجليزية">إنجليزية</option>
                  <option value="علوم فيزيائية">علوم فيزيائية</option>
                  <option value="علوم الحياة والأرض">علوم الحياة والأرض</option>
                  <option value="تاريخ وجغرافيا">تاريخ وجغرافيا</option>
                  <option value="تربية إسلامية">تربية إسلامية</option>
                  <option value="تربية مدنية">تربية مدنية</option>
                  <option value="إعلامية">إعلامية</option>
                  <option value="تكنولوجيا">تكنولوجيا</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  عنوان الواجب / التمرين
                </label>
                <input
                  type="text"
                  placeholder="مثال: تمارين صفحة 45 رقم 3 و 5"
                  value={newHw.title}
                  onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  تفاصيل إضافية (اختياري)
                </label>
                <textarea
                  placeholder="ملاحظات الأستاذ أو تعليمات الحل"
                  value={newHw.description}
                  onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    تاريخ التسليم
                  </label>
                  <input
                    type="date"
                    value={newHw.dueDate}
                    onChange={(e) => setNewHw({ ...newHw, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    الوقت المقدر (دقائق)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={newHw.estimatedMinutes}
                    onChange={(e) =>
                      setNewHw({ ...newHw, estimatedMinutes: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  درجة الأهمية
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewHw({ ...newHw, priority: p })}
                      className={`py-2 rounded-xl border font-bold text-xs transition-all ${
                        newHw.priority === p
                          ? 'bg-[#0F382A] text-amber-300 border-emerald-950'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {p === 'high' ? 'عاجل' : p === 'medium' ? 'مهم' : 'عادي'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddHomeworkOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 rounded-xl font-bold"
                >
                  إضافة الواجب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Exam */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h3 className="font-black text-lg text-stone-900 dark:text-white mb-4 pb-2 border-b border-stone-200 dark:border-stone-800">
              إضافة فرض أو اختبار جديد
            </h3>

            <form onSubmit={handleAddExamSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  المادة
                </label>
                <input
                  type="text"
                  placeholder="مثال: رياضيات، علوم فيزيائية"
                  value={newExam.subject}
                  onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  نوع الفرض / العنوان
                </label>
                <input
                  type="text"
                  placeholder="مثال: فرض مراقبة عدد 1 أو فرض تأليفي"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  تاريخ الفرض
                </label>
                <input
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  المحاور والدروس المشمولة
                </label>
                <textarea
                  placeholder="مثال: من درس الأعداد الكسرية إلى نظرية طالس..."
                  value={newExam.syllabus}
                  onChange={(e) => setNewExam({ ...newExam, syllabus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  rows={2}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  حفظ الفرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
