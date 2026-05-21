import React from 'react';
import { BookOpen, Clock, Calendar, Newspaper } from 'lucide-react';

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

export default function NewsView({ news = [] }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-right fade-in">
      
      {/* Title Header */}
      <div className="glass-premium p-8 rounded-3xl relative overflow-hidden border-2 border-indigo-500/30">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shrink-0">
            <Newspaper size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-indigo-800 dark:text-indigo-300">
              أخبار المعهد والمحاضرات
            </h2>
            <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1">
              تابع أحدث الأخبار، التحديثات الأكاديمية، وجداول المحاضرات الخاصة بالمعهد.
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Main List */}
      <div className="glass-premium p-6 rounded-3xl border-2 border-indigo-500/30">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2 border-b border-indigo-500/30 pb-3 text-indigo-800 dark:text-indigo-300">
          <Clock size={20} className="text-indigo-800 dark:text-indigo-300" />
          سجل الأخبار الأكاديمية ({news.length})
        </h3>

        <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:right-6 before:w-0.5 before:bg-indigo-500/20">
          {news.length === 0 ? (
            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/50">
              <p className="font-extrabold text-sm text-slate-800 dark:text-slate-300">📰 لا توجد أخبار منشورة حالياً.</p>
              <p className="text-[11px] text-slate-500 font-bold mt-1">سيتم سرد الأخبار الأكاديمية وجداول المحاضرات هنا فور نشرها.</p>
            </div>
          ) : (
            news.map((item) => {
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
                <div key={item.id} className="relative pr-14 flex flex-col md:flex-row md:items-start justify-between gap-4 p-5 bg-white/60 dark:bg-[#0d2328]/60 rounded-2xl border-2 border-indigo-500/25 hover:border-indigo-600/40 transition group">
                  
                  {/* Timeline bullet */}
                  <div className="absolute right-3.5 top-6 w-5 h-5 rounded-full bg-indigo-200 dark:bg-indigo-900 border-4 border-white dark:border-[#09171a] flex items-center justify-center shadow z-10 group-hover:scale-110 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-700 dark:bg-indigo-300"></div>
                  </div>

                  {/* Icon & Message details */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-200/60 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-[#f0f7f4] leading-relaxed whitespace-pre-wrap">
                        {renderTextWithLinks(item.msg)}
                      </h4>
                    </div>
                  </div>

                  {/* Time metadata */}
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 shrink-0 text-xs md:text-left self-start mt-1">
                    <Calendar size={13} className="text-indigo-600 dark:text-indigo-400" />
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
