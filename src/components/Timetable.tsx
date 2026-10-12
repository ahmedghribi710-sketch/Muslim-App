import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Printer,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  GraduationCap,
  Sparkles,
  MapPin,
  Home,
} from 'lucide-react';
import { DayOfWeek, SchoolClass, UserSettings } from '../types';
import { ARABIC_DAYS, DAY_ORDER, getTodayDayOfWeek, parseMinutes } from '../utils/arabicDates';
import { TIME_SLOTS } from '../utils/defaultData';
import { getDayEndInfo } from '../utils/smartScheduler';
import { TakiAcademyLogo } from './TakiAcademyLogo';

interface TimetableProps {
  classes: SchoolClass[];
  settings: UserSettings;
  onSaveClasses: (classes: SchoolClass[]) => void;
  onOpenPdfModal?: () => void;
}

export const Timetable: React.FC<TimetableProps> = ({
  classes,
  settings,
  onSaveClasses,
  onOpenPdfModal,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getTodayDayOfWeek());
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayDay = getTodayDayOfWeek();

  const handlePrint = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal();
    } else {
      window.print();
    }
  };

  const handleOpenAdd = (day: DayOfWeek, startTime?: string, endTime?: string) => {
    setEditingClass({
      id: `class-${Date.now()}`,
      day,
      startTime: startTime || '08:15',
      endTime: endTime || '09:15',
      subject: '',
      classroom: 'قاعة 4',
      teacher: '',
      color: '#0369a1',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: SchoolClass) => {
    setEditingClass({ ...c });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    onSaveClasses(updated);
    if (editingClass?.id === id) {
      setIsModalOpen(false);
      setEditingClass(null);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editingClass.subject.trim()) return;

    const exists = classes.some((c) => c.id === editingClass.id);
    let updated: SchoolClass[];
    if (exists) {
      updated = classes.map((c) => (c.id === editingClass.id ? editingClass : c));
    } else {
      updated = [...classes, editingClass];
    }
    onSaveClasses(updated);
    setIsModalOpen(false);
    setEditingClass(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in print-area">
      
      {/* Header controls (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#0F382A] dark:text-amber-400" />
            <span>الجدول المدرسي الأسبوعي (السنة 8 أساسي)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            جدول المواد والتنقل، مع تثبيت حصة Taki Academy يوميًا من 19:30 إلى 21:00
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Day / Week Switcher */}
          <div className="bg-stone-200 dark:bg-stone-800 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              عرض الأسبوع
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              عرض اليوم
            </button>
          </div>

          {/* Print PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-sm"
            title="طباعة الجدول بصيغة PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">تصدير / طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* School commute summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {DAY_ORDER.slice(0, 6).map((day) => {
          const info = getDayEndInfo(day, settings.commuteMinutes);
          const isToday = day === todayDay;

          return (
            <div
              key={day}
              onClick={() => {
                setSelectedDay(day);
                if (viewMode === 'day') setViewMode('day');
              }}
              className={`p-3 rounded-2xl cursor-pointer transition-all active:scale-95 ${
                isToday
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100/90 dark:from-amber-950/60 dark:to-amber-900/40 border border-amber-300 shadow-[5px_7px_16px_rgba(217,119,6,0.18),inset_2px_2px_4px_rgba(255,255,255,0.9),inset_-2px_-2px_4px_rgba(0,0,0,0.05)]'
                  : 'clay-card hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-stone-900 dark:text-white">
                  {ARABIC_DAYS[day]}
                </span>
                {isToday && (
                  <span className="text-[9px] bg-amber-400 text-stone-900 font-black px-2 py-0.5 rounded-full shadow-sm">
                    اليوم
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>انتهاء: {info.schoolEnd}</span>
                <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <Home className="w-3 h-3" /> {info.homeArrival}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Taki Academy Fixed Banner */}
      <div className="clay-card-indigo p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-stone-800 p-1 flex items-center justify-center font-black shadow-[2px_3px_8px_rgba(0,0,0,0.2),inset_1.5px_1.5px_3px_rgba(255,255,255,0.7)] border-2 border-sky-400 shrink-0">
            <TakiAcademyLogo variant="icon" size="sm" className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-base text-amber-300">
                Taki Academy (التزام يومي ثابت)
              </span>
              <span className="text-xs bg-indigo-950/80 text-sky-200 px-3 py-0.5 rounded-full border border-sky-400/40 font-bold">
                19:30 – 21:00
              </span>
            </div>
            <p className="text-xs text-indigo-100/90 mt-0.5 leading-relaxed">
              مدرجة كل يوم من الاثنين إلى الأحد. لا يجوز وضع واجبات أو مواعيد أثناء هذا الوقت.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-xs font-black text-amber-300 bg-indigo-950/90 px-3.5 py-1.5 rounded-xl border border-indigo-500/50 shadow-sm shrink-0">
          تنبيه تلقائي 19:15 ⏰
        </span>
      </div>

      {/* VIEW: Weekly Grid */}
      {viewMode === 'week' ? (
        <div className="clay-card overflow-hidden">
          {/* Mobile swipe hint */}
          <div className="sm:hidden bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-[11px] text-stone-500 text-center font-bold border-b border-stone-200 dark:border-stone-700">
            ↔ اسحب الجدول أفقيًا لتصفح كامل أيام وأوقات الأسبوع
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-stone-100/90 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 font-bold">
                  <th className="p-3 w-28 text-center border-l border-stone-200 dark:border-stone-700">
                    اليوم / الفترة
                  </th>
                  {TIME_SLOTS.map((slot) => (
                    <th
                      key={slot.start}
                      className="p-2.5 text-center border-l border-stone-200 dark:border-stone-700 min-w-[95px]"
                    >
                      <div className="font-bold">{slot.label}</div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {slot.start} - {slot.end}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-xs">
                {DAY_ORDER.slice(0, 6).map((day) => {
                  const isToday = day === todayDay;
                  const dayClasses = classes.filter((c) => c.day === day);
                  const info = getDayEndInfo(day, settings.commuteMinutes);

                  return (
                    <tr
                      key={day}
                      className={`hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors ${
                        isToday ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      {/* Day Label & Arrival */}
                      <td className="p-3 border-l-2 border-stone-300 dark:border-stone-700 text-center font-bold bg-stone-50 dark:bg-stone-800/50">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-sm font-black text-stone-900 dark:text-white">
                            {ARABIC_DAYS[day]}
                          </span>
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium flex items-center justify-center gap-1">
                          <span>الوصول:</span>
                          <strong>{info.homeArrival}</strong>
                        </div>
                      </td>

                      {/* Period Cells */}
                      {TIME_SLOTS.map((slot) => {
                        const matchingClass = dayClasses.find(
                          (c) => c.startTime === slot.start && c.endTime === slot.end
                        );

                        // Lunch break
                        if (slot.start === '12:15' && slot.end === '13:15') {
                          return (
                            <td
                              key={slot.start}
                              className="p-1 border-l border-stone-200 dark:border-stone-800 text-center bg-stone-100/60 dark:bg-stone-800/30 text-[10px] text-stone-400 font-medium"
                            >
                              استراحة غداء
                            </td>
                          );
                        }

                        // Beyond school end
                        const slotStartMins = parseMinutes(slot.start);
                        const endMins = parseMinutes(info.schoolEnd);
                        const isAfterSchool = slotStartMins >= endMins;

                        if (isAfterSchool) {
                          return (
                            <td
                              key={slot.start}
                              className="p-1 border-l border-stone-200 dark:border-stone-800 text-center bg-emerald-50/30 dark:bg-emerald-950/10 text-[10px] text-emerald-800/60 dark:text-emerald-400/60"
                            >
                              في المنزل
                            </td>
                          );
                        }

                        return (
                          <td
                            key={slot.start}
                            className="p-1.5 border-l border-stone-200 dark:border-stone-800 text-center align-middle"
                          >
                            {matchingClass ? (
                              <div
                                onClick={() => handleOpenEdit(matchingClass)}
                                className="group relative p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:shadow-md cursor-pointer transition-all"
                                style={{
                                  borderRightColor: matchingClass.color || '#0369a1',
                                  borderRightWidth: '4px',
                                }}
                              >
                                <div className="font-bold text-stone-900 dark:text-white truncate">
                                  {matchingClass.subject}
                                </div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                                  {matchingClass.classroom || 'إعدادية'}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAdd(day, slot.start, slot.end)}
                                className="w-full h-12 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-stone-400 hover:text-emerald-700 flex items-center justify-center transition-all opacity-40 hover:opacity-100"
                                title="إضافة حصة"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW: Single Day View */
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {DAY_ORDER.slice(0, 6).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedDay === day
                    ? 'bg-[#0F382A] text-amber-300 border-emerald-950 shadow-sm'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
                }`}
              >
                {ARABIC_DAYS[day]}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-black text-lg text-stone-900 dark:text-white">
                حصص يوم {ARABIC_DAYS[selectedDay]}
              </h3>
              <button
                onClick={() => handleOpenAdd(selectedDay)}
                className="px-3 py-1.5 bg-[#0F382A] text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> إضافة مادة
              </button>
            </div>

            <div className="space-y-2.5">
              {classes
                .filter((c) => c.day === selectedDay)
                .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime))
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-10 rounded-full"
                        style={{ backgroundColor: c.color || '#0369a1' }}
                      ></div>
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-white">
                          {c.subject}
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                          <span>
                            {c.startTime} - {c.endTime}
                          </span>
                          {c.classroom && <span>• {c.classroom}</span>}
                          {c.teacher && <span>• {c.teacher}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border-2 border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-black text-lg text-stone-900 dark:text-white">
                تعديل الحصة الدراسية
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  اليوم
                </label>
                <select
                  value={editingClass.day}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, day: e.target.value as DayOfWeek })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                >
                  {DAY_ORDER.slice(0, 6).map((day) => (
                    <option key={day} value={day}>
                      {ARABIC_DAYS[day]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    وقت البدء
                  </label>
                  <input
                    type="time"
                    value={editingClass.startTime}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, startTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    وقت الانتهاء
                  </label>
                  <input
                    type="time"
                    value={editingClass.endTime}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, endTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 mb-1">
                  المادة الدراسية
                </label>
                <input
                  type="text"
                  placeholder="مثال: رياضيات، فرنسية، علوم فيزيائية"
                  value={editingClass.subject}
                  onChange={(e) =>
                    setEditingClass({ ...editingClass, subject: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    القاعة / المخبر
                  </label>
                  <input
                    type="text"
                    placeholder="قاعة 4"
                    value={editingClass.classroom || ''}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, classroom: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 mb-1">
                    الأستاذ(ة)
                  </label>
                  <input
                    type="text"
                    placeholder="أ. الشريف"
                    value={editingClass.teacher || ''}
                    onChange={(e) =>
                      setEditingClass({ ...editingClass, teacher: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-between gap-3 border-t border-stone-200 dark:border-stone-800">
                {classes.some((c) => c.id === editingClass.id) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingClass.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                )}
                <div className="flex gap-2 mr-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0F382A] hover:bg-emerald-900 text-amber-300 rounded-xl font-bold flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> حفظ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
