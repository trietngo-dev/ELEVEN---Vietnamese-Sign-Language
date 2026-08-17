import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { viText } from "../locales/vi";
import { cn } from "../lib/utils";
import brand from "../assets/brand.jpg";

import { useAuth } from "../context/AuthContext";
import { LogOut, Bell, Crown, BookOpen, Clock, Trash2, Square, CheckSquare, X, Bookmark, Store } from "lucide-react";
import { tokenStorage } from "../lib/auth";
import { notificationsApi, type NotificationItem } from "../lib/notifications";
import ConfirmModal from "./ConfirmModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Navbar() {
  const { common, navbar } = viText;
  const { isAuthenticated, user, requestLogout } = useAuth();
  const location = useLocation();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeFrameUrl, setActiveFrameUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isLandingPage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  // Sync avatar image
  const fetchAvatar = () => {
    if (!isAuthenticated || !user?.id) {
      setAvatarUrl(null);
      setActiveFrameUrl(null);
      return;
    }
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch user profile for ActiveFrameId and load frame details
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

    // 2. Fetch User avatar image url
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
      .catch(() => { });
  };

  useEffect(() => {
    fetchAvatar();

    const handleAvatarChange = () => {
      fetchAvatar();
    };

    window.addEventListener("avatarChanged", handleAvatarChange);
    return () => {
      window.removeEventListener("avatarChanged", handleAvatarChange);
    };
  }, [isAuthenticated, user]);

  const fetchSavedCount = () => {
    if (!isAuthenticated || !user?.id) {
      setSavedCount(0);
      return;
    }
    const token = tokenStorage.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API_BASE_URL}/api/user_vocabulary_progress?pageSize=1000`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const progressItems = data.items || (Array.isArray(data) ? data : data.items) || [];
          const userSavedProgress = progressItems.filter(
            (p: any) => p.userId === user.id && p.isSaved === true
          );
          setSavedCount(userSavedProgress.length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSavedCount();

    const handleSavedWordsChange = () => {
      fetchSavedCount();
    };

    window.addEventListener("savedWordsChanged", handleSavedWordsChange);
    const interval = setInterval(fetchSavedCount, 15000);

    return () => {
      window.removeEventListener("savedWordsChanged", handleSavedWordsChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, user]);

  // Load user notifications
  const fetchNotifications = () => {
    if (!isAuthenticated || !user?.id) return;
    notificationsApi.getUserNotifications(user.id).then(data => {
      setNotifications(data);
    });
  };

  useEffect(() => {
    fetchNotifications();

    // Check for notifications periodically (every 10 seconds)
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    const ok = await notificationsApi.markAsRead(item.id, item);
    if (ok) {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    const ok = await Promise.all(unread.map(n => notificationsApi.markAsRead(n.id, n)));
    if (ok.every(res => res)) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteSingle = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Xóa thông báo",
      message: "Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        const ok = await notificationsApi.deleteNotification(id);
        if (ok) {
          setNotifications(prev => prev.filter(n => n.id !== id));
          setSelectedIds(prev => prev.filter(item => item !== id));
          if (selectedNotif?.id === id) {
            setShowDetailModal(false);
          }
        } else {
          alert("Xóa thông báo thất bại.");
        }
      }
    });
  };

  const handleToggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Xóa các thông báo đã chọn",
      message: `Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        const success = await notificationsApi.deleteMultiple(selectedIds);
        if (success) {
          setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
          setSelectedIds([]);
        } else {
          alert("Xóa một số thông báo thất bại. Vui lòng thử lại.");
        }
      }
    });
  };

  const handleDeleteAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notifications.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Xóa tất cả thông báo",
      message: "Bạn có chắc chắn muốn xóa toàn bộ thông báo? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        const ids = notifications.map(n => n.id);
        const success = await notificationsApi.deleteMultiple(ids);
        if (success) {
          setNotifications([]);
          setSelectedIds([]);
        } else {
          alert("Xóa thông báo thất bại.");
        }
      }
    });
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await handleMarkAsRead(item);
    }
    setSelectedNotif(item);
    setShowDetailModal(true);
    setShowNotifications(false);
  };

  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingPage]);

  const displayName = user?.fullName || "User";
  const avatarSrc = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <>
      <header className={cn(
        "z-50 transition-all duration-300",
        isLandingPage
          ? scrolled
            ? "fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-emerald-50/10 shadow-sm shadow-[#3c6c44]/[0.02]"
            : "absolute top-0 left-0 right-0 bg-transparent border-none"
          : "sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100/50 shadow-sm shadow-slate-100/10"
      )}>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex min-h-[72px] items-center justify-between gap-4 py-2">
          {/* Brand / Logo (Sát trái) */}
          <div className="flex items-center justify-start flex-1 min-w-0">
            <NavLink
              to={
                isAuthenticated
                  ? user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/home-page"
                  : "/"
              }
              className="inline-flex items-center gap-2.5 shrink-0 animate-fade-in"
              aria-label={navbar.brandAriaLabel}
            >
              <img
                src={brand}
                alt={common.brandName}
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
              <span className="text-xl font-bold text-[#29613d]">
                {common.brandName}
              </span>
            </NavLink>
          </div>

          {/* Navigation (Ở giữa) */}
          <nav aria-label={navbar.navAriaLabel} className="hidden md:flex items-center justify-center shrink-0">
            <ul className="m-0 flex list-none items-center gap-8 p-0">
              {navbar.items
                .filter(item => isAuthenticated || item.to !== "/tu-dien")
                .map((item) => {
                  const resolveTo = item.to === "/" && isAuthenticated ? "/home-page" : item.to;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={resolveTo}
                        className={({ isActive }) =>
                          cn(
                            "relative py-1 border-b-2 border-transparent pb-1 text-[17px] font-semibold text-slate-600 transition-colors hover:text-[#3c6c44]",
                            isActive &&
                            "text-[#3c6c44] font-extrabold border-[#3c6c44]",
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
            </ul>
          </nav>

          {/* Auth & Notifications (Sát phải) */}
          <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 sm:gap-4 relative" ref={popoverRef}>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                      "p-2 text-slate-500 hover:text-[#3c6c44] hover:bg-slate-100/50 rounded-full transition-all duration-200 shrink-0 relative",
                      showNotifications && "bg-slate-100 text-[#3c6c44]"
                    )}
                    title="Thông báo"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Glassmorphic Popover */}
                  {showNotifications && (
                    <div className="fixed inset-x-4 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2.5 w-auto sm:w-[360px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_15px_35px_rgba(24,35,51,0.08)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200 text-left">
                      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-800">Thông báo</span>
                        <div className="flex gap-2.5">
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-[#3c6c44] hover:underline" title="Đánh dấu tất cả là đã đọc">
                              Đọc tất cả
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button onClick={handleDeleteAll} className="text-[10px] font-bold text-red-500 hover:underline" title="Xóa toàn bộ thông báo">
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sub-header for bulk deletion */}
                      {selectedIds.length > 0 && (
                        <div className="px-5 py-2 bg-red-50/50 border-b border-slate-100 flex items-center justify-between animate-in slide-in-from-top-1 duration-100">
                          <span className="text-[10px] font-bold text-red-600">Đã chọn {selectedIds.length} thông báo</span>
                          <button onClick={handleDeleteSelected} className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1">
                            <Trash2 size={12} /> Xóa đã chọn
                          </button>
                        </div>
                      )}

                      <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-50 scrollbar-none">
                        {notifications.length > 0 ? (
                          notifications.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => handleNotificationClick(item)}
                                className={cn(
                                  "px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors relative items-start group",
                                  !item.isRead && "bg-emerald-50/[0.08]"
                                )}
                              >
                                {/* Selection Checkbox */}
                                <div
                                  onClick={(e) => handleToggleSelect(item.id, e)}
                                  className="mt-2 text-slate-400 hover:text-[#3c6c44] transition-colors shrink-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="h-4.5 w-4.5 text-[#3c6c44]" />
                                  ) : (
                                    <Square className="h-4.5 w-4.5 text-slate-300" />
                                  )}
                                </div>

                                <div className="mt-1.5 shrink-0">
                                  {item.type === "subscription" ? (
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100/30">
                                      <Crown className="h-4 w-4 text-amber-600" />
                                    </div>
                                  ) : item.type === "learning" ? (
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/30">
                                      <BookOpen className="h-4 w-4 text-emerald-600" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/30">
                                      <Clock className="h-4 w-4 text-blue-600" />
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                                  <p className={cn(
                                    "text-xs text-slate-800 leading-snug break-words",
                                    !item.isRead ? "font-extrabold" : "font-semibold"
                                  )}>
                                    {item.title}
                                  </p>
                                  <p className="text-[11px] text-slate-500 leading-normal break-words font-medium">
                                    {item.message}
                                  </p>
                                  <span className="text-[9px] font-semibold text-slate-400 block pt-1 select-none">
                                    {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>

                                {/* Single Delete Button */}
                                <button
                                  onClick={(e) => handleDeleteSingle(item.id, e)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                  title="Xóa thông báo này"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-10 text-center text-slate-400 text-xs font-semibold select-none">
                            Không có thông báo nào.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Saved Words Link */}
                <NavLink
                  to="/tu-da-luu"
                  className={({ isActive }) =>
                    cn(
                      "p-2 text-slate-500 hover:text-[#3c6c44] hover:bg-slate-100/50 rounded-full transition-all duration-200 shrink-0 relative",
                      isActive && "bg-amber-50 text-[#efca4c]"
                    )
                  }
                  title="Từ đã lưu"
                >
                  <Bookmark size={18} />
                  {savedCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white leading-none shadow-sm select-none">
                      {savedCount}
                    </span>
                  )}
                </NavLink>

                {/* Store (Cửa hàng khung) Link */}
                <NavLink
                  to="/cua-hang-khung"
                  className={({ isActive }) =>
                    cn(
                      "p-2 text-slate-500 hover:text-[#3c6c44] hover:bg-slate-100/50 rounded-full transition-all duration-200 shrink-0",
                      isActive && "bg-emerald-50 text-[#3c6c44]"
                    )
                  }
                  title="Đổi khung ngay!"
                >
                  <Store size={18} />
                </NavLink>

                {/* User details */}
                <div className="hidden md:flex flex-col items-end shrink-0">
                  <span className="text-sm font-bold text-slate-800 leading-none">
                    {user?.fullName}
                  </span>
                  <span className="text-[0.62rem] text-slate-400 font-bold uppercase tracking-wider mt-1 select-none">
                    {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
                  </span>
                </div>

                {/* User Avatar */}
                <NavLink to="/ho-so" className="shrink-0 transition-transform hover:scale-105">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div
                      className="h-7 w-7 rounded-full border border-slate-100 bg-cover bg-center shadow-sm"
                      style={{
                        backgroundImage: `url('${avatarSrc}')`,
                      }}
                    ></div>
                    {activeFrameUrl && (
                      <img
                        src={activeFrameUrl.startsWith("http") ? activeFrameUrl : `${API_BASE_URL}${activeFrameUrl}`}
                        alt="Avatar Frame"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                      />
                    )}
                  </div>
                </NavLink>

                {/* Logout Button */}
                <button
                  onClick={requestLogout}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>

              </div>
            ) : (
              <>
                <NavLink
                  to="/dang-nhap"
                  className="rounded-full border border-slate-200 px-5 py-2 text-[14px] font-semibold text-slate-700 transition-all hover:border-[#3c6c44]/30 hover:bg-[#f8fdf9]"
                >
                  {common.buttons.signIn}
                </NavLink>
                <NavLink
                  to="/dang-ky"
                  className="rounded-full bg-[#3c6c44] px-6 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {common.buttons.start}
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Notification Details Modal */}
      {showDetailModal && selectedNotif && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] max-w-[450px] w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedNotif.title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
              {new Date(selectedNotif.createdAt).toLocaleString("vi-VN")}
            </span>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-6">
              {selectedNotif.message}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleDeleteSingle(selectedNotif.id)}
                className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Xóa thông báo
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2.5 bg-[#3c6c44] hover:bg-[#315736] text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reusable Confirm Modal for Notifications */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          confirmModal.onConfirm();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="danger"
      />
    </>
  );
}

export default Navbar;
