import { PrayerTimeData } from '../types';

export interface TunisianCity {
  id: string;
  nameAr: string;
  nameFr: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const TUNISIAN_CITIES: TunisianCity[] = [
  { id: 'tunis', nameAr: 'تونس العاصمة', nameFr: 'Tunis', lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis' },
  { id: 'sfax', nameAr: 'صفاقس', nameFr: 'Sfax', lat: 34.7406, lng: 10.7603, timezone: 'Africa/Tunis' },
  { id: 'sousse', nameAr: 'سوسة', nameFr: 'Sousse', lat: 35.8256, lng: 10.6084, timezone: 'Africa/Tunis' },
  { id: 'kairouan', nameAr: 'القيروان', nameFr: 'Kairouan', lat: 35.6781, lng: 10.0963, timezone: 'Africa/Tunis' },
  { id: 'bizerte', nameAr: 'بنزرت', nameFr: 'Bizerte', lat: 37.2746, lng: 9.8739, timezone: 'Africa/Tunis' },
  { id: 'nabeul', nameAr: 'نابل / الحمامات', nameFr: 'Nabeul', lat: 36.4561, lng: 10.7376, timezone: 'Africa/Tunis' },
  { id: 'monastir', nameAr: 'المنستير', nameFr: 'Monastir', lat: 35.7779, lng: 10.8261, timezone: 'Africa/Tunis' },
  { id: 'gabes', nameAr: 'قابس', nameFr: 'Gabès', lat: 33.8815, lng: 10.0982, timezone: 'Africa/Tunis' },
  { id: 'ariana', nameAr: 'أريانة', nameFr: 'Ariana', lat: 36.8663, lng: 10.1956, timezone: 'Africa/Tunis' },
  { id: 'benarous', nameAr: 'بن عروس', nameFr: 'Ben Arous', lat: 36.7533, lng: 10.2222, timezone: 'Africa/Tunis' },
  { id: 'manouba', nameAr: 'منوبة', nameFr: 'Manouba', lat: 36.8081, lng: 10.0972, timezone: 'Africa/Tunis' },
  { id: 'mahdia', nameAr: 'المهدية', nameFr: 'Mahdia', lat: 35.5047, lng: 11.0622, timezone: 'Africa/Tunis' },
  { id: 'gafsa', nameAr: 'قفصة', nameFr: 'Gafsa', lat: 34.425, lng: 8.7842, timezone: 'Africa/Tunis' },
  { id: 'medenine', nameAr: 'مدنين / جربة', nameFr: 'Médenine', lat: 33.3549, lng: 10.5055, timezone: 'Africa/Tunis' },
  { id: 'beja', nameAr: 'باجة', nameFr: 'Béja', lat: 36.7256, lng: 9.1817, timezone: 'Africa/Tunis' },
  { id: 'jendouba', nameAr: 'جندوبة', nameFr: 'Jendouba', lat: 36.5011, lng: 8.7803, timezone: 'Africa/Tunis' },
  { id: 'kasserine', nameAr: 'القصرين', nameFr: 'Kasserine', lat: 35.1676, lng: 8.8365, timezone: 'Africa/Tunis' },
  { id: 'kef', nameAr: 'الكاف', nameFr: 'Le Kef', lat: 36.1742, lng: 8.7049, timezone: 'Africa/Tunis' },
  { id: 'zaghouan', nameAr: 'زغوان', nameFr: 'Zaghouan', lat: 36.4029, lng: 10.1429, timezone: 'Africa/Tunis' },
  { id: 'tozeur', nameAr: 'توزر', nameFr: 'Tozeur', lat: 33.9197, lng: 8.1335, timezone: 'Africa/Tunis' }
];

// Offline Astronomical Prayer calculation (standard method adjusted for Tunisia)
// Tunisian Ministry of Religious Affairs standard: Fajr 18°, Isha 18°
function dtr(d: number) { return (d * Math.PI) / 180.0; }
function rtd(r: number) { return (r * 180.0) / Math.PI; }
function sin(d: number) { return Math.sin(dtr(d)); }
function cos(d: number) { return Math.cos(dtr(d)); }
function tan(d: number) { return Math.tan(dtr(d)); }
function arcsin(d: number) { return rtd(Math.asin(d)); }
function arccos(d: number) { return rtd(Math.acos(d)); }
function arctan2(y: number, x: number) { return rtd(Math.atan2(y, x)); }
function fixHour(a: number) { return a - 24.0 * Math.floor(a / 24.0); }

export function calculateAstronomicalTimes(date: Date, lat: number, lng: number): PrayerTimeData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  let d = jd - 2451545.0;

  // Mean anomaly of the Sun
  let g = 357.529 + 0.98560028 * d;
  let q = 280.459 + 0.98564736 * d;
  let L = q + 1.915 * sin(g) + 0.020 * sin(2 * g);

  // Sun distance
  let e = 23.439 - 0.00000036 * d;
  let d_sun = arcsin(sin(e) * sin(L));
  let ra = arctan2(cos(e) * sin(L), cos(L)) / 15.0;
  ra = fixHour(ra);

  // Equation of time
  let eqt = q / 15.0 - ra;
  if (eqt > 12) eqt -= 24;
  if (eqt < -12) eqt += 24;

  // Tunisia is UTC+1 (standard time)
  const timezone = 1;
  const noon = fixHour(12 + timezone - lng / 15.0 - eqt);

  // Sun angles
  const fajrAngle = 18.0; // Tunisian Ministry angle
  const ishaAngle = 18.0;

  // Fajr
  const fajrDiff = (1 / 15.0) * arccos((-sin(fajrAngle) - sin(lat) * sin(d_sun)) / (cos(lat) * cos(d_sun)));
  const fajr = isNaN(fajrDiff) ? 5.2 : fixHour(noon - fajrDiff);

  // Sunrise (0.833 degrees refraction)
  const sunriseDiff = (1 / 15.0) * arccos((-sin(0.833) - sin(lat) * sin(d_sun)) / (cos(lat) * cos(d_sun)));
  const sunrise = isNaN(sunriseDiff) ? 6.5 : fixHour(noon - sunriseDiff);

  // Dhuhr
  const dhuhr = noon;

  // Asr (Shafi'i shadow = 1 + shadow at noon)
  const tShadow = 1 + tan(Math.abs(lat - d_sun));
  const asrAngle = rtd(Math.atan(1 / tShadow));
  const asrDiff = (1 / 15.0) * arccos((sin(asrAngle) - sin(lat) * sin(d_sun)) / (cos(lat) * cos(d_sun)));
  const asr = isNaN(asrDiff) ? 15.5 : fixHour(noon + asrDiff);

  // Sunset / Maghrib
  const sunsetDiff = (1 / 15.0) * arccos((-sin(0.833) - sin(lat) * sin(d_sun)) / (cos(lat) * cos(d_sun)));
  const maghrib = isNaN(sunsetDiff) ? 18.5 : fixHour(noon + sunsetDiff);

  // Isha
  const ishaDiff = (1 / 15.0) * arccos((-sin(ishaAngle) - sin(lat) * sin(d_sun)) / (cos(lat) * cos(d_sun)));
  const isha = isNaN(ishaDiff) ? 20.0 : fixHour(noon + ishaDiff);

  const format = (hours: number): string => {
    let h = Math.floor(hours);
    let mins = Math.round((hours - h) * 60);
    if (mins >= 60) {
      h += 1;
      mins -= 60;
    }
    h = h % 24;
    return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return {
    fajr: format(fajr),
    sunrise: format(sunrise),
    dhuhr: format(dhuhr),
    asr: format(asr),
    maghrib: format(maghrib),
    isha: format(isha),
  };
}

// Fetch live from Aladhan API with offline fallback
export async function fetchLivePrayerTimes(cityNameAr: string, date: Date = new Date()): Promise<PrayerTimeData> {
  const city = TUNISIAN_CITIES.find(c => c.nameAr === cityNameAr) || TUNISIAN_CITIES[0];
  const localCalc = calculateAstronomicalTimes(date, city.lat, city.lng);

  try {
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${city.lat}&longitude=${city.lng}&method=3`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json?.data?.timings) {
        const timings = json.data.timings;
        return {
          fajr: timings.Fajr?.slice(0, 5) || localCalc.fajr,
          sunrise: timings.Sunrise?.slice(0, 5) || localCalc.sunrise,
          dhuhr: timings.Dhuhr?.slice(0, 5) || localCalc.dhuhr,
          asr: timings.Asr?.slice(0, 5) || localCalc.asr,
          maghrib: timings.Maghrib?.slice(0, 5) || localCalc.maghrib,
          isha: timings.Isha?.slice(0, 5) || localCalc.isha,
        };
      }
    }
  } catch {
    // Return reliable offline calculation
  }

  return localCalc;
}

export interface NextPrayerInfo {
  name: string;
  nameAr: string;
  time: string;
  timeRemaining: string; // e.g. "ساعة و 24 دقيقة"
  minutesRemaining: number;
  isToday: boolean;
}

export function getNextPrayer(prayers: PrayerTimeData, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerList = [
    { name: 'Fajr', nameAr: 'الفجر', time: prayers.fajr },
    { name: 'Sunrise', nameAr: 'الشروق', time: prayers.sunrise },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayers.dhuhr },
    { name: 'Asr', nameAr: 'العصر', time: prayers.asr },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayers.maghrib },
    { name: 'Isha', nameAr: 'العشاء', time: prayers.isha },
  ];

  for (const p of prayerList) {
    const [h, m] = p.time.split(':').map(Number);
    const pMinutes = h * 60 + m;
    if (pMinutes > currentMinutes) {
      const diff = pMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      let text = '';
      if (hours > 0) text += `${hours} س `;
      text += `${mins} د`;
      return {
        name: p.name,
        nameAr: p.nameAr,
        time: p.time,
        timeRemaining: text,
        minutesRemaining: diff,
        isToday: true,
      };
    }
  }

  // Next is tomorrow's Fajr
  const [fh, fm] = prayers.fajr.split(':').map(Number);
  const fajrMins = fh * 60 + fm;
  const diff = (24 * 60 - currentMinutes) + fajrMins;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  return {
    name: 'Fajr',
    nameAr: 'الفجر (غدًا)',
    time: prayers.fajr,
    timeRemaining: `${hours} س ${mins} د`,
    minutesRemaining: diff,
    isToday: false,
  };
}
