import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import {
  courseCategories,
  mockCourses,
  type CourseCategory,
} from "../data/mockCourses";

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
  const [activeCategory, setActiveCategory] = useState<CourseCategory>("all");

  const visibleCourses = useMemo(() => {
    if (activeCategory === "all") {
      return mockCourses;
    }

    return mockCourses.filter((course) => course.category === activeCategory);
  }, [activeCategory]);

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

          <Button
            size="sm"
            className="mt-3 h-9 bg-[#efca4c] px-5 text-[0.8rem] font-bold text-[#4b3c14] shadow-none hover:translate-y-0 hover:bg-[#e7c13f] md:mt-0"
          >
            {coursesPage.upgrade.cta}
          </Button>
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
          {courseCategories.map((category) => {
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
                {category.label}
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
          {visibleCourses.map((course) => (
            <motion.article
              key={course.id}
              variants={fadeInUp}
              transition={{ duration: 0.35, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-[26px] border border-[#e6ece8] bg-white shadow-[0_6px_28px_rgba(35,48,57,0.06)]"
            >
              <div
                className={cn(
                  "relative h-[220px] overflow-hidden",
                  course.thumbnail.bgClass,
                )}
              >
                <div
                  className={cn(
                    "absolute -right-12 -top-10 h-44 w-44 rounded-full blur-2xl",
                    course.thumbnail.glowClass,
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/12 to-transparent" />
                {course.isNewest && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#ebca4f] px-3 py-1 text-xs font-bold text-[#394041]">
                    {coursesPage.labels.newest}
                  </span>
                )}
                <p className="absolute bottom-3 left-3 rounded-full bg-white/84 px-2.5 py-1 text-xs font-semibold text-[#40505e] backdrop-blur-sm">
                  {course.teacherName}
                </p>
              </div>

              <div className="px-4 pb-4 pt-3.5">
                <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.03em] text-[#92a09d]">
                  <span className="rounded-full bg-[#eef4ef] px-2 py-0.5 text-[#5f776b]">
                    {course.levelLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[#a0a9a6]">
                    <Clock3 className="h-3.5 w-3.5" />
                    {course.lessonCount} {coursesPage.labels.lessons}
                  </span>
                </div>

                <h2 className="mt-2 text-[1.55rem] font-bold leading-tight text-[#1f2e39]">
                  {course.title}
                </h2>
                <p className="mt-2 text-[0.95rem] text-[#74818a]">
                  {course.description}
                </p>

                <Button className="mt-5 h-11 w-full justify-center bg-[#3b7948] text-[0.95rem] shadow-none hover:translate-y-0 hover:bg-[#336a40]">
                  {common.buttons.startLearning}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {visibleCourses.length === 0 && (
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
