import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { tokenStorage } from "../lib/auth";
import { Sparkles, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

const FrameStorePage: React.FC = () => {
  const { user } = useAuth();
  const [frames, setFrames] = useState<AvatarFrame[]>([]);
  const [ownedFrameIds, setOwnedFrameIds] = useState<number[]>([]);
  const [activeFrameId, setActiveFrameId] = useState<number | null>(null);
  const [userXp, setUserXp] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDataAndFrames = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch all active frames
      const framesRes = await fetch(`${API_BASE_URL}/api/avatar-frames`);
      let framesList: AvatarFrame[] = [];
      if (framesRes.ok) {
        framesList = await framesRes.json();
        setFrames(framesList);
      }

      // 2. Fetch User Profile for TotalXp and ActiveFrameId
      const profileRes = await fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserXp(profile.totalXp);
        setActiveFrameId(profile.activeFrameId);
      }

      // 3. Fetch owned frames list
      const ownedRes = await fetch(`${API_BASE_URL}/api/avatar-frames/my`, { headers });
      if (ownedRes.ok) {
        const ownedData: AvatarFrame[] = await ownedRes.json();
        setOwnedFrameIds(ownedData.map(f => f.id));
      }

      // 4. Fetch User avatar image url
      const userRes = await fetch(`${API_BASE_URL}/api/users/${user.id}`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.avatarMediaId) {
          const mediaRes = await fetch(`${API_BASE_URL}/api/media_assets/${userData.avatarMediaId}`, { headers });
          if (mediaRes.ok) {
            const media = await mediaRes.json();
            setAvatarUrl(media.fileUrl);
          }
        }
      }
    } catch (e) {
      console.error("Error loading frame store data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataAndFrames();
  }, [user]);

  const handleRedeem = async (frameId: number, price: number) => {
    if (userXp < price) {
      alert("Bạn không đủ điểm XP để đổi khung ảnh này.");
      return;
    }

    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/avatar-frames/${frameId}/redeem`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setUserXp(data.totalXp);
        setOwnedFrameIds(prev => [...prev, frameId]);
        alert("Đổi khung ảnh thành công!");
      } else {
        const errData = await res.json();
        alert(errData.message || "Đổi khung thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi kết nối đến server");
    }
  };

  const handleEquip = async (frameId: number | null) => {
    try {
      const token = tokenStorage.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/avatar-frames/equip`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ frameId }),
      });

      if (res.ok) {
        setActiveFrameId(frameId);
        window.dispatchEvent(new Event("avatarChanged")); // Update Avatar in Navbar
      } else {
        const errData = await res.json();
        alert(errData.message || "Trang bị thất bại");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi khi kết nối đến server");
    }
  };

  const displayName = user?.fullName || "Người dùng";
  const avatarSrc = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-[#3c6c44]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fcf9] to-white py-10 px-4 md:px-8 text-left">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/home-page"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#3c6c44] font-bold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Quay lại Trang chủ
          </Link>
          
          {/* XP Banner */}
          <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.02)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl text-[#3c6c44]">
              ⚡
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Số dư XP của bạn</p>
              <p className="text-lg font-black text-slate-800 leading-none mt-1">{userXp} XP</p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
            Cửa hàng Khung Ảnh Đại diện <Sparkles className="text-amber-500 fill-amber-500" size={24} />
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl font-medium">
            Tích lũy điểm XP thông qua các bài học hàng ngày để quy đổi những khung viền sang trọng, giúp bạn nổi bật trong bảng xếp hạng và các cuộc thi!
          </p>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {frames.map((frame) => {
            const isOwned = ownedFrameIds.includes(frame.id);
            const isActive = activeFrameId === frame.id;
            const canAfford = userXp >= frame.xpPrice;

            return (
              <div
                key={frame.id}
                className={`bg-white rounded-[32px] border ${
                  isActive ? "border-[#3c6c44] ring-2 ring-[#3c6c44]/10 shadow-lg" : "border-slate-100"
                } p-6 shadow-sm flex flex-col justify-between items-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative group`}
              >
                {/* Active Badge */}
                {isActive && (
                  <span className="absolute top-4 right-4 bg-emerald-100 border border-emerald-200 text-[#3c6c44] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 select-none">
                    <Check size={10} strokeWidth={3} /> Đang trang bị
                  </span>
                )}

                {/* Avatar Preview Section */}
                <div className="relative w-36 h-36 bg-slate-50 rounded-[28px] border border-slate-100 shadow-inner flex items-center justify-center overflow-hidden mb-6">
                  {/* Outer Frame overlay */}
                  <img
                    src={frame.imageUrl.startsWith("http") ? frame.imageUrl : `${API_BASE_URL}${frame.imageUrl}`}
                    alt={frame.name}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 p-0.5"
                  />
                  {/* Inner User Avatar Circle */}
                  <div
                    className="w-24 h-24 rounded-full bg-cover bg-center border border-slate-200/50 shadow-sm"
                    style={{
                      backgroundImage: `url('${avatarSrc}')`,
                    }}
                  />
                </div>

                {/* Info */}
                <div className="text-center space-y-1 w-full mb-6">
                  <h4 className="text-base font-black text-slate-800">{frame.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {isOwned ? "Đã sở hữu" : `Quy đổi: ⚡ ${frame.xpPrice} XP`}
                  </p>
                </div>

                {/* Button Action */}
                <div className="w-full">
                  {isActive ? (
                    <button
                      onClick={() => handleEquip(null)}
                      className="w-full py-3 border border-slate-200 text-slate-500 font-bold text-xs rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all"
                    >
                      Tháo khung
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(frame.id)}
                      className="w-full py-3 bg-[#3c6c44] hover:bg-[#315736] text-white font-bold text-xs rounded-2xl transition-all shadow-md"
                    >
                      Trang bị khung
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRedeem(frame.id, frame.xpPrice)}
                      disabled={!canAfford}
                      className={`w-full py-3 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg hover:shadow-amber-500/25"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span>⚡ Mở khóa bằng {frame.xpPrice} XP</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default FrameStorePage;
