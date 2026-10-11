import { SchoolClass, HomeworkItem, ExamItem, UserSettings, AchievementBadge } from '../types';

export const DEFAULT_SCHOOL_CLASSES: SchoolClass[] = [
  // الاثنين (Monday: 08:15 to 15:15 -> home 15:30)
  { id: 'mon-1', day: 'monday', startTime: '08:15', endTime: '09:15', subject: 'عربية (قواعد)', classroom: 'قاعة 4', teacher: 'أ. المنصوري', color: '#15803d' },
  { id: 'mon-2', day: 'monday', startTime: '09:15', endTime: '10:15', subject: 'رياضيات (جبر)', classroom: 'قاعة 7', teacher: 'أ. الشريف', color: '#0369a1' },
  { id: 'mon-3', day: 'monday', startTime: '10:15', endTime: '11:15', subject: 'فرنسية', classroom: 'قاعة 4', teacher: 'أ. الغربي', color: '#b45309' },
  { id: 'mon-4', day: 'monday', startTime: '11:15', endTime: '12:15', subject: 'علوم الحياة والأرض', classroom: 'مخبر العلوم', teacher: 'أ. الطرابلسي', color: '#047857' },
  // Lunch 12:15 - 13:15
  { id: 'mon-5', day: 'monday', startTime: '13:15', endTime: '14:15', subject: 'تاريخ وجغرافيا', classroom: 'قاعة 2', teacher: 'أ. العبيدي', color: '#7c3aed' },
  { id: 'mon-6', day: 'monday', startTime: '14:15', endTime: '15:15', subject: 'تربية إسلامية', classroom: 'قاعة 2', teacher: 'أ. القروي', color: '#0f766e' },

  // الثلاثاء (Tuesday: 08:15 to 17:15 -> home 17:30)
  { id: 'tue-1', day: 'tuesday', startTime: '08:15', endTime: '09:15', subject: 'رياضيات (هندسة)', classroom: 'قاعة 7', teacher: 'أ. الشريف', color: '#0369a1' },
  { id: 'tue-2', day: 'tuesday', startTime: '09:15', endTime: '10:15', subject: 'علوم فيزيائية', classroom: 'مخبر الفيزياء', teacher: 'أ. بن صالح', color: '#4338ca' },
  { id: 'tue-3', day: 'tuesday', startTime: '10:15', endTime: '11:15', subject: 'إنجليزية', classroom: 'قاعة 6', teacher: 'أ. الهمامي', color: '#c2410c' },
  { id: 'tue-4', day: 'tuesday', startTime: '11:15', endTime: '12:15', subject: 'تربية مدنية', classroom: 'قاعة 3', teacher: 'أ. بن يوسف', color: '#4d7c0f' },
  // Lunch 12:15 - 14:15 or free
  { id: 'tue-5', day: 'tuesday', startTime: '14:15', endTime: '15:15', subject: 'فرنسية', classroom: 'قاعة 4', teacher: 'أ. الغربي', color: '#b45309' },
  { id: 'tue-6', day: 'tuesday', startTime: '15:15', endTime: '16:15', subject: 'تربية بدنية', classroom: 'الملعب', teacher: 'أ. الدراجي', color: '#be123c' },
  { id: 'tue-7', day: 'tuesday', startTime: '16:15', endTime: '17:15', subject: 'تربية بدنية', classroom: 'الملعب', teacher: 'أ. الدراجي', color: '#be123c' },

  // الأربعاء (Wednesday: 08:15 to 14:15 -> home 14:30)
  { id: 'wed-1', day: 'wednesday', startTime: '08:15', endTime: '09:15', subject: 'علوم الحياة والأرض', classroom: 'مخبر العلوم', teacher: 'أ. الطرابلسي', color: '#047857' },
  { id: 'wed-2', day: 'wednesday', startTime: '09:15', endTime: '10:15', subject: 'عربية (شرح نص)', classroom: 'قاعة 4', teacher: 'أ. المنصوري', color: '#15803d' },
  { id: 'wed-3', day: 'wednesday', startTime: '10:15', endTime: '11:15', subject: 'تكنولوجيا', classroom: 'ورشة التكنولوجيا', teacher: 'أ. الجزيري', color: '#0891b2' },
  { id: 'wed-4', day: 'wednesday', startTime: '11:15', endTime: '12:15', subject: 'تكنولوجيا', classroom: 'ورشة التكنولوجيا', teacher: 'أ. الجزيري', color: '#0891b2' },
  // Lunch 12:15 - 13:15
  { id: 'wed-5', day: 'wednesday', startTime: '13:15', endTime: '14:15', subject: 'إنجليزية', classroom: 'قاعة 6', teacher: 'أ. الهمامي', color: '#c2410c' },

  // الخميس (Thursday: 08:15 to 17:15 -> home 17:30)
  { id: 'thu-1', day: 'thursday', startTime: '08:15', endTime: '09:15', subject: 'رياضيات (تمارين)', classroom: 'قاعة 7', teacher: 'أ. الشريف', color: '#0369a1' },
  { id: 'thu-2', day: 'thursday', startTime: '09:15', endTime: '10:15', subject: 'فرنسية', classroom: 'قاعة 4', teacher: 'أ. الغربي', color: '#b45309' },
  { id: 'thu-3', day: 'thursday', startTime: '10:15', endTime: '11:15', subject: 'علوم فيزيائية', classroom: 'مخبر الفيزياء', teacher: 'أ. بن صالح', color: '#4338ca' },
  { id: 'thu-4', day: 'thursday', startTime: '11:15', endTime: '12:15', subject: 'إعلامية', classroom: 'قاعة الإعلامية', teacher: 'أ. الزواوي', color: '#6366f1' },
  // Lunch 12:15 - 14:15
  { id: 'thu-5', day: 'thursday', startTime: '14:15', endTime: '15:15', subject: 'عربية (إنشاء)', classroom: 'قاعة 4', teacher: 'أ. المنصوري', color: '#15803d' },
  { id: 'thu-6', day: 'thursday', startTime: '15:15', endTime: '16:15', subject: 'تاريخ وجغرافيا', classroom: 'قاعة 2', teacher: 'أ. العبيدي', color: '#7c3aed' },
  { id: 'thu-7', day: 'thursday', startTime: '16:15', endTime: '17:15', subject: 'تربية تشكيلية', classroom: 'قاعة الرسم', teacher: 'أ. بوشناق', color: '#d97706' },

  // الجمعة (Friday: 08:15 to 12:15 -> home 12:30)
  { id: 'fri-1', day: 'friday', startTime: '08:15', endTime: '09:15', subject: 'عربية (قراءة ومطالعة)', classroom: 'قاعة 4', teacher: 'أ. المنصوري', color: '#15803d' },
  { id: 'fri-2', day: 'friday', startTime: '09:15', endTime: '10:15', subject: 'رياضيات', classroom: 'قاعة 7', teacher: 'أ. الشريف', color: '#0369a1' },
  { id: 'fri-3', day: 'friday', startTime: '10:15', endTime: '11:15', subject: 'علوم فيزيائية', classroom: 'مخبر الفيزياء', teacher: 'أ. بن صالح', color: '#4338ca' },
  { id: 'fri-4', day: 'friday', startTime: '11:15', endTime: '12:15', subject: 'إنجليزية', classroom: 'قاعة 6', teacher: 'أ. الهمامي', color: '#c2410c' },

  // السبت (Saturday: 08:15 to 12:15 -> home 12:30)
  { id: 'sat-1', day: 'saturday', startTime: '08:15', endTime: '09:15', subject: 'رياضيات', classroom: 'قاعة 7', teacher: 'أ. الشريف', color: '#0369a1' },
  { id: 'sat-2', day: 'saturday', startTime: '09:15', endTime: '10:15', subject: 'فرنسية', classroom: 'قاعة 4', teacher: 'أ. الغربي', color: '#b45309' },
  { id: 'sat-3', day: 'saturday', startTime: '10:15', endTime: '11:15', subject: 'علوم الحياة والأرض', classroom: 'مخبر العلوم', teacher: 'أ. الطرابلسي', color: '#047857' },
  { id: 'sat-4', day: 'saturday', startTime: '11:15', endTime: '12:15', subject: 'تربية موسيقية', classroom: 'قاعة الموسيقى', teacher: 'أ. الحجري', color: '#0284c7' },
];

export const TIME_SLOTS = [
  { start: '08:15', end: '09:15', label: 'الحصة 1' },
  { start: '09:15', end: '10:15', label: 'الحصة 2' },
  { start: '10:15', end: '11:15', label: 'الحصة 3' },
  { start: '11:15', end: '12:15', label: 'الحصة 4' },
  { start: '12:15', end: '13:15', label: 'استراحة منتصف النهار' },
  { start: '13:15', end: '14:15', label: 'الحصة 5' },
  { start: '14:15', end: '15:15', label: 'الحصة 6' },
  { start: '15:15', end: '16:15', label: 'الحصة 7' },
  { start: '16:15', end: '17:15', label: 'الحصة 8' },
];

export const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: 'hw-1',
    subject: 'رياضيات',
    title: 'تمارين الكتاب المدرسي ص 42 (الأعداد الكسرية)',
    description: 'حل التمارين 3 و 5 و 8 من محور الأعداد النسبية والكسرية',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'high',
    estimatedMinutes: 35,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-2',
    subject: 'فرنسية',
    title: 'Production écrite: Décrire un lieu historique',
    description: 'Rédiger 10 lignes sur la Médina de Tunis ou Carthage',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    estimatedMinutes: 30,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'hw-3',
    subject: 'علوم فيزيائية',
    title: 'مراجعة درس التيار الكهربائي المستمر',
    description: 'رسم الدارة الكهربائية وحفظ القواعد',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'medium',
    estimatedMinutes: 25,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'exam-1',
    subject: 'رياضيات',
    title: 'فرض مراقبة عدد 1 في الجبر والهندسة',
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    syllabus: 'الأعداد الكسرية، العمليات، والتوازي والتعامد',
    completed: false,
  },
  {
    id: 'exam-2',
    subject: 'علوم الحياة والأرض',
    title: 'فرض مراقبة عدد 1',
    date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    syllabus: 'التنفس عند الإنسان والتغذية',
    completed: false,
  },
  {
    id: 'exam-3',
    subject: 'عربية',
    title: 'فرض مراقبة في دراسة النص والإنشاء',
    date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    syllabus: 'محور الطبيعة وأساليب الإنشاء التعبيرية',
    completed: false,
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  studentName: 'أحمد',
  wakeUpTime: '05:30',
  targetBedTime: '21:45',
  commuteMinutes: 15,
  selectedCity: 'تونس العاصمة',
  prayerCalcMethod: 'tunisia',
  enableAudioNotifications: true,
  enableTakiAlert: true,
  weakSubjects: ['رياضيات', 'فرنسية'],
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  theme: 'light',
  visualStyle: 'claymorphism',
};

export const INITIAL_BADGES: AchievementBadge[] = [
  { id: 'b-fajr', title: 'حارس الفجر', description: 'أداء صلاة الفجر في وقتها 3 أيام متتالية', icon: 'Sun', unlocked: true, unlockedAt: '2026-10-09', xpValue: 50 },
  { id: 'b-quran', title: 'صاحب القرآن', description: 'قراءة الورد اليومي لـ 5 أيام متتالية', icon: 'BookOpen', unlocked: true, unlockedAt: '2026-10-10', xpValue: 75 },
  { id: 'b-taki', title: 'نجم Taki Academy', description: 'حضور حصة تقي أكاديمي اليومية دون انقطاع', icon: 'GraduationCap', unlocked: true, unlockedAt: '2026-10-11', xpValue: 100 },
  { id: 'b-hw', title: 'فارس الواجبات', description: 'إنجاز جميع واجبات اليوم قبل موعد Taki Academy', icon: 'CheckCircle2', unlocked: false, xpValue: 60 },
  { id: 'b-focus', title: 'سيد التركيز', description: 'إتمام 4 جلسات دراسة بومودورو مركزة', icon: 'Timer', unlocked: false, xpValue: 80 },
  { id: 'b-sleep', title: 'النوم المبكر المبارك', description: 'النوم في الوقت المستهدف (قبل 22:00) والاستيقاظ 05:30', icon: 'Moon', unlocked: true, unlockedAt: '2026-10-10', xpValue: 40 },
];

export const QURAN_SURAHS = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', versesCount: 7, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3' },
  { number: 36, name: 'يس', englishName: 'Yaseen', versesCount: 83, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/36.mp3' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', versesCount: 78, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/55.mp3' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', versesCount: 96, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/56.mp3' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', versesCount: 30, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/67.mp3' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', versesCount: 110, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/18.mp3' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', versesCount: 4, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/112.mp3' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', versesCount: 5, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/113.mp3' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', versesCount: 6, audioUrl: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/114.mp3' }
];

export const MORNING_EVENING_ADHKAR = [
  {
    id: 'adhkar-1',
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 1,
    type: 'morning'
  },
  {
    id: 'adhkar-2',
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 1,
    type: 'evening'
  },
  {
    id: 'adhkar-3',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ (100 مرة: حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ)',
    count: 100,
    type: 'both'
  },
  {
    id: 'adhkar-4',
    text: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    count: 3,
    type: 'both'
  },
  {
    id: 'adhkar-5',
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    count: 1,
    type: 'morning'
  },
  {
    id: 'adhkar-6',
    text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيًّا',
    count: 3,
    type: 'both'
  }
];
