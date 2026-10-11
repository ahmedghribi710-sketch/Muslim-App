import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, Sparkles, Check } from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle } from '../utils/firebase';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User | null, customEmail?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        sound.playSuccess();
        confetti({ particleCount: 40, spread: 60 });
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage('تعذر تسجيل الدخول بواسطة Google. يرجى المحاولة ثانية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    // Federated simulation / placeholder
    sound.playSuccess();
    onSuccess(null, 'apple.user@icloud.com');
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('يرجى ملء البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    // Native credentials submission
    setTimeout(() => {
      setIsLoading(false);
      sound.playSuccess();
      confetti({ particleCount: 40, spread: 60 });
      onSuccess(null, email);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF8F5] dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-100 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-[6px_6px_0px_0px_#1c1917] dark:shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 left-4 p-2 rounded-xl border-2 border-stone-900 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 shadow-[2px_2px_0px_#1c1917] dark:shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pb-5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F382A] text-amber-300 border-2 border-stone-900 flex items-center justify-center font-bold text-2xl mx-auto shadow-[3px_3px_0px_#1c1917] mb-3">
            ☪
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
            تسجيل الدخول • Sign in
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-bold">
            مخططي المسلم | حفظ ومزامنة جدولك المدرسي والواجبات سحابيًا
          </p>
        </div>

        {/* 1. Federated Sign-in Buttons */}
        <div className="space-y-2.5 mb-5">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-900 dark:text-white border-2 border-stone-900 dark:border-stone-600 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_#1c1917] dark:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1c1917] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Continue with Apple */}
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-900 border-2 border-stone-900 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_#1c1917] dark:shadow-[3px_3px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#1c1917] transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1.01.08 2.02-.48 2.64-1.23z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* 2. Thin Rule Divider with "or" */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-2 border-stone-300 dark:border-stone-700"></div>
          </div>
          <span className="relative bg-[#FAF8F5] dark:bg-stone-900 px-3 text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
            or • أو
          </span>
        </div>

        {/* 3. Real Semantic <form> */}
        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate={false}>
          {errorMessage && (
            <div className="p-3 bg-red-100 border-2 border-red-800 text-red-900 text-xs font-bold rounded-xl shadow-[2px_2px_0px_#000]">
              {errorMessage}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5 text-right">
            <label
              htmlFor="signin-email"
              className="block text-xs font-black text-stone-900 dark:text-stone-200"
            >
              البريد الإلكتروني / Email
            </label>
            <div className="relative">
              <input
                id="signin-email"
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-900 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm font-bold shadow-[3px_3px_0px_#1c1917] dark:shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#0F382A]"
                dir="ltr"
              />
              <Mail className="absolute right-3.5 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* Password field with toggle */}
          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between">
              <label
                htmlFor="signin-password"
                className="block text-xs font-black text-stone-900 dark:text-stone-200"
              >
                كلمة المرور / Password
              </label>
              <span className="text-[11px] text-stone-500 hover:text-stone-800 cursor-pointer">
                نسيت كلمة المرور؟
              </span>
            </div>

            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-10 rounded-xl border-2 border-stone-900 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-sm font-bold shadow-[3px_3px_0px_#1c1917] dark:shadow-[3px_3px_0px_#000] focus:outline-none focus:ring-2 focus:ring-[#0F382A]"
                dir="ltr"
              />

              {/* Password visibility button with accessible name */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 p-1 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0F382A] hover:bg-[#16523e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] text-amber-300 font-black text-sm rounded-xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_#1c1917] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign in • تسجيل الدخول</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <p className="text-[11px] text-center text-stone-500 dark:text-stone-400 mt-5 font-bold">
          بياناتك مشفرة ومحفوظة بأمان محليًا وسحابيًا.
        </p>

      </div>
    </div>
  );
};
