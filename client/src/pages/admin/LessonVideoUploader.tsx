import React, { useState } from "react";
import { Loader2, UploadCloud, Video } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

type UploadMediaResponse = {
  id: number;
  fileUrl: string;
};

type LessonDetailResponse = {
  id: number;
  videoMediaId?: number | null;
  videoUrl?: string | null;
};

type LessonVideoUploaderProps = {
  lessonId: number;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const LessonVideoUploader: React.FC<LessonVideoUploaderProps> = ({
  lessonId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMediaId, setVideoMediaId] = useState<number | null>(null);

  const authToken = tokenStorage.getToken();
  const authHeaders: Record<string, string> = authToken
    ? { Authorization: `Bearer ${authToken}` }
    : {};

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch(
        `${API_BASE_URL}/api/media_assets/upload`,
        {
          method: "POST",
          headers: {
            ...authHeaders,
          },
          body: uploadFormData,
        },
      );

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json().catch(() => ({}));
        throw new Error(uploadError.message || "Tải video lên thất bại.");
      }

      const uploadedMedia: UploadMediaResponse = await uploadResponse.json();

      const assignResponse = await fetch(
        `${API_BASE_URL}/api/lessons/${lessonId}/video`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ videoMediaId: uploadedMedia.id }),
        },
      );

      if (!assignResponse.ok) {
        const assignError = await assignResponse.json().catch(() => ({}));
        throw new Error(
          assignError.message || "Gán video vào bài học thất bại.",
        );
      }

      const updatedLesson: LessonDetailResponse = await assignResponse.json();
      setVideoMediaId(updatedLesson.videoMediaId ?? uploadedMedia.id);
      setVideoUrl(updatedLesson.videoUrl ?? uploadedMedia.fileUrl);
      setSuccessMessage("Tải lên và gán video cho bài học thành công.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Tải video bài học
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Chọn video để upload lên Supabase rồi tự động gán vào lesson ID #
            {lessonId}.
          </p>
        </div>
        <div className="size-10 rounded-xl bg-[#3c6c44]/10 text-[#3c6c44] flex items-center justify-center">
          <Video size={18} />
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Chọn video</span>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelected}
          disabled={isUploading}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#3c6c44] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#325b3a] disabled:opacity-60"
        />
      </label>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-[#3c6c44] font-semibold">
          <Loader2 size={16} className="animate-spin" />
          <span>Đang tải video và cập nhật bài học...</span>
        </div>
      )}

      {error && (
        <div className="text-sm rounded-lg bg-red-50 text-red-700 px-3 py-2">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-sm rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 flex items-center gap-2">
          <UploadCloud size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {videoMediaId && (
        <div className="text-xs text-slate-600">
          Video Media ID:{" "}
          <span className="font-bold text-slate-900">{videoMediaId}</span>
        </div>
      )}

      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-[#3c6c44] hover:underline break-all"
        >
          Xem URL video đã gán
        </a>
      )}
    </div>
  );
};

export default LessonVideoUploader;
