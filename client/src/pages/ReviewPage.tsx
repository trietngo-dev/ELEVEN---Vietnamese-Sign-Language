import {
  ChevronDown,
  Frown,
  Laugh,
  Meh,
  SendHorizontal,
  Smile,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { viText } from "../locales/vi";
import { reviewCategories, reviewHighlights } from "../data/mockReview";

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

function ReviewPage() {
  const { reviewPage } = viText;
  const [rating, setRating] = useState(4);
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");

  const ratingOptions = [
    { value: 1, label: reviewPage.rating.veryBad, Icon: Frown },
    { value: 2, label: reviewPage.rating.notGood, Icon: Frown },
    { value: 3, label: reviewPage.rating.normal, Icon: Meh },
    { value: 4, label: reviewPage.rating.satisfied, Icon: Smile },
    { value: 5, label: reviewPage.rating.verySatisfied, Icon: Laugh },
  ] as const;

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
          <h1 className="text-[clamp(2rem,3vw,2.95rem)] font-bold leading-[1.1] text-[#172334]">
            {reviewPage.hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[#7c8790]">
            {reviewPage.hero.description}
          </p>
        </motion.header>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="mx-auto mt-8 max-w-[610px] rounded-[36px] border border-[#e5ece8] bg-white p-6 shadow-[0_12px_30px_rgba(19,36,52,0.06)] md:p-8"
        >
          <p className="text-center text-[0.9rem] font-bold uppercase tracking-[0.06em] text-[#8c98a2]">
            {reviewPage.rating.prompt}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2.5">
            {ratingOptions.map(({ value, label, Icon }) => {
              const isActive = value === rating;

              return (
                <motion.button
                  key={value}
                  type="button"
                  aria-label={label}
                  onClick={() => setRating(value)}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border transition-colors",
                    isActive
                      ? "border-[#3b7948] bg-[#eef7ef] text-[#3b7948]"
                      : "border-[#dae4de] bg-white text-[#b0bcc6] hover:border-[#bfcfc4] hover:text-[#6f808b]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.button>
              );
            })}
          </div>

          <div className="mt-7">
            <label
              htmlFor="feedback-category"
              className="text-sm font-semibold text-[#45535f]"
            >
              {reviewPage.form.categoryLabel}
            </label>
            <div className="relative mt-2">
              <select
                id="feedback-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full appearance-none rounded-full border border-[#e1e8e3] bg-[#f8faf9] px-4 pr-10 text-[0.95rem] font-semibold text-[#4b5965] outline-none transition-colors focus:border-[#acc2b3]"
              >
                <option value="">{reviewPage.form.categoryPlaceholder}</option>
                {reviewCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#649377]" />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="feedback-detail"
              className="text-sm font-semibold text-[#45535f]"
            >
              {reviewPage.form.detailLabel}
            </label>
            <textarea
              id="feedback-detail"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              placeholder={reviewPage.form.detailPlaceholder}
              className="mt-2 min-h-[145px] w-full resize-none rounded-[22px] border border-[#e3ebe5] bg-[#f7faf8] p-4 text-[0.95rem] text-[#3c4c57] outline-none transition-colors placeholder:text-[#a8b4bd] focus:border-[#aec6b5]"
            />
          </div>

          <Button className="mt-6 h-12 w-full bg-[#3b7948] text-[1rem] font-bold shadow-none hover:translate-y-0 hover:bg-[#336a40]">
            <SendHorizontal className="mr-2 h-4.5 w-4.5" />
            {reviewPage.form.submitButton}
          </Button>
        </motion.div>

        <motion.div
          variants={sectionStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto mt-12 grid max-w-[900px] gap-4 border-t border-[#dce5df] pt-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reviewHighlights.map((item) => (
            <motion.article
              key={item.label}
              variants={fadeInUp}
              className="text-center"
            >
              <p className="text-[2rem] font-extrabold leading-none text-[#2f7444]">
                {item.value}
              </p>
              <p className="mt-1 text-[0.84rem] font-bold uppercase tracking-[0.08em] text-[#86939b]">
                {item.label}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default ReviewPage;
