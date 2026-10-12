import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Lightbulb,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';

export interface FocusNoteItem {
  id: string;
  text: string;
  timestamp: string;
  completed: boolean;
}

interface FocusScratchpadProps {
  isFocusMode?: boolean;
  onClose?: () => void;
  isFloatingModal?: boolean;
}

const STORAGE_NOTES_KEY = 'muslim_student_focus_notes';
const STORAGE_FREEFORM_KEY = 'muslim_student_focus_freeform';

export const FocusScratchpad: React.FC<FocusScratchpadProps> = ({
  isFocusMode = true,
  onClose,
  isFloatingModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'freeform'>('quick');
  const [notes, setNotes] = useState<FocusNoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [freeformText, setFreeformText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_NOTES_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      const savedFreeform = localStorage.getItem(STORAGE_FREEFORM_KEY);
      if (savedFreeform) {
        setFreeformText(savedFreeform);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (updated: FocusNoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('focus-notes-updated'));
    } catch {
      // Ignore storage errors
    }
  };

  // Save freeform notes to localStorage
  const handleFreeformChange = (val: string) => {
    setFreeformText(val);
    try {
      localStorage.setItem(STORAGE_FREEFORM_KEY, val);
      window.dispatchEvent(new Event('focus-notes-updated'));
    } catch {
      // Ignore storage errors
    }
  };

  // Add new quick note
  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newNoteText.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newNote: FocusNoteItem = {
      id: `fn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: trimmed,
      timestamp: timeStr,
      completed: false,
    };

    saveNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    const updated = notes.map((n) =>
      n.id === id ? { ...n, completed: !n.completed } : n
    );
    saveNotes(updated);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  // Clear completed
  const handleClearCompleted = () => {
    const updated = notes.filter((n) => !n.completed);
    saveNotes(updated);
  };

  // Copy notes to clipboard
  const handleCopyAll = async () => {
    let contentToCopy = '';
    if (activeTab === 'quick') {
      if (notes.length === 0) return;
      contentToCopy = notes
        .map(
          (n, i) =>
            `${i + 1}. [${n.completed ? '✓ مراجعة تم' : 'قيد الانتظار'}] ${n.text} (${n.timestamp})`
        )
        .join('\n');
    } else {
      if (!freeformText.trim()) return;
      contentToCopy = freeformText;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const pendingCount = notes.filter((n) => !n.completed).length;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 ${
        isFloatingModal
          ? 'bg-stone-900 text-stone-100 border-amber-400/40 shadow-2xl p-5 sm:p-6 w-full max-w-lg'
          : isFocusMode
          ? 'bg-gradient-to-br from-stone-900/95 via-stone-900/80 to-stone-950 text-stone-100 border-amber-400/30 shadow-xl p-5 sm:p-6'
          : 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 shadow-sm p-5 sm:p-6'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-inner">
            <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-amber-200 dark:text-amber-300">
                مساحة الملاحظات والأفكار الطارئة
              </h3>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-stone-950 text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {pendingCount} بانتظارك
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              تفريغ ذهني سريع: دوّن ما يخطر ببالك فوراً لتصفية ذهنك والعودة للدراسة دون تشتيت.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {((activeTab === 'quick' && notes.length > 0) ||
            (activeTab === 'freeform' && freeformText.trim().length > 0)) && (
            <button
              onClick={handleCopyAll}
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="نسخ الملاحظات للحافظة"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نسخ</span>
                </>
              )}
            </button>
          )}

          {isFloatingModal && onClose && (
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-between gap-2 mt-3.5 mb-3 text-xs">
        <div className="flex bg-stone-800/80 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>خواطر ونقاط سريعة ({notes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('freeform')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'freeform'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>مسودة حرة</span>
          </button>
        </div>

        {activeTab === 'quick' && notes.some((n) => n.completed) && (
          <button
            type="button"
            onClick={handleClearCompleted}
            className="text-[11px] text-stone-400 hover:text-amber-300 underline transition-colors cursor-pointer"
          >
            مسح المكتمل
          </button>
        )}
      </div>

      {/* Tab 1: Quick Bullets */}
      {activeTab === 'quick' && (
        <div className="space-y-3">
          {/* Add input form */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="اكتب فكرة طارئة أو نقطة تريد تذكرها بعد انتهاء المؤقت... (اضغط Enter)"
              className="flex-1 bg-stone-950/70 border border-stone-700/80 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </form>

          {/* Notes list */}
          {notes.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-stone-800 rounded-2xl bg-stone-950/30">
              <Sparkles className="w-6 h-6 text-amber-400/50 mx-auto mb-2" />
              <p className="text-xs text-stone-400 font-medium">
                لا توجد أفكار طارئة مسجلة حالياً.
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                أي فكرة تقتحم تركيزك اكتبها هنا فوراً وتخلص منها حتى ينتهي المؤقت!
              </p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`group flex items-start justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                    note.completed
                      ? 'bg-stone-950/30 border-stone-800/60 opacity-60'
                      : 'bg-stone-950/80 border-stone-700/60 hover:border-amber-400/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(note.id)}
                    className="mt-0.5 text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                    title={note.completed ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                  >
                    {note.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex-1 text-xs">
                    <p
                      className={`leading-relaxed ${
                        note.completed
                          ? 'line-through text-stone-500'
                          : 'text-stone-200 font-medium'
                      }`}
                    >
                      {note.text}
                    </p>
                    <span className="text-[10px] text-stone-500 mt-0.5 block">
                      {note.timestamp}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-rose-400 transition-all cursor-pointer"
                    title="حذف الملاحظة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Freeform Scratchpad */}
      {activeTab === 'freeform' && (
        <div className="space-y-2">
          <textarea
            rows={5}
            value={freeformText}
            onChange={(e) => handleFreeformChange(e.target.value)}
            placeholder="اكتب أفكاراً مطولة، معادلات، استفسارات للأستاذ، أو ملاحظات حرة... تُحفظ تلقائياً فوراً."
            className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-400 rounded-2xl p-3 text-xs text-stone-100 placeholder:text-stone-500 outline-none transition-all resize-y custom-scrollbar font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>تُحفظ تلقائياً في جهازك</span>
            <span>{freeformText.length} حرف</span>
          </div>
        </div>
      )}
    </div>
  );
};
