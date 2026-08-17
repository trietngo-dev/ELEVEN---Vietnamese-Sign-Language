import { Lock, Unlock, BookOpen, Sparkles, Award, ArrowRight, Layers, CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import LevelCoursesModal from "../components/LevelCoursesModal";
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
      staggerChildren: 0.1,
    },
  },
};

type LevelType = "Cơ bản" | "Trung cấp" | "Nâng cao";

interface LevelConfig {
  name: LevelType;
  levelNumber: number;
  subtitle: string;
  description: string;
  icon: typeof BookOpen;
  colorScheme: {
    cardBorder: string;
    cardHoverBorder: string;
    accentBg: string;
    accentText: string;
    badgeBg: string;
    iconBg: string;
    iconCol: string;
    btnBg: string;
    btnHover: string;
    progressBg: string;
  };
}

const levelConfigs: LevelConfig[] = [
  {
    name: "Cơ bản",
    levelNumber: 1,
    subtitle: "Dành cho người mới bắt đầu",
    description: "Làm quen với bảng chữ cái, số đếm, các ký hiệu chào hỏi và giao tiếp cơ bản hằng ngày.",
    icon: BookOpen,
    colorScheme: {
      cardBorder: "border-emerald-200/90",
      cardHoverBorder: "hover:border-emerald-400",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-800",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200",
      iconCol: "text-white",
      btnBg: "bg-[#2d6a4f] hover:bg-[#22543d]",
      btnHover: "hover:shadow-emerald-900/20",
      progressBg: "bg-emerald-600",
    },
  },
  {
    name: "Trung cấp",
    levelNumber: 2,
    subtitle: "Mở rộng giao tiếp & ngữ cảnh",
    description: "Trau dồi từ vựng địa lý, hành chính, diễn đạt cảm xúc, thói quen sinh hoạt và hội thoại thực tế.",
    icon: Sparkles,
    colorScheme: {
      cardBorder: "border-amber-200/90",
      cardHoverBorder: "hover:border-amber-400",
      accentBg: "bg-amber-50",
      accentText: "text-amber-900",
      badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200",
      iconCol: "text-white",
      btnBg: "bg-[#d97706] hover:bg-[#b45309]",
      btnHover: "hover:shadow-amber-900/20",
      progressBg: "bg-amber-600",
    },
  },
  {
    name: "Nâng cao",
    levelNumber: 3,
    subtitle: "Chuyên sâu & Thành thạo",
    description: "Lĩnh hội các chủ đề lễ hội văn hóa, kinh tế thương mại, cấu trúc câu phức và dịch thuật lưu loát.",
    icon: Award,
    colorScheme: {
      cardBorder: "border-indigo-200/90",
      cardHoverBorder: "hover:border-indigo-400",
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-900",
      badgeBg: "bg-indigo-100 text-indigo-900 border-indigo-300",
      iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200",
      iconCol: "text-white",
      btnBg: "bg-[#4338ca] hover:bg-[#3730a3]",
      btnHover: "hover:shadow-indigo-900/20",
      progressBg: "bg-indigo-600",
    },
  },
];

function CoursesPage() {
  const { coursesPage } = viText;
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelType | null>(null);

  // Use TanStack Query to fetch and cache all page data
  const { data: coursesPageData, isLoading } = useQuery({
    queryKey: ["coursesPageData", user?.id],
    queryFn: async () => {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      const [courseRes, feedbackCatRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/courses?pageSize=500`, { headers }),
        fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
        fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers }),
      ]);

      let apiCourses: any[] = [];
      if (courseRes.ok) {
        const courseData = await courseRes.json();
        apiCourses =
          courseData.items?.filter(
            (c: any) =>
              c.status === 1 ||
              c.status === "Published" ||
              c.status === "published" ||
              c.status === "1"
          ) || [];
      }

      // Use real API courses from database; only fallback to mockCourses if database is completely empty
      const finalCourses = apiCourses.length > 0 ? apiCourses : mockCourses;

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
        courses: finalCourses,
        courseCategoryId: feedbackCatId,
        reviews: reviewsList,
        enrollments: enrollmentsList,
      };
    },
  });

  const courses = coursesPageData?.courses || [];
  const enrollments = coursesPageData?.enrollments || [];
  const reviews = coursesPageData?.reviews || [];
  const courseCategoryId = coursesPageData?.courseCategoryId || null;
  const visibleCourses = courses;

  // Phân nhóm Courses theo Level
  const coursesByLevel = useMemo(() => {
    const levels: Record<LevelType, any[]> = {
      "Cơ bản": [],
      "Trung cấp": [],
      "Nâng cao": [],
    };
    visibleCourses.forEach((c) => {
      const lvl = (c.level || "Cơ bản") as LevelType;
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
    // Nếu chưa đăng nhập, chỉ mở khóa Cơ bản
    if (!isAuthenticated) {
      return {
        "Cơ bản": true,
        "Trung cấp": false,
        "Nâng cao": false,
      };
    }

    const getProgress = (courseId: number) => {
      const e = enrollments.find((x: any) => x.courseId === courseId);
      return e ? e.progressPercent ?? 0 : 0;
    };

    const basicCourses = courses.filter((c: any) => c.level === "Cơ bản");
    const intermediateCourses = courses.filter((c: any) => c.level === "Trung cấp");

    const allBasicDone = basicCourses.length > 0 && basicCourses.every((c: any) => getProgress(c.id) >= 100);
    const allIntermediateDone = intermediateCourses.length > 0 && intermediateCourses.every((c: any) => getProgress(c.id) >= 100);

    return {
      "Cơ bản": true,
      "Trung cấp": allBasicDone,
      "Nâng cao": allBasicDone && allIntermediateDone,
    };
  }, [enrollments, courses, isAuthenticated]);

  // Tính % tiến độ trung bình của từng cấp độ
  const levelProgress = useMemo(() => {
    const calcProg = (level: LevelType) => {
      const lvlCourses = courses.filter((c: any) => (c.level || "Cơ bản") === level);
      if (lvlCourses.length === 0) return 0;
      let sum = 0;
      lvlCourses.forEach((c: any) => {
        const e = enrollments.find((x: any) => x.courseId === c.id);
        sum += e ? e.progressPercent ?? 0 : 0;
      });
      return Math.round(sum / lvlCourses.length);
    };

    return {
      "Cơ bản": calcProg("Cơ bản"),
      "Trung cấp": calcProg("Trung cấp"),
      "Nâng cao": calcProg("Nâng cao"),
    };
  }, [courses, enrollments]);

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
        count: data.count,
      };
    });
    return finalMap;
  }, [reviews, courseCategoryId]);

  const handleLevelCardClick = (level: LevelType) => {
    if (!isAuthenticated && level !== "Cơ bản") {
      setShowLoginModal(true);
      return;
    }
    if (!isLevelUnlocked[level]) {
      alert("Bạn cần hoàn thành 100% các khóa học của cấp độ trước để mở khóa cấp độ này!");
      return;
    }
    setSelectedLevel(level);
  };

  const selectedConfig = levelConfigs.find((c) => c.name === selectedLevel);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="py-10 md:py-14"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section 1: Hero Banner Card (White Box) */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl border border-emerald-100/90 bg-white p-8 md:p-12 shadow-[0_8px_30px_rgba(35,48,57,0.04)] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider mb-4">
              <Sparkles size={16} className="text-emerald-600" />
              Lộ trình học trực quan
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
              {coursesPage.hero.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Khám phá các cấp độ học ngôn ngữ ký hiệu Việt Nam từ nhập môn đến nâng cao. Chọn một cấp độ để xem toàn bộ danh sách khóa học tương ứng.
            </p>
          </div>
        </motion.div>

        {/* Section 2: Level Cards Container (Wrapped in White Card) */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          className="rounded-3xl border border-emerald-100/90 bg-white p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgba(35,48,57,0.04)] space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <BookOpen size={22} />
                </span>
                Các cấp độ học tập
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1 font-medium">
                Bấm vào từng thẻ cấp độ để xem danh sách các khóa học chi tiết.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full self-start sm:self-auto border border-slate-200">
              Tổng cộng {visibleCourses.length} khóa học
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-4" />
              <p className="text-slate-600 font-bold text-base">Đang tải dữ liệu các cấp độ...</p>
            </div>
          ) : (
            /* 3 Level Cards in a Row */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {levelConfigs.map((cfg) => {
                const isUnlocked = isLevelUnlocked[cfg.name];
                const levelCoursesList = coursesByLevel[cfg.name] || [];
                const courseCount = levelCoursesList.length;
                const progress = levelProgress[cfg.name] || 0;
                const IconComponent = cfg.icon;

                return (
                  <motion.div
                    key={cfg.name}
                    whileHover={isUnlocked ? { y: -6 } : {}}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleLevelCardClick(cfg.name)}
                    className={cn(
                      "cursor-pointer rounded-2xl border bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between relative overflow-hidden group",
                      cfg.colorScheme.cardBorder,
                      isUnlocked ? cfg.colorScheme.cardHoverBorder : "opacity-75 bg-slate-50/70",
                      isUnlocked ? "hover:shadow-xl" : "hover:shadow-sm"
                    )}
                  >
                    {/* Top Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border", cfg.colorScheme.badgeBg)}>
                          Cấp độ {cfg.levelNumber}
                        </span>

                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm">
                            <Unlock size={14} />
                            Đã mở khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold border border-slate-300">
                            <Lock size={14} />
                            Đang khóa
                          </span>
                        )}
                      </div>

                      {/* Icon & Title Header */}
                      <div className="flex items-center gap-4 my-4">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300", cfg.colorScheme.iconBg, cfg.colorScheme.iconCol)}>
                          <IconComponent size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {cfg.name}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">
                            {cfg.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed mt-2 min-h-[4rem]">
                        {cfg.description}
                      </p>

                      {/* Stats & Progress */}
                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Layers size={16} className="text-slate-400" />
                            {courseCount} khóa học
                          </span>
                          {isAuthenticated && progress > 0 && (
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Tiến độ: {progress}%
                            </span>
                          )}
                        </div>

                        {isAuthenticated && (
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500", cfg.colorScheme.progressBg)}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-2">
                      <Button
                        className={cn(
                          "w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200",
                          isUnlocked
                            ? cn(cfg.colorScheme.btnBg, "text-white")
                            : "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed border border-slate-300"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLevelCardClick(cfg.name);
                        }}
                      >
                        {isUnlocked ? (
                          <>
                            <span>Xem các khóa học</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Lock size={18} />
                            <span>Khóa - Cần hoàn thành cấp trước</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Level Courses Modal */}
      {selectedLevel && selectedConfig && (
        <LevelCoursesModal
          isOpen={Boolean(selectedLevel)}
          onClose={() => setSelectedLevel(null)}
          levelName={selectedLevel}
          levelNumber={selectedConfig.levelNumber}
          levelDescription={selectedConfig.description}
          courses={coursesByLevel[selectedLevel] || []}
          courseRatingMap={courseRatingMap}
          enrollments={enrollments}
          isAuthenticated={isAuthenticated}
          onRequireLogin={() => setShowLoginModal(true)}
        />
      )}

      {/* Login Requirement Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để xem chi tiết bài học và tham gia khóa học."
      />
    </motion.section>
  );
}

export default CoursesPage;
