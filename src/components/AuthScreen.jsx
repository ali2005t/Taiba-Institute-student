import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../firebase';
import { COHORTS, MAJORS } from '../constants';
import { 
  GraduationCap, AlertCircle, CheckCircle, Phone, Mail, Lock, EyeOff, Eye, UserPlus, Sun, Moon, X, Key
} from 'lucide-react';
import emailjs from '@emailjs/browser';

// --- EmailJS Onboarding Service ---
const EMAILJS_SERVICE_ID = 'service_sqifvnn'; // Real Service ID provided by user
const EMAILJS_TEMPLATE_ID = 'template_5jl26k9'; // Real Template ID provided by user
const EMAILJS_PUBLIC_KEY = '_0XrRu5kIVISVR9_M';   // Real Public Key provided by user

export default function AuthScreen({ user, onProfileComplete, theme, toggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', gender: 'ذكر', major: MAJORS[0], cohort: COHORTS[0]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetMessage({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني الخاص بك.' });
      return;
    }
    
    // Convert to actual email if they typed ID/Phone (basic check, normally we should do the DB lookup here too, but Firebase requires real email for reset)
    // To keep it simple and secure, Firebase Reset requires the exact registered email.
    if (!resetEmail.includes('@')) {
       setResetMessage({ type: 'error', text: 'يرجى إدخال البريد الإلكتروني الفعلي (email@...) لاستلام رابط التفعيل، وليس رقم الهاتف.' });
       return;
    }

    setIsResetting(true);
    setResetMessage(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ type: 'success', text: 'تم إرسال رابط استعادة كلمة المرور بنجاح! يرجى تفقد صندوق الوارد (أو مجلد Spam/الرسائل غير المرغوب فيها).' });
    } catch (err) {
      console.error(err);
      let errorMsg = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
      if (err.code === 'auth/user-not-found') {
        errorMsg = 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'صيغة البريد الإلكتروني غير صحيحة.';
      }
      setResetMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsResetting(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- REAL LOGIN FLOW ---
        let emailToUse = formData.email.trim();

        // If the input doesn't look like an email, try resolving it as a Student ID or Phone number
        if (!emailToUse.includes('@')) {
          const dirRef = collection(db, 'artifacts', appId, 'public', 'data', 'student_directory');
          
          // 1. Try querying by Academic ID
          const qId = query(dirRef, where('studentId', '==', emailToUse));
          const snapId = await getDocs(qId);
          
          if (!snapId.empty) {
            emailToUse = snapId.docs[0].data().email;
          } else {
            // 2. Try querying by Phone Number
            const qPhone = query(dirRef, where('phone', '==', emailToUse));
            const snapPhone = await getDocs(qPhone);
            
            if (!snapPhone.empty) {
              emailToUse = snapPhone.docs[0].data().email;
            } else {
              throw new Error('لم يتم العثور على أي حساب مسجل برقم القيد أو الهاتف هذا. يرجى التحقق أو التسجيل أولاً.');
            }
          }
        }

        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, formData.password);
        const loggedInUser = userCredential.user;

        // Check if email is verified
        if (!loggedInUser.emailVerified && !emailToUse.includes('admin@taiba.edu')) {
          throw new Error('لم يتم تفعيل هذا الحساب بعد. يرجى مراجعة بريدك الإلكتروني والضغط على رابط التفعيل المرسل إليك.');
        }

        // Rule 1: Private Profile Path
        const userDocRef = doc(db, 'artifacts', appId, 'users', loggedInUser.uid, 'profile', 'details');
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          onProfileComplete(docSnap.data());
        } else {
          setError('لم يتم العثور على ملف البيانات الأكاديمية الخاص بك. يرجى مراجعة إدارة الكلية.');
        }
      } else {
        // --- REAL REGISTRATION FLOW ---
        if (!formData.name || !formData.phone || !formData.email || !formData.password) {
          throw new Error('يرجى ملء كافة الخانات الأكاديمية المطلوبة لمتابعة التسجيل');
        }

        // Enforce @gmail.com only (with exception for admin accounts)
        const emailLower = formData.email.trim().toLowerCase();
        const isValidGmail = emailLower.endsWith('@gmail.com');
        const isAdminEmail = emailLower.includes('admin@taiba.edu');

        if (!isValidGmail && !isAdminEmail) {
          throw new Error('عذراً، يجب التسجيل باستخدام بريد Gmail فقط (ينتهي بـ @gmail.com).');
        }

        // Enforce exactly 11-digit phone number
        const phoneClean = formData.phone.trim();
        const isElevenDigits = /^\d{11}$/.test(phoneClean);
        if (!isElevenDigits) {
          throw new Error('يجب أن يتكون رقم الهاتف من 11 رقماً فقط (مثال: 01012345678).');
        }

        // Avoid fake emails
        const fakeEmailDomains = ['tempmail', '10minutemail', 'temp-mail', 'throwawaymail', 'yopmail'];
        const emailDomain = formData.email.split('@')[1] || '';
        if (fakeEmailDomains.some(domain => emailDomain.includes(domain))) {
          throw new Error('الرجاء استخدام البريد الإلكتروني الحقيقي، يمنع المعهد الإيميلات الوهمية.');
        }

        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const registeredUser = userCredential.user;

        // 2. Send native activation/verification email via Firebase
        await sendEmailVerification(registeredUser);

        // 3. Generate custom Student ID (e.g., TBA-XXXXX)
        const randomId = Math.floor(10000 + Math.random() * 90000);
        const generatedStudentId = `TBA-${randomId}`;

        const isUserAdmin = formData.email.includes('admin@taiba.edu');
        const newProfile = {
          ...formData,
          uid: registeredUser.uid,
          studentId: generatedStudentId,
          role: isUserAdmin ? 'admin' : 'student', 
          bio: 'طالب في معهد طيبة فخور بدراسته 🎓',
          avatarUrl: '',
          hideEmail: false,
          hidePhone: false,
          createdAt: new Date().toISOString()
        };
        delete newProfile.password;

        // 4. Save Private Profile Details in Firestore (Rule 1)
        const userDocRef = doc(db, 'artifacts', appId, 'users', registeredUser.uid, 'profile', 'details');
        await setDoc(userDocRef, newProfile);
        
        // 5. Save Public Student Directory entry (Rule 1)
        const publicDirRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_directory', registeredUser.uid);
        await setDoc(publicDirRef, {
          uid: registeredUser.uid,
          studentId: generatedStudentId,
          name: formData.name,
          major: formData.major,
          cohort: formData.cohort,
          bio: newProfile.bio,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          hideEmail: false,
          hidePhone: false,
          avatarUrl: '',
          status: 'online',
          lastSeen: new Date().toISOString()
        });

        // 6. Send Custom Onboarding welcome letter via EmailJS
        try {
          if (EMAILJS_TEMPLATE_ID !== 'YOUR_EMAILJS_TEMPLATE_ID') {
            await emailjs.send(
              EMAILJS_SERVICE_ID,
              EMAILJS_TEMPLATE_ID,
              {
                student_name: formData.name,
                name: formData.name,       // Fallback for EmailJS default template
                student_email: formData.email,
                email: formData.email,     // Fallback for EmailJS default template
                student_id: generatedStudentId,
                student_cohort: formData.cohort,
                student_major: formData.major,
                student_phone: formData.phone
              },
              EMAILJS_PUBLIC_KEY
            );
            console.log('EmailJS welcome email sent successfully!');
          }
        } catch (emailErr) {
          console.error('EmailJS welcome email sending failed:', emailErr);
        }

        setSuccess(`تم تسجيل حسابك الأكاديمي بنجاح! تم إرسال رابط التفعيل إلى بريدك الإلكتروني: ${formData.email}. يرجى تفعيله لتتمكن من الدخول.`);
        setTimeout(() => {
          onProfileComplete(null); // Let App.jsx detect that the user needs email verification
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      let errorMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'هذا البريد الإلكتروني مسجل بالفعل بالمنصة الأكاديمية.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'كلمة المرور ضعيفة للغاية، يرجى كتابة 6 أحرف أو أكثر.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'صيغة البريد الإلكتروني غير صحيحة.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'خطأ في البريد الإلكتروني أو كلمة المرور، يرجى التحقق وإعادة المحاولة.';
      }
      setError(errorMsg || 'فشل الاتصال الأكاديمي، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 academic-bg font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="absolute top-4 left-4 z-20 flex gap-2">
         <button type="button" onClick={toggleTheme} className="p-3 bg-white/95 dark:bg-[#09171a]/95 border-2 border-[#0e5e6f] rounded-full hover:scale-105 transition shadow-md">
            {theme === 'dark' ? <Sun size={20} className="text-[#bfebd4]" /> : <Moon size={20} className="text-[#0e5e6f]" />}
          </button>
      </div>

      <div className="glass-premium w-full max-w-lg p-8 rounded-3xl z-10 fade-in border-4 border-[#0e5e6f]/45 dark:border-[#bfebd4]/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-[#0e5e6f] to-[#bfebd4] rounded-full p-0.5 shadow-2xl mb-4 flex items-center justify-center">
             <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="Taiba Students Logo" className="w-full h-full object-cover scale-110" />
             </div>
          </div>
          <h1 className="text-3xl font-black text-[#0e5e6f] dark:text-[#bfebd4] leading-tight">
            طلاب معهد طيبة
          </h1>
          <p className="text-[#0e5e6f]/90 dark:text-[#bfebd4]/90 mt-2 font-black text-sm">
            {isLogin ? 'تسجيل الدخول الفوري للطلبة والكوادر' : 'تقديم طلب الالتحاق بالمنصة الأكاديمية'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 px-4 py-3.5 rounded-xl mb-6 text-xs md:text-sm font-black flex items-center gap-2.5">
            <AlertCircle className="shrink-0 text-rose-600" size={18} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 px-4 py-3.5 rounded-xl mb-6 text-xs md:text-sm font-black flex items-center gap-2.5">
            <CheckCircle className="shrink-0 text-emerald-600" size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-right">
          {!isLogin && (
            <div className="fade-in">
              <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">
                الاسم الرباعي كاملاً <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required 
                placeholder="أحمد محمد عبدالله علي"
                className="w-full px-4 py-3 rounded-xl input-academic font-black placeholder-slate-400 focus:outline-none" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
          )}
          
          {!isLogin && (
             <div className="fade-in">
               <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">
                 رقم الهاتف الشخصي <span className="text-rose-500">*</span>
               </label>
               <div className="relative">
                 <input 
                   type="tel" 
                   required 
                   placeholder="01012345678"
                   className="w-full px-10 py-3 rounded-xl input-academic font-black text-left focus:outline-none" 
                   dir="ltr"
                   value={formData.phone} 
                   onChange={e => setFormData({...formData, phone: e.target.value})} 
                 />
                 <Phone className="absolute top-3.5 right-3 text-[#0e5e6f] dark:text-[#bfebd4]" size={18} />
               </div>
             </div>
          )}

          <div>
            <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">
              {isLogin ? 'البريد الإلكتروني، رقم القيد الأكاديمي، أو رقم الهاتف' : 'البريد الإلكتروني الشخصي'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input 
                type={isLogin ? "text" : "email"} 
                required 
                placeholder={isLogin ? "student@gmail.com أو TBA-12345 أو 010..." : "student@gmail.com"}
                className="w-full px-10 py-3 rounded-xl input-academic font-black text-left focus:outline-none" 
                dir="ltr"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              <Mail className="absolute top-3.5 right-3 text-[#0e5e6f] dark:text-[#bfebd4]" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">
              كلمة مرور الحساب الجامعي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••••••"
                className="w-full px-10 py-3 rounded-xl input-academic font-black text-left focus:outline-none" 
                dir="ltr"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              <Lock className="absolute top-3.5 right-3 text-[#0e5e6f] dark:text-[#bfebd4]" size={18} />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 left-3 text-[#0e5e6f]/70 dark:text-[#bfebd4]/70 hover:text-[#0e5e6f] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {isLogin && (
              <div className="flex justify-start mt-2 fade-in">
                <button 
                  type="button"
                  onClick={() => { 
                    setShowForgotPassword(true); 
                    setResetMessage(null); 
                    setResetEmail(formData.email.includes('@') ? formData.email : ''); 
                  }}
                  className="text-[10px] md:text-xs font-black text-[#0e5e6f] dark:text-[#bfebd4] hover:text-[#178a9e] transition underline underline-offset-4"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 fade-in">
              <div>
                <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">النوع</label>
                <select className="w-full px-4 py-3 rounded-xl input-academic font-black focus:outline-none"
                  value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">الفرقة الدراسية</label>
                <select className="w-full px-4 py-3 rounded-xl input-academic font-black focus:outline-none"
                  value={formData.cohort} onChange={e => setFormData({...formData, cohort: e.target.value})}>
                  {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="fade-in">
              <label className="block text-xs md:text-sm font-black mb-1.5 text-[#0e5e6f] dark:text-[#bfebd4]">التخصص الأكاديمي</label>
              <select className="w-full px-4 py-3 rounded-xl input-academic font-black focus:outline-none"
                value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})}>
                {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 btn-primary text-white font-extrabold py-3.5 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-250 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">جاري فحص المعطيات الأكاديمية...</span>
            ) : (
              <>
                {isLogin ? 'تسجيل الدخول الفوري' : 'إنشاء حساب وتوليد ID'}
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#82af96] dark:border-[#3c6550] text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-sm font-extrabold text-[#0e5e6f] dark:text-[#bfebd4] hover:text-[#178a9e] transition"
          >
            {isLogin ? 'طالب مستجد؟ بادر بإنشاء حسابك الأكاديمي' : 'مسجل بالمنصة بالفعل؟ اضغط هنا للدخول'}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-950/85 dark:bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-lg transition-all duration-500 fade-in select-none">
          <div className="bg-white/95 dark:bg-[#09171a]/95 border-2 border-[#82af96] dark:border-[#3c6550] rounded-[24px] p-6 md:p-8 max-w-sm w-full shadow-2xl scale-in text-right relative overflow-hidden">
            
            <button 
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 left-4 p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 transition text-slate-700 dark:text-slate-300 z-10"
            >
              <X size={16} />
            </button>

            <div className="flex justify-center mb-4 relative z-10">
               <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0e5e6f] to-[#bfebd4] flex items-center justify-center shadow-lg border-2 border-white dark:border-[#09171a]">
                 <Key size={24} className="text-white dark:text-[#09171a]" />
               </div>
            </div>

            <h3 className="text-lg font-black text-[#0e5e6f] dark:text-[#bfebd4] text-center mb-2 relative z-10">
              استعادة كلمة المرور
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center mb-6 relative z-10">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.
            </p>

            {resetMessage && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-black flex items-start gap-2 relative z-10 ${
                resetMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {resetMessage.type === 'success' ? <CheckCircle className="shrink-0 mt-0.5" size={16} /> : <AlertCircle className="shrink-0 mt-0.5" size={16} />}
                <span>{resetMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="relative z-10">
              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    placeholder="البريد الإلكتروني..."
                    className="w-full px-10 py-3 rounded-xl input-academic font-black text-left focus:outline-none" 
                    dir="ltr"
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                  />
                  <Mail className="absolute top-3.5 right-3 text-[#0e5e6f] dark:text-[#bfebd4]" size={18} />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isResetting}
                className="w-full btn-primary text-white font-extrabold py-3 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition flex items-center justify-center"
              >
                {isResetting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
