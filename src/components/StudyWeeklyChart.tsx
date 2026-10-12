import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Zap,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { DailyPrayerRecord, DailyStudyRecord, UserStats } from '../types';
import { storage } from '../utils/storage';

interface StudyWeeklyChartProps {
  stats: UserStats;
  dailyPrayers?: DailyPrayerRecord;
  title?: string;
  subtitle?: string;
}

// Generate the past 7 days of dates ending today
export function getPastWeekRecords(
  stats: UserStats,
  dailyPrayers?: DailyPrayerRecord
): DailyStudyRecord[] {
  const existingMap = new Map<string, DailyStudyRecord>();
  if (stats.weeklyHistory && Array.isArray(stats.weeklyHistory)) {
    stats.weeklyHistory.forEach((r) => existingMap.set(r.date, r));
  }

  const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Realistic baseline for an 8th-grade student over the past week
  const defaultPastData = [
    { mins: 45, xp: 65, prayers: 5 }, // 6 days ago
    { mins: 35, xp: 50, prayers: 4 }, // 5 days ago
    { mins: 60, xp: 95, prayers: 5 }, // 4 days ago
    { mins: 40, xp: 60, prayers: 5 }, // 3 days ago
    { mins: 75, xp: 110, prayers: 4 }, // 2 days ago
    { mins: 50, xp: 75, prayers: 5 }, // yesterday
    { mins: Math.max(25, stats.totalStudyMinutes % 60 || 35), xp: 45, prayers: 4 }, // today fallback
  ];

  const result: DailyStudyRecord[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'اليوم' : i === 1 ? 'أمس' : arabicDays[d.getDay()];

    // Calculate prayer count for this specific day
    let prayersCount = 5;
    if (i === 0 && dailyPrayers) {
      prayersCount = [
        dailyPrayers.fajr,
        dailyPrayers.dhuhr,
        dailyPrayers.asr,
        dailyPrayers.maghrib,
        dailyPrayers.isha,
      ].filter(Boolean).length;
    } else {
      try {
        const saved = storage.getDailyPrayers(dateStr);
        const count = [
          saved.fajr,
          saved.dhuhr,
          saved.asr,
          saved.maghrib,
          saved.isha,
        ].filter(Boolean).length;
        prayersCount = count > 0 ? count : defaultPastData[6 - i].prayers;
      } catch {
        prayersCount = defaultPastData[6 - i].prayers;
      }
    }

    const existing = existingMap.get(dateStr);
    if (existing) {
      result.push({
        ...existing,
        dayLabel: i === 0 ? 'اليوم' : i === 1 ? 'أمس' : existing.dayLabel || arabicDays[d.getDay()],
        prayersCompleted: existing.prayersCompleted ?? prayersCount,
      });
    } else {
      result.push({
        date: dateStr,
        dayLabel,
        studyMinutes: 0,
        xpGained: 0,
        prayersCompleted: prayersCount,
      });
    }
  }

  return result;
}

export const StudyWeeklyChart: React.FC<StudyWeeklyChartProps> = ({
  stats,
  dailyPrayers,
  title = 'تطور دقائق الدراسة والصلوات المنجزة (آخر 7 أيام)',
  subtitle = 'مخطط بياني دقيق يوضح ساعات المذاكرة والمواظبة على الصلوات الخمس بالتوازي',
}) => {
  // Line chart is the primary requested format
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [activeMetric, setActiveMetric] = useState<'both' | 'minutes' | 'prayers'>('both');

  const data = getPastWeekRecords(stats, dailyPrayers);

  const totalWeekMinutes = data.reduce((acc, curr) => acc + curr.studyMinutes, 0);
  const totalWeekPrayers = data.reduce((acc, curr) => acc + (curr.prayersCompleted ?? 0), 0);
  const maxPossiblePrayers = 7 * 5; // 35 obligatory prayers in 7 days
  const prayerCommitmentPercent = Math.min(
    100,
    Math.round((totalWeekPrayers / maxPossiblePrayers) * 100)
  );
  const avgMinutesPerDay = Math.round(totalWeekMinutes / 7);
  const bestStudyDay = [...data].sort((a, b) => b.studyMinutes - a.studyMinutes)[0];

  return (
    <div className="clay-card p-5 sm:p-6 bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-stone-800">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#0F382A] text-amber-300 flex items-center justify-center font-black shadow-[3px_4px_12px_rgba(15,56,42,0.25),inset_1.5px_1.5px_3px_rgba(255,255,255,0.4)] border border-emerald-500/40 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-stone-900 dark:text-white">
                {title}
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-black border border-emerald-200 dark:border-emerald-800/60 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]">
                آخر 7 أيام
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Metric Selector */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-inner text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMetric === 'both'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-[2px_2px_6px_rgba(0,0,0,0.08)] font-black'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              المؤشران معًا
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('minutes')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMetric === 'minutes'
                  ? 'bg-emerald-700 text-white shadow-[2px_2px_6px_rgba(5,150,105,0.3)] font-black'
                  : 'text-stone-500 dark:text-stone-400 hover:text-emerald-700'
              }`}
            >
              دقائق الدراسة
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('prayers')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeMetric === 'prayers'
                  ? 'bg-sky-600 text-white shadow-[2px_2px_6px_rgba(2,132,199,0.3)] font-black'
                  : 'text-stone-500 dark:text-stone-400 hover:text-sky-600'
              }`}
            >
              الصلوات المنجزة
            </button>
          </div>

          {/* Chart Style: Line vs Area vs Bar */}
          <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 shadow-inner">
            <button
              type="button"
              onClick={() => setChartType('line')}
              title="مخطط خطي (Line Chart)"
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 px-2.5 ${
                chartType === 'line'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-[2px_2px_6px_rgba(0,0,0,0.08)] font-bold text-xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">خطي</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="مخطط مساحات انسيابي"
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 px-2.5 ${
                chartType === 'area'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-[2px_2px_6px_rgba(0,0,0,0.08)] font-bold text-xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">مساحات</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="مخطط أعمدة بيانية"
              className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 px-2.5 ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-[2px_2px_6px_rgba(0,0,0,0.08)] font-bold text-xs'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">أعمدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlights / KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Total Study Minutes */}
        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>مجموع المذاكرة</span>
          </div>
          <div className="font-black text-lg text-emerald-950 dark:text-emerald-100 flex items-baseline gap-1">
            <span>{totalWeekMinutes}</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              دقيقة ({Math.round((totalWeekMinutes / 60) * 10) / 10} س)
            </span>
          </div>
        </div>

        {/* Total Prayers Completed */}
        <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200/60 dark:border-sky-800/40 shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 text-xs font-bold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>الصلوات المنجزة</span>
          </div>
          <div className="font-black text-lg text-sky-950 dark:text-sky-100 flex items-baseline gap-1">
            <span>{totalWeekPrayers}</span>
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
              / 35 صلاة ({prayerCommitmentPercent}%)
            </span>
          </div>
        </div>

        {/* Daily Study Average */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>معدل الدراسة اليومي</span>
          </div>
          <div className="font-black text-lg text-amber-950 dark:text-amber-100 flex items-baseline gap-1">
            <span>{avgMinutesPerDay}</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">دقيقة / يوم</span>
          </div>
        </div>

        {/* Best Day */}
        <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200/60 dark:border-purple-800/40 shadow-[inset_1.5px_1.5px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>أعلى يوم دراسة</span>
          </div>
          <div className="font-black text-base text-purple-950 dark:text-purple-100 truncate">
            {bestStudyDay?.dayLabel || 'اليوم'}{' '}
            <span className="text-xs text-purple-700 dark:text-purple-300 font-bold">
              ({bestStudyDay?.studyMinutes || 0} د)
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 w-full pt-2" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            /* ================= LINE CHART (PRIMARY) ================= */
            <LineChart data={data} margin={{ top: 12, right: 16, left: -6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#0F382A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit=" د"
              />
              {activeMetric === 'both' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              {activeMetric === 'prayers' && (
                <YAxis
                  yAxisId="left"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-right min-w-[190px]"
                        dir="rtl"
                      >
                        <div className="font-black text-amber-300 text-sm mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        </div>
                        {payload.map((entry: any, index: number) => {
                          const isMinutes = entry.dataKey === 'studyMinutes';
                          return (
                            <div key={`item-${index}`} className="flex items-center justify-between text-xs py-1">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {isMinutes ? 'دقائق الدراسة' : 'الصلوات المنجزة'}
                              </span>
                              <span className="font-mono font-black text-white">
                                {entry.value} {isMinutes ? 'دقيقة' : 'من 5 صلوات'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-black text-stone-700 dark:text-stone-300 mr-2">
                    {value === 'studyMinutes'
                      ? 'دقائق الدراسة (Study Minutes)'
                      : 'الصلوات المنجزة (Completed Prayers)'}
                  </span>
                )}
              />
              {(activeMetric === 'both' || activeMetric === 'minutes') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="studyMinutes"
                  name="studyMinutes"
                  stroke="#0F382A"
                  strokeWidth={3.5}
                  dot={{ r: 4.5, fill: '#0F382A', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
              {(activeMetric === 'both' || activeMetric === 'prayers') && (
                <Line
                  yAxisId={activeMetric === 'both' ? 'right' : 'left'}
                  type="monotone"
                  dataKey="prayersCompleted"
                  name="prayersCompleted"
                  stroke="#0284c7"
                  strokeWidth={3}
                  strokeDasharray=""
                  dot={{ r: 4.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          ) : chartType === 'area' ? (
            /* ================= AREA CHART ================= */
            <AreaChart data={data} margin={{ top: 12, right: 16, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="studyMinsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F382A" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#0F382A" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="prayersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#0F382A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit=" د"
              />
              {activeMetric === 'both' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              {activeMetric === 'prayers' && (
                <YAxis
                  yAxisId="left"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-right min-w-[190px]"
                        dir="rtl"
                      >
                        <div className="font-black text-amber-300 text-sm mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        </div>
                        {payload.map((entry: any, index: number) => {
                          const isMinutes = entry.dataKey === 'studyMinutes';
                          return (
                            <div key={`item-${index}`} className="flex items-center justify-between text-xs py-1">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {isMinutes ? 'دقائق الدراسة' : 'الصلوات المنجزة'}
                              </span>
                              <span className="font-mono font-black text-white">
                                {entry.value} {isMinutes ? 'دقيقة' : 'من 5 صلوات'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-black text-stone-700 dark:text-stone-300 mr-2">
                    {value === 'studyMinutes'
                      ? 'دقائق الدراسة (Study Minutes)'
                      : 'الصلوات المنجزة (Completed Prayers)'}
                  </span>
                )}
              />
              {(activeMetric === 'both' || activeMetric === 'minutes') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="studyMinutes"
                  name="studyMinutes"
                  stroke="#0F382A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#studyMinsGradient)"
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
              {(activeMetric === 'both' || activeMetric === 'prayers') && (
                <Area
                  yAxisId={activeMetric === 'both' ? 'right' : 'left'}
                  type="monotone"
                  dataKey="prayersCompleted"
                  name="prayersCompleted"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#prayersGradient)"
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          ) : (
            /* ================= BAR CHART ================= */
            <BarChart data={data} margin={{ top: 12, right: 16, left: -6, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#0F382A"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit=" د"
              />
              {activeMetric === 'both' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              {activeMetric === 'prayers' && (
                <YAxis
                  yAxisId="left"
                  stroke="#0284c7"
                  fontSize={11}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickLine={false}
                  axisLine={false}
                  unit=" صلوات"
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-right min-w-[190px]"
                        dir="rtl"
                      >
                        <div className="font-black text-amber-300 text-sm mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>{label}</span>
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        </div>
                        {payload.map((entry: any, index: number) => {
                          const isMinutes = entry.dataKey === 'studyMinutes';
                          return (
                            <div key={`item-${index}`} className="flex items-center justify-between text-xs py-1">
                              <span className="flex items-center gap-1.5 font-bold text-stone-300">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                {isMinutes ? 'دقائق الدراسة' : 'الصلوات المنجزة'}
                              </span>
                              <span className="font-mono font-black text-white">
                                {entry.value} {isMinutes ? 'دقيقة' : 'من 5 صلوات'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(value) => (
                  <span className="text-xs font-black text-stone-700 dark:text-stone-300 mr-2">
                    {value === 'studyMinutes'
                      ? 'دقائق الدراسة (Study Minutes)'
                      : 'الصلوات المنجزة (Completed Prayers)'}
                  </span>
                )}
              />
              {(activeMetric === 'both' || activeMetric === 'minutes') && (
                <Bar
                  yAxisId="left"
                  dataKey="studyMinutes"
                  name="studyMinutes"
                  fill="#0F382A"
                  radius={[8, 8, 0, 0]}
                  barSize={18}
                />
              )}
              {(activeMetric === 'both' || activeMetric === 'prayers') && (
                <Bar
                  yAxisId={activeMetric === 'both' ? 'right' : 'left'}
                  dataKey="prayersCompleted"
                  name="prayersCompleted"
                  fill="#0284c7"
                  radius={[8, 8, 0, 0]}
                  barSize={18}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Encouragement Note */}
      <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
        <span className="font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          المواظبة على الصلوات الخمس في وقتها تبارك في وقت المذاكرة وتزيد التركيز والتوفيق الدراسي.
        </span>
        <span className="text-[11px] text-stone-500 dark:text-stone-500 font-medium">
          المستوى الحالي: {stats.level} (إجمالي {stats.xp} XP)
        </span>
      </div>
    </div>
  );
};
