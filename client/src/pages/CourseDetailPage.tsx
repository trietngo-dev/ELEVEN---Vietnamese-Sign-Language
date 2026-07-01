import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, PlayCircle, Lock, Crown, Star, Loader2, Plus, CheckCircle2, AlertCircle, X, HelpCircle } from "lucide-react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
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
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);
  const [completedQuizModuleIds, setCompletedQuizModuleIds] = useState<number[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
          fetch(`${API_BASE_URL}/api/course_modules`, { headers }),
          fetch(`${API_BASE_URL}/api/lessons`, { headers }),
          fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
          fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers })
        ]);

        let currentCourse = null;
        let currentModules: any[] = [];
        let currentLessons: any[] = [];

        if (courseRes.ok) {
          currentCourse = await courseRes.json();
        }

        // Check if the current course is from static mock data
        const isMockCourse = ["101", "102", "103", "104", "105"].includes(id || "") || id === "6";

        if (isMockCourse) {
          const mockC = mockCourses.find(c => c.id.toString() === id);
          if (mockC) {
            currentCourse = {
              ...currentCourse,
              ...mockC
            };
          }
          currentModules = mockModules.filter(m => m.courseId.toString() === id);
          currentLessons = mockLessons.filter(l => l.courseId.toString() === id);
        } else {
          if (modulesRes.ok) {
            const modData = await modulesRes.json();
            const items = modData.items || (Array.isArray(modData) ? modData : modData.items) || [];
            currentModules = items.filter((m: any) => m.courseId.toString() === id);
          }
          if (lessonsRes.ok) {
            const lesData = await lessonsRes.json();
            const items = lesData.items || (Array.isArray(lesData) ? lesData : lesData.items) || [];
            currentLessons = items.filter((l: any) => l.courseId.toString() === id);
          }
        }

        setCourse(currentCourse);
        setModules(currentModules.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        setLessons(currentLessons.sort((a: any, b: any) => a.sortOrder - b.sortOrder));

        if (catRes.ok) {
          const catData = await catRes.json();
          const courseCat = (catData.items || []).find((c: any) => c.name.toLowerCase() === "course");
          if (courseCat) {
            setCourseCategoryId(courseCat.id);
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

      const res = await fetch(`${API_BASE_URL}/api/feedbacks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user.id,
          categoryId: courseCategoryId,
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
    const incorrect = mockLessons
      .filter(l => l.title !== correctTitle)
      .map(l => l.title);
    const uniqueIncorrect = Array.from(new Set(incorrect));
    const shuffled = uniqueIncorrect.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctTitle, ...shuffled];
    return options.sort(() => 0.5 - Math.random());
  };

  const startQuiz = (module: any, moduleLessons: any[]) => {
    if (moduleLessons.length === 0) return;
    const randomLesson = moduleLessons[Math.floor(Math.random() * moduleLessons.length)];
    setQuizModule(module);
    setQuizQuestion(randomLesson);
    const options = generateQuizOptions(randomLesson.title);
    setQuizOptions(options);
    setSelectedOption(null);
    setQuizResult(null);
    setShowQuiz(true);
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || !quizQuestion) return;
    if (selectedOption === quizQuestion.title) {
      setQuizResult("correct");
      localStorage.setItem(`quiz_completed_module_${quizModule.id}`, "true");
      setCompletedQuizModuleIds(prev => [...prev, quizModule.id]);
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
    <div className="min-h-screen bg-white text-slate-800">
      <div className="container mx-auto px-4 md:px-6 py-10">

        {/* Top Bar: Back Button + Premium Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors font-bold text-sm">
            <ArrowLeft size={16} /> Quay lại
          </button>

          {isPremiumCourse && !canStartLearning && (
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#fcf8ea] border border-[#efe7cf] md:justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6ebb7] text-[#b7861f]" aria-hidden="true">
                  <Crown className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[0.95rem] font-bold text-[#3a403f]">Đây là khóa học dành cho tài khoản Pro</p>
                  <p className="text-sm text-[#86908c]">Nâng cấp tài khoản Pro để truy cập toàn bộ nội dung khóa học này.</p>
                </div>
              </div>
              <Link to="/nang-cap" className="flex-shrink-0 h-9 px-5 rounded-lg bg-[#efca4c] text-[0.8rem] font-bold text-[#4b3c14] hover:bg-[#e7c13f] transition-colors inline-flex items-center">
                Nâng cấp ngay
              </Link>
            </div>
          )}
        </div>

        {/* Hero & Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-10 mb-16">
          {/* Left: Course Info */}
          <div>
            <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden mb-6 shadow-md bg-slate-100">
              <CourseImage
                title={course.title}
                coverMediaId={course.coverMediaId}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3.5 mb-2.5">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md rounded-full uppercase tracking-widest">
                    {course.level || "Cơ bản"}
                  </span>
                  {averageRating > 0 && (
                    <span className="flex items-center gap-1.5 text-[#fed963] font-black text-xs bg-black/40 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                      <Star size={12} fill="currentColor" /> {averageRating} / 5 ({courseReviews.length} đánh giá)
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white">{course.title}</h1>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px]">
              {course.description || course.summary || "Chưa có mô tả."}
            </p>
          </div>

          {/* Right: Progress Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 h-fit">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-lg bg-[#eef7ee] flex items-center justify-center text-[#3c6d44]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></span>
              Thông tin khóa học
            </h3>

            <div className="mb-8 block">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hoàn thành ({completedLessonsCount}/{lessons.length})</span>
                <span className="text-2xl font-black text-slate-800">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#fed963] rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bài học</p>
                <p className="text-[15px] font-bold text-slate-800">{lessons.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                <p className="text-[15px] font-bold text-slate-800">{formatHours(totalTimeMinutes)}</p>
              </div>
            </div>

            {nextLessonId ? (
              canStartLearning ? (
                <Link to={`/bai-hoc/${nextLessonId}`} className="w-full py-3.5 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center gap-2 font-bold hover:bg-[#315736] transition-all shadow-lg shadow-[#3c6d44]/20 hover:-translate-y-0.5">
                  <PlayCircle size={18} /> {completedLessonsCount > 0 ? "Học tiếp" : "Bắt đầu học"}
                </Link>
              ) : (
                <button disabled className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center gap-2 font-bold cursor-not-allowed">
                  <Lock size={16} /> Yêu cầu tài khoản Pro
                </button>
              )
            ) : (
              <button disabled className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center gap-2 font-bold cursor-not-allowed">
                Chưa có bài học
              </button>
            )}
          </div>
        </div>

        {/* Curriculum Section */}
        <div>
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-800">Nội dung khóa học</h2>
            <span className="text-sm font-medium text-slate-500">{modules.length} Học phần • {lessons.length} Bài giảng</span>
          </div>

          <div className="space-y-12">
            {modules.map((module, mIdx) => {
              const moduleLessons = lessons.filter(l => l.moduleId === module.id);

              // Progression & premium lock check
              const isPremiumLocked = course.isPremium && !module.isPreview && !isUserPremium;
              const isFreeProgressLocked = !isUserPremium && mIdx > 0 && !completedQuizModuleIds.includes(modules[mIdx - 1].id);
              const isLocked = isPremiumLocked || isFreeProgressLocked;

              const isModuleLessonsCompleted = moduleLessons.length > 0 && moduleLessons.every(l => completedLessonIds.includes(l.id));
              const canTakeQuiz = !isUserPremium && isModuleLessonsCompleted && !completedQuizModuleIds.includes(module.id);

              return (
                <div key={module.id} className={cn(isLocked && "opacity-75 select-none")}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${isLocked ? "bg-slate-100 text-slate-400" : "bg-[#f4fbf6] text-[#3c6d44]"}`}>{mIdx + 1}</span>
                      <h3 className="text-lg font-black text-slate-800">{module.title}</h3>
                      {completedQuizModuleIds.includes(module.id) && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 border border-emerald-100">
                          ✓ Đã kiểm tra
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPremiumLocked && (
                        <Link to="/nang-cap" className="text-[10px] font-bold uppercase tracking-widest bg-[#efe7cf] text-[#71540a] px-3 py-1 rounded-full flex items-center gap-1 border border-[#efe7cf]/50">
                          <Crown size={10} /> Yêu cầu Pro
                        </Link>
                      )}
                      {isFreeProgressLocked && !isPremiumLocked && (
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">
                          <Lock size={10} /> Đang khóa học phần
                        </span>
                      )}
                      {canTakeQuiz && (
                        <button
                          onClick={() => startQuiz(module, moduleLessons)}
                          className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-full shadow-md transition-all animate-pulse"
                        >
                          Làm test chương 📝
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col divide-y divide-slate-50">
                    {moduleLessons.length > 0 ? moduleLessons.map((lesson) => {
                      const isLessonCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <div key={lesson.id} className={cn("p-5 flex items-center justify-between transition-colors", isLocked ? "bg-slate-50/20" : "hover:bg-slate-50/50")}>
                          <div className="flex items-center gap-4">
                            {isLocked ? (
                              <Lock size={20} className="text-slate-300 flex-shrink-0 ml-1" />
                            ) : isLessonCompleted ? (
                              <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <PlayCircle size={24} className="text-[#d9aa17] flex-shrink-0" />
                            )}
                            <div>
                              <h4 className={`font-bold text-[15px] ${isLocked ? "text-slate-400" : "text-slate-800"}`}>
                                {lesson.title}
                                {isLessonCompleted && (
                                  <span className="ml-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md">Đã học</span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1">
                                {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} phút` : "0 phút"} • {isLocked ? "Đang khóa" : isLessonCompleted ? "Đã học" : "Sẵn sàng"}
                              </p>
                            </div>
                          </div>
                          {isLocked ? (
                            <Lock size={16} className="text-slate-300 mr-2" />
                          ) : (
                            <Link
                              to={`/bai-hoc/${lesson.id}`}
                              className={cn(
                                "px-5 py-2 rounded-xl text-[13px] font-bold shadow-sm transition-all min-w-[90px] text-center",
                                isLessonCompleted
                                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                                  : "bg-[#3c6d44] text-white hover:bg-[#315736]"
                              )}
                            >
                              {isLessonCompleted ? "Học lại" : "Học"}
                            </Link>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="p-5 text-sm text-slate-500 italic text-center">Chưa có bài học nào trong học phần này.</div>
                    )}
                  </div>
                </div>
              );
            })}

            {modules.length === 0 && (
              <div className="border border-dashed border-slate-200 rounded-3xl p-8 flex items-center justify-center text-center bg-slate-50/50">
                <p className="text-sm font-medium text-slate-400">Khóa học này đang được cập nhật nội dung</p>
              </div>
            )}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="mt-16 border-t border-slate-100 pt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Đánh giá từ học viên</h2>
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

              <div className="flex items-center gap-2.5 text-amber-600 mb-4 bg-amber-50 border border-amber-100/50 px-4 py-2 rounded-2xl w-fit">
                <HelpCircle size={18} />
                <span className="text-[11px] font-black uppercase tracking-wider">Bài test chương: {quizModule?.title}</span>
              </div>

              <h3 className="text-lg font-black text-slate-800 mb-2">Chọn từ đúng tương ứng với cử chỉ VSL</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">Xem video hướng dẫn bên dưới và chọn ý nghĩa chính xác của cử chỉ ngôn ngữ ký hiệu này.</p>

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
              {quizResult === "correct" && (
                <div className="flex flex-col gap-3 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-center items-center justify-center animate-pulse-slow">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={24} className="shrink-0 text-emerald-500" />
                    <span className="text-sm font-black leading-normal">Chính xác! Bạn đã vượt qua bài test chương!</span>
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
