import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { Clock, FileText, CheckCircle, AlertTriangle, HelpCircle, Send, Edit3 } from 'lucide-react';

export default function ExamsView({ exams = [], db, appId, profile }) {
  const [activeExam, setActiveExam] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [solvedExams, setSolvedExams] = useState({});

  useEffect(() => {
    if (!profile || !profile.uid || !db || !appId) return;
    const submissionsRef = collection(db, 'artifacts', appId, 'users', profile.uid, 'exam_submissions');
    const unsub = onSnapshot(submissionsRef, (snapshot) => {
      const submissions = {};
      snapshot.docs.forEach(doc => {
        submissions[doc.id] = doc.data();
      });
      setSolvedExams(submissions);
    });
    return () => unsub();
  }, [profile, db, appId]);

  const getExamStatus = (exam) => {
    const now = new Date();
    if (exam.startDate) {
      const start = new Date(exam.startDate);
      if (now < start) {
        return { 
          active: false, 
          status: 'not_started', 
          message: `يبدأ في: ${new Date(exam.startDate).toLocaleString('ar-EG')}` 
        };
      }
    }
    if (exam.endDate) {
      const end = new Date(exam.endDate);
      if (now > end) {
        return { 
          active: false, 
          status: 'expired', 
          message: 'انتهت فترة الاختبار ⏰' 
        };
      }
    }
    return { active: true, status: 'open', message: 'متاح الآن' };
  };

  useEffect(() => {
    let timer;
    if (activeExam && timeLeft > 0 && !result) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeExam && !result) {
      submitExam();
    }
    return () => clearInterval(timer);
  }, [activeExam, timeLeft, result]);

  const startExam = (exam) => {
    setActiveExam(exam);
    setTimeLeft(exam.duration * 60);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setResult(null);
  };

  const handleAnswer = (qIdx, value) => {
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
  };

  const getQuestionType = (q) => {
    if (q.type === 'essay' || !q.options || q.options.length === 0) return 'essay';
    if (q.type === 'boolean' || q.options.length === 2) return 'boolean';
    return 'mcq';
  };

  const submitExam = async () => {
    let score = 0;
    let totalMCQAndBool = 0;
    let hasEssay = false;

    activeExam.questions.forEach((q, idx) => {
      const type = getQuestionType(q);
      if (type === 'mcq' || type === 'boolean') {
        totalMCQAndBool++;
        if (answers[idx] === q.correct) score++;
      } else if (type === 'essay') {
        hasEssay = true;
      }
    });

    const submissionData = {
      examId: activeExam.id,
      examTitle: activeExam.title,
      studentUid: profile.uid,
      studentName: profile.name,
      studentId: profile.studentId || 'N/A',
      studentCohort: profile.cohort || 'غير محدد',
      studentMajor: profile.major || 'غير محدد',
      score,
      total: activeExam.questions.length,
      totalMCQAndBool,
      hasEssay,
      answersSubmitted: answers,
      submittedAt: new Date().toISOString(),
      status: hasEssay ? 'pending' : 'graded',
      essayGrades: {},
      essayFeedback: '',
      finalScore: score
    };

    if (db && appId && profile && profile.uid) {
      try {
        // Save to user subcollection
        const subDocRef = doc(db, 'artifacts', appId, 'users', profile.uid, 'exam_submissions', activeExam.id);
        await setDoc(subDocRef, submissionData);

        // Save to global collection for admin review
        const globalSubDocRef = doc(db, 'artifacts', appId, 'exam_submissions', `${profile.uid}_${activeExam.id}`);
        await setDoc(globalSubDocRef, submissionData);
      } catch (err) {
        console.error("Error saving exam submission:", err);
      }
    }

    setResult(submissionData);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  if (activeExam) {
    if (result) {
      const totalPossible = result.total;
      const displayScore = result.finalScore !== undefined ? result.finalScore : result.score;
      const pct = Math.round((displayScore / totalPossible) * 100);
      const isPassed = pct >= 50;

      return (
        <div className="glass-premium max-w-2xl mx-auto p-8 rounded-3xl text-center fade-in text-slate-900 dark:text-white border-2 border-[#82af96]/30">
          <div className={`w-24 h-24 mx-auto ${isPassed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'} rounded-full flex items-center justify-center mb-6 shadow-md`}>
            {isPassed ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className="text-3xl font-black mb-3">
            {isPassed ? 'اكتمل الاختبار الرقمي بنجاح!' : 'انتهى الاختبار! حاول مجدداً'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            تم رصد وحفظ إجابات البابل شيت والأجوبة التحريرية بنجاح في قاعدة البيانات:
          </p>
          
          <div className="inline-block px-8 py-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-200/50 dark:border-slate-800/50 mb-6">
            <p className="text-[10px] font-black text-slate-400 mb-1">
              {result.status === 'pending' ? 'الدرجة التلقائية للبابل شيت (قبل المقالي)' : 'الدرجة الكلية المعتمدة'}
            </p>
            <div className={`text-5xl font-black ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {displayScore} <span className="text-2xl text-slate-400 font-extrabold">/ {totalPossible}</span>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full mt-2 inline-block ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              النسبة المحققة: {pct}%
            </span>
          </div>

          {result.status === 'pending' && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-right mb-8">
              <p className="text-xs font-black text-amber-600 flex items-center gap-1.5 justify-end">
                <Clock size={14} />
                قيد المراجعة اليدوية المقالية ⏳
              </p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-1.5 leading-relaxed">
                يحتوي هذا الاختبار على أسئلة مقالية. تم تسجيل إجاباتك بنجاح وبانتظار أن يقوم المشرف بمراجعتها ورصد الدرجة النهائية لك قريبًا.
              </p>
            </div>
          )}

          {result.status === 'graded' && result.hasEssay && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-right mb-8">
              <p className="text-xs font-black text-emerald-600 flex items-center gap-1.5 justify-end">
                <CheckCircle size={14} />
                مراجعة المصحح للمقالي 🏆
              </p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-1.5 leading-relaxed">
                تم تصحيح إجاباتك المقالية من قبل لجنة الإشراف ورصد الدرجة الكلية بنجاح!
                {result.essayFeedback && <span className="block mt-2 text-[#0e5e6f] dark:text-[#bfebd4]">💬 تعليق المصحح: {result.essayFeedback}</span>}
              </p>
            </div>
          )}

          <div>
            <button 
              onClick={() => setActiveExam(null)} 
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 transition"
            >
              العودة لقائمة الاختبارات
            </button>
          </div>
        </div>
      );
    }

    const currentQ = activeExam.questions[currentQuestionIdx];
    const qType = getQuestionType(currentQ);
    
    return (
      <div className="max-w-6xl mx-auto fade-in">
        
        {/* Sticky Exam Header Bar */}
        <div className="glass-premium p-5 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-30 shadow-xl border-2 border-[#82af96]/30 text-slate-900 dark:text-white">
          <div className="text-right">
            <h2 className="font-extrabold text-base md:text-lg text-[#0e5e6f] dark:text-[#bfebd4] flex items-center gap-2">
              <FileText size={18} />
              {activeExam.title}
            </h2>
            <p className="text-[10px] text-slate-500 font-black mt-0.5">
              جاري حل اختبار البابل شيت والأسئلة المقالية والتحريرية المعتمدة
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-400">الوقت المتبقي:</span>
            <div className={`font-mono text-xl font-black px-5 py-2 rounded-xl flex items-center gap-2 shadow-inner ${timeLeft < 60 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-[#bfebd4]/50 text-[#0e5e6f] dark:bg-[#1a3830] dark:text-[#bfebd4]'}`}>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Side-by-Side Exam Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Left Panel: Real Academic Bubble Sheet (3 cols) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="glass-premium p-5 rounded-3xl border-2 border-[#82af96]/30 sticky top-28">
              <div className="border-b-2 border-[#82af96]/30 pb-3 mb-4 text-right">
                <h3 className="font-black text-sm text-[#0e5e6f] dark:text-[#bfebd4] flex items-center gap-1.5 justify-end">
                  ورقة البابل شيت الرقمية (MCQ / T&F / Written)
                  <CheckCircle size={16} />
                </h3>
                <p className="text-[9px] text-slate-500 font-bold mt-1">اضغط للتنقل السريع بين الأسئلة أو حل بابل شيت مباشرة</p>
              </div>

              {/* Bubble Sheet Matrix */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeExam.questions.map((q, idx) => {
                  const type = getQuestionType(q);
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = answers[idx] !== undefined && (typeof answers[idx] === 'string' ? answers[idx].trim().length > 0 : true);

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded-xl transition border ${isCurrent ? 'bg-[#bfebd4]/30 border-[#0e5e6f] dark:bg-[#2c5e43]/30 dark:border-[#bfebd4]' : 'bg-white/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'}`}
                    >
                      {/* Question Label */}
                      <button 
                        type="button"
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`text-xs font-black px-2 py-1 rounded-md transition ${isCurrent ? 'bg-[#0e5e6f] text-white' : isAnswered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        س {idx + 1}
                      </button>

                      {/* Bubble Options / input status based on type */}
                      {type === 'mcq' && (
                        <div className="flex gap-1.5">
                          {optionLetters.map((letter, optIdx) => {
                            const isBubbleSelected = answers[idx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswer(idx, optIdx)}
                                className={`w-6 h-6 rounded-full border text-[10px] font-black flex items-center justify-center transition-all ${isBubbleSelected ? 'bg-gradient-to-br from-[#0e5e6f] to-[#178a9e] text-white border-[#0e5e6f] scale-110 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-[#bfebd4]/20 hover:border-[#0e5e6f]'}`}
                                title={`اختر خيار (${letter})`}
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {type === 'boolean' && (
                        <div className="flex gap-1.5">
                          {['أ', 'ب'].map((letter, optIdx) => {
                            const isBubbleSelected = answers[idx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswer(idx, optIdx)}
                                className={`w-6 h-6 rounded-full border text-[10px] font-black flex items-center justify-center transition-all ${isBubbleSelected ? 'bg-gradient-to-br from-[#0e5e6f] to-[#178a9e] text-white border-[#0e5e6f] scale-110 shadow-sm' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-[#bfebd4]/20 hover:border-[#0e5e6f]'}`}
                                title={optIdx === 0 ? 'صح' : 'خطأ'}
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {type === 'essay' && (
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${isAnswered ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-slate-100 text-slate-400 border-slate-300 dark:bg-slate-900/40 dark:border-slate-800'}`}>
                          {isAnswered ? '✓ تم التدوين' : '📝 مقالي'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary bar */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] font-black text-slate-500 dark:text-slate-400">
                <span>المجيب عليها: {Object.keys(answers).filter(k => typeof answers[k] === 'string' ? answers[k].trim().length > 0 : true).length} / {activeExam.questions.length}</span>
                <span>المتبقية: {activeExam.questions.length - Object.keys(answers).filter(k => typeof answers[k] === 'string' ? answers[k].trim().length > 0 : true).length}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Active Question Pane (7 cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="glass-premium p-8 rounded-3xl border-2 border-[#82af96]/30 text-right min-h-[380px] flex flex-col justify-between">
              
              <div>
                {/* Question Icon Label */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 mb-6">
                  <HelpCircle size={12} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
                  {qType === 'mcq' && 'سؤال اختيار من متعدد (MCQ)'}
                  {qType === 'boolean' && 'سؤال صح أم خطأ (True / False)'}
                  {qType === 'essay' && 'سؤال تحريري ومقالي (Essay Question)'}
                </div>

                {/* Question Statement */}
                <h3 className="text-lg md:text-xl font-black mb-8 text-slate-900 dark:text-[#f0f7f4] leading-relaxed">
                  {currentQ.q}
                </h3>

                {/* MCQs Option Selections */}
                {qType === 'mcq' && (
                  <div className="space-y-3.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = answers[currentQuestionIdx] === idx;
                      return (
                        <label 
                          key={idx} 
                          className={`
                            block p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none
                            ${isSelected 
                              ? 'border-[#0e5e6f] bg-[#bfebd4]/20 dark:bg-[#1a3830]/35 text-[#0e5e6f] dark:text-[#bfebd4]' 
                              : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50'}
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black transition ${isSelected ? 'bg-[#0e5e6f] text-white border-[#0e5e6f]' : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                              {optionLetters[idx]}
                            </div>
                            <input 
                              type="radio" 
                              name={`q-${currentQuestionIdx}`} 
                              checked={isSelected}
                              onChange={() => handleAnswer(currentQuestionIdx, idx)}
                              className="hidden"
                            />
                            <span className="text-sm font-black">{opt}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* True/False Option Selections */}
                {qType === 'boolean' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = answers[currentQuestionIdx] === idx;
                      return (
                        <label 
                          key={idx} 
                          className={`
                            block p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none text-center
                            ${isSelected 
                              ? idx === 0 
                                ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                                : 'border-rose-600 bg-rose-500/10 text-rose-700 dark:text-rose-400'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50'}
                          `}
                        >
                          <input 
                            type="radio" 
                            name={`q-${currentQuestionIdx}`} 
                            checked={isSelected}
                            onChange={() => handleAnswer(currentQuestionIdx, idx)}
                            className="hidden"
                          />
                          <div className="text-lg font-black">{opt}</div>
                          <span className="text-[10px] text-slate-400 block mt-1 font-bold">
                            خيار الرمز بابل شيت: ({optionLetters[idx]})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Essay Textarea Input */}
                {qType === 'essay' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[currentQuestionIdx] || ''}
                      onChange={(e) => handleAnswer(currentQuestionIdx, e.target.value)}
                      placeholder="اكتب إجابتك المقالية الأكاديمية المفصلة والكاملة هنا..."
                      className="w-full h-44 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-850 dark:text-slate-100 focus:border-[#0e5e6f] focus:outline-none text-right font-bold text-sm leading-relaxed"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1 select-none">
                      <span>حالة الحفظ: تلقائي بذاكرة الورقة ✓</span>
                      <span>عدد الحروف المدخلة: {(answers[currentQuestionIdx] || '').length} حرف</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Navigation Actions Footer */}
              <div className="mt-8 pt-6 border-t-2 border-slate-100 dark:border-slate-900/50 flex justify-between items-center">
                <button 
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 disabled:pointer-events-none font-black text-xs transition active:scale-95"
                >
                  السابق
                </button>

                {currentQuestionIdx === activeExam.questions.length - 1 ? (
                  <button 
                    onClick={submitExam}
                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2"
                  >
                    <Send size={13} />
                    تأكيد وتسليم البابل شيت
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white rounded-xl font-black text-xs shadow-md transition active:scale-95"
                  >
                    التالي
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in text-right">
      
      {/* View Title Panel */}
      <div className="glass-premium p-8 rounded-3xl relative overflow-hidden border-2 border-[#82af96]/30">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0e5e6f] to-[#178a9e] flex items-center justify-center text-white shadow-lg shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
              البابل شيت ونظام الاختبارات الإلكترونية لمعهد طيبة
            </h2>
            <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1">
              أدِ اختباراتك الإلكترونية، وقدم ورقة إجابة البابل شيت الرقمية مباشرة للرصد والتقييم الفوري.
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#0e5e6f] rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Available Exams directly displayed (Zero guidelines / static barriers) */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-[#0e5e6f] dark:text-[#bfebd4] px-1 flex items-center gap-2 justify-end">
          الاختبارات النشطة المتاحة لفرقتك حالياً
          <Clock size={16} />
        </h3>

        {exams.length === 0 ? (
          <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/50">
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-300">📢 لا توجد امتحانات نشطة حالياً.</p>
            <p className="text-[11px] text-slate-500 font-bold mt-1">سيقوم الكادر التعليمي بنشر اختبارات التقويم والمحاكاة الأسبوعية قريباً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(exam => {
              const solved = solvedExams[exam.id];
              const status = getExamStatus(exam);
              
              return (
                <div 
                  key={exam.id} 
                  className="glass-premium p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between border-2 border-slate-200 dark:border-slate-800 hover:border-[#0e5e6f]/40 dark:hover:border-[#bfebd4]/40 transition group text-right shadow-sm gap-4"
                >
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#0e5e6f] dark:group-hover:text-[#bfebd4] transition">
                      {exam.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#0e5e6f] dark:text-[#bfebd4]" /> {exam.duration} دقيقة
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText size={12} className="text-[#0e5e6f] dark:text-[#bfebd4]" /> {exam.questions?.length || 0} أسئلة اختبارية
                      </span>
                    </div>

                    {(exam.startDate || exam.endDate) && (
                      <div className="text-[9px] text-slate-400 font-bold space-y-0.5">
                        {exam.startDate && <div>تاريخ البدء: {new Date(exam.startDate).toLocaleString('ar-EG')}</div>}
                        {exam.endDate && <div>تاريخ الانتهاء: {new Date(exam.endDate).toLocaleString('ar-EG')}</div>}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {solved ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${
                          solved.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}>
                          {solved.status === 'pending' ? 'بانتظار مراجعة المقالي ⏳' : 'تم الحل والاعتماد بنجاح ✅'}
                        </span>
                        <button 
                          onClick={() => {
                            setActiveExam(exam);
                            setResult(solved);
                          }}
                          className="px-3.5 py-2 bg-[#0e5e6f] hover:bg-[#178a9e] text-white rounded-xl text-[10px] font-black transition active:scale-95 shadow-sm"
                        >
                          معاينة النتيجة والدرجة ({solved.finalScore !== undefined ? solved.finalScore : solved.score} / {solved.total}) 📝
                        </button>
                      </div>
                    ) : !status.active ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[9px] font-black border border-rose-500/20">
                          {status.message}
                        </span>
                        <button 
                          disabled 
                          className="px-4 py-2.5 bg-slate-350 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold rounded-xl text-xs cursor-not-allowed opacity-50 transition"
                        >
                          غير متاح حالياً ⏰
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => startExam(exam)} 
                        className="px-5 py-2.5 bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] hover:opacity-90 active:scale-95 text-white font-extrabold rounded-xl text-xs shadow-md transition"
                      >
                        ابدأ الاختبار 🚀
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
