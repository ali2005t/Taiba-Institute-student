import React from 'react';
import { Bell, Clock, Calendar, ShieldAlert, UploadCloud } from 'lucide-react';

const renderTextWithLinks = (text) => {
  if (!text) return text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:text-blue-600 underline font-bold px-1" 
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function NotificationsView({ announcements = [] }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right fade-in">
      
      {/* Title Header */}
      <div className="glass-premium p-8 rounded-3xl relative overflow-hidden border-2 border-[#82af96]/30">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0e5e6f] to-[#178a9e] flex items-center justify-center text-white shadow-lg shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
              مركز الإشعارات والتنبيهات الرسمية
            </h2>
            <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1">
              تابع جميع المستجدات، المراجعات والتعليمات المهمة الصادرة عن كادر المنصة.
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#0e5e6f] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Main List */}
      <div className="glass-premium p-6 rounded-3xl border-2 border-[#82af96]/30">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-[#82af96]/30 pb-3 text-[#0e5e6f] dark:text-[#bfebd4]">
          <Clock size={20} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
          أحدث التنبيهات لفرقتك الدراسية ({announcements.length})
        </h3>

        <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:right-6 before:w-0.5 before:bg-[#82af96]/20">
          {announcements.length === 0 ? (
            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/50">
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-300">📢 لا توجد إشعارات نشطة حالياً.</p>
              <p className="text-[11px] text-slate-500 font-bold mt-1">سيتم سرد كافة التعليمات المهمة وجدول الامتحانات والتعديلات الطارئة هنا فور صدورها.</p>
            </div>
          ) : (
            announcements.map((item, index) => {
              const formattedDate = item.createdAt 
                ? new Date(item.createdAt.seconds * 1000).toLocaleString('ar-EG', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : 'الآن';

              return (
                <div key={item.id} className="relative pr-14 flex flex-col md:flex-row md:items-start justify-between gap-4 p-5 bg-white/60 dark:bg-[#0d2328]/60 rounded-2xl border-2 border-[#82af96]/25 hover:border-[#0e5e6f]/40 transition group">
                  
                  {/* Timeline bullet */}
                  <div className="absolute right-3.5 top-6 w-5 h-5 rounded-full bg-[#bfebd4] dark:bg-[#2c5e43] border-4 border-white dark:border-[#09171a] flex items-center justify-center shadow z-10 group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0e5e6f] dark:bg-[#bfebd4]"></div>
                  </div>

                  {/* Icon & Message details */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#bfebd4]/60 dark:bg-[#2c5e43]/60 flex items-center justify-center text-[#0e5e6f] dark:text-[#bfebd4] shrink-0">
                      <ShieldAlert size={18} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-[#f0f7f4] leading-relaxed whitespace-pre-wrap">
                        {renderTextWithLinks(item.msg)}
                      </h4>
                    </div>
                  </div>

                  {/* Time metadata */}
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0 text-xs md:text-left self-start mt-1">
                    <Calendar size={13} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
                    <span className="font-extrabold text-[10px]">{formattedDate}</span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
