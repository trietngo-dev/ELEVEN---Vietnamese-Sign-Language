import modelImg from "../assets/model.png";
import class1Img from "../assets/Class1.png";
import class2Img from "../assets/Class2.png";
import class3Img from "../assets/Class3.png";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Sparkles, Star, Plus, CheckCircle2, BarChart3, Languages } from "lucide-react";
import { viText } from "../locales/vi";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
      {/* 500+ Ký hiệu card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [-6, 6, -6] }}
        transition={{ 
          opacity: { delay: 0.6 },
          scale: { delay: 0.6 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
        }}
        className="absolute top-[16%] left-[4%] lg:left-[8%] xl:left-[14%] z-20 hidden lg:block"
      >
        <div className="rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100/50 flex items-center gap-2">
          <div className="size-6 rounded-full bg-[#fcf8ea] flex items-center justify-center">
            <BookOpen size={12} className="text-[#e4bf3f]" />
          </div>
          <span className="text-xs font-bold text-slate-700">500+ ký hiệu</span>
        </div>
      </motion.div>

      {/* Xin chào card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [6, -6, 6] }}
        transition={{ 
          opacity: { delay: 0.8 },
          scale: { delay: 0.8 },
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
        }}
        className="absolute top-[28%] left-[2%] lg:left-[5%] xl:left-[10%] z-20 hidden lg:block"
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.07)] border border-slate-100/50 flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#ebf4ec] flex items-center justify-center shrink-0">
            <span className="text-base">👋</span>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">Xin chào</p>
            <p className="text-[10px] text-slate-400 font-medium">Ký hiệu cơ bản</p>
          </div>
        </div>
      </motion.div>

      {/* Video Preview card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [-5, 5, -5] }}
        transition={{ 
          opacity: { delay: 1.0 },
          scale: { delay: 1.0 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" } 
        }}
        className="absolute top-[14%] right-[2%] lg:right-[5%] xl:right-[10%] z-20 hidden lg:block"
      >
        <div className="rounded-3xl bg-white/95 backdrop-blur-sm p-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100/50 w-52 overflow-hidden">
          {/* Simulated Video Area */}
          <div className="relative aspect-[4/3] rounded-2xl bg-[#d3e3db]/60 overflow-hidden flex items-center justify-center">
            <div className="size-10 rounded-full bg-white/95 shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="text-xs text-[#3c6c44] ml-0.5">▶</span>
            </div>
            {/* Badge overlay at bottom left */}
            <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm">
              Bài 1: Bảng chữ cái
            </span>
          </div>
          <div className="flex items-center justify-between px-1.5 pt-2">
            <div className="flex -space-x-1.5">
              {[1, 2].map((i) => (
                <div key={i} className="size-5 rounded-full border border-white bg-slate-200 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=U${i}&size=20&background=3c6c44&color=fff`} alt="" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#e4bf3f] flex items-center gap-0.5">
              ★ <span className="text-slate-600">4.9</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* AI recognition loader card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
        transition={{ 
          opacity: { delay: 1.2 },
          scale: { delay: 1.2 },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 } 
        }}
        className="absolute bottom-[20%] left-[4%] lg:left-[8%] xl:left-[12%] z-20 hidden lg:block"
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.07)] border border-slate-100/50 flex items-center gap-3">
          <div className="size-9 rounded-full bg-[#ebf4ec] flex items-center justify-center shrink-0">
            <span className="text-xs text-[#3c6c44]">📷</span>
          </div>
          <div className="text-left w-36">
            <p className="text-[11px] font-bold text-slate-800 mb-1.5">AI đang nhận diện...</p>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-[#3c6c44] to-[#e4bf3f] rounded-full animate-[pulse_1.5s_infinite]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bubble Tôi cần giúp đỡ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [4, -4, 4] }}
        transition={{ 
          opacity: { delay: 1.4 },
          scale: { delay: 1.4 },
          y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 } 
        }}
        className="absolute top-[48%] right-[4%] lg:right-[8%] xl:right-[14%] z-20 hidden lg:block"
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100/50 text-left">
          <p className="text-xs font-semibold text-slate-700">“Tôi cần giúp đỡ”</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="size-1.5 rounded-full bg-[#3c6c44] animate-bounce shrink-0" />
            <span className="size-1.5 rounded-full bg-[#3c6c44] animate-bounce shrink-0 [animation-delay:0.2s]" />
            <span className="size-1.5 rounded-full bg-[#3c6c44] animate-bounce shrink-0 [animation-delay:0.4s]" />
          </div>
        </div>
      </motion.div>

      {/* 24 bài học hoàn thành card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
        transition={{ 
          opacity: { delay: 1.6 },
          scale: { delay: 1.6 },
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1.0 } 
        }}
        className="absolute bottom-[18%] right-[4%] lg:right-[8%] xl:left-[70%] z-20 hidden lg:block"
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.07)] border border-slate-100/50 flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#ebf4ec] flex items-center justify-center shrink-0">
            <span className="text-xs text-[#3c6c44]">✓</span>
          </div>
          <div className="text-left">
            <p className="text-base font-extrabold text-slate-800 leading-none">24</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">bài học hoàn thành</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Infinite Circular Carousel Component ── */
interface CarouselItem {
  type: "card" | "class";
  title?: string;
  body?: string;
  icon?: React.ReactNode;
  img?: string;
  alt?: string;
}

function CircularCarousel() {
  const { landing } = viText;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const autoScrollActive = useRef(true);
  const animationFrameId = useRef<number | null>(null);

  const carouselItems: CarouselItem[] = [
    {
      type: "card",
      title: landing.learningPoints[0].title,
      body: landing.learningPoints[0].body,
      icon: <CheckCircle2 size={18} className="text-[#3c6c44]" />,
    },
    {
      type: "class",
      img: class1Img,
      alt: "Lớp học 1",
    },
    {
      type: "card",
      title: landing.learningPoints[1].title,
      body: landing.learningPoints[1].body,
      icon: <CheckCircle2 size={18} className="text-[#e4bf3f]" />,
    },
    {
      type: "class",
      img: class2Img,
      alt: "Lớp học 2",
    },
    {
      type: "card",
      title: landing.learningPoints[2].title,
      body: landing.learningPoints[2].body,
      icon: <CheckCircle2 size={18} className="text-[#3c6c44]" />,
    },
    {
      type: "class",
      img: class3Img,
      alt: "Lớp học 3",
    },
    {
      type: "card",
      title: landing.learningPoints[3].title,
      body: landing.learningPoints[3].body,
      icon: <CheckCircle2 size={18} className="text-[#e4bf3f]" />,
    },
  ];

  // We duplicate items 4 times to ensure seamless infinite scrolling in both directions
  const duplicatedItems = [...carouselItems, ...carouselItems, ...carouselItems, ...carouselItems];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial scroll to the middle copy
    const singleSetWidth = container.scrollWidth / 4;
    container.scrollLeft = singleSetWidth;

    const scrollSpeed = 0.5; // Very slow and premium scrolling
    
    const updateScroll = () => {
      if (autoScrollActive.current && !isDragging) {
        // Auto scroll from left to right (so scrollLeft decreases)
        container.scrollLeft -= scrollSpeed;
        
        // Wrap around seamlessly when scrolling to the left
        const minScroll = container.scrollWidth * 0.25;
        if (container.scrollLeft <= minScroll) {
          container.scrollLeft += singleSetWidth;
        }
      }
      animationFrameId.current = requestAnimationFrame(updateScroll);
    };

    animationFrameId.current = requestAnimationFrame(updateScroll);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    autoScrollActive.current = false;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed multiplier
    container.scrollLeft = scrollLeftStart.current - walk;

    // Wrap around dynamically during drag to prevent reaching edges
    const singleSetWidth = container.scrollWidth / 4;
    const maxScroll = container.scrollWidth * 0.75;
    const minScroll = container.scrollWidth * 0.25;
    if (container.scrollLeft >= maxScroll) {
      container.scrollLeft -= singleSetWidth;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeftStart.current = container.scrollLeft;
    } else if (container.scrollLeft <= minScroll) {
      container.scrollLeft += singleSetWidth;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeftStart.current = container.scrollLeft;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    // Smoothly resume auto-scrolling after a short duration
    setTimeout(() => {
      autoScrollActive.current = true;
    }, 1500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    autoScrollActive.current = false;
    startX.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftStart.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    container.scrollLeft = scrollLeftStart.current - walk;

    const singleSetWidth = container.scrollWidth / 4;
    const maxScroll = container.scrollWidth * 0.75;
    const minScroll = container.scrollWidth * 0.25;
    if (container.scrollLeft >= maxScroll) {
      container.scrollLeft -= singleSetWidth;
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftStart.current = container.scrollLeft;
    } else if (container.scrollLeft <= minScroll) {
      container.scrollLeft += singleSetWidth;
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftStart.current = container.scrollLeft;
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      className={`flex items-center gap-6 overflow-x-auto py-8 px-4 cursor-grab select-none scrollbar-none ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {duplicatedItems.map((item, index) => {
        if (item.type === "card") {
          return (
            <article 
              key={index}
              className="flex-shrink-0 w-80 h-56 rounded-[24px] bg-white border border-slate-100/85 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-[#3c6c44]/20 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 size-10 rounded-xl bg-[#ebf4ec] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <h3 className="text-[1.05rem] font-bold text-slate-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
                  {item.body}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#3c6c44] border-t border-slate-50 pt-3 mt-1">
                <span>Eleven Course</span>
                <span className="flex items-center gap-1 text-[#e4bf3f]">
                  ★ <span className="text-slate-500 font-semibold">5.0</span>
                </span>
              </div>
            </article>
          );
        } else {
          return (
            <div 
              key={index}
              className="flex-shrink-0 w-44 h-56 rounded-[24px] overflow-hidden border border-slate-100 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-center hover:scale-[1.02] transition-transform duration-300"
            >
              <img 
                src={item.img} 
                alt={item.alt} 
                className="w-full h-full object-cover rounded-2xl pointer-events-none"
              />
            </div>
          );
        }
      })}
    </div>
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
        <FloatingCards />

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

        <div className="container relative max-w-4xl mx-auto text-center z-10 flex flex-col items-center pt-8">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.p
              variants={fadeInUp}
              className="mb-6 w-fit rounded-full bg-[#ebf4ec] px-4 py-2 text-[0.68rem] font-bold tracking-[0.04em] text-[#3c6c44]"
            >
              {landing.hero.badge}
            </motion.p>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-[clamp(2.2rem,4.5vw,4rem)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#1a2e35]"
            >
              {landing.hero.title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && " "}
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
              className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-slate-500"
            >
              {landing.hero.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4 w-full"
            >
              <button
                onClick={(e) => handleProtectedAction(e, "/khoa-hoc")}
                className="inline-flex items-center gap-2 rounded-full bg-[#3c6c44] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(60,108,68,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(60,108,68,0.3)]"
              >
                {common.buttons.startLearning}
              </button>
              <button
                onClick={(e) => handleProtectedAction(e, "*")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[15px] font-semibold text-slate-700 shadow-sm transition-all hover:border-[#3c6c44]/30 hover:bg-[#f8fdf9] hover:-translate-y-0.5"
              >
                <Languages size={18} className="text-[#3c6c44]" />
                {common.buttons.tryTranslator}
              </button>
            </motion.div>
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
            className="grid gap-8 lg:grid-cols-3 items-stretch"
          >
            {/* Left Column - Stack of 3 horizontal cards */}
            <div className="flex flex-col gap-6 lg:col-span-2 justify-between">
              {/* Card 1: Dịch AI thời gian thực */}
              <motion.div variants={fadeInUp} className="flex-1 flex">
                <div className="w-full group rounded-3xl border border-slate-100 bg-gradient-to-br from-[#3c6c44]/5 to-[#3c6c44]/[0.02] p-8 transition-all hover:border-[#3c6c44]/20 hover:shadow-lg hover:shadow-[#3c6c44]/5 flex flex-col md:flex-row items-center gap-6">
                  <div className="size-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Brain className="size-8 text-[#3c6c44]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{landing.featureCards[0].title}</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500">{landing.featureCards[0].body}</p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Chuyển văn bản thành giọng nói */}
              <motion.div variants={fadeInUp} className="flex-1 flex">
                <div className="w-full group rounded-3xl border border-slate-100 bg-gradient-to-br from-[#3c6c44]/5 to-[#e4bf3f]/5 p-8 transition-all hover:border-[#3c6c44]/20 hover:shadow-lg hover:shadow-[#3c6c44]/5 flex flex-col md:flex-row items-center gap-6">
                  <div className="size-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Languages className="size-8 text-[#3c6c44]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{landing.featureCards[2].title}</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500">{landing.featureCards[2].body}</p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Bài học tương tác */}
              <motion.div variants={fadeInUp} className="flex-1 flex">
                <div className="w-full group rounded-3xl border border-slate-100 bg-gradient-to-br from-[#e4bf3f]/5 to-[#3c6c44]/5 p-8 transition-all hover:border-[#3c6c44]/20 hover:shadow-lg hover:shadow-[#3c6c44]/5 flex flex-col md:flex-row items-center gap-6">
                  <div className="size-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                    <BookOpen className="size-8 text-[#3c6c44]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{landing.featureCards[1].title}</h3>
                    <p className="text-[14px] leading-relaxed text-slate-500">{landing.featureCards[1].body}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tall vertical container with model.png image */}
            <motion.div variants={fadeInUp} className="lg:col-span-1 h-full">
              <div className="group relative h-full rounded-[32px] border border-slate-100 bg-gradient-to-br from-[#e4bf3f]/10 to-[#3c6c44]/10 overflow-hidden shadow-md transition-all hover:border-[#3c6c44]/20 hover:shadow-xl hover:shadow-[#3c6c44]/5 flex items-stretch">
                <div className="absolute top-6 left-6 z-10 rounded-2xl bg-white/90 backdrop-blur-md px-4 py-2 border border-white/50 shadow-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-[#e4bf3f] animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-700">Eleven AI Model</span>
                </div>
                <img 
                  src={modelImg} 
                  alt="Bài học tương tác" 
                  className="w-full h-full object-cover object-top hover:scale-[1.03] transition-transform duration-700"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════ LEARNING POINTS ════════ */}
      <section className="py-20 md:py-28 bg-[#fafcfa] overflow-hidden">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-10"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-[clamp(1.6rem,2.5vw,2.2rem)] font-bold text-slate-800"
            >
              {landing.sections.learningTitle}
            </motion.h2>
            <motion.div variants={fadeInUp} className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#e4bf3f]" />
          </motion.div>
        </div>

        {/* Full-bleed marquee container */}
        <div className="w-full max-w-[100vw] overflow-hidden">
          <CircularCarousel />
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
