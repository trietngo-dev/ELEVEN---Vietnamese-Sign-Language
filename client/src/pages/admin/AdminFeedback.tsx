import React, { useEffect, useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Star, 
  Clock, 
  Search, 
  Eye, 
  Reply, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  X,
  SendHorizontal
} from 'lucide-react';
import { tokenStorage } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface FeedbackItem {
  id: number;
  userId: number;
  categoryId: number;
  rating: number;
  subject: string | null;
  content: string;
  status: number; // 0 = New, 1 = InReview, 2 = Responded, 3 = Closed
  adminReply: string | null;
  respondedBy: number | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userFullName: string | null;
  userAvatarUrl: string | null;
  courseTitle: string | null;
}

interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const AdminFeedback: React.FC = () => {
  const { user } = useAuth();
  
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter/tab states
  const [activeTab, setActiveTab] = useState<'course' | 'support'>('course');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reply Modal States
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // View Details Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewFeedback, setViewFeedback] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        const authToken = tokenStorage.getToken();
        const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const [catRes, feedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/feedback_categories?pageSize=100`, { headers }),
          fetch(`${API_BASE_URL}/api/feedbacks?pageSize=1000`, { headers })
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.items || []);
        }

        if (feedRes.ok) {
          const feedData = await feedRes.json();
          setFeedbacks(feedData.items || []);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu phản hồi admin", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const courseCategoryId = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'course')?.id || null;
  }, [categories]);

  const supportCategoryId = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'support')?.id || null;
  }, [categories]);

  // Compute tabs
  const filteredTabFeedbacks = useMemo(() => {
    let targetCatId = activeTab === 'course' ? courseCategoryId : supportCategoryId;
    let list = feedbacks.filter(f => f.categoryId === targetCatId);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => 
        (f.userFullName && f.userFullName.toLowerCase().includes(q)) ||
        (f.content && f.content.toLowerCase().includes(q)) ||
        (f.subject && f.subject.toLowerCase().includes(q)) ||
        (f.courseTitle && f.courseTitle.toLowerCase().includes(q))
      );
    }

    // Rating filter (only relevant for course tab reviews)
    if (activeTab === 'course' && selectedRatingFilter !== 'all') {
      const rNum = parseInt(selectedRatingFilter);
      list = list.filter(f => f.rating === rNum);
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedbacks, activeTab, courseCategoryId, supportCategoryId, searchQuery, selectedRatingFilter]);

  // Dynamic Pagination items
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTabFeedbacks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTabFeedbacks, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTabFeedbacks.length / itemsPerPage));

  // Top Statistics Card Calculations
  const stats = useMemo(() => {
    const total = feedbacks.length;
    
    // Average rating for course reviews
    const courseReviews = feedbacks.filter(f => f.categoryId === courseCategoryId);
    const avg = courseReviews.length > 0
      ? Math.round((courseReviews.reduce((sum, f) => sum + f.rating, 0) / courseReviews.length) * 10) / 10
      : 0;

    // Pending support tickets (New = 0 or InReview = 1)
    const supportTickets = feedbacks.filter(f => f.categoryId === supportCategoryId);
    const pending = supportTickets.filter(t => t.status === 0 || t.status === 1).length;

    return { total, avg, pending };
  }, [feedbacks, courseCategoryId, supportCategoryId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    if (!adminReplyText.trim()) {
      setReplyError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const res = await fetch(`${API_BASE_URL}/api/feedbacks/${selectedFeedback.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          categoryId: selectedFeedback.categoryId,
          rating: selectedFeedback.rating,
          subject: selectedFeedback.subject,
          content: selectedFeedback.content,
          status: 2, // Responded status
          adminReply: adminReplyText.trim(),
          respondedBy: user?.id || 1,
          respondedAt: new Date().toISOString()
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gửi phản hồi thất bại.");
      }

      const updatedData = await res.json();
      
      // Update local state
      setFeedbacks(prev => prev.map(f => f.id === selectedFeedback.id ? updatedData : f));
      setAdminReplyText("");
      setShowReplyModal(false);
      setSelectedFeedback(null);
    } catch (err: any) {
      console.error(err);
      setReplyError(err.message || "Lỗi kết nối mạng.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteFeedback = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const res = await fetch(`${API_BASE_URL}/api/feedbacks/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error("Xóa phản hồi thất bại. Vui lòng thử lại.");
      }

      // Update state
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Lỗi kết nối mạng.");
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700">Mới</span>;
      case 1:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-orange-100 text-orange-700">Đang xử lý</span>;
      case 2:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700">Đã phản hồi</span>;
      case 3:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">Đã đóng</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">Không rõ</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#3c6c44] size-10" />
        <p className="text-slate-500 font-medium text-sm">Đang tải danh sách phản hồi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý Phản hồi & Đánh giá</h2>
          <p className="text-slate-500 mt-1">Theo dõi, phản hồi ý kiến đánh giá khóa học của học viên và trả lời các yêu cầu hỗ trợ.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-colors">
            <MessageSquare size={48} className="opacity-10 text-[#3c6c44]" />
          </div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Tổng phản hồi</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-colors">
            <Star size={48} className="opacity-10 text-[#fed963]" />
          </div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Đánh giá khóa học trung bình</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">{stats.avg > 0 ? `${stats.avg}/5` : 'Chưa có'}</h3>
          </div>
          {stats.avg > 0 && (
            <div className="flex items-center text-[#fed963] mt-1 gap-0.5">
              {[...Array(5)].map((_, j) => {
                const isGold = j < Math.round(stats.avg);
                return <Star key={j} size={14} fill={isGold ? "currentColor" : "none"} className={isGold ? "text-[#fed963]" : "text-slate-200"} />;
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-colors">
            <Clock size={48} className="opacity-10 text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Yêu cầu hỗ trợ chưa xử lý</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.pending}</h3>
        </div>
      </div>

      {/* Tabs Controller & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => {
              setActiveTab('course');
              setCurrentPage(1);
            }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'course' 
                ? "bg-white text-[#3c6c44] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Đánh giá khóa học
          </button>
          <button
            onClick={() => {
              setActiveTab('support');
              setCurrentPage(1);
            }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'support'
                ? "bg-white text-[#3c6c44] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Yêu cầu hỗ trợ
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Rating filter for course tab */}
          {activeTab === 'course' && (
            <div className="relative">
              <select
                value={selectedRatingFilter}
                onChange={(e) => {
                  setSelectedRatingFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-2 text-sm border border-slate-200 bg-white rounded-lg outline-none focus:border-[#3c6c44]"
              >
                <option value="all">Lọc theo số sao</option>
                <option value="5">5 Sao</option>
                <option value="4">4 Sao</option>
                <option value="3">3 Sao</option>
                <option value="2">2 Sao</option>
                <option value="1">1 Sao</option>
              </select>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input 
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 bg-white rounded-lg focus:ring-[#3c6c44] focus:border-[#3c6c44] outline-none shadow-sm" 
              placeholder="Tìm kiếm người dùng, nội dung..." 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Feedback Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Học viên</th>
                {activeTab === 'course' ? (
                  <>
                    <th className="px-6 py-4">Khóa học</th>
                    <th className="px-6 py-4">Đánh giá</th>
                  </>
                ) : (
                  <th className="px-6 py-4">Chủ đề hỗ trợ</th>
                )}
                <th className="px-6 py-4">Nội dung phản hồi</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFeedbacks.length > 0 ? (
                paginatedFeedbacks.map((f) => {
                  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(f.userFullName || "User")}&background=3c6c44&color=fff`;
                  const avatar = f.userAvatarUrl || defaultAvatar;
                  const formattedDate = new Date(f.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                  });

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatar}
                            alt={f.userFullName || "User"}
                            className="h-8 w-8 rounded-full object-cover bg-slate-100"
                          />
                          <span className="text-sm font-semibold text-slate-900 max-w-[130px] truncate">{f.userFullName || "Ẩn danh"}</span>
                        </div>
                      </td>

                      {activeTab === 'course' ? (
                        <>
                          {/* Course title */}
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate block" title={f.courseTitle || ''}>
                              {f.courseTitle || `Khóa học #${f.subject?.split(':')[1] || ''}`}
                            </span>
                          </td>
                          {/* Rating stars */}
                          <td className="px-6 py-4">
                            <div className="flex items-center text-[#fed963] gap-0.5">
                              {[...Array(f.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                              {[...Array(5 - f.rating)].map((_, j) => <Star key={j} size={12} className="text-slate-200" />)}
                            </div>
                          </td>
                        </>
                      ) : (
                        /* Topic */
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-bold bg-[#eef7ef] text-[#3c6d44] max-w-[150px] truncate" title={f.subject || ''}>
                            {f.subject || 'Khác'}
                          </span>
                        </td>
                      )}

                      {/* Content excerpt */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-slate-600 truncate" title={f.content}>{f.content}</p>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 text-sm text-slate-500">{formattedDate}</td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(f.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setViewFeedback(f);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 hover:bg-[#3c6c44]/10 text-[#3c6c44] rounded transition-colors" 
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedFeedback(f);
                              setAdminReplyText(f.adminReply || '');
                              setReplyError(null);
                              setShowReplyModal(true);
                            }}
                            className="p-1.5 hover:bg-[#3c6c44]/10 text-[#3c6c44] rounded transition-colors" 
                            title="Phản hồi"
                          >
                            <Reply size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFeedback(f.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors" 
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={activeTab === 'course' ? 7 : 6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Không tìm thấy phản hồi hoặc đánh giá nào thỏa mãn điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredTabFeedbacks.length > 0 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/10">
            <p className="text-xs text-slate-500 font-bold">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTabFeedbacks.length)} của {filteredTabFeedbacks.length} phản hồi
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, pageIdx) => {
                const pageNum = pageIdx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                      currentPage === pageNum
                        ? "bg-[#3c6c44] text-white shadow-md shadow-[#3c6c44]/20"
                        : "hover:bg-white text-slate-600"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] max-w-[550px] w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowReplyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Phản hồi của Giáo viên / Admin</h3>
            <p className="text-xs text-slate-400 mb-5">Đánh giá và viết câu trả lời chính thức của bạn cho học viên.</p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-sm mb-5 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
                <span>Học viên: {selectedFeedback.userFullName || 'Ẩn danh'}</span>
                <span>{new Date(selectedFeedback.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <p className="text-slate-700 font-semibold italic">"{selectedFeedback.content}"</p>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label htmlFor="admin-reply-content" className="block text-sm font-bold text-slate-600 mb-2">Nội dung phản hồi chính thức</label>
                <textarea
                  id="admin-reply-content"
                  rows={5}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi chính thức cho học viên tại đây..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm bg-slate-50 focus:border-[#3c6d44] focus:bg-white outline-none transition-colors"
                />
              </div>

              {replyError && (
                <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  {replyError}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-6 py-2.5 bg-[#3c6c44] hover:bg-[#315736] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#3c6c44]/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={16} /> Gửi phản hồi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] max-w-[550px] w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chi tiết phản hồi #{viewFeedback.id}</h3>
            <p className="text-xs text-slate-400 mb-6">Thông tin chi tiết về phản hồi gửi bởi người dùng hệ thống.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Học viên</p>
                  <p className="text-sm font-semibold text-slate-800">{viewFeedback.userFullName || 'Ẩn danh'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày gửi</p>
                  <p className="text-sm font-semibold text-slate-800">{new Date(viewFeedback.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Loại danh mục</p>
                  <p className="text-sm font-semibold text-slate-800">{activeTab === 'course' ? 'Đánh giá khóa học' : 'Yêu cầu hỗ trợ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {activeTab === 'course' ? 'Đánh giá số sao' : 'Chủ đề chi tiết'}
                  </p>
                  {activeTab === 'course' ? (
                    <div className="flex text-[#fed963] gap-0.5">
                      {[...Array(viewFeedback.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                      {[...Array(5 - viewFeedback.rating)].map((_, j) => <Star key={j} size={14} className="text-slate-200" />)}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-[#3c6d44]">{viewFeedback.subject || 'Khác'}</p>
                  )}
                </div>
              </div>

              {activeTab === 'course' && (
                <div className="border-b border-slate-100 pb-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Khóa học được đánh giá</p>
                  <p className="text-sm font-semibold text-slate-800">{viewFeedback.courseTitle || `Khóa học #${viewFeedback.subject?.split(':')[1]}`}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nội dung chi tiết</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {viewFeedback.content}
                </div>
              </div>

              {viewFeedback.adminReply && (
                <div>
                  <p className="text-[10px] font-bold text-[#3c6d44] uppercase tracking-wider mb-1">Nội dung phản hồi của Admin</p>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {viewFeedback.adminReply}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-[#3c6c44] hover:bg-[#315736] text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
