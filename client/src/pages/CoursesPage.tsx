import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import { tokenStorage } from "../lib/auth";
import CourseImage from "../components/CourseImage";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const sectionStagger = {
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
          // Filter out drafted ones, handling both int and string enums
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
      className="bg-[#f6f9f7] py-8 md:py-10"
    >
      <div className="container">
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-2xl border border-[#efe7cf] bg-[#fcf8ea] px-4 py-3.5 md:flex md:items-center md:justify-between md:px-6"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6ebb7] text-[#b7861f]"
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[0.95rem] font-bold text-[#3a403f]">
                {coursesPage.upgrade.title}
              </p>
              <p className="text-sm text-[#86908c]">
                {coursesPage.upgrade.description}
              </p>
            </div>
          </div>

          <Link to="/nang-cap">
            <Button
              size="sm"
              className="mt-3 h-9 bg-[#efca4c] px-5 text-[0.8rem] font-bold text-[#4b3c14] shadow-none hover:translate-y-0 hover:bg-[#e7c13f] md:mt-0"
            >
              {coursesPage.upgrade.cta}
            </Button>
          </Link>
        </motion.div>

        <motion.header
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mt-8"
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
          className="mt-8 flex flex-wrap gap-2.5"
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
          className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {isLoading ? (
            <div className="col-span-full py-10 flex justify-center text-slate-500">Đang tải dữ liệu...</div>
          ) : visibleCourses.map((course) => (
            <motion.article
              key={course.id}
              variants={fadeInUp}
              transition={{ duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-[26px] border border-[#e6ece8] bg-white shadow-[0_6px_28px_rgba(35,48,57,0.06)] flex flex-col"
            >
              <div
                className={cn(
                  "relative h-[220px] overflow-hidden bg-slate-100 flex items-center justify-center",
                )}
              >
                <CourseImage 
                  title={course.title} 
                  coverMediaId={course.coverMediaId} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                {course.isPremium && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#ebca4f] px-3 py-1 text-xs font-bold text-[#394041]">
                    Premium
                  </span>
                )}
                <p className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                  ELEVEN Teacher
                </p>
              </div>

              <div className="px-4 pb-4 pt-3.5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.03em] text-[#92a09d]">
                  <span className="rounded-full bg-[#eef4ef] px-2 py-0.5 text-[#5f776b]">
                    {course.level || "Cơ bản"}
                  </span>
                </div>

                <h2 className="mt-2 text-[1.55rem] font-bold leading-tight text-[#1f2e39] line-clamp-2">
                  {course.title}
                </h2>
                <p className="mt-2 text-[0.95rem] text-[#74818a] line-clamp-2">
                  {course.description || course.summary || "Chưa có mô tả"}
                </p>

                <Link to={`/khoa-hoc/${course.id}`} className="w-full mt-5">
                  <Button className="h-10 w-full justify-center bg-[#3b7948] text-white text-[0.95rem] shadow-md hover:bg-[#336a40] transition-colors rounded-xl">
                    {common.buttons.startLearning}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

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
    </motion.section>
  );
}

export default CoursesPage;
