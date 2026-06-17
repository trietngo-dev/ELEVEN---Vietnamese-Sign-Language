import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  BookOpen, 
  PlusCircle, 
  MoreHorizontal,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { tokenStorage } from '../../lib/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  publishedCourses: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const [usersRes, coursesRes, lessonsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users?page=1&pageSize=10`, { headers }),
          fetch(`${API_BASE_URL}/api/courses`, { headers }),
          fetch(`${API_BASE_URL}/api/lessons?page=1&pageSize=1`, { headers }),
        ]);

        let totalUsers = 0;
        let users: any[] = [];
        if (usersRes.ok) {
          const data = await usersRes.json();
          const allFetched = data.items || [];
          const nonAdmins = allFetched.filter((u: any) => u.roleId !== 1);
          users = nonAdmins.slice(0, 5);
          const adminCount = allFetched.length - nonAdmins.length;
          totalUsers = Math.max(0, (data.total || 0) - adminCount);
        }

        let totalCourses = 0;
        let publishedCourses = 0;
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          const items = data.items || [];
          totalCourses = items.length;
          publishedCourses = items.filter((c: any) => c.status === 1 || c.status === "Published").length;
        }

        let totalLessons = 0;
        if (lessonsRes.ok) {
          const data = await lessonsRes.json();
          totalLessons = data.total || 0;
        }

        setStats({ totalUsers, totalCourses, totalLessons, publishedCourses });
        setRecentUsers(users);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = stats ? [
    { label: 'Tổng người dùng', value: stats.totalUsers.toLocaleString(), icon: <Users className="text-[#3c6c44]" />, bg: 'bg-[#3c6c44]/10' },
    { label: 'Tổng khóa học', value: stats.totalCourses.toString(), icon: <BookOpen className="text-[#3c6c44]" />, bg: 'bg-[#3c6c44]/10' },
    { label: 'Tổng bài học', value: stats.totalLessons.toString(), icon: <GraduationCap className="text-yellow-600" />, bg: 'bg-yellow-100' },
    { label: 'Đã xuất bản', value: stats.publishedCourses.toString(), icon: <CheckCircle2 className="text-yellow-600" />, bg: 'bg-yellow-100' },
  ] : [];

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { label: 'Hoạt động', color: 'bg-[#3c6c44]/10 text-[#3c6c44]' };
      case 1: return { label: 'Chưa kích hoạt', color: 'bg-slate-100 text-slate-600' };
      case 2: return { label: 'Bị khóa', color: 'bg-red-100 text-red-600' };
      case 3: return { label: 'Chờ kích hoạt', color: 'bg-amber-100 text-amber-600' };
      default: return { label: 'Không xác định', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">
            Dữ liệu thống kê thời gian thực từ hệ thống.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3c6c44] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={20} />
            <span className="text-sm">Thêm bài học mới</span>
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-slate-100 mb-4" />
              <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
              <div className="h-7 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col gap-4">
              <div className={`size-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Người dùng mới đăng ký</h3>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Người dùng</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Ngày tham gia</th>
                    <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.length > 0 ? recentUsers.map((user: any) => {
                    const statusInfo = getStatusLabel(user.status);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#3c6c44]/10 flex items-center justify-center text-[#3c6c44] font-bold text-xs">
                              {(user.fullName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-700 text-sm">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{getTimeAgo(user.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                        Chưa có người dùng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {height}%
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
                <span className="text-sm text-slate-600">Tổng khóa học</span>
              </div>
              <span className="text-sm font-bold">{stats?.totalCourses ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#fed963]"></span>
                <span className="text-sm text-slate-600">Tổng bài học</span>
              </div>
              <span className="text-sm font-bold">{stats?.totalLessons ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
