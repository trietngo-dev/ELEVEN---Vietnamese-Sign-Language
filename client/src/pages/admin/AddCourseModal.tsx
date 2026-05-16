import React, { useState } from "react";
import { X, Loader2, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type AddCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [courseData, setCourseData] = useState({ title: "", level: "Cơ bản", isPremium: false });
  const [moduleData, setModuleData] = useState({ title: "" });
  const [lessonData, setLessonData] = useState({
    title: "",
    shortDescription: "",
    objectiveText: "",
    lessonType: "Video",
    difficultyLevel: "Beginner",
    estimatedMinutes: 10,
    xpReward: 50
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [createdResult, setCreatedResult] = useState({ categoryId: 0, courseId: 0, moduleId: 0, lessonId: 0, videoUrl: "" });

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !categoryData.name.trim()) {
      setError("Vui lòng nhập tên danh mục"); return;
    }
    if (step === 2 && !courseData.title.trim()) {
      setError("Vui lòng nhập tên khóa học"); return;
    }
    if (step === 3 && !moduleData.title.trim()) {
      setError("Vui lòng nhập tên chương học"); return;
    }
    if (step === 4 && (!lessonData.title.trim() || !videoFile)) {
      setError("Vui lòng nhập tên bài học và chọn video"); return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };

      // 1. Create Category
      const catRes = await fetch(`${API_BASE_URL}/api/course_categories`, {
        method: "POST", headers,
        body: JSON.stringify({
          name: categoryData.name,
          slug: generateSlug(categoryData.name),
          description: categoryData.description,
          colorHex: "#3c6c44"
        })
      });
      if (!catRes.ok) throw new Error("Lỗi khi tạo danh mục (Category)");
      const catObj = await catRes.json();
      const categoryId = catObj.id;

      // 1.5 Upload Course Image (if exists)
      let coverMediaId: number | null = null;
      if (imageFile) {
        const coverFormData = new FormData();
        coverFormData.append("file", imageFile);
        const uploadHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const coverUploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: uploadHeaders,
          body: coverFormData
        });
        if (!coverUploadRes.ok) throw new Error("Lỗi khi tải ảnh bìa lên hệ thống");
        const coverObj = await coverUploadRes.json();
        coverMediaId = coverObj.id;
      }

      // 2. Create Course
      const courseRes = await fetch(`${API_BASE_URL}/api/courses`, {
        method: "POST", headers,
        body: JSON.stringify({
          categoryId: categoryId,
          title: courseData.title,
          slug: generateSlug(courseData.title),
          level: courseData.level,
          isPremium: courseData.isPremium,
          createdBy: 1, // Assume 1 or fetch from auth context
          summary: courseData.title,
          coverMediaId: coverMediaId,
          trailerMediaId: null, // Assuming no trailer for now
          description: "" // Assuming no description for now
        })
      });
      if (!courseRes.ok) throw new Error("Lỗi khi tạo khoá học (Course)");
      const courseObj = await courseRes.json();
      const courseId = courseObj.id;

      // 3. Create Module
      const modRes = await fetch(`${API_BASE_URL}/api/course_modules`, {
        method: "POST", headers,
        body: JSON.stringify({
          courseId: courseId,
          title: moduleData.title,
          sortOrder: 1,
          isPreview: false
        })
      });
      if (!modRes.ok) throw new Error("Lỗi khi tạo chương (Course Module)");
      const modObj = await modRes.json();
      const moduleId = modObj.id;

      // 4. Create Lesson
      const lesRes = await fetch(`${API_BASE_URL}/api/lessons`, {
        method: "POST", headers,
        body: JSON.stringify({
          courseId: courseId,
          moduleId: moduleId,
          title: lessonData.title,
          slug: generateSlug(lessonData.title),
          shortDescription: lessonData.shortDescription,
          objectiveText: lessonData.objectiveText,
          lessonType: lessonData.lessonType,
          difficultyLevel: lessonData.difficultyLevel,
          estimatedMinutes: Number(lessonData.estimatedMinutes),
          xpReward: Number(lessonData.xpReward),
          sortOrder: 1
        })
      });
      if (!lesRes.ok) throw new Error("Lỗi khi tạo bài học (Lesson)");
      const lesObj = await lesRes.json();
      const lessonId = lesObj.id;

      // 5. Upload Video
      let uploadedVideoUrl = "";
      if (videoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", videoFile);

        const uploadHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

        const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
          method: "POST",
          headers: uploadHeaders,
          body: uploadFormData
        });
        if (!uploadRes.ok) throw new Error("Lỗi khi tải video lên hệ thống (Supabase)");
        const uploadObj = await uploadRes.json();
        const videoMediaId = uploadObj.id;
        uploadedVideoUrl = uploadObj.fileUrl;

        // 6. Assign Video to Lesson
        const assignRes = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/video`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } as Record<string, string> : {})
          },
          body: JSON.stringify({ videoMediaId: videoMediaId })
        });
        if (!assignRes.ok) throw new Error("Lỗi khi gắn video vào bài học");
      }

      setCreatedResult({ categoryId, courseId, moduleId, lessonId, videoUrl: uploadedVideoUrl });
      setStep(6); // Success screen

    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình tạo khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 6) onSuccess();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 6 ? "Tạo khóa học thành công" : `Thêm khóa học mới (Bước ${step}/5)`}
          </h2>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Thông tin danh mục (Category)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={e => setCategoryData({ ...categoryData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                  placeholder="Ví dụ: Giao tiếp cơ bản"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả danh mục</label>
                <textarea
                  value={categoryData.description}
                  onChange={e => setCategoryData({ ...categoryData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50 min-h-[100px]"
                  placeholder="Mô tả danh mục..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Thông tin khóa học (Course)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên khóa học *</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                  placeholder="Ví dụ: VSL cho người mới bắt đầu"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cấp độ</label>
                  <select
                    value={courseData.level}
                    onChange={e => setCourseData({ ...courseData, level: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại khóa học</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                    value={courseData.isPremium ? "true" : "false"}
                    onChange={(e) => setCourseData({ ...courseData, isPremium: e.target.value === "true" })}
                  >
                    <option value="false">Miễn phí</option>
                    <option value="true">Premium (Trả phí)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh bìa (Định dạng ảnh)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden">
                    {imageFile ? (
                      <>
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                        <span className="font-semibold text-[#3c6c44] relative z-10 bg-white/80 px-3 py-1 rounded-full">{imageFile.name}</span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-500">Tải ảnh lên</p>
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
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Chương học đầu tiên (Module)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên chương (Module) *</label>
                <input
                  type="text"
                  value={moduleData.title}
                  onChange={e => setModuleData({ ...moduleData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                  placeholder="Ví dụ: Chương 1: Bảng chữ cái"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Bài học đầu tiên & Video (Lesson)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài học *</label>
                  <input
                    type="text"
                    value={lessonData.title}
                    onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                    placeholder="Ví dụ: Bài 1: Xin chào & Tạm biệt"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                  <textarea
                    value={lessonData.shortDescription}
                    onChange={e => setLessonData({ ...lessonData, shortDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50 min-h-[60px]"
                    placeholder="Mô tả ngắn gọn về bài học..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mục tiêu (Objective)</label>
                  <input
                    type="text"
                    value={lessonData.objectiveText}
                    onChange={e => setLessonData({ ...lessonData, objectiveText: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                    placeholder="VD: Học viên nắm được bảng chữ cái"
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
              </div>

              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
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
          )}

          {step === 5 && (
            <div className="space-y-4 text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="size-16 bg-[#3c6c44]/10 text-[#3c6c44] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Xác nhận tạo khóa học</h3>
              <p className="text-slate-500">Hệ thống sẽ thực hiện tạo Danh mục, Khóa học, Chương học, Bài học và tải video lên Supabase.</p>

              <div className="bg-slate-50 p-4 rounded-xl text-left mt-6 space-y-2 text-sm text-slate-700 border border-slate-200">
                <p><strong>Danh mục:</strong> {categoryData.name}</p>
                <p><strong>Khóa học:</strong> {courseData.title} <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{courseData.level}</span> {courseData.isPremium && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Premium</span>}</p>
                <p><strong>Chương học:</strong> {moduleData.title}</p>
                <div className="border-t border-slate-200 my-2 pt-2"></div>
                <p><strong>Tên bài học:</strong> {lessonData.title}</p>
                <p><strong>Phân loại:</strong> {lessonData.lessonType} • {lessonData.difficultyLevel}</p>
                <p><strong>Thời gian & Phần thưởng:</strong> {lessonData.estimatedMinutes} phút • {lessonData.xpReward} XP</p>
                <p><strong>Mô tả ngắn:</strong> {lessonData.shortDescription || <i>Trống</i>}</p>
                <p><strong>Mục tiêu:</strong> {lessonData.objectiveText || <i>Trống</i>}</p>
                <p><strong>Video:</strong> {videoFile ? <span className="text-green-600 font-medium">{videoFile.name}</span> : <span className="text-red-500 font-medium">Chưa chọn video (bắt buộc)</span>}</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-300">
              <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Thành công!</h3>
              <p className="text-slate-500 mb-6">Khóa học và video đã được tải lên hoàn tất.</p>

              <div className="inline-block text-left bg-slate-50 p-4 rounded-xl text-sm font-mono text-slate-600 border border-slate-200">
                <p>Category ID: <span className="text-[#3c6c44] font-bold">{createdResult.categoryId}</span></p>
                <p>Course ID: <span className="text-[#3c6c44] font-bold">{createdResult.courseId}</span></p>
                <p>Module ID: <span className="text-[#3c6c44] font-bold">{createdResult.moduleId}</span></p>
                <p>Lesson ID: <span className="text-[#3c6c44] font-bold">{createdResult.lessonId}</span></p>
                {createdResult.videoUrl && (
                  <p className="mt-2 text-xs truncate max-w-xs sm:max-w-md">
                    Video URL: <br/>
                    <a href={createdResult.videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {createdResult.videoUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          {step > 1 && step < 6 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Quay lại
            </button>
          ) : <div></div>}

          {step < 5 && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors flex items-center gap-1 shadow-sm"
            >
              Tiếp tục <ChevronRight size={16} />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm disabled:bg-green-400"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Đang tạo...</>
              ) : "Tạo khóa học"}
            </button>
          )}

          {step === 6 && (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors"
            >
              Đóng cửa sổ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCourseModal;
