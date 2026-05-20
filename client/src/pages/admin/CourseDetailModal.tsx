import React, { useState, useEffect } from "react";
import { X, Loader2, Clock, ListVideo, Layers, Edit } from "lucide-react";
import { tokenStorage } from "../../lib/auth";
import EditLessonModal from "./EditLessonModal";
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
              <h4 className="font-bold flex items-center gap-2"><Layers size={18} className="text-[#3c6c44]" /> Nội dung chương trình</h4>
              {modules.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có chương học nào.</p>
              ) : (
                <div className="space-y-3">
                  {modules.sort((a,b)=>a.sortOrder-b.sortOrder).map(mod => {
                    const modLessons = lessons.filter(l => l.moduleId === mod.id).sort((a,b)=>a.sortOrder-b.sortOrder);
                    return (
                      <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 font-semibold text-slate-800 text-sm">
                          {mod.title}
                        </div>
                        {modLessons.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400">Không có bài học</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
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
    </div>
  );
}

export default CourseDetailModal;
