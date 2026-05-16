import React, { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type EditLessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lesson: any;
};

const EditLessonModal: React.FC<EditLessonModalProps> = ({ isOpen, onClose, onSuccess, lesson }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lessonData, setLessonData] = useState({
    title: "",
    shortDescription: "",
    objectiveText: "",
    lessonType: "Video",
    difficultyLevel: "Beginner",
    estimatedMinutes: 10,
    xpReward: 50,
    status: 1
  });

  useEffect(() => {
    if (lesson) {
      setLessonData({
        title: lesson.title || "",
        shortDescription: lesson.shortDescription || "",
        objectiveText: lesson.objectiveText || "",
        lessonType: lesson.lessonType || "Video",
        difficultyLevel: lesson.difficultyLevel || "Beginner",
        estimatedMinutes: lesson.estimatedMinutes || 10,
        xpReward: lesson.xpReward || 50,
        status: lesson.status ?? 1
      });
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleSubmit = async () => {
    if (!lessonData.title.trim()) {
      setError("Vui lòng nhập tên bài học");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const authToken = tokenStorage.getToken();
      
      const payload = {
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        title: lessonData.title,
        slug: lesson.slug || lessonData.title.toLowerCase().replace(/ /g, '-'),
        shortDescription: lessonData.shortDescription,
        objectiveText: lessonData.objectiveText,
        lessonType: lessonData.lessonType,
        difficultyLevel: lessonData.difficultyLevel,
        estimatedMinutes: Number(lessonData.estimatedMinutes),
        xpReward: Number(lessonData.xpReward),
        sortOrder: lesson.sortOrder || 1,
        status: Number(lessonData.status)
      };

      const res = await fetch(`${API_BASE_URL}/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Lỗi khi cập nhật bài học");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Chỉnh sửa bài học</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học *</label>
              <input
                type="text"
                value={lessonData.title}
                onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
              <textarea
                value={lessonData.shortDescription}
                onChange={e => setLessonData({ ...lessonData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50 min-h-[60px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mục tiêu (Objective)</label>
              <input
                type="text"
                value={lessonData.objectiveText}
                onChange={e => setLessonData({ ...lessonData, objectiveText: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={lessonData.status}
                onChange={e => setLessonData({ ...lessonData, status: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
              >
                <option value={0}>Bản nháp</option>
                <option value={1}>Đã xuất bản</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loại bài học</label>
              <select
                value={lessonData.lessonType}
                onChange={e => setLessonData({ ...lessonData, lessonType: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
              >
                <option value="Video">Video</option>
                <option value="Text">Văn bản</option>
                <option value="Quiz">Trắc nghiệm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Độ khó</label>
              <select
                value={lessonData.difficultyLevel}
                onChange={e => setLessonData({ ...lessonData, difficultyLevel: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
              >
                <option value="Beginner">Beginner (Cơ bản)</option>
                <option value="Intermediate">Intermediate (Trung cấp)</option>
                <option value="Advanced">Advanced (Nâng cao)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian học (phút)</label>
              <input
                type="number"
                value={lessonData.estimatedMinutes}
                onChange={e => setLessonData({ ...lessonData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">XP Nhận được</label>
              <input
                type="number"
                value={lessonData.xpReward}
                onChange={e => setLessonData({ ...lessonData, xpReward: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors flex items-center gap-2 shadow-sm disabled:bg-[#3c6c44]/70"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={16} /> Lưu thay đổi</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditLessonModal;
