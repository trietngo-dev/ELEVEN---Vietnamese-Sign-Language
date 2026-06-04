import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  LogOut,
  Settings,
  Bell,
  BookOpen,
  Clock,
  Crown,
  Save,
  Flame,
  Trophy,
  CheckCircle,
  Lock,
  Shield,
  User,
  Calendar,
  Mail,
  Bookmark,
  Pencil,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { tokenStorage } from "../lib/auth";

import userBg1 from "../assets/user_background_1.png";
import userBg2 from "../assets/user_background_2.png";
import userBg3 from "../assets/user_background_3.png";

const BACKGROUNDS = [userBg1, userBg2, userBg3];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);

  // UI edit menu state
  const [showEditMenu, setShowEditMenu] = useState(false);

  // Profile data states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  // Change password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Notification options states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [notifSavedMessage, setNotifSavedMessage] = useState("");

  // Subscription states
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  // User stats states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeFrameUrl, setActiveFrameUrl] = useState<string | null>(null);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [vocabCount, setVocabCount] = useState<number>(0);
  const [badgesCount, setBadgesCount] = useState<number>(0);
  const [learningHours, setLearningHours] = useState<number>(0);
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(0);
  const [loginStreak, setLoginStreak] = useState<number>(0);

  // Select deterministic random background cover based on user.id
  const coverBg = BACKGROUNDS[(user?.id || 0) % BACKGROUNDS.length];

  // Load avatar and frame dynamically
  const loadAvatarAndFrame = () => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE_URL}/api/users/${user.id}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((userData) => {
        if (userData && userData.avatarMediaId) {
          return fetch(`${API_BASE_URL}/api/media_assets/${userData.avatarMediaId}`, { headers });
        }
        return null;
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((mediaData) => {
        if (mediaData && mediaData.fileUrl) {
          setAvatarUrl(mediaData.fileUrl);
        } else {
          setAvatarUrl(null);
        }
      })
      .catch((e) => console.error("Error loading user avatar in ProfilePage", e));

    fetch(`${API_BASE_URL}/api/user_profiles/${user.id}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((profileData) => {
        if (profileData && profileData.activeFrameId) {
          fetch(`${API_BASE_URL}/api/avatar-frames`, { headers })
            .then(res => res.ok ? res.json() : [])
            .then((frames: any[]) => {
              const activeFrame = frames.find(f => f.id === profileData.activeFrameId);
              if (activeFrame) {
                setActiveFrameUrl(activeFrame.imageUrl);
              } else {
                setActiveFrameUrl(null);
              }
            })
            .catch(() => setActiveFrameUrl(null));
        } else {
          setActiveFrameUrl(null);
        }
      })
      .catch(() => setActiveFrameUrl(null));
  };

  useEffect(() => {
    loadAvatarAndFrame();

    const handleAvatarChange = () => {
      loadAvatarAndFrame();
    };

    window.addEventListener("avatarChanged", handleAvatarChange);
    return () => {
      window.removeEventListener("avatarChanged", handleAvatarChange);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          setName(user.fullName || "");
        }
      })
      .catch(() => {
        setName(user?.fullName || "");
      });
  }, [user]);

  // Load active subscription & plans from API
  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/api/user_subscriptions/current`, { headers })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.status === 0) {
          setActiveSub(data);
        } else {
          setActiveSub(null);
        }
      })
      .catch(() => setActiveSub(null));

    fetch(`${API_BASE_URL}/api/subscription_plans`, { headers })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.items) {
          setPlans(data.items);
        } else if (Array.isArray(data)) {
          setPlans(data);
        }
      })
      .catch(() => { });
  }, [user]);

  // Load real user stats & login streak
  useEffect(() => {
    if (!user?.id) return;
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch activity logs to calculate login streak
    fetch(`${API_BASE_URL}/api/user_activity_logs`, { headers })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = data.items || (Array.isArray(data) ? data : data.items) || [];
        const loginLogs = items.filter((log: any) => log.userId === user.id && log.actionType === "login");

        const uniqueDates = Array.from(new Set(
          loginLogs.map((log: any) => {
            const date = new Date(log.createdAt || log.timestamp);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
          })
        )).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime()) as string[];

        const todayStr = new Date(Date.now() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000 - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];

        let streak = 0;
        if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
          streak = 1;
          const startCheckStr = uniqueDates.includes(todayStr) ? todayStr : yesterdayStr;
          const startIndex = uniqueDates.indexOf(startCheckStr);
          let checkTime = new Date(startCheckStr).getTime();

          for (let i = startIndex + 1; i < uniqueDates.length; i++) {
            const prevTime = new Date(uniqueDates[i]).getTime();
            const diffDays = Math.round((checkTime - prevTime) / 86400000);
            if (diffDays === 1) {
              streak++;
              checkTime = prevTime;
            } else if (diffDays > 1) {
              break;
            }
          }
        }
        setLoginStreak(streak);
      })
      .catch((e) => {
        console.error("Error loading user login streak", e);
        setLoginStreak(0);
      });

    // 2. Fetch lesson progress (completed lessons and learning hours)
    fetch(`${API_BASE_URL}/api/user_lesson_progress`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const items = data.items || (Array.isArray(data) ? data : []);
          const userProgress = items.filter((p: any) => p.userId === user.id);

          const completed = userProgress.filter((p: any) => p.status === 2 || p.completedAt).length;
          setCompletedLessonsCount(completed);
          setVocabCount(completed);

          const totalSeconds = userProgress.reduce((sum: number, p: any) => sum + (p.totalTimeSeconds || 0), 0);
          const calculatedHours = parseFloat((totalSeconds / 3600).toFixed(1));
          setLearningHours(calculatedHours);

          const uniqueCourses = new Set(userProgress.map((p: any) => p.courseId).filter(Boolean));
          setCoursesCount(uniqueCourses.size);
        } else {
          setCompletedLessonsCount(0);
          setVocabCount(0);
          setLearningHours(0);
          setCoursesCount(0);
        }
      })
      .catch((e) => {
        console.error("Error loading user lesson stats", e);
        setCompletedLessonsCount(0);
        setVocabCount(0);
        setLearningHours(0);
        setCoursesCount(0);
      });

    // 3. Fetch all system badges
    fetch(`${API_BASE_URL}/api/badges?page=1&pageSize=100`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAllBadges(data.items || (Array.isArray(data) ? data : []));
        }
      })
      .catch(() => { });

    // 4. Fetch user badges
    fetch(`${API_BASE_URL}/api/user_badges?page=1&pageSize=100`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const items = data.items || (Array.isArray(data) ? data : []);
          const filtered = items.filter((b: any) => b.userId === user.id);
          setUserBadges(filtered);
          setBadgesCount(filtered.length);
        } else {
          setBadgesCount(0);
          setUserBadges([]);
        }
      })
      .catch((e) => {
        console.error("Error loading user badges", e);
        setBadgesCount(0);
        setUserBadges([]);
      });
  }, [user]);

  const activePlan = activeSub ? plans.find(p => p.id === activeSub.planId) : null;

  // Save personal profile details
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setProfileSuccess("");
    setProfileError("");

    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const body = JSON.stringify({
      fullName: name,
      phone,
      bio,
      avatarUrl: profile?.avatarUrl
    });

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
        setProfileSuccess("Cập nhật hồ sơ cá nhân thành công!");
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError("Không thể cập nhật hồ sơ, vui lòng thử lại.");
        setTimeout(() => setProfileError(""), 4000);
      }
    } catch (err) {
      console.error(err);
      setProfileError("Lỗi kết nối máy chủ khi lưu hồ sơ.");
      setTimeout(() => setProfileError(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Change password call
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 8 ký tự!");
      return;
    }

    setIsChangingPassword(true);
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/change-password`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (res.ok) {
        setPasswordSuccess("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 4000);
      } else {
        const errorData = await res.json().catch(() => null);
        const errMsg = errorData?.message || errorData?.error || "Mật khẩu hiện tại không đúng.";
        setPasswordError(errMsg);
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Lỗi hệ thống khi đổi mật khẩu, vui lòng thử lại sau.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Notification configuration toggle
  const toggleNotification = (type: "email" | "reminder") => {
    if (type === "email") {
      setEmailNotifications(!emailNotifications);
    } else {
      setStudyReminders(!studyReminders);
    }
    setNotifSavedMessage("Đã lưu tùy chọn thông báo tự động.");
    setTimeout(() => setNotifSavedMessage(""), 3000);
  };

  // Avatar uploading
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/api/media_assets/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Tải ảnh lên thất bại");
      }

      const mediaAsset = await uploadRes.json();
      const newAvatarUrl = mediaAsset.fileUrl;
      const mediaId = mediaAsset.id;

      const patchRes = await fetch(`${API_BASE_URL}/api/users/${user.id}/avatar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ avatarMediaId: mediaId }),
      });

      if (!patchRes.ok) {
        throw new Error("Cập nhật avatar người dùng thất bại");
      }

      setAvatarUrl(newAvatarUrl);
      window.dispatchEvent(new Event("avatarChanged"));

      const authUser = tokenStorage.getUser();
      if (authUser) {
        authUser.avatarMediaId = mediaId;
        tokenStorage.setUser(authUser);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải ảnh đại diện lên!");
    }
  };

  const displayName = name || user?.fullName || "Người dùng";
  const displayEmail = user?.email || "";
  const avatarSrc =
    avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  const renderSubscriptionCard = () => {
    const planCode = activePlan?.code?.toLowerCase();

    if (planCode === "premium") {
      return (
        <div className="bg-gradient-to-br from-[#1d1607] via-[#3d2e11] to-[#1d1607] rounded-2xl p-4 text-white relative overflow-hidden border-2 border-[#efca4c] shadow-[0_4px_20px_rgba(239,202,76,0.25)] animate-shimmer h-full flex flex-col justify-between">
          <style>{`
            @keyframes shimmer-sweep {
              0% { transform: translateX(-150%) rotate(45deg); }
              100% { transform: translateX(150%) rotate(45deg); }
            }
            .animate-shimmer {
              position: relative;
              overflow: hidden;
            }
            .animate-shimmer::after {
              content: '';
              position: absolute;
              top: 0; left: -50%; width: 200%; height: 100%;
              background: linear-gradient(
                to right,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.25) 50%,
                rgba(255,255,255,0) 100%
              );
              transform: skewX(-25deg);
              animation: shimmer-sweep 3.5s infinite linear;
            }
          `}</style>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#efca4c]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Crown size={14} className="text-[#efca4c]" />
              <span className="text-[9px] font-black text-[#efca4c] uppercase tracking-widest">Tài khoản cao cấp</span>
            </div>
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffe885] via-white to-[#ffe885]">Gói Cao cấp</h3>
          </div>
          <div className="mt-3 relative z-10 border-t border-[#efca4c]/20 pt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-[#efe8d5]/70">Trạng thái: Đang hoạt động</span>
            {activeSub && (
              <span className="text-[#efca4c] font-bold">
                Hạn: {new Date(activeSub.endAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (planCode === "pro") {
      return (
        <div className="bg-gradient-to-br from-[#0c141d] via-[#172738] to-[#0c141d] rounded-2xl p-4 text-white relative overflow-hidden border border-[#52a6ff]/50 shadow-[0_4px_15px_rgba(82,166,255,0.15)] h-full flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#52a6ff]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Crown size={14} className="text-[#52a6ff]" />
              <span className="text-[9px] font-black text-[#52a6ff] uppercase tracking-widest">Thành viên Pro</span>
            </div>
            <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#98c9ff] via-white to-[#98c9ff]">Gói Chuyên nghiệp</h3>
          </div>
          <div className="mt-3 relative z-10 border-t border-[#52a6ff]/20 pt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-[#d0dded]/70">Trạng thái: Đang hoạt động</span>
            {activeSub && (
              <span className="text-[#52a6ff] font-bold">
                Hết hạn: {new Date(activeSub.endAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-[#12221b] to-[#1e3a2d] rounded-2xl p-4 text-white relative overflow-hidden border border-[#52b788]/20 shadow-[0_4px_15px_rgba(36,76,56,0.12)] h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#52b788]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Crown size={14} className="text-[#52b788]" />
            <span className="text-[9px] font-black text-[#52b788] uppercase tracking-widest">Thành viên cơ bản</span>
          </div>
          <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b2] via-white to-[#8be0b2]">Gói Cơ bản</h3>
          <p className="text-[10px] text-[#a4c7b6] mt-0.5">Trải nghiệm các khóa học miễn phí</p>
        </div>
        <Link
          to="/nang-cap"
          className="mt-3.5 block w-full py-2 rounded-xl bg-white text-slate-800 font-extrabold text-xs text-center hover:bg-slate-50 transition-colors shadow-sm relative z-10 active:scale-95"
        >
          Nâng cấp Premium
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent py-8 md:py-12 text-slate-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Banner Cover Photo */}
        <div className="relative h-44 md:h-64 w-full rounded-t-3xl overflow-hidden shadow-sm">
          <img
            src={coverBg}
            alt="Profile Cover Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 z-0" />
        </div>

        {/* Profile Card Header (Normal Flow - No Overlap into Cover Photo) */}
        <div className="bg-white rounded-b-3xl border-x border-b border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative z-10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">

            {/* Left Column: Avatar + Profile text info */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">

              {/* Avatar (NO NEGATIVE MARGIN) */}
              <div
                className="relative cursor-pointer shrink-0 w-36 h-36 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full overflow-visible"
                onClick={() => setShowEditMenu(!showEditMenu)}
              >
                {/* Profile Avatar Circle */}
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border border-slate-200 shadow-sm object-cover bg-white hover:brightness-95 transition-all duration-300 animate-fade-in"
                />
                {/* Frame Overlay */}
                {activeFrameUrl && (
                  <img
                    src={activeFrameUrl.startsWith("http") ? activeFrameUrl : `${API_BASE_URL}${activeFrameUrl}`}
                    alt="Active Frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                  />
                )}
                <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#2d6a4f] rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-[#1e3a2f] transition-colors duration-200 z-25">
                  <Pencil size={14} className="text-white" />
                </div>

                {/* Dropdown Menu for editing */}
                {showEditMenu && (
                  <div
                    ref={editMenuRef}
                    className="absolute top-[80%] left-[50%] -translate-x-1/2 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-30 animate-dropdownFade text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <style>{`
                      @keyframes dropdownFade {
                        from { opacity: 0; transform: translate(-50%, 8px); }
                        to { opacity: 1; transform: translate(-50%, 0); }
                      }
                      .animate-dropdownFade {
                        animation: dropdownFade 0.2s ease-out forwards;
                      }
                    `}</style>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-[#2d6a4f] flex items-center gap-2 transition-colors"
                    >
                      <Camera size={14} />
                      Đổi ảnh đại diện
                    </button>
                    <Link
                      to="/cua-hang-khung"
                      onClick={() => setShowEditMenu(false)}
                      className="w-full px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-[#2d6a4f] flex items-center gap-2 transition-colors"
                    >
                      <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                      Đổi khung ảnh
                    </Link>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Text Info */}
              <div className="space-y-2 mt-1 md:mt-0 max-w-xl">
                <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{displayName}</h1>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="bg-[#eef6f1] text-[#2d6a4f] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider self-center inline-block">
                      {user?.role === "admin" ? "Quản trị viên" : "Học viên VSL"}
                    </span>
                    <Link
                      to="/cua-hang-khung"
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider self-center inline-flex items-center gap-1 transition-all"
                    >
                      Đổi khung ngay!
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {displayEmail}
                  </span>
                  <span className="hidden md:inline text-slate-200">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> Thành viên từ: 2026
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md mt-2">
                  {profile?.bio || "Học viên tại Eleven. Cùng thực hành Ngôn ngữ Ký hiệu Việt Nam mỗi ngày!"}
                </p>
              </div>
            </div>

            {/* Right Column: Subscription Card (Horizontal Aligned with Avatar) */}
            <div className="w-full md:w-72 shrink-0 z-10 mt-2 md:mt-0">
              {renderSubscriptionCard()}
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-2 text-sm font-black transition-all border-b-2 relative -mb-[2px] ${activeTab === "overview"
              ? "border-[#2d6a4f] text-[#2d6a4f]"
              : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <Trophy size={15} /> Tổng quan học tập
            </span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-4 px-2 text-sm font-black transition-all border-b-2 relative -mb-[2px] ${activeTab === "settings"
              ? "border-[#2d6a4f] text-[#2d6a4f]"
              : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <Settings size={15} /> Cài đặt
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "overview" ? (
          /* OVERVIEW TAB CONTENT */
          <div className="space-y-8 animate-fadeIn">
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out forwards;
              }
            `}</style>

            {/* Bento Grid Stats */}
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Các chỉ số học tập</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {/* Courses count */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/30">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Khóa học</p>
                    <p className="text-base font-black text-slate-800 mt-1">{coursesCount} khóa</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Đang học</p>
                  </div>
                </div>

                {/* Vocab count */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100/30">
                    <Bookmark size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Từ đã học</p>
                    <p className="text-base font-black text-slate-800 mt-1">{vocabCount} từ</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Đã hoàn thành</p>
                  </div>
                </div>

                {/* Badges count */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/30">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Huy hiệu</p>
                    <p className="text-base font-black text-slate-800 mt-1">{badgesCount} huy hiệu</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Đã mở khóa</p>
                  </div>
                </div>

                {/* Learning hours */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/30">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Thời gian học</p>
                    <p className="text-base font-black text-slate-800 mt-1">{learningHours} giờ</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Tích lũy tuần</p>
                  </div>
                </div>

                {/* Completed lessons */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/30">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Bài học</p>
                    <p className="text-base font-black text-slate-800 mt-1">{completedLessonsCount} bài</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Hoàn thành</p>
                  </div>
                </div>

                {/* Login streak */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(24,35,51,0.015)] hover:shadow-md transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/30">
                    <Flame size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Chuỗi đăng nhập</p>
                    <p className="text-base font-black text-slate-800 mt-1">{loginStreak} ngày</p>
                    <p className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Liên tiếp</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Badges Achievements */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.01)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-800">Bộ sưu tập huy hiệu</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-wide">Mở khóa thông qua tiến độ học tập hàng ngày</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-6">
                {allBadges.length > 0 ? (
                  allBadges.map((badge) => {
                    const isEarned = userBadges.some(ub => ub.badgeId === badge.id);

                    const emojiMap: Record<string, string> = {
                      START: "🚀",
                      STREAK_7D: "🌟",
                      STREAK_3D: "🔥",
                      STREAK_5D: "⚡",
                      STREAK_30D: "👑",
                      STREAK_365D: "🏆",
                      DETERMINED: "🎯",
                      COLLECTOR: "🎒"
                    };
                    const emoji = emojiMap[badge.code] || "🏅";

                    return (
                      <div
                        key={badge.id}
                        className={`flex flex-col items-center text-center gap-2 group cursor-pointer ${!isEarned ? "opacity-45" : ""}`}
                        title={badge.description}
                      >
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${isEarned
                          ? badge.code === "COLLECTOR" ? "from-purple-100 to-indigo-300" :
                            badge.code === "DETERMINED" ? "from-yellow-100 to-amber-300" :
                              badge.code.startsWith("STREAK") ? "from-red-100 to-orange-300" :
                                "from-sky-100 to-blue-300"
                          : "from-slate-100 to-slate-200"
                          } p-0.5 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl transition-all duration-300">
                            {emoji}
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700 mt-1">{badge.name}</span>
                        <span className={`text-[9px] font-semibold uppercase leading-none px-2 py-0.5 rounded-full border ${isEarned ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-100"
                          }`}>
                          {isEarned ? "Đã nhận" : "Khóa"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-6 text-center text-slate-400 text-xs font-semibold select-none">
                    Đang tải danh hiệu...
                  </div>
                )}
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.01)]">
              <h3 className="text-base font-black text-slate-800 mb-5">Liên kết tài khoản</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email đăng nhập</span>
                  <span className="text-sm font-semibold text-slate-700">{displayEmail}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số điện thoại liên lạc</span>
                    <span className="text-sm font-semibold text-slate-700">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Log out section (Centered horizontally) */}
            <div className="pt-2 flex justify-center w-full">
              <button
                onClick={logout}
                className="px-8 py-3 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95"
              >
                <LogOut size={16} /> Đăng xuất tài khoản
              </button>
            </div>
          </div>
        ) : (
          /* SETTINGS TAB CONTENT - INLINE */
          <div className="space-y-6 animate-fadeIn">

            {/* Success/Error displays for Profile save */}
            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-55 bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-xs leading-none">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-semibold text-xs leading-none">
                {profileError}
              </div>
            )}

            {/* Card 1: Personal Profile Editing Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.015)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-[#eef6f1] text-[#2d6a4f] flex items-center justify-center border border-emerald-100/20">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Thông tin cá nhân</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Cập nhật họ tên, điện thoại và phần tiểu sử</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Họ và tên</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Giới thiệu bản thân</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Mô tả tóm tắt về bản thân..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-10 px-6 rounded-xl bg-[#2d6a4f] text-white font-extrabold text-xs shadow-md shadow-[#2d6a4f]/10 hover:bg-[#20503a] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95"
                  >
                    <Save size={13} />
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Security Change Password Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.015)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100/20">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Đổi mật khẩu tài khoản</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Thay đổi mật khẩu đăng nhập để bảo mật thông tin</p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-xs leading-none animate-fadeIn">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 font-semibold text-xs leading-none animate-fadeIn">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 w-full">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="•••••••• (tối thiểu 8 ký tự)"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2d6a4f] focus:ring-4 focus:ring-[#2d6a4f]/10 transition-all text-xs font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="h-10 px-6 rounded-xl bg-[#2d6a4f] text-white font-extrabold text-xs shadow-md shadow-[#2d6a4f]/10 hover:bg-[#20503a] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95"
                  >
                    <Shield size={13} />
                    {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 3: Notification Configuration checkboxes */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(24,35,51,0.015)]">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/20">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Cấu hình thông báo</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Cài đặt các kênh thông báo học tập của hệ thống</p>
                  </div>
                </div>
                {notifSavedMessage && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse border border-emerald-100">
                    {notifSavedMessage}
                  </span>
                )}
              </div>

              <div className="space-y-4 w-full">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => toggleNotification("email")}
                    className="mt-1 w-4 h-4 text-[#2d6a4f] bg-slate-100 border-slate-300 rounded focus:ring-[#2d6a4f]/20 focus:ring-2"
                  />
                  <div className="-mt-0.5">
                    <p className="text-xs font-bold text-slate-700">Email báo cáo học tập tuần</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Nhận báo cáo tiến độ và bảng xếp hạng thi đua hàng tuần qua hòm thư điện tử.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={studyReminders}
                    onChange={() => toggleNotification("reminder")}
                    className="mt-1 w-4 h-4 text-[#2d6a4f] bg-slate-100 border-slate-300 rounded focus:ring-[#2d6a4f]/20 focus:ring-2"
                  />
                  <div className="-mt-0.5">
                    <p className="text-xs font-bold text-slate-700">Thông báo nhắc học hàng ngày</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Nhận thông báo nhắc nhở rèn luyện trên trình duyệt khi sắp đứt chuỗi đăng nhập liên tiếp.</p>
                  </div>
                </label>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
