import React, { useState, useEffect } from "react";
import { X, Loader2, Clock, ListVideo, Layers, Edit, Trash2, Plus, Check } from "lucide-react";
import { tokenStorage } from "../../lib/auth";
import EditLessonModal from "./EditLessonModal";
import AddLessonModal from "./AddLessonModal";
import ConfirmModal from "../../components/ConfirmModal";
import demoVideo from "../../assets/videoCourse/W00489.mp4";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type CourseDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  course: any;
};

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ isOpen, onClose, course }) => {
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingLessonId, setPlayingLessonId] = useState<number | null>(null);
  const [lessonVideoUrls, setLessonVideoUrls] = useState<Record<number, string>>({});
  const [fetchedLessonIds, setFetchedLessonIds] = useState<Set<number>>(new Set());
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  // New chapter & lesson management state
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<number | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [isSavingModule, setIsSavingModule] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const [modsRes, lessRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/course_modules?pageSize=100`, { headers }),
        fetch(`${API_BASE_URL}/api/lessons?pageSize=500`, { headers })
      ]);
      
      if (modsRes.ok) {
        const data = await modsRes.json();
        setModules(data.items ? data.items.filter((m: any) => m.courseId === course.id) : []);
      }
      if (lessRes.ok) {
        const data = await lessRes.json();
        setLessons(data.items ? data.items.filter((l: any) => l.courseId === course.id) : []);
      }
    } catch (error) {
      console.error("Error fetching dependencies", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && course) {
      fetchData();
    }
  }, [isOpen, course]);

  const handleToggleLesson = async (lesson: any) => {
    if (playingLessonId === lesson.id) {
      setPlayingLessonId(null);
      return;
    }
    setPlayingLessonId(lesson.id);
    
    // Already have URL cached
    if (lessonVideoUrls[lesson.id]) return;
    // Already attempted fetch
    if (fetchedLessonIds.has(lesson.id)) return;

    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      // 1) Try the detail endpoint which includes VideoUrl via navigation property
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lesson.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.videoUrl) {
          setLessonVideoUrls(prev => ({...prev, [lesson.id]: data.videoUrl}));
          setFetchedLessonIds(prev => new Set(prev).add(lesson.id));
          return;
        }
        // 2) If videoUrl is null but videoMediaId exists, fetch media asset directly
        const mediaId = data.videoMediaId || lesson.videoMediaId;
        if (mediaId) {
          const mediaRes = await fetch(`${API_BASE_URL}/api/media_assets/${mediaId}`, { headers });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            if (mediaData.fileUrl) {
              setLessonVideoUrls(prev => ({...prev, [lesson.id]: mediaData.fileUrl}));
              setFetchedLessonIds(prev => new Set(prev).add(lesson.id));
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load lesson video", e);
    }
    // Mark as fetched even if no URL was found
    setFetchedLessonIds(prev => new Set(prev).add(lesson.id));
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || isSavingModule) return;
    setIsSavingModule(true);
    try {
      const authToken = tokenStorage.getToken();
      const headers = {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      };
      const res = await fetch(`${API_BASE_URL}/api/course_modules`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          courseId: course.id,
          title: newModuleTitle.trim(),
          sortOrder: modules.length + 1,
          isPreview: false
        })
      });
      if (res.ok) {
        setNewModuleTitle("");
        setIsAddingModule(false);
        await fetchData();
      } else {
        alert("Lỗi khi thêm chương mới");
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleRenameModule = async (mod: any) => {
    if (!editingModuleTitle.trim() || isSavingModule) return;
    setIsSavingModule(true);
    try {
      const authToken = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/course_modules/${mod.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          courseId: course.id,
          title: editingModuleTitle.trim(),
          sortOrder: mod.sortOrder,
          isPreview: mod.isPreview,
          description: mod.description
        })
      });
      if (res.ok) {
        setEditingModuleId(null);
        setEditingModuleTitle("");
        await fetchData();
      } else {
        alert("Lỗi khi đổi tên chương");
      }
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi");
    } finally {
      setIsSavingModule(false);
    }
  };

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
    variant: "danger",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteModule = (moduleId: number) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId);
    if (moduleLessons.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "Không thể xóa chương",
        message: "Chương học này đang chứa bài học. Vui lòng xóa hết các bài học bên trong trước khi xóa chương.",
        variant: "warning",
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xóa chương học",
      message: "Bạn có chắc chắn muốn xóa chương học này? Hành động này không thể hoàn tác.",
      variant: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const authToken = tokenStorage.getToken();
          const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
          const res = await fetch(`${API_BASE_URL}/api/course_modules/${moduleId}`, {
            method: "DELETE",
            headers
          });
          if (res.ok) {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            fetchData();
          } else {
            alert("Lỗi khi xóa chương học");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleDeleteLesson = (lessonId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa bài học",
      message: "Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.",
      variant: "danger",
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const authToken = tokenStorage.getToken();
          const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
          const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
            method: "DELETE",
            headers
          });
          if (res.ok) {
            if (playingLessonId === lessonId) setPlayingLessonId(null);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            fetchData();
          } else {
            alert("Lỗi khi xóa bài học");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Chi tiết khoá học</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
               <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=3c6c44&color=fff&size=200`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{course.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{course.summary || "Khóa học chưa có mô tả"}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">{course.level || "Cơ bản"}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${course.status === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {course.status === 1 ? "Đã xuất bản" : "Bản nháp"}
                </span>
                {course.isPremium && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-md">Trả phí</span>}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold flex items-center gap-2">
                  <Layers size={18} className="text-[#3c6c44]" /> Nội dung chương trình
                </h4>
                {!isAddingModule ? (
                  <button
                    onClick={() => setIsAddingModule(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#3c6c44] hover:text-[#325b3a] bg-[#3c6c44]/10 hover:bg-[#3c6c44]/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} /> Thêm chương mới
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      placeholder="Tên chương học..."
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/30 w-44"
                    />
                    <button
                      onClick={handleAddModule}
                      disabled={isSavingModule}
                      className="p-1 text-white bg-[#3c6c44] rounded hover:bg-[#325b3a] disabled:opacity-50 flex items-center justify-center min-w-[24px] min-h-[24px]"
                      title="Lưu"
                    >
                      {isSavingModule ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingModule(false);
                        setNewModuleTitle("");
                      }}
                      className="p-1 text-slate-500 bg-slate-100 rounded hover:bg-slate-200"
                      title="Hủy"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {modules.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có chương học nào.</p>
              ) : (
                <div className="space-y-3">
                  {modules.sort((a,b)=>a.sortOrder-b.sortOrder).map(mod => {
                    const modLessons = lessons.filter(l => l.moduleId === mod.id).sort((a,b)=>a.sortOrder-b.sortOrder);
                    return (
                      <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between font-semibold text-slate-800 text-sm border-b border-slate-100">
                          {editingModuleId === mod.id ? (
                            <div className="flex items-center gap-2 w-full max-w-xs">
                              <input
                                type="text"
                                value={editingModuleTitle}
                                onChange={e => setEditingModuleTitle(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c6c44]/30 w-full"
                              />
                              <button
                                onClick={() => handleRenameModule(mod)}
                                disabled={isSavingModule}
                                className="p-1.5 text-white bg-[#3c6c44] rounded-lg hover:bg-[#325b3a] disabled:opacity-50 flex items-center justify-center min-w-[24px] min-h-[24px]"
                                title="Lưu"
                              >
                                {isSavingModule ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingModuleId(null);
                                  setEditingModuleTitle("");
                                }}
                                className="p-1.5 text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200"
                                title="Hủy"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="truncate">{mod.title}</span>
                          )}

                          {editingModuleId !== mod.id && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setAddingLessonToModuleId(mod.id);
                                }}
                                className="flex items-center gap-0.5 text-xs bg-white border border-[#3c6c44]/30 text-[#3c6c44] hover:bg-[#3c6c44] hover:text-white px-2 py-1 rounded-lg transition-all shadow-sm font-bold"
                                title="Thêm bài học mới"
                              >
                                <Plus size={12} /> Bài học
                              </button>
                              <button
                                onClick={() => {
                                  setEditingModuleId(mod.id);
                                  setEditingModuleTitle(mod.title);
                                }}
                                className="p-1.5 text-slate-500 hover:text-[#3c6c44] hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                title="Sửa tên chương"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(mod.id)}
                                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                title="Xóa chương"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                        {modLessons.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 italic bg-white">Không có bài học trong chương này</div>
                        ) : (
                          <div className="divide-y divide-slate-100 bg-white">
                            {modLessons.map(lesson => (
                              <div key={lesson.id} className="flex flex-col border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="px-4 py-3 flex items-center justify-between w-full">
                                  <button 
                                    onClick={() => handleToggleLesson(lesson)}
                                    className="flex-1 text-left text-sm font-medium text-slate-600 flex items-center gap-2 hover:text-[#3c6c44] transition-colors"
                                  >
                                    <ListVideo size={14} className="text-[#3c6c44]" /> {lesson.title}
                                  </button>
                                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                                      <Clock size={12} /> {lesson.estimatedMinutes || 10}p
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingLesson(lesson);
                                      }}
                                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-[#3c6c44] transition-colors"
                                      title="Chỉnh sửa bài học"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                      title="Xóa bài học"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                {playingLessonId === lesson.id && (
                                  <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                    {lessonVideoUrls[lesson.id] ? (
                                      <video 
                                        src={lessonVideoUrls[lesson.id]} 
                                        controls 
                                        className="w-full aspect-video rounded-xl bg-black" 
                                      />
                                    ) : !fetchedLessonIds.has(lesson.id) ? (
                                      <div className="w-full aspect-video rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                                        <Loader2 size={20} className="animate-spin mr-2" /> Đang tải video...
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <video 
                                          src={demoVideo} 
                                          controls 
                                          className="w-full aspect-video rounded-xl bg-black" 
                                        />
                                        <p className="text-center text-xs text-amber-600 font-medium">⚠ Video demo — Bài học chưa được gắn video chính thức.</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {editingLesson && (
        <EditLessonModal
          isOpen={!!editingLesson}
          lesson={editingLesson}
          onClose={() => setEditingLesson(null)}
          onSuccess={() => {
            setEditingLesson(null);
            // Clear playing video urls cache if updated
            setLessonVideoUrls({});
            setFetchedLessonIds(new Set());
            fetchData();
          }}
        />
      )}

      {addingLessonToModuleId !== null && (
        <AddLessonModal
          isOpen={addingLessonToModuleId !== null}
          courseId={course.id}
          moduleId={addingLessonToModuleId}
          onClose={() => setAddingLessonToModuleId(null)}
          onSuccess={() => {
            setAddingLessonToModuleId(null);
            fetchData();
          }}
        />
      )}

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        isLoading={isDeleting}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.variant === "warning" ? "Đã hiểu" : "Xóa ngay"}
        cancelText="Hủy"
        variant={confirmModal.variant || "danger"}
      />
    </div>
  );
}

export default CourseDetailModal;
