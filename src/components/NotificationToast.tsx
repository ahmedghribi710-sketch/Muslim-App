import React, { useEffect, useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  Cloud,
} from 'lucide-react';
import { ToastNotification, subscribeToToasts } from '../utils/notifications';
import { TakiAcademyLogo } from './TakiAcademyLogo';

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [toast, ...prev.slice(0, 3)]); // Keep max 4 toasts
    });
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => handleDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastNotification;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000); // Auto dismiss after 6 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'taki':
        return (
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 p-0.5 border border-sky-300 flex items-center justify-center shrink-0 shadow-sm">
            <TakiAcademyLogo variant="icon" size="xs" className="w-6 h-6" />
          </div>
        );
      case 'prayer':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'alert':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="pointer-events-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-2 border-stone-200/90 dark:border-stone-700/80 rounded-2xl p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.18),inset_1.5px_1.5px_3px_rgba(255,255,255,0.9)] flex items-start justify-between gap-3 animate-fade-in transition-all">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="font-black text-xs sm:text-sm text-stone-900 dark:text-white leading-tight">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-1 leading-snug break-words">
              {toast.message}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
        title="إغلاق الإشعار"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
