import React from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  PlayCircle, 
  VideoOff, 
  Upload, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Eye
} from 'lucide-react';

const AdminVocabulary: React.FC = () => {
  const words = [
    { name: 'Xin chào', desc: 'Chào hỏi cơ bản', category: 'Giao tiếp', status: 'Hoạt động', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBF0SATNHCh31BxoH8LqleleFoBTTABGrjekixVaCMMwZknN3hj6ZRHXV1_YGRakKqVI2e5VKOmxPbUKJui6_3tZLgbAkCJZR3cNhdmwl0aW-2vOA005347Mqujr4t-ch8sn6bBzeutGBlf17uLNsqt9pXba1mJ9q4fpS9xqlahUfMqfzNOAhbDoSxK35Hsn3svysvU0Yh924MHyC6rzkhu4An-0QUplI5zA_OKVdXY0YSVndY5MHgGj1AJu0GDkl6W6FtY9gY0IPYI' },
    { name: 'Cảm ơn', desc: 'Lời cảm kích', category: 'Giao tiếp', status: 'Hoạt động', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMCUTcqh5GNHnUXGBBZPq0447PR_WaHI_53jvn6XgWDzqJXlylPTGaPr70RMIFmno0a2nxWp_u4T-jUVmMjuXj_YApBTfjdEC-CQH4RSBjVy4tnFvdNsEC2ntjCKVu2YEMSjUyCwOWxnva1FOWnjxVxrH1k1y9L0sC0U1Vu5hDL2bGI5LACfxfR7eK4JTh0ELC5vJKZdtdnJlgFlvfOm95oiH2I89ZgdwglPZEfJJ4Lan8KwNgUt-eEphBudIZgWCcTTZmlJkQ6S_9' },
    { name: 'Gia đình', desc: 'Từ vựng người thân', category: 'Gia đình', status: 'Đang chờ video', noVideo: true },
    { name: 'Bác sĩ', desc: 'Nghề nghiệp y tế', category: 'Y tế', status: 'Nháp', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKNJ3umrjrnxpUlmydmq5DkEouMVrn7_DX8WznU2Z9N0ageNTDnR81E490U_wOx0eXWnLhLzNHyv2q-xuY4PUThOZpc4Mf0-_NMV0-AuJeM0l0Gzo05uXpRaVGn4qP4U7II0nqvHDBSAUYHQCKkmScXIT6BzEnkAVawsnEnJyk_exWyzKpjUI0vzL-vDcs6y0wVn9_JJ3KB_81a1iui0eAOio3G0BAyzrYSXGrUDI3Q_ZwbV9Ft8JIdwfi_f7paZqwXogJS8NrMkkI', draft: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Thư viện từ vựng</h3>
            <p className="text-slate-500">Quản lý và cập nhật nội dung video học ngôn ngữ ký hiệu.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3c6c44] transition-colors size-5" />
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-[#3c6c44] rounded-xl transition-all shadow-sm outline-none" 
                placeholder="Tìm kiếm từ vựng hoặc mô tả..." 
                type="text"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3c6c44] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#3c6c44]/20 transition-all active:scale-[0.98]">
              <Plus size={20} />
              <span>Thêm từ mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <button className="px-5 py-2 rounded-full bg-[#3c6c44] text-white text-sm font-bold shadow-md shadow-[#3c6c44]/20">Tất cả (248)</button>
        {['Giao tiếp', 'Gia đình', 'Học tập', 'Y tế', 'Công việc'].map((cat) => (
          <button key={cat} className="px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:border-[#3c6c44] transition-all">
            {cat}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Từ vựng</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phân loại</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Video mô tả</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {words.map((word, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900">{word.name}</span>
                    <span className="text-xs text-slate-500">{word.desc}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    word.category === 'Giao tiếp' ? 'bg-blue-50 text-blue-600' : 
                    word.category === 'Gia đình' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {word.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {word.noVideo ? (
                    <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                      <VideoOff size={16} />
                      <span>Chưa có video</span>
                    </div>
                  ) : (
                    <div className="relative w-24 h-14 rounded-lg bg-slate-200 overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="text-white" size={24} />
                      </div>
                      <img src={word.image} alt={word.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 font-bold text-xs ${
                    word.status === 'Hoạt động' ? 'text-green-600' : 
                    word.status === 'Đang chờ video' ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      word.status === 'Hoạt động' ? 'bg-green-500' : 
                      word.status === 'Đang chờ video' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                    }`}></span>
                    {word.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {word.noVideo ? (
                      <button className="flex items-center gap-1 px-3 py-1 bg-[#3c6c44]/10 text-[#3c6c44] rounded-lg hover:bg-[#3c6c44] hover:text-white transition-all text-xs font-bold">
                        <Upload size={14} /> Tải lên
                      </button>
                    ) : (
                      <button className="p-2 text-slate-400 hover:text-[#3c6c44] hover:bg-[#3c6c44]/10 rounded-lg transition-all">
                        <Edit3 size={18} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination placeholder */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Hiển thị 1 - 4 của 248 kết quả</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30" disabled><ChevronLeft size={20} /></button>
            <button className="w-8 h-8 rounded-lg bg-[#3c6c44] text-white text-sm font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 text-sm font-semibold">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 text-sm font-semibold">3</button>
            <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* Footer Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Tổng số từ vựng</p>
          <p className="text-3xl font-black text-[#3c6c44]">2,482</p>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold gap-1">
            <TrendingUp size={14} />
            <span>+12% so với tháng trước</span>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Video đã tải</p>
          <p className="text-3xl font-black text-slate-900">2,150</p>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#3c6c44] rounded-full w-[86%]"></div>
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium text-right">86% hoàn thành</p>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Lượt xem thư viện</p>
          <p className="text-3xl font-black text-slate-900">45.2K</p>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-bold gap-1">
            <Eye size={14} />
            <span>Lượt truy cập trong 30 ngày qua</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVocabulary;
