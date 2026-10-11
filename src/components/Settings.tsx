import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  RotateCcw,
  Printer,
  Bell,
  Clock,
  Compass,
  GraduationCap,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';
import { UserSettings } from '../types';
import { TUNISIAN_CITIES } from '../utils/prayerTimes';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetAll: () => void;
  onOpenPdfModal?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetAll,
  onOpenPdfModal,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const allSubjects = [
    'رياضيات',
    'فرنسية',
    'علوم فيزيائية',
    'علوم الحياة والأرض',
    'عربية',
    'إنجليزية',
    'إعلامية',
    'تكنولوجيا',
    'تاريخ وجغرافيا',
    'تربية إسلامية',
    'تربية مدنية',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    sound.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleWeakSubject = (subject: string) => {
    const current = form.weakSubjects || [];
    if (current.includes(subject)) {
      setForm({ ...form, weakSubjects: current.filter((s) => s !== subject) });
    } else {
      setForm({ ...form, weakSubjects: [...current, subject] });
    }
  };

  const handleExport = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `muslim_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = storage.importData(content);
      if (ok) {
        setImportStatus('تم استيراد البيانات بنجاح! جاري التحديث...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('خطأ: الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
            <span>الإعدادات والتخصيص</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            تخصيص أوقات النوم، مواقيت الصلاة، والتزامات Taki Academy، والنسخ الاحتياطي
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>تصدير / طباعة PDF</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Profile & Schedule Timing */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <User className="w-5 h-5 text-emerald-700" />
            <span>بيانات الطالب وأوقات الاستيقاظ والنوم</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">
                اسم الطالب
              </label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">
                وقت الاستيقاظ المستهدف (صباحًا)
              </label>
              <input
                type="time"
                value={form.wakeUpTime}
                onChange={(e) => setForm({ ...form, wakeUpTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                required
              />
              <span className="text-[10px] text-stone-500 font-normal">الموصى به: 05:30 لصلاة الفجر</span>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">
                وقت النوم المستهدف (ليلاً)
              </label>
              <input
                type="time"
                value={form.targetBedTime}
                onChange={(e) => setForm({ ...form, targetBedTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                required
              />
              <span className="text-[10px] text-stone-500 font-normal">الموصى به: 21:45 (بعد Taki Academy)</span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">
                مدة التنقل بين المدرسة والمنزل (دقائق)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={form.commuteMinutes}
                onChange={(e) => setForm({ ...form, commuteMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1">
                مدينة مواقيت الصلاة (الجمهورية التونسية)
              </label>
              <select
                value={form.selectedCity}
                onChange={(e) => setForm({ ...form, selectedCity: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
              >
                {TUNISIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.nameAr}>
                    {c.nameAr} ({c.nameFr})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Taki Academy & Notifications */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>التزام Taki Academy والتنبيهات الصوتية</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-900 dark:text-white">
                  تنبيه ما قبل حصة Taki Academy (الساعة 19:15)
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  إشعار صوتي خفيف قبل 15 دقيقة لتجهيز الحاسوب والكراس قبل بدء الحصة 19:30
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.enableTakiAlert}
                onChange={(e) => setForm({ ...form, enableTakiAlert: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-900 dark:text-white">
                  المؤثرات الصوتية للأذان ومؤقت بومودورو
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  نغمات لطيفة ومريحة عند حنين الصلاة أو إتمام جلسة الدراسة
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.enableAudioNotifications}
                onChange={(e) =>
                  setForm({ ...form, enableAudioNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Visual Style: Claymorphism vs Neo-Brutalism */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-black text-stone-900 dark:text-white">
                  النمط البصري (Design System Aesthetic)
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  اختر بين التصميم المجسم ثلاثي الأبعاد (Claymorphism) أو التصميم العصري الجريء (Neo-Brutalism)
                </p>
              </div>

              <div className="flex bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-300 dark:border-stone-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, visualStyle: 'claymorphism' })}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    form.visualStyle !== 'neobrutalism'
                      ? 'bg-amber-400 text-stone-900 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Claymorphism 3D 🫧
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, visualStyle: 'neobrutalism' })}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    form.visualStyle === 'neobrutalism'
                      ? 'bg-[#0F382A] text-amber-300 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Neo-Brutalism ⚡
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Priority Subjects Selection */}
        <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>المواد التي تتطلب تركيزًا ومراجعة إضافية</span>
          </h3>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            حدد المواد التي تجد فيها صعوبة ليقترح عليك المنظم أوقات تركيز إضافية لها:
          </p>

          <div className="flex flex-wrap gap-2">
            {allSubjects.map((sub) => {
              const isSelected = form.weakSubjects?.includes(sub);

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleWeakSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {isSelected ? `✓ ${sub}` : `+ ${sub}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 font-black text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
              ✓ تم حفظ الإعدادات بنجاح!
            </span>
          )}
        </div>

      </form>

      {/* 4. Data Backup & Reset */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <span>الخصوصية والنسخ الاحتياطي للبيانات</span>
        </h3>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          تُحفظ جميع بياناتك بأمان على متصفحك محليًا (LocalStorage) دون إرسال أي بيانات شخصية لخوادم خارجية.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-stone-300 dark:border-stone-700"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-stone-300 dark:border-stone-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استيراد نسخة سابقة</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-900 font-black text-xs rounded-xl flex items-center gap-1.5 border-2 border-stone-900 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] mr-auto transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ضبط المصنع (Factory Reset)</span>
          </button>
        </div>

        {importStatus && (
          <p className="text-xs font-bold text-emerald-700 mt-2">{importStatus}</p>
        )}
      </div>

      {/* In-App Factory Reset Confirmation Modal (safe for iFrame environments) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FAF8F5] dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-100 rounded-3xl w-full max-w-md p-6 shadow-[6px_6px_0px_0px_#1c1917] dark:shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-stone-900 dark:border-stone-700">
              <div className="w-10 h-10 rounded-xl bg-red-500 text-white border-2 border-stone-900 flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
                ⚠️
              </div>
              <div>
                <h4 className="font-black text-base text-stone-900 dark:text-white">
                  تأكيد إعادة ضبط المصنع
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Factory Reset • استعادة القالب التونسي الأصلي
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-bold">
              هل أنت متأكد من رغبتك في إعادة ضبط التطبيق بالكامل؟
              <br />
              سيتم استرجاع الجدول المدرسي الرسمي للسنة الثامنة أساسي بتونس، وحصص Taki Academy اليومية (19:30 – 21:00)، وقائمة الواجبات والروتين الافتراضية.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl border border-stone-400 transition-colors"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  onResetAll();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl border-2 border-stone-900 shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                نعم، استعادة ضبط المصنع الآن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
