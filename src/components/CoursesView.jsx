import React, { useState } from 'react';
import { Video, FileText, CheckCircle, Clock, GraduationCap, BookOpen, ChevronRight } from 'lucide-react';
import { db, appId } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CoursesView({ materials, subView = 'books' }) {
  const [downloadingMatId, setDownloadingMatId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState('');
  
  const handleDownload = async (item) => {
    if (!item) return;
    const { url, id: matId, title } = item;

    if (url && url.startsWith('chunked:')) {
      setDownloadingMatId(matId);
      setDownloadProgress(10);
      try {
        const actualMaterialId = url.split(':')[1];
        setDownloadProgress(25);
        
        // Fetch all chunk documents from firestore in parallel
        const chunksRef = collection(db, 'artifacts', appId, 'public', 'data', 'materials', actualMaterialId, 'chunks');
        setDownloadProgress(40);
        const querySnapshot = await getDocs(chunksRef);
        setDownloadProgress(65);
        
        const chunkDocs = querySnapshot.docs.map(doc => doc.data());
        if (chunkDocs.length === 0) {
          throw new Error("لم يتم العثور على أجزاء الملف.");
        }
        
        // Sort chunks by their index
        chunkDocs.sort((a, b) => a.index - b.index);
        setDownloadProgress(80);
        
        // Re-assemble the split Base64 string
        const fullBase64 = chunkDocs.map(c => c.data).join('');
        setDownloadProgress(90);

        // Convert base64 stream directly into a safe local URL Blob
        const base64Data = fullBase64.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        setDownloadProgress(100);

        // Save URL and Title to open our beautiful inline previewer modal
        setPreviewPdfUrl(blobUrl);
        setPreviewPdfTitle(title);
      } catch (err) {
        console.error("Error opening chunked PDF:", err);
        alert('⚠️ حدث خطأ أثناء تجميع وتحميل ملف الـ PDF من الخادم السحابي.');
      } finally {
        setDownloadingMatId(null);
        setDownloadProgress(0);
      }
    } else if (url && url.startsWith('data:application/pdf;base64,')) {
      try {
        // Convert Base64 directly into a safe local URL Blob
        const base64Data = url.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        // Save URL and Title to open our beautiful inline previewer modal
        setPreviewPdfUrl(blobUrl);
        setPreviewPdfTitle(title);
      } catch (err) {
        console.error("Error opening base64 PDF:", err);
        alert('⚠️ حدث خطأ أثناء معالجة وعرض ملف الـ PDF المباشر.');
      }
    } else if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      alert('⚠️ لم يتم ربط هذا الملف الأكاديمي برابط تحميل خارجي من قبل المشرفين بعد.');
    }
  };

  // Classify materials based on type
  const normalMaterials = materials.filter(m => m.type !== 'midterm_review' && m.type !== 'final_review');
  const midtermReviews = materials.filter(m => m.type === 'midterm_review');
  const finalReviews = materials.filter(m => m.type === 'final_review');

  const getIcon = (type) => {
    switch(type) {
      case 'video': return <Video size={36} className="text-rose-600 animate-pulse" />;
      case 'pdf': return <FileText size={36} className="text-[#0e5e6f]" />;
      case 'summary': return <CheckCircle size={36} className="text-[#2c5e43]" />;
      case 'midterm_review': return <Clock size={36} className="text-amber-600" />;
      case 'final_review': return <GraduationCap size={36} className="text-purple-600" />;
      default: return <BookOpen size={36} className="text-[#0e5e6f]" />;
    }
  };

  // Render 1: Standard courses
  if (subView === 'books') {
    return (
      <div className="space-y-8 fade-in text-right">
        <div className="flex justify-between items-center border-r-4 border-[#0e5e6f] pr-3">
          <h2 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
            المقررات والكتب الدراسية الرسمية
          </h2>
        </div>
        
        {/* Grid of Standard Materials */}
        {normalMaterials.length === 0 ? (
          <div className="glass-premium p-8 rounded-3xl text-center text-slate-600 dark:text-slate-300 font-black">
            لا توجد محاضرات قياسية مرفوعة حالياً لهذه الدفعة.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalMaterials.map((mat) => (
              <div key={mat.id} className="glass-premium rounded-2xl overflow-hidden flex flex-col hover:translate-y-[-5px] transition-all duration-300 border-2 border-[#82af96] dark:border-[#3c6550]">
                <div className="h-32 bg-[#bfebd4]/20 dark:bg-[#09171a] flex items-center justify-center relative">
                   {getIcon(mat.type)}
                </div>
                <div className="p-5 flex-1 flex flex-col text-right">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black px-3 py-1 bg-[#bfebd4] text-[#0e5e6f] dark:bg-[#2c5e43] dark:text-[#bfebd4] rounded-lg">
                      {mat.major}
                    </span>
                    <span className="text-xs font-extrabold text-[#0e5e6f] dark:text-[#bfebd4]">{mat.type?.toUpperCase()}</span>
                  </div>
                  <h3 className="font-extrabold text-base mb-4 text-[#0e5e6f] dark:text-[#bfebd4] leading-snug">{mat.title}</h3>
                  <button 
                    onClick={() => handleDownload(mat)}
                    className="mt-auto w-full py-2.5 bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white hover:opacity-90 transition rounded-xl font-black text-xs flex items-center justify-center gap-2"
                  >
                    تحميل ومذاكرة الملف الأكاديمي <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {downloadingMatId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-8 text-center border border-[#82af96] shadow-2xl space-y-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full border-4 border-[#bfebd4]/20 border-t-[#0e5e6f] animate-spin mx-auto flex items-center justify-center text-xs font-black text-[#0e5e6f]">
                {downloadProgress}%
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-[#bfebd4] pt-2">
                جاري تجميع الملف الدراسي السحابي
              </h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                نحن نقوم بتحميل كتل الملف وتوليد نسخة PDF مشفرة وعالية الدقة مباشرة لجهازك فوريًا...
              </p>
            </div>
          </div>
        )}

        {previewPdfUrl && (
          <div className="fixed inset-0 z-[9999] flex flex-col p-4 md:p-6 bg-slate-950/95 backdrop-blur-md">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-right">
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewPdfUrl;
                    a.download = (previewPdfTitle || 'study-file') + '.pdf';
                    a.click();
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-[10px] md:text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  تحميل الملف 📥
                </button>
                <button
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setPreviewPdfTitle('');
                  }}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white font-black text-[10px] md:text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  إغلاق ✖
                </button>
              </div>
              <h3 className="text-xs md:text-sm font-black text-slate-100 truncate max-w-full">
                {previewPdfTitle}
              </h3>
            </div>
            <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative" style={{ WebkitOverflowScrolling: 'touch' }}>
              <iframe
                src={previewPdfUrl}
                title={previewPdfTitle}
                className="w-full h-full border-none rounded-3xl bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render 2: Midterm reviews
  if (subView === 'midterm') {
    return (
      <div className="space-y-8 fade-in text-right">
        <div className="flex justify-between items-center border-r-4 border-amber-600 pr-3">
          <h2 className="text-2xl font-black text-amber-600 dark:text-amber-400">
            مراجعات وملخصات الميدتيرم (منتصف الفصل)
          </h2>
        </div>

        {midtermReviews.length === 0 ? (
          <div className="glass-premium p-8 rounded-3xl text-center text-slate-600 dark:text-slate-300 font-black border-2 border-amber-500/20">
            لا توجد مراجعات ميدتيرم مرفوعة لهذه الدفعة بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {midtermReviews.map((review) => (
              <div key={review.id} className="glass-premium rounded-2xl overflow-hidden flex flex-col hover:translate-y-[-5px] transition-all duration-300 border-2 border-amber-500/30">
                <div className="h-32 bg-amber-500/10 dark:bg-[#09171a] flex items-center justify-center relative">
                   {getIcon(review.type)}
                </div>
                <div className="p-5 flex-1 flex flex-col text-right">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg">
                      {review.major}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">MIDTERM</span>
                  </div>
                  <h3 className="font-extrabold text-base mb-4 text-[#0e5e6f] dark:text-[#bfebd4] leading-snug">{review.title}</h3>
                  <button 
                    onClick={() => handleDownload(review)}
                    className="mt-auto w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:opacity-90 transition rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                  >
                    تحميل المراجعة المعتمدة <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {downloadingMatId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-8 text-center border border-[#82af96] shadow-2xl space-y-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full border-4 border-[#bfebd4]/20 border-t-amber-600 animate-spin mx-auto flex items-center justify-center text-xs font-black text-amber-600">
                {downloadProgress}%
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-amber-500 pt-2">
                جاري تجميع الملف الدراسي السحابي
              </h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                نحن نقوم بتحميل كتل الملف وتوليد نسخة PDF مشفرة وعالية الدقة مباشرة لجهازك فوريًا...
              </p>
            </div>
          </div>
        )}

        {previewPdfUrl && (
          <div className="fixed inset-0 z-[9999] flex flex-col p-4 md:p-6 bg-slate-950/95 backdrop-blur-md">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-right">
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewPdfUrl;
                    a.download = (previewPdfTitle || 'study-file') + '.pdf';
                    a.click();
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-[10px] md:text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  تحميل الملف 📥
                </button>
                <button
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setPreviewPdfTitle('');
                  }}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white font-black text-[10px] md:text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  إغلاق ✖
                </button>
              </div>
              <h3 className="text-xs md:text-sm font-black text-slate-100 truncate max-w-full">
                {previewPdfTitle}
              </h3>
            </div>
            <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative" style={{ WebkitOverflowScrolling: 'touch' }}>
              <iframe
                src={previewPdfUrl}
                title={previewPdfTitle}
                className="w-full h-full border-none rounded-3xl bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render 3: Final reviews
  if (subView === 'final') {
    return (
      <div className="space-y-8 fade-in text-right">
        <div className="flex justify-between items-center border-r-4 border-purple-600 pr-3">
          <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">
            المراجعات النهائية ومذكرات الفاينال الشاملة
          </h2>
        </div>

        {finalReviews.length === 0 ? (
          <div className="glass-premium p-8 rounded-3xl text-center text-slate-600 dark:text-slate-300 font-black border-2 border-purple-500/20">
            لا توجد مراجعات فاينال مرفوعة لهذه الدفعة بعد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalReviews.map((review) => (
              <div key={review.id} className="glass-premium rounded-2xl overflow-hidden flex flex-col hover:translate-y-[-5px] transition-all duration-300 border-2 border-purple-500/30">
                <div className="h-32 bg-purple-500/10 dark:bg-[#09171a] flex items-center justify-center relative">
                   {getIcon(review.type)}
                </div>
                <div className="p-5 flex-1 flex flex-col text-right">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 rounded-lg">
                      {review.major}
                    </span>
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">FINAL</span>
                  </div>
                  <h3 className="font-extrabold text-base mb-4 text-[#0e5e6f] dark:text-[#bfebd4] leading-snug">{review.title}</h3>
                  <button 
                    onClick={() => handleDownload(review)}
                    className="mt-auto w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:opacity-90 transition rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                  >
                    تحميل مراجعة الفاينال <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {downloadingMatId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-8 text-center border border-purple-500 shadow-2xl space-y-4 rounded-3xl">
              <div className="w-16 h-16 rounded-full border-4 border-[#bfebd4]/20 border-t-purple-600 animate-spin mx-auto flex items-center justify-center text-xs font-black text-purple-600">
                {downloadProgress}%
              </div>
              <h3 className="text-md font-black text-slate-800 dark:text-purple-400 pt-2">
                جاري تجميع الملف الدراسي السحابي
              </h3>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                نحن نقوم بتحميل كتل الملف وتوليد نسخة PDF مشفرة وعالية الدقة مباشرة لجهازك فوريًا...
              </p>
            </div>
          </div>
        )}

        {previewPdfUrl && (
          <div className="fixed inset-0 z-[9999] flex flex-col p-4 md:p-6 bg-slate-950/95 backdrop-blur-md">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-right">
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewPdfUrl;
                    a.download = (previewPdfTitle || 'study-file') + '.pdf';
                    a.click();
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-[10px] md:text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  تحميل الملف 📥
                </button>
                <button
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setPreviewPdfTitle('');
                  }}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white font-black text-[10px] md:text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  إغلاق ✖
                </button>
              </div>
              <h3 className="text-xs md:text-sm font-black text-slate-100 truncate max-w-full">
                {previewPdfTitle}
              </h3>
            </div>
            <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative" style={{ WebkitOverflowScrolling: 'touch' }}>
              <iframe
                src={previewPdfUrl}
                title={previewPdfTitle}
                className="w-full h-full border-none rounded-3xl bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
