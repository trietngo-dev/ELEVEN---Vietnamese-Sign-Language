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
import { notificationsApi } from "../lib/notifications";
import flameCharacterWave from "../assets/flame_character_wave.gif";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Course {
  id: number;
  title: string;
  description?: string;
  level?: string;
  coverMediaId?: number;
  status?: number | string;
}

interface RecentLessonInfo {
  title: string;
  accuracy: string;
  time: string;
  isReal?: boolean;
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Dynamic Statistics States
  const [loginDays, setLoginDays] = useState<number>(0);
  const [learnedWords, setLearnedWords] = useState<number>(0);
  const [learningHours, setLearningHours] = useState<number>(0);
  const [accumulatedXp, setAccumulatedXp] = useState<number>(0);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [recentLessons, setRecentLessons] = useState<RecentLessonInfo[]>([]);

  // 1. Fetch avatar and courses
  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch avatar
    fetch(`${API_BASE_URL}/api/users/${user.id}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData && userData.avatarMediaId) {
          return fetch(`${API_BASE_URL}/api/media_assets/${userData.avatarMediaId}`, { headers });
        }
        return null;
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((mediaData) => {
        if (mediaData && mediaData.fileUrl) {
          setAvatarUrl(mediaData.fileUrl);
        }
      })
      .catch(() => { });

    // Fetch courses
    fetch(`${API_BASE_URL}/api/courses`, { headers })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => {
        const published = (data.items || []).filter(
          (c: Course) => c.status === 1 || c.status === "Published" || c.status === "published"
        );
        setCourses(published.slice(0, 3));
      })
      .catch(() => setCourses([]));
  }, [user]);

  // 2. Fetch User Stats & Proactive Notification Generation
  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // Helper: Post Today Login Log
    const postTodayLoginLog = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/user_activity_logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers
          },
          body: JSON.stringify({
            userId: user.id,
            actionType: "login",
            entityType: "user",
            entityId: user.id,
            metadataJson: "{}"
          })
        });
      } catch (err) {
        console.error("Failed to post login activity log:", err);
      }
    };

    // A. Fetch Login Days & Calculate Streak
    fetch(`${API_BASE_URL}/api/user_activity_logs`, { headers })
      .then(res => res.ok ? res.json() : { items: [] })
      .then(data => {
        const items = data.items || (Array.isArray(data) ? data : data.items) || [];
        const loginLogs = items.filter((log: any) => log.userId === user.id && log.actionType === "login");
        
        // Find all unique dates (YYYY-MM-DD format) in local time
        const uniqueDates = Array.from(new Set(
          loginLogs.map((log: any) => {
            const date = new Date(log.createdAt || log.timestamp);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
          })
        )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const todayStr = new Date(Date.now() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000 - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];

        const hasLoginToday = uniqueDates.includes(todayStr);
        const hasLoginYesterday = uniqueDates.includes(yesterdayStr);

        if (!hasLoginToday) {
          postTodayLoginLog();
          if (!uniqueDates.includes(todayStr)) {
            uniqueDates.unshift(todayStr);
          }
        }

        let streak = 0;
        if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
          streak = 1;
          const startCheckStr = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
          const startIndex = uniqueDates.indexOf(startCheckStr);
          let checkTime = new Date(startCheckStr).getTime();

          for (let i = startIndex + 1; i < uniqueDates.length; i++) {
            const prevTime = new Date(uniqueDates[i]).getTime();
            const diffDays = Math.round((checkTime - prevTime) / 86400000);
            if (diffDays === 1) {
              streak++;
              checkTime = prevTime;
            } else if (diffDays > 1) {
              break;
            }
          }
        }
        setLoginDays(streak);
      })
      .catch(() => {
        setLoginDays(0);
      });

    // B & C. Fetch Completed Lessons & Time & XP
    fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers })
      .then(res => res.ok ? res.json() : { items: [] })
      .then(async (data) => {
        const items = data.items || (Array.isArray(data) ? data : data.items) || [];
        const userProgress = items.filter((p: any) => p.userId === user.id);

        // Word Count: Number of completed lessons
        const completedLessonsCount = userProgress.filter((p: any) => p.status === 2 || p.completedAt).length;
        setLearnedWords(completedLessonsCount);

        if (userProgress.length > 0) {
          // Sum hours
          const totalSeconds = userProgress.reduce((sum: number, p: any) => sum + (p.totalTimeSeconds || 0), 0);
          const calculatedHours = parseFloat((totalSeconds / 3600).toFixed(1));
          setLearningHours(calculatedHours);

          // Sum XP
          const totalXp = userProgress.reduce((sum: number, p: any) => sum + (p.xpEarned || 0), 0);
          setAccumulatedXp(totalXp);

          // Fetch Recent Lessons Info
          const completedProgress = userProgress
            .filter((p: any) => p.completedAt || p.status === 2)
            .sort((a: any, b: any) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())
            .slice(0, 3);

          if (completedProgress.length > 0) {
            // Retrieve lesson names
            const resolved = await Promise.all(
              completedProgress.map(async (p: any) => {
                try {
                  const lessonRes = await fetch(`${API_BASE_URL}/api/lessons/${p.lessonId}`, { headers });
                  if (lessonRes.ok) {
                    const lessonObj = await lessonRes.json();
                    const completionDate = new Date(p.completedAt || p.updatedAt);
                    return {
                      lessonId: p.lessonId,
                      title: lessonObj.title || `Bài học #${p.lessonId}`,
                      accuracy: `${Math.round((p.bestAccuracy || 0.9) * 100)}%`,
                      time: completionDate.toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                      isReal: true
                    };
                  }
                } catch { }
                return null;
              })
            );
            const validResolved = resolved.filter(r => r !== null) as RecentLessonInfo[];
            if (validResolved.length > 0) {
              setRecentLessons(validResolved);
            }
          }

          // Trigger Proactive Notification for Completed Lessons
          const latestCompleted = userProgress.find((p: any) => p.status === 2);
          if (latestCompleted) {
            fetch(`${API_BASE_URL}/api/lessons/${latestCompleted.lessonId}`, { headers })
              .then(res => res.ok ? res.json() : null)
              .then(async (lessonObj) => {
                if (!lessonObj) return;
                const title = lessonObj.title || `Bài học #${latestCompleted.lessonId}`;
                const currentAlerts = await notificationsApi.getUserNotifications(user.id);
                const hasAlert = currentAlerts.some(
                  a => a.type === "learning" && (a.message.includes(`"${title}"`) || a.message.includes(`#${latestCompleted.lessonId}`))
                );
                if (!hasAlert) {
                  notificationsApi.createNotification(
                    user.id,
                    "Hoàn thành bài học!",
                    `Chúc mừng bạn đã hoàn thành bài học "${title}" và nhận được +${latestCompleted.xpEarned || 50} XP điểm thưởng!`,
                    "learning"
                  );
                }
              });
          }
        }
      })
      .catch(() => {
        setLearnedWords(0);
        setLearningHours(0);
        setAccumulatedXp(0);
      });

    // D. Trigger Proactive Notification for Subscription Registration
    fetch(`${API_BASE_URL}/api/user_subscriptions/current`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(async (subData) => {
        if (subData && subData.status === 0) {
          const currentAlerts = await notificationsApi.getUserNotifications(user.id);
          const hasSubAlert = currentAlerts.some(a => a.type === "subscription");
          if (!hasSubAlert) {
            const planNames: Record<number, string> = { 1: "Cơ bản", 2: "Chuyên nghiệp", 3: "Cao cấp" };
            const planName = planNames[subData.planId] || "Cao cấp";
            const expDate = new Date(subData.endAt).toLocaleDateString("vi-VN");
            notificationsApi.createNotification(
              user.id,
              "Đăng ký gói thành công!",
              `Tài khoản của bạn đã được nâng cấp thành công lên gói "${planName}". Ngày hết hạn dịch vụ: ${expDate}.`,
              "subscription"
            );
          }
        }
      })
      .catch(() => { });

    // E. Fetch Enrollments & Active Course Real Progress
    fetch(`${API_BASE_URL}/api/enrollments/user/${user.id}`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(async (enrollments) => {
        const list = Array.isArray(enrollments) ? enrollments : [];
        if (list.length > 0) {
          setHasJoined(true);
          const latestEnrollment = [...list].sort((a: any, b: any) => new Date(b.updatedAt || b.enrolledAt || 0).getTime() - new Date(a.updatedAt || a.enrolledAt || 0).getTime())[0];
          if (latestEnrollment) {
            try {
              const cRes = await fetch(`${API_BASE_URL}/api/courses/${latestEnrollment.courseId}`, { headers });
              if (cRes.ok) {
                const cData = await cRes.json();
                setActiveCourse({
                  ...cData,
                  progressPercent: latestEnrollment.progressPercent,
                  enrollmentStatus: latestEnrollment.status
                });
              }
            } catch (err) {
              console.error("Error fetching active course details", err);
            }
          }
        }
      })
      .catch(() => {});

  }, [user]);

  // "Tiếp tục học" - fallback course if activeCourse is not set but user has courses
  const courseToShow = activeCourse || courses[0];
  const courseProgress = (activeCourse as any)?.progressPercent ?? 0;
  const avatarSrc = avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName || "User"}&background=3c6d44&color=fff`;

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
                <span className="bg-gradient-to-r from-[#2d6a4f] to-[#3a8e63] bg-clip-text text-transparent">{user?.fullName || "Người học"}!</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Học ngôn ngữ ký hiệu mở ra cánh cửa kết nối mới. Mỗi bài học là một bước tiến gần hơn đến sự sẻ chia và đồng cảm!
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[10px] font-extrabold text-[#2d6a4f] select-none">
                  <Flame size={12} className="fill-[#2d6a4f] shrink-0" />
                  {loginDays} ngày liên tiếp
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-[10px] font-extrabold text-amber-600 select-none">
                  <Zap size={12} className="fill-amber-500 stroke-amber-500 shrink-0" />
                  {accumulatedXp} XP tích lũy
                </span>
              </div>
            </div>

            {/* Premium waving greeting hand icon */}
            <div className="relative flex items-center justify-center h-28 w-28 shrink-0 select-none bg-gradient-to-br from-[#ebf5ef] to-[#d4ebde] rounded-[24px] border border-[#2d6a4f]/10 shadow-[0_8px_20px_rgba(45,106,79,0.05)] overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_60%)]" />
              <div className="absolute inset-2 rounded-[20px] border border-dashed border-[#2d6a4f]/20 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-3 rounded-[18px] bg-white/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img
                  src={flameCharacterWave}
                  alt="Waving Greeting"
                  className="w-full h-full object-cover rounded-[15px]"
                />
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
                  {learnedWords} <span className="text-xs font-bold text-slate-400">từ</span>
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Số từ đã học</p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#f4fbf6] flex items-center justify-center shrink-0 border border-emerald-50">
                <BookOpen size={18} className="text-[#2d6a4f]" />
              </div>
            </motion.div>

            {/* Stat 2: Learning Hours Widget */}
            <motion.div
              variants={fadeInUp}
              className="flex-1 bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_20px_rgba(24,35,51,0.02)] p-5 flex items-center justify-between hover:shadow-[0_15px_25px_rgba(24,35,51,0.04)] transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Tổng giờ học</p>
                <p className="text-xl font-black text-slate-800 mt-1">
                  {learningHours} <span className="text-xs font-bold text-slate-400">giờ</span>
                </p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Thời gian luyện tập</p>
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
                className="w-full h-full object-cover animate-fade-in"
              />
            </div>

            <div className="w-full">
              <h4 className="text-base font-bold text-slate-800 leading-snug">
                Tiếp tục học: {hasJoined && courseToShow ? courseToShow.title : "Chưa tham gia"}
              </h4>
              <p className="text-[10px] text-slate-400 font-extrabold mt-1 uppercase tracking-wider">
                {hasJoined && courseToShow ? `Cơ bản • Tiến độ ${Math.round(courseProgress)}%` : "Học ngay"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full px-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                <span>Tiến độ bài</span>
                <span className="text-slate-600">{hasJoined && courseToShow ? `${Math.round(courseProgress)}%` : "0%"}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500" style={{ width: hasJoined && courseToShow ? `${courseProgress}%` : "0%" }} />
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to={hasJoined && courseToShow ? `/khoa-hoc/${courseToShow.id}` : "/khoa-hoc"}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors duration-300"
            >
              {hasJoined && courseToShow ? "Học tiếp" : "Học ngay"}
              <ArrowRight size={14} />
            </Link>
          </motion.div>

        </div>

        {/* ─── ROW 3: RECENT LESSONS ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800">Bài học gần đây</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Tiến độ luyện tập bài học gần nhất</p>
            </div>
            <Link
              to="/khoa-hoc"
              className="text-xs font-bold text-[#2d6a4f] hover:underline flex items-center gap-0.5"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {recentLessons.length > 0 ? (
            <motion.div
              variants={sectionStagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {recentLessons.map((item, idx) => (
                <Link
                  to={`/bai-hoc/${item.lessonId}`}
                  key={idx}
                  className="block hover:-translate-y-1 transition-transform duration-300"
                >
                  <motion.div
                    variants={fadeInUp}
                    className="relative bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-[0_8px_20px_rgba(24,35,51,0.02)] hover:shadow-[0_12px_25px_rgba(24,35,51,0.04)] h-full min-h-[170px]"
                  >
                    <span className="absolute top-5 right-5 text-[9px] font-bold text-slate-400">{item.time}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/30">
                        <Clock size={16} className="text-[#2d6a4f]" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 tracking-wider uppercase leading-none">Hoàn thành bài học</p>
                        <h4 className="text-sm font-bold text-slate-800 mt-1.5 leading-snug line-clamp-1">{item.title}</h4>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Check size={14} className="stroke-[3]" />
                        <span>Độ chính xác {item.accuracy}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">+50 XP</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center text-center justify-center shadow-[0_8px_20px_rgba(24,35,51,0.015)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-3 text-slate-400">
                <BookOpen size={20} />
              </div>
              <p className="text-sm font-bold text-slate-700">Chưa tham gia luyện tập bài học nào</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Hãy bắt đầu bài học đầu tiên của bạn để theo dõi tiến độ học tập và rèn luyện ngôn ngữ ký hiệu nhé!</p>
              <Link to="/khoa-hoc" className="mt-4 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-sm">
                Học ngay
              </Link>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
