import { DayOfWeek, RoutineItem, PrayerTimeData, HomeworkItem, UserSettings } from '../types';
import { parseMinutes, formatMinutesToTime } from './arabicDates';

export interface DayScheduleSummary {
  day: DayOfWeek;
  schoolEnd: string;
  homeArrival: string;
  isSchoolDay: boolean;
  availableStudyMinutesBeforeTaki: number; // between home arrival and 19:30, minus prayer and rest
  hasTakiSession: boolean; // Always true
  takiStart: string; // "19:30"
  takiEnd: string;   // "21:00"
}

export function getDayEndInfo(day: DayOfWeek, commuteMinutes: number = 15): DayScheduleSummary {
  const schoolScheduleMap: Record<DayOfWeek, { end: string; isSchool: boolean }> = {
    monday: { end: '15:15', isSchool: true },
    tuesday: { end: '17:15', isSchool: true },
    wednesday: { end: '14:15', isSchool: true },
    thursday: { end: '17:15', isSchool: true },
    friday: { end: '12:15', isSchool: true },
    saturday: { end: '12:15', isSchool: true },
    sunday: { end: '00:00', isSchool: false },
  };

  const dayInfo = schoolScheduleMap[day];
  let homeArrivalMinutes = 0;
  let homeArrivalStr = '12:30';

  if (dayInfo.isSchool) {
    const endMinutes = parseMinutes(dayInfo.end);
    homeArrivalMinutes = endMinutes + commuteMinutes;
    homeArrivalStr = formatMinutesToTime(homeArrivalMinutes);
  } else {
    homeArrivalStr = 'المنزل (عطلة)';
    homeArrivalMinutes = parseMinutes('09:00'); // Awake at home
  }

  const takiStartMinutes = parseMinutes('19:30'); // 1170 mins
  // buffer for rest, lunch/snack (30 mins) and Maghrib prayer (20 mins) = 50 mins
  let studyWindow = Math.max(0, takiStartMinutes - homeArrivalMinutes - 50);
  if (!dayInfo.isSchool) {
    studyWindow = 300; // ample time on Sunday
  }

  return {
    day,
    schoolEnd: dayInfo.end,
    homeArrival: homeArrivalStr,
    isSchoolDay: dayInfo.isSchool,
    availableStudyMinutesBeforeTaki: studyWindow,
    hasTakiSession: true,
    takiStart: '19:30',
    takiEnd: '21:00',
  };
}

export function generateDailyRoutine(
  day: DayOfWeek,
  prayers: PrayerTimeData,
  settings: UserSettings,
  homeworks: HomeworkItem[] = []
): RoutineItem[] {
  const summary = getDayEndInfo(day, settings.commuteMinutes);
  const routine: RoutineItem[] = [];

  // 1. الاستيقاظ وصلاة الفجر
  routine.push({
    id: 'r-wake',
    title: 'الاستيقاظ والنشاط وأذكار الاستيقاظ',
    timeRange: `${settings.wakeUpTime} - 05:45`,
    category: 'routine',
    completed: false,
    description: '«الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور» والوضوء بماء منعش',
    isFixed: true,
  });

  routine.push({
    id: 'r-fajr',
    title: `صلاة الفجر في وقتها (${prayers.fajr})`,
    timeRange: `${prayers.fajr} - 06:05`,
    category: 'prayer',
    completed: false,
    description: 'سنة الفجر ركعتان خير من الدنيا وما فيها، ثم صلاة الفجر',
    isFixed: true,
    badge: 'صلاة',
  });

  // 2. ورد القرآن الصباحي
  routine.push({
    id: 'r-quran-morning',
    title: 'ورد القرآن الصباحي المبارك (10-15 دقيقة)',
    timeRange: '06:05 - 06:20',
    category: 'quran',
    completed: false,
    description: '«إن قرآن الفجر كان مشهودا» - قراءة صفحتين بتمعن وتدبر',
    badge: 'قرآن',
  });

  // 3. أذكار الصباح وفطور الصباح
  routine.push({
    id: 'r-adhkar-breakfast',
    title: 'أذكار الصباح وفطور صحي متوازن',
    timeRange: '06:20 - 07:15',
    category: 'routine',
    completed: false,
    description: 'تناول فطور غني بالطاقة ومراجعة خفيفة لدروس اليوم',
  });

  if (summary.isSchoolDay) {
    // 4. الانطلاق إلى الإعدادية
    routine.push({
      id: 'r-commute-to-school',
      title: 'ارتداء المئزر والانطلاق إلى المدرسة',
      timeRange: '07:30 - 08:00',
      category: 'school',
      completed: false,
      description: `التنقل نحو المعهد (${settings.commuteMinutes} دقيقة) والوصول قبل جرس 08:15`,
    });

    // 5. الدوام المدرسي
    routine.push({
      id: 'r-school-classes',
      title: `الحصص المدرسية في المعهد (حتى ${summary.schoolEnd})`,
      timeRange: `08:15 - ${summary.schoolEnd}`,
      category: 'school',
      completed: false,
      description: 'التركيز التام مع الأساتذة، تدوين الملاحظات والمشاركة الإيجابية',
      isFixed: true,
      badge: 'مدرسة',
    });

    // 6. العودة إلى المنزل
    routine.push({
      id: 'r-return-home',
      title: `العودة للمنزل (${summary.homeArrival}) والاستراحة`,
      timeRange: `${summary.schoolEnd} - ${summary.homeArrival}`,
      category: 'routine',
      completed: false,
      description: `تنقل مدته ${settings.commuteMinutes} دقيقة، خلع المئزر وغسل اليدين`,
    });

    // 7. الغداء / لمجة والصلوات
    const postArrivalMins = parseMinutes(summary.homeArrival);
    const restEndMins = postArrivalMins + 45;
    routine.push({
      id: 'r-lunch-rest',
      title: 'راحة، وجبة الغداء / لمجة وصلاة في وقتها',
      timeRange: `${summary.homeArrival} - ${formatMinutesToTime(restEndMins)}`,
      category: 'rest',
      completed: false,
      description: `أداء صلاة الظهر أو العصر (${prayers.asr}) حسب التوقيت الحالي وتناول وجبة مغذية`,
      badge: 'راحة وصلاة',
    });

    // 8. فترة المراجعة وحل الواجبات (قبل تقي أكاديمي!)
    const studyStartMins = restEndMins + 5;
    const studyEndMins = parseMinutes('19:15'); // 19:15
    const availableStudyMins = Math.max(0, studyEndMins - studyStartMins);

    if (availableStudyMins > 30) {
      const pendingCount = homeworks.filter(h => h.status !== 'completed').length;
      routine.push({
        id: 'r-study-before-taki',
        title: 'مراجعة الدروس وحل الواجبات المدرسية',
        timeRange: `${formatMinutesToTime(studyStartMins)} - 19:15`,
        category: 'study',
        completed: false,
        description: `التركيز على واجبات الغد (${availableStudyMins} دقيقة متاحة - ${pendingCount} واجبات متبقية). صلاة المغرب (${prayers.maghrib}) أثناء الفترة.`,
        badge: 'مراجعة',
      });
    }
  } else {
    // يوم عطلة (الأحد)
    routine.push({
      id: 'r-sunday-study',
      title: 'جلسة مراجعة مركزة وتلخيص الدروس',
      timeRange: '09:00 - 12:00',
      category: 'study',
      completed: false,
      description: 'مراجعة المواد الأساسية (الرياضيات، الفرنسية، العلوم الفيزيائية)',
    });
    routine.push({
      id: 'r-dhuhr-sun',
      title: `صلاة الظهر (${prayers.dhuhr}) وغداء عائلي`,
      timeRange: `${prayers.dhuhr} - 14:00`,
      category: 'prayer',
      completed: false,
    });
    routine.push({
      id: 'r-sunday-activity',
      title: 'نشاط بدني ورياضة ووقت العائلة',
      timeRange: '15:30 - 18:00',
      category: 'rest',
      completed: false,
      description: 'تنشيط الجسم، رياضة المشي أو كرة القدم، وبر الوالدين',
    });
  }

  // 9. الاستعداد لـ Taki Academy (تنبيه 15 دقيقة قبل الحصة)
  routine.push({
    id: 'r-taki-prep',
    title: '⏰ تنبيه: الاستعداد لمنصة Taki Academy',
    timeRange: '19:15 - 19:30',
    category: 'taki',
    completed: false,
    description: 'تجهيز الحاسوب أو اللوحي، الكراس وقلم التدوين، والتأكد من الاتصال بالإنترنت',
    badge: 'تنبيه مهم',
  });

  // 10. حصة Taki Academy الثابتة يومياً!
  routine.push({
    id: 'r-taki-session',
    title: '🌟 حصة Taki Academy المباشرة (التزام يومي ثابت)',
    timeRange: '19:30 - 21:00',
    category: 'taki',
    completed: false,
    description: 'حصة تفاعلية مميزة كل يوم دون استثناء عبر منصة تقي أكاديمي لمتابعة البرنامج والتميز',
    isFixed: true,
    badge: 'Taki Academy 90 دقيقة',
  });

  // 11. ما بعد 21:00: لا دراسة إضافية إلزامية!
  routine.push({
    id: 'r-post-taki-wrapup',
    title: `صلاة العشاء (${prayers.isha}) وتجهيز محفظة الغد`,
    timeRange: '21:00 - 21:30',
    category: 'routine',
    completed: false,
    description: 'أداء صلاة العشاء بخشوع، تجهيز الكتب والدفاتر حسب جدول الغد، عشاء خفيف',
    badge: 'ختام اليوم',
  });

  // 12. أذكار النوم وسورة الملك
  routine.push({
    id: 'r-sleep-prep',
    title: 'سورة الملك وأذكار النوم والوضوء',
    timeRange: '21:30 - 21:45',
    category: 'quran',
    completed: false,
    description: 'سورة الملك تنجي من عذاب القبر، أذكار النوم والنفث في الكفين',
    badge: 'سنة نبوية',
  });

  // 13. النوم المبكر
  routine.push({
    id: 'r-bedtime',
    title: `نوم هانئ ومبكر (الاستيقاظ ${settings.wakeUpTime})`,
    timeRange: `${settings.targetBedTime} - ${settings.wakeUpTime}`,
    category: 'sleep',
    completed: false,
    description: 'نيل قسط كافٍ من النوم (حوالي 8 ساعات) للنمو السليم والتركيز العالي في المدرسة',
    isFixed: true,
    badge: 'راحة ونوم',
  });

  return routine;
}

export interface WorkloadAnalysis {
  availableMinutesBeforeTaki: number;
  totalRequiredMinutes: number;
  isOverloaded: boolean;
  overloadDifferenceMinutes: number;
  recommendations: string[];
}

export function analyzeWorkloadForDay(
  day: DayOfWeek,
  homeworks: HomeworkItem[],
  commuteMinutes: number = 15
): WorkloadAnalysis {
  const summary = getDayEndInfo(day, commuteMinutes);
  const pendingItems = homeworks.filter(h => h.status !== 'completed');
  const totalRequired = pendingItems.reduce((acc, h) => acc + (h.estimatedMinutes || 30), 0);

  const available = summary.availableStudyMinutesBeforeTaki;
  const isOverloaded = totalRequired > available && summary.isSchoolDay;
  const overloadDiff = Math.max(0, totalRequired - available);

  const recommendations: string[] = [];

  if (isOverloaded) {
    recommendations.push(
      `لديك ${totalRequired} دقيقة واجبات بينما الوقت المتاح قبل Taki Academy هو ${available} دقيقة فقط (فائض بـ ${overloadDiff} دقيقة).`
    );
    recommendations.push(
      'لتجنب الإرهاق والسهر بعد 21:00، يُقترح تأجيل الواجبات غير العاجلة إلى يوم الأربعاء أو الجمعة أو عطلة نهاية الأسبوع.'
    );
    // Suggest postponing low priority
    const nonUrgent = pendingItems.filter(h => h.priority !== 'high');
    if (nonUrgent.length > 0) {
      recommendations.push(
        `يمكن ترحيل مهمة: "${nonUrgent[0].title}" (${nonUrgent[0].subject}) لجدول الغد.`
      );
    }
  } else {
    recommendations.push(
      `برنامجك اليوم متوازن وممتاز! لديك ${available} دقيقة متاحة تكفي لإنجاز جميع الواجبات المقررة (${totalRequired} دقيقة) قبل بدء حصة Taki Academy في 19:30.`
    );
  }

  return {
    availableMinutesBeforeTaki: available,
    totalRequiredMinutes: totalRequired,
    isOverloaded,
    overloadDifferenceMinutes: overloadDiff,
    recommendations,
  };
}
