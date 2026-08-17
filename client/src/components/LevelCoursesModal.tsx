import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ArrowRight, Sparkles, BookOpen, Layers, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import CourseImage from "./CourseImage";

export interface LevelCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelName: string;
  levelNumber: number;
  levelDescription: string;
  courses: any[];
  courseRatingMap: Record<number, { avg: number; count: number }>;
  enrollments: any[];
  isAuthenticated: boolean;
  onRequireLogin: () => void;
}

const levelThemes: Record<string, { badgeBg: string; textCol: string; borderCol: string; iconBg: string; iconCol: string }> = {
  "Cơ bản": {
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    textCol: "text-[#2d6a4f]",
    borderCol: "border-emerald-200",
    iconBg: "bg-emerald-100/80",
    iconCol: "text-emerald-700",
  },
  "Trung cấp": {
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    textCol: "text-amber-700",
    borderCol: "border-amber-200",
    iconBg: "bg-amber-100/80",
    iconCol: "text-amber-700",
  },
  "Nâng cao": {
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    textCol: "text-indigo-700",
    borderCol: "border-indigo-200",
    iconBg: "bg-indigo-100/80",
    iconCol: "text-indigo-700",
  },
};

export default function LevelCoursesModal({
  isOpen,
  onClose,
  levelName,
  levelNumber,
  levelDescription,
  courses,
  courseRatingMap,
  enrollments,
  isAuthenticated,
  onRequireLogin,
}: LevelCoursesModalProps) {
  const theme = levelThemes[levelName] || levelThemes["Cơ bản"];

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onClose();
      onRequireLogin();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl z-10 flex flex-col border border-emerald-100"
          >
            {/* Modal Header (Compact) */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#f7fbf8] to-white flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-sm shrink-0", theme.iconBg, theme.iconCol)}>
                  {levelNumber === 1 ? (
                    <BookOpen size={22} />
                  ) : levelNumber === 2 ? (
                    <Sparkles size={22} />
                  ) : (
                    <Award size={22} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border", theme.badgeBg)}>
                      Cấp độ {levelNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {courses.length} khóa học
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    Khóa học cấp độ: <span className={theme.textCol}>{levelName}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {levelDescription}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Compact Course Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/60">
              {courses.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Layers size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Chưa có khóa học nào ở cấp độ này</h3>
                  <p className="text-xs text-slate-500 mt-1">Vui lòng quay lại sau để đón nhận các bài học mới nhất.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses.map((course) => {
                    const enrollment = enrollments.find((e) => e.courseId === course.id);
                    const progress = enrollment ? Math.round(enrollment.progressPercent ?? 0) : 0;
                    const rating = courseRatingMap[course.id];

                    return (
                      <article
                        key={course.id}
                        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Course Thumbnail (Compact 100px) */}
                          <div className="relative h-28 overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <CourseImage
                              title={course.title}
                              coverMediaId={course.coverMediaId}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />

                            {course.isPremium && (
                              <span className="absolute left-2.5 top-2 rounded-full bg-[#ebca4f] px-2 py-0.5 text-[10px] font-black text-[#394041] shadow-sm">
                                Pro
                              </span>
                            )}

                            {progress > 0 && (
                              <span className="absolute right-2.5 top-2 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wide shadow-sm">
                                Đã học: {progress}%
                              </span>
                            )}
                          </div>

                          {/* Content Area */}
                          <div className="p-3.5 pb-2">
                            {/* Rating & Level */}
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide border", theme.badgeBg)}>
                                {course.level || levelName}
                              </span>
                              {rating && (
                                <span className="flex items-center gap-1 text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded-full border border-[#fef3c7] font-extrabold text-[10px]">
                                  <Star size={11} className="text-[#fbbf24] fill-[#fbbf24]" />
                                  {rating.avg} ({rating.count})
                                </span>
                              )}
                            </div>

                            {/* Title (1 line clamp) */}
                            <h3 className="text-sm font-black leading-snug text-slate-800 line-clamp-1" title={course.title}>
                              {course.title}
                            </h3>

                            {/* Summary (2 line clamp) */}
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {course.description || course.summary || "Khóa học ngôn ngữ ký hiệu chất lượng cao."}
                            </p>
                          </div>
                        </div>

                        {/* Action CTA - Always Visible */}
                        <div className="p-3.5 pt-1">
                          <Link
                            to={`/khoa-hoc/${course.id}`}
                            className="w-full block"
                            onClick={handleCardClick}
                          >
                            <Button className="w-full bg-[#3c6c44] hover:bg-[#325a38] text-white font-bold h-9 text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5">
                              <span>Vào học</span>
                              <ArrowRight size={14} />
                            </Button>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer (Compact) */}
            <div className="px-6 py-3 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500">
                Tổng cộng {courses.length} khóa học thuộc {levelName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="font-bold border-slate-200 hover:bg-slate-50 text-xs h-8 px-4"
              >
                Đóng
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
