import React, { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, ShieldCheck, LogOut, Sun, Moon, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerificationScreen({ user, theme, toggleTheme, handleLogout }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await sendEmailVerification(user);
      setMessage('تم إرسال رابط التفعيل مرة أخرى بنجاح! يرجى فحص صندوق الوارد (أو البريد المهمل/Spam).');
    } catch (err) {
      console.error(err);
      setError('فشل في إرسال البريد. قد تكون أرسلت طلباً منذ قليل، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Reload the current user to get the latest emailVerified status from Firebase Auth
      await user.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser && updatedUser.emailVerified) {
        // Reloading the window is the most reliable way to let App.jsx refresh the state
        window.location.reload();
      } else {
        setError('يبدو أنك لم تقم بتفعيل الحساب بعد. يرجى الضغط على رابط التفعيل المرسل إلى بريدك الإلكتروني.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء فحص حالة التفعيل، يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 academic-bg font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button 
          type="button" 
          onClick={toggleTheme} 
          className="p-3 bg-white/95 dark:bg-[#09171a]/95 border-2 border-[#0e5e6f] rounded-full hover:scale-105 transition shadow-md"
        >
          {theme === 'dark' ? <Sun size={20} className="text-[#bfebd4]" /> : <Moon size={20} className="text-[#0e5e6f]" />}
        </button>
      </div>

      <div className="glass-premium w-full max-w-lg p-8 rounded-3xl z-10 fade-in border-4 border-[#0e5e6f]/45 dark:border-[#bfebd4]/20 text-center">
        
        {/* Verification Icon Container */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#0e5e6f] to-[#bfebd4] rounded-full p-0.5 shadow-2xl mb-6 flex items-center justify-center">
          <div className="w-full h-full bg-white dark:bg-[#09171a] rounded-full flex items-center justify-center">
            <Mail size={44} className="text-[#0e5e6f] dark:text-[#bfebd4] animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-[#0e5e6f] dark:text-[#bfebd4] leading-tight mb-2">
          تفعيل الحساب الأكاديمي
        </h1>
        <p className="text-[#0e5e6f]/90 dark:text-[#bfebd4]/90 font-bold text-sm mb-6">
          بوابة طلاب معهد طيبة
        </p>

        {/* Message Alert Boxes */}
        {message && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl mb-6 text-xs md:text-sm font-black flex items-center gap-2.5 text-right">
            <CheckCircle className="shrink-0 text-emerald-600" size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 px-4 py-3 rounded-xl mb-6 text-xs md:text-sm font-black flex items-center gap-2.5 text-right">
            <AlertCircle className="shrink-0 text-rose-600" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Informative Text */}
        <div className="bg-white/60 dark:bg-[#0d2328]/60 p-5 rounded-2xl border border-[#82af96] dark:border-[#3c6550] mb-8 text-right space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-[#f0f7f4]">
            مرحباً بك! لقد أرسلنا رسالة تفعيل وتأكيد إلى بريدك الإلكتروني الموفر:
          </p>
          <p className="text-xs font-black text-[#0e5e6f] dark:text-[#bfebd4] bg-[#bfebd4]/20 px-3 py-2 rounded-lg text-center break-all font-mono">
            {user?.email}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
            * يرجى فتح بريدك والضغط على رابط التفعيل المرفق بالرسالة لتأكيد قيدك وتفعيل حسابك بالبوابة.
            <br />
            * إذا لم تجد الرسالة، تفقد مجلد البريد المهمل أو غير الهام (Junk/Spam).
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleCheckVerification}
            className="w-full btn-primary text-white font-extrabold py-3.5 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-2"
          >
            {loading ? 'جاري الفحص...' : 'لقد قمت بالتفعيل، دخّلني!'}
            <ShieldCheck size={18} />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleResend}
            className="w-full bg-[#bfebd4]/30 hover:bg-[#bfebd4]/50 dark:bg-[#2c5e43]/30 dark:hover:bg-[#2c5e43]/50 text-[#0e5e6f] dark:text-[#bfebd4] font-black py-3 px-4 rounded-xl text-center border border-[#82af96] dark:border-[#3c6550] transition text-sm"
          >
            إعادة إرسال رابط التفعيل
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-2.5 rounded-xl transition-colors font-black text-xs"
          >
            <LogOut size={16} />
            تسجيل الخروج والعودة لشاشة الدخول
          </button>
        </div>

      </div>
    </div>
  );
}
