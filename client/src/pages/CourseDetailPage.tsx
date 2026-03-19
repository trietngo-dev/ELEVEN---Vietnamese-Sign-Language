import { ArrowLeft, PlayCircle, CheckCircle2, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CourseDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="mx-auto max-w-5xl px-6 py-10">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-8 transition-colors">
          <ArrowLeft size={16} className="bg-slate-100 rounded-full p-1" /> Quay lại
        </button>

        {/* Hero & Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-10 mb-16">
          {/* Left: Course Info */}
          <div>
            <div className="relative w-full aspect-[2/1] rounded-3xl overflow-hidden mb-6 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
                alt="Giao tiếp cơ bản" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md rounded-full uppercase tracking-widest">
                  Cơ bản
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">Giao tiếp cơ bản</h1>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px]">
              Khóa học này cung cấp các kiến thức nền tảng về giao tiếp bằng ngôn ngữ ký hiệu trong đời sống hàng ngày, giúp bạn tự tin kết nối với cộng đồng người khiếm thính.
            </p>
          </div>

          {/* Right: Progress Card */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 h-fit">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-lg bg-[#eef7ee] flex items-center justify-center text-[#3c6d44]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span> 
              Tiến độ học tập
            </h3>
            
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hoàn thành</span>
                <span className="text-2xl font-black text-slate-800">5%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#fed963] w-[5%] rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bài học</p>
                <p className="text-[15px] font-bold text-slate-800">12 / 24</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian</p>
                <p className="text-[15px] font-bold text-slate-800">4.5 giờ</p>
              </div>
            </div>

            <Link to="/bai-hoc/1" className="w-full py-3.5 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center gap-2 font-bold hover:bg-[#315736] transition-all shadow-lg shadow-[#3c6d44]/20 hover:-translate-y-0.5">
               <PlayCircle size={18} /> Tiếp tục học ngay
            </Link>
          </div>
        </div>

        {/* Curriculum Section */}
        <div>
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-extrabold text-[#1f2937]">Nội dung khóa học</h2>
            <span className="text-sm font-medium text-slate-500">3 Học phần • 24 Bài giảng</span>
          </div>

          <div className="space-y-12">
            
            {/* Module 1 */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#f4fbf6] text-[#3c6d44] flex items-center justify-center text-xs font-black">1</span>
                Học phần 1: Chào hỏi & Giới thiệu
              </h3>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col divide-y divide-slate-50">
                
                {/* Lesson 1 */}
                <div className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 size={24} className="text-[#3c6d44] flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-[15px]">Bài 1: Các cử chỉ chào hỏi phổ biến</h4>
                      <p className="text-xs text-slate-400 mt-0.5">08:45 • Hoàn thành</p>
                    </div>
                  </div>
                  <Link to="/bai-hoc/1" className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50">
                    Xem lại
                  </Link>
                </div>

                {/* Lesson 2 */}
                <div className="p-5 flex items-center justify-between bg-[#fcfcf6]">
                  <div className="flex items-center gap-4">
                    <PlayCircle size={24} className="text-[#d9aa17] flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-[15px]">Bài 2: Cách giới thiệu bản thân</h4>
                      <p className="text-xs text-[#d9aa17] mt-0.5 font-medium">12:20 • Đang học</p>
                    </div>
                  </div>
                  <Link to="/bai-hoc/2" className="px-6 py-2 rounded-xl bg-[#3c6d44] text-white text-[13px] font-bold hover:bg-[#315736] shadow-sm">
                    Tiếp tục
                  </Link>
                </div>

              </div>
            </div>

            {/* Module 2 (Locked) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">2</span>
                  Học phần 2: Chữ cái & Con số
                </h3>
                <Link to="/nang-cap" className="text-[10px] font-bold uppercase tracking-widest bg-[#eef7ee] text-[#3c6d44] px-3 py-1 rounded-full flex items-center gap-1 border border-[#d4e4d8]">
                  <Lock size={10}/> Nâng cấp tài khoản
                </Link>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col divide-y divide-slate-50">
                
                {/* Lesson 3 */}
                <div className="p-5 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <Lock size={20} className="text-slate-400 flex-shrink-0 ml-1" />
                    <div>
                      <h4 className="font-bold text-slate-500 text-[15px]">Bài 3: Bảng chữ cái ký hiệu (Phần 1)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">15:00 • Đang khóa</p>
                    </div>
                  </div>
                  <Lock size={16} className="text-slate-300 mr-2" />
                </div>

                {/* Lesson 4 */}
                <div className="p-5 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-4">
                    <Lock size={20} className="text-slate-400 flex-shrink-0 ml-1" />
                    <div>
                      <h4 className="font-bold text-slate-500 text-[15px]">Bài 4: Bảng chữ cái ký hiệu (Phần 2)</h4>
                      <p className="text-xs text-slate-400 mt-0.5">14:30 • Đang khóa</p>
                    </div>
                  </div>
                  <Lock size={16} className="text-slate-300 mr-2" />
                </div>

              </div>
            </div>

             {/* Module 3 (Locked Sequential) */}
             <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">3</span>
                Học phần 3: Chủ đề Gia đình
              </h3>
              <div className="border border-dashed border-slate-200 rounded-3xl p-8 flex items-center justify-center text-center bg-slate-50/50">
                <p className="text-sm font-medium text-slate-400">Hoàn thành các bài học trước để mở khóa nội dung này</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
