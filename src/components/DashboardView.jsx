import React from 'react';
import { BookOpen, FileCheck, MessageSquare, Clock, UploadCloud } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

export default function DashboardView({ profile, materials = [], announcements = [], studentDirectory = [], setCurrentView }) {
  // Determine avatar source
  const getAvatar = () => {
    if (profile.avatarUrl) return profile.avatarUrl;
    return profile.gender === 'أنثى'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian';
  };

  // Real-time calculated counters (Zero mock data!)
  const onlineCount = studentDirectory.filter(s => s.status === 'online' && s.uid !== profile.uid).length;

  const stats = [
    { 
      title: 'المناهج ومراجعاتها', 
      value: `${materials.length} مقرر دِراسي`, 
      desc: 'المحاضرات، المراجع والملخصات المعتمدة', 
      icon: BookOpen, 
      color: 'bg-gradient-to-br from-[#0e5e6f] to-[#178a9e]', 
      action: 'courses_books' 
    },
    { 
      title: 'الاختبارات وبابل شيت', 
      value: `${materials.length > 0 ? 'متاحة الآن' : 'لا يوجد اختبارات'}`, 
      desc: 'نماذج التقييمات وبابل شيت الدفعة', 
      icon: FileCheck, 
      color: 'bg-gradient-to-br from-[#2c5e43] to-[#82af96]', 
      action: 'exams' 
    },
    { 
      title: 'الزملاء المتصلون الآن', 
      value: `${onlineCount} زميل متصل`, 
      desc: 'تواصل فوري عبر الشات الجامعي', 
      icon: MessageSquare, 
      color: 'bg-gradient-to-br from-[#178a9e] to-[#bfebd4]/80', 
      action: 'chat' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Welcome Cockpit Banner */}
      <div className="glass-premium p-8 rounded-3xl relative overflow-hidden border-2 border-[#82af96]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-right">
          
          {/* Student Profile Identity info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-md border-2 border-[#0e5e6f]/20 shrink-0">
              <img 
                src={getAvatar()} 
                alt="Student Avatar" 
                className="w-full h-full rounded-full object-cover bg-slate-100"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
                  مرحباً بك، {profile.name}
                </h2>
                <VerifiedBadge />
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1 leading-relaxed">
                المنصة الطلابية التفاعلية لمساعدة طلاب معهد طيبة الأكاديمي (مبادرة مستقلة).
              </p>
            </div>
          </div>

          {/* Academic Card badge */}
          <div className="bg-[#0e5e6f]/10 dark:bg-[#bfebd4]/10 border border-[#0e5e6f]/20 px-5 py-3 rounded-2xl text-right shrink-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black mb-1">رقم القيد الدراسي: {profile.studentId}</p>
            <h4 className="text-xs font-black text-[#0e5e6f] dark:text-[#bfebd4]">
              🏫 {profile.cohort} • {profile.major}
            </h4>
          </div>

        </div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#0e5e6f] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#bfebd4] rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Reactive Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              onClick={() => setCurrentView(stat.action)} 
              className="glass-premium p-6 rounded-2xl cursor-pointer hover:translate-y-[-5px] transition-all duration-300 flex items-center justify-between group border-2 border-[#82af96]/35"
            >
              <div className="text-right">
                <p className="text-slate-500 dark:text-slate-400 font-black text-xs">{stat.title}</p>
                <h3 className="text-xl font-black mt-2 text-[#0e5e6f] dark:text-[#bfebd4]">{stat.value}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-300 font-bold mt-1">{stat.desc}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                <Icon size={22} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Official Board Announcements */}
      <div className="glass-premium p-6 rounded-3xl border-2 border-[#82af96]/30">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2 border-b-2 border-[#82af96]/30 pb-3 text-[#0e5e6f] dark:text-[#bfebd4]">
          <Clock size={20} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
          تنبيهات الفرقة والدفعة الدراسية
        </h3>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/50">
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-300">📢 لا توجد تنبيهات جديدة حالياً لفرقتك الدراسية.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1">سيقوم الكادر الطلابي للمنصة بإرسال التنبيهات المهمة إليك هنا فور صدورها.</p>
            </div>
          ) : (
            announcements.map((item) => (
               <div key={item.id} className="flex items-center gap-4 p-4 bg-white/60 dark:bg-[#0d2328]/60 rounded-2xl border-2 border-[#82af96]/30 hover:scale-[1.01] transition text-right">
                  <div className="w-11 h-11 rounded-full bg-[#bfebd4] dark:bg-[#2c5e43] flex items-center justify-center text-[#0e5e6f] dark:text-[#bfebd4] shrink-0">
                    <UploadCloud size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-[#f0f7f4] leading-relaxed">{item.msg}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">
                      بواسطة {item.addedBy || 'فريق المنصة'} • {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'الآن'}
                    </p>
                  </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
