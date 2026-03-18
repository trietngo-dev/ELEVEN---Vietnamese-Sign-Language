import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  History, 
  Zap, 
  PlusCircle, 
  BookOpen,
  MoreHorizontal
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng người dùng', value: '12,450', change: '+12%', icon: <Users className="text-[#3c6c44]" />, trend: 'up' },
    { label: 'Bài học hoàn tất', value: '8,230', change: '+5%', icon: <CheckCircle2 className="text-yellow-600" />, trend: 'up' },
    { label: 'Yêu cầu dịch thuật', value: '145', change: '-2%', icon: <History className="text-[#3c6c44]" />, trend: 'down' },
    { label: 'Tỷ lệ chính xác AI', value: '98.2%', change: '+0.5%', icon: <Zap className="text-yellow-600" />, trend: 'up' },
  ];

  const recentActivity = [
    { user: 'Nguyễn Văn A', action: 'Hoàn thành bài học: Chào hỏi', time: '10 phút trước', status: 'Thành công' },
    { user: 'Trần Thị B', action: 'Đăng ký tài khoản mới', time: '25 phút trước', status: 'Thành công' },
    { user: 'Lê Văn C', action: 'Yêu cầu dịch: "Cảm ơn bạn"', time: '1 giờ trước', status: 'Đang xử lý' },
    { user: 'Phạm Minh D', action: 'Cập nhật hồ sơ cá nhân', time: '2 giờ trước', status: 'Thành công' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">Chào mừng quay trở lại, cập nhật lần cuối lúc 09:45 hôm nay.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#fed963] text-slate-900 font-semibold rounded-lg hover:opacity-90 transition-opacity">
            <BookOpen size={20} />
            <span className="text-sm">Cập nhật từ điển</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3c6c44] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
            <PlusCircle size={20} />
            <span className="text-sm">Thêm bài học mới</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`size-10 rounded-lg flex items-center justify-center ${index % 2 === 0 ? 'bg-[#3c6c44]/10' : 'bg-yellow-100'}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'text-[#3c6c44] bg-[#3c6c44]/10' : 'text-red-500 bg-red-50'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Hoạt động người dùng gần đây</h3>
            <button className="text-sm text-[#3c6c44] font-semibold hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Người dùng</th>
                  <th className="px-6 py-4 font-semibold">Hành động</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivity.map((activity, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{activity.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{activity.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{activity.time}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'Thành công' ? 'bg-[#3c6c44]/10 text-[#3c6c44]' : 'bg-yellow-100 text-slate-900'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Phân tích hệ thống</h3>
            <MoreHorizontal size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {/* Bars chart visualization */}
            <div className="flex items-end gap-2 h-48 w-full px-2">
              {[40, 60, 55, 80, 95, 75, 85].map((height, i) => (
                <div 
                  key={i}
                  className={`w-full rounded-t-lg transition-colors relative group ${i === 4 ? 'bg-[#3c6c44]' : 'bg-slate-100 hover:bg-[#3c6c44]/20'}`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Value
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] text-slate-400 font-bold uppercase">
              <span>Thứ 2</span>
              <span>Chủ nhật</span>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#3c6c44]"></span>
                <span className="text-sm text-slate-600">Lượt học mới</span>
              </div>
              <span className="text-sm font-bold">+24.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#fed963]"></span>
                <span className="text-sm text-slate-600">Độ ổn định AI</span>
              </div>
              <span className="text-sm font-bold">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
