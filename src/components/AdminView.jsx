import  { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { COHORTS, MAJORS } from '../constants';
import { ShieldCheck, Plus, Bell } from 'lucide-react';

export default function AdminView({ profile }) {
  // Course/Material form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [cohort, setCohort] = useState(COHORTS[0]);
  const [major, setMajor] = useState(MAJORS[0]);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  // Announcement form state
  const [annMsg, setAnnMsg] = useState('');
  const [annCohort, setAnnCohort] = useState(COHORTS[0]);
  const [annStatus, setAnnStatus] = useState('');

  // Seeding state removed

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setStatus('جاري رفع وتوثيق المنهج للمنصة...');
    try {
      const matRef = collection(db, 'artifacts', appId, 'public', 'data', 'materials');
      await addDoc(matRef, {
        title, 
        type, 
        cohort, 
        major,
        url: url.trim() || '#',
        createdAt: serverTimestamp(),
        addedBy: profile.name
      });
      setStatus('تم رفع وتعميم المادة بنجاح على الطلاب بالمنصة!');
      setTitle('');
      setUrl('');
    } catch (error) {
      setStatus('حدث خطأ فني: ' + error.message);
    }
    setTimeout(() => setStatus(''), 4000);
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    setAnnStatus('جاري نشر التنبيه...');
    try {
      const annRef = collection(db, 'artifacts', appId, 'public', 'data', 'announcements');
      await addDoc(annRef, {
        msg: annMsg,
        cohort: annCohort,
        createdAt: serverTimestamp(),
        addedBy: profile.name
      });
      setAnnStatus('تم تعميم التنبيه بنجاح على الصفحة الرئيسية للطلاب!');
      setAnnMsg('');
    } catch (error) {
      setAnnStatus('حدث خطأ: ' + error.message);
    }
    setTimeout(() => setAnnStatus(''), 4000);
  };

  // handleSeedDatabase function removed

  return (
    <div className="space-y-8 fade-in text-right">
      <h2 className="text-2xl font-black border-r-4 border-rose-600 pr-3 flex items-center gap-2 text-slate-900 dark:text-white">
        <ShieldCheck className="text-rose-600"/> لوحة تحكم وإشراف معهد طيبة الأكاديمي
      </h2>

      {/* External Admin Link */}
      <div className="glass-premium p-5 rounded-3xl border-2 border-yellow-500/30 bg-yellow-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-yellow-600 dark:text-yellow-400">💡 بوابة التحكم الكاملة المستقلة متاحة الآن!</h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
            لقد قمنا ببناء لوحة تحكم وإشراف خارجية مستقلة بالكامل (في مجلد /admin) لإدارة شؤون الطلاب، رصد البلاغات، تعديل المناهج، بث الإعلانات، وبناء امتحانات بابل شيت متكاملة بحرية كاملة ودون تداخل مع موقع الطلاب.
          </p>
        </div>
        <a 
          href="/admin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md shrink-0 active:scale-95"
        >
          الانتقال للوحة التحكم الخارجية 🛡️
        </a>
      </div>

      {/* Grid for Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form 1: Add Material */}
        <div className="glass-premium p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-800 shadow-md">
          <h3 className="text-lg font-black mb-5 text-[#0e5e6f] dark:text-[#bfebd4] border-b pb-2 flex items-center gap-2">
            <Plus size={18} /> رفع وتصنيف منهج أو مراجعة جديدة
          </h3>
          
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">عنوان الملف الأكاديمي</label>
              <input 
                type="text" 
                required 
                placeholder="مثال: محاضرة قواعد البيانات الأولى"
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl input-academic font-bold text-sm placeholder-slate-400 focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">رابط تحميل الملف (URL)</label>
              <input 
                type="url" 
                placeholder="مثال: https://google.com/drive/..."
                value={url} 
                onChange={e=>setUrl(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl input-academic font-bold text-sm placeholder-slate-400 focus:outline-none text-left" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">الفرقة</label>
                <select value={cohort} onChange={e=>setCohort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-academic font-bold text-xs focus:outline-none">
                  {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">التخصص / القسم</label>
                <select value={major} onChange={e=>setMajor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-academic font-bold text-xs focus:outline-none">
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">تصنيف الملف</label>
              <select value={type} onChange={e=>setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl input-academic font-bold text-xs focus:outline-none">
                <option value="pdf">كتاب أو ملف PDF تفصيلي</option>
                <option value="video">فيديو شرح تفاعلي</option>
                <option value="summary">ملخص البابل شيت والمراجعة</option>
                <option value="midterm_review">مراجعة الميدتيرم (تبويب المراجعات)</option>
                <option value="final_review">مراجعة نهاية الفصل الفاينال (تبويب المراجعات)</option>
              </select>
            </div>

            <button type="submit" className="w-full py-3 bg-[#0e5e6f] hover:bg-[#178a9e] text-white font-extrabold rounded-xl shadow-md transition text-xs">
              رفع وتعميم المادة للطلاب
            </button>
            {status && <p className="text-xs font-black text-center text-emerald-600 mt-2">{status}</p>}
          </form>
        </div>

        {/* Form 2: Add Announcement */}
        <div className="glass-premium p-6 rounded-3xl border-2 border-slate-300 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black mb-5 text-[#0e5e6f] dark:text-[#bfebd4] border-b pb-2 flex items-center gap-2">
              <Bell size={18} /> بث ونشر تنبيه أكاديمي جديد
            </h3>
            
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">نص التنبيه الهام</label>
                <textarea 
                  required 
                  rows="4"
                  placeholder="مثال: نسترعي انتباه الطلاب الكرام بأنه تقرر تأجيل موعد تسليم مشروع التخرج..."
                  value={annMsg} 
                  onChange={e=>setAnnMsg(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl input-academic font-bold text-sm placeholder-slate-400 focus:outline-none resize-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold mb-1 text-slate-800 dark:text-slate-200">الفرقة الدراسية المستهدفة</label>
                <select value={annCohort} onChange={e=>setAnnCohort(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-academic font-bold text-xs focus:outline-none">
                  {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full py-3 bg-[#2c5e43] hover:bg-[#3c6550] text-white font-extrabold rounded-xl shadow-md transition text-xs">
                إرسال وبث التنبيه فوراً
              </button>
              {annStatus && <p className="text-xs font-black text-center text-emerald-600 mt-2">{annStatus}</p>}
            </form>
          </div>
        </div>

      </div>

      {/* Database Seeding Controls Removed */}

    </div>
  );
}
