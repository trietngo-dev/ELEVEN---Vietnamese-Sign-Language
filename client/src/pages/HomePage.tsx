import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import {
  ArrowRight,
  Clock,
  ChevronRight,
  BookOpen,
  Flame,
  Check,
  GraduationCap
} from "lucide-react";
import { notificationsApi } from "../lib/notifications";
import xpImg from "../assets/xp-img.png";
import CourseImage from "../components/CourseImage";
import instructorVideo from "../assets/instructor.mp4";

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
  lessonId?: number;
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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

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

    // Fetch courses
    fetch(`${API_BASE_URL}/api/courses`, { headers })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => {
        const published = (data.items || []).filter(
          (c: Course) => c.status === 1 || c.status === "Published" || c.status === "published"
        );
        setAllCourses(published);
        setCourses(published.slice(0, 3));
      })
      .catch(() => {
        setAllCourses([]);
        setCourses([]);
      });
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

    // Fetch profile data to load synchronized streak and XP
    const fetchProfileData = () => {
      fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, { headers })
        .then((res) => (res.ok ? res.json() : null))
        .then((profileData) => {
          if (profileData) {
            setLoginDays(profileData.currentStreakDays ?? profileData.CurrentStreakDays ?? 0);
            setAccumulatedXp(profileData.totalXp ?? profileData.TotalXp ?? 0);
          }
        })
        .catch(() => {});
    };

    // A. Fetch Login Days & Calculate Streak
    fetch(`${API_BASE_URL}/api/user_activity_logs`, { headers })
      .then(res => res.ok ? res.json() : { items: [] })
      .then(async (data) => {
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
        )).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime()) as string[];

        const todayStr = new Date(Date.now() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
        const hasLoginToday = uniqueDates.includes(todayStr);

        if (!hasLoginToday) {
          await postTodayLoginLog();
        }
        fetchProfileData();
      })
      .catch(() => {
        fetchProfileData();
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

          // Sum XP (disabled in favor of database-synced totalXp profile value)
          // const totalXp = userProgress.reduce((sum: number, p: any) => sum + (p.xpEarned || 0), 0);
          // setAccumulatedXp(totalXp);

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
                      accuracy: (() => {
                        const rawAccuracy = p.bestAccuracy !== undefined && p.bestAccuracy !== null ? p.bestAccuracy : 0.9;
                        const accuracyPercent = rawAccuracy <= 1.0 ? rawAccuracy * 100 : rawAccuracy;
                        return `${Math.min(100, Math.round(accuracyPercent))}%`;
                      })(),
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
      .then(async (enrollmentsData) => {
        const list = Array.isArray(enrollmentsData) ? enrollmentsData : [];
        setEnrollments(list);
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

  // Dynamic Level Status for Roadmap
  const levelStatus = useMemo(() => {
    const getCourseProgress = (courseId: number) => {
      const e = enrollments.find(x => x.courseId === courseId);
      return e ? (e.progressPercent ?? 0) : 0;
    };

    const basicCourses = allCourses.filter(c => c.level === "Cơ bản");
    const intermediateCourses = allCourses.filter(c => c.level === "Trung cấp");
    const advancedCourses = allCourses.filter(c => c.level === "Nâng cao");

    const basicCompleted = basicCourses.length > 0 && basicCourses.every(c => getCourseProgress(c.id) >= 100);
    const basicInProgress = basicCourses.some(c => enrollments.some(x => x.courseId === c.id)) && !basicCompleted;

    const intermediateUnlocked = basicCompleted;
    const intermediateCompleted = intermediateUnlocked && intermediateCourses.length > 0 && intermediateCourses.every(c => getCourseProgress(c.id) >= 100);
    const intermediateInProgress = intermediateUnlocked && intermediateCourses.some(c => enrollments.some(x => x.courseId === c.id)) && !intermediateCompleted;

    const advancedUnlocked = intermediateCompleted;
    const advancedCompleted = advancedUnlocked && advancedCourses.length > 0 && advancedCourses.every(c => getCourseProgress(c.id) >= 100);
    const advancedInProgress = advancedUnlocked && advancedCourses.some(c => enrollments.some(x => x.courseId === c.id)) && !advancedCompleted;

    return {
      "Cơ bản": basicCompleted ? "completed" : (basicInProgress ? "in_progress" : "not_started"),
      "Trung cấp": intermediateCompleted ? "completed" : (intermediateInProgress ? "in_progress" : (intermediateUnlocked ? "not_started" : "locked")),
      "Nâng cao": advancedCompleted ? "completed" : (advancedInProgress ? "in_progress" : (advancedUnlocked ? "not_started" : "locked")),
    };
  }, [allCourses, enrollments]);

  // "Tiếp tục học" - fallback course if activeCourse is not set but user has courses
  const courseToShow = activeCourse || courses[0];
  const courseProgress = (activeCourse as any)?.progressPercent ?? 0;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="min-h-screen bg-transparent py-8 md:py-10"
    >
      <style>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
      `}</style>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ─── GRID CHÍNH 2 CỘT (TRÊN) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* CỘT TRÁI (40% width ~ 5 cols): Video Cử chỉ Ngôn Ngữ Ký Hiệu VSL */}
          <motion.div
            variants={fadeInUp}
            className="lg:col-span-5 bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.03)] p-6 flex flex-col justify-between h-full relative overflow-hidden group"
          >
            {/* Soft decorative background glow */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />

            {/* Video Container (Hiển thị sạch sẽ, bo góc tròn sang trọng) */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-900 group/video">
              <video
                src={instructorVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover select-none scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Description & Intro */}
            <div className="relative z-10 mt-5">
              <div className="flex gap-3">
                <Link
                  to="/khoa-hoc"
                  className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors duration-300"
                >
                  <BookOpen size={14} />
                  Vào Học Ngay
                </Link>
                <Link
                  to="/tu-dien"
                  className="flex-1 h-11 inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl border border-slate-200/60 transition-colors duration-300"
                >
                  Tra Từ Điển
                </Link>
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI (60% width ~ 7 cols): Welcome + Stats + Active Course + AI Practice (Cùng chiều cao với cột trái) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8 h-full">
            
            {/* ROW 1: Welcome Banner & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch flex-1">
              
              {/* Banner (2/3 width) */}
              <motion.div
                variants={fadeInUp}
                className="md:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.03)] p-6 md:p-8 flex flex-col justify-between items-center gap-6 h-full min-h-[220px]"
              >
                <div className="space-y-3 text-center w-full flex flex-col items-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-[10px] font-extrabold text-[#2d6a4f] select-none">
                    Hệ Thống Học Ngôn Ngữ Ký Hiệu Việt Nam (VSL)
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                    Chào mừng trở lại,<br />
                    <span className="bg-gradient-to-r from-[#2d6a4f] to-[#3a8e63] bg-clip-text text-transparent">{user?.fullName || "Người học"}!</span>
                  </h1>
                </div>
                
                {/* Badges in a horizontal row, equal width, centered */}
                <div className="flex flex-row gap-4 w-full max-w-xl justify-center items-center">
                  <div className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 px-5 py-3 text-xs font-bold text-[#2d6a4f] shadow-sm select-none">
                    <Flame size={20} className="fill-[#2d6a4f] shrink-0 text-orange-500" />
                    <div className="text-left">
                      <span className="text-lg font-black text-emerald-800 block leading-none">{loginDays}</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 block whitespace-nowrap">đăng nhập liên tiếp</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-amber-50/70 border border-amber-100 px-5 py-3 text-xs font-bold text-amber-700 shadow-sm select-none">
                    <img src={xpImg} className="w-6 h-6 object-contain shrink-0" alt="XP" />
                    <div className="text-left">
                      <span className="text-lg font-black text-amber-800 block leading-none">{accumulatedXp}</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 block whitespace-nowrap">XP tích lũy</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats stacked (1/3 width) */}
              <div className="flex flex-col gap-4 justify-between h-full">
                
                {/* Words */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_20px_rgba(24,35,51,0.02)] p-6 flex items-center justify-between hover:shadow-[0_15px_25px_rgba(24,35,51,0.04)] transition-all duration-300 flex-1"
                >
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider leading-none">Từ đã học</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 mt-2">
                      {learnedWords} <span className="text-sm font-bold text-[#2d6a4f]">từ</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f4fbf6] flex items-center justify-center shrink-0 border border-emerald-50/50 shadow-sm">
                    <BookOpen size={22} className="text-[#2d6a4f]" />
                  </div>
                </motion.div>

                {/* Hours */}
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_20px_rgba(24,35,51,0.02)] p-6 flex items-center justify-between hover:shadow-[0_15px_25px_rgba(24,35,51,0.04)] transition-all duration-300 flex-1"
                >
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider leading-none">Giờ học</p>
                    <p className="text-2xl md:text-3xl font-black text-slate-800 mt-2">
                      {learningHours} <span className="text-sm font-bold text-[#2d6a4f]">giờ</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f4fbf6] flex items-center justify-center shrink-0 border border-emerald-50/50 shadow-sm">
                    <Clock size={22} className="text-[#2d6a4f]" />
                  </div>
                </motion.div>
                
              </div>

            </div>

            {/* ROW 2: Active Lesson (Full width, horizontal layout) */}
            <div className="flex-1 w-full">
              <motion.div
                variants={fadeInUp}
                className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.03)] p-6 hover:shadow-[0_20px_40px_rgba(24,35,51,0.06)] transition-all duration-300 h-full flex flex-col justify-between"
              >
                {hasJoined && courseToShow ? (
                  <div className="flex flex-col md:flex-row items-stretch gap-6 h-full">
                    {/* Left side: Cover image takes up large portion */}
                    <div className="w-full md:w-[240px] h-[140px] md:h-auto rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm shrink-0 flex items-center justify-center">
                      <CourseImage
                        coverMediaId={courseToShow?.coverMediaId}
                        title={courseToShow?.title || "VSL"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right side: Course details, description, progress, CTA */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[#2d6a4f] bg-emerald-50 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Bài học đang học</span>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                            Mức độ: {courseToShow.level || "Cơ bản"}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-black text-slate-800 leading-snug">
                          {courseToShow.title}
                        </h4>
                        
                        {/* Course description */}
                        <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {courseToShow.description}
                        </p>
                      </div>

                      {/* Progress and CTA button */}
                      <div className="space-y-4">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 tracking-wider uppercase mb-1">
                            <span>Tiến độ bài</span>
                            <span className="text-slate-600">{Math.round(courseProgress)}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500" style={{ width: `${courseProgress}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Link
                            to={`/khoa-hoc/${courseToShow.id}`}
                            className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors duration-300 animate-pulse-slow w-full md:w-auto"
                          >
                            Học Tiếp Bài Học
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[190px] py-6 space-y-4 w-full">
                    <div className="space-y-2">
                      <h4 className="text-xl md:text-2xl font-black text-slate-300 uppercase tracking-wider select-none leading-none">
                        Chưa đăng ký khóa học
                      </h4>
                      <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                        Bắt đầu hành trình chinh phục ngôn ngữ ký hiệu cùng với Eleven ngay hôm nay.
                      </p>
                    </div>
                    
                    {/* Monochrome Icon */}
                    <GraduationCap size={44} className="text-slate-200 stroke-[1.5]" />
                    
                    <div className="flex justify-center w-full">
                      <Link
                        to="/khoa-hoc"
                        className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors duration-300 w-full md:w-auto"
                      >
                        Tìm Khóa Học Phù Hợp
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

          </div>

        </div>

        {/* ─── ROW 3: LEARNING ROADMAP (LỘ TRÌNH HỌC TẬP) ─── */}
        <div className="space-y-6 pt-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">Lộ Trình Học Tập VSL</h2>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.02)] p-8 md:p-10 relative overflow-hidden">
            
            {/* Background connection path lines (dynamic) */}
            <div className="absolute top-1/2 left-20 right-20 h-1 bg-slate-100 -translate-y-8 hidden md:block z-0" />
            <div className={`absolute top-1/2 left-[16.6%] w-[33.3%] h-1 -translate-y-8 hidden md:block z-0 transition-colors duration-500 ${
              levelStatus["Cơ bản"] === "completed" ? "bg-[#2d6a4f]" : "bg-slate-100"
            }`} />
            <div className={`absolute top-1/2 left-[50%] w-[33.3%] h-1 -translate-y-8 hidden md:block z-0 transition-colors duration-500 ${
              levelStatus["Trung cấp"] === "completed" ? "bg-[#2d6a4f]" : "bg-slate-100"
            }`} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              
              {/* Milestone 1: Cơ bản */}
              <div className="flex flex-col items-center text-center space-y-4">
                {levelStatus["Cơ bản"] === "completed" && (
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10">
                    <Check size={26} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Cơ bản"] === "in_progress" && (
                  <div className="w-16 h-16 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(45,106,79,0.3)] z-10 animate-pulse">
                    <Clock size={24} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Cơ bản"] === "not_started" && (
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-[#2d6a4f] flex items-center justify-center border-4 border-white border-dashed shadow-sm z-10 hover:bg-emerald-50/50 transition-colors duration-300">
                    <BookOpen size={24} className="stroke-[2.5]" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className={`text-xs font-black uppercase border px-3 py-1 rounded-full ${
                    levelStatus["Cơ bản"] === "completed" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    levelStatus["Cơ bản"] === "in_progress" ? "bg-emerald-50 border-emerald-100 text-[#2d6a4f]" :
                    "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    {levelStatus["Cơ bản"] === "completed" ? "Hoàn thành" :
                     levelStatus["Cơ bản"] === "in_progress" ? "Đang học" : "Chưa học"}
                  </span>
                  <h4 className="text-xl font-black text-slate-800 mt-2">Cơ bản</h4>
                  <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed font-medium">Làm quen với bảng chữ cái, số đếm và chủ đề chào hỏi giao tiếp thông thường.</p>
                </div>
              </div>

              {/* Milestone 2: Trung cấp */}
              <div className="flex flex-col items-center text-center space-y-4">
                {levelStatus["Trung cấp"] === "completed" && (
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10">
                    <Check size={26} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Trung cấp"] === "in_progress" && (
                  <div className="w-16 h-16 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(45,106,79,0.3)] z-10 animate-pulse">
                    <Clock size={24} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Trung cấp"] === "not_started" && (
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-[#2d6a4f] flex items-center justify-center border-4 border-white border-dashed shadow-sm z-10 hover:bg-emerald-50/50 transition-colors duration-300">
                    <BookOpen size={24} className="stroke-[2.5]" />
                  </div>
                )}
                {levelStatus["Trung cấp"] === "locked" && (
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <Clock size={24} className="stroke-[2.5]" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className={`text-xs font-black uppercase border px-3 py-1 rounded-full ${
                    levelStatus["Trung cấp"] === "completed" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    levelStatus["Trung cấp"] === "in_progress" ? "bg-emerald-50 border-emerald-100 text-[#2d6a4f]" :
                    levelStatus["Trung cấp"] === "not_started" ? "bg-slate-50 border-slate-200 text-[#2d6a4f]" :
                    "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    {levelStatus["Trung cấp"] === "completed" ? "Hoàn thành" :
                     levelStatus["Trung cấp"] === "in_progress" ? "Đang học" :
                     levelStatus["Trung cấp"] === "not_started" ? "Sẵn sàng" : "Chưa mở khóa"}
                  </span>
                  <h4 className={`text-xl font-black mt-2 ${levelStatus["Trung cấp"] === "locked" ? "text-slate-400" : "text-slate-800"}`}>Trung cấp</h4>
                  <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed font-medium">Rèn luyện từ vựng và mẫu câu về địa lý, hành chính, cảm xúc và các thói quen sinh hoạt.</p>
                </div>
              </div>

              {/* Milestone 3: Nâng cao */}
              <div className="flex flex-col items-center text-center space-y-4">
                {levelStatus["Nâng cao"] === "completed" && (
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10">
                    <Check size={26} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Nâng cao"] === "in_progress" && (
                  <div className="w-16 h-16 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center border-4 border-white shadow-[0_0_15px_rgba(45,106,79,0.3)] z-10 animate-pulse">
                    <Clock size={24} className="stroke-[3]" />
                  </div>
                )}
                {levelStatus["Nâng cao"] === "not_started" && (
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-[#2d6a4f] flex items-center justify-center border-4 border-white border-dashed shadow-sm z-10 hover:bg-emerald-50/50 transition-colors duration-300">
                    <BookOpen size={24} className="stroke-[2.5]" />
                  </div>
                )}
                {levelStatus["Nâng cao"] === "locked" && (
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-white shadow-sm z-10">
                    <BookOpen size={24} className="stroke-[2.5]" />
                  </div>
                )}
                <div className="space-y-2">
                  <span className={`text-xs font-black uppercase border px-3 py-1 rounded-full ${
                    levelStatus["Nâng cao"] === "completed" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    levelStatus["Nâng cao"] === "in_progress" ? "bg-emerald-50 border-emerald-100 text-[#2d6a4f]" :
                    levelStatus["Nâng cao"] === "not_started" ? "bg-slate-50 border-slate-200 text-[#2d6a4f]" :
                    "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    {levelStatus["Nâng cao"] === "completed" ? "Hoàn thành" :
                     levelStatus["Nâng cao"] === "in_progress" ? "Đang học" :
                     levelStatus["Nâng cao"] === "not_started" ? "Sẵn sàng" : "Chưa mở khóa"}
                  </span>
                  <h4 className={`text-xl font-black mt-2 ${levelStatus["Nâng cao"] === "locked" ? "text-slate-400" : "text-slate-800"}`}>Nâng cao</h4>
                  <p className="text-sm text-slate-500 max-w-[260px] leading-relaxed font-medium">Mở rộng vốn từ vựng về các sự kiện xã hội, lễ hội truyền thống, cùng các thuật ngữ kinh tế & thương mại.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── ROW 4: RECENT LESSONS ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">Bài học gần đây</h2>
            </div>
            <Link
              to="/khoa-hoc"
              className="text-sm font-bold text-[#2d6a4f] hover:underline flex items-center gap-1"
            >
              Xem tất cả <ChevronRight size={16} />
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
                    className="relative bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_20px_rgba(24,35,51,0.02)] hover:shadow-[0_12px_25px_rgba(24,35,51,0.04)] h-full min-h-[190px]"
                  >
                    <span className="absolute top-6 right-6 text-xs font-bold text-slate-400">{item.time}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/30">
                        <Clock size={20} className="text-[#2d6a4f]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase leading-none">Hoàn thành bài học</p>
                        <h4 className="text-base sm:text-lg font-black text-slate-800 mt-2 leading-snug line-clamp-1">{item.title}</h4>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Check size={16} className="stroke-[3]" />
                        <span>Độ chính xác {item.accuracy}</span>
                      </div>
                      <span className="text-xs font-extrabold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">+50 XP</span>
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
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-3 text-slate-400">
                <BookOpen size={24} />
              </div>
              <p className="text-base font-bold text-slate-700">Chưa tham gia luyện tập bài học nào</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Hãy bắt đầu bài học đầu tiên của bạn để theo dõi tiến độ học tập và rèn luyện ngôn ngữ ký hiệu nhé!</p>
              <Link to="/khoa-hoc" className="mt-4 px-6 py-2.5 bg-[#2d6a4f] hover:bg-[#255c43] text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-sm">
                Học ngay
              </Link>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
