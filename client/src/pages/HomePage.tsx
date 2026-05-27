import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import { 
  Zap, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  Video, 
  BookOpen, 
  Flame, 
  Check, 
  Activity 
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Course {
  id: number;
  title: string;
  description?: string;
  level?: string;
  coverMediaId?: number;
  status?: number | string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const sectionStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  const firstName = (user?.fullName || "bạn").split(" ").at(-1);

  useEffect(() => {
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE_URL}/api/courses`, { headers })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => {
        const published = (data.items || []).filter(
          (c: Course) => c.status === 1 || c.status === "Published" || c.status === "published"
        );
        setCourses(published.slice(0, 3));
      })
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setProfile(data);
        }
      })
      .catch(() => {});
  }, [user]);

  const avatarSrc = profile?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=3c6d44&color=fff`;

  // "Tiếp tục học" - first course in list as active
  const activeCourse = courses[0];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="min-h-screen bg-transparent py-8 md:py-10"
    >
      <div className="container max-w-6xl mx-auto px-4 md:px-6 space-y-8">
        
        {/* ─── ROW 1: WELCOME BANNER & STATS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Welcome glassmorphic banner */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.03)] p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 h-full"
          >
            <div className="space-y-4 max-w-md text-center md:text-left">
              <h1 className="text-3xl font-black text-slate-800 leading-tight">
                Chào mừng trở lại,<br />
                <span className="bg-gradient-to-r from-[#2d6a4f] to-[#3a8e63] bg-clip-text text-transparent">{firstName}!</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bạn đang làm rất tốt. Chỉ còn 15% nữa là hoàn thành chứng chỉ Cử chỉ Giao tiếp Cơ bản.
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[10px] font-extrabold text-[#2d6a4f]">
                  <Flame size={12} className="fill-[#2d6a4f] shrink-0" />
                  7 ngày liên tiếp
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-[10px] font-extrabold text-amber-600">
                  <Zap size={12} className="fill-amber-500 stroke-amber-500 shrink-0" />
                  1,240 XP
                </span>
              </div>
            </div>

            {/* Radial progress bar */}
            <div className="relative flex items-center justify-center h-28 w-28 shrink-0 select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  className="stroke-slate-100"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  className="stroke-[#2d6a4f]"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - 0.85)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800">85%</span>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Tiến độ</span>
              </div>
            </div>
          </motion.div>

          {/* Right quick stats stacked (Equal height using flex flex-col items-stretch h-full) */}
          <div className="flex flex-col gap-4 h-full justify-between items-stretch">
            
            {/* Stat 1: Word Count Widget */}
            <motion.div
              variants={fadeInUp}
              className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_20px_rgba(24,35,51,0.02)] p-5 flex items-center justify-between hover:shadow-[0_15px_25px_rgba(24,35,51,0.04)] transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Từ ngữ đã học</p>
                <p className="text-xl font-black text-slate-800 mt-1">
                  128 <span className="text-xs font-bold text-slate-400">từ</span>
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Số từ đã học</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#f4fbf6] flex items-center justify-center shrink-0 border border-emerald-50">
                <BookOpen size={18} className="text-[#2d6a4f]" />
              </div>
            </motion.div>

            {/* Stat 2: Daily Goal */}
            <motion.div
              variants={fadeInUp}
              className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_20px_rgba(24,35,51,0.02)] p-5 flex items-center justify-between hover:shadow-[0_15px_25px_rgba(24,35,51,0.04)] transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Mục tiêu ngày</p>
                <p className="text-xl font-black text-slate-800 mt-2">
                  15 <span className="text-xs font-bold text-slate-400">/ 20 Phút</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#f4fbf6] flex items-center justify-center shrink-0 border border-emerald-50">
                <Clock size={18} className="text-[#2d6a4f]" />
              </div>
            </motion.div>

          </div>
        </div>

        {/* ─── ROW 2: AI PRACTICE & ACTIVE LESSON ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* AI Vision Card (60% width equivalent) */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-3 relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0c1912] via-[#102318] to-[#08120d] border border-emerald-950/30 p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(24,35,30,0.15)] group h-[350px] md:h-[340px]"
          >
            {/* Cyber Grid/HUD backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(45,106,79,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(45,106,79,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
            
            {/* Interactive glowing light blobs */}
            <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-[#2d6a4f]/10 blur-[60px] pointer-events-none group-hover:bg-[#2d6a4f]/15 transition-all duration-500" />
            
            {/* Top high-tech tag */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.18em] uppercase">AI Vision Ready</span>
            </div>

            {/* Description */}
            <div className="relative z-10 max-w-sm mt-4 lg:mt-0">
              <h3 className="text-2xl font-black text-white leading-tight mb-3">Luyện tập & Kiểm tra AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Sử dụng AI tiên tiến nhất để thực hành học tập, tự kiểm tra và đánh giá độ chính xác của các cử chỉ ký hiệu trực tiếp qua webcam.
              </p>
            </div>

            {/* Action button */}
            <div className="relative z-10 flex items-center pt-4 lg:pt-0">
              <Link
                to="/ai-tracker"
                className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#2d6a4f]/10 transition-all hover:scale-[1.02] duration-300"
              >
                <Video size={14} />
                Mở Camera AI
              </Link>
            </div>

            {/* High-tech HUD scanning graphic on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden md:flex items-center justify-end p-6 pointer-events-none overflow-hidden select-none">
              <div className="relative w-48 h-48 border border-emerald-500/10 rounded-full flex items-center justify-center">
                <div className="absolute inset-2 border border-dashed border-emerald-500/10 rounded-full" />
                <div className="absolute inset-8 border border-emerald-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-16 border-2 border-emerald-500/30 rounded-full border-t-transparent animate-[spin_4s_linear_infinite]" />
                <div className="w-12 h-12 bg-[#2d6a4f]/15 rounded-full flex items-center justify-center">
                  <Activity size={18} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Active Course Card (40% width equivalent) */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.03)] p-8 flex flex-col items-center text-center justify-between h-[350px] md:h-[340px] hover:shadow-[0_20px_40px_rgba(24,35,51,0.06)] transition-all duration-300"
          >
            {/* Circular Illustration */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-50 border-4 border-slate-100 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={avatarSrc}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full">
              <h4 className="text-base font-bold text-slate-800 leading-snug">
                Tiếp tục học: {activeCourse ? activeCourse.title : "Cảm ơn"}
              </h4>
              <p className="text-[10px] text-slate-400 font-extrabold mt-1 uppercase tracking-wider">
                {activeCourse ? `Cơ bản • ${activeCourse.level || "Bài học 1"}` : "Bài học thứ 12 trong chuỗi Giao tiếp 1"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full px-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                <span>Tiến độ bài</span>
                <span className="text-slate-600">65%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: "65%" }} />
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to={activeCourse ? `/khoa-hoc/${activeCourse.id}` : "/khoa-hoc"}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors duration-300"
            >
              Học tiếp
              <ArrowRight size={14} />
            </Link>
          </motion.div>

        </div>

        {/* ─── ROW 3: RECENT AI TRANSLATIONS ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800">Bản dịch gần đây</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Lịch sử tương tác AI của bạn</p>
            </div>
            <Link 
              to="/tu-dien" 
              className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-0.5"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <motion.div 
            variants={sectionStagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { text: '"Xin chào"', accuracy: "98%", time: "12:30 PM" },
              { text: '"Cảm ơn"', accuracy: "94%", time: "Hôm qua" },
              { text: '"Bạn tên là gì?"', accuracy: "91%", time: "2 ngày trước" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="relative bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-[0_8px_20px_rgba(24,35,51,0.02)] hover:shadow-[0_12px_25px_rgba(24,35,51,0.04)] transition-all duration-300 cursor-pointer"
              >
                <span className="absolute top-5 right-5 text-[9px] font-bold text-slate-400">{item.time}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/30">
                    <Clock size={16} className="text-[#2d6a4f]" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase leading-none">Dịch sang văn bản</p>
                    <h4 className="text-base font-bold text-slate-800 mt-1 leading-snug">{item.text}</h4>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <Check size={14} className="stroke-[3]" />
                  <span>Chính xác {item.accuracy}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
