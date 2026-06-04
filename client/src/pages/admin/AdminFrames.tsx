import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit3, Trash2, Upload, X } from "lucide-react";
import { tokenStorage } from "../../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface AvatarFrame {
  id: number;
  code: string;
  name: string;
  imageUrl: string;
  xpPrice: number;
  isActive: boolean;
  createdAt: string;
}

const AdminFrames: React.FC = () => {
  const [frames, setFrames] = useState<AvatarFrame[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editingFrame, setEditingFrame] = useState<AvatarFrame | null>(null);
  const [frameName, setFrameName] = useState("");
  const [frameXpPrice, setFrameXpPrice] = useState<number>(100);
  const [frameFile, setFrameFile] = useState<File | null>(null);
  const [frameFileUrl, setFrameFileUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFrames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/avatar-frames`);
      if (response.ok) {
        const data = await response.json();
        setFrames(data);
      }
    } catch (e) {
      console.error("Error fetching frames", e);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFrame(null);
    setFrameName("");
    setFrameXpPrice(100);
    setFrameFile(null);
    setFrameFileUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (frame: AvatarFrame) => {
    setEditingFrame(frame);
    setFrameName(frame.name);
    setFrameXpPrice(frame.xpPrice);
    setFrameFile(null);
    setFrameFileUrl(frame.imageUrl);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrameFile(file);
      setFrameFileUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameName.trim()) {
      alert("Vui lòng nhập tên khung");
      return;
    }

    setIsSaving(true);
    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      let finalImageUrl = frameFileUrl;

      // 1. If a new file is chosen, upload it to MediaAssets first
      if (frameFile) {
        const formData = new FormData();
        formData.append("file", frameFile);
        formData.append("storageProvider", "local");
        formData.append("fileName", frameFile.name);
        formData.append("mediaType", "Image");
        formData.append("mimeType", frameFile.type);

        const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Không thể tải tệp ảnh lên");
        }

        const mediaAsset = await uploadRes.json();
        finalImageUrl = mediaAsset.fileUrl;
      }

      if (!finalImageUrl) {
        alert("Vui lòng chọn ảnh khung đã xóa nền");
        setIsSaving(false);
        return;
      }

      // 2. Save Avatar Frame
      if (editingFrame) {
        const res = await fetch(`${API_BASE_URL}/api/avatar-frames/${editingFrame.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            name: frameName,
            imageUrl: finalImageUrl,
            xpPrice: frameXpPrice,
          }),
        });

        if (!res.ok) throw new Error("Cập nhật khung thất bại");
      } else {
        const res = await fetch(`${API_BASE_URL}/api/avatar-frames`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            name: frameName,
            imageUrl: finalImageUrl,
            xpPrice: frameXpPrice,
          }),
        });

        if (!res.ok) throw new Error("Thêm khung mới thất bại");
      }

      await fetchFrames();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã xảy ra lỗi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung ảnh này?")) return;

    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/avatar-frames/${id}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setFrames(prev => prev.filter(f => f.id !== id));
      } else {
        alert("Xóa khung ảnh thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi kết nối server");
    }
  };

  const filteredFrames = frames.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Cửa hàng khung</h3>
            <p className="text-slate-500">Quản lý danh sách các khung ảnh đại diện trong cửa hàng đổi điểm XP.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3c6c44] transition-colors size-5" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-[#3c6c44] rounded-xl transition-all shadow-sm outline-none"
                placeholder="Tìm kiếm tên khung..."
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3c6c44] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#3c6c44]/20 transition-all active:scale-[0.98]"
            >
              <Plus size={20} />
              <span>Thêm khung mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Frames */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Khung ảnh</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Xem trước</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã code</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Giá quy đổi</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFrames.length > 0 ? (
              filteredFrames.map((frame) => (
                <tr key={frame.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-base font-bold text-slate-900">{frame.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      {/* Placeholder Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                        AV
                      </div>
                      {/* Transparent Frame Image overlay */}
                      <img
                        src={frame.imageUrl.startsWith("http") ? frame.imageUrl : `${API_BASE_URL}${frame.imageUrl}`}
                        alt={frame.name}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">{frame.code}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-extrabold text-[#3c6c44] flex items-center gap-1">
                      ⚡ {frame.xpPrice} XP
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(frame)}
                        className="p-2 text-slate-400 hover:text-[#3c6c44] hover:bg-[#3c6c44]/10 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(frame.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-semibold">
                  Chưa có khung ảnh nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] max-w-[450px] w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-800 mb-6">
              {editingFrame ? "Chỉnh sửa khung ảnh" : "Thêm khung ảnh mới"}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Image Uploader */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#3c6c44]/50 rounded-2xl p-4 transition-all bg-slate-50/50 relative overflow-hidden group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/webp"
                  className="hidden"
                />

                {frameFileUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-24 h-24 bg-white rounded-full border border-slate-100 flex items-center justify-center overflow-hidden">
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                        Avatar
                      </div>
                      <img
                        src={frameFileUrl.startsWith("blob:") || frameFileUrl.startsWith("http") ? frameFileUrl : `${API_BASE_URL}${frameFileUrl}`}
                        alt="Preview Frame"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#3c6c44] font-bold hover:underline"
                    >
                      Chọn ảnh khác
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 py-4 cursor-pointer text-center"
                  >
                    <div className="p-3 bg-emerald-50 rounded-full text-[#3c6c44]">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Tải lên khung ảnh xóa phông</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Chấp nhận PNG hoặc WebP trong suốt</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Tên khung</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-[#3c6c44] rounded-xl outline-none text-sm font-semibold transition-all text-slate-800"
                    placeholder="ví dụ: Khung Mầm Non"
                    value={frameName}
                    onChange={e => setFrameName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Giá trị XP quy đổi</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-[#3c6c44] rounded-xl outline-none text-sm font-semibold transition-all text-slate-800"
                    placeholder="ví dụ: 100"
                    value={frameXpPrice}
                    onChange={e => setFrameXpPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#3c6c44] hover:bg-[#315736] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? "Đang lưu..." : "Lưu khung ảnh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFrames;
