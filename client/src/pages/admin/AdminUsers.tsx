import React, { useEffect, useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  UserCheck,
  Ban,
  Users,
  Loader2,
  Shield
} from 'lucide-react';
import { tokenStorage } from '../../lib/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface UserItem {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  status: number;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_MAP: Record<number, { label: string; dot: string; text: string }> = {
  0: { label: 'Chưa kích hoạt', dot: 'bg-slate-300', text: 'text-slate-400' },
  1: { label: 'Đang hoạt động', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  2: { label: 'Bị khóa', dot: 'bg-red-500', text: 'text-red-500' },
};

const ROLE_MAP: Record<number, string> = {
  1: 'Admin',
  2: 'Người dùng',
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const res = await fetch(`${API_BASE_URL}/api/users?page=${page}&pageSize=${pageSize}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.items || []);
          setTotalUsers(data.total || 0);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const filteredUsers = searchQuery.trim()
    ? users.filter(u =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // Compute stats from current data
  const activeCount = users.filter(u => u.status === 1).length;
  const disabledCount = users.filter(u => u.status === 2 || u.status === 0).length;

  const stats = [
    { label: 'Tổng người dùng', value: totalUsers.toLocaleString(), icon: <Users size={20} />, bg: 'bg-[#3c6c44]/10', text: 'text-[#3c6c44]' },
    { label: 'Hoạt động (trang này)', value: activeCount.toString(), icon: <UserCheck size={20} />, bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { label: 'Tổng trang', value: totalPages.toString(), icon: <TrendingUp size={20} />, bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Bị vô hiệu hóa', value: disabledCount.toString(), icon: <Ban size={20} />, bg: 'bg-slate-100', text: 'text-slate-600' },
  ];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              <p className="text-xl font-bold">{isLoading ? '—' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-slate-400" size={28} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tên người dùng</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tham gia</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const statusInfo = STATUS_MAP[user.status] || STATUS_MAP[0];
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#3c6c44]/10 flex items-center justify-center text-[#3c6c44] font-bold text-sm">
                            {(user.fullName || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.roleId === 1 ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {user.roleId === 1 && <Shield size={12} />}
                          {ROLE_MAP[user.roleId] || `Role ${user.roleId}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-sm">
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                          <span className={statusInfo.text}>{statusInfo.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      {searchQuery ? `Không tìm thấy người dùng với từ khóa "${searchQuery}"` : 'Chưa có người dùng nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-5 bg-slate-50 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hiển thị <span className="font-medium text-slate-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)}</span> trong <span className="font-medium text-slate-700">{totalUsers.toLocaleString()}</span> người dùng
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                      page === p
                        ? 'bg-[#3c6c44] text-white shadow-sm shadow-[#3c6c44]/20'
                        : 'border border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
