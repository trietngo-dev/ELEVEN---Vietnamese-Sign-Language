import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Camera, Edit2, LogOut, Settings, Bell, BookOpen, Clock, Crown, ChevronRight, X, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { tokenStorage } from "../lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface UserProfile {
  userId: number;
  fullName?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: number;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from API
  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setName(data.fullName || user.fullName || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
        } else {
          // No profile yet — pre-fill from auth user
          setName(user.fullName || "");
        }
      })
      .catch(() => {
        setName(user?.fullName || "");
      });
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    const token = tokenStorage.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const body = JSON.stringify({ fullName: name, phone, bio });
    try {
      let res: Response;
      if (profile) {
        res = await fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, {
          method: "PUT",
          headers,
          body,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/user_profiles`, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId: user.id, fullName: name, phone, bio }),
        });
      }
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = name || user?.fullName || "Người dùng";
  const displayEmail = user?.email || "";
  const avatarSrc =
    profile?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <div className="min-h-screen bg-[#f6f8f7] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header avatar strip */}
        <div className="h-32 rounded-3xl bg-gradient-to-r from-[#1e3a2f] to-[#2d6a4f] mb-0" />

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 -mt-16">
          {/* ─── Left column ─── */}
          <div className="space-y-4">
            {/* Card: avatar + basic info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div
                className="relative cursor-pointer group mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#2d6a4f] rounded-full flex items-center justify-center border-2 border-white shadow group-hover:bg-[#1e3a2f] transition-colors">
                  <Camera size={12} className="text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <h2 className="text-lg font-bold text-slate-800">{displayName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{displayEmail}</p>

              <div className="w-full border-t border-slate-100 mt-5 pt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Khóa học", value: "12" },
                  { label: "Từ vựng", value: "158" },
                  { label: "Huy hiệu", value: "5" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-black text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card: subscription */}
            <div className="bg-gradient-to-br from-[#1a2e22] to-[#2d5a3d] rounded-3xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Tài khoản</span>
                </div>
                <h3 className="text-xl font-black mb-4">Gói Cơ bản</h3>
                <Link
                  to="/nang-cap"
                  className="block w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm text-center hover:bg-slate-100 transition-colors"
                >
                  Nâng cấp Premium
                </Link>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full py-3 rounded-2xl bg-white text-red-500 font-bold border border-red-100 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm text-sm"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>

          {/* ─── Right column ─── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing ? "Chỉnh sửa hồ sơ" : "Tổng quan học tập"}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  isEditing
                    ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    : "bg-[#eef6f1] text-[#2d6a4f] hover:bg-[#d9eee5]"
                }`}
              >
                {isEditing ? (
                  <>
                    <X size={15} /> Hủy
                  </>
                ) : (
                  <>
                    <Edit2 size={15} /> Sửa hồ sơ
                  </>
                )}
              </button>
            </div>

            <div className="p-7">
              {isEditing ? (
                /* EDIT MODE */
                <form className="space-y-5 max-w-lg" onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Họ và tên</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-slate-800 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-600">Giới thiệu bản thân</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-slate-800 resize-none font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-xl bg-[#2d6a4f] text-white font-bold shadow-lg shadow-[#2d6a4f]/30 hover:bg-[#255c43] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Save size={16} />
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </form>
              ) : (
                /* VIEW MODE */
                <div className="space-y-9">
                  {/* Stats */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Hoạt động gần đây</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-500">Thời gian học tuần này</p>
                          <p className="text-xl font-black text-slate-800">4.5 giờ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-500">Bài học hoàn thành</p>
                          <p className="text-xl font-black text-slate-800">12 bài</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account info */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Thông tin tài khoản</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">Email</span>
                        <span className="text-sm text-slate-500">{displayEmail}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
                          <span className="text-sm text-slate-500">{profile.phone}</span>
                        </div>
                      )}
                      {profile?.bio && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-sm font-semibold text-slate-700 block mb-1">Giới thiệu</span>
                          <span className="text-sm text-slate-500">{profile.bio}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Huy hiệu đạt được</p>
                      <button className="text-xs font-bold text-[#2d6a4f] hover:underline">Xem tất cả</button>
                    </div>
                    <div className="flex gap-4">
                      {[{ emoji: "🎯", name: "Quyết tâm", color: "from-yellow-200 to-amber-400" }, { emoji: "🚀", name: "Khởi đầu", color: "from-sky-200 to-blue-400" }].map((b) => (
                        <div key={b.name} className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${b.color} p-0.5 group-hover:scale-105 transition-transform`}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">{b.emoji}</div>
                          </div>
                          <span className="text-xs font-bold text-slate-600">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings links */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4">Cài đặt</p>
                    <div className="space-y-2">
                      {[{ icon: Bell, label: "Cài đặt thông báo" }, { icon: Settings, label: "Bảo mật tài khoản" }].map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          className="w-full p-4 rounded-xl border border-slate-100 bg-white hover:border-[#2d6a4f] flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-[#eef6f1] group-hover:text-[#2d6a4f] transition-colors">
                              <Icon size={16} />
                            </div>
                            <span className="font-semibold text-sm text-slate-700">{label}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
