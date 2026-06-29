import { ArrowRight, Star, Lock } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import { tokenStorage } from "../lib/auth";
import CourseImage from "../components/CourseImage";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import { mockCourses } from "../lib/coursesData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

function CoursesPage() {
  const { coursesPage } = viText;
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Reviews integration
  const [reviews, setReviews] = useState<any[]>([]);
  const [courseCategoryId, setCourseCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [catRes, courseRes, feedbackCatRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/course_categories`, { headers }),
          fetch(`${API_BASE_URL}/api/courses`, { headers }),
          fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
          fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers })
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.items || []);
        }

        let apiCourses: any[] = [];
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          apiCourses = courseData.items?.filter((c: any) =>
            c.status === 1 ||
            c.status === "Published" ||
            c.status === "published" ||
            c.status === "1"
          ) || [];
        }

        // Merge mockCourses and API courses, ensuring we completely filter out mock course 6 and duplicates
        const merged = [
          ...mockCourses.filter(mc => 
            mc.id !== 6 && 
            !apiCourses.some(ac => 
              ac.id === mc.id || 
              ac.title.toLowerCase().trim() === mc.title.toLowerCase().trim()
            )
          ),
          ...apiCourses.map(ac => {
            // Apply level and description override for DB Course ID 6 to match plan
            if (ac.id === 6) {
              return {
                ...ac,
                level: "Cơ bản",
                title: "Giao tiếp chào hỏi",
                summary: "Học cách chào hỏi, cảm ơn và xưng hô giao tiếp ban đầu.",
                description: "Khóa học này giới thiệu các ký hiệu cơ bản nhất để giao tiếp và chào hỏi người khiếm thính."
              };
            }
            return ac;
          })
        ];
        setCourses(merged);

        if (feedbackCatRes.ok) {
          const catData = await feedbackCatRes.json();
          const courseCat = (catData.items || []).find((c: any) => c.name.toLowerCase() === "course");
          if (courseCat) {
            setCourseCategoryId(courseCat.id);
          }
        }

        if (reviewsRes.ok) {
          const revData = await reviewsRes.json();
          setReviews(revData.items || []);
        }

        // Fetch User Enrollments for lock progress calculation
        if (isAuthenticated && user?.id) {
          const enrollRes = await fetch(`${API_BASE_URL}/api/enrollments/user/${user.id}`, { headers });
          if (enrollRes.ok) {
            setEnrollments(await enrollRes.json());
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang khóa học", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  const visibleCourses = useMemo(() => {
    if (activeCategory === "all") {
      return courses;
    }
    return courses.filter((course) => course.categoryId === activeCategory);
  }, [activeCategory, courses]);

  // Phân nhóm Courses theo Level
  const coursesByLevel = useMemo(() => {
    const levels: Record<"Cơ bản" | "Trung cấp" | "Nâng cao", any[]> = {
      "Cơ bản": [],
      "Trung cấp": [],
      "Nâng cao": []
    };
    visibleCourses.forEach(c => {
      const lvl = (c.level || "Cơ bản") as "Cơ bản" | "Trung cấp" | "Nâng cao";
      if (levels[lvl]) {
        levels[lvl].push(c);
      } else {
        levels["Cơ bản"].push(c);
      }
    });
    return levels;
  }, [visibleCourses]);

  // Kiểm tra khóa/mở khóa cấp độ dựa trên tiến độ hoàn thành các khóa học cấp độ trước đó
  const isLevelUnlocked = useMemo(() => {
    // Nếu chưa đăng nhập, chỉ mở khóa Cơ bản, khóa các cấp sau
    if (!isAuthenticated) {
      return {
        "Cơ bản": true,
        "Trung cấp": false,
        "Nâng cao": false
      };
    }

    const getProgress = (courseId: number) => {
      const e = enrollments.find(x => x.courseId === courseId);
      return e ? (e.progressPercent ?? 0) : 0;
    };

    const basicCourses = courses.filter(c => c.level === "Cơ bản");
    const intermediateCourses = courses.filter(c => c.level === "Trung cấp");

    // Nếu không có khóa nào ở cấp độ trước đó, coi như đã hoàn thành
    const allBasicDone = basicCourses.length > 0 && basicCourses.every(c => getProgress(c.id) >= 100);
    const allIntermediateDone = intermediateCourses.length > 0 && intermediateCourses.every(c => getProgress(c.id) >= 100);

    return {
      "Cơ bản": true,
      "Trung cấp": allBasicDone,
      "Nâng cao": allBasicDone && allIntermediateDone
    };
  }, [enrollments, courses, isAuthenticated]);

  const courseRatingMap = useMemo(() => {
    const map: Record<number, { sum: number; count: number }> = {};
    if (courseCategoryId) {
      reviews.forEach((r: any) => {
        if (r.categoryId === courseCategoryId && r.subject && r.subject.startsWith("CourseId:")) {
          const cid = parseInt(r.subject.split(":")[1]);
          if (!isNaN(cid)) {
            if (!map[cid]) {
              map[cid] = { sum: 0, count: 0 };
            }
            map[cid].sum += r.rating;
            map[cid].count += 1;
          }
        }
      });
    }
    const finalMap: Record<number, { avg: number; count: number }> = {};
    Object.keys(map).forEach((key) => {
      const cid = parseInt(key);
      const data = map[cid];
      finalMap[cid] = {
        avg: Math.round((data.sum / data.count) * 10) / 10,
        count: data.count
      };
    });
    return finalMap;
  }, [reviews, courseCategoryId]);

  const renderCourseCard = (course: any, isUnlocked: boolean) => {
    const enrollment = enrollments.find(e => e.courseId === course.id);
    const progress = enrollment ? Math.round(enrollment.progressPercent ?? 0) : 0;

    const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isAuthenticated) {
        e.preventDefault();
        setShowLoginModal(true);
        return;
      }
      if (!isUnlocked) {
        e.preventDefault();
        alert("Bạn cần học tập và hoàn thành 100% các khóa học của cấp độ trước để mở khóa khóa học này!");
        return;
      }
    };

    return (
      <motion.article
        key={course.id}
        variants={fadeInUp}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={isUnlocked ? { y: -6 } : {}}
        className={cn(
          "overflow-hidden rounded-[20px] border border-[#e8efe9] bg-white shadow-[0_4px_20px_rgba(35,48,57,0.04)] flex flex-col h-full hover:shadow-[0_8px_30px_rgba(60,108,68,0.08)] transition-all duration-300 relative",
          !isUnlocked && "opacity-60"
        )}
      >
        {/* Compact image area */}
        <div className="relative h-[130px] overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
          <CourseImage
            title={course.title}
            coverMediaId={course.coverMediaId}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
          
          {course.isPremium && (
            <span className="absolute left-3 top-3 rounded-full bg-[#ebca4f] px-2.5 py-0.5 text-[10px] font-bold text-[#394041]">
              Pro
            </span>
          )}

          {!isUnlocked ? (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center text-white">
              <div className="flex flex-col items-center gap-1.5 bg-black/60 px-4 py-2.5 rounded-2xl border border-white/10 select-none">
                <Lock size={16} className="text-amber-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-100">Đang khóa</span>
              </div>
            </div>
          ) : (
            progress > 0 && (
              <span className="absolute right-3 top-3 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-bold">
                Đã học: {progress}%
              </span>
            )
          )}
        </div>

        {/* Compact content area */}
        <div className="px-4 pb-4 pt-3 flex flex-col flex-1">
          {/* Level badge + Star Rating */}
          <div className="flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-[0.03em] h-5">
            <span className="rounded-full bg-[#eef4ef] px-2.5 py-0.5 text-[#5f776b]">
              {course.level || "Cơ bản"}
            </span>
            {courseRatingMap[course.id] && (
              <span className="flex items-center gap-1 text-[#d9aa17] bg-[#fffbf2] px-2.5 py-0.5 rounded-full border border-[#f7ecd3]">
                <Star size={11} fill="currentColor" /> {courseRatingMap[course.id].avg} ({courseRatingMap[course.id].count})
              </span>
            )}
          </div>

          {/* Compact title */}
          <h2 className="mt-1.5 text-[1.05rem] font-bold leading-snug text-[#1f2e39] line-clamp-2 min-h-[2.8rem]">
            {course.title}
          </h2>

          {/* Compact description */}
          <p className="mt-1 text-xs text-[#74818a] line-clamp-2 min-h-[2.2rem]">
            {course.description || course.summary || "Chưa có mô tả"}
          </p>

          <Link 
            to={`/khoa-hoc/${course.id}`} 
            className="w-full mt-4" 
            onClick={handleCardClick}
          >
            <Button 
              className={cn(
                "h-9 w-full justify-center text-xs font-semibold shadow-sm transition-colors rounded-lg",
                isUnlocked 
                  ? "bg-[#3c6c44] text-white hover:bg-[#325a38]" 
                  : "bg-slate-100 text-slate-400 hover:bg-slate-100 border border-slate-200 cursor-not-allowed"
              )}
            >
              {isUnlocked ? "Vào học" : "Chưa mở khóa"}
              {isUnlocked && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
            </Button>
          </Link>
        </div>
      </motion.article>
    );
  };

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="py-8 md:py-10 bg-transparent"
    >
      <div className="container">
        <motion.header
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mt-4"
        >
          <h1 className="text-[clamp(1.9rem,3vw,2.6rem)] font-bold leading-[1.12] text-[#1e2834]">
            {coursesPage.hero.title}
          </h1>
          <p className="mt-3 max-w-[720px] text-[#7b878f]">
            {coursesPage.hero.description}
          </p>
        </motion.header>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-6 flex flex-wrap gap-2.5 border-b border-slate-100 pb-5"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
              activeCategory === "all"
                ? "border-[#347544] bg-[#347544] text-white"
                : "border-[#dbe4dd] bg-white text-[#5f6b73] hover:border-[#bfcfc3]",
            )}
          >
            Tất cả
          </button>
          {categories.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-[#347544] bg-[#347544] text-white"
                    : "border-[#dbe4dd] bg-white text-[#5f6b73] hover:border-[#bfcfc3]",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </motion.div>

        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-500 font-bold text-sm">Đang tải dữ liệu khóa học...</div>
        ) : (
          <div className="mt-12 space-y-16">
            {/* Section 1: Cơ bản */}
            {coursesByLevel["Cơ bản"].length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Cấp độ 1: Cơ bản</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Khởi đầu hành trình học ngôn ngữ ký hiệu với các từ vựng chào hỏi, số đếm và chữ cái.</p>
                  </div>
                  <span className="bg-emerald-50 text-[#2d6a4f] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100/50">Mở khóa</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {coursesByLevel["Cơ bản"].map(course => renderCourseCard(course, true))}
                </div>
              </div>
            )}

            {/* Section 2: Trung cấp */}
            {coursesByLevel["Trung cấp"].length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Cấp độ 2: Trung cấp</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Mở rộng giao tiếp với chủ đề hành chính, địa lý Việt Nam, mô tả thói quen và cảm xúc.</p>
                  </div>
                  {isLevelUnlocked["Trung cấp"] ? (
                    <span className="bg-emerald-50 text-[#2d6a4f] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100/50">Mở khóa</span>
                  ) : (
                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200/50 flex items-center gap-1"><Lock size={12} /> Đang khóa</span>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {coursesByLevel["Trung cấp"].map(course => renderCourseCard(course, isLevelUnlocked["Trung cấp"]))}
                </div>
              </div>
            )}

            {/* Section 3: Nâng cao */}
            {coursesByLevel["Nâng cao"].length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Cấp độ 3: Nâng cao</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Chinh phục từ vựng lễ hội, sự kiện xã hội, kinh tế thương mại chuyên sâu.</p>
                  </div>
                  {isLevelUnlocked["Nâng cao"] ? (
                    <span className="bg-emerald-50 text-[#2d6a4f] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100/50">Mở khóa</span>
                  ) : (
                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200/50 flex items-center gap-1"><Lock size={12} /> Đang khóa</span>
                  )}
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {coursesByLevel["Nâng cao"].map(course => renderCourseCard(course, isLevelUnlocked["Nâng cao"]))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && visibleCourses.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-7 rounded-2xl border border-dashed border-[#d8e1db] bg-white px-4 py-5 text-center text-[#7a878f]"
          >
            {coursesPage.labels.empty}
          </motion.p>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để xem chi tiết bài học và tham gia khóa học."
      />
    </motion.section>
  );
}

export default CoursesPage;
