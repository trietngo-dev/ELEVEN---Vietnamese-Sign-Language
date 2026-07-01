import { useState, useEffect } from "react";
import { ArrowLeft, Bot, Bookmark, Share2, Info, ListChecks, Trophy, X, Crown, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AIPracticePopup from "../components/AIPracticePopup";
import videoXinChao from "../assets/videoCourse/W00489.mp4";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { mockLessons } from "../lib/coursesData";
import { cn } from "../lib/utils";

export default function LessonDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [showAI, setShowAI] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUserPremium, setIsUserPremium] = useState(false);

  // Completion states
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [nextLesson, setNextLesson] = useState<any>(null);

  // Bookmark/Save states
  const [isSaved, setIsSaved] = useState(false);
  const [vocabId, setVocabId] = useState<number | null>(null);
  const [progressId, setProgressId] = useState<number | null>(null);
  const [existingProgress, setExistingProgress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [showChapterQuizPrompt, setShowChapterQuizPrompt] = useState(false);
  const [allLessons, setAllLessons] = useState<any[]>([]);

  // Free user quiz states
  const [showFreeQuiz, setShowFreeQuiz] = useState(false);
  const [freeQuizOptions, setFreeQuizOptions] = useState<string[]>([]);
  const [selectedFreeOption, setSelectedFreeOption] = useState<string | null>(null);
  const [freeQuizResult, setFreeQuizResult] = useState<"correct" | "incorrect" | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const userId = user?.id || 1;

        // Check if the current lesson is from static mock data
        const isMockLessonId = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"].includes(id || "");

        let data = null;

        if (isMockLessonId) {
          data = mockLessons.find(l => l.id.toString() === id);
          if (data) {
            setLesson(data);
            setVideoUrl(data.videoUrl);
          }
        } else {
          const res = await fetch(`${API_BASE_URL}/api/lessons/${id}`, { headers });
          if (res.ok) {
            data = await res.json();
            setLesson(data);

            if (data.videoMediaId) {
              const mediaRes = await fetch(`${API_BASE_URL}/api/media_assets/${data.videoMediaId}`, { headers });
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json();
                setVideoUrl(mediaData.fileUrl);
              }
            }
          }
        }

        if (data) {
          // Fetch next lesson in course
          const allLessonsRes = await fetch(`${API_BASE_URL}/api/lessons`, { headers });
          let courseLessons: any[] = [];
          if (allLessonsRes.ok) {
            const allLesData = await allLessonsRes.json();
            const items = allLesData.items || (Array.isArray(allLesData) ? allLesData : allLesData.items) || [];
            courseLessons = items.filter((l: any) => l.courseId === data.courseId);
          }

          // Merge mock lessons if this course has mocks
          const mockCourseLessons = mockLessons.filter(l => l.courseId === data.courseId);
          const mergedLessons = [
            ...mockCourseLessons.filter(ml => !courseLessons.some(cl => cl.id === ml.id)),
            ...courseLessons
          ].sort((a: any, b: any) => a.sortOrder - b.sortOrder);

          setAllLessons(mergedLessons);

          // Fetch all completed lessons for course completion check
          try {
            const allProgRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers });
            let apiCompleted: number[] = [];
            if (allProgRes.ok) {
              const progData = await allProgRes.json();
              const items = progData.items || (Array.isArray(progData) ? progData : progData.items) || [];
              apiCompleted = items.filter((p: any) => p.userId === userId && p.status === 2).map((p: any) => p.lessonId);
            }
            const mockCompleted = mergedLessons
              .filter((l: any) => ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"].includes(l.id.toString()) && localStorage.getItem(`mock_lesson_progress_${l.id}`) === "completed")
              .map((l: any) => l.id);
            setCompletedLessonIds([...apiCompleted, ...mockCompleted]);
          } catch (err) {
            console.error("Lỗi khi tải danh sách bài học đã hoàn thành", err);
          }

          const currentIdx = mergedLessons.findIndex((l: any) => l.id.toString() === id);
          if (currentIdx !== -1 && currentIdx < mergedLessons.length - 1) {
            setNextLesson(mergedLessons[currentIdx + 1]);
          } else {
            setNextLesson(null);
          }

          // Fetch progress: use localStorage for mock, use DB API for real lessons
          if (isMockLessonId) {
            const mockProgress = localStorage.getItem(`mock_lesson_progress_${id}`);
            if (mockProgress === "completed") {
              setIsCompleted(true);
              setIsVideoWatched(true);
              setAiScore(100);
            } else {
              setIsCompleted(false);
              setIsVideoWatched(false);
              setAiScore(null);
            }
          } else {
            const progRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers });
            if (progRes.ok) {
              const progData = await progRes.json();
              const items = progData.items || (Array.isArray(progData) ? progData : progData.items) || [];
              const userProgress = items.find((p: any) => p.userId === userId && p.lessonId === data.id);
              if (userProgress && userProgress.status === 2) {
                setIsCompleted(true);
                setIsVideoWatched(true);
                setAiScore(userProgress.bestAccuracy || 100);
              } else {
                setIsCompleted(false);
                setIsVideoWatched(false);
                setAiScore(null);
              }
            }
          }

          // Fetch lesson vocabulary mapping (real lessons only)
          if (!isMockLessonId) {
            const lessonVocabRes = await fetch(`${API_BASE_URL}/api/lesson_vocabularies?pageSize=1000`, { headers });
            if (lessonVocabRes.ok) {
              const lessonVocabData = await lessonVocabRes.json();
              const lessonVocabItems = lessonVocabData.items || (Array.isArray(lessonVocabData) ? lessonVocabData : lessonVocabData.items) || [];
              const mapping = lessonVocabItems.find((lv: any) => lv.lessonId === data.id);
              if (mapping) {
                setVocabId(mapping.vocabularyId);

                const vocabProgRes = await fetch(`${API_BASE_URL}/api/user_vocabulary_progress?pageSize=1000`, { headers });
                if (vocabProgRes.ok) {
                  const vocabProgData = await vocabProgRes.json();
                  const vocabProgItems = vocabProgData.items || (Array.isArray(vocabProgData) ? vocabProgData : vocabProgData.items) || [];
                  const userProg = vocabProgItems.find((p: any) => p.userId === userId && p.vocabularyId === mapping.vocabularyId);
                  if (userProg) {
                    setProgressId(userProg.id);
                    setIsSaved(userProg.isSaved);
                    setExistingProgress(userProg);
                  } else {
                    setProgressId(null);
                    setIsSaved(false);
                    setExistingProgress(null);
                  }
                }
              } else {
                setVocabId(null);
                setProgressId(null);
                setIsSaved(false);
                setExistingProgress(null);
              }
            }
          } else {
            setVocabId(null);
            setProgressId(null);
            setIsSaved(false);
            setExistingProgress(null);
          }
        }

        // Check if user has an active premium subscription
        try {
          const subRes = await fetch(`${API_BASE_URL}/api/user_subscriptions?page=1&pageSize=100`, { headers });
          if (subRes.ok) {
            const subData = await subRes.json();
            const hasActiveSub = (subData.items || []).some(
              (sub: any) => sub.userId === userId && sub.status === 0
            );
            setIsUserPremium(hasActiveSub);
          }
        } catch (err) {
          console.error("Lỗi kiểm tra gói đăng ký", err);
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
        const isMockLessonId = ["2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"].includes(id || "");

        if (isMockLessonId) {
          localStorage.setItem(`mock_lesson_progress_${id}`, "completed");
          setIsCompleted(true);
          setShowCompletionModal(true);
          const parsedId = parseInt(id || "0");
          if (parsedId > 0) {
            setCompletedLessonIds(prev => Array.from(new Set([...prev, parsedId])));
          }
        } else {
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
                xpEarned: 0
              })
            });

            if (res.ok) {
              setIsCompleted(true);
              setShowCompletionModal(true);
              setCompletedLessonIds(prev => Array.from(new Set([...prev, lesson.id])));
            }
          } catch (error) {
            console.error("Lỗi khi cập nhật tiến độ bài học", error);
          }
        }
      }
    };

    completeLesson();
  }, [isVideoWatched, aiScore, isCompleted, lesson, user, id]);

  const handleContinueLearning = () => {
    setShowCompletionModal(false);

    // 1. Kiểm tra bài tiếp theo
    if (nextLesson) {
      // 2. Pro user: Tự động qua bài tiếp theo. Free user: Chỉ tự động qua bài tiếp theo khi cùng moduleId
      const isSameModule = nextLesson.moduleId === lesson.moduleId;
      if (isUserPremium || isSameModule) {
        setIsVideoWatched(false);
        setAiScore(null);
        setIsCompleted(false);
        navigate(`/bai-hoc/${nextLesson.id}`);
        return;
      }
    }

    // 3. Nếu là bài cuối của chương hoặc bài tiếp theo thuộc chương khác
    // Kiểm tra xem tất cả bài học trong chương hiện tại đã được hoàn thành hay chưa
    const currentModuleLessons = allLessons.filter((l: any) => l.moduleId === lesson.moduleId);
    const isAllModuleCompleted = currentModuleLessons.every((l: any) => completedLessonIds.includes(l.id) || l.id === lesson.id);

    if (isAllModuleCompleted) {
      // Hiện modal nhắc nhở làm bài kiểm tra toàn chương để qua chương tiếp theo
      setShowChapterQuizPrompt(true);
    } else {
      // Nếu chưa hoàn thành các bài khác trong chương, chỉ đưa về trang chi tiết khóa học
      navigate(`/khoa-hoc/${lesson.courseId}`);
    }
  };

  const handleToggleSave = async () => {
    if (isSaving || !lesson) return;
    setIsSaving(true);
    try {
      const authToken = tokenStorage.getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const userId = user?.id || 1;

      let currentVocabId = vocabId;
      let currentProgressId = progressId;
      let currentExistingProgress = existingProgress;

      // 1. If vocabId doesn't exist, create vocabulary and map to lesson
      if (!currentVocabId) {
        // Find "general" category first
        let categoryId = 1;
        try {
          const catRes = await fetch(`${API_BASE_URL}/api/vocabulary_categories?pageSize=1000`, { headers });
          if (catRes.ok) {
            const catData = await catRes.json();
            const catItems = catData.items || (Array.isArray(catData) ? catData : catData.items) || [];
            const generalCat = catItems.find((c: any) => c.slug === "general");
            if (generalCat) {
              categoryId = generalCat.id;
            }
          }
        } catch (catErr) {
          console.error("Lỗi lấy danh mục từ vựng, dùng fallback id 1:", catErr);
        }

        // Create vocabulary
        const vocabRes = await fetch(`${API_BASE_URL}/api/vocabularies`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            categoryId: categoryId,
            code: `lesson_${lesson.id}`,
            termVi: lesson.title,
            description: lesson.shortDescription || "Từ vựng chung",
            difficultyLevel: lesson.difficultyLevel || "Cơ bản",
            isFeatured: false,
            createdBy: userId
          })
        });

        if (!vocabRes.ok) throw new Error("Không thể tạo từ vựng");
        const newVocab = await vocabRes.json();
        currentVocabId = newVocab.id;
        setVocabId(newVocab.id);

        // Map vocabulary to lesson
        const mappingRes = await fetch(`${API_BASE_URL}/api/lesson_vocabularies`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            lessonId: lesson.id,
            vocabularyId: newVocab.id,
            sortOrder: 1,
            isRequired: true,
            expectedAccuracy: 80
          })
        });

        if (!mappingRes.ok) throw new Error("Không thể liên kết từ vựng với bài học");
      }

      // 2. Handle UserVocabularyProgress
      if (!currentProgressId) {
        // Create progress
        const progRes = await fetch(`${API_BASE_URL}/api/user_vocabulary_progress`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            userId: userId,
            vocabularyId: currentVocabId,
            status: 0,
            isSaved: true
          })
        });

        if (!progRes.ok) throw new Error("Không thể lưu tiến trình từ vựng");
        const newProg = await progRes.json();
        setProgressId(newProg.id);
        setIsSaved(true);
        setExistingProgress(newProg);
        window.dispatchEvent(new Event("savedWordsChanged"));
      } else {
        // Toggle saved status
        const nextSaved = !isSaved;
        const body = {
          status: currentExistingProgress?.status || 0,
          firstLearnedAt: currentExistingProgress?.firstLearnedAt || null,
          lastPracticedAt: currentExistingProgress?.lastPracticedAt || null,
          masteryLevel: currentExistingProgress?.masteryLevel || 0,
          totalPracticeCount: currentExistingProgress?.totalPracticeCount || 0,
          correctCount: currentExistingProgress?.correctCount || 0,
          bestConfidence: currentExistingProgress?.bestConfidence || 0,
          isSaved: nextSaved
        };

        const updateRes = await fetch(`${API_BASE_URL}/api/user_vocabulary_progress/${currentProgressId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body)
        });

        if (!updateRes.ok) throw new Error("Không thể cập nhật trạng thái lưu từ vựng");
        const updatedProg = await updateRes.json();
        setIsSaved(nextSaved);
        setExistingProgress(updatedProg);
        window.dispatchEvent(new Event("savedWordsChanged"));
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái lưu từ:", err);
      alert("Đã xảy ra lỗi khi lưu từ. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInteractionClick = () => {
    if (isUserPremium) {
      setShowAI(true);
    } else {
      const correct = lesson.title || "Xin chào";
      const incorrect = mockLessons
        .filter(l => l.title !== correct)
        .map(l => l.title);
      const uniqueIncorrect = Array.from(new Set(incorrect));
      const shuffled = uniqueIncorrect.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [correct, ...shuffled].sort(() => 0.5 - Math.random());

      setFreeQuizOptions(options);
      setSelectedFreeOption(null);
      setFreeQuizResult(null);
      setShowFreeQuiz(true);
    }
  };

  const handleFreeAnswerSubmit = () => {
    if (!selectedFreeOption || !lesson) return;
    if (selectedFreeOption === lesson.title) {
      setFreeQuizResult("correct");
      setAiScore(100);
      setIsVideoWatched(true);
      setTimeout(() => {
        setShowFreeQuiz(false);
        const dismissed = localStorage.getItem("hide_upgrade_ai_modal");
        if (!dismissed) {
          setShowUpgradeModal(true);
        }
      }, 1500);
    } else {
      setFreeQuizResult("incorrect");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">Đang tải bài học...</div>;
  }

  if (!lesson) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">Không tìm thấy bài học.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="container mx-auto px-4 md:px-6 py-6">

        {/* Back Button */}
        <div className="my-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black shadow-sm flex items-center justify-center">
              <video
                src={videoUrl || videoXinChao}
                controls
                className="w-full h-full object-contain"
                onEnded={() => {
                  setIsVideoWatched(true);
                }}
              />
            </div>

            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-4">
              <div>
                <h1 className="text-4xl font-black text-slate-800 mb-3">{lesson.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-400">Cấp độ: {lesson.difficultyLevel || "Cơ bản"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* <button
                  onClick={handleInteractionClick}
                  className="flex items-center gap-2 bg-[#3c6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#3c6d44]/20 hover:bg-[#315736] transition-all animate-pulse-slow"
                >
                  <Bot size={18} /> Tương tác với AI
                </button> */}
                <button
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-75 ${isSaved
                    ? "bg-[#efca4c] text-[#4b3c14] hover:bg-[#e7c13f] shadow-[#efca4c]/20"
                    : "bg-[#3c6d44] text-white hover:bg-[#315736] shadow-[#3c6d44]/20"
                    }`}
                >
                  <Bookmark size={18} className={isSaved ? "fill-[#4b3c14] text-[#4b3c14]" : "text-white"} />
                  {isSaved ? "Đã lưu" : "Lưu từ"}
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
                <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2 mb-4">
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
                <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2 mb-4">
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
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Đừng quên thực hành sau bài học nhé!</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col gap-6">
            {/* Vòng tròn tiến độ & Các bước học tập */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm flex flex-col items-center">
              <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2 mb-6 w-full text-left">
                <span className="text-[#3c6d44]">Tiến độ bài học</span>
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
                    <span className={`font-semibold ${aiScore !== null ? "text-slate-700" : "text-slate-400"}`}>2. Kiểm tra từ đã học</span>
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

            {/* Practice & Verification Widget */}
            {isUserPremium ? (
              <div className="bg-gradient-to-br from-[#f4fbf6] to-[#e8f5ec] rounded-[32px] border border-[#d4ebd9] p-6 relative overflow-hidden shadow-sm animate-pulse-slow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3c6d44]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-2 text-[#3c6d44] mb-3 relative z-10">
                  <Bot size={18} />
                  <h3 className="text-xs font-black uppercase tracking-wider">Rèn luyện cử chỉ VSL</h3>
                </div>

                <p className="text-xs text-[#3c6d44]/80 font-semibold mb-4 relative z-10 leading-relaxed">
                  Học viên Pro: Bật Camera AI để hệ thống nhận diện và chấm điểm động tác tay của bạn tức thời.
                </p>

                <button
                  disabled={!isVideoWatched}
                  onClick={handleInteractionClick}
                  className={cn(
                    "w-full py-3 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 relative z-10",
                    isVideoWatched
                      ? "bg-[#3c6d44] hover:bg-[#315736] hover:-translate-y-0.5 shadow-md shadow-[#3c6d44]/20 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <Bot size={14} /> Kiểm tra cử chỉ với AI 🤖
                </button>
                {!isVideoWatched && (
                  <p className="text-[10px] text-red-500 font-bold mt-2.5 text-center relative z-10 animate-pulse">
                    ⚠️ Vui lòng xem hết video để mở khóa kiểm tra AI
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#fffdf5] to-[#fef9e6] rounded-[32px] border border-[#fbf2d0] p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex items-center gap-2 text-amber-600 mb-3 relative z-10">
                  <HelpCircle size={18} />
                  <h3 className="text-xs font-black uppercase tracking-wider">Kiểm tra ghi nhớ</h3>
                </div>

                <p className="text-xs text-amber-700/80 font-semibold mb-4 relative z-10 leading-relaxed">
                  Học viên Free: Trả lời câu hỏi trắc nghiệm nhanh để xác minh mức độ hiểu và hoàn thành bài giảng.
                </p>

                <button
                  disabled={!isVideoWatched}
                  onClick={handleInteractionClick}
                  className={cn(
                    "w-full py-3 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 relative z-10",
                    isVideoWatched
                      ? "bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5 shadow-md shadow-amber-500/20 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <HelpCircle size={14} /> Làm bài trắc nghiệm nhanh
                </button>
                {!isVideoWatched && (
                  <p className="text-[10px] text-red-500 font-bold mt-2.5 text-center relative z-10 animate-pulse">
                    Vui lòng xem hết video để mở khóa trắc nghiệm
                  </p>
                )}
              </div>
            )}

            {/* Next Button */}
            <button
              disabled={!isCompleted}
              onClick={handleContinueLearning}
              className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xl ${isCompleted
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

            <h2 className="text-2xl font-black text-slate-800 mb-2 relative z-10">Hoàn thành bài học!</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed relative z-10">
              Tuyệt vời! Bạn đã xem xong video và thực hành cử chỉ cực chuẩn với AI đạt <strong>{aiScore}%</strong>.
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 relative z-10 flex flex-col items-center justify-center gap-1 text-center">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Trạng thái</span>
              <span className="text-sm font-black text-emerald-800">Đã hoàn thành bài học này!</span>
            </div>

            <button
              onClick={handleContinueLearning}
              className="w-full py-4 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center font-bold hover:bg-[#315736] transition-all shadow-xl shadow-[#3c6d44]/20 hover:-translate-y-0.5 relative z-10"
            >
              Tiếp tục học
            </button>
          </div>
        </div>
      )}

      {/* Chapter Quiz Prompt Modal */}
      {showChapterQuizPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <button onClick={() => setShowChapterQuizPrompt(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
              <X size={20} />
            </button>

            <div className="size-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner relative z-10 animate-bounce-slow">
              <Trophy size={40} className="text-amber-500" />
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-2 relative z-10">Hoàn thành chương học!</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed relative z-10">
              Chúc mừng bạn đã hoàn thành tất cả bài giảng trong chương học này! Hãy kiểm tra toàn chương để ôn luyện và mở khóa chương học tiếp theo nhé.
            </p>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={() => {
                  setShowChapterQuizPrompt(false);
                  navigate(`/khoa-hoc/${lesson.courseId}?startQuiz=${lesson.moduleId}`);
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20 hover:-translate-y-0.5 transition-all"
              >
                Làm test chương 📝
              </button>
              <button
                onClick={() => {
                  setShowChapterQuizPrompt(false);
                  navigate(`/khoa-hoc/${lesson.courseId}`);
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs transition-all"
              >
                Về trang khóa học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Practice Modal Overlay */}
      {showAI && (
        <AIPracticePopup
          word={lesson.title || "Xin chào"}
          onSuccess={(score) => setAiScore(score)}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Free User Quiz Modal */}
      {showFreeQuiz && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowFreeQuiz(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-[#3c6d44] mb-4 bg-emerald-50 border border-emerald-100/50 px-4 py-2 rounded-2xl w-fit">
              <HelpCircle size={18} />
              <span className="text-[11px] font-black uppercase tracking-wider">Trắc nghiệm nhanh</span>
            </div>

            <h3 className="text-lg font-black text-slate-800 mb-2">Cử chỉ trong video có nghĩa là gì?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Chọn ý nghĩa chính xác tương ứng với cử chỉ ngôn ngữ ký hiệu bạn vừa xem.</p>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mb-6">
              {freeQuizOptions.map((opt) => {
                const isSelected = selectedFreeOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (freeQuizResult !== "correct") {
                        setSelectedFreeOption(opt);
                        setFreeQuizResult(null);
                      }
                    }}
                    disabled={freeQuizResult === "correct"}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-sm font-bold transition-all text-left flex items-center justify-between",
                      isSelected
                        ? "border-[#3c6d44] bg-[#f4fbf6] text-[#3c6d44]"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50"
                    )}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="text-[#3c6d44] font-black">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Result display */}
            {freeQuizResult === "correct" && (
              <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="text-xs font-bold leading-normal">Chính xác! Bạn đã chọn đáp án hoàn toàn chính xác.</span>
              </div>
            )}
            {freeQuizResult === "incorrect" && (
              <div className="flex items-center gap-2.5 text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-xs font-bold leading-normal">Chưa đúng rồi! Hãy quan sát kỹ lại video cử chỉ và chọn lại nhé.</span>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFreeQuiz(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleFreeAnswerSubmit}
                disabled={!selectedFreeOption || freeQuizResult === "correct"}
                className="px-6 py-2.5 bg-[#3c6d44] hover:bg-[#315736] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#3c6d44]/20 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Suggestion Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="size-20 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
              <Crown size={38} className="text-amber-500" />
            </div>

            <h2 className="text-xl font-black text-slate-800 mb-2 relative z-10">Kích hoạt chấm điểm AI!</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed relative z-10 px-2">
              Chúc mừng bạn đã hoàn thành bài học! Để nâng cao tối đa hiệu quả ghi nhớ, hãy nâng cấp tài khoản Pro để kích hoạt **hệ thống chấm điểm AI qua Camera webcam** thời gian thực nhé!
            </p>

            <div className="flex flex-col gap-2.5 relative z-10">
              <Link
                to="/nang-cap"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center font-bold hover:bg-[#315736] transition-all shadow-xl shadow-[#3c6d44]/10 hover:-translate-y-0.5"
              >
                Nâng cấp tài khoản Pro
              </Link>
              <button
                onClick={() => {
                  const checkbox = document.getElementById("hide-upgrade-modal-checkbox") as HTMLInputElement;
                  if (checkbox?.checked) {
                    localStorage.setItem("hide_upgrade_ai_modal", "true");
                  }
                  setShowUpgradeModal(false);
                }}
                className="w-full py-3 border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Để sau, tiếp tục học Free
              </button>
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer select-none relative z-10 justify-center">
              <input
                id="hide-upgrade-modal-checkbox"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#3c6d44] focus:ring-[#3c6d44] accent-[#3c6d44] cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-semibold">Không hiện lại thông báo này</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
