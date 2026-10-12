/**
 * Notification Service for Muslim Student Planner & Taki Academy
 * Supports Web Notifications API (Browser Desktop / Mobile Alerts)
 * and in-app Toast notifications with audio feedback.
 */

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'alert' | 'taki' | 'prayer';
  timestamp: number;
}

type ToastListener = (toast: ToastNotification) => void;
const toastListeners = new Set<ToastListener>();

export function subscribeToToasts(listener: ToastListener) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Browser Notifications are not supported in this environment.');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendAppNotification('تم تفعيل الإشعارات بنجاح! 🔔', {
        body: 'ستصلك تنبيهات مواقيت الصلاة، حصة Taki Academy، ومؤقت بومودورو في وقتها.',
        type: 'success',
      });
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  type?: 'info' | 'success' | 'alert' | 'taki' | 'prayer';
  silent?: boolean;
}

/**
 * Sends a notification via both Browser Notifications API (if permitted)
 * and in-app Toast Banner for guaranteed delivery.
 */
export function sendAppNotification(title: string, options: NotificationOptions = {}) {
  const {
    body = '',
    icon = '/taki-academy-logo.svg',
    tag,
    type = 'info',
  } = options;

  // 1. Dispatch in-app Toast
  const toastItem: ToastNotification = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    message: body,
    type,
    timestamp: Date.now(),
  };

  toastListeners.forEach((listener) => listener(toastItem));

  // 2. Dispatch Browser Web Notification if permitted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon,
        tag: tag || 'muslim-student-planner',
        dir: 'rtl',
        lang: 'ar',
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      // Browser notification may be blocked inside some iframes
    }
  }
}

// Preset helpers
export const notifyTakiAcademyPrep = (diffMins: number = 15) => {
  sendAppNotification('⏰ تذكير Taki Academy: اقترب موعد الحصة!', {
    body: `تبدأ حصة تقي أكاديمي بعد ${diffMins} دقيقة (19:30). جهّز حاسوبك، كراسك، ومنصتك الآن.`,
    type: 'taki',
    tag: 'taki-prep',
  });
};

export const notifyTakiAcademyStarted = () => {
  sendAppNotification('★ بدأت الآن حصة Taki Academy المباشرة!', {
    body: 'الحصة جارية الآن حتى 21:00. ركّز جيدًا ولا تنشغل بأي مهمة أخرى.',
    type: 'taki',
    tag: 'taki-active',
  });
};

export const notifyPrayerTime = (prayerName: string) => {
  sendAppNotification(`🕌 حان الآن موعد أذان ${prayerName}`, {
    body: `حي على الصلاة، حي على الفلاح. وقت صلاة ${prayerName} حسب التوقيت التونسي المعتمد.`,
    type: 'prayer',
    tag: `prayer-${prayerName}`,
  });
};

export const notifyPomodoroComplete = (mode: 'work' | 'break', minutes: number) => {
  if (mode === 'work') {
    sendAppNotification('🎉 أحسنت! انتهت جلسة المذاكرة', {
      body: `أتممت ${minutes} دقيقة من التركيز الفائق. خذ استراحة قصيرة لتجديد طاقتك.`,
      type: 'success',
      tag: 'pomodoro-work-done',
    });
  } else {
    sendAppNotification('⚡ انتهت الاستراحة!', {
      body: 'استعد للعودة إلى جلسة التركيز والمذاكرة بهمة ونشاط.',
      type: 'info',
      tag: 'pomodoro-break-done',
    });
  }
};

export const notifyBedtime = (targetBedTime: string) => {
  sendAppNotification('🌙 حان وقت النوم المبكر المبارك', {
    body: `الموعد المستهدف للنوم هو ${targetBedTime}. احرص على راحة عينيك ودماغك لتستيقظ نشيطًا لصلاة الفجر والدراسة.`,
    type: 'alert',
    tag: 'bedtime',
  });
};

export const notifyFirebaseSynced = () => {
  sendAppNotification('☁️ تم تحديث ومزامنة البيانات في Firebase', {
    body: 'تم حفظ كافة بياناتك وتقدمك الدراسي بنجاح على السحابة.',
    type: 'success',
    tag: 'firebase-sync',
  });
};

export const notifyDailyChallengePrompt = (title: string, xpReward: number) => {
  sendAppNotification(`🎯 تحدي اليوم الجديد بانتظارك! (+${xpReward} XP)`, {
    body: `${title}. أنجزه اليوم واكسب نقاط خبرة إضافية لرفع مستواك!`,
    type: 'taki',
    tag: 'daily-challenge-prompt',
  });
};

export const notifyDailyChallengeCompleted = (title: string, xpAwarded: number) => {
  sendAppNotification(`🏆 مبارك! تم إنجاز تحدي اليوم بنجاح (+${xpAwarded} XP)`, {
    body: `أتممت تحدي: "${title}". تمت إضافة ${xpAwarded} نقطة خبرة إضافية إلى رصيدك!`,
    type: 'success',
    tag: 'daily-challenge-completed',
  });
};
