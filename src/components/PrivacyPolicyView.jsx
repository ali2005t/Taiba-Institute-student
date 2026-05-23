import React from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyView() {
  return (
    <div className="space-y-8 fade-in text-right pb-10">
      <div className="flex justify-between items-center border-r-4 border-[#0e5e6f] pr-3">
        <h2 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4]">
          سياسة الخصوصية وشروط الاستخدام
        </h2>
      </div>

      <div className="glass-premium p-8 rounded-3xl border-2 border-[#82af96]/30 text-slate-800 dark:text-slate-300 leading-relaxed space-y-6">
        
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-[#0e5e6f]/10 p-2 rounded-xl text-[#0e5e6f] dark:text-[#bfebd4]">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#0e5e6f] dark:text-[#bfebd4] mb-2">مقدمة</h3>
            <p className="text-sm font-bold">
              مرحباً بكم في "المنصة الطلابية التفاعلية لطلاب معهد طيبة". نحن نولي أهمية قصوى لخصوصية بياناتكم ومعلوماتكم الشخصية. تشرح هذه السياسة كيف نقوم بجمع واستخدام وحماية البيانات الخاصة بكم أثناء استخدامكم للمنصة.
            </p>
          </div>
        </div>

        <hr className="border-[#82af96]/20" />

        <div className="flex items-start gap-4">
          <div className="mt-1 bg-[#0e5e6f]/10 p-2 rounded-xl text-[#0e5e6f] dark:text-[#bfebd4]">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#0e5e6f] dark:text-[#bfebd4] mb-2">البيانات التي نجمعها</h3>
            <p className="text-sm font-bold mb-2">
              نقوم بجمع المعلومات الأساسية الضرورية لتقديم الخدمة الأكاديمية فقط، والتي تشمل:
            </p>
            <ul className="list-disc list-inside text-sm font-bold space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>الاسم الرباعي كما تم التسجيل به.</li>
              <li>رقم القيد الجامعي (ID) للتحقق من هوية الطالب.</li>
              <li>الفرقة الدراسية والتخصص الأكاديمي لتخصيص المحتوى.</li>
              <li>البريد الإلكتروني المستخدم في عملية التسجيل.</li>
            </ul>
          </div>
        </div>

        <hr className="border-[#82af96]/20" />

        <div className="flex items-start gap-4">
          <div className="mt-1 bg-[#0e5e6f]/10 p-2 rounded-xl text-[#0e5e6f] dark:text-[#bfebd4]">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#0e5e6f] dark:text-[#bfebd4] mb-2">كيفية حماية واستخدام البيانات</h3>
            <p className="text-sm font-bold">
              تُستخدم بياناتكم حصرياً لعرض المقررات الدراسية المناسبة لكم وتسهيل التواصل في الشات الجامعي المغلق. لا نقوم أبداً ببيع أو مشاركة بياناتكم مع أي أطراف خارجية أو جهات إعلانية دون موافقتكم الصريحة. منصتنا تعمل على خوادم سحابية آمنة ومشفرة بالكامل.
            </p>
          </div>
        </div>

        <hr className="border-[#82af96]/20" />

        <div className="flex items-start gap-4">
          <div className="mt-1 bg-[#0e5e6f]/10 p-2 rounded-xl text-[#0e5e6f] dark:text-[#bfebd4]">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-[#0e5e6f] dark:text-[#bfebd4] mb-2">الإعلانات وملفات تعريف الارتباط (Cookies)</h3>
            <p className="text-sm font-bold">
              قد نستخدم مستقبلاً خدمات إعلانية مثل (Google AdSense) والتي قد تستخدم ملفات تعريف الارتباط لعرض إعلانات مخصصة بناءً على زياراتك. استخدامك للمنصة يعني موافقتك على سياسة الاستخدام هذه.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
