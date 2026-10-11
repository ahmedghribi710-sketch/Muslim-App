import React, { useRef, useState } from 'react';
import {
  FileDown,
  Printer,
  X,
  Check,
  Calendar,
  Clock,
  GraduationCap,
  Sparkles,
  Compass,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SchoolClass, UserSettings, PrayerTimeData, RoutineItem } from '../types';
import { ARABIC_DAYS, DAY_ORDER, formatGregorianArabic, formatHijriArabic } from '../utils/arabicDates';
import { TIME_SLOTS } from '../utils/defaultData';
import { getDayEndInfo } from '../utils/smartScheduler';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  settings: UserSettings;
  prayers: PrayerTimeData;
  routine: RoutineItem[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  classes,
  settings,
  prayers,
  routine,
}) => {
  const [docType, setDocType] = useState<'schedule' | 'routine' | 'full'>('schedule');
  const [isGenerating, setIsGenerating] = useState(false);
  const printSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printSheetRef.current) return;
    setIsGenerating(true);

    try {
      const element = printSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const isLandscape = docType === 'schedule' || docType === 'full';
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page or scale to fit
        const ratio = pdfHeight / imgHeight;
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth * ratio, pdfHeight);
      }

      const fileName =
        docType === 'schedule'
          ? `الجدول_المدرسي_${settings.studentName}_8_أساسي.pdf`
          : docType === 'routine'
          ? `الروتين_اليومي_${settings.studentName}_8_أساسي.pdf`
          : `المخطط_الشامل_${settings.studentName}_8_أساسي.pdf`;

      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to window.print
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 border-2 border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F382A] text-amber-50 p-4 sm:p-5 flex items-center justify-between border-b-2 border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-lg shadow-sm">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                تصدير وطباعة المستندات بصيغة PDF
              </h3>
              <p className="text-xs text-emerald-200">
                وثيقة عالية الجودة مجهزة للطباعة مقاس A4 لتثبيتها في غرفتك أو محفظتك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-emerald-900/60 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options & Action Bar */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3">
          
          {/* Document selection */}
          <div className="flex bg-white dark:bg-stone-900 p-1 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold">
            <button
              onClick={() => setDocType('schedule')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === 'schedule'
                  ? 'bg-[#0F382A] text-amber-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              الجدول المدرسي الأسبوعي
            </button>
            <button
              onClick={() => setDocType('routine')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === 'routine'
                  ? 'bg-[#0F382A] text-amber-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              الروتين اليومي المتوازن
            </button>
            <button
              onClick={() => setDocType('full')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === 'full'
                  ? 'bg-[#0F382A] text-amber-300 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              المخطط الشامل (الجدول + الروتين)
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={handleBrowserPrint}
              className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              title="طباعة عبر الطابعة أو حفظ كـ PDF عبر المتصفح"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقية</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#0F382A] hover:bg-emerald-900 active:scale-95 text-amber-300 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                  <span>جارٍ إنشاء ملف PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>تحميل ملف PDF مباشر</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Document Preview Container (Styled explicitly for crisp PDF rendering) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-200/60 dark:bg-stone-950/60 flex justify-center">
          
          <div
            ref={printSheetRef}
            className="bg-white text-stone-900 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-4xl border border-stone-300 font-sans"
            style={{ minHeight: '600px' }}
          >
            
            {/* Sheet Official Header */}
            <div className="border-b-2 border-stone-800 pb-4 mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#0F382A]">
                    مخططي المسلم | Muslim Student Planner
                  </span>
                  <span className="text-[11px] bg-stone-100 text-stone-800 border border-stone-400 px-2 py-0.5 rounded-full font-bold">
                    السنة الثامنة أساسي • تونس
                  </span>
                </div>
                <div className="text-xs text-stone-600 flex items-center gap-3">
                  <span>الطالب: <strong>{settings.studentName}</strong></span>
                  <span>•</span>
                  <span>المدينة: <strong>{settings.selectedCity}</strong></span>
                  <span>•</span>
                  <span>تاريخ الطباعة: {formatGregorianArabic(new Date())}</span>
                </div>
              </div>

              {/* Taki Badge on PDF Header */}
              <div className="text-left bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
                <div className="text-[11px] font-black text-indigo-900 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Taki Academy يوميًا</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-indigo-700">
                  19:30 – 21:00
                </div>
              </div>
            </div>

            {/* Document Content: TIMETABLE */}
            {(docType === 'schedule' || docType === 'full') && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0F382A]" />
                    <span>الجدول المدرسي الأسبوعي ومواعيد العودة للمنزل</span>
                  </h4>
                  <span className="text-[10px] text-stone-500">مدة التنقل: {settings.commuteMinutes} دقيقة</span>
                </div>

                <div className="overflow-x-auto border-2 border-stone-800 rounded-lg">
                  <table className="w-full text-center border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-stone-100 border-b border-stone-800 text-stone-900 font-bold">
                        <th className="p-1.5 border-l border-stone-300 w-20">اليوم</th>
                        {TIME_SLOTS.map((s) => (
                          <th key={s.start} className="p-1 border-l border-stone-300">
                            <div>{s.label}</div>
                            <div className="font-mono text-[9px] text-stone-500">{s.start}-{s.end}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {DAY_ORDER.slice(0, 6).map((day) => {
                        const dayClasses = classes.filter((c) => c.day === day);
                        const info = getDayEndInfo(day, settings.commuteMinutes);

                        return (
                          <tr key={day} className="h-10">
                            <td className="p-1 border-l border-stone-300 font-bold bg-stone-50 text-[10px]">
                              <div>{ARABIC_DAYS[day]}</div>
                              <div className="text-[8px] text-emerald-800 font-bold">
                                وصول: {info.homeArrival}
                              </div>
                            </td>
                            {TIME_SLOTS.map((slot) => {
                              if (slot.start === '12:15' && slot.end === '13:15') {
                                return (
                                  <td key={slot.start} className="p-0.5 border-l border-stone-200 bg-stone-50 text-stone-400 text-[8px]">
                                    غداء
                                  </td>
                                );
                              }

                              const matching = dayClasses.find(
                                (c) => c.startTime === slot.start && c.endTime === slot.end
                              );

                              return (
                                <td key={slot.start} className="p-0.5 border-l border-stone-200 align-middle">
                                  {matching ? (
                                    <div className="p-1 rounded bg-stone-50 border border-stone-300 font-bold text-stone-900">
                                      <div className="truncate">{matching.subject}</div>
                                      <div className="text-[8px] text-stone-500">{matching.classroom || ''}</div>
                                    </div>
                                  ) : (
                                    <span className="text-stone-300">-</span>
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

                {/* Taki Academy Notice in Table */}
                <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-[10px] text-indigo-950 font-bold">
                  <span>★ حصة Taki Academy المباشرة: كل يوم من الاثنين إلى الأحد من 19:30 إلى 21:00 (تنبيه التحضير 19:15)</span>
                  <span>الواجبات تنجز قبل 19:30</span>
                </div>
              </div>
            )}

            {/* Document Content: ROUTINE */}
            {(docType === 'routine' || docType === 'full') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0F382A]" />
                    <span>خريطة الروتين اليومي المنظم وقواعد النجاح</span>
                  </h4>
                  <span className="text-[10px] text-stone-600">
                    استيقاظ: {settings.wakeUpTime} • نوم: {settings.targetBedTime}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {routine.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded-lg border flex items-start gap-2 ${
                        item.category === 'taki'
                          ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-950'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <span className="font-mono font-bold text-[9px] bg-white border border-stone-300 px-1 rounded shrink-0">
                        {item.timeRange}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[9px] text-stone-500 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Islamic Quote and Student Commitment */}
            <div className="mt-5 pt-3 border-t border-stone-300 flex items-center justify-between text-[9px] text-stone-500">
              <span className="font-quran text-[11px] text-stone-700">
                «وَقُل رَّبِّ زِدْنِي عِلْمًا» • «إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ»
              </span>
              <span>تطبيق مخططي المسلم • بالتوفيق والتميز دائمًا بإذن الله</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
