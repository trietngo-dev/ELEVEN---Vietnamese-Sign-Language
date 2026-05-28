import { ArrowRight } from "lucide-react";
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
  const { common, coursesPage } = viText;
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);


  const handleProtectedLink = (e: React.MouseEvent<HTMLAnchorElement>, _path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [catRes, courseRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/course_categories`, { headers }),
          fetch(`${API_BASE_URL}/api/courses`, { headers })
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.items || []);
        }

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourses(courseData.items?.filter((c: any) =>
            c.status === 1 ||
            c.status === "Published" ||
            c.status === "published" ||
            c.status === "1"
          ) || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang khóa học", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const visibleCourses = useMemo(() => {
    if (activeCategory === "all") {
      return courses;
    }
    return courses.filter((course) => course.categoryId === activeCategory);
  }, [activeCategory, courses]);

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
          className="mt-6 flex flex-wrap gap-2.5"
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

        <motion.div
          key={activeCategory}
          initial="hidden"
          animate="show"
          variants={sectionStagger}
          className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {isLoading ? (
            <div className="col-span-full py-10 flex justify-center text-slate-500">Đang tải dữ liệu...</div>
          ) : visibleCourses.map((course) => (
            <motion.article
              key={course.id}
              variants={fadeInUp}
              transition={{ duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-[20px] border border-[#e8efe9] bg-white shadow-[0_4px_20px_rgba(35,48,57,0.04)] flex flex-col h-full hover:shadow-[0_8px_30px_rgba(60,108,68,0.08)] transition-all duration-300"
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
                    Cao cấp
                  </span>
                )}
                <p className="absolute bottom-2.5 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm">
                  ELEVEN Teacher
                </p>
              </div>

              {/* Compact content area */}
              <div className="px-4 pb-4 pt-3 flex flex-col flex-1">
                {/* Level badge */}
                <div className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.03em] text-[#92a09d] h-5">
                  <span className="rounded-full bg-[#eef4ef] px-2 py-0.5 text-[#5f776b]">
                    {course.level || "Cơ bản"}
                  </span>
                </div>

                {/* Compact title */}
                <h2 className="mt-1.5 text-[1.05rem] font-bold leading-snug text-[#1f2e39] line-clamp-2 min-h-[2.8rem]">
                  {course.title}
                </h2>

                {/* Compact description */}
                <p className="mt-1 text-xs text-[#74818a] line-clamp-2 min-h-[2.2rem]">
                  {course.description || course.summary || "Chưa có mô tả"}
                </p>

                <Link to={`/khoa-hoc/${course.id}`} className="w-full mt-4" onClick={(e) => handleProtectedLink(e, `/khoa-hoc/${course.id}`)}>
                  <Button className="h-9 w-full justify-center bg-[#3c6c44] text-white text-xs font-semibold shadow-sm hover:bg-[#325a38] transition-colors rounded-lg">
                    {common.buttons.viewDetail}
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.article >
          ))
          }
        </motion.div >

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
