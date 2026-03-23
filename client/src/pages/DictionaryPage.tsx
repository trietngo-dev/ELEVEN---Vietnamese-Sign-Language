import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  alphabetList,
  dictionaryCategories,
  mockDictionaryEntries,
  type DictionaryCategory,
} from "../data/mockDictionary";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";

const ITEMS_PER_PAGE = 8;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const sectionStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

function DictionaryPage() {
  const { dictionaryPage } = viText;
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("A");
  const [activeCategory, setActiveCategory] =
    useState<DictionaryCategory>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockDictionaryEntries.filter((entry) => {
      const matchesCategory =
        activeCategory === "all" || entry.category === activeCategory;
      const matchesLetter = entry.word
        .toLowerCase()
        .startsWith(activeLetter.toLowerCase());
      const matchesQuery =
        normalizedQuery.length === 0 ||
        entry.word.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesLetter && matchesQuery;
    });
  }, [activeCategory, activeLetter, query]);

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
  }, [query, activeLetter, activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={sectionStagger}
      className="bg-[#f7f9f8] py-8 md:py-10"
    >
      <div className="container">
        <motion.header
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto max-w-[700px] text-center"
        >
          <h1 className="text-[clamp(1.95rem,3vw,2.85rem)] font-bold leading-[1.1] text-[#182333]">
            {dictionaryPage.hero.title}
          </h1>
          <p className="mx-auto mt-3 m-w-[760px] text-[#79858e]">
            {dictionaryPage.hero.description}
          </p>
        </motion.header>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mx-auto mt-8 flex min-w-[760px] flex-col gap-3 rounded-[22px] bg-white p-3 shadow-[0_10px_30px_rgba(24,35,51,0.08)] sm:flex-row sm:items-center"
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

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-8 overflow-x-auto rounded-2xl border border-[#e6ece8] bg-white px-4 py-3"
        >
          <div className="flex min-w-[760px] items-center justify-between gap-2">
            {alphabetList.map((letter) => {
              const isActive = activeLetter === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setActiveLetter(letter)}
                  className={cn(
                    "relative min-w-6 pb-2 text-[0.82rem] font-bold transition-colors",
                    isActive
                      ? "text-[#3a7b49] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-[#3a7b49]"
                      : "text-[#a0adb6] hover:text-[#5c6f7b]",
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
          className="mt-6 flex flex-wrap items-center gap-2.5"
        >
          {dictionaryCategories.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-[#e5cd5f] bg-[#f2d25e] text-[#33404a]"
                    : "border-[#e0e7e2] bg-white text-[#68757e] hover:border-[#cad7ce]",
                )}
              >
                {category.label}
              </button>
            );
          })}
        </motion.div>

        {pagedEntries.length > 0 ? (
          <motion.div
            key={`${activeLetter}-${activeCategory}-${query}-${currentPage}`}
            initial="hidden"
            animate="show"
            variants={sectionStagger}
            className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {pagedEntries.map((entry) => (
              <motion.article
                key={entry.id}
                variants={fadeInUp}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-[18px] border border-[#e5ece7] bg-white"
              >
                <div
                  className={cn(
                    "relative grid h-[136px] place-items-center overflow-hidden",
                    entry.imageClass,
                  )}
                >
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                  <span className="text-[2.05rem] font-extrabold tracking-[0.02em] text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.24)]">
                    {entry.imageLabel}
                  </span>
                </div>

                <div className="px-3.5 pb-3.5 pt-3">
                  <p className="text-[0.67rem] font-bold uppercase tracking-[0.08em] text-[#8ba294]">
                    {dictionaryCategories.find(
                      (category) => category.id === entry.category,
                    )?.label ?? entry.category}
                  </p>
                  <h2 className="mt-1 text-[1.65rem] font-bold leading-none text-[#1f2d3b]">
                    {entry.word}
                  </h2>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8f9ca5]">
                    <Eye className="h-3.5 w-3.5" />
                    {entry.viewsLabel}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-6 rounded-2xl border border-dashed border-[#d9e2dc] bg-white px-4 py-7 text-center text-[#7d8a92]"
          >
            {dictionaryPage.labels.empty}
          </motion.p>
        )}

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
      </div>
    </motion.section>
  );
}

export default DictionaryPage;
