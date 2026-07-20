import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Eye, ChevronLeft, ChevronRight, BookOpen, Edit, Trash2, Check, X, AlertTriangle } from "lucide-react";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import CourseDetailModal from "./CourseDetailModal";
import { tokenStorage } from "../../lib/auth";
import CourseImage from "../../components/CourseImage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AdminCourses: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [viewingCourse, setViewingCourse] = useState<any>(null);
  
  // Custom Modal / Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  // Dynamic filter, visits, and pagination states
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      // Fetch courses
      const res = await fetch(`${API_BASE_URL}/api/courses`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.items || []);
      }

      // Fetch user progress for total visits (attempts count)
      try {
        const progressRes = await fetch(`${API_BASE_URL}/api/user_lesson_progress?pageSize=10000`, { headers });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const items = progressData.items || (Array.isArray(progressData) ? progressData : []);
          const sumVisits = items.reduce((sum: number, item: any) => sum + (item.attemptsCount || 1), 0);
          setTotalVisits(sumVisits);
        }
      } catch (err) {
        console.error("Lỗi khi tải lượt truy cập bài học", err);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (course: any) => {
    try {
      const authToken = tokenStorage.getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {})
      };
      
      const endpoint = course.status === 1 
        ? `${API_BASE_URL}/api/courses/${course.id}/unpublish` 
        : `${API_BASE_URL}/api/courses/${course.id}/publish`;
        
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ updatedBy: 1 })
      });
      
      if (res.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: `Đã ${course.status === 1 ? 'hủy xuất bản' : 'xuất bản'} khóa học "${course.title}" thành công.`
        });
        fetchCourses();
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Lỗi xuất bản!',
          message: 'Lỗi khi thay đổi trạng thái xuất bản.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: 'Đã xảy ra lỗi khi kết nối với máy chủ.'
      });
    }
  };

  const handleDeleteCourse = (course: any) => {
    setNotification({
      isOpen: true,
      type: 'confirm',
      title: 'Xác nhận xóa khóa học',
      message: `Bạn có chắc chắn muốn xóa khóa học "${course.title}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => executeDeleteCourse(course)
    });
  };

  const executeDeleteCourse = async (course: any) => {
    setNotification(null);
    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        method: "DELETE",
        headers
      });
      
      if (res.ok) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Thành công!',
          message: `Đã xóa khóa học "${course.title}" thành công.`
        });
        fetchCourses();
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Không thể xóa!',
          message: 'Lỗi khi xóa khóa học. Có thể khóa học này đang có dữ liệu liên quan.'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Lỗi kết nối!',
        message: 'Đã xảy ra lỗi khi kết nối với máy chủ.'
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filterStatus === 'published') return course.status === 1;
    if (filterStatus === 'draft') return course.status === 0;
    return true;
  });

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý bài học
          </h2>
          <p className="text-slate-500 mt-1">
            Quản lý và cập nhật nội dung các khóa học ngôn ngữ ký hiệu.
          </p>
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${
              filterStatus === 'all' 
                ? 'bg-white shadow-sm font-bold text-[#3c6c44]' 
                : 'font-medium text-slate-500 hover:text-slate-700'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilterStatus('published')}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${
              filterStatus === 'published' 
                ? 'bg-white shadow-sm font-bold text-[#3c6c44]' 
                : 'font-medium text-slate-500 hover:text-slate-700'
            }`}
          >
            Đã xuất bản
          </button>
          <button 
            onClick={() => setFilterStatus('draft')}
            className={`px-6 py-2 rounded-lg text-sm transition-all ${
              filterStatus === 'draft' 
                ? 'bg-white shadow-sm font-bold text-[#3c6c44]' 
                : 'font-medium text-slate-500 hover:text-slate-700'
            }`}
          >
            Bản nháp
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng khóa học", value: courses.length.toString(), icon: <BookOpen size={16} /> },
          { label: "Đang hoạt động", value: courses.filter(c => c.status === 1).length.toString(), color: "text-[#3c6c44]" },
          { label: "Lượt truy cập (các bài học)", value: totalVisits.toString() },
          { label: "Tỷ lệ hoàn thành", value: "86%" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${stat.color || ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-10 flex justify-center text-slate-500">Đang tải dữ liệu...</div>
        ) : paginatedCourses.map((course, i) => (
          <div
            key={course.id || i}
            className={`bg-white rounded-2xl overflow-hidden border border-slate-100 group flex flex-col shadow-sm transition-all hover:shadow-md ${course.status === 0 ? "opacity-80" : ""}`}
          >
            <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden group">
              <CourseImage 
                title={course.title} 
                coverMediaId={course.coverMediaId} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-[#3c6c44] shadow-sm uppercase tracking-wide">
                {course.level || "CƠ BẢN"}
              </div>
              <div
                className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase ${course.status === 0 ? "bg-slate-400" : "bg-green-500"}`}
              >
                {course.status === 0 ? "Bản nháp" : (course.status === 1 ? "Đã xuất bản" : "Lưu trữ")}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold leading-tight line-clamp-1">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                <BookOpen size={14} />
                ID: {course.id}
              </p>
              <div className="mt-auto pt-6 flex gap-2">
                <button 
                  onClick={() => setEditingCourse(course)}
                  className="flex-1 bg-[#3c6c44] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#3c6c44]/90 transition-colors flex items-center justify-center gap-1 cursor-pointer pointer-events-auto"
                >
                  <Edit size={14} /> Sửa
                </button>
                <button 
                  onClick={() => handleTogglePublish(course)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer pointer-events-auto ${course.status === 1 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                   {course.status === 1 ? "Huỷ XB" : "XBản"}
                </button>
                <button 
                  onClick={() => setViewingCourse(course)}
                  className="p-2 border border-slate-200 text-[#3c6c44] rounded-xl hover:bg-slate-50 cursor-pointer pointer-events-auto"
                  title="Xem chi tiết"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course)}
                  className="p-2 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer pointer-events-auto"
                  title="Xóa khóa học"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 transition-all group min-h-[300px]"
        >
          <div className="w-14 h-14 rounded-full bg-[#3c6c44]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={28} className="text-[#3c6c44]" />
          </div>
          <p className="font-bold text-[#3c6c44]">Thêm khóa học mới</p>
          <p className="text-sm text-slate-400 mt-1">
            Tạo giáo trình mới của bạn
          </p>
        </button>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-bold">{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</span> trong số{" "}
            <span className="font-bold">{totalItems}</span> khóa học
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    currentPage === page 
                      ? 'bg-[#3c6c44] text-white shadow-md shadow-[#3c6c44]/20' 
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCourses();
        }} 
      />
      
      <EditCourseModal 
        isOpen={!!editingCourse}
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSuccess={() => {
          setEditingCourse(null);
          fetchCourses();
        }}
      />

      <CourseDetailModal 
        isOpen={!!viewingCourse}
        course={viewingCourse}
        onClose={() => setViewingCourse(null)}
      />

      {/* Custom Confirmation / Alert Modal */}
      <AnimatePresence>
        {notification && notification.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl max-w-sm w-full text-center relative"
            >
              {notification.type !== 'confirm' && (
                <button
                  onClick={() => setNotification(null)}
                  className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              )}

              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : notification.type === 'confirm'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {notification.type === 'success' ? (
                  <Check size={20} strokeWidth={3} />
                ) : notification.type === 'confirm' ? (
                  <AlertTriangle size={20} strokeWidth={2.5} className="text-amber-500" />
                ) : (
                  <X size={20} strokeWidth={3} />
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{notification.title}</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">{notification.message}</p>

              {notification.type === 'confirm' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setNotification(null)}
                    className="flex-1 py-3 text-sm text-slate-500 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (notification.onConfirm) {
                        notification.onConfirm();
                      }
                    }}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-600/20 hover:shadow-xl transition-all text-sm"
                  >
                    Xóa ngay
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setNotification(null)}
                  className={`w-full py-3 font-bold rounded-2xl transition-all shadow-md text-sm ${
                    notification.type === 'success'
                      ? 'bg-[#3c6c44] text-white hover:bg-[#315736] shadow-[#3c6c44]/20'
                      : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                  }`}
                >
                  Đồng ý
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;
