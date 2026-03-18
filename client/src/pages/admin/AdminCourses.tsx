import React from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

const AdminCourses: React.FC = () => {
  const courses = [
    { title: 'Giao tiếp cơ bản', lessons: 12, category: 'Cơ bản', status: 'Đã xuất bản', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIR6sHouD5uN95RaWEDVMH7vqAzb6CpPV2ysVzdn53TpKnssRsLcl6YAFXWGlCSWiZDgI9smtuS8yfvhB661MK1S8x0HIL6AjRWPN599wQQUBr36tmyYIP4O2-sN-yvDe2uFVaTr9vqgjqpftQ7NR57g0YAqB81GVNTah90BK57e8jyK1FICBRz-1zzBt7RC1XdA85j0GdfGNhviVSXjohROvn_ZgwxumCQKW0uHl37Kqnq_HOlHwvTbPxQGDjds-nWF5qHQenE8RU' },
    { title: 'Ngôn ngữ ký hiệu y tế', lessons: 20, category: 'Chuyên ngành', status: 'Đã xuất bản', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD0JzaR6vlsWo50eONtZ9uGuzcBVrrJxPnL5KmQBrJ431EeSDGT_xKLe9YOcLOkyGW7u_HQyrtA1dYkzbug0lOYaFZAS-oLAdG-KT4QDaTefQkYEMbuCuhJYIgVTSnYj9btOcUOLzOqqmz1U0ZKLWDawueufr183qDkjJ6ryNxfY5pU0xRb-1ST0Fek-o8QQhxzZxF0dWC3UVKJy0ycpkVMbwtvwFTk_u0nli31W0_g2TTwAKe4JSWhncwOJVYthzSS_WMGCHTNdL3' },
    { title: 'Từ vựng công sở', lessons: 15, category: 'Nâng cao', status: 'Bản nháp', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtHVK6085I8jDVguE_yeqQmGUIxfLJK_t9UZPf1tNUPINCawXz3VKO44YddmNxZT-CB4M-NKsc9OPHPGZpc16dYQewuACvMZDt_GYON7aTgSwvwdwTGG6YYhogZ1LuAWRzxpCqpBwqkelZ7jowMJt8G8hcXhsGbwS_yX73UU5iZub17tM-keWg8lrkHRlXPmKUoa2fiAi-cBHpKrWqjuvW0huWPdJ3TPVCf_7CesLEKVlunW036Zzcss8Pxl4h4wjVjcElGdjvfcGK', draft: true },
    { title: 'Giao tiếp hằng ngày', lessons: 10, category: 'Phổ thông', status: 'Đã xuất bản', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2Jxq9kT85JOaDByhbkEekQ-eeXvSCdjak7oyx5hXBjZr5rwtLEM41tvt1en_38gmCc86m7ARpY3Q_Oe0K3h4m_uxs0zeKnhwcTxjkne4J33_CYpXob_J0S-ymJn_64zX7ic1bNj7KFXCHo-pl-1_UoeKCOjjoaFFM6XHqcatGB2vbNKBQDUrcb0GIPnTQ1TLBa8XeH74CvTHAgcXMtRX_izjM8FlgvkN84c1a1CQvH7qSJ-TNCsPNafHc0WiDGV5GzKMsu-OpVFP6' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý bài học</h2>
          <p className="text-slate-500 mt-1">Quản lý và cập nhật nội dung các khóa học ngôn ngữ ký hiệu.</p>
        </div>
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button className="px-6 py-2 rounded-lg bg-white shadow-sm text-sm font-bold text-[#3c6c44]">Tất cả</button>
          <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700">Đã xuất bản</button>
          <button className="px-6 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700">Bản nháp</button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng khóa học', value: '24', icon: <BookOpen size={16} /> },
          { label: 'Đang hoạt động', value: '18', color: 'text-[#3c6c44]' },
          { label: 'Học viên mới', value: '+128' },
          { label: 'Tỷ lệ hoàn thành', value: '86%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color || ''}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, i) => (
          <div key={i} className={`bg-white rounded-2xl overflow-hidden border border-slate-100 group flex flex-col shadow-sm transition-all hover:shadow-md ${course.draft ? 'opacity-80' : ''}`}>
            <div className="relative aspect-video overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src={course.image} 
                alt={course.title} 
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-[#3c6c44] uppercase">
                {course.category}
              </div>
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase ${course.draft ? 'bg-slate-400' : 'bg-green-500'}`}>
                {course.status}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold leading-tight line-clamp-1">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                <BookOpen size={14} />
                {course.lessons} bài học
              </p>
              <div className="mt-auto pt-6 flex gap-2">
                <button className="flex-1 bg-[#3c6c44] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#3c6c44]/90 transition-colors flex items-center justify-center gap-1">
                  <Edit size={14} /> Chỉnh sửa
                </button>
                <button className="p-2 border border-slate-200 text-[#3c6c44] rounded-xl hover:bg-slate-50">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 transition-all group min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-[#3c6c44]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={28} className="text-[#3c6c44]" />
          </div>
          <p className="font-bold text-[#3c6c44]">Thêm khóa học mới</p>
          <p className="text-sm text-slate-400 mt-1">Tạo giáo trình mới của bạn</p>
        </button>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">Hiển thị <span className="font-bold">1 - 4</span> trong số <span className="font-bold">24</span> khóa học</p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors disabled:opacity-50">
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 rounded-lg bg-[#3c6c44] text-white font-bold text-sm">1</button>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">2</button>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">3</button>
          <span className="px-2 text-slate-400">...</span>
          <button className="w-10 h-10 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-100">5</button>
          <button className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#3c6c44] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
