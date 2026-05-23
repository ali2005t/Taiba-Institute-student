import React from 'react';
import { Mail, MessageSquare, Info } from 'lucide-react';

export default function ContactView() {
  return (
    <div className="space-y-8 fade-in text-right pb-10">
      <div className="flex justify-between items-center border-r-4 border-emerald-600 pr-3">
        <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
          تواصل معنا
        </h2>
      </div>

      <div className="glass-premium p-8 rounded-3xl border-2 border-[#82af96]/30 text-slate-800 dark:text-slate-300 leading-relaxed space-y-8 text-center">
        
        <div>
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
            <Mail size={40} />
          </div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">كيف يمكننا مساعدتك؟</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            نحن هنا للرد على استفساراتكم، اقتراحاتكم، أو أي مشاكل تقنية تواجهكم في المنصة. لا تترددوا في مراسلتنا في أي وقت.
          </p>
        </div>

        <div className="bg-white/60 dark:bg-[#0d2328]/60 p-6 rounded-2xl border border-[#82af96]/20 inline-block text-right min-w-[300px]">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">البريد الإلكتروني الرسمي:</p>
          <a 
            href="mailto:taiba.institute.students@gmail.com" 
            className="text-lg font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-2"
          >
            <Mail size={18} />
            taiba.institute.students@gmail.com
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl max-w-lg mx-auto">
          <Info size={16} className="text-emerald-500 shrink-0" />
          <span>
            يتم مراجعة البريد الإلكتروني بشكل دوري من قبل فريق الإشراف الطلابي. نتوقع الرد خلال 24 - 48 ساعة كحد أقصى.
          </span>
        </div>

      </div>
    </div>
  );
}
