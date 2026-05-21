import React, { useState, useEffect } from 'react';
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, appId } from './firebase';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import LandingScreen from './components/LandingScreen';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import DashboardView from './components/DashboardView';
import CoursesView from './components/CoursesView';
import ExamsView from './components/ExamsView';
import UnifiedChatView from './components/UnifiedChatView';
import FriendSystemView from './components/FriendSystemView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import NotificationsView from './components/NotificationsView';
import NewsView from './components/NewsView';


// Icons
import { Settings, Search, Bell, Sun, Moon, AlertTriangle, Menu } from 'lucide-react';

const playNotificationSound = () => {
  try {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.volume = 0.5;
    audio.play().catch(e => console.error('Audio play failed:', e));
  } catch (e) {
    console.error("Audio playback blocked or disabled:", e);
  }
};

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

function BannedView({ profile, handleLogout }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!profile || profile.banType !== 'temp' || !profile.banUntil) return;

    const updateCountdown = () => {
      const diff = profile.banUntil - Date.now();
      if (diff <= 0) {
        setTimeLeft('انتهت فترة العقوبة! يرجى تحديث الصفحة.');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`متبقي تلقائياً: ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية ⏳`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 text-right font-sans relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-650/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-lg w-full bg-slate-900/40 border-2 border-red-500/20 backdrop-blur-2xl p-6 md:p-10 rounded-[36px] text-center space-y-8 shadow-2xl relative z-10">
        
        {/* Animated Warning Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-650/20 rounded-full animate-ping opacity-75" />
          <div className="relative w-24 h-24 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center border-2 border-red-500/30 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">إقرار تعليق الصلاحيات الأكاديمية 🛑</h1>
          <p className="text-xs font-black text-slate-400">معهد طيبة العالي للحاسب والعلوم الإدارية</p>
        </div>

        {/* Personalized Student Info */}
        <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center gap-3 text-right">
          <img 
            src={profile.avatarUrl || (profile.gender === 'أنثى' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian')} 
            alt="Avatar" 
            className="w-12 h-12 rounded-full border border-slate-700 bg-slate-900"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-200 truncate">{profile.name}</h3>
            <p className="text-[10px] font-extrabold text-slate-500">الرقم الأكاديمي: {profile.studentId || 'N/A'} • {profile.cohort}</p>
          </div>
          <span className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] font-black rounded-lg shrink-0">
            الحساب مقيد ⛔
          </span>
        </div>

        {/* Details and Reason Grid Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-5 text-right">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">نوع الإجراء الإداري:</span>
            <p className="text-sm font-bold text-slate-200">
              {profile.banType === 'perm' ? '🚫 حظر نهائي وإقصاء تام من المنصة الدراسية' : '⏳ تعليق مؤقت للعضوية الأكاديمية'}
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">السبب الرسمي المسجل:</span>
            <blockquote className="text-xs font-black text-rose-300 bg-rose-950/20 border-r-4 border-rose-500 p-3.5 rounded-xl leading-relaxed">
              "{profile.banReason || 'مخالفة الضوابط العامة للذوق والأخلاق الأكاديمية بالمنصة.'}"
            </blockquote>
          </div>

          {profile.banType === 'temp' && profile.banUntil && (
            <div className="border-t border-slate-800/80 pt-4 space-y-1.5">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">مؤقت الوقت التنازلي المباشر:</span>
              <div className="text-xs font-black text-amber-300 bg-amber-950/20 border-r-4 border-amber-500 p-3 rounded-xl animate-pulse tracking-wide font-mono">
                {timeLeft || 'جاري المعالجة الحسابية للوقت...'}
              </div>
            </div>
          )}
        </div>

        {/* Instruction Footer */}
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-sm mx-auto">
          ⚠️ تفادياً للإجراءات القانونية، يرجى الالتزام باللوائح والذوق العام بالأقسام التعليمية. للالتماس أو الاستفسار، راجع رئيس الشؤون الطلابية بمقر المعهد.
        </p>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white font-black rounded-2xl text-xs transition duration-200 cursor-pointer shadow-md hover:scale-[1.01]"
        >
          تسجيل الخروج من الحساب الأكاديمي ➡️
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Data states
  const [materials, setMaterials] = useState([]);
  const [exams, setExams] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [privateChatMessages, setPrivateChatMessages] = useState([]);
  const [studentDirectory, setStudentDirectory] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [notiDropdownOpen, setNotiDropdownOpen] = useState(false);
  const [showDevWarning, setShowDevWarning] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [lastSeenNotifications, setLastSeenNotifications] = useState(parseInt(localStorage.getItem('lastSeenNotifications') || '0'));

  const alerts = announcements.filter(a => a.type !== 'news');
  const news = announcements.filter(a => a.type === 'news');
  
  const unreadAlertsCount = alerts.filter(a => (a.createdAt?.toMillis() || 0) > lastSeenNotifications).length;

  const handleOpenNotifications = () => {
    setNotiDropdownOpen(!notiDropdownOpen);
    if (!notiDropdownOpen) {
      const now = Date.now();
      localStorage.setItem('lastSeenNotifications', now.toString());
      setLastSeenNotifications(now);
    }
  };

  useEffect(() => {
    const isHidden = localStorage.getItem('hide_dev_warning');
    if (!isHidden) {
      setShowDevWarning(true);
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Init Firebase Auth
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      }
    };
    initAuth();

    let unsubscribeProfile = null;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        // Admin accounts bypass email verification, so we must load their profile too
        if (currentUser.emailVerified || currentUser.email.includes('admin@taiba.edu')) {
          // Rule 1: Private Profile Path
          const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'details');
          unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data());
            } else {
              setProfile(null);
            }
            setLoading(false);
          }, (err) => {
            console.error("Profile snapshot error:", err);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load Firestore collections (Rule 2: Fetch and filter in-memory)
  useEffect(() => {
    if (!user || !profile) return;

    let groupChatFirstLoad = true;
    let privateChatFirstLoad = true;
    let announcementsFirstLoad = true;
    let materialsFirstLoad = true;
    let examsFirstLoad = true;

    // Fetch Academic Materials
    const fetchMaterials = () => {
      const matRef = collection(db, 'artifacts', appId, 'public', 'data', 'materials');
      return onSnapshot(matRef, (snapshot) => {
        const allMats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (!materialsFirstLoad) {
          const hasNew = snapshot.docChanges().some(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              return data.cohort === profile.cohort && (!data.major || data.major === 'كل التخصصات' || data.major === profile.major);
            }
            return false;
          });
          if (hasNew) {
            playNotificationSound();
          }
        }
        materialsFirstLoad = false;
        
        // Client-side filter to secure current cohort & major materials
        setMaterials(allMats.filter(m => m.cohort === profile.cohort && (!m.major || m.major === 'كل التخصصات' || m.major === profile.major)));
      }, (err) => console.error(err));
    };

    // Fetch Exams
    const fetchExams = () => {
      const examRef = collection(db, 'artifacts', appId, 'public', 'data', 'exams');
      return onSnapshot(examRef, (snapshot) => {
        const allExams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (!examsFirstLoad) {
          const hasNew = snapshot.docChanges().some(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              return data.cohort === profile.cohort && (!data.major || data.major === 'كل التخصصات' || data.major === profile.major);
            }
            return false;
          });
          if (hasNew) {
            playNotificationSound();
          }
        }
        examsFirstLoad = false;
        
        setExams(allExams.filter(e => e.cohort === profile.cohort && (!e.major || e.major === 'كل التخصصات' || e.major === profile.major)));
      }, (err) => console.error(err));
    };

    // Fetch Group Chat Messages for current cohort
    const fetchGroupChat = () => {
      const cohortSafe = profile.cohort.replace(/\s+/g, '_');
      const chatRef = collection(db, 'artifacts', appId, 'public', 'data', `chat_${cohortSafe}`);
      return onSnapshot(chatRef, (snapshot) => {
        const msgs = [];
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
        
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          const msgTime = data.timestamp?.toMillis() || 0;
          
          // التنظيف الذاتي: مسح الرسائل التي مر عليها 3 أيام
          if (msgTime > 0 && msgTime < threeDaysAgo) {
            deleteDoc(docSnap.ref).catch(err => console.error("Auto-delete chat error:", err));
          } else {
            msgs.push({ id: docSnap.id, ...data });
          }
        });

        msgs.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        
        if (!groupChatFirstLoad && msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== profile.uid) {
            playNotificationSound();
          }
        }
        groupChatFirstLoad = false;
        setChatMessages(msgs);
      }, (err) => console.error(err));
    };

    // Fetch Student Directory (to search by Student ID)
    const fetchStudents = () => {
      const dirRef = collection(db, 'artifacts', appId, 'public', 'data', 'student_directory');
      return onSnapshot(dirRef, (snapshot) => {
        setStudentDirectory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error(err));
    };

    // Fetch Friendships
    const fetchFriendships = () => {
      const friendRef = collection(db, 'artifacts', appId, 'public', 'data', 'friendships');
      return onSnapshot(friendRef, (snapshot) => {
        setFriendships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => console.error(err));
    };

    // Fetch Private Chat messages
    const fetchPrivateChats = () => {
      const privRef = collection(db, 'artifacts', appId, 'public', 'data', 'private_chats');
      return onSnapshot(privRef, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        msgs.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        
        if (!privateChatFirstLoad && msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== profile.uid) {
            playNotificationSound();
          }
        }
        privateChatFirstLoad = false;
        setPrivateChatMessages(msgs);
      }, (err) => console.error(err));
    };

    // Fetch Announcements
    const fetchAnnouncements = () => {
      const annRef = collection(db, 'artifacts', appId, 'public', 'data', 'announcements');
      return onSnapshot(annRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        list.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        
        if (!announcementsFirstLoad && list.length > 0) {
          playNotificationSound();
        }
        announcementsFirstLoad = false;
        setAnnouncements(list.filter(a => (!a.cohort || a.cohort === profile.cohort) && (!a.major || a.major === 'كل التخصصات' || a.major === profile.major)));
      }, (err) => console.error(err));
    };

    const unsubMat = fetchMaterials();
    const unsubEx = fetchExams();
    const unsubGroup = fetchGroupChat();
    const unsubDir = fetchStudents();
    const unsubFr = fetchFriendships();
    const unsubPriv = fetchPrivateChats();
    const unsubAnn = fetchAnnouncements();

    return () => {
      unsubMat();
      unsubEx();
      unsubGroup();
      unsubDir();
      unsubFr();
      unsubPriv();
      unsubAnn();
    };
  }, [user, profile]);

  // Update Online/Offline status in student directory
  useEffect(() => {
    if (!user || !profile) return;

    const userDirectoryRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_directory', user.uid);
    
    // Set to online
    updateDoc(userDirectoryRef, { 
      status: 'online', 
      lastSeen: new Date().toISOString() 
    }).catch(err => console.error("Error setting online status:", err));

    const handleUnload = () => {
      updateDoc(userDirectoryRef, { 
        status: 'offline', 
        lastSeen: new Date().toISOString() 
      }).catch(err => console.error("Error setting offline status on unload:", err));
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [user, profile]);

  const handleLogout = async () => {
    try {
      if (user) {
        const userDirectoryRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_directory', user.uid);
        await updateDoc(userDirectoryRef, { 
          status: 'offline', 
          lastSeen: new Date().toISOString() 
        }).catch(err => console.error(err));
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setProfile(null);
    setCurrentView('dashboard');
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09171a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#178a9e] mx-auto mb-4"></div>
          <p className="text-[#bfebd4] font-bold text-lg">بوابة معهد طيبة الأكاديمي...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingScreen onEnter={() => setShowLanding(false)} theme={theme} toggleTheme={toggleTheme} />;
    }
    return <AuthScreen user={null} onProfileComplete={setProfile} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (!user.emailVerified && !user.email.includes('admin@taiba.edu')) {
    return <EmailVerificationScreen user={user} theme={theme} toggleTheme={toggleTheme} handleLogout={handleLogout} />;
  }

  if (!profile) {
    return <AuthScreen user={user} onProfileComplete={setProfile} theme={theme} toggleTheme={toggleTheme} />;
  }

  const isCurrentlyBanned = profile && profile.isBanned && (
    profile.banType === 'perm' || 
    (profile.banType === 'temp' && (!profile.banUntil || profile.banUntil > Date.now()))
  );

  if (isCurrentlyBanned) {
    return <BannedView profile={profile} handleLogout={handleLogout} />;
  }

  const totalUnreadPrivate = privateChatMessages.filter(m => m.senderId !== profile?.uid && !m.read).length;

  return (
    <div className="min-h-screen academic-bg text-[#051619] dark:text-[#f0f7f4] transition-colors duration-300 flex flex-col">
      {/* Disclaimer Moving Ticker Bar */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white text-xs font-black py-2.5 px-4 shadow-md flex items-center justify-between gap-4 z-[999] select-none shrink-0 overflow-hidden" dir="rtl">
        <span className="bg-white text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 animate-pulse border border-red-250 flex items-center gap-1 shadow-sm z-10">
          🚨 تنبيه وإخلاء مسؤولية هام
        </span>
        <div className="flex-1 overflow-hidden relative" dir="ltr">
          <div className="animate-marquee-right whitespace-nowrap flex text-white font-black text-xs md:text-sm pt-0.5">
            <span className="px-16 inline-block">
              ⚠️ هذا الموقع مستقل تماماً وغير مرتبط بأي شكل من الأشكال بمعهد طيبة الأكاديمي أو إدارته نهائياً، ولا يمثل أي جهة رسمية أو تعاملات رسمية للمعهد • المنصة تم تطويرها بمبادرة طلابية مستقلة لمساعدة زملائنا الطلاب بكافة التخصصات الدراسية مجاناً • نهدف لتجميع وتسهيل دراسة المقررات الأكاديمية والمراجعات لتوصيل الفهم والمعلومة للطالب الكريم وليس لنا أي صلة رسمية بإدارة معهد طيبة العالي للحاسب والعلوم الإدارية.
            </span>
            <span className="px-16 inline-block">
              ⚠️ هذا الموقع مستقل تماماً وغير مرتبط بأي شكل من الأشكال بمعهد طيبة الأكاديمي أو إدارته نهائياً، ولا يمثل أي جهة رسمية أو تعاملات رسمية للمعهد • المنصة تم تطويرها بمبادرة طلابية مستقلة لمساعدة زملائنا الطلاب بكافة التخصصات الدراسية مجاناً • نهدف لتجميع وتسهيل دراسة المقررات الأكاديمية والمراجعات لتوصيل الفهم والمعلومة للطالب الكريم وليس لنا أي صلة رسمية بإدارة معهد طيبة العالي للحاسب والعلوم الإدارية.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-38px)] overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar 
          profile={profile} 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          handleLogout={handleLogout}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          unreadPrivateCount={totalUnreadPrivate}
        />

        {/* Main Panel */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Topbar Header */}
          <header className="glass-premium m-2 md:m-4 rounded-xl md:rounded-2xl px-3 md:px-6 py-3 md:py-4 flex justify-between items-center z-20">
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 md:p-2 rounded-xl bg-[#bfebd4]/30 hover:bg-[#bfebd4]/50 transition">
                <Menu size={20} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
              </button>
              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center shadow-lg border border-[#0e5e6f]/50 shrink-0 overflow-hidden">
                  <img src="/logo.jpg" alt="Platform Logo" className="w-full h-full object-cover scale-110" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#0e5e6f] via-[#178a9e] to-[#2c5e43] dark:from-[#bfebd4] dark:to-[#178a9e] truncate">
                    طلاب معهد طيبة
                  </h1>
                  <p className="text-[9px] md:text-xs text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 font-semibold flex items-center gap-1 truncate">
                    {profile.cohort} - {profile.major}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              <div className="hidden md:flex relative items-center bg-white/90 dark:bg-[#09171a]/90 border-2 border-[#82af96] dark:border-[#3c6550] rounded-full px-4 py-1.5 shadow-sm">
                <Search size={16} className="text-[#0e5e6f] ml-2" />
                <input 
                  type="text" 
                  placeholder="ابحث في المقررات والمراجعات..." 
                  className="bg-transparent border-none outline-none text-xs w-48 text-[#051619] dark:text-[#f0f7f4] placeholder-[#82af96]"
                />
              </div>

              <div className="relative">
                <button 
                  type="button" 
                  onClick={handleOpenNotifications}
                  className="p-1.5 md:p-2.5 rounded-full bg-[#bfebd4]/30 hover:bg-[#bfebd4]/50 transition relative"
                >
                  <Bell size={18} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce"></span>
                  )}
                </button>

                {notiDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotiDropdownOpen(false)}></div>
                    <div className="absolute left-0 mt-2 w-[280px] md:w-80 glass-premium rounded-2xl p-4 border-2 border-[#82af96] dark:border-[#3c6550] shadow-2xl z-40 text-right">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black">
                          {unreadAlertsCount > 0 ? `${unreadAlertsCount} جديد` : 'لا جديد'}
                        </span>
                        <h4 className="text-xs font-black text-[#0e5e6f] dark:text-[#bfebd4]">التنبيهات والإشعارات</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {alerts.slice(0, 3).length === 0 ? (
                          <p className="text-center text-xs text-slate-500 py-3 font-bold">لا توجد تنبيهات نشطة حالياً.</p>
                        ) : (
                          alerts.slice(0, 3).map(item => (
                            <div 
                              key={item.id} 
                              onClick={() => {
                                setNotiDropdownOpen(false);
                                setCurrentView('notifications');
                              }}
                              className="p-2.5 rounded-xl hover:bg-[#0e5e6f]/5 dark:hover:bg-[#bfebd4]/5 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                            >
                              <p className="text-xs font-bold text-slate-900 dark:text-[#f0f7f4] line-clamp-2 leading-relaxed">
                                {renderTextWithLinks(item.msg)}
                              </p>
                              <span className="text-[9px] text-slate-400 mt-1 block">
                                {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          setNotiDropdownOpen(false);
                          setCurrentView('notifications');
                        }}
                        className="w-full mt-3 py-2 bg-gradient-to-r from-[#0e5e6f] to-[#178a9e] text-white rounded-xl text-xs font-black hover:opacity-90 active:scale-95 transition shadow-sm"
                      >
                        عرض جميع الإشعارات
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button type="button" onClick={toggleTheme} className="p-1.5 md:p-2.5 rounded-full bg-[#bfebd4]/30 hover:bg-[#bfebd4]/50 transition">
                {theme === 'dark' ? <Sun size={18} className="text-[#bfebd4]" /> : <Moon size={18} className="text-[#0e5e6f]" />}
              </button>

              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#0e5e6f] to-[#bfebd4] p-0.5 cursor-pointer shrink-0" onClick={() => setCurrentView('profile')}>
                <img 
                  src={profile.avatarUrl || (profile.gender === 'أنثى' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian')} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover bg-slate-100"
                />
              </div>
            </div>
          </header>

          {/* Views router */}
          <main className="flex-1 overflow-y-auto px-4 pb-12 fade-in">
            {currentView === 'dashboard' && (
              <DashboardView 
                profile={profile} 
                materials={materials} 
                alerts={alerts}
                news={news}
                studentDirectory={studentDirectory} 
                setCurrentView={setCurrentView} 
              />
            )}
            {currentView === 'courses_books' && <CoursesView materials={materials} subView="books" />}
            {currentView === 'courses_midterm' && <CoursesView materials={materials} subView="midterm" />}
            {currentView === 'courses_final' && <CoursesView materials={materials} subView="final" />}
            {currentView === 'exams' && <ExamsView exams={exams} db={db} appId={appId} profile={profile} initialTab="mcq" />}
            {currentView === 'exams_mcq' && <ExamsView exams={exams} db={db} appId={appId} profile={profile} initialTab="mcq" />}
            {currentView === 'exams_schedules' && <ExamsView exams={exams} db={db} appId={appId} profile={profile} initialTab="schedules" />}
            {currentView === 'chat' && <UnifiedChatView profile={profile} groupMessages={chatMessages} privateMessages={privateChatMessages} friendships={friendships} studentDirectory={studentDirectory} onViewProfile={setActiveProfileModal} />}
            {currentView === 'friends' && <FriendSystemView profile={profile} studentDirectory={studentDirectory} friendships={friendships} onViewProfile={setActiveProfileModal} />}
            {currentView === 'news' && <NewsView news={news} />}
            {currentView === 'notifications' && <NotificationsView announcements={alerts} />}
            {currentView === 'profile' && (
              <ProfileView 
                profile={profile} 
                studentDirectory={studentDirectory} 
                onProfileUpdate={(updatedFields) => {
                  setProfile(prev => ({ ...prev, ...updatedFields }));
                }}
              />
            )}
            {currentView === 'admin' && profile.role === 'admin' && <AdminView profile={profile} />}
            {currentView === 'notifications' && <NotificationsView announcements={announcements} />}
          </main>
          
          <footer className="py-2.5 text-center glass-premium border-none rounded-none mt-auto select-none">
            <span className="signature-font text-[#0e5e6f] dark:text-[#bfebd4] font-black tracking-wide">
              Developed by Taiba Institute Student – <span className="text-rose-600 dark:text-yellow-400">ENG/EL LOL</span>
            </span>
          </footer>
        </div>
      </div>

      {/* Global Student Profile Modal */}
      {activeProfileModal && (() => {
        const student = activeProfileModal;
        const isSelf = student.uid === profile.uid;
        const getModalAvatar = () => {
          if (student.avatarUrl) return student.avatarUrl;
          return student.gender === 'أنثى'
            ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera'
            : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian';
        };

        return (
          <div 
            onClick={() => setActiveProfileModal(null)}
            className="fixed inset-0 bg-[#051619]/70 dark:bg-[#000000]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="glass-premium w-full max-w-md rounded-3xl p-8 border-4 border-[#0e5e6f]/40 dark:border-[#bfebd4]/20 text-right relative scale-in shadow-2xl"
            >
              <button 
                type="button" 
                onClick={() => setActiveProfileModal(null)} 
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#0e5e6f] dark:text-[#bfebd4] hover:scale-105 transition font-extrabold border border-slate-300 z-50"
              >
                ✕
              </button>

              {/* Banner */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#0e5e6f] to-[#bfebd4] opacity-50 rounded-t-3xl"></div>

              <div className="relative z-10 flex flex-col items-center text-center mt-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl shrink-0">
                    <img 
                      src={getModalAvatar()} 
                      alt="Student Avatar" 
                      className="w-full h-full rounded-full object-cover bg-slate-100"
                    />
                  </div>
                  {student.status === 'online' && (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-[#09171a] animate-pulse"></span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-[#0e5e6f] dark:text-[#bfebd4] mt-4 flex items-center gap-1.5 justify-center">
                  {student.name}
                  {student.role === 'admin' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-black">إدارة</span>}
                </h3>
                
                <p className="text-xs font-bold text-[#0e5e6f]/80 dark:text-[#bfebd4]/80 mt-1">
                  {student.status === 'online' ? '🟢 متصل الآن بالمنصة' : `⚪ غير متصل حالياً`}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <span className="px-3.5 py-1.5 bg-[#bfebd4]/55 text-[#0e5e6f] dark:bg-[#2c5e43]/50 dark:text-[#bfebd4] rounded-full text-xs font-black">
                    {student.cohort}
                  </span>
                  <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-full text-xs font-black">
                    {student.major}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-4 bg-white/40 dark:bg-black/30 p-4 rounded-xl border border-[#82af96]/30 dark:border-[#3c6550]/30 w-full text-right leading-relaxed">
                  💡 <strong>النبذة الشخصية:</strong><br />
                  {student.bio || 'طالب في معهد طيبة 🎓'}
                </p>

                <div className="w-full mt-6 space-y-3 text-right bg-white/60 dark:bg-black/40 p-4 rounded-2xl border border-slate-200/50">
                  <h4 className="text-xs font-black text-[#0e5e6f] dark:text-[#bfebd4] border-b pb-1.5">معلومات التواصل الأكاديمي</h4>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">البريد الإلكتروني</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200" dir="ltr">
                      {student.hideEmail && !isSelf && profile.role !== 'admin' ? '🔒 مخفي بواسطة المستخدم' : student.email || 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">رقم الهاتف</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200" dir="ltr">
                      {student.hidePhone && !isSelf && profile.role !== 'admin' ? '🔒 مخفي بواسطة المستخدم' : student.phone || 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">الرقم الأكاديمي المميز</span>
                    <span className="font-extrabold text-[#0e5e6f] dark:text-[#bfebd4]">
                      {student.studentId || 'TBA-XXXXX'}
                    </span>
                  </div>
                </div>

                {/* Classmate Actions (Report / Block / Remove Friend) */}
                {!isSelf && (() => {
                  const friendship = friendships.find(f => 
                    (f.senderUid === profile.uid && f.receiverUid === student.uid) ||
                    (f.senderUid === student.uid && f.receiverUid === profile.uid)
                  );
                  const isFriend = friendship && friendship.status === 'accepted';
                  const isBlocked = friendship && friendship.status === 'blocked';
                  const blockedByMe = isBlocked && friendship.blockedBy === profile.uid;

                  return (
                    <div className="w-full mt-5 border-t border-slate-200 dark:border-slate-800 pt-4 text-right space-y-3">
                      <div className="flex gap-2">
                        {isFriend && (
                          <button 
                            onClick={async () => {
                              if (!friendship) return;
                              if (window.confirm(`هل أنت متأكد من حذف الزميل ${student.name} من الأصدقاء؟`)) {
                                try {
                                  const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'friendships', friendship.id);
                                  await deleteDoc(docRef);
                                  setActiveProfileModal(null);
                                  alert("تم إلغاء الصداقة بنجاح.");
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 rounded-xl text-[10px] font-black transition active:scale-95 shadow-sm"
                          >
                            حذف من الأصدقاء ❌
                          </button>
                        )}

                        <button 
                          onClick={async () => {
                            try {
                              if (isBlocked) {
                                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'friendships', friendship.id);
                                await deleteDoc(docRef);
                                setActiveProfileModal(null);
                                alert("تم فك الحظر الأكاديمي عن هذا الزميل بنجاح.");
                              } else {
                                if (window.confirm(`هل أنت متأكد من حظر الزميل ${student.name}؟ لن يتمكن من مراسلتك بالخاص.`)) {
                                  if (friendship) {
                                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'friendships', friendship.id);
                                    await updateDoc(docRef, { status: 'blocked', blockedBy: profile.uid });
                                  } else {
                                    const friendRef = collection(db, 'artifacts', appId, 'public', 'data', 'friendships');
                                    await addDoc(friendRef, {
                                      senderUid: profile.uid,
                                      senderName: profile.name,
                                      senderId: profile.studentId,
                                      receiverUid: student.uid,
                                      receiverName: student.name,
                                      receiverId: student.studentId,
                                      status: 'blocked',
                                      blockedBy: profile.uid
                                    });
                                  }
                                  setActiveProfileModal(null);
                                  alert("تم حظر هذا الزميل بنجاح.");
                                }
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black transition active:scale-95 shadow-sm ${isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                        >
                          {isBlocked ? 'إلغاء حظر الزميل 🔓' : 'حظر هذا الزميل 🚫'}
                        </button>
                      </div>

                      {/* Report Section */}
                      {!showReportForm ? (
                        <button 
                          onClick={() => setShowReportForm(true)}
                          className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 border border-yellow-500/30 rounded-xl text-[10px] font-black transition active:scale-95 shadow-sm"
                        >
                          ⚠️ إبلاغ عن هذا الطالب لإدارة المنصة
                        </button>
                      ) : (
                        <div className="p-3 bg-yellow-500/5 border-2 border-yellow-500/20 rounded-2xl space-y-2.5 fade-in text-right">
                          <label className="block text-[10px] font-black text-yellow-600">اكتب سبب البلاغ بالتفصيل:</label>
                          <textarea
                            placeholder="اكتب المخالفة أو السبب هنا..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold leading-relaxed focus:outline-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!reportReason.trim()) return;
                                try {
                                  const reportRef = collection(db, 'artifacts', appId, 'public', 'data', 'reports');
                                  await addDoc(reportRef, {
                                    reporterUid: profile.uid,
                                    reporterName: profile.name,
                                    reportedUid: student.uid,
                                    reportedName: student.name,
                                    reason: reportReason,
                                    timestamp: new Date().toISOString()
                                  });
                                  setReportReason('');
                                  setShowReportForm(false);
                                  setActiveProfileModal(null);
                                  alert("تم إرسال بلاغك بنجاح لإدارة المنصة للمراجعة واتخاذ الإجراء اللازم.");
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="flex-1 py-1.5 bg-yellow-500 text-white rounded-lg text-[10px] font-black hover:opacity-90 transition active:scale-95"
                            >
                              إرسال البلاغ
                            </button>
                            <button
                              onClick={() => {
                                setShowReportForm(false);
                                setReportReason('');
                              }}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-black hover:bg-slate-300 transition"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Developer Warning Welcome Modal */}
      {showDevWarning && (
        <div className="fixed inset-0 bg-slate-950/85 dark:bg-black/95 z-[9999] flex items-center justify-center p-3 md:p-4 backdrop-blur-lg transition-all duration-500 fade-in select-none">
          <div className="bg-gradient-to-br from-[#0e5e6f]/25 via-[#0c1f24]/95 to-[#1a3821]/20 border-2 border-yellow-500/40 rounded-[24px] md:rounded-[32px] p-5 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(234,179,8,0.18)] scale-in text-right relative">
            
            {/* Elegant Background glowing lights */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#bfebd4]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Glowing Golden Warning Header */}
            <div className="relative flex justify-center mb-6">
              <div className="absolute inset-0 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl animate-pulse mx-auto"></div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-yellow-500/10 relative z-10 border-2 border-yellow-300 transition-transform hover:rotate-6 duration-300">
                <AlertTriangle size={30} className="animate-bounce text-slate-950" />
              </div>
            </div>

            {/* Warning Title */}
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-center mb-5 tracking-wide">
              تنبيه هام وإخلاء مسؤولية من مطور المنصة
            </h3>

            {/* Warning Body Description */}
            <p className="text-sm text-slate-200 dark:text-slate-100 leading-8 text-justify font-bold bg-white/5 dark:bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
              ⚠️ نود الإحاطة بأن هذا الموقع <span className="text-yellow-400 font-extrabold border-b border-yellow-400/30 pb-0.5">ليس البوابة الرسمية</span> لمعهد طيبة الأكاديمي، بل هو <span className="text-[#bfebd4] font-extrabold">منصة طلابية تفاعلية ودراسية مستقلة</span> بالكامل وليس مسؤولية جهة أكاديمية.
              <br /><br />
              تم تطوير وتصميم هذه المبادرة الأكاديمية بالكامل بواسطة طالب جامعي بالمعهد بهدف تسهيل عملية المذاكرة، حل وتدوين الشيتات، الاستعداد للامتحانات التجريبية المدمجة، واختصار مسافات الوصول للمعلومات لجميع زملائنا الكرام.
            </p>

            {/* Developer Signature Card */}
            <div className="relative bg-gradient-to-r from-[#0e5e6f]/40 to-[#2c5e43]/40 border border-[#82af96]/30 p-5 rounded-2xl flex items-center justify-between shadow-md mt-4 mb-4">
              <div className="z-10 flex flex-col">
                <span className="text-[10px] text-[#bfebd4]/80 font-black tracking-widest uppercase">Developer & Systems Architect</span>
                <span className="text-lg font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300 block mt-0.5" dir="ltr">
                  ENG / EL LOL
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-md select-none">
                💻
              </div>
            </div>

            {/* Glowing Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowDevWarning(false);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-yellow-500/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              >
                موافق، الدخول للمنصة 👍
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('hide_dev_warning', 'true');
                  setShowDevWarning(false);
                }}
                className="py-3.5 px-6 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl font-black text-xs transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
              >
                عدم تذكيري مجدداً 🔕
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
