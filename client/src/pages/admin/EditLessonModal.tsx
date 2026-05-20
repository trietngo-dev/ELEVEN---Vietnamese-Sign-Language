import React, { useState, useEffect } from "react";
import { X, Loader2, Save, UploadCloud, CheckCircle2, Video } from "lucide-react";
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
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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

  // Existing Video info
  const [currentVideoMediaId, setCurrentVideoMediaId] = useState<number | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // New Video upload
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);

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
      setCurrentVideoMediaId(lesson.videoMediaId || null);
      setCurrentVideoUrl(null);
      setNewVideoFile(null);

      // Fetch full lesson details to get current video URL
      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const authToken = tokenStorage.getToken();
          const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
          const res = await fetch(`${API_BASE_URL}/api/lessons/${lesson.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setCurrentVideoUrl(data.videoUrl || null);
            if (data.videoMediaId) {
              setCurrentVideoMediaId(data.videoMediaId);
            }
          }
        } catch (e) {
          console.error("Failed to load full lesson details in EditLessonModal", e);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      
      fetchDetails();
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!lessonData.title.trim()) {
      setError("Vui lòng nhập tên bài học");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const authToken = tokenStorage.getToken();
      let videoMediaId = currentVideoMediaId;

      // 1. Upload new video if provided
      if (newVideoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", newVideoFile);
        
        const uploadHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: uploadHeaders,
          body: uploadFormData
        });

        if (!uploadRes.ok) {
          throw new Error("Lỗi khi tải video mới lên hệ thống");
        }

        const uploadObj = await uploadRes.json();
        videoMediaId = uploadObj.id;
      }
      
      const payload = {
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        title: lessonData.title.trim(),
        slug: generateSlug(lessonData.title),
        shortDescription: lessonData.shortDescription.trim() || null,
        objectiveText: lessonData.objectiveText.trim() || null,
        coverMediaId: lesson.coverMediaId || null,
        videoMediaId,
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
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.message || "Lỗi khi cập nhật bài học");
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

            {/* Video Management Section */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Video size={16} className="text-[#3c6c44]" /> Quản lý Video bài học
              </h4>

              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                  <Loader2 size={16} className="animate-spin mr-2" /> Đang tải thông tin video...
                </div>
              ) : currentVideoUrl ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs text-slate-500 font-semibold">Video hiện tại:</p>
                  <video src={currentVideoUrl} controls className="w-full aspect-video rounded-lg bg-black" />
                  <p className="text-[11px] text-slate-400 break-all">{currentVideoUrl}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Bài học này chưa được gán video chính thức.</p>
              )}

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <label className="flex flex-col items-center justify-center cursor-pointer min-h-[100px]">
                  <UploadCloud size={28} className="text-[#3c6c44] mb-1" />
                  <span className="text-sm font-medium text-slate-700">Thay thế bằng video mới</span>
                  <span className="text-xs text-slate-500 mt-0.5">Tải lên file video để ghi đè video cũ</span>
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                </label>
                {newVideoFile && (
                  <div className="mt-3 p-2 bg-[#3c6c44]/10 rounded-lg flex items-center gap-2 text-sm text-[#3c6c44] font-medium">
                    <CheckCircle2 size={16} /> <span>{newVideoFile.name} ({(newVideoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
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
