import React, { useState } from 'react';
import { 
  GraduationCap, BookOpen, FileCheck, MessageSquare, UserCheck, User, ShieldCheck, LogOut 
} from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

export default function Sidebar({ profile, currentView, setCurrentView, handleLogout, isOpen, setIsOpen, unreadPrivateCount, unreadGroupCount }) {
  const [coursesExpanded, setCoursesExpanded] = useState(true);
  const [examsExpanded, setExamsExpanded] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية الأكاديمية', icon: GraduationCap },
    { id: 'courses', label: 'المقررات والمراجعات', icon: BookOpen },
    { id: 'exams', label: 'الاختبارات', icon: FileCheck },
    { id: 'chat', label: 'الشات الجامعي', icon: MessageSquare },
    { id: 'friends', label: 'دليل الأصدقاء وحساباتهم', icon: UserCheck },
    { id: 'profile', label: 'الملف الشخصي', icon: User },
  ];


  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)}></div>
      )}
      
      <aside className={`
        fixed lg:relative top-0 right-0 h-full w-72 glass-premium z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col border-l-2 border-[#82af96] dark:border-[#3c6550]
      `}>
        <div className="p-6 flex flex-col items-center border-b-2 border-[#82af96] dark:border-[#3c6550]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0e5e6f] to-[#bfebd4] p-1 mb-3 shadow-xl relative">
             <img 
                src={profile?.avatarUrl || (profile?.gender === 'أنثى' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian')} 
                alt="Logo" 
                className="w-full h-full rounded-full object-cover bg-slate-100"
              />
          </div>
          <div className="flex items-center justify-center gap-1">
            <h2 className="text-lg font-black text-[#0e5e6f] dark:text-[#bfebd4] text-center">
              {profile?.name ? profile.name.split(' ')[0] : ''}
            </h2>
            <VerifiedBadge />
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-extrabold mt-1">
            ID: {profile?.studentId || 'غير معروف'}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.id === 'courses') {
              const isCoursesActive = ['courses_books', 'courses_midterm', 'courses_final'].includes(currentView);
              return (
                <div key={item.id} className="space-y-1.5">
                  <button
                    onClick={() => { 
                      setCoursesExpanded(!coursesExpanded);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-black text-sm
                      ${isCoursesActive 
                        ? 'bg-gradient-to-r from-[#0e5e6f]/10 to-[#178a9e]/10 border-2 border-[#0e5e6f] text-[#0e5e6f] dark:text-[#bfebd4]' 
                        : 'text-[#0e5e6f] dark:text-[#bfebd4] hover:bg-[#bfebd4]/20 dark:hover:bg-[#bfebd4]/10'}
                    `}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon size={18} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
                      <span>المقررات والمراجعات</span>
                    </div>
                    <span className={`text-xs transform transition-transform duration-200 ${coursesExpanded ? 'rotate-90' : ''}`}>
                      ◀
                    </span>
                  </button>

                  {/* Expanded Submenu */}
                  {coursesExpanded && (
                    <div className="mr-6 space-y-1 border-r-2 border-[#82af96]/45 dark:border-[#3c6550]/45 pr-2.5 my-1 text-right">
                      <button
                        onClick={() => { setCurrentView('courses_books'); setIsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200
                          ${currentView === 'courses_books'
                            ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-md shadow-[#0e5e6f]/20'
                            : 'text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 hover:bg-[#bfebd4]/15'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        المقررات والكتب الدراسية
                      </button>

                      <button
                        onClick={() => { setCurrentView('courses_midterm'); setIsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200
                          ${currentView === 'courses_midterm'
                            ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-md shadow-[#0e5e6f]/20'
                            : 'text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 hover:bg-[#bfebd4]/15'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        مراجعات وملخصات الميدتيرم
                      </button>

                      <button
                        onClick={() => { setCurrentView('courses_final'); setIsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200
                          ${currentView === 'courses_final'
                            ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-md shadow-[#0e5e6f]/20'
                            : 'text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 hover:bg-[#bfebd4]/15'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        المراجعات النهائية والفاينال
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'exams') {
              const isExamsActive = ['exams', 'exams_mcq', 'exams_schedules'].includes(currentView);
              return (
                <div key={item.id} className="space-y-1.5">
                  <button
                    onClick={() => { 
                      setExamsExpanded(!examsExpanded);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-black text-sm
                      ${isExamsActive 
                        ? 'bg-gradient-to-r from-[#0e5e6f]/10 to-[#178a9e]/10 border-2 border-[#0e5e6f] text-[#0e5e6f] dark:text-[#bfebd4]' 
                        : 'text-[#0e5e6f] dark:text-[#bfebd4] hover:bg-[#bfebd4]/20 dark:hover:bg-[#bfebd4]/10'}
                    `}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon size={18} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
                      <span>الاختبارات</span>
                    </div>
                    <span className={`text-xs transform transition-transform duration-200 ${examsExpanded ? 'rotate-90' : ''}`}>
                      ◀
                    </span>
                  </button>

                  {/* Expanded Submenu */}
                  {examsExpanded && (
                    <div className="mr-6 space-y-1 border-r-2 border-[#82af96]/45 dark:border-[#3c6550]/45 pr-2.5 my-1 text-right">
                      <button
                        onClick={() => { setCurrentView('exams_mcq'); setIsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200
                          ${(currentView === 'exams' || currentView === 'exams_mcq')
                            ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-md shadow-[#0e5e6f]/20'
                            : 'text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 hover:bg-[#bfebd4]/15'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        البابل شيت والاختبارات
                      </button>

                      <button
                        onClick={() => { setCurrentView('exams_schedules'); setIsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200
                          ${currentView === 'exams_schedules'
                            ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-md shadow-[#0e5e6f]/20'
                            : 'text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 hover:bg-[#bfebd4]/15'}
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                        جدول الامتحانات
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-black text-sm
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white shadow-lg shadow-[#0e5e6f]/30' 
                    : 'text-[#0e5e6f] dark:text-[#bfebd4] hover:bg-[#bfebd4]/20 dark:hover:bg-[#bfebd4]/10 hover:translate-x-1'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[#0e5e6f] dark:text-[#bfebd4]'} />
                <span className="flex-1 text-right">{item.label}</span>
                {item.id === 'chat' && (unreadPrivateCount + unreadGroupCount) > 0 && (
                  <span className="bg-rose-600 text-white font-black text-[10px] px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center animate-bounce shrink-0 shadow-md">
                    {unreadPrivateCount + unreadGroupCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t-2 border-[#82af96] dark:border-[#3c6550]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors font-black text-sm"
          >
            <LogOut size={18} />
            تسجيل خروج آمن
          </button>
        </div>
      </aside>
    </>
  );
}
