import { useState } from "react";
import { ArrowLeft, Maximize, Bot, Bookmark, Share2, Info, ListChecks, Trophy, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AIPracticePopup from "../components/AIPracticePopup";
import videoXinChao from "../assets/videoCourse/W00489.mp4";

export default function LessonDetailPage() {
  const navigate = useNavigate();
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft size={16} className="bg-slate-100 rounded-full p-1" /> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            
            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black shadow-sm flex items-center justify-center">
              <video 
                src={videoXinChao} 
                controls 
                className="w-full h-full object-contain"
              />

              {/* AI Overlay Box */}
              {showAI && (
                <div className="absolute top-4 right-4 w-[280px] h-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-50 flex flex-col animate-in fade-in zoom-in duration-150">
                  <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100 shadow-sm z-10">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Bot size={16} className="text-[#3c6d44]"/> Trợ lý AI Điểm Trình</span>
                    <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full p-1 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 relative bg-slate-900 flex flex-col">
                    {/* KHU VỰC HIỂN THỊ AIPracticePopup (Chỉ Camera -> Review) */}
                    <AIPracticePopup 
                      word="Xin chào" 
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                <span className="text-xs font-bold ml-1">Chế độ chậm</span>
                <div className="w-8 h-4 rounded-full bg-white/30 ml-2 relative">
                   <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white"></div>
                </div>
              </div>
              <button className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <Maximize size={16} />
              </button>
            </div>

            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-4">
              <div>
                <h1 className="text-4xl font-extrabold text-[#1f2937] mb-3">Xin chào</h1>
                <div className="flex items-center gap-3">
                  <span className="bg-[#fef3c7] text-[#71540a] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Phiên âm: /sin tɕaw/</span>
                  <span className="text-sm font-medium text-slate-400">Cấp độ: Cơ bản</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAI(true)}
                  className="flex items-center gap-2 bg-[#3c6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#3c6d44]/20 hover:bg-[#315736] transition-all"
                >
                  <Bot size={18}/> Tương tác với AI
                </button>
                <button className="flex items-center gap-2 bg-[#3c6d44] text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md shadow-[#3c6d44]/20 hover:bg-[#315736] transition-all">
                  <Bookmark size={18} className="fill-current"/> Lưu từ
                </button>
                <button className="w-10 h-10 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                  <Share2 size={18}/>
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-slate-100 pt-8">
              
              {/* Ý nghĩa */}
              <div>
                <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-4">
                  <Info size={18} className="text-[#3c6d44]"/> Ý nghĩa & Sử dụng
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Dùng để bày tỏ sự biết ơn đối với người khác khi nhận được sự giúp đỡ hoặc một điều tốt đẹp nào đó. Đây là một trong những thủ ngữ cơ bản và lịch sự nhất.
                </p>
                <div className="bg-[#f4fbf6] border-l-4 border-[#3c6d44] p-4 rounded-r-2xl">
                  <p className="text-sm font-semibold text-[#3c6d44] italic">"Cảm ơn bạn đã hỗ trợ tôi hoàn thành công việc này."</p>
                </div>
              </div>

              {/* Mẹo thực hiện */}
              <div>
                <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-4">
                  <ListChecks size={18} className="text-[#3c6d44]"/> Mẹo thực hiện
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">1</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Đặt các ngón tay khép lại, lòng bàn tay hướng về phía miệng.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">2</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Di chuyển bàn tay ra xa miệng theo hướng người đối diện.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">3</span>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mt-0.5">Kết hợp với nét mặt mỉm cười nhẹ nhàng để thể hiện sự chân thành.</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col gap-6">
            
            {/* Từ vựng liên quan */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-[#1f2937] flex items-center gap-2 mb-6">
                <span className="text-[#d9aa17]">✨</span> Từ vựng liên quan
              </h3>
              
              <div className="flex flex-col gap-5 mb-6">
                
                <div className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-[#fdf8e9] flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    🙅‍♂️
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-[#3c6d44] transition-colors">Không có chi</h4>
                    <p className="text-[11px] font-medium text-slate-400">Giao tiếp • Cơ bản</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-[#eadecd] flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    🙏
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-[#3c6d44] transition-colors">Xin lỗi</h4>
                    <p className="text-[11px] font-medium text-slate-400">Giao tiếp • Cơ bản</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-[#eef7ee] flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    👋
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-[#3c6d44] transition-colors">Xin chào</h4>
                    <p className="text-[11px] font-medium text-slate-400">Giao tiếp • Cơ bản</p>
                  </div>
                </div>

              </div>
              
              <button className="w-full text-center text-sm font-bold text-[#3c6d44] hover:underline">
                Xem tất cả chủ đề
              </button>
            </div>

            {/* Daily Challenge */}
            <div className="bg-[#f4fbf6] rounded-[32px] border border-[#eef7ee] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3c6d44]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="text-sm font-extrabold text-[#3c6d44] mb-2 relative z-10">Thử thách hàng ngày</h3>
              <p className="text-xs text-[#3c6d44]/70 font-medium mb-6 relative z-10 leading-relaxed">
                Hoàn thành 5 từ vựng giao tiếp để nhận huy hiệu mới!
              </p>
              
              <div className="relative z-10">
                <div className="w-full h-2 bg-[#d4e4d8] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[#3c6d44] w-[60%] rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#3c6d44]">
                  <span>3/5 hoàn thành</span>
                  <span>60%</span>
                </div>
              </div>
              
              <Trophy size={100} strokeWidth={1} className="absolute -bottom-6 -right-6 text-[#3c6d44]/10 transform -rotate-12 pointer-events-none"/>
            </div>

             {/* Next Button */}
             <button className="w-full py-4 rounded-2xl bg-[#3c6d44] text-white flex items-center justify-center font-bold hover:bg-[#315736] transition-all shadow-xl shadow-[#3c6d44]/20 hover:-translate-y-0.5">
               Từ tiếp theo
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
