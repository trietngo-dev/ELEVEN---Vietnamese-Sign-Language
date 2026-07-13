import { ArrowRight, Star, Lock, Unlock } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Use TanStack Query to fetch and cache all page data
  const { data: coursesPageData, isLoading } = useQuery({
    queryKey: ["coursesPageData", user?.id],
    queryFn: async () => {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      const [catRes, courseRes, feedbackCatRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/course_categories`, { headers }),
        fetch(`${API_BASE_URL}/api/courses`, { headers }),
        fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
        fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers })
      ]);

      let categoriesList: any[] = [];
      if (catRes.ok) {
        const catData = await catRes.json();
        categoriesList = catData.items || [];
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

      const mergedCourses = [
        ...mockCourses.filter(mc =>
          mc.id !== 6 &&
          !apiCourses.some(ac =>
            ac.id === mc.id ||
            ac.title.toLowerCase().trim() === mc.title.toLowerCase().trim()
          )
        ),
        ...apiCourses.map(ac => {
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

      let feedbackCatId: number | null = null;
      if (feedbackCatRes.ok) {
        const catData = await feedbackCatRes.json();
        const courseCat = (catData.items || []).find((c: any) => c.name.toLowerCase() === "course");
        if (courseCat) {
          feedbackCatId = courseCat.id;
        }
      }

      let reviewsList: any[] = [];
      if (reviewsRes.ok) {
        const revData = await reviewsRes.json();
        reviewsList = revData.items || [];
      }

      let enrollmentsList: any[] = [];
      if (isAuthenticated && user?.id) {
        const enrollRes = await fetch(`${API_BASE_URL}/api/enrollments/user/${user.id}`, { headers });
        if (enrollRes.ok) {
          enrollmentsList = await enrollRes.json();
        }
      }

      return {
        categories: categoriesList,
        courses: mergedCourses,
        courseCategoryId: feedbackCatId,
        reviews: reviewsList,
        enrollments: enrollmentsList
      };
    }
  });

  const categories = coursesPageData?.categories || [];
  const courses = coursesPageData?.courses || [];
  const enrollments = coursesPageData?.enrollments || [];
  const reviews = coursesPageData?.reviews || [];
  const courseCategoryId = coursesPageData?.courseCategoryId || null;

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
          "overflow-hidden rounded-[20px] border border-[#e8efe9] bg-white shadow-[0_4px_20px_rgba(35,48,57,0.04)] flex flex-col h-full hover:shadow-[0_8px_30px_rgba(60,108,68,0.08)] transition-all duration-300 relative w-full sm:w-[330px]",
          !isUnlocked && "opacity-60"
        )}
      >
        {/* Compact image area */}
        <div className="relative h-[160px] overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
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
              <span className="absolute right-3 top-3 rounded-full bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
                Đã học: {progress}%
              </span>
            )
          )}
        </div>

        {/* Compact content area */}
        <div className="px-5 pb-5 pt-4 flex flex-col flex-1 items-center text-center">
          {/* Level badge + Star Rating */}
          <div className="flex items-center justify-center gap-2.5 text-[0.68rem] font-bold uppercase tracking-[0.03em] mb-2">
            <span className="rounded-full bg-[#f4fbf6] px-3.5 py-1 text-[#2d6a4f] border border-emerald-100/50 text-[11px] font-black uppercase tracking-wide">
              {course.level || "Cơ bản"}
            </span>
            {courseRatingMap[course.id] && (
              <span className="flex items-center gap-1 text-[#d97706] bg-[#fffbeb] px-3 py-1 rounded-full border border-[#fef3c7] font-extrabold text-[11px]">
                <Star size={12} fill="currentColor" className="text-[#fbbf24] fill-[#fbbf24]" /> {courseRatingMap[course.id].avg} ({courseRatingMap[course.id].count})
              </span>
            )}
          </div>

          {/* Compact title */}
          <h2 className="mt-1 text-[1.25rem] font-black leading-snug text-slate-800 line-clamp-2 min-h-[3.28rem] hover:text-[#2d6a4f] transition-colors flex items-center justify-center">
            {course.title}
          </h2>

          {/* Compact description */}
          <p className="mt-2 text-sm text-[#74818a] line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {course.description || course.summary || "Chưa có mô tả"}
          </p>

          <Link
            to={`/khoa-hoc/${course.id}`}
            className="w-full mt-5"
            onClick={handleCardClick}
          >
            <Button
              className={cn(
                "h-11 w-full justify-center text-sm font-black shadow-sm transition-colors rounded-xl flex items-center gap-1",
                isUnlocked
                  ? "bg-[#3c6c44] text-white hover:bg-[#325a38]"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-100 border border-slate-200 cursor-not-allowed"
              )}
            >
              {isUnlocked ? "Vào học" : "Chưa mở khóa"}
              {isUnlocked && <ArrowRight className="h-4 w-4" />}
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
          className="mt-6 text-center"
        >
          <h1 className="text-[clamp(2.3rem,4.5vw,3.2rem)] font-black leading-tight text-slate-800 tracking-tight">
            {coursesPage.hero.title}
          </h1>
        </motion.header>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-8 flex flex-wrap justify-center gap-3 border-b border-slate-100 pb-6"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-bold transition-colors",
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
                  "rounded-full border px-6 py-2.5 text-sm font-bold transition-colors",
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
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Cấp độ 1: <span className="text-[#2d6a4f]">Cơ bản</span>
                  </h2>
                  <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                    <Unlock size={12} />
                    Đã mở khóa
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {coursesByLevel["Cơ bản"].map(course => renderCourseCard(course, true))}
                </div>
              </div>
            )}

            {/* Section 2: Trung cấp */}
            {coursesByLevel["Trung cấp"].length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Cấp độ 2: <span className="text-[#2d6a4f]">Trung cấp</span>
                  </h2>
                  {isLevelUnlocked["Trung cấp"] ? (
                    <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Unlock size={12} />
                      Đã mở khóa
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-1.5"><Lock size={12} /> Đang khóa</span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                  {coursesByLevel["Trung cấp"].map(course => renderCourseCard(course, isLevelUnlocked["Trung cấp"]))}
                </div>
              </div>
            )}

            {/* Section 3: Nâng cao */}
            {coursesByLevel["Nâng cao"].length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                    Cấp độ 3: <span className="text-[#2d6a4f]">Nâng cao</span>
                  </h2>
                  {isLevelUnlocked["Nâng cao"] ? (
                    <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Unlock size={12} />
                      Đã mở khóa
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-1.5"><Lock size={12} /> Đang khóa</span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center gap-6">
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
