import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type EditCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: any;
};

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onClose, onSuccess, course }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    level: "Cơ bản",
    isPremium: false,
    description: "",
    summary: ""
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        level: course.level || "Cơ bản",
        isPremium: course.isPremium || false,
        description: course.description || "",
        summary: course.summary || ""
      });
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const generateSlug = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const authToken = tokenStorage.getToken();
      
      let finalCoverMediaId = course.coverMediaId;
      if (imageFile) {
        const coverFormData = new FormData();
        coverFormData.append("file", imageFile);
        const coverUploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {},
          body: coverFormData
        });
        if (coverUploadRes.ok) {
          const coverObj = await coverUploadRes.json();
          finalCoverMediaId = coverObj.id;
        }
      }

      const payload = {
        categoryId: course.categoryId,
        title: formData.title,
        slug: generateSlug(formData.title),
        summary: formData.summary,
        description: formData.description,
        level: formData.level,
        coverMediaId: finalCoverMediaId,
        trailerMediaId: course.trailerMediaId,
        isPremium: formData.isPremium,
        updatedBy: 1
      };

      const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Chỉnh sửa thất bại");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa khóa học #{course.id}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên khóa học</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cấp độ</label>
            <select 
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
            >
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái tính phí</label>
            <select 
              value={formData.isPremium ? "true" : "false"}
              onChange={e => setFormData({...formData, isPremium: e.target.value === "true"})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
            >
              <option value="false">Miễn phí</option>
              <option value="true">Premium (Trả phí)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt</label>
            <textarea 
              value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50" 
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Đổi ảnh bìa mới</label>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden">
              {imageFile ? (
                <>
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  <span className="font-semibold text-[#3c6c44] relative z-10 bg-white/80 px-3 py-1 rounded-full">{imageFile.name}</span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-slate-500">Tải ảnh lên thay thế</span>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50 gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Hủy</button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditCourseModal;
