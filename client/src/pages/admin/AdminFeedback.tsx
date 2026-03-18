import React from 'react';
import { 
  Filter, 
  Download, 
  MessageSquare, 
  Star, 
  Clock, 
  Search, 
  Eye, 
  Reply, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const AdminFeedback: React.FC = () => {
  const feedbacks = [
    { name: 'Nguyễn Văn An', type: 'Góp ý', rating: 5, content: 'Dịch vụ rất tốt, giao hàng cực kỳ nhanh so với mong đợi của tôi...', date: '25/10/2023', status: 'Mới', avatar: 'NA' },
    { name: 'Trần Thị Bích', type: 'Khiếu nại', rating: 2, content: 'Sản phẩm bị móp nhẹ góc hộp khi nhận hàng. Cần đóng gói kỹ hơn.', date: '24/10/2023', status: 'Đã xem', avatar: 'TB' },
    { name: 'Lê Văn Cường', type: 'Hỏi đáp', rating: 4, content: 'Cho hỏi sản phẩm này có hỗ trợ trả góp qua thẻ tín dụng không?', date: '23/10/2023', status: 'Đã phản hồi', avatar: 'LC' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Phản hồi</h2>
          <p className="text-slate-500 mt-1">Theo dõi và xử lý ý kiến đóng góp từ khách hàng của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
            <Filter size={18} />
            Lọc dữ liệu
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3c6c44] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-[#3c6c44]/20">
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Tổng phản hồi', value: '1,284', change: '+12%', icon: <MessageSquare size={48} className="opacity-10 text-[#3c6c44]" />, color: 'text-[#3c6c44]' },
          { label: 'Đánh giá trung bình', value: '4.8/5', icon: <Star size={48} className="opacity-10 text-[#fed963]" />, hasStars: true },
          { label: 'Chưa xử lý', value: '42', change: '-5%', icon: <Clock size={48} className="opacity-10 text-orange-500" />, changeColor: 'text-orange-700' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 transition-colors">
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              {stat.change && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 ${stat.changeColor || 'text-emerald-700'}`}>{stat.change}</span>
              )}
            </div>
            {stat.hasStars && (
              <div className="flex items-center text-[#fed963] mt-1">
                {[...Array(4)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                <Star size={14} className="fill-current overflow-hidden relative" style={{clipPath: 'inset(0 50% 0 0)'}} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedback Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            Danh sách phản hồi mới nhất
            <span className="bg-[#3c6c44]/10 text-[#3c6c44] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Live</span>
          </h4>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:ring-[#3c6c44] focus:border-[#3c6c44] outline-none shadow-sm" 
              placeholder="Tìm kiếm người dùng..." 
              type="text"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Đánh giá</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feedbacks.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#3c6c44]/10 flex items-center justify-center font-bold text-[#3c6c44] text-xs">{f.avatar}</div>
                      <span className="text-sm font-semibold text-slate-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-600">{f.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-[#fed963] gap-0.5">
                      {[...Array(f.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-slate-600 truncate">{f.content}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{f.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      f.status === 'Mới' ? 'bg-blue-100 text-blue-700' : 
                      f.status === 'Đã xem' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                    }`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-[#3c6c44]/10 text-[#3c6c44] rounded transition-colors" title="Xem chi tiết"><Eye size={18} /></button>
                      <button className="p-1.5 hover:bg-[#3c6c44]/10 text-[#3c6c44] rounded transition-colors" title="Phản hồi"><Reply size={18} /></button>
                      <button className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors" title="Xóa"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/10">
          <p className="text-xs text-slate-500 font-medium">Hiển thị 1-10 của 1,284 phản hồi</p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all shadow-sm"><ChevronLeft size={16} /></button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#3c6c44] text-white font-bold text-xs shadow-md shadow-[#3c6c44]/20">1</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 font-bold text-xs transition-all">2</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 font-bold text-xs transition-all">3</button>
            <span className="px-2 text-slate-400 text-xs">...</span>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 font-bold text-xs transition-all">129</button>
            <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all shadow-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
