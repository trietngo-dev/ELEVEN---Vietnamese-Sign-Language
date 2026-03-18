import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, PlayCircle, Clock3, MoreVertical, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, BookOpen, Edit } from "lucide-react";
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

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const res = await fetch(`${API_BASE_URL}/api/courses`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.items || []);
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
        fetchCourses();
      } else {
        alert("Lỗi khi thay đổi trạng thái xuất bản");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          <button className="px-6 py-2 rounded-lg bg-white shadow-sm text-sm font-bold text-[#3c6c44]">
            Tất cả
          </button>
          <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700">
            Đã xuất bản
          </button>
          <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700">
            Bản nháp
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng khóa học", value: courses.length.toString(), icon: <BookOpen size={16} /> },
          { label: "Đang hoạt động", value: courses.filter(c => c.status === 1).length.toString(), color: "text-[#3c6c44]" },
          { label: "Học viên mới", value: "+128" },
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
        ) : courses.map((course, i) => (
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
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-bold">1 - 4</span> trong số{" "}
          <span className="font-bold">24</span> khóa học
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-lg bg-[#3c6c44] text-white font-bold text-sm">
            1
          </button>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">
            2
          </button>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">
            3
          </button>
          <span className="px-2 text-slate-400">...</span>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">
            5
          </button>
          <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default AdminCourses;
