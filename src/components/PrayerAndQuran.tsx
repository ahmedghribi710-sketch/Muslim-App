import React, { useState, useRef } from 'react';
import {
  Compass,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MapPin,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  PrayerTimeData,
  DailyPrayerRecord,
  QuranProgress,
  UserSettings,
} from '../types';
import { TUNISIAN_CITIES, getNextPrayer } from '../utils/prayerTimes';
import { QURAN_SURAHS } from '../utils/defaultData';
import { sound } from '../utils/sound';

interface PrayerAndQuranProps {
  prayers: PrayerTimeData;
  dailyPrayers: DailyPrayerRecord;
  quran: QuranProgress;
  settings: UserSettings;
  onUpdatePrayers: (prayers: DailyPrayerRecord) => void;
  onUpdateQuran: (quran: QuranProgress) => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const PrayerAndQuran: React.FC<PrayerAndQuranProps> = ({
  prayers,
  dailyPrayers,
  quran,
  settings,
  onUpdatePrayers,
  onUpdateQuran,
  onUpdateSettings,
}) => {
  const [activeSurahAudio, setActiveSurahAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioSurahName, setAudioSurahName] = useState<string>('');
  const [showMulkText, setShowMulkText] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextPrayer = getNextPrayer(prayers);

  const prayerCards = [
    { key: 'fajr' as const, name: 'الفجر', time: prayers.fajr, sunnahKey: 'fajrSunnah' as const, sunnahLabel: 'سنة الفجر (ركعتان)' },
    { key: 'dhuhr' as const, name: 'الظهر', time: prayers.dhuhr, sunnahKey: 'dhuhrSunnah' as const, sunnahLabel: 'سنة الظهر (4 قبل و 2 بعد)' },
    { key: 'asr' as const, name: 'العصر', time: prayers.asr, sunnahLabel: '4 ركعات فرض' },
    { key: 'maghrib' as const, name: 'المغرب', time: prayers.maghrib, sunnahKey: 'maghribSunnah' as const, sunnahLabel: 'سنة المغرب (ركعتان بعده)' },
    { key: 'isha' as const, name: 'العشاء', time: prayers.isha, sunnahKey: 'ishaSunnah' as const, sunnahLabel: 'سنة العشاء والوتر' },
  ];

  const handleTogglePrayer = (key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha') => {
    sound.playSuccess();
    const updated = { ...dailyPrayers, [key]: !dailyPrayers[key] };
    onUpdatePrayers(updated);
  };

  const handleToggleSunnah = (key: 'fajrSunnah' | 'dhuhrSunnah' | 'maghribSunnah' | 'ishaSunnah') => {
    sound.playSuccess();
    const updated = { ...dailyPrayers, [key]: !dailyPrayers[key] };
    onUpdatePrayers(updated);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ ...settings, selectedCity: e.target.value });
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Find closest city
          let closest = TUNISIAN_CITIES[0];
          let minDist = 9999;
          TUNISIAN_CITIES.forEach((c) => {
            const dist = Math.hypot(c.lat - lat, c.lng - lng);
            if (dist < minDist) {
              minDist = dist;
              closest = c;
            }
          });
          onUpdateSettings({ ...settings, selectedCity: closest.nameAr });
          sound.playSuccess();
        },
        () => {
          // Geolocation denied, keep current
        }
      );
    }
  };

  const handleAddPage = () => {
    sound.playSuccess();
    const updated = {
      ...quran,
      pagesReadToday: quran.pagesReadToday + 1,
      currentPage: quran.currentPage + 1,
    };
    onUpdateQuran(updated);
  };

  const handlePlayAudio = (surahNumber: number, audioUrl: string, name: string) => {
    if (activeSurahAudio === surahNumber && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setActiveSurahAudio(surahNumber);
      setAudioSurahName(name);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header & City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
            <span>الصلاة والقرآن الكريم</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            مواقيت الصلاة المعتمدة في تونس (وزارة الشؤون الدينية) ومتابعة الورد القرآني
          </p>
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mr-1" />
          <select
            value={settings.selectedCity}
            onChange={handleCityChange}
            className="text-xs font-bold bg-transparent text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            {TUNISIAN_CITIES.map((c) => (
              <option key={c.id} value={c.nameAr} className="bg-white dark:bg-stone-900">
                {c.nameAr} ({c.nameFr})
              </option>
            ))}
          </select>
          <button
            onClick={handleGeoLocation}
            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-[11px] font-bold rounded-lg text-stone-700 dark:text-stone-300 transition-colors"
            title="تحديد الموقع الجغرافي تلقائيًا"
          >
            تحديد تلقائي
          </button>
        </div>
      </div>

      {/* Next Prayer Countdown Card */}
      <div className="bg-gradient-to-r from-[#0F382A] to-[#144735] text-amber-50 rounded-2xl p-5 border-2 border-stone-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-200 font-bold">
            الصلاة القادمة • حسب توقيت {settings.selectedCity}
          </span>
          <h3 className="text-2xl font-black text-amber-300 mt-0.5">
            صلاة {nextPrayer.nameAr} ({nextPrayer.time})
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            طريقة الحساب: التوقيت التونسي المعتمد (زاوية الفجر 18° والعشاء 18°)
          </p>
        </div>

        <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl px-5 py-3 text-center">
          <div className="text-[11px] text-emerald-300 font-bold">الوقت المتبقي</div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
            {nextPrayer.timeRemaining}
          </div>
        </div>
      </div>

      {/* 5 Daily Prayers Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {prayerCards.map((p) => {
          const isDone = dailyPrayers[p.key];
          const isSunnahDone = p.sunnahKey ? dailyPrayers[p.sunnahKey] : false;

          return (
            <div
              key={p.key}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/70 shadow-sm'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-base text-stone-900 dark:text-white">
                    {p.name}
                  </h4>
                  <span className="font-mono font-black text-sm text-emerald-800 dark:text-emerald-400">
                    {p.time}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                  {p.sunnahLabel}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                {/* Fardh button */}
                <button
                  onClick={() => handleTogglePrayer(p.key)}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isDone
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> صليت الفرض
                    </>
                  ) : (
                    'أداء الفرض'
                  )}
                </button>

                {/* Sunnah toggle if applicable */}
                {p.sunnahKey && (
                  <button
                    onClick={() => handleToggleSunnah(p.sunnahKey!)}
                    className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      isSunnahDone
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    {isSunnahDone ? '✓ أنجزت السنة' : '+ سنة الصلاة'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quran Section */}
      <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="font-black text-lg text-stone-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>متابعة ورد القرآن الكريم والتلاوة</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              ورد الصباح والمساء، وسورة الملك المنجية قبل النوم
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMulkText(!showMulkText)}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-xl transition-all border border-amber-300/60 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showMulkText ? 'إخفاء سورة الملك' : 'قراءة سورة الملك للنوم'}</span>
            </button>
          </div>
        </div>

        {/* Quran progress stats card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">الصفحة الحالية</span>
            <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono mt-1">
              صـ {quran.currentPage}
            </div>
            <span className="text-[11px] text-stone-500">الجزء {quran.currentJuz}</span>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">قراءة اليوم</span>
            <div className="text-2xl font-black text-amber-800 dark:text-amber-300 font-mono mt-1">
              {quran.pagesReadToday} / {quran.dailyGoalPages} ص
            </div>
            <button
              onClick={handleAddPage}
              className="mt-1 text-xs text-amber-800 dark:text-amber-300 hover:underline font-bold"
            >
              + تسجيل صفحة مقروءة
            </button>
          </div>

          <div className="p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 text-center">
            <span className="text-xs text-stone-500 dark:text-stone-400">السور المحفوظة</span>
            <div className="text-2xl font-black text-teal-800 dark:text-teal-300 font-mono mt-1">
              {quran.memorizedSurahs.length} سور
            </div>
            <span className="text-[11px] text-stone-500">جزء عمّ والملك</span>
          </div>
        </div>

        {/* Surah Al-Mulk Text Reader */}
        {showMulkText && (
          <div className="bg-[#FAF8F5] dark:bg-stone-800/80 border-2 border-amber-300 dark:border-amber-900 rounded-2xl p-5 shadow-inner animate-fade-in">
            <div className="text-center pb-3 border-b border-amber-200 dark:border-stone-700">
              <h4 className="font-quran text-2xl font-bold text-amber-900 dark:text-amber-300">
                سُورَةُ المُلْكِ (تَبَارَكَ)
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                سنة نبوية قبل النوم • ثلاثون آية تشفع لصاحبها حتى يغفر له
              </p>
            </div>

            <div className="py-4 px-2 font-quran text-xl sm:text-2xl leading-[2.2] text-stone-900 dark:text-amber-100 text-center">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ <br />
              تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ ﴿٣﴾ ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ ﴿٤﴾ وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ ﴿٥﴾
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  sound.playSuccess();
                  handleAddPage();
                  setShowMulkText(false);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                أتممت قراءة سورة الملك المباركة (+25 XP)
              </button>
            </div>
          </div>
        )}

        {/* Real Audio Recitation Player */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span>استماع للتلاوة العطرة (بصوت الشيخ مشاري العفاسي)</span>
            </h4>
            {isPlaying && (
              <span className="text-xs text-emerald-700 font-bold animate-pulse">
                جارٍ الاستماع: سورة {audioSurahName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {QURAN_SURAHS.map((s) => {
              const isCurrent = activeSurahAudio === s.number && isPlaying;

              return (
                <button
                  key={s.number}
                  onClick={() => handlePlayAudio(s.number, s.audioUrl, s.name)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-right transition-all ${
                    isCurrent
                      ? 'bg-emerald-800 text-white border-emerald-950 shadow-md'
                      : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">سورة {s.name}</div>
                    <div className={`text-[10px] ${isCurrent ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {s.versesCount} آيات
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    {isCurrent ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          />
        </div>

      </div>

    </div>
  );
};
