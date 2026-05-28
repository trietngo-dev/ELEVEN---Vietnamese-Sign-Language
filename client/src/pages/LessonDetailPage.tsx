import { useState, useEffect } from "react";
import { ArrowLeft, Maximize, Bot, Bookmark, Share2, Info, ListChecks, Trophy, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AIPracticePopup from "../components/AIPracticePopup";
import videoXinChao from "../assets/videoCourse/W00489.mp4";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

export default function LessonDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [showAI, setShowAI] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Completion states
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [nextLesson, setNextLesson] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const userId = user?.id || 1;

        const res = await fetch(`${API_BASE_URL}/api/lessons/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setLesson(data);

          if (data.videoMediaId) {
            const mediaRes = await fetch(`${API_BASE_URL}/api/media_assets/${data.videoMediaId}`, { headers });
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json();
              setVideoUrl(mediaData.fileUrl);
            }
          }

          // Fetch next lesson in course
          const allLessonsRes = await fetch(`${API_BASE_URL}/api/lessons`, { headers });
          if (allLessonsRes.ok) {
            const allLesData = await allLessonsRes.json();
            const items = allLesData.items || Array.isArray(allLesData) ? (Array.isArray(allLesData) ? allLesData : allLesData.items) : [];
            const courseLessons = items
              .filter((l: any) => l.courseId === data.courseId)
              .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

            const currentIdx = courseLessons.findIndex((l: any) => l.id === data.id);
            if (currentIdx !== -1 && currentIdx < courseLessons.length - 1) {
              setNextLesson(courseLessons[currentIdx + 1]);
            } else {
              setNextLesson(null);
            }
          }

          // Fetch the lesson's progress to check if it's already completed
          const progRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers });
          if (progRes.ok) {
            const progData = await progRes.json();
            const items = progData.items || Array.isArray(progData) ? (Array.isArray(progData) ? progData : progData.items) : [];
            const userProgress = items.find((p: any) => p.userId === userId && p.lessonId === data.id);
            if (userProgress && userProgress.status === 2) {
              setIsCompleted(true);
              setIsVideoWatched(true);
              setAiScore(userProgress.bestAccuracy || 100);
            } else {
              // Reset states for new uncompleted lesson
              setIsCompleted(false);
              setIsVideoWatched(false);
              setAiScore(null);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi tải bài học", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadData();
  }, [id, user]);

  useEffect(() => {
    const completeLesson = async () => {
      if (isVideoWatched && aiScore !== null && !isCompleted && lesson) {
        try {
          const authToken = tokenStorage.getToken();
          const userId = user?.id || 1;

          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          const res = await fetch(`${API_BASE_URL}/api/user_lesson_progress/upsert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              userId: userId,
              lessonId: lesson.id,
              status: 2, // Completed
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              lastPositionSeconds: 0,
              attemptsCount: 1,
              bestAccuracy: aiScore,
              bestScore: aiScore,
              totalTimeSeconds: lesson.estimatedMinutes * 60,
              xpEarned: lesson.xpReward || 50
            })
          });

          if (res.ok) {
            setIsCompleted(true);
            setShowCompletionModal(true);
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật tiến độ bài học", error);
        }
      }
    };

    completeLesson();
  }, [isVideoWatched, aiScore, isCompleted, lesson, user]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-800">Đang tải bài học...</div>;
  }

  if (!lesson) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-800">Không tìm thấy bài học.</div>;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="mx-auto max-w-[1200px] px-6 py-6">

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center mb-4 gap-2.5 px-5 py-2.5 rounded-2xl bg-[#3b7948] text-white font-bold text-sm hover:bg-[#336a40] transition-all active:scale-95 shadow-md">
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Main Content Area */}
          <div className="flex flex-col gap-6">

            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black shadow-sm flex items-center justify-center">
              <video
                src={videoUrl || videoXinChao}
                controls
                className="w-full h-full object-contain"
                onEnded={() => setIsVideoWatched(true)}
              />

              {/* AI Overlay Box */}
              {showAI && (
                <div className="absolute top-4 right-4 w-[280px] h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-50 flex flex-col animate-in fade-in zoom-in duration-150">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 shadow-sm z-10">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Bot size={16} className="text-[#3c6d44]" /> Trợ lý AI Điểm Trình</span>
                    <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full p-1 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 relative bg-slate-900 flex flex-col">
                    {/* KHU VỰC HIỂN THỊ AIPracticePopup (Chỉ Camera -> Review) */}
                    <AIPracticePopup
                      word={lesson.title || "Xin chào"}
                      onSuccess={(score) => setAiScore(score)}
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                <span className="text-xs font-bold ml-1">Chế độ chậm</span>
                <div className="w-8 h-4 rounded-full bg-white/30 ml-2 relative">
                  <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
              <button className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <Maximize size={16} />
              </button>
            </div>

            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-4">
              <div>
                <h1 className="text-4xl font-extrabold text-[#1f2937] mb-3">{lesson.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-400">Cấp độ: {lesson.difficultyLevel || "Cơ bản"}</span>
                  {lesson.xpReward && (
                    <span className="bg-[#fef3c7] text-[#71540a] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      +{lesson.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAI(true)}
                  className="flex items-center gap-2 bg-[#3c6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#3c6d44]/20 hover:bg-[#315736] transition-all"
                >
                  <Bot size={18} /> Tương tác với AI
                </button>
                <button className="flex items-center gap-2 bg-[#3c6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#3c6d44]/20 hover:bg-[#315736] transition-all">
                  <Bookmark size={18} className="fill-current" /> Lưu từ
                </button>
                <button className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-slate-100 pt-8">

              {/* Ý nghĩa */}
              <div>
                <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-4">
                  <Info size={18} className="text-[#3c6d44]" /> Ý nghĩa & Sử dụng
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {lesson.shortDescription || "Đang cập nhật..."}
                </p>
                {lesson.objectiveText && (
                  <div className="bg-[#f4fbf6] border-l-4 border-[#3c6d44] p-4 rounded-r-2xl">
                    <p className="text-sm font-semibold text-[#3c6d44] italic">"{lesson.objectiveText}"</p>
                  </div>
                )}
              </div>

              {/* Mẹo thực hiện */}
              <div>
                <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-4">
                  <ListChecks size={18} className="text-[#3c6d44]" /> Thông tin bổ sung
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">1</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Thời gian ước tính: {lesson.estimatedMinutes || 0} phút</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">2</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Thứ tự bài học: {lesson.sortOrder || 1}</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">3</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Đừng quên thực hành với Trợ lý AI để lấy XP nhé!</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col gap-6">

            {/* Vòng tròn tiến độ & Các bước học tập */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm flex flex-col items-center">
              <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-6 w-full text-left">
                <span className="text-[#3c6d44]">🎯</span> Tiến độ bài học
              </h3>

              {/* Progress Ring */}
              <div className="relative flex items-center justify-center w-36 h-36 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="text-[#3c6d44] transition-all duration-500"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - ((isCompleted ? 100 : (isVideoWatched && aiScore !== null) ? 100 : (isVideoWatched || aiScore !== null) ? 50 : 0) / 100) * 2 * Math.PI * 40}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800">{isCompleted ? 100 : (isVideoWatched && aiScore !== null) ? 100 : (isVideoWatched || aiScore !== null) ? 50 : 0}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tiến trình</span>
                </div>
              </div>

              {/* Steps List */}
              <div className="flex flex-col gap-4 w-full border-t border-slate-50 pt-5">
                {/* Step 1 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isVideoWatched ? "bg-[#eef7ee] text-[#3c6d44]" : "bg-slate-100 text-slate-400"}`}>
                      {isVideoWatched ? "✓" : "1"}
                    </span>
                    <span className={`font-semibold ${isVideoWatched ? "text-slate-700" : "text-slate-400"}`}>1. Xem video giảng dạy</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${isVideoWatched ? "bg-[#eef7ee] text-[#3c6d44]" : "bg-slate-50 text-slate-400"}`}>
                    {isVideoWatched ? "Đã xem" : "Chưa xem"}
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${aiScore !== null ? "bg-[#eef7ee] text-[#3c6d44]" : "bg-slate-100 text-slate-400"}`}>
                      {aiScore !== null ? "✓" : "2"}
                    </span>
                    <span className={`font-semibold ${aiScore !== null ? "text-slate-700" : "text-slate-400"}`}>2. Kiểm tra với AI</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${aiScore !== null ? "bg-[#fdf8e9] text-[#71540a]" : "bg-slate-50 text-slate-400"}`}>
                    {aiScore !== null ? `Đạt ${Math.round(aiScore)}%` : "Chưa làm"}
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCompleted ? "bg-[#eef7ee] text-[#3c6d44]" : "bg-slate-100 text-slate-400"}`}>
                      {isCompleted ? "✓" : "3"}
                    </span>
                    <span className={`font-semibold ${isCompleted ? "text-slate-700" : "text-slate-400"}`}>3. Hoàn thành bài học</span>
                  </div>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${isCompleted ? "bg-[#eef7ee] text-[#3c6d44]" : "bg-slate-50 text-slate-400"}`}>
                    {isCompleted ? "Hoàn thành" : "Chưa đạt"}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Challenge */}
            <div className="bg-[#f4fbf6] rounded-[32px] border border-[#eef7ee] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3c6d44]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

              <h3 className="text-sm font-extrabold text-[#3c6d44] mb-2 relative z-10">Thử thách hàng ngày</h3>
              <p className="text-xs text-[#3c6d44]/70 font-medium mb-6 relative z-10 leading-relaxed">
                Hoàn thành 5 từ vựng giao tiếp để nhận huy hiệu mới!
              </p>

              <div className="relative z-10">
                <div className="w-full h-2 bg-[#d4e4d8] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#3c6d44] w-[60%] rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#3c6d44]">
                  <span>3/5 hoàn thành</span>
                  <span>60%</span>
                </div>
              </div>

              <Trophy size={100} strokeWidth={1} className="absolute -bottom-6 -right-6 text-[#3c6d44]/10 transform -rotate-12 pointer-events-none" />
            </div>

            {/* Next Button */}
            <button
              disabled={!isCompleted}
              onClick={() => {
                if (nextLesson) {
                  // Reset player completion states for the next lesson
                  setIsVideoWatched(false);
                  setAiScore(null);
                  setIsCompleted(false);
                  setShowCompletionModal(false);
                  // Navigate to the next lesson page
                  navigate(`/bai-hoc/${nextLesson.id}`);
                } else {
                  // Navigate back to course detail page
                  navigate(`/khoa-hoc/${lesson.courseId}`);
                }
              }}
              className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xl ${
                isCompleted
                  ? "bg-[#3c6d44] text-white hover:bg-[#315736] hover:-translate-y-0.5 shadow-[#3c6d44]/20 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {nextLesson ? "Từ tiếp theo" : "Hoàn thành khóa học"}
            </button>

          </div>
        </div>

      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3c6d44]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <button onClick={() => setShowCompletionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
              <X size={20} />
            </button>

            <div className="size-24 bg-[#f4fbf6] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
              <Trophy size={48} className="text-[#3c6d44]" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-2 relative z-10">Hoàn thành bài học!</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed relative z-10">
              Tuyệt vời! Bạn đã xem xong video và thực hành cử chỉ cực chuẩn với AI đạt <strong>{aiScore}%</strong>.
            </p>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 relative z-10 flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Phần thưởng</span>
              <span className="text-3xl font-black text-amber-600">+{lesson?.xpReward || 50} XP</span>
            </div>

            <button
              onClick={() => {
                setShowCompletionModal(false);
                navigate(-1);
              }}
              className="w-full py-4 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center font-bold hover:bg-[#315736] transition-all shadow-xl shadow-[#3c6d44]/20 hover:-translate-y-0.5 relative z-10"
            >
              Tiếp tục học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
