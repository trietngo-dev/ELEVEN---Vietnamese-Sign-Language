import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, PlayCircle, Lock, Crown, Star, Loader2, Plus, CheckCircle2, AlertCircle, X, HelpCircle, ChevronDown, BookOpen } from "lucide-react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import CourseImage from "../components/CourseImage";
import { mockCourses, mockModules, mockLessons } from "../lib/coursesData";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserPremium, setIsUserPremium] = useState(false);

  // Ratings & Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [courseCategoryId, setCourseCategoryId] = useState<number | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', '5', '4', '3', '2', '1', 'comment'

  // Quiz states for Free user
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizModule, setQuizModule] = useState<any>(null);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | "next" | null>(null);
  const [completedQuizModuleIds, setCompletedQuizModuleIds] = useState<number[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [quizLessons, setQuizLessons] = useState<any[]>([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const activeModule = useMemo(() => {
    if (modules.length === 0) return null;
    if (!selectedModuleId) return modules[0];
    return modules.find(m => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const activeModuleLessons = useMemo(() => {
    if (!activeModule) return [];
    return lessons.filter(l => l.moduleId === activeModule.id);
  }, [lessons, activeModule]);

  const isSelectedModuleLessonsCompleted = useMemo(() => {
    if (!activeModuleLessons || activeModuleLessons.length === 0) return false;
    return activeModuleLessons.every(l => completedLessonIds.includes(l.id));
  }, [activeModuleLessons, completedLessonIds]);

  const canTakeQuizForActive = useMemo(() => {
    if (!activeModule || isUserPremium) return false;
    return isSelectedModuleLessonsCompleted && !completedQuizModuleIds.includes(activeModule.id);
  }, [activeModule, isUserPremium, isSelectedModuleLessonsCompleted, completedQuizModuleIds]);

  // Load completed quiz module IDs from localStorage
  useEffect(() => {
    const keys = Object.keys(localStorage);
    const completedQuizs = keys
      .filter(k => k.startsWith("quiz_completed_module_"))
      .map(k => parseInt(k.replace("quiz_completed_module_", "")));
    setCompletedQuizModuleIds(completedQuizs);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const [courseRes, modulesRes, lessonsRes, catRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses/${id}`, { headers }),
          fetch(`${API_BASE_URL}/api/course_modules?pageSize=1000`, { headers }),
          fetch(`${API_BASE_URL}/api/lessons?pageSize=1000`, { headers }),
          fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
          fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers })
        ]);

        let currentCourse = null;
        let currentModules: any[] = [];
        let currentLessons: any[] = [];

        if (courseRes.ok) {
          currentCourse = await courseRes.json();
        }

        if (modulesRes.ok) {
          const modData = await modulesRes.json();
          const items = modData.items || (Array.isArray(modData) ? modData : modData.items) || [];
          currentModules = items.filter((m: any) => m.courseId?.toString() === id?.toString());
        }

        if (lessonsRes.ok) {
          const lesData = await lessonsRes.json();
          const items = lesData.items || (Array.isArray(lesData) ? lesData : lesData.items) || [];
          currentLessons = items.filter((l: any) => l.courseId?.toString() === id?.toString());
        }

        // If no modules/lessons found in API for this course, fallback to mock data if exists
        if (currentModules.length === 0 && currentLessons.length === 0) {
          const mockC = mockCourses.find(c => c.id.toString() === id?.toString());
          if (mockC) {
            currentCourse = {
              ...mockC,
              ...currentCourse
            };
            currentModules = mockModules.filter(m => m.courseId.toString() === id?.toString());
            currentLessons = mockLessons.filter(l => l.courseId.toString() === id?.toString());
          }
        }

        const sortedMods = currentModules.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCourse(currentCourse);
        setModules(sortedMods);
        setLessons(currentLessons.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        if (sortedMods.length > 0) {
          setSelectedModuleId((prev) => (prev !== null && sortedMods.some(m => m.id === prev) ? prev : sortedMods[0].id));
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          const items = catData.items || (Array.isArray(catData) ? catData : []);
          const courseCat = items.find((c: any) => (c.name || c.Name || "").toLowerCase() === "course");
          if (courseCat) {
            setCourseCategoryId(courseCat.id || courseCat.Id);
          } else {
            setCourseCategoryId(1);
          }
        }
        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setReviews(revData.items || []);
        }

        // Fetch User Progress
        let userId = user?.id || 1;
        if (authToken && id) {
          try {
            const progRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress/user/${userId}/course/${id}`, { headers });
            if (progRes.ok) {
              const progData = await progRes.json();
              const completedList = progData.filter((p: any) => p.status === 2).map((p: any) => p.lessonId);
              setCompletedLessonIds(completedList);
              setCompletedLessonsCount(completedList.length);
            }
          } catch (err) {
            console.error("Lỗi tải tiến độ", err);
          }

          // Check if user has an active premium subscription
          try {
            const subRes = await fetch(`${API_BASE_URL}/api/user_subscriptions?page=1&pageSize=100`, { headers });
            if (subRes.ok) {
              const subData = await subRes.json();
              const hasActiveSub = (subData.items || []).some(
                (sub: any) => sub.userId === userId && sub.status === 0 // 0 = Active
              );
              setIsUserPremium(hasActiveSub);
            }
          } catch (err) {
            console.error("Lỗi kiểm tra gói đăng ký", err);
          }
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết khóa học", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadData();
  }, [id, user]);

  useEffect(() => {
    if (!isLoading && modules.length > 0 && lessons.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const startQuizModuleId = queryParams.get("startQuiz");
      if (startQuizModuleId) {
        const targetModule = modules.find(m => m.id.toString() === startQuizModuleId);
        if (targetModule) {
          const moduleLessons = lessons.filter(l => l.moduleId === targetModule.id);
          startQuiz(targetModule, moduleLessons);
          // Clear query param to keep URL clean and prevent re-triggering
          navigate(`/khoa-hoc/${id}`, { replace: true });
        }
      }
    }
  }, [isLoading, modules, lessons, location.search, id, navigate]);
  const totalTimeMinutes = useMemo(() => {
    return lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 0), 0);
  }, [lessons]);

  const nextLessonId = useMemo(() => {
    if (lessons.length === 0) return null;
    const uncompleted = lessons.find(l => !completedLessonIds.includes(l.id));
    return uncompleted ? uncompleted.id : (lessons[0]?.id || null);
  }, [lessons, completedLessonIds]);

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
  };

  const courseReviews = useMemo(() => {
    return reviews.filter((r: any) =>
      r.categoryId === courseCategoryId &&
      r.subject === `CourseId:${id}`
    );
  }, [reviews, courseCategoryId, id]);

  const averageRating = useMemo(() => {
    if (courseReviews.length === 0) return 0;
    const sum = courseReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / courseReviews.length) * 10) / 10;
  }, [courseReviews]);

  const countByStars = useMemo(() => {
    const counts = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0, "comment": 0 };
    courseReviews.forEach(r => {
      const starStr = r.rating.toString();
      if (starStr in counts) {
        counts[starStr as keyof typeof counts]++;
      }
      if (r.content && r.content.trim()) {
        counts["comment"]++;
      }
    });
    return counts;
  }, [courseReviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") return courseReviews;
    if (activeFilter === "comment") return courseReviews.filter(r => r.content && r.content.trim());
    const starsNum = parseInt(activeFilter);
    return courseReviews.filter(r => r.rating === starsNum);
  }, [courseReviews, activeFilter]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }
    if (!newComment.trim()) {
      setReviewError("Vui lòng viết bình luận đánh giá.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const categoryIdToUse = courseCategoryId || 1;

      const res = await fetch(`${API_BASE_URL}/api/feedbacks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user.id,
          categoryId: categoryIdToUse,
          rating: newRating,
          subject: `CourseId:${id}`,
          content: newComment.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Đăng đánh giá thất bại. Vui lòng thử lại.");
      }

      const reviewData = await res.json();
      setReviews(prev => [reviewData, ...prev]);
      setNewComment("");
      setNewRating(5);
      setShowReviewModal(false);
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || "Lỗi kết nối mạng.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const generateQuizOptions = (correctTitle: string) => {
    const incorrect = [...lessons, ...mockLessons]
      .filter(l => l.title && l.title !== correctTitle)
      .map(l => l.title);
    const uniqueIncorrect = Array.from(new Set(incorrect));
    const shuffled = uniqueIncorrect.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctTitle, ...shuffled];
    return options.sort(() => 0.5 - Math.random());
  };

  const startQuiz = (module: any, moduleLessons: any[]) => {
    if (moduleLessons.length === 0) return;
    const shuffled = [...moduleLessons].sort(() => 0.5 - Math.random());
    setQuizLessons(shuffled);
    setQuizCurrentIndex(0);
    setQuizCorrectCount(0);
    setQuizModule(module);
    setQuizQuestion(shuffled[0]);
    setQuizOptions(generateQuizOptions(shuffled[0].title));
    setSelectedOption(null);
    setQuizResult(null);
    setShowQuiz(true);
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || !quizQuestion) return;
    if (selectedOption === quizQuestion.title) {
      const newCorrectCount = quizCorrectCount + 1;
      setQuizCorrectCount(newCorrectCount);
      const nextIndex = quizCurrentIndex + 1;

      if (nextIndex >= quizLessons.length) {
        // All questions answered correctly → quiz completed
        setQuizResult("correct");
        localStorage.setItem(`quiz_completed_module_${quizModule.id}`, "true");
        setCompletedQuizModuleIds(prev => [...prev, quizModule.id]);
      } else {
        // Move to next question after a brief delay
        setQuizResult("next");
        setTimeout(() => {
          setQuizCurrentIndex(nextIndex);
          setQuizQuestion(quizLessons[nextIndex]);
          setQuizOptions(generateQuizOptions(quizLessons[nextIndex].title));
          setSelectedOption(null);
          setQuizResult(null);
        }, 800);
      }
    } else {
      setQuizResult("incorrect");
    }
  };

  const handleQuizRewardClaim = async () => {
    try {
      const authToken = tokenStorage.getToken();
      const userId = user?.id || 1;
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      await fetch(`${API_BASE_URL}/api/user_profiles/${userId}/add-xp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ xpToAdd: 50 })
      });
    } catch (err) {
      console.error("Lỗi khi cộng XP hoàn thành chương học", err);
    }
    setShowQuiz(false);
    setShowUpgradeModal(true);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">Đang tải dữ liệu...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">Không tìm thấy khóa học.</div>;
  }

  const progressPercentage = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0;
  const isPremiumCourse = course?.isPremium ?? false;
  const canStartLearning = !isPremiumCourse || isUserPremium;

  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 md:space-y-10">

        {/* Top Bar: Back Button + Premium Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-slate-700 hover:text-[#2d6a4f] hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 font-bold text-sm"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          {isPremiumCourse && !canStartLearning && (
            <div className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 md:justify-between shadow-sm">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-200/80 text-amber-800" aria-hidden="true">
                  <Crown className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-amber-900">Đây là khóa học dành cho tài khoản Pro</p>
                  <p className="text-xs text-amber-700 font-medium">Nâng cấp tài khoản Pro để truy cập toàn bộ nội dung khóa học này.</p>
                </div>
              </div>
              <Link to="/nang-cap" className="flex-shrink-0 h-9 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition-colors inline-flex items-center shadow-sm">
                Nâng cấp ngay
              </Link>
            </div>
          )}
        </div>

        {/* Hero & Progress Section (White Card Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] items-stretch gap-8">
          {/* Left: Course Info Banner */}
          <div className="relative rounded-[32px] overflow-hidden shadow-sm bg-slate-100 min-h-[320px] lg:min-h-[420px] flex-1 border border-slate-200/80">
            <CourseImage
              title={course.title}
              coverMediaId={course.coverMediaId}
              className="w-full h-full object-cover absolute inset-0"
            />
            {/* Dark gradient overlay for a premium look */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-600/90 text-white rounded-full mb-2 backdrop-blur-sm">
                {course.level || "Cơ bản"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-sm">
                {course.title}
              </h2>
            </div>
          </div>

          {/* Right: Progress Card */}
          <div className="bg-white rounded-[32px] border border-emerald-100/90 shadow-[0_8px_30px_rgba(35,48,57,0.04)] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Level badge + Star Rating */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3.5 py-1 text-xs font-black text-[#2d6a4f] bg-[#eef7ee] rounded-full uppercase tracking-widest border border-emerald-200/50">
                  {course.level || "Cơ bản"}
                </span>
                {averageRating > 0 && (
                  <span className="flex items-center gap-1.5 text-[#d97706] font-bold text-xs bg-[#fffbeb] px-3 py-1 rounded-full border border-[#fef3c7]">
                    <Star size={13} className="text-[#fbbf24] fill-[#fbbf24]" /> {averageRating} / 5
                  </span>
                )}
              </div>

              {/* Course Title inside Card */}
              <h1 className="text-2xl font-black text-slate-800 mb-5 leading-tight tracking-tight">
                {course.title}
              </h1>

              <div className="mb-5 block">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ ({completedLessonsCount}/{lessons.length})</span>
                  <span className="text-2xl font-black text-slate-800">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số bài học</p>
                  <p className="text-base font-black text-slate-800">{lessons.length} bài</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thời lượng</p>
                  <p className="text-base font-black text-slate-800">{formatHours(totalTimeMinutes)}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">Mô tả khóa học</p>
                <p className="text-slate-600 leading-relaxed text-xs font-medium whitespace-pre-line">
                  {course.description || course.summary || "Khóa học chất lượng cao về ngôn ngữ ký hiệu Việt Nam."}
                </p>
              </div>
            </div>

            {nextLessonId ? (
              canStartLearning ? (
                <Link to={`/bai-hoc/${nextLessonId}`} className="w-full h-12 rounded-2xl bg-[#3c6d44] hover:bg-[#315736] text-white flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md shadow-[#3c6d44]/20 hover:-translate-y-0.5">
                  <PlayCircle size={20} /> {completedLessonsCount > 0 ? "Học tiếp" : "Bắt đầu học"}
                </Link>
              ) : (
                <button disabled className="w-full h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center gap-2 font-bold text-sm cursor-not-allowed">
                  <Lock size={16} /> Yêu cầu tài khoản Pro
                </button>
              )
            ) : (
              <button disabled className="w-full h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center gap-2 font-bold text-sm cursor-not-allowed">
                Chưa có bài học
              </button>
            )}
          </div>
        </div>

        {/* ─── Curriculum Section (Wrapped in White Box Container) ─── */}
        <div className="bg-white rounded-[32px] border border-emerald-100/90 shadow-[0_8px_30px_rgba(35,48,57,0.04)] p-6 sm:p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <BookOpen size={22} />
                </span>
                Nội dung chương trình học
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Bấm chọn một chương bên dưới để xem danh sách các bài học chi tiết.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full self-start sm:self-auto border border-slate-200">
              {modules.length} Chương • {lessons.length} Bài học
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/50">
              <BookOpen size={36} className="text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-600">Khóa học này đang được cập nhật nội dung</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng quay lại sau để đón nhận các bài học mới.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ─── Chapter Cards Grid (Horizontal Row) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((module, mIdx) => {
                  const moduleLessons = lessons.filter(l => l.moduleId === module.id);
                  const isSelected = selectedModuleId === module.id;

                  // Progression & premium lock check
                  const isPremiumLocked = course.isPremium && !module.isPreview && !isUserPremium;
                  const isFreeProgressLocked = !isUserPremium && mIdx > 0 && !completedQuizModuleIds.includes(modules[mIdx - 1].id);
                  const isLocked = isPremiumLocked || isFreeProgressLocked;

                  const isModuleCompleted = moduleLessons.length > 0 && moduleLessons.every(l => completedLessonIds.includes(l.id));
                  const isQuizDone = completedQuizModuleIds.includes(module.id);
                  const moduleDuration = moduleLessons.reduce((sum, l) => sum + (l.estimatedMinutes || 0), 0);

                  return (
                    <div
                      key={module.id}
                      onClick={() => !isLocked && setSelectedModuleId(module.id)}
                      className={cn(
                        "rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between relative cursor-pointer group",
                        isSelected
                          ? "border-[#2d6a4f] bg-emerald-50/30 shadow-md ring-2 ring-[#2d6a4f]/20"
                          : "border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-sm",
                        isLocked && "opacity-75 bg-slate-50 cursor-not-allowed hover:border-slate-200"
                      )}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border",
                            isSelected
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            Chương {mIdx + 1}
                          </span>

                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              <Lock size={12} /> Khóa
                            </span>
                          ) : isQuizDone ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} /> Đã test
                            </span>
                          ) : isModuleCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 size={12} /> Hoàn thành
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                              Sẵn sàng
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={cn(
                          "text-lg font-black leading-snug line-clamp-2 min-h-[3rem]",
                          isSelected ? "text-[#2d6a4f]" : "text-slate-800 group-hover:text-[#2d6a4f]"
                        )}>
                          {module.title}
                        </h3>

                        {/* Stats */}
                        <p className="text-xs font-semibold text-slate-400 mt-2">
                          {moduleLessons.length} bài học • {moduleDuration} phút
                        </p>
                      </div>

                      {/* Select CTA Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100/80">
                        <button
                          type="button"
                          disabled={isLocked}
                          className={cn(
                            "w-full h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                            isLocked
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#2d6a4f] text-white shadow-sm"
                              : "bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200"
                          )}
                        >
                          {isLocked ? (
                            <>
                              <Lock size={12} /> Đang khóa chương
                            </>
                          ) : isSelected ? (
                            <>
                              <span>Đang xem bài học</span>
                              <CheckCircle2 size={14} />
                            </>
                          ) : (
                            <>
                              <span>Xem bài học</span>
                              <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── Selected Chapter's Lesson Cards ─── */}
              {activeModule && (
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-50/80 border border-slate-200/80 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#2d6a4f] bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Chi tiết bài học
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {activeModuleLessons.length} bài học
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                        {activeModule.title}
                      </h3>
                    </div>

                    {/* Chapter Quiz Trigger Button if eligible */}
                    {canTakeQuizForActive && (
                      <button
                        onClick={() => startQuiz(activeModule, activeModuleLessons)}
                        className="text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl shadow-md transition-all animate-pulse flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <span>Làm bài kiểm tra chương 📝</span>
                      </button>
                    )}
                  </div>

                  {activeModuleLessons.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm font-medium">
                      Chưa có bài học nào trong chương này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeModuleLessons.map((lesson) => {
                        const isLessonCompleted = completedLessonIds.includes(lesson.id);
                        const isLocked = (course.isPremium && !activeModule.isPreview && !isUserPremium);

                        return (
                          <div
                            key={lesson.id}
                            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  {isLocked ? (
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                                      <Lock size={16} />
                                    </div>
                                  ) : isLessonCompleted ? (
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                      <CheckCircle2 size={18} />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2d6a4f] flex items-center justify-center">
                                      <PlayCircle size={18} />
                                    </div>
                                  )}
                                  <span className="text-xs font-bold text-slate-400">
                                    {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} phút` : "5 phút"}
                                  </span>
                                </div>

                                {isLessonCompleted && (
                                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Đã học
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-black text-slate-800 leading-snug line-clamp-2 min-h-[2.75rem]" title={lesson.title}>
                                {lesson.title}
                              </h4>

                              <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                                {lesson.shortDescription || "Bài học ngôn ngữ ký hiệu sinh động, trực quan."}
                              </p>
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-100">
                              {isLocked ? (
                                <button disabled className="w-full h-9 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1">
                                  <Lock size={13} /> Khóa
                                </button>
                              ) : (
                                <Link
                                  to={`/bai-hoc/${lesson.id}`}
                                  className="w-full block"
                                >
                                  <Button
                                    className={cn(
                                      "w-full h-9 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5",
                                      isLessonCompleted
                                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                        : "bg-[#3c6c44] hover:bg-[#325a38] text-white"
                                    )}
                                  >
                                    <span>{isLessonCompleted ? "Học lại" : "Vào học"}</span>
                                    <ArrowRight size={14} />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Ratings & Reviews Section (Wrapped in White Box Container) ─── */}
        <div className="bg-white rounded-[32px] border border-emerald-100/90 shadow-[0_8px_30px_rgba(35,48,57,0.04)] p-6 sm:p-8 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Đánh giá từ học viên</h2>
              <p className="text-sm text-slate-500 mt-1">Ý kiến và đóng góp thực tế từ những người đã trải nghiệm khóa học này.</p>
            </div>
            {user && (
              <button
                onClick={() => {
                  setReviewError(null);
                  setShowReviewModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3b7948] hover:bg-[#336a40] text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                <Plus size={16} /> Viết đánh giá
              </button>
            )}
          </div>

          {/* Shopee-style ratings overview & filter */}
          <div className="bg-[#fffcf7] border border-[#f9f2e3] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 shadow-sm">
            {/* Left: Star Average */}
            <div className="text-center md:text-left shrink-0">
              <div className="text-4xl md:text-5xl font-black text-[#d9aa17] flex items-baseline justify-center md:justify-start gap-1">
                {averageRating > 0 ? averageRating : "0"}
                <span className="text-sm font-semibold text-slate-400">trên 5</span>
              </div>
              <div className="flex justify-center md:justify-start text-[#fed963] gap-1 mt-2.5 mb-1.5">
                {[...Array(5)].map((_, idx) => {
                  const isGold = idx < Math.round(averageRating);
                  return <Star key={idx} size={20} fill={isGold ? "currentColor" : "none"} className={isGold ? "text-[#fed963]" : "text-slate-200"} />;
                })}
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">({courseReviews.length} đánh giá học viên)</p>
            </div>

            {/* Right: Filters */}
            <div className="flex-1 w-full">
              <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl border transition-all",
                    activeFilter === "all"
                      ? "border-[#3c6d44] bg-[#3c6d44] text-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#3c6d44]/35 text-slate-600 hover:text-slate-900"
                  )}
                >
                  Tất Cả ({courseReviews.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const starStr = stars.toString();
                  const count = countByStars[starStr as keyof typeof countByStars] || 0;
                  return (
                    <button
                      key={stars}
                      onClick={() => setActiveFilter(starStr)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-xl border transition-all",
                        activeFilter === starStr
                          ? "border-[#3c6d44] bg-[#3c6d44] text-white shadow-sm"
                          : "border-slate-200 bg-white hover:border-[#3c6d44]/35 text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {stars} Sao ({count})
                    </button>
                  );
                })}
                <button
                  onClick={() => setActiveFilter("comment")}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-xl border transition-all",
                    activeFilter === "comment"
                      ? "border-[#3c6d44] bg-[#3c6d44] text-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#3c6d44]/35 text-slate-600 hover:text-slate-900"
                  )}
                >
                  Có Bình Luận ({countByStars["comment"]})
                </button>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((r: any) => {
                const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userFullName || "User")}&background=3c6c44&color=fff`;
                const avatar = r.userAvatarUrl || defaultAvatar;
                const formattedDate = new Date(r.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <div key={r.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <img
                        src={avatar}
                        alt={r.userFullName || "User Avatar"}
                        className="h-10 w-10 rounded-full object-cover bg-slate-100 flex-shrink-0"
                      />

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h4 className="font-bold text-slate-800 text-[15px] truncate">{r.userFullName || "Học viên ẩn danh"}</h4>
                          <span className="text-xs text-slate-400 font-medium">{formattedDate}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex text-[#fed963] gap-0.5 mb-3">
                          {[...Array(5)].map((_, idx) => {
                            const isGold = idx < r.rating;
                            return <Star key={idx} size={14} fill={isGold ? "currentColor" : "none"} className={isGold ? "text-[#fed963]" : "text-slate-200"} />;
                          })}
                        </div>

                        {/* Comment Content */}
                        <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{r.content}</p>

                        {/* Admin Reply */}
                        {r.adminReply && (
                          <div className="mt-4 p-4 rounded-2xl bg-[#f5faf6] border border-[#e2efe5] text-sm">
                            <p className="font-bold text-[#3c6d44] flex items-center gap-1.5 mb-1">
                              <span className="w-5 h-5 rounded bg-[#3c6d44] text-white flex items-center justify-center text-[10px] font-black">A</span>
                              Phản hồi từ Admin / Giảng viên:
                            </p>
                            <p className="text-slate-600 leading-relaxed">{r.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border border-dashed border-slate-200 rounded-3xl p-10 text-center bg-slate-50/50">
                <p className="text-sm font-medium text-slate-400 italic">Chưa có đánh giá nào khớp với bộ lọc đã chọn.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Modal for submitting reviews */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[32px] max-w-[500px] w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-slate-800 mb-2">Đánh giá khóa học</h3>
              <p className="text-xs text-slate-400 mb-6">Hãy chia sẻ cảm nhận thực tế của bạn để cùng hoàn thiện cộng đồng học tập.</p>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Rating selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Chọn số sao đánh giá</label>
                  <div className="flex gap-2 justify-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setNewRating(stars)}
                        className="p-1 hover:scale-110 transition-transform text-[#fed963] active:scale-95"
                      >
                        <Star size={32} fill={stars <= newRating ? "currentColor" : "none"} className={stars <= newRating ? "text-[#fed963]" : "text-slate-300"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label htmlFor="review-comment" className="block text-sm font-bold text-slate-600 mb-2">Bình luận phản hồi</label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Hãy chia sẻ trải nghiệm học của bạn tại đây..."
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm bg-slate-50 focus:border-[#3c6d44] focus:bg-white outline-none transition-colors"
                  />
                </div>

                {reviewError && (
                  <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {reviewError}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-[#3c6d44] hover:bg-[#315736] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#3c6d44]/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Gửi...
                      </>
                    ) : (
                      "Đăng đánh giá"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quiz Modal */}
        {showQuiz && quizQuestion && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setShowQuiz(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-amber-600 bg-amber-50 border border-amber-100/50 px-4 py-2 rounded-2xl w-fit">
                  <HelpCircle size={18} />
                  <span className="text-[11px] font-black uppercase tracking-wider">Bài test chương: {quizModule?.title}</span>
                </div>
                <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {quizCurrentIndex + 1}/{quizLessons.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-[#3c6d44] rounded-full transition-all duration-500"
                  style={{ width: `${((quizCurrentIndex + (quizResult === 'correct' ? 1 : 0)) / quizLessons.length) * 100}%` }}
                />
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-2">Chọn từ đúng tương ứng với cử chỉ VSL</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Câu {quizCurrentIndex + 1}/{quizLessons.length}: Xem video bên dưới và chọn ý nghĩa chính xác.</p>

              {/* Video preview */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-sm mb-6 border border-slate-100">
                <video
                  src={quizQuestion.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {quizOptions.map((opt) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (quizResult !== "correct") {
                          setSelectedOption(opt);
                          setQuizResult(null);
                        }
                      }}
                      disabled={quizResult === "correct"}
                      className={cn(
                        "p-4 rounded-2xl border text-sm font-bold transition-all text-center flex items-center justify-center min-h-[58px]",
                        isSelected
                          ? "border-[#3c6d44] bg-[#f4fbf6] text-[#3c6d44]"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50/50"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Result display */}
              {quizResult === "next" && (
                <div className="flex items-center gap-2.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 animate-pulse">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span className="text-xs font-bold leading-normal">Chính xác! Đang chuyển sang câu tiếp theo...</span>
                </div>
              )}
              {quizResult === "correct" && (
                <div className="flex flex-col gap-3 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-center items-center justify-center animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={24} className="shrink-0 text-emerald-500" />
                    <span className="text-sm font-black leading-normal">Xuất sắc! Bạn đã trả lời đúng tất cả {quizLessons.length} câu hỏi!</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-2 flex flex-col items-center justify-center gap-0.5 select-none">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Phần thưởng hoàn thành</span>
                    <span className="text-2xl font-black text-amber-600">+50 XP</span>
                  </div>
                </div>
              )}
              {quizResult === "incorrect" && (
                <div className="flex items-center gap-2.5 text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-xs font-bold leading-normal">Chưa đúng rồi! Hãy quan sát kỹ lại video cử chỉ và chọn lại nhé.</span>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex justify-end gap-3 pt-2">
                {quizResult === "correct" ? (
                  <button
                    onClick={handleQuizRewardClaim}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-amber-500/20"
                  >
                    Nhận 50 XP & Tiếp tục
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowQuiz(false)}
                      className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedOption}
                      className="px-6 py-2.5 bg-[#3c6d44] hover:bg-[#315736] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#3c6d44]/20 disabled:opacity-50"
                    >
                      Xác nhận
                    </button>
                  </>
                )}
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

              <h2 className="text-xl font-black text-slate-800 mb-2 relative z-10">Mở khóa chương tiếp theo!</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed relative z-10 px-2">
                Bạn đã hoàn thành bài test chương thành công. Để đạt hiệu quả học tập đột phá, sửa sai tư thế tay trực quan, hãy nâng cấp tài khoản Pro để kích hoạt **hệ thống chấm điểm AI qua Camera** nhé!
              </p>

              <div className="flex flex-col gap-2.5 relative z-10">
                <Link
                  to="/nang-cap"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/10 hover:-translate-y-0.5"
                >
                  Nâng cấp tài khoản Pro
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Để sau, tiếp tục học Free
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
