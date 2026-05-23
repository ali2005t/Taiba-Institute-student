import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import VerifiedBadge from './VerifiedBadge';

export default function ProfileView({ profile, studentDirectory, onProfileUpdate }) {
  const [bioInput, setBioInput] = useState(profile.bio || '');
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile.avatarUrl || '');
  const [hideEmail, setHideEmail] = useState(profile.hideEmail || false);
  const [hidePhone, setHidePhone] = useState(profile.hidePhone || false);
  const [saveStatus, setSaveStatus] = useState('');

  // Determine avatar source
  const getAvatar = () => {
    if (profile.avatarUrl) return profile.avatarUrl;
    return profile.gender === 'أنثى'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("حجم الصورة كبير جداً! يرجى اختيار صورة أصغر من 800 كيلوبايت لضمان سرعة التحميل.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrlInput(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus('جاري الحفظ...');
    try {
      // 1. Update Private profile doc (Rule 1)
      const userDocRef = doc(db, 'artifacts', appId, 'users', profile.uid, 'profile', 'details');
      await updateDoc(userDocRef, { 
        bio: bioInput,
        avatarUrl: avatarUrlInput
      });

      // 2. Update Public student directory entry (Rule 1)
      const publicDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_directory', profile.uid);
      await updateDoc(publicDocRef, { 
        bio: bioInput,
        avatarUrl: avatarUrlInput
      });

      // Sync local state memory and notify parent
      profile.bio = bioInput;
      profile.avatarUrl = avatarUrlInput;
      if (onProfileUpdate) {
        onProfileUpdate({ bio: bioInput, avatarUrl: avatarUrlInput });
      }
      
      setSaveStatus('تم تحديث البيانات الشخصية بنجاح!');
    } catch (error) {
      setSaveStatus('فشل في حفظ البيانات: ' + error.message);
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleTogglePrivacy = async (field, value) => {
    if (field === 'hideEmail') setHideEmail(value);
    if (field === 'hidePhone') setHidePhone(value);

    try {
      // 1. Update Private details
      const userDocRef = doc(db, 'artifacts', appId, 'users', profile.uid, 'profile', 'details');
      await updateDoc(userDocRef, { [field]: value });

      // 2. Update Public directory entry
      const publicDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_directory', profile.uid);
      
      const updateData = { [field]: value };
      if (field === 'hideEmail') {
        updateData.email = value ? "مخفي بواسطة المستخدم 🔒" : profile.email;
        if (value) updateData.realEmail = profile.email;
      }
      if (field === 'hidePhone') {
        updateData.phone = value ? "مخفي بواسطة المستخدم 🔒" : profile.phone;
        if (value) updateData.realPhone = profile.phone;
      }
      
      await updateDoc(publicDocRef, updateData);

      // Sync local memory and notify parent
      profile[field] = value;
      if (onProfileUpdate) {
        onProfileUpdate({ [field]: value });
      }
    } catch (error) {
      console.error("Failed to update privacy:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in text-right">
      
      {/* Premium Header Display */}
      <div className="glass-premium rounded-3xl p-8 relative overflow-hidden border-2 border-[#82af96] dark:border-[#3c6550]">
         <div className="absolute top-0 left-0 w-full h-28 bg-gradient-to-r from-[#0e5e6f] to-[#bfebd4] opacity-60"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mt-10">
            <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-2xl shrink-0">
              <img 
                src={getAvatar()} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover bg-slate-100"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
                  {profile.name}
                </h1>
                <VerifiedBadge />
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-bold mt-1">طالب أكاديمي في معهد طيبة</p>
              <div className="flex flex-wrap gap-2 mt-3.5">
                <span className="px-3.5 py-1.5 bg-[#bfebd4] text-[#0e5e6f] dark:bg-[#2c5e43] dark:text-[#bfebd4] rounded-full text-xs font-black">
                  {profile.cohort}
                </span>
                <span className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-full text-xs font-black">
                  {profile.major}
                </span>
                <span className="px-3.5 py-1.5 bg-[#0e5e6f] text-white rounded-full text-xs font-black">
                  رقم القيد: {profile.studentId}
                </span>
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Editor Form */}
        <div className="glass-premium p-6 rounded-2xl border-2 border-[#82af96] dark:border-[#3c6550] flex flex-col">
          <h3 className="text-lg font-black mb-4 border-b-2 border-[#82af96] pb-2 text-slate-900 dark:text-white">تعديل ملفك الأكاديمي</h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-2">تحميل صورة شخصية مخصصة (JPG/PNG)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-file-upload"
                />
                <label 
                  htmlFor="avatar-file-upload"
                  className="px-4 py-2.5 bg-[#bfebd4]/80 dark:bg-[#2c5e43]/50 hover:bg-[#bfebd4] text-[#0e5e6f] dark:text-[#bfebd4] rounded-xl font-black text-xs cursor-pointer transition shadow-sm border border-[#82af96]"
                >
                  📁 اختر صورة من جهازك
                </label>
                {avatarUrlInput && (
                  <span className="text-[10px] text-emerald-600 font-black">✓ تم تحميل الصورة بنجاح</span>
                )}
              </div>
              {avatarUrlInput && (
                <div className="mt-3 relative w-16 h-16 rounded-full border-2 border-[#82af96] overflow-hidden bg-slate-100 shadow-inner">
                  <img src={avatarUrlInput} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAvatarUrlInput('')}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-black opacity-0 hover:opacity-100 transition"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1.5">النبذة التعريفية المخصصة (البايو)</label>
              <textarea 
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                placeholder="اكتب عن اهتماماتك الأكاديمية ومشاريعك..." 
                className="w-full flex-1 p-3.5 rounded-xl input-academic font-bold placeholder-slate-400 focus:outline-none min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button type="submit" className="px-5 py-2.5 bg-[#0e5e6f] hover:bg-[#178a9e] text-white rounded-xl font-black text-xs shadow-md">
                حفظ التعديلات
              </button>
              {saveStatus && <span className="text-xs font-black text-emerald-600">{saveStatus}</span>}
            </div>
          </form>
        </div>

        {/* Academic Details & Privacy switches */}
        <div className="space-y-6">
          
          {/* Official details card */}
          <div className="glass-premium p-6 rounded-2xl border-2 border-[#82af96] dark:border-[#3c6550]">
            <h3 className="text-lg font-black mb-4 border-b-2 border-[#82af96] pb-2 text-slate-900 dark:text-white">البيانات الرسمية المقيدة بالكلية</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-200/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">البريد الإلكتروني</span>
                <span className="font-extrabold text-slate-900 dark:text-white" dir="ltr">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2 border-slate-200/40">
                <span className="text-slate-600 dark:text-slate-400 font-bold">رقم الهاتف الشخصي</span>
                <span className="font-extrabold text-slate-900 dark:text-white" dir="ltr">{profile.phone}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-bold">الجنس / النوع</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{profile.gender}</span>
              </div>
            </div>
          </div>

          {/* Privacy Switches card */}
          <div className="glass-premium p-6 rounded-2xl border-2 border-[#82af96] dark:border-[#3c6550] text-right">
             <h3 className="text-lg font-black mb-4 border-b-2 border-[#82af96] pb-2 text-slate-900 dark:text-white">إعدادات خصوصية البيانات</h3>
             <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-4">تتحكم التبديلات التالية في البيانات المعروضة لزملائك الطلاب عند تصفح ملفك الأكاديمي:</p>
             
             <div className="space-y-4">
               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-sm font-extrabold text-slate-800 dark:text-[#bfebd4]">إخفاء البريد الإلكتروني عن زملائي</span>
                 <div className="relative">
                   <input 
                     type="checkbox" 
                     checked={hideEmail} 
                     onChange={e => handleTogglePrivacy('hideEmail', e.target.checked)} 
                     className="sr-only peer"
                   />
                   <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#0e5e6f]"></div>
                 </div>
               </label>

               <label className="flex items-center justify-between cursor-pointer">
                 <span className="text-sm font-extrabold text-slate-800 dark:text-[#bfebd4]">إخفاء رقم الهاتف عن زملائي</span>
                 <div className="relative">
                   <input 
                     type="checkbox" 
                     checked={hidePhone} 
                     onChange={e => handleTogglePrivacy('hidePhone', e.target.checked)} 
                     className="sr-only peer"
                   />
                   <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#0e5e6f]"></div>
                 </div>
               </label>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
