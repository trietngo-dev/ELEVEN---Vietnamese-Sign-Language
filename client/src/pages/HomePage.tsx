import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import { BookOpen, Users, Zap, ArrowRight, Clock, ChevronRight, Video } from "lucide-react";
import CourseImage from "@/components/CourseImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Course {
  id: number;
  title: string;
  description?: string;
  level?: string;
  coverMediaId?: number;
  status?: number | string;
}

const LEVEL_LABELS: Record<string, string> = {
  Beginner: "CƠ BẢN",
  Intermediate: "TRUNG CẤP",
  Advanced: "NÂNG CAO",
};

const recentTranslations = [
  { text: '"Thư viện gần nhất ở đâu?"', time: "2 giờ trước" },
  { text: '"Tôi muốn gọi món!"', time: "Hôm qua" },
  { text: '"Rất vui được gặp bạn."', time: "12/03" },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const sectionStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

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
      .catch(() => setCourses([]))
      .finally(() => setIsLoadingCourses(false));
  }, []);

  // "Tiếp tục học" - first course in list as active
  const activeCourse = courses[0];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="min-h-screen bg-white"
    >
      {/* ─── HERO / STATS ─── */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="bg-white border-b border-slate-100 px-6 pt-8 pb-6"
      >
        <div className="container">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
            Chào mừng trở lại, {firstName}!
          </h1>
          <p className="text-sm text-amber-500 font-semibold flex items-center gap-1 mb-6">
            🔥 Bạn đang có chuỗi 7 ngày! Tiếp tục phát huy nhé! 🔥
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
            {[
              { icon: <BookOpen size={18} className="text-slate-600" />, label: "BÀI HỌC HOÀN THÀNH", value: "24" },
              { icon: <Users size={18} className="text-slate-600" />, label: "TỪ VỰNG ĐÃ HỌC", value: "128" },
              { icon: <Zap size={18} className="text-amber-500" />, label: "CHUỖI HIỆN TẠI", value: "7 Days" },
            ].map((s) => (
              <motion.div
                key={s.label}
                variants={fadeInUp}
                className="flex items-center gap-3 px-4 py-4 sm:px-6 bg-slate-50"
              >
                <span className="bg-white rounded-xl p-2 shadow-sm border border-slate-100 flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.07em] leading-tight">{s.label}</p>
                  <p className="text-xl font-black text-slate-900 leading-tight">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="container py-8 space-y-10">
        {/* ─── TIẾP TỤC HỌC ─── */}
        <motion.section
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Tiếp tục học</h2>
          {activeCourse ? (
            <motion.div
              whileHover={{ y: -3 }}
              className="relative rounded-3xl overflow-hidden bg-[#111f1a] text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#111f1a] via-[#111f1a]/90 to-transparent z-10" />
              {/* Background image placeholder */}
              <div className="absolute right-0 top-0 w-1/3 h-full bg-slate-700 opacity-60">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60"
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              </div>

              <div className="relative z-20 px-7 py-8 max-w-lg">
                <p className="text-xs font-bold text-[#e9c547] tracking-widest uppercase mb-2">
                  {LEVEL_LABELS[activeCourse.level ?? ""] ?? "CƠ BẢN"} • BÀI HỌC 1
                </p>
                <h3 className="text-2xl font-black leading-tight mb-5 line-clamp-2">{activeCourse.title}</h3>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e9c547] rounded-full" style={{ width: "65%" }} />
                  </div>
                  <p className="text-xs text-white/60 mt-1.5 font-semibold">65% Complete</p>
                </div>

                <Link
                  to={`/khoa-hoc/${activeCourse.id}`}
                  className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#255c43] transition-colors text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg"
                >
                  ▶ Tiếp tục bài học
                </Link>
              </div>
            </motion.div>
          ) : !isLoadingCourses ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400 text-sm font-medium">
              Chưa có khóa học nào. <Link to="/khoa-hoc" className="text-[#2d6a4f] font-bold underline">Khám phá khóa học</Link>
            </div>
          ) : (
            <div className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
          )}
        </motion.section>

        {/* ─── BOTTOM GRID ─── */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Thao tác nhanh */}
          <motion.section variants={sectionStagger}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              {/* Primary CTA */}
              <Link
                to="/ai-tracker"
                className="group flex items-center justify-between bg-[#2d6a4f] hover:bg-[#255c43] transition-colors text-white rounded-2xl px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Bắt đầu dịch mới</p>
                    <p className="text-xs text-white/70">Dịch thử ngôn ngữ sang văn bản thời gian thực</p>
                  </div>
                </div>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary links */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/tu-dien"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#2d6a4f] hover:bg-[#eef6f1] transition-colors"
                  >
                    <BookOpen size={22} className="text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">Từ điển</span>
                  </Link>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link
                    to="/cong-dong"
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#2d6a4f] hover:bg-[#eef6f1] transition-colors"
                  >
                    <Users size={22} className="text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">Cộng đồng</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Bản dịch gần đây */}
          <motion.section variants={sectionStagger}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Bản dịch gần đây</h2>
              <button className="text-sm font-bold text-[#2d6a4f] hover:underline flex items-center gap-0.5">
                Xem lịch sử <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {recentTranslations.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  className="flex items-center justify-between py-3.5 px-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Clock size={15} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 italic">{t.text}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-3">{t.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>

        {/* ─── GỢI Ý CHO BẠN ─── */}
        <motion.section
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Gợi ý cho bạn</h2>
            <Link to="/khoa-hoc" className="text-sm font-bold text-[#2d6a4f] hover:underline flex items-center gap-0.5">
              Khám phá tất cả <ChevronRight size={16} />
            </Link>
          </div>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-52 rounded-3xl bg-slate-100 animate-pulse" />)}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={sectionStagger}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {courses.length > 0 ? courses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/khoa-hoc/${course.id}`} className="group block rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-all">
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                      <CourseImage
                        title={course.title}
                        coverMediaId={course.coverMediaId}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                        {LEVEL_LABELS[course.level ?? ""] ?? "CƠ BẢN"}
                      </p>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Từ vựng đã học</p>
                    </div>
                  </Link>
                </motion.div>
              )) : (
                <div className="col-span-3 text-center text-slate-400 text-sm py-8">Chưa có khóa học nào được hiển thị.</div>
              )}
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
