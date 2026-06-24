import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import {
  ArrowLeft,
  Search,
  Clock,
  Trophy,
  Brain,
  Play,
  Loader2
} from "lucide-react";
import CourseImage from "../components/CourseImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface PracticeHistoryItem {
  progressId: number;
  lessonId: number;
  wordTitle: string;
  bestAccuracy: number;
  bestScore: number;
  completedAt: string;
  lessonCoverMediaId: number | null;
  attemptsCount: number;
  estimatedMinutes: number;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function AIPracticeHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems, setHistoryItems] = useState<PracticeHistoryItem[]>([]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch user lesson progress
      const progressRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers });
      if (!progressRes.ok) throw new Error("Không thể tải tiến trình bài học");
      const progressData = await progressRes.json();
      const progressItems = progressData.items || (Array.isArray(progressData) ? progressData : progressData.items) || [];

      // Filter progress items belonging to the current user and containing AI scores
      const userAIProgress = progressItems.filter(
        (p: any) => p.userId === user.id && (p.bestAccuracy !== null || p.bestScore !== null || p.status === 2)
      );

      if (userAIProgress.length === 0) {
        setHistoryItems([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch all lessons
      const lessonsRes = await fetch(`${API_BASE_URL}/api/lessons?pageSize=1000`, { headers });
      const lessonsData = await lessonsRes.json();
      const lessonItems = lessonsData.items || (Array.isArray(lessonsData) ? lessonsData : lessonsData.items) || [];

      // Map progress to detailed practice items
      const detailedItems: PracticeHistoryItem[] = userAIProgress.map((prog: any) => {
        const lesson = lessonItems.find((l: any) => l.id === prog.lessonId);
        const title = lesson ? lesson.title : `Bài học #${prog.lessonId}`;
        const coverMediaId = lesson ? lesson.coverMediaId : null;
        const duration = lesson ? lesson.estimatedMinutes : 0;

        return {
          progressId: prog.id,
          lessonId: prog.lessonId,
          wordTitle: title,
          bestAccuracy: prog.bestAccuracy,
          bestScore: prog.bestScore,
          completedAt: prog.completedAt || prog.updatedAt || new Date().toISOString(),
          lessonCoverMediaId: coverMediaId,
          attemptsCount: prog.attemptsCount || 1,
          estimatedMinutes: duration
        };
      });

      // Sort by completedAt descending
      detailedItems.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

      setHistoryItems(detailedItems);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử kiểm tra AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const filteredItems = useMemo(() => {
    return historyItems.filter(
      item => item.wordTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [historyItems, searchQuery]);

  // Helper format percentage accuracy safely
  const formatAccuracy = (accuracy: number) => {
    if (accuracy <= 1.0) {
      return Math.round(accuracy * 100);
    }
    return Math.round(accuracy);
  };

  // Helper format date time
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return "Không rõ";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <Loader2 size={40} className="text-[#3c6d44] animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Đang tải lịch sử kiểm tra AI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-10">
      <div className="container max-w-5xl mx-auto px-4 md:px-6 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors font-bold text-sm"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Brain className="text-[#3c6d44] shrink-0" size={28} />
              Lịch sử kiểm tra AI
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Bạn đã thực hiện kiểm tra AI cho {historyItems.length} từ vựng
            </p>
          </div>

          {/* Search bar */}
          {historyItems.length > 0 && (
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm từ đã kiểm tra..."
                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_20px_rgba(24,35,51,0.02)] text-sm focus:border-[#3c6d44] outline-none transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          )}
        </div>

        {/* Practice History list */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {filteredItems.map((item) => {
                const score = formatAccuracy(item.bestAccuracy || item.bestScore);
                const isPassed = score >= 95;

                return (
                  <motion.div
                    layoutId={`practice-card-${item.lessonId}`}
                    key={item.lessonId}
                    variants={fadeInUp}
                    className="relative group bg-white rounded-3xl border border-slate-100 shadow-[0_10px_25px_rgba(24,35,51,0.02)] overflow-hidden flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(24,35,51,0.05)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Image cover fallback */}
                        <div className="relative h-32 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center shrink-0 border border-slate-50">
                          <CourseImage
                            title={item.wordTitle}
                            coverMediaId={item.lessonCoverMediaId}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-lg font-bold">
                            Lượt: {item.attemptsCount}
                          </div>
                        </div>

                        {/* Title and stats */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ vựng</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPassed ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {isPassed ? "Đạt chuẩn" : "Luyện tập"}
                            </span>
                          </div>
                          <h3 className="font-black text-slate-800 text-lg leading-snug group-hover:text-[#3c6d44] transition-colors line-clamp-1">
                            {item.wordTitle}
                          </h3>
                        </div>

                        {/* Info details */}
                        <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5">
                              <Trophy size={14} className="text-[#efca4c]" />
                              Độ chính xác:
                            </span>
                            <span className="font-extrabold text-slate-700">{score}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium flex items-center gap-1.5">
                              <Clock size={14} />
                              Thời gian:
                            </span>
                            <span className="font-bold text-slate-500">{formatDateTime(item.completedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-5 pt-3 border-t border-slate-50 flex gap-2">
                        <Link
                          to={`/bai-hoc/${item.lessonId}`}
                          className="flex-1 py-3 rounded-xl bg-[#3c6d44]/5 hover:bg-[#3c6d44]/10 text-[#3c6d44] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#3c6d44]/10"
                        >
                          <Play size={12} className="fill-[#3c6d44]" />
                          Luyện tập lại
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_30px_rgba(24,35,51,0.02)] p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-slate-400">
                <Brain size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Chưa có lịch sử kiểm tra</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                Bạn chưa thực hành bài học nào có sử dụng camera AI để kiểm tra cử chỉ. Hãy học các bài học và mở Camera AI để lưu kết quả nhé!
              </p>
              <Link
                to="/khoa-hoc"
                className="inline-flex items-center gap-2 bg-[#3c6d44] hover:bg-[#315736] text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-[#3c6d44]/10 transition-all hover:scale-[1.02] duration-300"
              >
                Khám phá khóa học
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
