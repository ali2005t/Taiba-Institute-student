import React from 'react';
import { GraduationCap, BookOpen, MessageSquare, Shield, Sun, Moon, ArrowLeft, Star, Sparkles } from 'lucide-react';

export default function LandingScreen({ onEnter, theme, toggleTheme }) {
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-hidden relative ${theme === 'dark' ? 'dark bg-[#040d0f]' : 'bg-[#f4f9f7]'}`}>
      
      {/* Dynamic Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-[#0e5e6f]/20 to-[#178a9e]/20 dark:from-[#bfebd4]/10 dark:to-[#178a9e]/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-[#2c5e43]/20 to-[#bfebd4]/20 dark:from-[#0e5e6f]/20 dark:to-[#2c5e43]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-[60px] animate-bounce pointer-events-none" style={{ animationDuration: '8s' }}></div>

      {/* Top Navbar */}
      <header className="p-6 md:px-12 flex justify-between items-center z-20 relative">
        <button 
          onClick={toggleTheme} 
          className="p-3 bg-white/80 dark:bg-[#09171a]/80 backdrop-blur-md border border-[#0e5e6f]/20 dark:border-[#bfebd4]/20 rounded-full hover:scale-110 hover:shadow-lg hover:shadow-[#178a9e]/20 transition-all duration-300"
        >
          {theme === 'dark' ? <Sun size={22} className="text-[#bfebd4]" /> : <Moon size={22} className="text-[#0e5e6f]" />}
        </button>
        <div className="flex items-center gap-4 group cursor-default">
          <div className="text-right hidden sm:block opacity-0 translate-x-4 animate-[slideInLeft_0.8s_ease-out_forwards]">
            <h2 className="text-[#0e5e6f] dark:text-[#bfebd4] font-black text-lg tracking-tight">طلاب معهد طيبة</h2>
            <p className="text-[#178a9e] dark:text-[#82af96] font-bold text-xs">بوابتك التعليمية الشاملة</p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-tr from-[#0e5e6f] via-[#178a9e] to-[#bfebd4] rounded-2xl p-[2px] shadow-xl group-hover:shadow-2xl group-hover:shadow-[#178a9e]/30 group-hover:rotate-6 transition-all duration-300 shrink-0">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0e5e6f]/10 to-transparent dark:from-[#bfebd4]/10 opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>
              <img src="/logo.jpg" alt="Taiba Students Logo" className="w-full h-full object-cover scale-110 relative z-10" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center relative -mt-8">
        
        {/* Floating Badges */}
        <div className="absolute top-10 left-[20%] hidden lg:flex flex-col gap-2 animate-[float_6s_ease-in-out_infinite] opacity-70">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">المنصة الأولى للطلاب</span>
          </div>
        </div>
        <div className="absolute bottom-32 right-[15%] hidden lg:flex flex-col gap-2 animate-[float_8s_ease-in-out_infinite_reverse] opacity-70">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">مجانية بنسبة 100%</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 animate-[fadeInUp_1s_ease-out]">
          <div className="inline-block mb-2 px-4 py-1.5 rounded-full bg-[#178a9e]/10 dark:bg-[#bfebd4]/10 border border-[#178a9e]/20 dark:border-[#bfebd4]/20 backdrop-blur-md">
             <p className="text-[#0e5e6f] dark:text-[#bfebd4] text-xs font-black tracking-wide flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#178a9e] opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0e5e6f] dark:bg-[#bfebd4]"></span>
               </span>
               مبادرة طلابية مستقلة
             </p>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] pb-2 drop-shadow-sm">
            نحو تجربة أكاديمية <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0e5e6f] via-[#178a9e] to-[#2c5e43] dark:from-[#bfebd4] dark:to-[#178a9e] relative inline-block mt-2 drop-shadow-lg">
              أكثر ذكاءً وسهولة!
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#bfebd4]/30 dark:bg-[#0e5e6f]/50 blur-md -z-10"></div>
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl font-bold text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed drop-shadow-sm px-4">
            تجمع منصتنا كل ما تحتاجه كطالب في معهد طيبة: محاضرات متكاملة، بنوك أسئلة وامتحانات، ومجتمع دراسي تفاعلي.. <span className="text-[#0e5e6f] dark:text-[#bfebd4] font-black">كله في مكان واحد.</span>
          </p>

          {/* Action Button */}
          <div className="pt-8 pb-16 relative">
            <div className="absolute inset-0 bg-[#178a9e] blur-3xl opacity-20 dark:opacity-30 rounded-full animate-pulse"></div>
            <button
              onClick={onEnter}
              className="group relative px-10 py-5 bg-[#0e5e6f] dark:bg-[#bfebd4] text-white dark:text-[#09171a] font-black rounded-2xl text-xl shadow-[0_20px_40px_-15px_rgba(14,94,111,0.5)] dark:shadow-[0_20px_40px_-15px_rgba(191,235,212,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(14,94,111,0.7)] dark:hover:shadow-[0_20px_50px_-10px_rgba(191,235,212,0.6)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex items-center justify-center gap-4 mx-auto border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
              <span>ابدأ رحلتك الأكاديمية الآن</span>
              <div className="bg-white/20 dark:bg-black/10 p-2 rounded-xl group-hover:translate-x-[-4px] transition-transform duration-300">
                <ArrowLeft size={20} strokeWidth={3} />
              </div>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right w-full max-w-6xl mx-auto px-4 z-20 relative">
            
            <div className="bg-white/60 dark:bg-[#09171a]/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 dark:border-slate-800/50 hover:border-[#178a9e]/50 transition-all duration-500 group shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0e5e6f] to-[#178a9e] dark:from-[#178a9e] dark:to-[#bfebd4] rounded-2xl flex items-center justify-center mb-6 text-white dark:text-[#09171a] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BookOpen size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">مكتبة المقررات</h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                تجميع متكامل للمحاضرات ومراجعات الميدتيرم والفاينال، منظمة بدقة حسب تخصصك وفرقتك الدراسية.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-[#09171a]/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 dark:border-slate-800/50 hover:border-[#178a9e]/50 transition-all duration-500 group shadow-xl hover:shadow-2xl hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-[#2c5e43] to-[#82af96] dark:from-[#3c6550] dark:to-[#bfebd4] rounded-2xl flex items-center justify-center mb-6 text-white dark:text-[#09171a] shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <MessageSquare size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">مجتمع مترابط</h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                غرف دردشة جامعية موحدة للتواصل الفوري والآمن بين الزملاء لتبادل المعلومات ومناقشة المقررات على مدار الساعة.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-[#09171a]/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 dark:border-slate-800/50 hover:border-amber-500/50 transition-all duration-500 group shadow-xl hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                <Shield size={26} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight relative z-10">مستقلة 100%</h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                مبادرة تطوعية بحتة، مبنية بأيدي الطلاب من أجل الطلاب، خالية من أي توجيه إداري لضمان حرية التعلم والاستفادة.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center z-10 relative mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl backdrop-blur-sm mb-6 inline-block">
           <p className="text-xs font-black text-rose-700 dark:text-rose-400 leading-relaxed">
             ⚠️ هذا الموقع مستقل تماماً وغير مرتبط بأي شكل من الأشكال بمعهد طيبة الأكاديمي أو إدارته نهائياً، ولا يمثل أي جهة أو تعاملات رسمية.
           </p>
        </div>
        <div>
          <span className="signature-font text-[#0e5e6f] dark:text-[#bfebd4] font-black tracking-wide text-sm opacity-80 hover:opacity-100 transition-opacity cursor-default">
            Developed with <span className="text-rose-600 animate-pulse inline-block">❤</span> by Taiba Institute Student – <span className="text-rose-600 dark:text-yellow-400">ENG/EL LOL</span>
          </span>
        </div>
      </footer>
      
      {/* Custom Animations required for the landing page */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}} />
    </div>
  );
}
