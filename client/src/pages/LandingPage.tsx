import modelImg from "../assets/model.png";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Sparkles, Star, Plus, CheckCircle2, BarChart3, Languages } from "lucide-react";
import { viText } from "../locales/vi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";

/* ── Animation variants ── */
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

/* ── Decorative elements (continuous animations) ── */
function FloatingDecorations() {
  return (
    <>
      {/* Star top-right */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [0, 15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 right-[48%] text-[#e4bf3f] hidden lg:block"
      >
        <Plus size={18} strokeWidth={3} />
      </motion.div>

      {/* Sparkle top-right of heading */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 right-[46%] text-[#e4bf3f] hidden lg:block"
      >
        <Star size={14} fill="currentColor" />
      </motion.div>

      {/* Cross near image */}
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [0, 90, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 right-[15%] text-[#3c6c44] hidden lg:block"
      >
        <Plus size={16} strokeWidth={3} />
      </motion.div>

      {/* Stars bottom left */}
      <motion.div
        animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[5%] text-[#e4bf3f]/60 hidden lg:block"
      >
        <Sparkles size={20} />
      </motion.div>

      {/* Small dots scattered */}
      <motion.div
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] right-[8%] size-2 rounded-full bg-[#e4bf3f]/40 hidden lg:block"
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[60%] left-[2%] size-1.5 rounded-full bg-[#3c6c44]/30 hidden lg:block"
      />
    </>
  );
}

/* ── Floating cards on hero image ── */
function FloatingCards() {
  return (
    <>
      {/* Speech bubble - "Xin chào" */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute top-[15%] left-[-8%] z-10"
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-black/8 border border-white/60"
        >
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-[#ebf4ec] flex items-center justify-center">
              <Languages size={14} className="text-[#3c6c44]" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Xin chào</span>
          </div>
        </motion.div>
      </motion.div>

      {/* AI recognition card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="absolute top-[8%] right-[-12%] z-10"
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="rounded-2xl bg-white/95 backdrop-blur-sm px-5 py-4 shadow-lg shadow-black/8 border border-white/60"
        >
          <p className="text-[11px] text-slate-400 font-medium mb-1">AI nhận diện</p>
          <p className="text-lg font-bold text-slate-800">Xin chào!</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 flex-1 rounded-full bg-[#3c6c44]" />
            <span className="text-[11px] text-slate-500">Độ chính xác: <span className="font-bold text-[#3c6c44]">98%</span></span>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-[18%] left-[-5%] z-10"
      >
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="rounded-2xl bg-white/95 backdrop-blur-sm px-5 py-4 shadow-lg shadow-black/8 border border-white/60 min-w-[200px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-[#3c6c44]" />
            <p className="text-[11px] text-slate-400 font-medium">Tiến độ học tập</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">24</p>
          <p className="text-xs text-slate-500">Bài học hoàn thành</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#3c6c44] to-[#5a9a66]" />
            </div>
            <span className="text-xs font-bold text-slate-600">65%</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Dictionary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-[5%] right-[-10%] z-10"
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="rounded-2xl bg-white/95 backdrop-blur-sm px-5 py-4 shadow-lg shadow-black/8 border border-white/60"
        >
          <p className="text-[11px] text-slate-400 font-medium mb-1">Từ điển ký hiệu</p>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-2xl font-bold text-slate-800">500+</p>
              <p className="text-xs text-slate-500">Ký hiệu</p>
            </div>
            <div className="size-10 rounded-xl bg-[#ebf4ec] flex items-center justify-center">
              <BookOpen size={18} className="text-[#3c6c44]" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

/* ── Main Component ── */
function LandingPage() {
  const { common, landing } = viText;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#f8fdf8] to-[#edf6e4] min-h-screen flex items-center pt-[96px] pb-16 md:pt-[120px] md:pb-24">
        <FloatingDecorations />

        {/* Soft animated ambient auroras */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.15, 0.9, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 right-[10%] size-[600px] rounded-full bg-[#e4bf3f]/[0.06] blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 40, -40, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute -bottom-40 left-[5%] size-[700px] rounded-full bg-[#3c6c44]/[0.05] blur-[140px]"
          />
        </div>

        <div className="container relative grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* ── Left: Text content ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-6 w-fit rounded-full bg-[#ebf4ec] px-4 py-2 text-[0.68rem] font-bold tracking-[0.04em] text-[#3c6c44] lg:mx-0"
            >
              {landing.hero.badge}
            </motion.p>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-[clamp(2.2rem,4vw,3.8rem)] font-bold leading-[1.12] tracking-[-0.02em] text-[#1a2e35]"
            >
              {landing.hero.title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
              <br />
              <span className="relative inline-block text-[#e4bf3f]">
                {landing.hero.titleHighlight}
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 120 8" fill="none">
                  <path d="M2 6C20 2 40 2 60 4C80 6 100 4 118 2" stroke="#3c6c44" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-5 max-w-[480px] text-[15px] leading-relaxed text-slate-500 lg:mx-0"
            >
              {landing.hero.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center lg:mx-0 lg:max-w-none lg:justify-start"
            >
              <button
                onClick={(e) => handleProtectedAction(e, "/khoa-hoc")}
                className="inline-flex items-center gap-2 rounded-full bg-[#3c6c44] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(60,108,68,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(60,108,68,0.35)]"
              >
                {common.buttons.startLearningFree}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={(e) => handleProtectedAction(e, "*")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-7 py-3 text-[15px] font-semibold text-slate-700 transition-all hover:border-[#3c6c44]/30 hover:bg-[#f8fdf9]"
              >
                {common.buttons.tryTranslator}
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeInUp}
              className="mx-auto mt-8 flex items-center gap-3 lg:mx-0"
            >
              <div className="flex -space-x-2.5">
                {["#4a9960", "#e4bf3f", "#6b8f73"].map((color, i) => (
                  <div
                    key={i}
                    className="size-9 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color, zIndex: 3 - i }}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${["NV", "TH", "LA"][i]}&background=${color.replace("#", "")}&color=fff&size=36&font-size=0.4`}
                      alt=""
                      className="size-full rounded-full"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">Hơn 10.000+</span> người đang học cùng Eleven
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: Hero image with floating cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            className="relative mx-auto max-w-[540px] lg:max-w-none"
          >
            <div className="relative">
              <div className="overflow-hidden rounded-[28px] max-h-[620px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-gradient-to-b from-transparent to-slate-50">
                <img
                  src={modelImg}
                  alt={landing.hero.imageAlt}
                  className="block w-full rounded-[28px] object-cover object-top max-h-[620px]"
                />
              </div>
              <FloatingCards />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-slate-800"
            >
              {landing.sections.featureTitle}
            </motion.h2>
            <motion.div variants={fadeInUp} className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#3c6c44]" />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {landing.featureCards.map((feature, index) => {
              const icons = [Brain, BookOpen, Languages];
              const Icon = icons[index] ?? Languages;
              const gradients = [
                "from-[#3c6c44]/5 to-[#3c6c44]/[0.02]",
                "from-[#e4bf3f]/10 to-[#e4bf3f]/[0.02]",
                "from-[#3c6c44]/5 to-[#e4bf3f]/5",
              ];

              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className={`group h-full rounded-3xl border border-slate-100 bg-gradient-to-br ${gradients[index]} p-8 transition-all hover:border-[#3c6c44]/20 hover:shadow-lg hover:shadow-[#3c6c44]/5`}>
                    {/* Placeholder image area */}
                    <div className="mb-6 h-48 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                      <div className="size-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
                        <Icon className="size-8 text-[#3c6c44]" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">{feature.title}</h3>
                    <p className="text-[15px] leading-relaxed text-slate-500">{feature.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ════════ LEARNING POINTS ════════ */}
      <section className="py-20 md:py-28 bg-[#fafcfa]">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-slate-800"
            >
              {landing.sections.learningTitle}
            </motion.h2>
            <motion.div variants={fadeInUp} className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#e4bf3f]" />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {landing.learningPoints.map((point, i) => (
              <motion.article
                key={point.title}
                variants={fadeInUp}
                className="group rounded-2xl bg-white border border-slate-100 p-6 transition-all hover:border-[#3c6c44]/20 hover:shadow-lg hover:shadow-[#3c6c44]/5"
              >
                <div className="mb-4 size-10 rounded-xl bg-[#ebf4ec] flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-[#3c6c44]" />
                </div>
                <h3 className="text-[1.05rem] font-bold text-slate-800 mb-2">
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">{point.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="container"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3c6c44] to-[#2d5434] px-8 py-16 text-center md:px-16 md:py-20">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute top-0 left-0 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute bottom-0 right-0 size-60 translate-x-1/3 translate-y-1/3 rounded-full bg-white/5" />

            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-12 text-white/20 hidden md:block"
            >
              <Sparkles size={24} />
            </motion.div>

            <h2 className="relative text-[clamp(1.8rem,3vw,2.8rem)] font-bold text-white leading-tight">
              {landing.cta.title}
            </h2>
            <p className="relative mx-auto mt-5 max-w-[560px] text-[15px] leading-relaxed text-white/75">
              {landing.cta.description}
            </p>
            <button
              onClick={() => navigate("/dang-ky")}
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-[#3c6c44] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {common.buttons.createFreeAccount}
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để sử dụng tính năng này."
      />
    </>
  );
}

export default LandingPage;
