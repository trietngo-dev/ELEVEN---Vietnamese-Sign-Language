import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, PlayCircle, Lock, Crown, Star, Loader2, Plus } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import CourseImage from "../components/CourseImage";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

        if (courseRes.ok) {
          setCourse(await courseRes.json());
        }
        if (modulesRes.ok) {
          const modData = await modulesRes.json();
          const courseModules = (modData.items || []).filter((m: any) => m.courseId.toString() === id);
          setModules(courseModules.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        }
        if (lessonsRes.ok) {
          const lesData = await lessonsRes.json();
          const courseLessons = (lesData.items || []).filter((l: any) => l.courseId.toString() === id);
          setLessons(courseLessons.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        }
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-800">Đang tải dữ liệu...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-800">Không tìm thấy khóa học.</div>;
  }

  const progressPercentage = lessons.length > 0 ? Math.round((completedLessonsCount / lessons.length) * 100) : 0;
  const isPremiumCourse = course?.isPremium ?? false;
  const canStartLearning = !isPremiumCourse || isUserPremium;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Top Bar: Back Button + Premium Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#3b7948] text-white font-bold text-sm hover:bg-[#336a40] transition-all active:scale-95 shadow-md">
            <ArrowLeft size={18} /> Quay lại
          </button>

          {isPremiumCourse && !canStartLearning && (
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#fcf8ea] border border-[#efe7cf] md:justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6ebb7] text-[#b7861f]" aria-hidden="true">
                  <Crown className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[0.95rem] font-bold text-[#3a403f]">Đây là khóa học dành cho tài khoản Cao cấp</p>
                  <p className="text-sm text-[#86908c]">Nâng cấp tài khoản để truy cập toàn bộ nội dung khóa học này.</p>
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
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">{course.title}</h1>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px]">
              {course.description || course.summary || "Chưa có mô tả."}
            </p>
          </div>

          {/* Right: Progress Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 h-fit">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
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
                  <Lock size={16} /> Yêu cầu tài khoản Cao cấp
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
            <h2 className="text-2xl font-extrabold text-[#1f2937]">Nội dung khóa học</h2>
            <span className="text-sm font-medium text-slate-500">{modules.length} Học phần • {lessons.length} Bài giảng</span>
          </div>

          <div className="space-y-12">
            {modules.map((module, mIdx) => {
              const moduleLessons = lessons.filter(l => l.moduleId === module.id);
              const isLocked = course.isPremium && !module.isPreview;

              return (
                <div key={module.id}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${isLocked ? "bg-slate-100 text-slate-500" : "bg-[#f4fbf6] text-[#3c6d44]"}`}>{mIdx + 1}</span>
                      {module.title}
                    </h3>
                    {isLocked && (
                      <Link to="/nang-cap" className="text-[10px] font-bold uppercase tracking-widest bg-[#eef7ee] text-[#3c6d44] px-3 py-1 rounded-full flex items-center gap-1 border border-[#d4e4d8]">
                        <Lock size={10} /> Nâng cấp tài khoản
                      </Link>
                    )}
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col divide-y divide-slate-50">
                    {moduleLessons.length > 0 ? moduleLessons.map((lesson) => (
                      <div key={lesson.id} className={`p-5 flex items-center justify-between ${isLocked ? "opacity-50" : "hover:bg-slate-50/50 transition-colors"}`}>
                        <div className="flex items-center gap-4">
                          {isLocked ? (
                            <Lock size={20} className="text-slate-400 flex-shrink-0 ml-1" />
                          ) : (
                            <PlayCircle size={24} className="text-[#d9aa17] flex-shrink-0" />
                          )}
                          <div>
                            <h4 className={`font-bold text-[15px] ${isLocked ? "text-slate-500" : "text-slate-800"}`}>{lesson.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} phút` : "0 phút"} • {isLocked ? "Đang khóa" : "Sẵn sàng"}
                            </p>
                          </div>
                        </div>
                        {isLocked ? (
                          <Lock size={16} className="text-slate-300 mr-2" />
                        ) : (
                          <Link to={`/bai-hoc/${lesson.id}`} className="px-6 py-2 rounded-xl bg-[#3c6d44] text-white text-[13px] font-bold hover:bg-[#315736] shadow-sm">
                            Học
                          </Link>
                        )}
                      </div>
                    )) : (
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
              <h2 className="text-2xl font-extrabold text-[#1f2937]">Đánh giá từ học viên</h2>
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
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Đánh giá khóa học</h3>
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

      </div>
    </div>
  );
}
