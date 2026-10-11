import { DayOfWeek } from '../types';

export const ARABIC_DAYS: Record<DayOfWeek, string> = {
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
  saturday: 'السبت',
  sunday: 'الأحد',
};

export const DAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function getTodayDayOfWeek(date: Date = new Date()): DayOfWeek {
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday...
  const map: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  return map[dayIndex] || 'monday';
}

export function formatGregorianArabic(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat('ar-TN', options).format(date);
}

export function formatHijriArabic(date: Date = new Date()): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('ar-TN-u-ca-islamic-umalqura', options).format(date);
  } catch {
    return 'ربيع الثاني 1448 هـ';
  }
}

export function formatTimeString(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function parseMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const MOTIVATIONAL_QUOTES = [
  { text: '«وَقُل رَّبِّ زِدْنِي عِلْمًا»', source: 'سورة طه' },
  { text: '«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»', source: 'حديث شريف' },
  { text: '«إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»', source: 'حديث شريف' },
  { text: '«العلم في الصغر كالنقش على الحجر، فاستثمر ساعات يومك بحكمة وتوكل على الله.»', source: 'حكمة مأثورة' },
  { text: '«ساعات قليلة من التركيز الصادق تصنع تفوقًا دائمًا ومستقبلًا مشرقًا بإذن الله.»', source: 'نصيحة للمجتهد' },
  { text: '«احرص على ما ينفعك، واستعن بالله ولا تعجز، فلكل مجتهد نصيب.»', source: 'وصية نبوية' }
];
