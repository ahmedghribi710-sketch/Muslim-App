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
  User as UserIcon,
  ShieldCheck,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendAppNotification,
} from '../utils/notifications';
import { UserSettings, UserStats, DailyPrayerRecord } from '../types';
import { TUNISIAN_CITIES } from '../utils/prayerTimes';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { StudyWeeklyChart } from './StudyWeeklyChart';
import { TakiAcademyLogo } from './TakiAcademyLogo';
import { Cloud, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  stats?: UserStats;
  dailyPrayers?: DailyPrayerRecord;
  currentUser?: FirebaseUser | null;
  onSyncCloud?: () => Promise<void> | void;
  onLogin?: () => void;
  onLogout?: () => void;
  onClearDemoData?: () => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetAll: () => void;
  onOpenPdfModal?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  stats,
  dailyPrayers,
  currentUser,
  onSyncCloud,
  onLogin,
  onLogout,
  onClearDemoData,
  onUpdateSettings,
  onResetAll,
  onOpenPdfModal,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Keep form in sync when settings prop updates (e.g. from cloud or other components)
  React.useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  // Instant auto-save helper so that any field change is immediately persisted
  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onUpdateSettings(updated);
  };

  const currentStats = stats || storage.getStats();

  const handleRequestNotif = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
  };

  const handleTestNotif = () => {
    sendAppNotification('🔔 إشعار تجريبي | Test de notification', {
      body: 'نظام الإشعارات متاح ويعمل بنجاح لتنبيهات الصلاة، Taki Academy، ومؤقت بومودورو!',
      type: 'taki',
    });
    sound.playTakiAlert();
  };

  const handleManualSync = async () => {
    if (onSyncCloud) {
      setIsSyncing(true);
      setSyncStatusMsg('');
      try {
        await onSyncCloud();
        setSyncStatusMsg('✓ تم تحديث البيانات ومزامنتها بنجاح مع سحابة Firebase!');
        setTimeout(() => setSyncStatusMsg(''), 4000);
      } catch (err) {
        setSyncStatusMsg('حدث خطأ أثناء التحديث السحابي');
      } finally {
        setIsSyncing(false);
      }
    }
  };

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
    const nextWeak = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    updateField('weakSubjects', nextWeak);
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
            تخصيص أوقات النوم، مواقيت الصلاة، والتزامات Taki Academy، والنسخ الاحتياطي (الحفظ فوري ودائم)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>حفظ فوري تلقائي</span>
          </span>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>تصدير / طباعة PDF</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Profile & Schedule Timing */}
        <div className="clay-card p-6 sm:p-7 space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <UserIcon className="w-5 h-5 text-emerald-700" />
            <span>بيانات الطالب وأوقات الاستيقاظ والنوم</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                اسم الطالب
              </label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => updateField('studentName', e.target.value)}
                className="clay-input w-full p-3 text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                وقت الاستيقاظ المستهدف (صباحًا)
              </label>
              <input
                type="time"
                value={form.wakeUpTime}
                onChange={(e) => updateField('wakeUpTime', e.target.value)}
                className="clay-input w-full p-3 text-sm font-bold font-mono"
                required
              />
              <span className="text-[10px] text-stone-500 font-normal mt-1 block">الموصى به: 05:30 لصلاة الفجر</span>
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                وقت النوم المستهدف (ليلاً)
              </label>
              <input
                type="time"
                value={form.targetBedTime}
                onChange={(e) => updateField('targetBedTime', e.target.value)}
                className="clay-input w-full p-3 text-sm font-bold font-mono"
                required
              />
              <span className="text-[10px] text-stone-500 font-normal mt-1 block">الموصى به: 21:45 (بعد Taki Academy)</span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                مدة التنقل بين المدرسة والمنزل (دقائق)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={form.commuteMinutes}
                onChange={(e) => updateField('commuteMinutes', Number(e.target.value))}
                className="clay-input w-full p-3 text-sm font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 dark:text-stone-300 mb-1.5 font-bold">
                مدينة مواقيت الصلاة (الجمهورية التونسية)
              </label>
              <select
                value={form.selectedCity}
                onChange={(e) => updateField('selectedCity', e.target.value)}
                className="clay-input w-full p-3 text-sm font-bold"
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

        {/* 2. Firebase Cloud Data Synchronization (Mise à jour des données Firebase) */}
        <div className="clay-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 flex-wrap gap-2">
            <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-teal-600" />
              <span>تحديث ومزامنة البيانات السحابية (Firebase Cloud Sync)</span>
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-300 border border-teal-300/60">
              Mise à jour des données
            </span>
          </div>

          <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-black text-sm text-stone-900 dark:text-white flex items-center gap-2">
                  <span>قاعدة بيانات Firebase Firestore</span>
                  {currentUser ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      متصل ومسجل
                    </span>
                  ) : (
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      حفظ محلي فقط
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                  {currentUser
                    ? `الحساب: ${currentUser.email || currentUser.displayName || 'مستخدم مسجل'}`
                    : 'سجّل الدخول بجوجل لمزامنة جدولك، واجباتك، ومعدلاتك عبر جميع أجهزتك.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={handleManualSync}
                      className="clay-btn-emerald px-4 py-2 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'جارِ التحديث...' : 'تحديث البيانات الآن (Mettre à jour)'}</span>
                    </button>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={onLogout}
                        className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="تسجيل الخروج"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  onLogin && (
                    <button
                      type="button"
                      onClick={onLogin}
                      className="clay-btn-amber px-4 py-2 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>دخول Google للمزامنة</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {syncStatusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{syncStatusMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Taki Academy & Notifications (Notifications Available) */}
        <div className="clay-card p-6 sm:p-7 space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TakiAcademyLogo variant="icon" size="xs" className="w-5 h-5" />
              <span>التزام Taki Academy ونظام الإشعارات المتاحة (Notifications)</span>
            </div>
            <a
              href="https://www.takiacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>takiacademy.com</span>
            </a>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Browser Push Notifications status and toggle */}
            <div className="p-4 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]">
              <div>
                <div className="font-black text-sm text-stone-900 dark:text-white flex items-center gap-2">
                  <span>إشعارات النظام والمتصفح (Browser Push Notifications)</span>
                  {notifPermission === 'granted' ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      متاحة ومفعلة ✓
                    </span>
                  ) : notifPermission === 'denied' ? (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      محظورة في المتصفح
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      بانتظار الإذن
                    </span>
                  )}
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  تنبيهات فورية تظهر على الشاشة حتى لو كان المتصفح مصغرًا لمواقيت الصلاة وحصص Taki Academy.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notifPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleRequestNotif}
                    className="clay-btn-indigo px-3.5 py-1.5 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    تفعيل الإشعارات (Activer)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTestNotif}
                    className="clay-btn-amber px-3.5 py-1.5 text-stone-950 font-black text-xs rounded-xl transition-all cursor-pointer"
                    title="تجربة إرسال إشعار فوري للتأكد من عمله"
                  >
                    إرسال إشعار تجريبي 🔔
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]">
              <div>
                <div className="font-black text-sm text-stone-900 dark:text-white">
                  تنبيه ما قبل حصة Taki Academy (الساعة 19:15)
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  إشعار صوتي خفيف ونظام إشعارات قبل 15 دقيقة لتجهيز الحاسوب والكراس قبل بدء الحصة 19:30
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.enableTakiAlert}
                onChange={(e) => updateField('enableTakiAlert', e.target.checked)}
                className="w-5 h-5 rounded-lg text-indigo-600 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-between shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]">
              <div>
                <div className="font-black text-sm text-stone-900 dark:text-white">
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
                  updateField('enableAudioNotifications', e.target.checked)
                }
                className="w-5 h-5 rounded-lg text-emerald-600 cursor-pointer"
              />
            </div>

            {/* Night Study Mode (وضع المذاكرة الليلية) */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-stone-950/60 border border-indigo-500/40 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <div className="font-black text-sm text-indigo-200 flex items-center gap-2">
                  <span>🌙 وضع المذاكرة الليلية (Night Study Mode)</span>
                  <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">فلتر الضوء الأزرق + توفير الطاقة</span>
                </div>
                <p className="text-indigo-300/80 text-xs mt-1">
                  تقليل الضوء الأزرق تلقائياً لراحة العينين ليلاً، تفعيل شاشة مريحة، ومؤقت مخصص لجلسات المذاكرة المتأخرة
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.enableNightStudyMode || false}
                onChange={(e) => updateField('enableNightStudyMode', e.target.checked)}
                className="w-5 h-5 rounded-lg text-indigo-400 cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Visual Style: Claymorphism vs Neo-Brutalism */}
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]">
              <div>
                <div className="font-black text-sm text-stone-900 dark:text-white">
                  النمط البصري (Design System Aesthetic)
                </div>
                <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                  اختر بين التصميم المجسم ثلاثي الأبعاد (Claymorphism 3D) أو التصميم الجريء (Neo-Brutalism)
                </p>
              </div>

              <div className="flex bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-300 dark:border-stone-700 shrink-0 shadow-inner">
                <button
                  type="button"
                  onClick={() => updateField('visualStyle', 'claymorphism')}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
                    form.visualStyle !== 'neobrutalism'
                      ? 'clay-btn-amber shadow-sm'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Claymorphism 3D 🫧
                </button>
                <button
                  type="button"
                  onClick={() => updateField('visualStyle', 'neobrutalism')}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
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
        <div className="clay-card p-6 sm:p-7 space-y-4">
          <h3 className="font-black text-base text-stone-900 dark:text-white flex items-center gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>المواد التي تتطلب تركيزًا ومراجعة إضافية</span>
          </h3>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            حدد المواد التي تجد فيها صعوبة ليقترح عليك المنظم أوقات تركيز إضافية لها:
          </p>

          <div className="flex flex-wrap gap-2.5">
            {allSubjects.map((sub) => {
              const isSelected = form.weakSubjects?.includes(sub);

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleWeakSubject(sub)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'clay-btn-amber shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]'
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
            className="clay-btn-emerald px-7 py-3 text-white font-black text-sm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
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
 
      {/* 4. Weekly Study & Prayers Progress Chart (Recharts Line Chart) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
          <h3 className="font-black text-base text-stone-900 dark:text-white">
            مخطط الأداء الأسبوعي (تطور دقائق الدراسة والصلوات المنجزة)
          </h3>
        </div>
        <StudyWeeklyChart
          stats={currentStats}
          dailyPrayers={dailyPrayers}
          title="مخطط تطور دقائق المذاكرة والصلوات الخمس (آخر 7 أيام)"
          subtitle="مخطط بياني تفاعلي باستخدام Recharts لتتبع التوازن بين التحصيل الدراسي والعبادة"
        />
      </div>

      {/* 5. Data Backup & Reset */}
      <div className="clay-card p-6 sm:p-7 space-y-4">
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
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-[2px_3px_8px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.8)] border border-stone-200/80 dark:border-stone-700 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-[2px_3px_8px_rgba(0,0,0,0.06),inset_1px_1px_2px_rgba(255,255,255,0.8)] border border-stone-200/80 dark:border-stone-700 cursor-pointer transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <span>استيراد نسخة سابقة</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {onClearDemoData && (
            <button
              type="button"
              onClick={onClearDemoData}
              className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs rounded-2xl flex items-center gap-1.5 border border-amber-300 shadow-[3px_4px_10px_rgba(217,119,6,0.15),inset_1px_1px_2px_rgba(255,255,255,0.7)] active:scale-95 transition-all cursor-pointer"
              title="حذف جميع الواجبات والامتحانات والإحصائيات التجريبية"
            >
              <Trash2 className="w-4 h-4 text-amber-700" />
              <span>حذف كل البيانات التجريبية (Supprimer données démo)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2.5 bg-red-100/80 hover:bg-red-200 text-red-900 font-black text-xs rounded-2xl flex items-center gap-1.5 border border-red-300 shadow-[3px_4px_10px_rgba(239,68,68,0.15),inset_1px_1px_2px_rgba(255,255,255,0.7)] active:scale-95 mr-auto transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="clay-card bg-[#FAF8F5] dark:bg-stone-900 w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-200 dark:border-stone-700">
              <div className="w-11 h-11 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-lg shadow-[3px_4px_10px_rgba(239,68,68,0.3),inset_1.5px_1.5px_3px_rgba(255,255,255,0.5)] border border-red-400">
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
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-2xl transition-all cursor-pointer active:scale-95"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  onResetAll();
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-[4px_6px_14px_rgba(220,38,38,0.3),inset_1.5px_1.5px_3px_rgba(255,255,255,0.4)] active:scale-95 transition-all cursor-pointer"
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
