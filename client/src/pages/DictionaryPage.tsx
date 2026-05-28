import { ChevronLeft, ChevronRight, BookOpen, Search, Play, Clock, Zap, Loader2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import { tokenStorage } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import CourseImage from "../components/CourseImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ITEMS_PER_PAGE = 8;

const alphabetList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Vietnamese-aware: get the first "letter" of a title for filtering
// Handles Vietnamese diacritics by mapping to their base letter
function getBaseLetter(char: string): string {
  const c = char.toUpperCase();
  const map: Record<string, string> = {
    "À": "A", "Á": "A", "Ả": "A", "Ã": "A", "Ạ": "A",
    "Ă": "A", "Ằ": "A", "Ắ": "A", "Ẳ": "A", "Ẵ": "A", "Ặ": "A",
    "Â": "A", "Ầ": "A", "Ấ": "A", "Ẩ": "A", "Ẫ": "A", "Ậ": "A",
    "Đ": "D",
    "È": "E", "É": "E", "Ẻ": "E", "Ẽ": "E", "Ẹ": "E",
    "Ê": "E", "Ề": "E", "Ế": "E", "Ể": "E", "Ễ": "E", "Ệ": "E",
    "Ì": "I", "Í": "I", "Ỉ": "I", "Ĩ": "I", "Ị": "I",
    "Ò": "O", "Ó": "O", "Ỏ": "O", "Õ": "O", "Ọ": "O",
    "Ô": "O", "Ồ": "O", "Ố": "O", "Ổ": "O", "Ỗ": "O", "Ộ": "O",
    "Ơ": "O", "Ờ": "O", "Ớ": "O", "Ở": "O", "Ỡ": "O", "Ợ": "O",
    "Ù": "U", "Ú": "U", "Ủ": "U", "Ũ": "U", "Ụ": "U",
    "Ư": "U", "Ừ": "U", "Ứ": "U", "Ử": "U", "Ữ": "U", "Ự": "U",
    "Ỳ": "Y", "Ý": "Y", "Ỷ": "Y", "Ỹ": "Y", "Ỵ": "Y",
  };
  return map[c] || c;
}

// Gradient palette for card backgrounds based on first letter
const letterGradients: Record<string, string> = {
  A: "from-rose-400/80 to-orange-300/80",
  B: "from-sky-400/80 to-cyan-300/80",
  C: "from-emerald-400/80 to-teal-300/80",
  D: "from-violet-400/80 to-purple-300/80",
  E: "from-amber-400/80 to-yellow-300/80",
  F: "from-pink-400/80 to-rose-300/80",
  G: "from-lime-400/80 to-green-300/80",
  H: "from-indigo-400/80 to-blue-300/80",
  I: "from-fuchsia-400/80 to-pink-300/80",
  J: "from-teal-400/80 to-emerald-300/80",
  K: "from-orange-400/80 to-amber-300/80",
  L: "from-cyan-400/80 to-sky-300/80",
  M: "from-purple-400/80 to-violet-300/80",
  N: "from-green-400/80 to-lime-300/80",
  O: "from-blue-400/80 to-indigo-300/80",
  P: "from-rose-400/80 to-pink-300/80",
  Q: "from-yellow-400/80 to-amber-300/80",
  R: "from-sky-400/80 to-blue-300/80",
  S: "from-emerald-400/80 to-green-300/80",
  T: "from-violet-400/80 to-indigo-300/80",
  U: "from-amber-400/80 to-orange-300/80",
  V: "from-teal-400/80 to-cyan-300/80",
  W: "from-pink-400/80 to-fuchsia-300/80",
  X: "from-lime-400/80 to-emerald-300/80",
  Y: "from-indigo-400/80 to-violet-300/80",
  Z: "from-orange-400/80 to-rose-300/80",
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const sectionStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

interface LessonItem {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  difficultyLevel: string;
  estimatedMinutes: number;
  xpReward: number;
  coverMediaId?: number | null;
  lessonType: string;
  status: number;
}

function DictionaryPage() {
  const { dictionaryPage } = viText;
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("A");
  const [currentPage, setCurrentPage] = useState(1);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch all lessons from API
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {};

        const res = await fetch(
          `${API_BASE_URL}/api/lessons?page=1&pageSize=200`,
          { headers },
        );

        if (res.ok) {
          const data = await res.json();
          // Only show published lessons (status 1)
          const published = (data.items || []).filter(
            (l: any) =>
              l.status === 1 ||
              l.status === "Published" ||
              l.status === "published" ||
              l.status === "1",
          );
          setLessons(published);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu từ điển", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLessons();
  }, []);

  // Count lessons per letter for badge display
  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const letter of alphabetList) {
      counts[letter] = 0;
    }
    for (const lesson of lessons) {
      const first = lesson.title.trim().charAt(0);
      const base = getBaseLetter(first);
      if (counts[base] !== undefined) {
        counts[base]++;
      }
    }
    return counts;
  }, [lessons]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const firstChar = lesson.title.trim().charAt(0);
      const baseLetter = getBaseLetter(firstChar);
      const matchesLetter = baseLetter === activeLetter;

      const matchesQuery =
        normalizedQuery.length === 0 ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        (lesson.shortDescription || "").toLowerCase().includes(normalizedQuery);

      return matchesLetter && matchesQuery;
    });
  }, [activeLetter, query, lessons]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntries.length / ITEMS_PER_PAGE),
  );

  const pagedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredEntries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeLetter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleProtectedLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="min-h-screen bg-transparent py-8 md:py-10"
    >
      <div className="container">
        {/* Hero Header */}
        <motion.header
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-[700px] text-center"
        >
          <h1 className="text-[clamp(1.95rem,3vw,2.85rem)] font-bold leading-[1.1] text-[#182333]">
            {dictionaryPage.hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-[760px] text-[#79858e]">
            {dictionaryPage.hero.description}
          </p>
        </motion.header>

        {/* Search Bar */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mt-8 flex flex-col gap-3 rounded-[22px] bg-white p-3 shadow-[0_10px_30px_rgba(24,35,51,0.08)] sm:flex-row sm:items-center"
        >
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-full border border-[#e8eeea] px-4 text-[#6d7a84] focus-within:border-[#9ebea7]">
            <Search className="h-4.5 w-4.5 text-[#5e8169]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dictionaryPage.search.placeholder}
              className="w-full border-none bg-transparent text-[0.95rem] text-[#2b3b47] outline-none placeholder:text-[#9eabb4]"
            />
          </label>
          <button
            type="button"
            className="h-12 rounded-full bg-[#3a7a4a] px-8 text-sm font-bold text-white transition-colors hover:bg-[#30673e] sm:min-w-[170px]"
          >
            {dictionaryPage.search.button}
          </button>
        </motion.div>

        {/* Alphabet Bar */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-8 overflow-x-auto rounded-2xl border border-[#e6ece8] bg-white px-4 py-3"
        >
          <div className="flex min-w-[760px] items-center justify-between gap-2">
            {alphabetList.map((letter) => {
              const isActive = activeLetter === letter;
              const count = letterCounts[letter] || 0;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setActiveLetter(letter)}
                  className={cn(
                    "relative min-w-6 pb-2 text-[0.82rem] font-bold transition-colors",
                    isActive
                      ? "text-[#3a7b49] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-[#3a7b49]"
                      : count > 0
                        ? "text-[#5c6f7b] hover:text-[#3a7b49]"
                        : "text-[#cdd5d9] cursor-default",
                  )}
                >
                  {letter}
                  {count > 0 && (
                    <span
                      className={cn(
                        "absolute -top-2.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-bold leading-none",
                        isActive
                          ? "bg-[#3a7b49] text-white"
                          : "bg-[#e8eeea] text-[#6d7a84]",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results count */}
        {!isLoading && (
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
            className="mt-6 flex items-center justify-between"
          >
            <p className="text-sm text-[#7d8a92]">
              <span className="font-bold text-[#3a7b49]">{filteredEntries.length}</span>{" "}
              bài học bắt đầu bằng chữ{" "}
              <span className="font-bold text-[#182333]">"{activeLetter}"</span>
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#3a7b49]" />
            <p className="text-sm font-medium text-[#7d8a92]">Đang tải từ điển...</p>
          </div>
        ) : pagedEntries.length > 0 ? (
          <motion.div
            key={`${activeLetter}-${query}-${currentPage}`}
            initial="hidden"
            animate="show"
            variants={sectionStagger}
            className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {pagedEntries.map((lesson) => {
              const firstChar = lesson.title.trim().charAt(0);
              const baseLetter = getBaseLetter(firstChar);
              const gradient =
                letterGradients[baseLetter] || "from-slate-400/80 to-slate-300/80";

              return (
                <motion.article
                  key={lesson.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  whileHover={{ y: -5 }}
                  className="group overflow-hidden rounded-[18px] border border-[#e5ece7] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link
                    to={`/bai-hoc/${lesson.id}`}
                    onClick={handleProtectedLink}
                    className="block"
                  >
                    {/* Card Image / Cover */}
                    <div className="relative h-[140px] overflow-hidden">
                      {lesson.coverMediaId ? (
                        <CourseImage
                          title={lesson.title}
                          coverMediaId={lesson.coverMediaId}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={cn(
                            "grid h-full place-items-center bg-gradient-to-br",
                            gradient,
                          )}
                        >
                          <span className="text-[2.2rem] font-extrabold tracking-[0.02em] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.24)]">
                            {lesson.title.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />

                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                          <Play className="h-5 w-5 fill-[#3a7b49] text-[#3a7b49]" />
                        </div>
                      </div>

                      {/* Difficulty badge */}
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[0.65rem] font-bold text-[#3a7b49] shadow-sm backdrop-blur-sm">
                        {lesson.difficultyLevel || "Cơ bản"}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="px-3.5 pb-3.5 pt-3">
                      <p className="text-[0.67rem] font-bold uppercase tracking-[0.08em] text-[#8ba294]">
                        {lesson.lessonType || "Từ vựng"}
                      </p>
                      <h2 className="mt-1 text-[1.35rem] font-bold leading-tight text-[#1f2d3b] line-clamp-1">
                        {lesson.title}
                      </h2>
                      {lesson.shortDescription && (
                        <p className="mt-1.5 text-xs text-[#8f9ca5] line-clamp-2 leading-relaxed">
                          {lesson.shortDescription}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-[#8f9ca5]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {lesson.estimatedMinutes} phút
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-semibold text-amber-600">+{lesson.xpReward} XP</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#d9e2dc] bg-white px-4 py-10 text-center"
          >
            <BookOpen className="h-10 w-10 text-[#c5d0c9]" />
            <p className="text-[#7d8a92]">
              {query
                ? `Không tìm thấy bài học nào với từ khóa "${query}" bắt đầu bằng "${activeLetter}".`
                : `Chưa có bài học nào bắt đầu bằng chữ "${activeLetter}".`}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-10 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              aria-label={dictionaryPage.pagination.previousAriaLabel}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d9e3dd] bg-white text-[#96a4ad] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border text-sm font-semibold transition-colors",
                    currentPage === page
                      ? "border-[#3a7b49] bg-[#3a7b49] text-white"
                      : "border-[#d9e3dd] bg-white text-[#7f8d97] hover:border-[#b7c7bd]",
                  )}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              aria-label={dictionaryPage.pagination.nextAriaLabel}
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d9e3dd] bg-white text-[#96a4ad] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để xem chi tiết bài học."
      />
    </motion.section>
  );
}

export default DictionaryPage;
