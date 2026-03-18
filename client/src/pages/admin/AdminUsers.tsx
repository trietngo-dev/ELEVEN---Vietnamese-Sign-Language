import React from 'react';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  UserCheck,
  Ban,
  Users
} from 'lucide-react';

const AdminUsers: React.FC = () => {
  const stats = [
    { label: 'Tổng người dùng', value: '1,284', icon: <Users size={20} />, bg: 'bg-[#3c6c44]/10', text: 'text-[#3c6c44]' },
    { label: 'Đang hoạt động', value: '1,150', icon: <UserCheck size={20} />, bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { label: 'Thêm mới tháng này', value: '+12%', icon: <TrendingUp size={20} />, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Bị vô hiệu hóa', value: '14', icon: <Ban size={20} />, bg: 'bg-slate-100', text: 'text-slate-600' },
  ];

  const users = [
    { name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', date: '12/10/2023', course: 'Giao tiếp cơ bản', status: 'Đang hoạt động', avatar: 'NA' },
    { name: 'Trần Minh', email: 'minh.tran@outlook.com', date: '15/10/2023', course: 'Ngôn ngữ ký hiệu 1', status: 'Đang hoạt động', avatar: 'TM' },
    { name: 'Lê Hoa', email: 'hoale@yahoo.com', date: '20/10/2023', course: 'Chưa đăng ký', status: 'Ngoại tuyến', avatar: 'LH' },
    { name: 'Phạm Duy', email: 'duypham@gmail.com', date: '05/11/2023', course: 'Từ vựng nâng cao', status: 'Bị khóa', avatar: 'PD' },
    { name: 'Hoàng Anh', email: 'anh.hoang@gmail.com', date: '10/11/2023', course: 'Giao tiếp cơ bản', status: 'Đang hoạt động', avatar: 'HA' },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý tài khoản và quyền truy cập của người dùng.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-[#3c6c44]/50 text-sm transition-all" 
              placeholder="Tìm kiếm tên, email..." 
              type="text"
            />
          </div>
          <button className="bg-[#3c6c44] hover:bg-[#3c6c44]/90 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold text-sm transition-all shadow-sm">
            <UserPlus size={18} />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.text} rounded-full flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên người dùng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tham gia</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khóa học hiện tại</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#3c6c44]/10 flex items-center justify-center text-[#3c6c44] font-bold text-sm">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-slate-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      {user.course}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'Đang hoạt động' ? 'bg-emerald-500' : 
                        user.status === 'Bị khóa' ? 'bg-red-500' : 'bg-slate-300'
                      }`}></span>
                      <span className={
                        user.status === 'Đang hoạt động' ? 'text-emerald-600' : 
                        user.status === 'Bị khóa' ? 'text-red-500' : 'text-slate-400'
                      }>{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-[#3c6c44] transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-5 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-700">1-5</span> trong <span className="font-medium text-slate-700">1,284</span> người dùng
          </p>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#3c6c44] text-white font-bold shadow-sm shadow-[#3c6c44]/20">1</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-all">2</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-all">3</button>
            <span className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
            <button className="px-3 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-all text-sm font-medium">128</button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
