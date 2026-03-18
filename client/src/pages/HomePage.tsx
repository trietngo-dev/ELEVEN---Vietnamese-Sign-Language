import { motion } from "framer-motion";
import {
  Book,
  Flame,
  Play,
  Mic,
  Bolt,
  Video,
  ArrowRight,
  Users,
  History,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="relative flex w-full flex-col overflow-x-hidden bg-white dark:bg-[#161c17] font-sans text-[#1e293b]">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-6 py-8 md:px-10"
      >
        {/* Welcome Section */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#1e293b] dark:text-white">
              Chào mừng trở lại, {user?.fullName?.split(" ")[0] || "bạn"}!
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <Flame className="font-bold text-[#fed963]" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                Bạn đang có chuỗi 7 ngày! Tiếp tục phát huy nhé! 🔥
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3c6d44]/10 p-2 text-[#3c6d44]">
                <Book className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bài học hoàn thành
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#1e293b] dark:text-white">
              24
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3c6d44]/10 p-2 text-[#3c6d44]">
                <Mic className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Từ vựng đã học
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#1e293b] dark:text-white">
              128
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#fed963]/10 p-2 text-[#fed963]">
                <Bolt className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Chuỗi hiện tại
              </p>
            </div>
            <p className="mt-2 text-3xl font-bold text-[#1e293b] dark:text-white">
              7 Ngày
            </p>
          </div>
        </motion.div>

        {/* Continue Learning Hero Card */}
        <motion.div variants={fadeInUp} className="w-full">
          <h2 className="mb-4 text-2xl font-bold text-[#1e293b] dark:text-white">
            Tiếp tục học
          </h2>
          <div className="relative flex flex-col items-center gap-10 overflow-hidden rounded-3xl bg-slate-900 p-8 dark:bg-black md:flex-row md:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#3c6d44] to-transparent opacity-20"></div>
            <div className="z-10 flex-1">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#fed963]">
                Phần 4 • Bài 2
              </p>
              <h3 className="mb-6 text-3xl font-black leading-tight text-white md:text-4xl">
                Ăn uống:
                <br />
                Gọi cà phê
              </h3>
              <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[65%] rounded-full bg-[#fed963]"></div>
              </div>
              <p className="mb-8 text-sm font-medium text-slate-300">
                Hoàn thành 65%
              </p>
              <Link
                to="/bat-dau"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3c6d44] px-8 py-4 font-bold text-white transition-all transform hover:scale-105 hover:bg-[#3c6d44]/90"
              >
                <Play className="h-5 w-5" /> Tiếp tục bài học
              </Link>
            </div>
            <div
              className="z-10 aspect-video w-full rounded-2xl bg-cover bg-center shadow-2xl md:w-1/3"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop')",
              }}
            ></div>
          </div>
        </motion.div>

        {/* Tools & Translation Section */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {/* Quick Tools Card */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-[#1e293b] dark:text-white">
              Thao tác nhanh
            </h2>
            <div className="flex flex-1 flex-col gap-4">
              <Link
                to="/bat-dau"
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl bg-[#3c6d44] p-8 text-white transition-all hover:shadow-lg hover:shadow-[#3c6d44]/20"
              >
                <div className="flex items-center gap-6">
                  <div className="rounded-2xl bg-white/20 p-4">
                    <Video className="h-9 w-9" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">Bắt đầu dịch mới</p>
                    <p className="text-sm opacity-80">
                      Dịch thủ ngữ sang văn bản thời gian thực
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" />
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/tu-dien"
                  className="group flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-[#3c6d44] dark:border-slate-800 dark:bg-slate-900"
                >
                  <Book className="mb-3 h-6 w-6 text-[#3c6d44] transition-transform group-hover:scale-110" />
                  <p className="font-bold text-[#1e293b] dark:text-white">
                    Từ điển
                  </p>
                </Link>
                <button className="group flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-[#3c6d44] dark:border-slate-800 dark:bg-slate-900">
                  <Users className="mb-3 h-6 w-6 text-[#3c6d44] transition-transform group-hover:scale-110" />
                  <p className="font-bold text-[#1e293b] dark:text-white">
                    Cộng đồng
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Translations */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#1e293b] dark:text-white">
                Bản dịch gần đây
              </h2>
              <Link
                className="text-sm font-bold text-[#3c6d44] hover:underline"
                to="#"
              >
                Xem lịch sử
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { text: "Bạn có khỏe không?", time: "2 giờ trước" },
                { text: "Tôi muốn gọi một ly cà phê sữa đá.", time: "Hôm qua" },
                { text: "Rất vui được gặp bạn.", time: "12 tháng 10" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <History className="h-5 w-5" />
                    </div>
                    <p className="font-semibold italic text-[#1e293b] dark:text-slate-200">
                      "{item.text}"
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommended Lessons Grid */}
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1e293b] dark:text-white">
              Gợi ý cho bạn
            </h2>
            <Link
              className="text-sm font-bold text-[#3c6d44] hover:underline"
              to="/khoa-hoc"
            >
              Khám phá tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "Chào hỏi cơ bản",
                level: "Cơ bản",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
              },
              {
                title: "Gia đình và bạn bè",
                level: "Cơ bản",
                img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop",
              },
              {
                title: "Cơ bản nơi công sở",
                level: "Trung cấp",
                img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
              },
            ].map((lesson, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className="aspect-video w-full rounded-2xl bg-cover bg-center"
                  style={{ backgroundImage: `url('${lesson.img}')` }}
                ></div>
                <div className="px-2">
                  <span className="rounded-md bg-[#3c6d44]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3c6d44]">
                    {lesson.level}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-[#1e293b] dark:text-white">
                    {lesson.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    Khám phá các ký hiệu liên quan đến chủ đề này.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;
