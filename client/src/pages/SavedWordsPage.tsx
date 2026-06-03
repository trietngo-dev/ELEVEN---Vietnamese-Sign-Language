import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import {
  Bookmark,
  Search,
  Trash2,
  Play,
  ArrowLeft,
  BookOpen,
  Award,
  Sparkles,
  Clock,
  Loader2
} from "lucide-react";
import CourseImage from "../components/CourseImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface SavedWordItem {
  progressId: number;
  vocabularyId: number;
  lessonId: number | null;
  termVi: string;
  difficultyLevel: string;
  isSaved: boolean;
  lessonTitle: string;
  lessonCoverMediaId: number | null;
  lessonXpReward: number;
  lessonDuration: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function SavedWordsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedWords, setSavedWords] = useState<SavedWordItem[]>([]);
  const [unsavingId, setUnsavingId] = useState<number | null>(null);

  const fetchSavedWords = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const token = tokenStorage.getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch user vocabulary progress
      const progressRes = await fetch(`${API_BASE_URL}/api/user_vocabulary_progress?pageSize=1000`, { headers });
      if (!progressRes.ok) throw new Error("Không thể tải tiến trình từ vựng");
      const progressData = await progressRes.json();
      const progressItems = progressData.items || (Array.isArray(progressData) ? progressData : progressData.items) || [];

      // Filter only saved items for the logged-in user
      const userSavedProgress = progressItems.filter(
        (p: any) => p.userId === user.id && p.isSaved === true
      );

      if (userSavedProgress.length === 0) {
        setSavedWords([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch vocabulary list
      const vocabRes = await fetch(`${API_BASE_URL}/api/vocabularies?pageSize=1000`, { headers });
      const vocabData = await vocabRes.json();
      const vocabItems = vocabData.items || (Array.isArray(vocabData) ? vocabData : vocabData.items) || [];

      // 3. Fetch lesson vocabularies mapping
      const lessonVocabRes = await fetch(`${API_BASE_URL}/api/lesson_vocabularies?pageSize=1000`, { headers });
      const lessonVocabData = await lessonVocabRes.json();
      const lessonVocabItems = lessonVocabData.items || (Array.isArray(lessonVocabData) ? lessonVocabData : lessonVocabData.items) || [];

      // 4. Fetch all lessons
      const lessonsRes = await fetch(`${API_BASE_URL}/api/lessons?pageSize=1000`, { headers });
      const lessonsData = await lessonsRes.json();
      const lessonItems = lessonsData.items || (Array.isArray(lessonsData) ? lessonsData : lessonsData.items) || [];

      // Map progress to detailed vocabulary and lesson info
      const detailedItems: SavedWordItem[] = userSavedProgress.map((prog: any) => {
        const vocab = vocabItems.find((v: any) => v.id === prog.vocabularyId);
        const term = vocab ? vocab.termVi : "Từ vựng";
        const difficulty = vocab ? vocab.difficultyLevel : "Cơ bản";

        // Find mapping to lesson
        const mapping = lessonVocabItems.find((lv: any) => lv.vocabularyId === prog.vocabularyId);
        const lessonId = mapping ? mapping.lessonId : null;
        
        // Find lesson info
        const lesson = lessonId ? lessonItems.find((l: any) => l.id === lessonId) : null;

        return {
          progressId: prog.id,
          vocabularyId: prog.vocabularyId,
          lessonId: lessonId,
          termVi: term,
          difficultyLevel: difficulty,
          isSaved: prog.isSaved,
          lessonTitle: lesson ? lesson.title : term,
          lessonCoverMediaId: lesson ? lesson.coverMediaId : null,
          lessonXpReward: lesson ? lesson.xpReward : 50,
          lessonDuration: lesson ? lesson.estimatedMinutes : 0
        };
      });

      setSavedWords(detailedItems);
    } catch (error) {
      console.error("Lỗi khi tải từ đã lưu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedWords();
  }, [user]);

  const handleUnsave = async (progressId: number, vocabId: number) => {
    setUnsavingId(vocabId);
    try {
      const token = tokenStorage.getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Call API to update saved status to false
      const res = await fetch(`${API_BASE_URL}/api/user_vocabulary_progress/${progressId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          status: 0, // Unstarted
          isSaved: false
        })
      });

      if (res.ok) {
        setSavedWords(prev => prev.filter(w => w.vocabularyId !== vocabId));
      } else {
        alert("Bỏ lưu từ thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi bỏ lưu từ:", error);
    } finally {
      setUnsavingId(null);
    }
  };

  const filteredWords = useMemo(() => {
    return savedWords.filter(
      word =>
        word.termVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedWords, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800">
        <Loader2 size={40} className="text-[#3c6d44] animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Đang tải danh sách từ đã lưu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 md:py-10">
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
              <Bookmark className="text-[#efca4c] fill-[#efca4c] shrink-0" size={28} />
              Từ vựng đã lưu
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Bạn có {savedWords.length} từ vựng trong danh sách ôn tập
            </p>
          </div>

          {/* Search bar */}
          {savedWords.length > 0 && (
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm từ đã lưu..."
                className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_20px_rgba(24,35,51,0.02)] text-sm focus:border-[#3c6d44] outline-none transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          )}
        </div>

        {/* Saved words list */}
        <AnimatePresence mode="popLayout">
          {filteredWords.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {filteredWords.map((word) => (
                <motion.div
                  layoutId={`vocab-card-${word.vocabularyId}`}
                  key={word.vocabularyId}
                  variants={fadeInUp}
                  className="relative group bg-white rounded-3xl border border-slate-100 shadow-[0_10px_25px_rgba(24,35,51,0.02)] overflow-hidden flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(24,35,51,0.05)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Image cover fallback */}
                      <div className="relative h-32 rounded-2xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center shrink-0 border border-slate-50">
                        {word.lessonId ? (
                          <CourseImage
                            title={word.lessonTitle}
                            coverMediaId={word.lessonCoverMediaId}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#f4fbf6] to-[#eef7ee] flex items-center justify-center">
                            <span className="text-4xl font-extrabold text-[#3c6d44]">
                              {word.termVi.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/5" />
                        
                        {/* Play overlay for hover */}
                        {word.lessonId && (
                          <Link
                            to={`/bai-hoc/${word.lessonId}`}
                            className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                          >
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-[#3c6d44] transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <Play size={18} className="fill-current ml-0.5" />
                            </div>
                          </Link>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Từ vựng</span>
                        <span className="bg-[#fef3c7] text-[#71540a] px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide">
                          +{word.lessonXpReward} XP
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-800 leading-snug line-clamp-1">
                        {word.lessonTitle}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Cấp độ: {word.difficultyLevel}</span>
                        {word.lessonDuration > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {word.lessonDuration} Phút
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-slate-50 px-5 py-3.5 bg-slate-50/50 flex items-center justify-between gap-3">
                    {word.lessonId ? (
                      <Link
                        to={`/bai-hoc/${word.lessonId}`}
                        className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 bg-[#3c6d44] hover:bg-[#315736] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                      >
                        <Play size={12} className="fill-current ml-0.5" /> Học ngay
                      </Link>
                    ) : (
                      <div className="flex-1 text-[11px] font-medium text-slate-400 italic">Chưa gắn bài giảng</div>
                    )}
                    
                    <button
                      onClick={() => handleUnsave(word.progressId, word.vocabularyId)}
                      disabled={unsavingId === word.vocabularyId}
                      className="w-9 h-9 border border-slate-200 hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                      title="Bỏ lưu từ"
                    >
                      {unsavingId === word.vocabularyId ? (
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center text-center justify-center shadow-[0_10px_30px_rgba(24,35,51,0.015)]"
            >
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-4 text-slate-300 relative">
                <Bookmark size={24} />
                <Sparkles size={14} className="absolute top-2 right-2 text-[#efca4c]" />
              </div>
              <h3 className="text-base font-black text-slate-800">
                {searchQuery ? "Không tìm thấy kết quả" : "Danh sách trống"}
              </h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                {searchQuery
                  ? "Hãy thử tìm kiếm từ vựng khác hoặc kiểm tra lại chính tả xem sao nhé."
                  : "Bạn chưa lưu từ vựng nào. Khi học từ, hãy bấm vào nút Lưu từ để lưu lại và luyện tập tại đây bất cứ lúc nào!"}
              </p>
              {!searchQuery && (
                <Link
                  to="/khoa-hoc"
                  className="mt-6 px-6 py-3 bg-[#3c6d44] hover:bg-[#315736] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#3c6d44]/10 transition-transform hover:-translate-y-0.5"
                >
                  Khám phá khóa học
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
