import { useState } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { UserPlus } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

export default function FriendSystemView({ profile, studentDirectory, friendships, onViewProfile }) {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [message, setMessage] = useState('');

  const getFriendAvatar = (student) => {
    if (student.avatarUrl) return student.avatarUrl;
    return student.gender === 'أنثى'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tiera'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian';
  };

  const handleSearch = () => {
    setMessage('');
    setSearchResult(null);
    if (!searchId.trim()) return;

    // Search by exact Student ID (Rule 2: Search in memory)
    const found = studentDirectory.find(s => s.studentId?.toLowerCase() === searchId.trim().toLowerCase());
    
    if (found) {
      if (found.uid === profile.uid) {
        setMessage('هذا هو رقم القيد الأكاديمي الخاص بك!');
      } else {
        setSearchResult(found);
      }
    } else {
      setMessage('لم يتم العثور على أي طالب مسجل برقم القيد هذا.');
    }
  };

  const sendFriendRequest = async (targetStudent) => {
    try {
      // Check if already sent
      const exists = friendships.find(f => 
        (f.senderUid === profile.uid && f.receiverUid === targetStudent.uid) ||
        (f.senderUid === targetStudent.uid && f.receiverUid === profile.uid)
      );

      if (exists) {
        setMessage('يوجد بالفعل طلب صداقة معلق أو مقبول مع هذا الطالب.');
        return;
      }

      const friendRef = collection(db, 'artifacts', appId, 'public', 'data', 'friendships');
      await addDoc(friendRef, {
        senderUid: profile.uid,
        senderName: profile.name,
        senderId: profile.studentId,
        receiverUid: targetStudent.uid,
        receiverName: targetStudent.name,
        receiverId: targetStudent.studentId,
        status: 'pending'
      });

      setMessage(`تم إرسال طلب الصداقة الأكاديمية بنجاح إلى ${targetStudent.name}!`);
      setSearchResult(null);
      setSearchId('');
    } catch (err) {
      console.error(err);
    }
  };

  const respondRequest = async (friendshipId, isAccept) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'friendships', friendshipId);
      if (isAccept) {
        await updateDoc(docRef, { status: 'accepted' });
      } else {
        await updateDoc(docRef, { status: 'rejected' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get pending incoming requests
  const incomingRequests = friendships.filter(f => f.status === 'pending' && f.receiverUid === profile.uid);

  // Get active friends list
  const activeFriends = friendships
    .filter(f => f.status === 'accepted' && (f.senderUid === profile.uid || f.receiverUid === profile.uid))
    .map(f => {
      const friendUid = f.senderUid === profile.uid ? f.receiverUid : f.senderUid;
      return studentDirectory.find(s => s.uid === friendUid) || { uid: friendUid, name: 'طالب غير معروف', studentId: 'TBA' };
    });

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in text-right">
      <h2 className="text-2xl font-black border-r-4 border-[#0e5e6f] pr-3 text-[#0e5e6f] dark:text-[#bfebd4]">
        البحث وبناء شبكة الصداقات الكلية لمعهد طيبة
      </h2>

      {/* Find Friend Card */}
      <div className="glass-premium p-6 rounded-3xl border-2 border-[#82af96] dark:border-[#3c6550]">
        <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-[#0e5e6f] dark:text-[#bfebd4]">
          <UserPlus size={20} className="text-[#0e5e6f] dark:text-[#bfebd4]" />
          البحث عن الزميل برقم القيد الأكاديمي (ID)
        </h3>
        <p className="text-xs text-slate-800 dark:text-slate-300 mb-4 font-black">
          أدخل رقم القيد المكون من (TBA-XXXXX) لإرسال طلب الصداقة الفورية الخاصة.
        </p>

        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="ادخل رقم القيد الأكاديمي للزميل..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="flex-1 input-academic rounded-xl px-4 py-3 font-black focus:outline-none"
          />
          <button onClick={handleSearch} className="px-6 py-3 btn-primary text-white rounded-xl font-bold text-xs shrink-0 shadow-md">
            البحث في الدليل
          </button>
        </div>

        {message && <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-3">{message}</p>}

        {searchResult && (
          <div className="mt-6 p-4 bg-white dark:bg-[#0d2328] border-2 border-[#82af96] dark:border-[#3c6550] rounded-2xl flex items-center justify-between fade-in shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile && onViewProfile(searchResult)}>
              <div className="w-12 h-12 rounded-full bg-slate-200 p-0.5 border border-slate-300 shrink-0">
                 <img src={getFriendAvatar(searchResult)} alt="avatar" className="w-full h-full rounded-full object-cover"/>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-sm text-[#0e5e6f] dark:text-[#bfebd4]">{searchResult.name}</h4>
                  <VerifiedBadge />
                </div>
                <p className="text-xs text-slate-500 font-semibold">{searchResult.cohort} - {searchResult.major}</p>
              </div>
            </div>
            <button 
              onClick={() => sendFriendRequest(searchResult)} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs"
            >
              إرسال طلب الصداقة
            </button>
          </div>
        )}
      </div>

      {/* Friend Requests & Friends lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Incoming Requests */}
        <div className="glass-premium p-6 rounded-3xl border-2 border-[#82af96] dark:border-[#3c6550]">
          <h3 className="text-base font-black mb-4 text-[#0e5e6f] dark:text-[#bfebd4] border-b-2 border-[#82af96] pb-2">طلبات الصداقة الواردة ({incomingRequests.length})</h3>
          {incomingRequests.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold py-4">لا توجد طلبات صداقة معلقة حالياً.</p>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map(req => {
                const senderDetails = studentDirectory.find(s => s.uid === req.senderUid) || {};
                return (
                  <div key={req.id} className="p-3 bg-white dark:bg-[#0d2328] rounded-xl border-2 border-[#82af96] dark:border-[#3c6550] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onViewProfile && onViewProfile({ ...senderDetails, name: req.senderName, studentId: req.senderId, uid: req.senderUid })}>
                      <img src={getFriendAvatar({ ...senderDetails, gender: senderDetails.gender })} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-xs text-[#0e5e6f] dark:text-[#bfebd4]">{req.senderName}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">ID: {req.senderId}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => respondRequest(req.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black"
                      >
                        قبول الطلب
                      </button>
                      <button 
                        onClick={() => respondRequest(req.id, false)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Friends List */}
        <div className="glass-premium p-6 rounded-3xl border-2 border-[#82af96] dark:border-[#3c6550]">
          <h3 className="text-base font-black mb-4 text-[#0e5e6f] dark:text-[#bfebd4] border-b-2 border-[#82af96] pb-2">الأصدقاء النشطون بالمنصة ({activeFriends.length})</h3>
          {activeFriends.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold py-4">لم تقم بتكوين شبكة صداقات بعد.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {activeFriends.map(friend => (
                <div key={friend.uid} className="p-3 bg-white dark:bg-[#0d2328] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition">
                  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onViewProfile && onViewProfile(friend)}>
                    <div className="relative shrink-0">
                      <img src={getFriendAvatar(friend)} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-slate-300" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0d2328] ${friend.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{friend.name}</h4>
                        <VerifiedBadge />
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold">ID: {friend.studentId} • {friend.status === 'online' ? 'متصل 🟢' : 'غير متصل'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#bfebd4]/70 text-[#0e5e6f] dark:bg-[#2c5e43] dark:text-[#bfebd4] px-2.5 py-1 rounded-full font-black">صديق موثق</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
