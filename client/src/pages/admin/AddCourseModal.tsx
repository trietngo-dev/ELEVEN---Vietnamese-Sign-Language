import React, { useState } from "react";
import { 
  X, Loader2, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, 
  Plus, Trash2, Edit, Check, Layers, Video 
} from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type AddCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type TempLesson = {
  tempId: string;
  title: string;
  shortDescription: string;
  objectiveText: string;
  lessonType: string;
  difficultyLevel: string;
  estimatedMinutes: number;
  xpReward: number;
  videoFile: File | null;
};

type TempModule = {
  tempId: string;
  title: string;
  lessons: TempLesson[];
};

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Category Data
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

  // Step 2: Course Data
  const [courseData, setCourseData] = useState({ title: "", level: "Cơ bản", isPremium: false });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Step 3: Curriculum Data
  const [modules, setModules] = useState<TempModule[]>([
    {
      tempId: "mod-1",
      title: "Chương 1: Bảng chữ cái",
      lessons: []
    }
  ]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Submission Progress
  const [submissionProgress, setSubmissionProgress] = useState<string[]>([]);
  const [currentProgressIndex, setCurrentProgressIndex] = useState<number>(0);
  const [createdResultSummary, setCreatedResultSummary] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const authToken = tokenStorage.getToken();
          const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
          const res = await fetch(`${API_BASE_URL}/api/course_categories?pageSize=100`, { headers });
          if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            setCategories(items);
            if (items.length > 0) {
              setSelectedCategoryId(items[0].id.toString());
              setIsCreatingNewCategory(false);
            } else {
              setIsCreatingNewCategory(true);
            }
          } else {
            setIsCreatingNewCategory(true);
          }
        } catch (e) {
          console.error("Failed to fetch categories", e);
          setIsCreatingNewCategory(true);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateSlug = (text: string) => {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Chapter (Module) Actions
  const addModule = () => {
    const newMod: TempModule = {
      tempId: `mod-${Date.now()}`,
      title: `Chương ${modules.length + 1}: Chương học mới`,
      lessons: []
    };
    setModules([...modules, newMod]);
  };

  const deleteModule = (tempId: string) => {
    setModules(modules.filter(m => m.tempId !== tempId));
  };

  const updateModuleTitle = (tempId: string, title: string) => {
    setModules(modules.map(m => m.tempId === tempId ? { ...m, title } : m));
  };

  // Lesson Actions
  const addLesson = (modTempId: string) => {
    const newLessonTempId = `les-${Date.now()}`;
    const newLes: TempLesson = {
      tempId: newLessonTempId,
      title: "",
      shortDescription: "",
      objectiveText: "",
      lessonType: "Video",
      difficultyLevel: "Beginner",
      estimatedMinutes: 10,
      xpReward: 50,
      videoFile: null
    };
    setModules(modules.map(m => {
      if (m.tempId === modTempId) {
        return { ...m, lessons: [...m.lessons, newLes] };
      }
      return m;
    }));
    setEditingLessonId(newLessonTempId);
  };

  const deleteLesson = (modTempId: string, lesTempId: string) => {
    setModules(modules.map(m => {
      if (m.tempId === modTempId) {
        return { ...m, lessons: m.lessons.filter(l => l.tempId !== lesTempId) };
      }
      return m;
    }));
    if (editingLessonId === lesTempId) setEditingLessonId(null);
  };

  const updateLesson = (modTempId: string, lesTempId: string, fields: Partial<TempLesson>) => {
    setModules(modules.map(m => {
      if (m.tempId === modTempId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.tempId === lesTempId ? { ...l, ...fields } : l)
        };
      }
      return m;
    }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (isCreatingNewCategory && !categoryData.name.trim()) {
        setError("Vui lòng nhập tên danh mục"); return;
      }
      if (!isCreatingNewCategory && !selectedCategoryId) {
        setError("Vui lòng chọn danh mục"); return;
      }
    }
    if (step === 2) {
      if (!courseData.title.trim()) {
        setError("Vui lòng nhập tên khóa học"); return;
      }
    }
    if (step === 3) {
      if (modules.length === 0) {
        setError("Vui lòng thêm ít nhất một chương học");
        return;
      }
      for (const mod of modules) {
        if (!mod.title.trim()) {
          setError("Tên chương học không được để trống");
          return;
        }
        if (mod.lessons.length === 0) {
          setError(`Chương "${mod.title}" chưa có bài học nào. Vui lòng thêm bài học.`);
          return;
        }
        for (const les of mod.lessons) {
          if (!les.title.trim()) {
            setError(`Vui lòng nhập tên cho tất cả bài học trong chương "${mod.title}"`);
            return;
          }
          if (!les.videoFile) {
            setError(`Bài học "${les.title}" chưa có video giáo trình.`);
            return;
          }
        }
      }
      if (editingLessonId) {
        setError("Vui lòng nhấn Xác nhận/Lưu bài học đang chỉnh sửa trước khi tiếp tục");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleClose = () => {
    if (step === 5) onSuccess();
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // 1. Prepare progress steps
    const progressSteps: string[] = [];
    if (isCreatingNewCategory) progressSteps.push("Tạo danh mục mới");
    if (imageFile) progressSteps.push("Tải ảnh bìa khóa học");
    progressSteps.push("Tạo khóa học chính thức");

    modules.forEach((mod, modIdx) => {
      progressSteps.push(`Tạo chương ${modIdx + 1}: ${mod.title}`);
      mod.lessons.forEach((les) => {
        progressSteps.push(`Tạo bài học: ${les.title}`);
        progressSteps.push(`Tải lên video giáo trình: ${les.title}`);
      });
    });

    setSubmissionProgress(progressSteps);
    setCurrentProgressIndex(0);

    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };

      let currentStepIdx = 0;
      const advanceProgress = () => {
        currentStepIdx++;
        setCurrentProgressIndex(currentStepIdx);
      };

      // 1. Create or Resolve Category
      let categoryId: number;
      if (isCreatingNewCategory) {
        const catRes = await fetch(`${API_BASE_URL}/api/course_categories`, {
          method: "POST", 
          headers,
          body: JSON.stringify({
            name: categoryData.name.trim(),
            slug: generateSlug(categoryData.name),
            description: categoryData.description.trim(),
            colorHex: "#3c6c44"
          })
        });
        if (!catRes.ok) throw new Error("Lỗi khi tạo danh mục mới");
        const catObj = await catRes.json();
        categoryId = catObj.id;
        advanceProgress();
      } else {
        categoryId = parseInt(selectedCategoryId, 10);
      }

      // 2. Upload Course Image (if exists)
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
        advanceProgress();
      }

      // 3. Create Course
      const courseRes = await fetch(`${API_BASE_URL}/api/courses`, {
        method: "POST", 
        headers,
        body: JSON.stringify({
          categoryId: categoryId,
          title: courseData.title.trim(),
          slug: generateSlug(courseData.title),
          level: courseData.level,
          isPremium: courseData.isPremium,
          createdBy: 1,
          summary: courseData.title.trim(),
          coverMediaId: coverMediaId,
          trailerMediaId: null,
          description: ""
        })
      });
      if (!courseRes.ok) throw new Error("Lỗi khi khởi tạo khóa học");
      const courseObj = await courseRes.json();
      const courseId = courseObj.id;
      advanceProgress();

      let createdModulesCount = 0;
      let createdLessonsCount = 0;

      // 4. Create Modules and Lessons sequentially
      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const mod = modules[mIdx];
        
        // Create Module
        const modRes = await fetch(`${API_BASE_URL}/api/course_modules`, {
          method: "POST", 
          headers,
          body: JSON.stringify({
            courseId: courseId,
            title: mod.title.trim(),
            sortOrder: mIdx + 1,
            isPreview: false
          })
        });
        if (!modRes.ok) throw new Error(`Lỗi khi tạo chương: ${mod.title}`);
        const modObj = await modRes.json();
        const moduleId = modObj.id;
        createdModulesCount++;
        advanceProgress();

        // Create Lessons under this module
        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          const les = mod.lessons[lIdx];

          // Create Lesson details
          const lesRes = await fetch(`${API_BASE_URL}/api/lessons`, {
            method: "POST", 
            headers,
            body: JSON.stringify({
              courseId: courseId,
              moduleId: moduleId,
              title: les.title.trim(),
              slug: generateSlug(les.title),
              shortDescription: les.shortDescription.trim() || null,
              objectiveText: les.objectiveText.trim() || null,
              lessonType: les.lessonType,
              difficultyLevel: les.difficultyLevel,
              estimatedMinutes: Number(les.estimatedMinutes),
              xpReward: Number(les.xpReward),
              sortOrder: lIdx + 1
            })
          });
          if (!lesRes.ok) throw new Error(`Lỗi khi khởi tạo thông tin bài học: ${les.title}`);
          const lesObj = await lesRes.json();
          const lessonId = lesObj.id;
          createdLessonsCount++;
          advanceProgress();

          // Upload Video for this lesson
          if (les.videoFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", les.videoFile);
            const uploadHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

            const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
              method: "POST",
              headers: uploadHeaders,
              body: uploadFormData
            });
            if (!uploadRes.ok) throw new Error(`Lỗi khi tải video cho bài học: ${les.title}`);
            const uploadObj = await uploadRes.json();
            const videoMediaId = uploadObj.id;

            // Link Video to Lesson
            const assignRes = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/video`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
              },
              body: JSON.stringify({ videoMediaId: videoMediaId })
            });
            if (!assignRes.ok) throw new Error(`Lỗi khi gắn video vào bài học: ${les.title}`);
          }
          advanceProgress();
        }
      }

      setCreatedResultSummary({
        courseId,
        title: courseData.title,
        modulesCount: createdModulesCount,
        lessonsCount: createdLessonsCount
      });
      setStep(5); // Success screen

    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình tạo khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {step === 5 ? "Tạo khóa học thành công" : `Thêm khóa học mới (Bước ${step}/4)`}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn danh mục khóa học</label>
                <select
                  value={isCreatingNewCategory ? "new" : selectedCategoryId}
                  onChange={e => {
                    if (e.target.value === "new") {
                      setIsCreatingNewCategory(true);
                    } else {
                      setIsCreatingNewCategory(false);
                      setSelectedCategoryId(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  <option value="new">+ Tạo danh mục mới</option>
                </select>
              </div>

              {isCreatingNewCategory && (
                <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục mới *</label>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/50"
                    value={courseData.isPremium ? "true" : "false"}
                    onChange={(e) => setCourseData({ ...courseData, isPremium: e.target.value === "true" })}
                  >
                    <option value="false">Miễn phí</option>
                    <option value="true">Premium (Trả phí)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh bìa khóa học</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden">
                    {imageFile ? (
                      <>
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800">Xây dựng giáo trình (Curriculum Builder)</h3>
                <button
                  onClick={addModule}
                  className="flex items-center gap-1 text-xs font-bold text-[#3c6c44] hover:text-[#325b3a] bg-[#3c6c44]/10 hover:bg-[#3c6c44]/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Thêm chương học
                </button>
              </div>

              <div className="space-y-4">
                {modules.map((mod) => (
                  <div key={mod.tempId} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    {/* Chapter Header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <Layers size={16} className="text-[#3c6c44] flex-shrink-0" />
                        <input
                          type="text"
                          value={mod.title}
                          onChange={e => updateModuleTitle(mod.tempId, e.target.value)}
                          className="font-bold text-slate-800 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#3c6c44] focus:bg-white px-2 py-0.5 rounded focus:outline-none w-full"
                          placeholder="Nhập tên chương..."
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => addLesson(mod.tempId)}
                          className="flex items-center gap-0.5 text-xs bg-[#3c6c44]/10 text-[#3c6c44] hover:bg-[#3c6c44] hover:text-white px-2.5 py-1 rounded-lg transition-all font-bold"
                        >
                          <Plus size={13} /> Bài học
                        </button>
                        {modules.length > 1 && (
                          <button
                            onClick={() => deleteModule(mod.tempId)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                            title="Xóa chương"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lessons list under Chapter */}
                    <div className="p-4 space-y-3 bg-white">
                      {mod.lessons.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-2">Chưa có bài học nào trong chương này. Hãy bấm "+ Bài học" ở trên.</p>
                      ) : (
                        mod.lessons.map((les, lesIdx) => {
                          const isEditing = editingLessonId === les.tempId;
                          return (
                            <div key={les.tempId} className={`border rounded-lg p-3 transition-all ${isEditing ? 'border-[#3c6c44] bg-[#3c6c44]/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/55">
                                    <span className="text-xs font-bold text-[#3c6c44]">Chỉnh sửa bài học #{lesIdx + 1}</span>
                                    <button
                                      onClick={() => setEditingLessonId(null)}
                                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                      title="Lưu tạm"
                                    >
                                      <Check size={14} className="text-green-600" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="sm:col-span-2">
                                      <label className="block font-semibold text-slate-700 mb-1">Tên bài học *</label>
                                      <input
                                        type="text"
                                        value={les.title}
                                        onChange={e => updateLesson(mod.tempId, les.tempId, { title: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3c6c44]"
                                        placeholder="Ví dụ: Bài 1: Chào hỏi"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="block font-semibold text-slate-700 mb-1">Mô tả ngắn</label>
                                      <textarea
                                        value={les.shortDescription}
                                        onChange={e => updateLesson(mod.tempId, les.tempId, { shortDescription: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3c6c44]"
                                        placeholder="Mô tả tóm tắt..."
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-semibold text-slate-700 mb-1">Mục tiêu (Objective)</label>
                                      <input
                                        type="text"
                                        value={les.objectiveText}
                                        onChange={e => updateLesson(mod.tempId, les.tempId, { objectiveText: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                        placeholder="Học viên nắm được..."
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-semibold text-slate-700 mb-1">Loại bài học</label>
                                      <select
                                        value={les.lessonType}
                                        onChange={e => updateLesson(mod.tempId, les.tempId, { lessonType: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                      >
                                        <option value="Video">Video</option>
                                        <option value="Text">Văn bản</option>
                                        <option value="Quiz">Trắc nghiệm</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block font-semibold text-slate-700 mb-1">Độ khó</label>
                                      <select
                                        value={les.difficultyLevel}
                                        onChange={e => updateLesson(mod.tempId, les.tempId, { difficultyLevel: e.target.value })}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                                      >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                      </select>
                                    </div>
                                    <div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block font-semibold text-slate-700 mb-1">Số phút</label>
                                          <input
                                            type="number"
                                            value={les.estimatedMinutes}
                                            onChange={e => updateLesson(mod.tempId, les.tempId, { estimatedMinutes: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                                          />
                                        </div>
                                        <div>
                                          <label className="block font-semibold text-slate-700 mb-1">XP</label>
                                          <input
                                            type="number"
                                            value={les.xpReward}
                                            onChange={e => updateLesson(mod.tempId, les.tempId, { xpReward: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <label className="block font-semibold text-slate-700 mb-1">Video giáo trình *</label>
                                      <div className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-1.5 border border-dashed border-slate-300 px-3 py-2 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                          <UploadCloud size={14} className="text-[#3c6c44]" />
                                          <span className="text-[11px] font-semibold text-slate-600">Chọn video bài học</span>
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="video/*"
                                            onChange={e => {
                                              if (e.target.files && e.target.files[0]) {
                                                updateLesson(mod.tempId, les.tempId, { videoFile: e.target.files[0] });
                                              }
                                            }}
                                          />
                                        </label>
                                        {les.videoFile && (
                                          <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded truncate max-w-xs" title={les.videoFile.name}>
                                            ✓ {les.videoFile.name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end gap-2 pt-2">
                                    <button
                                      onClick={() => deleteLesson(mod.tempId, les.tempId)}
                                      className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-semibold transition-colors"
                                    >
                                      Xóa bài học
                                    </button>
                                    <button
                                      onClick={() => setEditingLessonId(null)}
                                      className="px-4 py-1 bg-[#3c6c44] text-white hover:bg-[#325b3a] rounded text-xs font-bold transition-colors"
                                    >
                                      Xác nhận
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Video size={13} className="text-[#3c6c44]" />
                                    <span className="font-semibold text-slate-700">
                                      {les.title || <i className="text-slate-400">Chưa đặt tên bài học</i>}
                                    </span>
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {les.estimatedMinutes}p • {les.xpReward} XP
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setEditingLessonId(les.tempId)}
                                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                      title="Chỉnh sửa bài học"
                                    >
                                      <Edit size={12} />
                                    </button>
                                    <button
                                      onClick={() => deleteLesson(mod.tempId, les.tempId)}
                                      className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-500"
                                      title="Xóa bài học"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              {isSubmitting ? (
                // Detailed Upload Progress Panel
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="font-bold text-slate-800">Đang tạo khóa học và tải lên dữ liệu...</span>
                    <span className="text-xs font-mono font-bold text-[#3c6c44] bg-[#3c6c44]/10 px-2 py-1 rounded">
                      {Math.round((currentProgressIndex / (submissionProgress.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {submissionProgress.map((progStep, idx) => {
                      const isDone = idx < currentProgressIndex;
                      const isActive = idx === currentProgressIndex;
                      return (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                          ) : isActive ? (
                            <Loader2 size={14} className="text-[#3c6c44] animate-spin flex-shrink-0" />
                          ) : (
                            <div className="size-3.5 rounded-full border border-slate-200 bg-slate-50 flex-shrink-0" />
                          )}
                          <span className={isDone ? 'text-slate-500 line-through' : isActive ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                            {progStep}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Confirmation screen before starting submission
                <div className="space-y-4 text-center py-4">
                  <div className="size-14 bg-[#3c6c44]/10 text-[#3c6c44] rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Xác nhận tạo khóa học</h3>
                  <p className="text-xs text-slate-500">Hãy kiểm tra kỹ cấu trúc giáo trình trước khi tiến hành khởi tạo.</p>

                  <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-700 border border-slate-200 space-y-2 max-h-72 overflow-y-auto">
                    <p><strong>Danh mục:</strong> {isCreatingNewCategory ? `[Mới] ${categoryData.name}` : (categories.find(c => c.id.toString() === selectedCategoryId)?.name || "")}</p>
                    <p>
                      <strong>Khóa học:</strong> {courseData.title} 
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded ml-1.5">{courseData.level}</span>
                      {courseData.isPremium && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded ml-1">Premium</span>}
                    </p>
                    {imageFile && <p><strong>Ảnh bìa:</strong> {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)</p>}
                    
                    <div className="border-t border-slate-200 my-2 pt-2">
                      <strong className="text-slate-800">Cấu trúc chương học & bài học:</strong>
                      <div className="mt-2 space-y-2 font-mono">
                        {modules.map((mod, modIdx) => (
                          <div key={mod.tempId} className="pl-2 border-l-2 border-[#3c6c44]">
                            <p className="text-[#3c6c44] font-semibold">Chương {modIdx + 1}: {mod.title}</p>
                            <div className="pl-4 space-y-1 mt-1 text-[11px] text-slate-500">
                              {mod.lessons.map((les, lesIdx) => (
                                <p key={les.tempId}>
                                  - Bài {lesIdx + 1}: {les.title} ({les.estimatedMinutes}p, {les.xpReward} XP, Video: {les.videoFile?.name})
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && createdResultSummary && (
            <div className="text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="size-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Tạo thành công!</h3>
              <p className="text-sm text-slate-500 mb-6">Đã khởi tạo khóa học và tải lên toàn bộ tài nguyên.</p>

              <div className="inline-block text-left bg-slate-50 p-5 rounded-xl text-xs font-mono text-slate-600 border border-slate-200 space-y-1.5">
                <p>Khóa học: <span className="text-slate-800 font-bold">{createdResultSummary.title}</span></p>
                <p>Course ID: <span className="text-[#3c6c44] font-bold">{createdResultSummary.courseId}</span></p>
                <p>Số chương học đã tạo: <span className="text-slate-800 font-bold">{createdResultSummary.modulesCount}</span></p>
                <p>Số bài học đã tạo: <span className="text-slate-800 font-bold">{createdResultSummary.lessonsCount}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          {step > 1 && step < 5 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Quay lại
            </button>
          ) : <div></div>}

          {step < 4 && (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors flex items-center gap-1 shadow-sm"
            >
              Tiếp tục <ChevronRight size={16} />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#3c6c44] text-white rounded-xl text-sm font-bold hover:bg-[#325b3a] transition-colors flex items-center gap-2 shadow-sm disabled:bg-[#3c6c44]/70"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Đang tạo...</>
              ) : "Xác nhận & Tạo khóa học"}
            </button>
          )}

          {step === 5 && (
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
};

export default AddCourseModal;
