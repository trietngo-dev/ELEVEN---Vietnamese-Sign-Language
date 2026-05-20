import React, { useState } from "react";
import { X, Loader2, Save, UploadCloud, CheckCircle2 } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type AddLessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: number;
  moduleId: number;
};

const AddLessonModal: React.FC<AddLessonModalProps> = ({ isOpen, onClose, onSuccess, courseId, moduleId }) => {
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
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!lessonData.title.trim()) {
      setError("Vui lòng nhập tên bài học");
      return;
    }
    if (!videoFile) {
      setError("Vui lòng tải lên video bài học");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const authToken = tokenStorage.getToken();
      let videoMediaId: number | null = null;

      // 1. Upload video
      if (videoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", videoFile);

        const uploadHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: uploadHeaders,
          body: uploadFormData
        });

        if (!uploadRes.ok) {
          throw new Error("Lỗi khi tải video lên hệ thống");
        }

        const uploadObj = await uploadRes.json();
        videoMediaId = uploadObj.id;
      }

      // 2. Create lesson with videoMediaId
      const payload = {
        courseId,
        moduleId,
        title: lessonData.title.trim(),
        slug: generateSlug(lessonData.title),
        shortDescription: lessonData.shortDescription.trim() || null,
        objectiveText: lessonData.objectiveText.trim() || null,
        coverMediaId: null,
        videoMediaId,
        lessonType: lessonData.lessonType,
        difficultyLevel: lessonData.difficultyLevel,
        estimatedMinutes: Number(lessonData.estimatedMinutes),
        xpReward: Number(lessonData.xpReward),
        sortOrder: 1, // Sort order can be adjusted as needed
      };

      const res = await fetch(`${API_BASE_URL}/api/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.message || "Lỗi khi tạo bài học");
      }

      onSuccess();
      onClose();
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
          <h2 className="text-xl font-bold text-slate-800">Thêm bài học mới</h2>
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
                placeholder="Ví dụ: Bài 2: Từ vựng giao tiếp"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
              <textarea
                value={lessonData.shortDescription}
                onChange={e => setLessonData({ ...lessonData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50 min-h-[60px]"
                placeholder="Mô tả ngắn về bài học..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mục tiêu (Objective)</label>
              <input
                type="text"
                value={lessonData.objectiveText}
                onChange={e => setLessonData({ ...lessonData, objectiveText: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                placeholder="VD: Học viên nắm được các từ vựng chào hỏi"
              />
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

            <div className="md:col-span-2 pt-2">
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
                  <UploadCloud size={32} className="text-[#3c6c44] mb-2" />
                  <span className="text-sm font-medium text-slate-700">Tải video giáo trình lên *</span>
                  <span className="text-xs text-slate-500 mt-1">Hỗ trợ các định dạng video (MP4, WebM...)</span>
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                </label>
                {videoFile && (
                  <div className="mt-3 p-2 bg-[#3c6c44]/10 rounded-lg flex items-center gap-2 text-sm text-[#3c6c44] font-medium">
                    <CheckCircle2 size={16} /> <span>{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
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
              <><Loader2 size={16} className="animate-spin" /> Đang tạo...</>
            ) : (
              <><Save size={16} /> Thêm bài học</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLessonModal;
